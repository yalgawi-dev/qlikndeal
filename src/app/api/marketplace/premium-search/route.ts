import { NextResponse } from "next/server";

const COMPUTER_SYSTEM_PROMPT = `You are a computer hardware expert. When given a computer model name OR model number (SKU), return ONLY a valid JSON object with these exact keys (use null if unknown or not applicable):
{
  "model_name": "full official product name",
  "model_number": "official model number / SKU",
  "type": "type of computer (Laptop / Desktop / Mini PC / All-in-One)",
  "cpu": "processor details (e.g. Intel Core i5-1235U, 10 cores)",
  "gpu": "graphics card details (e.g. Intel Iris Xe Graphics)",
  "ram": "RAM amount and type (e.g. 16GB DDR4)",
  "storage": "storage details (e.g. 512GB NVMe SSD)",
  "display": "screen size, resolution, panel type (e.g. 15.6\\\" FHD IPS)",
  "battery": "battery capacity (e.g. 50Wh) - null for desktops",
  "os": "operating system (e.g. Windows 11 Home)",
  "ports": "connectivity ports (e.g. 2x USB 3.2, 1x HDMI 2.0)",
  "weight": "weight and dimensions (e.g. 1.7kg)",
  "price": "approximate launch price (e.g. $800 USD)",
  "release_year": "release year (e.g. 2022)",
  "notes": "notable features or comments"
}
Return ONLY the JSON. No markdown formatting. No explanation.`;

const MOBILE_SYSTEM_PROMPT = `You are a mobile device hardware expert. When given a phone or tablet model name or SKU, return ONLY a valid JSON object with these exact keys (use null if unknown):
{
  "model_name": "full official product name",
  "model_number": "official model number / SKU",
  "type": "Smartphone / Tablet / Smartwatch",
  "cpu": "chipset / SoC details",
  "ram": "RAM amount and type",
  "storage": "storage options",
  "display": "size, resolution, panel type, refresh rate",
  "rear_camera": "rear camera system details",
  "front_camera": "front camera details",
  "battery": "battery capacity and estimated charging speeds",
  "os": "operating system and version at launch",
  "ports": "USB type, headphone jack, etc",
  "weight": "weight and dimensions",
  "price": "approximate launch price in USD",
  "release_year": "release year",
  "notes": "notable features"
}
Return ONLY the JSON. No markdown. No explanation.`;

export async function POST(req: Request) {
    try {
        const { query, category } = await req.json();

        // Check if an API key is available
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            // MOCK MODE: No API key provided, returning a dummy success response for testing
            console.log("No Anthropic API Key found. Returning mock premium response.");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

            if (category === "mobile") {
                return NextResponse.json({
                    model_name: "iPhone 15 Pro (תוצאת הדגמת פרימיום)",
                    model_number: "MTV63LL/A",
                    type: "Smartphone",
                    cpu: "Apple A17 Pro (3 nm)",
                    ram: "8GB RAM",
                    storage: "256GB NVMe",
                    display: "6.1\" Super Retina XDR OLED, 120Hz",
                    rear_camera: "48 MP (wide), 12 MP (telephoto), 12 MP (ultrawide)",
                    front_camera: "12 MP (ultrawide)",
                    battery: "3274 mAh, 20W wired, 15W wireless",
                    os: "iOS 17",
                    ports: "USB Type-C 3.2 Gen 2",
                    weight: "187g",
                    price: "$999 USD",
                    release_year: "2023",
                    notes: "מוצר זה הושלם על ידי חיפוש פרימיום (סימולציה) כיוון שאין מפתח מוגדר בשרת."
                });
            }

            // Default computer mock
            return NextResponse.json({
                model_name: "Lenovo IdeaPad 1 15IJL7 (תוצאת הדגמת פרימיום)",
                model_number: "82V700DGIX",
                type: "Laptop",
                cpu: "Intel Celeron N4500, 2 cores, up to 2.8GHz, Jasper Lake",
                gpu: "Intel UHD Graphics 600 (integrated)",
                ram: "4GB DDR4",
                storage: "128GB eMMC",
                display: "15.6\" FHD (1920×1080), IPS, 60Hz, anti-glare",
                battery: "38Wh, ~7 שעות",
                os: "Windows 11 Home in S Mode",
                ports: "USB-A 3.2, USB-A 2.0, HDMI 1.4, SD Card, 3.5mm jack",
                weight: "1.7kg (359 × 236 × 19.9mm)",
                price: "$299–$349 USD",
                release_year: "2022",
                notes: "לפטופ תקציבי בסיסי, מעבד חסכוני מאוד. לא מתאים למשימות כבדות. (הדגמת מנוע AI חיפוש עמוק)"
            });
        }

        // --- REAL AI CALL WITH API KEY ---
        console.log(`Executing real Anthropic API call for query: ${query}`);
        const sysPrompt = category === "mobile" ? MOBILE_SYSTEM_PROMPT : COMPUTER_SYSTEM_PROMPT;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229", // Or use sonnet-3.5
                max_tokens: 600,
                system: sysPrompt,
                messages: [{ role: "user", content: query }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Anthropic API error:", errorText);
            return NextResponse.json({ error: "Failed to fetch from premium search API" }, { status: 500 });
        }

        const data = await response.json();
        const textContent = data.content?.map((b: any) => b.text || "").join("") || "";
        const cleanJsonText = textContent.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJsonText);

        return NextResponse.json(parsed);

    } catch (error) {
        console.error("Premium Search Server Error:", error);
        return NextResponse.json({ error: "שגיאת תקשורת עם שרת החיפוש" }, { status: 500 });
    }
}
