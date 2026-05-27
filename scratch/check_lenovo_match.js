const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Copy isMatch logic from matchmaker.ts with console.log trace
const MATCH_BRAND_GROUPS = {
    apple: ["apple", "macbook", "iphone", "ipad", "imac", "mac mini", "mac studio", "mac pro", "אפל", "מקבוק", "אייפון", "אייפד"],
    dell: ["dell", "inspiron", "xps", "latitude", "vostro", "alienware", "precision", "דל"],
    lenovo: ["lenovo", "thinkpad", "ideapad", "legion", "yoga", "xiaoxin", "לנובו"],
    asus: ["asus", "rog", "tuf", "vivobook", "zenbook", "אסוס"],
    hp: ["hp", "pavilion", "spectre", "envy", "omen", "probook", "elitebook", "victus", "אייצ פי"],
    acer: ["acer", "predator", "aspire", "swift", "nitro", "אייסר", "איסר"],
    samsung: ["samsung", "galaxy", "סמסונג", "גלקסי"],
    xiaomi: ["xiaomi", "redmi", "poco", "שיאומי", "שיומי", "רדמי", "פוקו"],
};

function traceMatch(listing, request) {
    console.log(`\n--- TRACING MATCH FOR LISTING: "${listing.title}" (ID: ${listing.id}) ---`);
    console.log(`Price: ₪${listing.price}, Category: ${listing.category}`);
    console.log(`Listing extraData:`, listing.extraData);
    console.log(`Request query: "${request.query}"`);
    console.log(`Request extraData:`, request.extraData);

    // 1. Prevent matching own listings
    if (listing.sellerId && request.userId && listing.sellerId === request.userId) {
        console.log("-> Failed: Own listing (sellerId === userId)");
        return false;
    }

    // 2. Parse extraData JSON
    let lExtra = {};
    let rExtra = {};
    try {
        if (listing.extraData) {
            lExtra = typeof listing.extraData === "string" ? JSON.parse(listing.extraData) : listing.extraData;
        }
    } catch (e) {
        console.log("Error parsing listing extraData:", e.message);
    }
    try {
        if (request.extraData) {
            rExtra = typeof request.extraData === "string" ? JSON.parse(request.extraData) : request.extraData;
        }
    } catch (e) {
        console.log("Error parsing request extraData:", e.message);
    }

    // 3. Category Match
    const lCat = (listing.category || "").toLowerCase().trim();
    const rCat = (rExtra.category || "").toLowerCase().trim();

    const normalizeCategory = (cat) => {
        if (cat.includes("laptop") || cat.includes("נייד") || cat.includes("לפטופ")) return "laptops";
        if (cat.includes("phone") || cat.includes("סלולר") || cat.includes("נייד") || cat.includes("אייפון") || cat.includes("smartphone")) return "smartphones";
        if (cat.includes("desktop") || cat.includes("נייח")) return "desktops";
        return cat;
    };

    console.log(`Normalized listing category: "${normalizeCategory(lCat)}" | Request category: "${normalizeCategory(rCat)}"`);
    if (lCat && rCat) {
        const normLCat = normalizeCategory(lCat);
        const normRCat = normalizeCategory(rCat);
        if (normLCat !== normRCat && !normLCat.includes(normRCat) && !normRCat.includes(normLCat)) {
            console.log(`-> Failed: Category mismatch ("${normLCat}" vs "${normRCat}")`);
            return false;
        }
    }

    // 4. Brand Match
    const rBrand = (
        rExtra.brand || 
        (Array.isArray(rExtra.narrativeState?.brand) ? rExtra.narrativeState.brand[0] : rExtra.narrativeState?.brand) || 
        ""
    ).toLowerCase().trim();

    let targetBrands = [];
    if (rBrand) {
        for (const [brandKey, keywords] of Object.entries(MATCH_BRAND_GROUPS)) {
            if (brandKey === rBrand || keywords.includes(rBrand)) {
                targetBrands.push(brandKey);
                break;
            }
        }
        if (targetBrands.length === 0) {
            targetBrands.push(rBrand);
        }
    } else {
        const textToSearch = `${request.query || ""} ${rExtra.details || ""}`.toLowerCase();
        for (const [brandKey, keywords] of Object.entries(MATCH_BRAND_GROUPS)) {
            const hasKeyword = keywords.some(kw => {
                if (kw.length <= 3) {
                    const regex = new RegExp(`(?<![a-zA-Zא-ת])${kw}(?![a-zA-Zא-ת])`, "i");
                    return regex.test(textToSearch);
                }
                return textToSearch.includes(kw);
            });
            if (hasKeyword) {
                targetBrands.push(brandKey);
            }
        }
    }

    console.log("Target brands extracted from request:", targetBrands);
    if (targetBrands.length > 0) {
        const lBrand = (listing.brand || lExtra.brand || "").toLowerCase().trim();
        const lTitle = (listing.title || "").toLowerCase();
        const lDesc = (listing.description || "").toLowerCase();
        const combinedText = `${lBrand} ${lTitle} ${lDesc}`.toLowerCase();

        const matchesAny = targetBrands.some(brandKey => {
            const keywords = MATCH_BRAND_GROUPS[brandKey];
            if (!keywords) {
                return lBrand.includes(brandKey) || brandKey.includes(lBrand) || lTitle.includes(brandKey);
            }

            const matchesReq = keywords.some(kw => combinedText.includes(kw));
            if (!matchesReq) return false;

            const matchesOther = Object.keys(MATCH_BRAND_GROUPS).some(otherKey => {
                if (otherKey === brandKey) return false;
                return MATCH_BRAND_GROUPS[otherKey].some(kw => combinedText.includes(kw)) && 
                       !keywords.some(kw => lBrand.includes(kw) || lTitle.includes(kw));
            });

            return !matchesOther;
        });

        if (!matchesAny) {
            console.log("-> Failed: Brand mismatch. Listing brand did not match target brands or matched another brand exclusively.");
            return false;
        }
    }

    // 5. Model Match
    const rModel = (rExtra.model || "").toLowerCase().trim();
    if (rModel) {
        const lModel = (listing.model || lExtra.model || lExtra.modelName || "").toLowerCase().trim();
        const lTitle = (listing.title || "").toLowerCase();
        
        const isModelMatch = 
            lModel.includes(rModel) || 
            rModel.includes(lModel) || 
            lTitle.includes(rModel);

        console.log(`Model matching: Request model "${rModel}" vs Listing model "${lModel}" / Title`);
        if (!isModelMatch) {
            console.log("-> Failed: Model mismatch");
            return false;
        }
    }

    // 6. Budget Range
    const price = listing.price;
    const budgetRange = rExtra.budgetRange;
    const maxBudget = rExtra.budget || (Array.isArray(budgetRange) ? budgetRange[1] : null);
    const minBudget = Array.isArray(budgetRange) ? budgetRange[0] : null;

    console.log(`Price verification: Price=₪${price}, MinBudget=${minBudget}, MaxBudget=${maxBudget}`);
    if (maxBudget && price > maxBudget) {
        console.log(`-> Failed: Price exceeds max budget (₪${price} > ₪${maxBudget})`);
        return false;
    }
    if (minBudget && price < minBudget) {
        console.log(`-> Failed: Price is below min budget (₪${price} < ₪${minBudget})`);
        return false;
    }

    if (maxBudget && maxBudget > 100 && price <= 5) {
        console.log("-> Failed: Anti-spam trigger (price <= 5 with high budget)");
        return false;
    }

    // 7. Specs Filter: RAM & CPU
    let rRamStr = (
        rExtra.ram || 
        (Array.isArray(rExtra.narrativeState?.ram) ? rExtra.narrativeState.ram[0] : rExtra.narrativeState?.ram) || 
        ""
    ).toLowerCase().trim();

    if (!rRamStr) {
        const textToSearch = `${request.query || ""} ${rExtra.details || ""}`.toLowerCase();
        const match = textToSearch.match(/(\d+)\s*(gb|giga|ram)/i);
        if (match) {
            rRamStr = `${match[1]}GB`;
        }
    }

    console.log(`RAM check: Request RAM string="${rRamStr}"`);
    if (rRamStr && rRamStr !== "flexible" && rRamStr !== "גמיש" && /\d/.test(rRamStr)) {
        const rRamVal = parseInt(rRamStr.replace(/\D/g, ""), 10);
        
        const lExtraRam = lExtra.ram || "";
        const lRamStr = String(lExtraRam).toLowerCase().trim();
        let lRamVal = 0;
        if (lRamStr && /\d/.test(lRamStr)) {
            lRamVal = parseInt(lRamStr.replace(/\D/g, ""), 10);
        } else {
            const match = `${listing.title} ${listing.description || ""}`.match(/(\d+)\s*(gb|giga|ram)/i);
            if (match) {
                lRamVal = parseInt(match[1], 10);
            }
        }

        console.log(`RAM Parsed values: Request RAM=${rRamVal}GB vs Listing RAM=${lRamVal}GB`);
        if (lRamVal > 0 && lRamVal < rRamVal) {
            console.log(`-> Failed: Listing RAM is less than requested (₪${lRamVal}GB < ₪${rRamVal}GB)`);
            return false;
        }
    }

    // CPU Match
    const rCpuStr = (
        rExtra.processor || 
        rExtra.cpu || 
        (Array.isArray(rExtra.narrativeState?.cpu) ? rExtra.narrativeState.cpu[0] : rExtra.narrativeState?.cpu) || 
        ""
    ).toLowerCase().trim();
    console.log(`CPU check: Request CPU string="${rCpuStr}"`);
    if (rCpuStr && rCpuStr !== "flexible" && rCpuStr !== "גמיש") {
        const lCpuStr = (lExtra.processor || lExtra.cpu || "").toLowerCase().trim();
        const lTitle = (listing.title || "").toLowerCase();
        const lDesc = (listing.description || "").toLowerCase();

        const cpuMatch = 
            lCpuStr.includes(rCpuStr) || 
            rCpuStr.includes(lCpuStr) ||
            lTitle.includes(rCpuStr) ||
            lDesc.includes(rCpuStr);

        console.log(`CPU direct match: ${cpuMatch} (Request: "${rCpuStr}", Listing: "${lCpuStr}")`);
        if (!cpuMatch) {
            const getCpuTier = (text) => {
                if (text.includes("i9") || text.includes("ultra 9") || text.includes("m3 max") || text.includes("m4 max")) return "i9";
                if (text.includes("i7") || text.includes("ultra 7") || text.includes("m3 pro") || text.includes("m4 pro")) return "i7";
                if (text.includes("i5") || text.includes("ultra 5") || text.includes("m3") || text.includes("m2")) return "i5";
                if (text.includes("i3") || text.includes("m1")) return "i3";
                return null;
            };

            const rCpuTier = getCpuTier(rCpuStr);
            const lCpuTier = getCpuTier(lCpuStr || lTitle);
            console.log(`CPU Tier fallback: Request Tier="${rCpuTier}" vs Listing Tier="${lCpuTier}"`);

            if (rCpuTier && lCpuTier && rCpuTier !== lCpuTier) {
                console.log(`-> Failed: CPU Tier mismatch`);
                return false;
            }
        }
    }

    console.log("-> MATCH SUCCESS!");
    return true;
}

async function main() {
    const requestId = "e6e9ec94-4854-4202-80ed-363359cfb776";
    const listingIds = [
        "5729db56-fec0-43cc-aae6-647e859ba9a4",
        "50678853-d2d5-4971-b301-b9b9a8ee178c",
        "245b7152-2c88-4756-9cc5-49f07d114f19",
        "0d258715-adda-4faf-9e67-229fe4f61353"
    ];

    const request = await prisma.buyerRequest.findUnique({ where: { id: requestId } });
    if (!request) {
        console.error("BuyerRequest not found!");
        return;
    }

    const listings = await prisma.marketplaceListing.findMany({
        where: { id: { in: listingIds } }
    });

    for (const listing of listings) {
        traceMatch(listing, request);
    }

    await prisma.$disconnect();
}

main().catch(console.error);
