import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            originalText,
            aiParsed,
            userFinal,
            testerNote,
            testerName,
            category,
            inputMode,
            sessionId,
        } = body;

        if (!originalText || !aiParsed) {
            return NextResponse.json({ error: "originalText and aiParsed are required" }, { status: 400 });
        }

        // Compute diff (corrections) between AI result and user final
        let corrections: Record<string, { ai: unknown; user: unknown }> | null = null;
        if (userFinal && aiParsed) {
            try {
                const ai = typeof aiParsed === "string" ? JSON.parse(aiParsed) : aiParsed;
                const user = typeof userFinal === "string" ? JSON.parse(userFinal) : userFinal;
                corrections = {};
                for (const key of new Set([...Object.keys(ai), ...Object.keys(user)])) {
                    const aiVal = ai[key];
                    const userVal = user[key];
                    // Compare as strings to catch type differences
                    if (JSON.stringify(aiVal) !== JSON.stringify(userVal)) {
                        corrections[key] = { ai: aiVal, user: userVal };
                    }
                }
                if (Object.keys(corrections).length === 0) corrections = null;
            } catch {
                corrections = null;
            }
        }

        const log = await prisma.parserLog.create({
            data: {
                originalText,
                aiParsed: typeof aiParsed === "string" ? aiParsed : JSON.stringify(aiParsed),
                userFinal: userFinal ? (typeof userFinal === "string" ? userFinal : JSON.stringify(userFinal)) : null,
                corrections: corrections ? JSON.stringify(corrections) : null,
                testerNote: testerNote || null,
                testerName: testerName || null,
                category: category || null,
                inputMode: inputMode || "text",
                sessionId: sessionId || null,
            },
        });

        return NextResponse.json({ success: true, id: log.id });
    } catch (err) {
        console.error("[parser-log] Error:", err);
        return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const quality = searchParams.get("quality"); // filter by quality
        const reviewed = searchParams.get("reviewed"); // "true" | "false"

        const logs = await prisma.parserLog.findMany({
            where: {
                ...(quality ? { quality } : {}),
                ...(reviewed !== null ? { reviewed: reviewed === "true" } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json({ success: true, logs, total: logs.length });
    } catch (err) {
        console.error("[parser-log] GET Error:", err);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, quality, reviewed, testerNote } = await req.json();
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        const updated = await prisma.parserLog.update({
            where: { id },
            data: {
                ...(quality !== undefined ? { quality } : {}),
                ...(reviewed !== undefined ? { reviewed } : {}),
                ...(testerNote !== undefined ? { testerNote } : {}),
            },
        });

        return NextResponse.json({ success: true, log: updated });
    } catch (err) {
        console.error("[parser-log] PATCH Error:", err);
        return NextResponse.json({ error: "Failed to update log" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        await prisma.parserLog.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[parser-log] DELETE Error:", err);
        return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
    }
}
