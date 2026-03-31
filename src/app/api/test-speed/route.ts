import { NextResponse } from "next/server";
import { expertFeedbackPipeline, classifyCategory } from "@/lib/expert-pipeline";
import { masterAnalyze } from "@/lib/analyze";
import { detectCategory } from "@/lib/matcher-core";
import { getEnhancedNlp } from "@/lib/nlp-dictionary";

async function measurePhase<T>(name: string, promise: Promise<T>, timings: Record<string, number>): Promise<T> {
    const start = Date.now();
    const result = await promise;
    timings[name] = Date.now() - start;
    return result;
}

export async function GET() {
    try {
        const text = 'מפלצת גיימינג מטורפת!! ASUS ROG Strix SCAR 16 המחשב הזה מריץ הכל על אולטרה בלי למצמץ. RTX 4080 שנותן עבודה, מסך Nebula HDR חומרה: כרטיס מסך NVIDIA RTX 4080 מעבד Intel i9 מסך 240Hz קירור מובנה מחיר: 10,500 שח';
        const category = 'LAPTOPS';
        const timings: Record<string, number> = {};

        // Phase 1: getEnhancedNlp
        await measurePhase('1_getEnhancedNlp', getEnhancedNlp(), timings);

        // Phase 2: detectCategory
        await measurePhase('2_detectCategory', detectCategory(text), timings);

        // Phase 3: classifyCategory
        await measurePhase('3_classifyCategory', classifyCategory(text), timings);

        // Phase 4: masterAnalyze
        await measurePhase('4_masterAnalyze_direct', masterAnalyze(text, category), timings);

        // Phase 5: expertFeedbackPipeline
        await measurePhase('5_expertFeedbackPipeline_full', expertFeedbackPipeline(text, category), timings);

        return NextResponse.json({ success: true, timings });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: String(e) });
    }
}
