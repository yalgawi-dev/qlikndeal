const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to calculate Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (v) => v * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
    console.log(`\n--- Tracing: Listing "${listing.title}" (ID: ${listing.id}) ---`);
    console.log(`    Price: ₪${listing.price} | Seller: ${listing.sellerId} | Location: ${listing.latitude}, ${listing.longitude} (${listing.locationName})`);

    // 1. Prevent matching own listings
    if (listing.sellerId && request.userId && listing.sellerId === request.userId) {
        console.log("    ❌ Failed: Own listing (sellerId === userId)");
        return false;
    }

    // 2. Parse extraData JSON
    let lExtra = {};
    let rExtra = {};
    try {
        if (listing.extraData) {
            lExtra = typeof listing.extraData === "string" ? JSON.parse(listing.extraData) : listing.extraData;
        }
    } catch (e) {}
    try {
        if (request.extraData) {
            rExtra = typeof request.extraData === "string" ? JSON.parse(request.extraData) : request.extraData;
        }
    } catch (e) {}

    // 3. Category Match
    const lCat = (listing.category || "").toLowerCase().trim();
    const rCat = (rExtra.category || "").toLowerCase().trim();

    const normalizeCategory = (cat) => {
        if (cat.includes("laptop") || cat.includes("נייד") || cat.includes("לפטופ")) return "laptops";
        if (cat.includes("phone") || cat.includes("סלולר") || cat.includes("נייד") || cat.includes("אייפון") || cat.includes("smartphone")) return "smartphones";
        if (cat.includes("desktop") || cat.includes("נייח")) return "desktops";
        return cat;
    };

    if (lCat && rCat) {
        const normLCat = normalizeCategory(lCat);
        const normRCat = normalizeCategory(rCat);
        if (normLCat !== normRCat && !normLCat.includes(normRCat) && !normRCat.includes(normLCat)) {
            console.log(`    ❌ Failed: Category Mismatch ("${normLCat}" vs "${normRCat}")`);
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
            console.log(`    ❌ Failed: Brand Mismatch (Target brands: ${JSON.stringify(targetBrands)})`);
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

        if (!isModelMatch) {
            console.log(`    ❌ Failed: Model Mismatch (Required: "${rModel}")`);
            return false;
        }
    }

    // 6. Budget Range
    const price = listing.price;
    const budgetRange = rExtra.budgetRange;
    const maxBudget = rExtra.budget || (Array.isArray(budgetRange) ? budgetRange[1] : null);
    const minBudget = Array.isArray(budgetRange) ? budgetRange[0] : null;

    if (maxBudget && price > maxBudget) {
        console.log(`    ❌ Failed: Price above budget (₪${price} > ₪${maxBudget})`);
        return false;
    }
    if (minBudget && price < minBudget) {
        console.log(`    ❌ Failed: Price below budget (₪${price} < ₪${minBudget})`);
        return false;
    }

    if (maxBudget && maxBudget > 100 && price <= 5) {
        console.log("    ❌ Failed: Anti-spam rule");
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

        if (lRamVal > 0 && lRamVal < rRamVal) {
            console.log(`    ❌ Failed: RAM insufficient (${lRamVal}GB < ${rRamVal}GB)`);
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
    if (rCpuStr && rCpuStr !== "flexible" && rCpuStr !== "גמיש") {
        const lCpuStr = (lExtra.processor || lExtra.cpu || "").toLowerCase().trim();
        const lTitle = (listing.title || "").toLowerCase();
        const lDesc = (listing.description || "").toLowerCase();

        const cpuMatch = 
            lCpuStr.includes(rCpuStr) || 
            rCpuStr.includes(lCpuStr) ||
            lTitle.includes(rCpuStr) ||
            lDesc.includes(rCpuStr);

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

            if (rCpuTier && lCpuTier && rCpuTier !== lCpuTier) {
                console.log("    ❌ Failed: CPU Tier mismatch");
                return false;
            }
        }
    }

    // 8. Distance Filtering
    const rRadius = rExtra.radius;
    if (rRadius && rRadius > 0 && rRadius < 105) {
        const rLat = rExtra.lat;
        const rLng = rExtra.lng;
        const lLat = listing.latitude;
        const lLng = listing.longitude;

        if (rLat && rLng && lLat && lLng) {
            const distance = calculateDistance(rLat, rLng, lLat, lLng);
            console.log(`    Distance: ${distance.toFixed(1)} km (Radius allowed: ${rRadius} km)`);
            if (distance > rRadius) {
                console.log(`    ❌ Failed: Outside radius (${distance.toFixed(1)} km > ${rRadius} km)`);
                return false;
            }
        } else {
            console.log(`    ⚠️ Warning: Missing lat/lng for distance check (Request: ${rLat},${rLng} | Listing: ${lLat},${lLng})`);
        }
    }

    console.log("    ✅ MATCH SUCCESS!");
    return true;
}

async function main() {
    const requests = await prisma.buyerRequest.findMany({
        where: { id: { in: ["bd2d05f9-8a1c-40b1-a642-58f664c99364", "2d29f447-c17f-458c-ac62-a1e218c3fb57"] } }
    });

    const listings = await prisma.marketplaceListing.findMany({
        where: { status: "ACTIVE" }
    });

    for (const request of requests) {
        console.log(`\n======================================================`);
        console.log(`TRACING FOR REQUEST ID: ${request.id}`);
        console.log(`Query: "${request.query}"`);
        console.log(`Budget Range: [${JSON.stringify(request.extraData)}]`);
        console.log(`======================================================`);
        
        for (const listing of listings) {
            traceMatch(listing, request);
        }
    }

    await prisma.$disconnect();
}

main().catch(console.error);
