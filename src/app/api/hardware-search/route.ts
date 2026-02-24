import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { systemPrompt, query } = body;

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Anthropic API Key is missing. Please add ANTHROPIC_API_KEY to your .env" }, { status: 500 });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1200,
                system: systemPrompt,
                messages: [{ role: "user", content: query }],
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Anthropic API Error:", errBody);
            return NextResponse.json({ error: "Failed to fetch from AI provider" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (e: any) {
        console.error("Hardware Search Error:", e);
        return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
    }
}
