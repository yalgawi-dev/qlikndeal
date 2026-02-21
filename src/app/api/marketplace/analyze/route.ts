import { NextResponse } from "next/server";
import { analyzeListingText } from "@/lib/listing-ai";
import { getAiKnowledge } from "@/app/actions/marketplace";

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Get fresh knowledge
        const knowledgeBase = await getAiKnowledge();

        // Analyze with knowledge base
        const analysis = analyzeListingText(text, { knowledgeBase });

        // Map vehicle specific attributes to top-level fields for ListingForm compatibility
        const attributes = analysis.attributes || [];

        // Use robust regex matching (same as ListingForm)
        const year = attributes.find(a => /שנת|שנה|model|year/i.test(a.key))?.value || "";
        const hand = attributes.find(a => /יד|hand/i.test(a.key))?.value || "";

        const kmAttr = attributes.find(a => /קילומט|ק"מ|קמ|km/i.test(a.key));
        const kilometrage = kmAttr?.value || "";

        console.log("SERVER DEBUG: Kilometrage Logic", {
            foundKmAttr: kmAttr,
            attributesKeys: attributes.map((a: any) => a.key),
            regexCheck: /קילומט|ק"מ|קמ|km/i.source
        });

        // Merge into response
        const responseData = {
            ...analysis,
            year,
            hand,
            kilometrage,
            description: analysis.description || text
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
