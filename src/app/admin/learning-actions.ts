"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";

// ─────────────────────────────────────────────────────────────
// SPEC PARSER — Extracts hardware requirements from raw HTML text
// ─────────────────────────────────────────────────────────────
function parseSpecsFromText(text: string): {
    minRam: number; minCpuTier: number; minGpuTier: number;
    recRam: number; recCpuTier: number; recGpuTier: number;
} {
    const lowerText = text.toLowerCase();

    // --- RAM ---
    const extractRam = (hint: string): number => {
        const m = hint.match(/(\d+)\s*gb\s*(?:of\s*)?(?:ram|memory)/);
        if (m) return parseInt(m[1]);
        if (/32\s*gb/.test(hint)) return 32;
        if (/16\s*gb/.test(hint)) return 16;
        if (/8\s*gb/.test(hint)) return 8;
        return 4;
    };

    // Split text into "minimum" and "recommended" sections
    const minIdx = lowerText.indexOf("minimum");
    const recIdx = lowerText.indexOf("recommended");
    const minSection = minIdx >= 0 ? lowerText.slice(minIdx, recIdx > minIdx ? recIdx : minIdx + 500) : lowerText;
    const recSection = recIdx >= 0 ? lowerText.slice(recIdx, recIdx + 500) : lowerText;

    const minRam = extractRam(minSection) || extractRam(lowerText) || 8;
    const recRam = extractRam(recSection) || minRam;

    // --- CPU ---
    const getCpuTier = (t: string): number => {
        if (/i9|ryzen 9|core ultra 9/.test(t)) return 4;
        if (/i7|ryzen 7|core ultra 7/.test(t)) return 3;
        if (/i5|ryzen 5|core ultra 5/.test(t)) return 2;
        if (/i3|ryzen 3/.test(t)) return 1;
        return 0;
    };

    const minCpuTier = getCpuTier(minSection) || getCpuTier(lowerText) || 2;
    const recCpuTier = getCpuTier(recSection) || minCpuTier;

    // --- GPU ---
    const getGpuTier = (t: string): number => {
        if (/rtx 40|rtx 3080|rtx 3090|rtx 4070|rtx 4080|rtx 4090/.test(t)) return 4;
        if (/rtx 30|rtx 2080|rtx 3060|rtx 3070|rx 6700|rx 6800/.test(t)) return 3;
        if (/rtx 20|gtx 1660|gtx 1070|rx 580|rx 6600|rtx 3050/.test(t)) return 2;
        if (/gtx 1050|gtx 1060|gtx 970|gtx 960|rx 570/.test(t)) return 1;
        return 0;
    };

    const minGpuTier = getGpuTier(minSection) || getGpuTier(lowerText) || 0;
    const recGpuTier = getGpuTier(recSection) || minGpuTier;

    return { minRam, recRam, minCpuTier, recCpuTier, minGpuTier, recGpuTier };
}

// ─────────────────────────────────────────────────────────────
// CONSENSUS SCRAPER — Queries multiple sources and applies majority vote
// ─────────────────────────────────────────────────────────────
type SourceResult = {
    url: string;
    minRam: number; minCpuTier: number; minGpuTier: number;
    recRam: number; recCpuTier: number; recGpuTier: number;
};

async function scrapeSource(sourceUrl: string, query: string): Promise<SourceResult | null> {
    try {
        // Build the actual URL — replace {query} placeholder or append as query param
        const targetUrl = sourceUrl.includes("{query}")
            ? sourceUrl.replace("{query}", encodeURIComponent(query))
            : `${sourceUrl}${encodeURIComponent(query + " system requirements")}`;

        const res = await fetch(targetUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
            signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) return null;
        const html = await res.text();
        const $ = cheerio.load(html);

        // Generic text extraction: grab all snippets / paragraph text
        let combinedText = "";
        $(".result__snippet, p, li, .spec, .specs, .requirements, .system-requirements, article").each((_, el) => {
            combinedText += $(el).text() + " ";
        });

        if (!combinedText.trim()) combinedText = $("body").text();

        return { url: targetUrl, ...parseSpecsFromText(combinedText) };
    } catch {
        return null;
    }
}

function majorityVote(results: SourceResult[], field: keyof Omit<SourceResult, "url">, preferHigher = false): number {
    const values = results.map(r => r[field] as number).filter(v => v > 0);
    if (values.length === 0) return 0;
    if (preferHigher) return Math.max(...values); // For recommended specs, prefer highest

    // Count frequency of each value
    const freq = new Map<number, number>();
    values.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
    let winner = values[0], maxCount = 0;
    freq.forEach((count, val) => { if (count > maxCount) { maxCount = count; winner = val; } });
    return winner;
}

// ─────────────────────────────────────────────────────────────
// PUBLIC ACTIONS
// ─────────────────────────────────────────────────────────────

export async function getLearningData() {
    const [mappings, logs, unrecognized] = await Promise.all([
        prismadb.capabilityMapping.findMany({ orderBy: { keyword: "asc" } }),
        prismadb.searchLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
        prismadb.unrecognizedKeyword.findMany({
            where: { resolved: false },
            orderBy: { occurrences: "desc" },
            take: 20
        })
    ]);
    return { mappings, logs, unrecognized };
}

export async function addCapability(data: {
    keyword: string; keywordId?: string;
    minRam: number; minCpuTier: number; minGpuTier: number;
    recRam?: number; recCpuTier?: number; recGpuTier?: number;
    category: string; sourceUrl?: string; verificationStatus?: string;
}) {
    await prismadb.capabilityMapping.upsert({
        where: { keyword: data.keyword },
        update: data,
        create: data
    });
    revalidatePath("/admin/learning-agent");
    return { success: true };
}

export async function fetchExternalKnowledge(query: string) {
    // 1. Get active scraping sources from DB
    const dbSources = await prismadb.scrapingSource.findMany({ where: { isActive: true } });

    // Default sources if DB has none yet
    const defaultSources = [
        "https://html.duckduckgo.com/html/?q=",
        "https://www.pcgamingwiki.com/w/index.php?search=",
        "https://store.steampowered.com/search/?term="
    ];

    const sourceUrls = dbSources.length > 0
        ? dbSources.map(s => s.urlPattern || s.url)
        : defaultSources;

    // 2. Scrape all sources in parallel
    const results = await Promise.all(
        sourceUrls.map(url => scrapeSource(url, query))
    );
    const validResults = results.filter(Boolean) as SourceResult[];

    if (validResults.length === 0) {
        // Fallback to heuristic analysis
        const heuristic = await autoAnalyzeKeyword(query);
        const { keyword: _kw, ...heuristicSpecs } = heuristic;
        const fallbackResult = {
            keyword: query,
            keywordId: query.toLowerCase().replace(/\s+/g, "_"),
            ...heuristicSpecs,
            recRam: heuristic.minRam,
            recCpuTier: heuristic.minCpuTier,
            recGpuTier: heuristic.minGpuTier,
            sourceUrls: JSON.stringify([]),
            consensusScore: 0,
            verificationStatus: "HEURISTIC"
        };
        await prismadb.capabilityMapping.upsert({
            where: { keyword: query },
            update: fallbackResult,
            create: fallbackResult
        });
        revalidatePath("/admin/learning-agent");
        return { success: true, count: 0, mode: "heuristic", result: fallbackResult };
    }

    // 3. Apply Consensus — Majority Vote for minimum, prefer-higher for recommended
    const consensusScore = validResults.length / sourceUrls.length;

    const consensusResult = {
        keyword: query,
        keywordId: query.toLowerCase().replace(/\s+/g, "_"),
        minRam: majorityVote(validResults, "minRam"),
        minCpuTier: majorityVote(validResults, "minCpuTier"),
        minGpuTier: majorityVote(validResults, "minGpuTier"),
        recRam: majorityVote(validResults, "recRam", true),      // prefer higher
        recCpuTier: majorityVote(validResults, "recCpuTier", true), // prefer higher
        recGpuTier: majorityVote(validResults, "recGpuTier", true),
        category: "מחשבים",
        sourceUrl: validResults[0].url,
        sourceUrls: JSON.stringify(validResults.map(r => r.url)),
        consensusScore,
        verificationStatus: consensusScore >= 0.66 ? "VERIFIED" : "PENDING_REVIEW"
    };

    await prismadb.capabilityMapping.upsert({
        where: { keyword: consensusResult.keyword },
        update: consensusResult,
        create: consensusResult
    });

    revalidatePath("/admin/learning-agent");
    return {
        success: true,
        count: validResults.length,
        mode: "consensus",
        consensusScore: Math.round(consensusScore * 100),
        result: consensusResult
    };
}

export async function deleteSearchLog(id: string) {
    try {
        await prismadb.searchLog.delete({ where: { id } });
    } catch {
        // Record already deleted — safe to ignore
    }
    revalidatePath("/admin/learning-agent");
    return { success: true };
}

export async function deleteCapability(keyword: string) {
    await prismadb.capabilityMapping.delete({ where: { keyword } });
    revalidatePath("/admin/learning-agent");
    return { success: true };
}

export async function autoAnalyzeKeyword(keyword: string) {
    const kw = keyword.toLowerCase();
    let minRam = 8, minCpuTier = 2, minGpuTier = 0;
    const category = "מחשבים";

    if (kw.includes("solidwork") || kw.includes("autocad") || kw.includes("revit") || kw.includes("maya") || kw.includes("blender") || kw.includes("3ds max")) {
        minRam = 16; minCpuTier = 3; minGpuTier = 2;
    } else if (kw.includes("cyberpunk") || kw.includes("gta 5") || kw.includes("gta v") || kw.includes("red dead") || kw.includes("call of duty")) {
        minRam = 16; minCpuTier = 3; minGpuTier = 3;
    } else if (kw.includes("gta") || kw.includes("fifa") || kw.includes("game") || kw.includes("משחק")) {
        minRam = 16; minCpuTier = 3; minGpuTier = 2;
    } else if (kw.includes("fortnite") || kw.includes("valorant") || kw.includes("cs2") || kw.includes("csgo") || kw.includes("minecraft") || kw.includes("league")) {
        minRam = 8; minCpuTier = 2; minGpuTier = 2;
    } else if (kw.includes("premiere") || kw.includes("davinci") || kw.includes("video edit")) {
        minRam = 16; minCpuTier = 3; minGpuTier = 2;
    } else if (kw.includes("after effects")) {
        minRam = 32; minCpuTier = 3; minGpuTier = 2;
    } else if (kw.includes("ableton") || kw.includes("fl studio") || kw.includes("logic pro") || kw.includes("cubase")) {
        minRam = 16; minCpuTier = 3; minGpuTier = 0;
    } else if (kw.includes("android studio") || kw.includes("visual studio") || kw.includes("docker")) {
        minRam = 16; minCpuTier = 3; minGpuTier = 0;
    } else if (kw.includes("office") || kw.includes("excel") || kw.includes("zoom") || kw.includes("chrome") || kw.includes("netflix")) {
        minRam = 8; minCpuTier = 1; minGpuTier = 0;
    }

    return { keyword, minRam, minCpuTier, minGpuTier, category };
}
