import { NextResponse } from "next/server";

const COMPUTER_SYSTEM_PROMPT = `You are a computer hardware expert. When given a computer model name OR model number (SKU), return ONLY a valid JSON object with these exact keys (use null if unknown or not applicable):
{
  "model_name": "full official product name",
  "model_number": "official model number / SKU",
  "brand": "manufacturer name",
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
  "brand": "manufacturer name",
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

const VEHICLE_SYSTEM_PROMPT = `You are an automotive expert. When given a vehicle make, model, and year, return ONLY a valid JSON object:
{
  "brand": "manufacturer / make",
  "model": "model name",
  "year": "year of manufacture",
  "type": "vehicle type (Sedan / SUV / Hatchback / Pickup / etc)",
  "engine_size": "engine displacement in cc (e.g. 2000cc)",
  "fuel_type": "Gasoline / Diesel / Hybrid / Electric",
  "transmission": "Automatic / Manual / CVT",
  "hp": "horsepower figure",
  "torque": "torque in Nm",
  "drive_type": "FWD / RWD / AWD / 4WD",
  "fuel_consumption": "L/100km combined",
  "notes": "notable features, safety ratings, trim levels"
}
Return ONLY the JSON. No markdown. No explanation.`;

const ELECTRONICS_SYSTEM_PROMPT = `You are a consumer electronics expert. When given a product name or model, return ONLY a valid JSON object:
{
  "brand": "manufacturer",
  "model_name": "full product name",
  "model_number": "model number / SKU",
  "category": "TV / Smartwatch / Headphones / Speaker / Camera / Projector / etc",
  "display": "screen size, resolution, panel type if applicable",
  "cpu": "processor if applicable",
  "ram": "RAM if applicable",
  "storage": "storage if applicable",
  "battery": "battery life if applicable",
  "connectivity": "WiFi, Bluetooth, ports",
  "release_year": "release year",
  "price": "approximate launch price",
  "notes": "notable features"
}
Return ONLY the JSON. No markdown. No explanation.`;

const APPLIANCE_SYSTEM_PROMPT = `You are a home appliance expert. When given an appliance name or model, return ONLY a valid JSON object:
{
  "brand": "manufacturer",
  "model_name": "full product name",
  "model_number": "model number / SKU",
  "category": "Refrigerator / Washing Machine / Dishwasher / Air Conditioner / etc",
  "capacity": "capacity (e.g. 500L, 9kg, 12000 BTU)",
  "energy_rating": "energy efficiency rating (A+++ to G)",
  "power": "power consumption in watts",
  "dimensions": "W x D x H in cm",
  "weight": "weight in kg",
  "color": "available colors",
  "release_year": "release year",
  "price": "approximate price",
  "notes": "notable features, noise level, special functions"
}
Return ONLY the JSON. No markdown. No explanation.`;

// Maps category string → system prompt
const SYSTEM_PROMPTS: Record<string, string> = {
    computer: COMPUTER_SYSTEM_PROMPT,
    mobile:   MOBILE_SYSTEM_PROMPT,
    vehicle:  VEHICLE_SYSTEM_PROMPT,
    electronics: ELECTRONICS_SYSTEM_PROMPT,
    appliance:   APPLIANCE_SYSTEM_PROMPT,
};

// Mock responses per category (no API key)
const MOCK_RESPONSES: Record<string, Record<string, any>> = {
    mobile: {
        model_name: "iPhone 15 Pro (תוצאת הדגמת פרימיום)",
        model_number: "MTV63LL/A",
        brand: "Apple",
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
        notes: "מוצר זה הושלם על ידי חיפוש פרימיום (סימולציה)"
    },
    vehicle: {
        brand: "Toyota",
        model: "Corolla Cross (תוצאת הדגמת פרימיום)",
        year: "2024",
        type: "Crossover SUV",
        engine_size: "1987cc",
        fuel_type: "Hybrid",
        transmission: "CVT",
        hp: "196",
        torque: "206 Nm",
        drive_type: "FWD / E-Four AWD",
        fuel_consumption: "5.0 L/100km",
        notes: "היברידי, מערכת בטיחות Toyota Safety Sense 3.0 (סימולציה)"
    },
    electronics: {
        brand: "Samsung",
        model_name: "Samsung OLED S95C 55\" (תוצאת הדגמת פרימיום)",
        model_number: "QE55S95CATXXU",
        category: "OLED TV",
        display: "55\" 4K OLED, 144Hz, HDR10+",
        connectivity: "WiFi 5, Bluetooth 5.2, HDMI 2.1 x4",
        release_year: "2023",
        price: "$1,799 USD",
        notes: "Neural Quantum Processor 4K, Object Tracking Sound Pro (סימולציה)"
    },
    appliance: {
        brand: "LG",
        model_name: "LG InstaView מקרר Side-by-Side (תוצאת הדגמת פרימיום)",
        model_number: "GSJV91PZAE",
        category: "Refrigerator",
        capacity: "635L",
        energy_rating: "A+",
        power: "304W",
        dimensions: "91.2 x 73.4 x 179 cm",
        weight: "118 kg",
        release_year: "2023",
        price: "$2,199 USD",
        notes: "InstaView Door-in-Door, ThinQ WiFi, No Frost (סימולציה)"
    },
    computer: {
        brand: "Lenovo",
        model_name: "Lenovo IdeaPad 1 15IJL7 (תוצאת הדגמת פרימיום)",
        model_number: "82V700DGIX",
        type: "Laptop",
        cpu: "Intel Celeron N4500, 2 cores, up to 2.8GHz",
        gpu: "Intel UHD Graphics 600 (integrated)",
        ram: "4GB DDR4",
        storage: "128GB eMMC",
        display: "15.6\" FHD (1920×1080), IPS, 60Hz",
        battery: "38Wh",
        os: "Windows 11 Home",
        ports: "USB-A 3.2, USB-A 2.0, HDMI 1.4, SD Card",
        weight: "1.7kg",
        price: "$299–$349 USD",
        release_year: "2022",
        notes: "לפטופ תקציבי (הדגמת מנוע AI חיפוש עמוק – סימולציה)"
    }
};

export async function POST(req: Request) {
    try {
        const { query, category } = await req.json();

        // Validate category
        const cat = (category || "computer").toLowerCase();
        const sysPrompt = SYSTEM_PROMPTS[cat] || COMPUTER_SYSTEM_PROMPT;
        const mockResponse = MOCK_RESPONSES[cat] || MOCK_RESPONSES["computer"];

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            console.log(`[premium-search] No Anthropic API Key – returning mock for category: ${cat}`);
            await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay
            return NextResponse.json(mockResponse);
        }

        // --- REAL AI CALL ---
        console.log(`[premium-search] Real Anthropic API call – category: ${cat}, query: ${query}`);

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 800,
                system: sysPrompt,
                messages: [{ role: "user", content: query }],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[premium-search] Anthropic API error:", errorText);
            return NextResponse.json({ error: "שגיאה בשרת חיפוש AI" }, { status: 500 });
        }

        const data = await response.json();
        const textContent = data.content?.map((b: any) => b.text || "").join("") || "";
        const cleanJsonText = textContent.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJsonText);

        return NextResponse.json(parsed);

    } catch (error) {
        console.error("[premium-search] Server Error:", error);
        return NextResponse.json({ error: "שגיאת תקשורת עם שרת החיפוש" }, { status: 500 });
    }
}
