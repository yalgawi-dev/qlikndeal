export interface ParsedDeal {
    itemName: string;
    price?: number;
    condition?: string;
    description?: string;
    detectedCategory?: string;
}

export function parseDealText(text: string): ParsedDeal {
    const result: ParsedDeal = {
        itemName: "",
        description: text,
        detectedCategory: "Other" // Default
    };

    // 1. Extract Price
    // Removed 'ק"מ' (km) to avoid confusion with mileage.
    // Added looked-ahead to prefer numbers on their own line or clearly marked.
    const priceRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s?(?:ש"?ח|nis|sh|₪|שקל)\b/i;
    const priceMatch = text.match(priceRegex);
    if (priceMatch) {
        const rawPrice = priceMatch[1].replace(/,/g, '');
        result.price = parseFloat(rawPrice);
    }

    // 2. Extract Condition
    const lowerText = text.toLowerCase();
    if (lowerText.includes("חדש") || lowerText.includes("new") || lowerText.includes("באריזה") || lowerText.includes("סגור")) {
        result.condition = "New";
    } else if (lowerText.includes("כמו חדש") || lowerText.includes("like new")) {
        result.condition = "Like New";
    } else if (lowerText.includes("משומש") || lowerText.includes("used") || lowerText.includes("יד שניה")) {
        result.condition = "Used";
    } else {
        result.condition = "Used"; // Default
    }

    // 3. Category Detection
    if (/(רמקול|אוזניות|מחשב|טלפון|screen|speaker|phone|laptop|מקלדת|עכבר|tv|טלוויזיה)/i.test(text)) {
        result.detectedCategory = "Electronics";
    } else if (/(ספה|שולחן|כסא|מיטה|ארון|bed|chair|table|sofa)/i.test(text)) {
        result.detectedCategory = "Furniture";
    } else if (/(רכב|מכונית|car|koda|mazda|toyota)/i.test(text)) {
        result.detectedCategory = "Vehicles";
    }

    // 4. Extract Item Name
    // Heuristic: First line, remove common prefixes
    let cleanLine = text.split('\n')[0].trim();
    cleanLine = cleanLine.replace(/^(למכירה|מוכר|selling|for sale)[:\s-]*/i, '');

    // Cleanup extra punctuation at start/end
    cleanLine = cleanLine.replace(/^[^a-zA-Z0-9א-ת]+|[^a-zA-Z0-9א-ת]+$/g, '');

    if (cleanLine.length > 60) {
        result.itemName = cleanLine.substring(0, 60) + "...";
    } else {
        result.itemName = cleanLine;
    }

    return result;
}
