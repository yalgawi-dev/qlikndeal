import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

const CONFIG_PATH = path.join(process.cwd(), "src/config/matcher-config.json");

export async function GET() {
    try {
        let config = { expertChangeStep: 0.10, extractionWeights: {}, rankingWeights: {} };
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
            config = { ...config, ...JSON.parse(raw) };
        }

        const logs = await prismadb.weightAuditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ success: true, config, logs });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { expertChangeStep, extractionWeights, rankingWeights, adminName, reason } = body;

        // 1. Read existing config for audit purposes
        let oldConfig: any = { expertChangeStep: 0.10, extractionWeights: {}, rankingWeights: {} };
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
            oldConfig = { ...oldConfig, ...JSON.parse(raw) };
        }

        // 2. Identify differences and log them
        const auditLogs: { category: string; field: string; oldWeight: number; newWeight: number; changeSource: string; adminName: string; reason: string; }[] = [];
        
        // Audit Extraction Weights
        for (const [field, newWeight] of Object.entries(extractionWeights || {})) {
            const oldWeight = oldConfig.extractionWeights[field];
            if (oldWeight !== newWeight) {
                auditLogs.push({
                    category: "ALL",
                    field: `[Extraction] ${field}`,
                    oldWeight: oldWeight ? Number(oldWeight) : 0,
                    newWeight: Number(newWeight),
                    changeSource: "ADMIN" as "ADMIN",
                    adminName: adminName || "מנהל מערכת",
                    reason: reason || "עדכון ידני המשפיע על למידת האדמין/מוכר"
                });
            }
        }

        // Audit Ranking Weights
        for (const [field, newWeight] of Object.entries(rankingWeights || {})) {
            const oldWeight = oldConfig.rankingWeights[field];
            if (oldWeight !== newWeight) {
                auditLogs.push({
                    category: "ALL",
                    field: `[Ranking] ${field}`,
                    oldWeight: oldWeight ? Number(oldWeight) : 0,
                    newWeight: Number(newWeight),
                    changeSource: "ADMIN" as "ADMIN",
                    adminName: adminName || "מנהל מערכת",
                    reason: reason || "עדכון ידני המשפיע על תוצאות החיפוש"
                });
            }
        }

        // 3. Save to DB
        if (auditLogs.length > 0) {
            await prismadb.weightAuditLog.createMany({
                data: auditLogs
            });
        }

        // 4. Write new config to file
        const configToSave = {
            expertChangeStep: expertChangeStep || 0.10,
            extractionWeights,
            rankingWeights
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(configToSave, null, 2), "utf-8");

        return NextResponse.json({ success: true, savedKeys: auditLogs.length });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, isAcknowledged } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing log ID" }, { status: 400 });
        }

        const updated = await prismadb.weightAuditLog.update({
            where: { id },
            data: { isAcknowledged }
        });

        return NextResponse.json({ success: true, updated });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
