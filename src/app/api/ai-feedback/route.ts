
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In a real production app, this would be a database or a secure logging service.
// For now, we'll append to a local JSONL file to simulate "learning".
const LOG_FILE_PATH = path.join(process.cwd(), "ai_learning_log.jsonl");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { originalAI, finalUser, timestamp } = body;

        // Simple feedback object
        const feedbackEntry = {
            timestamp: timestamp || new Date().toISOString(),
            original: originalAI,
            final: finalUser,
            // Calculate simplistic diffs or "learning points" here if needed
            diffs: calculateDiffs(originalAI, finalUser)
        };

        // Append to file
        fs.appendFileSync(LOG_FILE_PATH, JSON.stringify(feedbackEntry) + "\n");

        console.log("AI Feedback logged:", feedbackEntry.diffs);

        return NextResponse.json({ success: true, message: "Feedback received" });
    } catch (error) {
        console.error("Error logging AI feedback:", error);
        return NextResponse.json({ success: false, error: "Failed to log feedback" }, { status: 500 });
    }
}

function calculateDiffs(original: any, final: any) {
    const changes: Record<string, { from: any, to: any }> = {};

    if (!original || !final) return changes;

    // Check key fields
    const keysToCheck = ["title", "price", "description", "category", "subCategory"];

    keysToCheck.forEach(key => {
        if (original[key] != final[key]) {
            changes[key] = { from: original[key], to: final[key] };
        }
    });

    // Check attributes length or content could be complex, simplifying for now
    if (original.attributes?.length !== final.attributes?.length) {
        changes["attributes_count"] = { from: original.attributes?.length, to: final.attributes?.length };
    }

    return changes;
}
