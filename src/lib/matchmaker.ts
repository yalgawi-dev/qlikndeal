import prismadb from "./prismadb";

// Helper to calculate Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (v: number) => v * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MATCH_BRAND_GROUPS: Record<string, string[]> = {
    apple: ["apple", "macbook", "iphone", "ipad", "imac", "mac mini", "mac studio", "mac pro", "אפל", "מקבוק", "אייפון", "אייפד"],
    dell: ["dell", "inspiron", "xps", "latitude", "vostro", "alienware", "precision", "דל"],
    lenovo: ["lenovo", "thinkpad", "ideapad", "legion", "yoga", "xiaoxin", "לנובו"],
    asus: ["asus", "rog", "tuf", "vivobook", "zenbook", "אסוס"],
    hp: ["hp", "pavilion", "spectre", "envy", "omen", "probook", "elitebook", "victus", "אייצ פי"],
    acer: ["acer", "predator", "aspire", "swift", "nitro", "אייסר", "איסר"],
    samsung: ["samsung", "galaxy", "סמסונג", "גלקסי"],
    xiaomi: ["xiaomi", "redmi", "poco", "שיאומי", "שיומי", "רדמי", "פוקו"],
};

// Check if a single Listing matches a single Request
export function isMatch(listing: any, request: any): boolean {
    // 1. Prevent matching own listings
    if (listing.sellerId && request.userId && listing.sellerId === request.userId) {
        return false;
    }

    // 2. Parse extraData JSON
    let lExtra: any = {};
    let rExtra: any = {};
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

    // Map category aliases
    const normalizeCategory = (cat: string) => {
        if (cat.includes("laptop") || cat.includes("נייד") || cat.includes("לפטופ")) return "laptops";
        if (cat.includes("phone") || cat.includes("סלולר") || cat.includes("נייד") || cat.includes("אייפון") || cat.includes("smartphone")) return "smartphones";
        if (cat.includes("desktop") || cat.includes("נייח")) return "desktops";
        return cat;
    };

    if (lCat && rCat) {
        const normLCat = normalizeCategory(lCat);
        const normRCat = normalizeCategory(rCat);
        if (normLCat !== normRCat && !normLCat.includes(normRCat) && !normRCat.includes(normLCat)) {
            return false;
        }
    }

    // 4. Brand Match
    const rBrand = (
        rExtra.brand || 
        (Array.isArray(rExtra.narrativeState?.brand) ? rExtra.narrativeState.brand[0] : rExtra.narrativeState?.brand) || 
        ""
    ).toLowerCase().trim();

    let targetBrands: string[] = [];
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
        // Fallback: extract mentioned brands from query text or details
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

            // Check if the listing matches this brand's keywords
            const matchesReq = keywords.some(kw => combinedText.includes(kw));
            if (!matchesReq) return false;

            // Check if the listing matches any OTHER brand's keywords and NOT this brand
            const matchesOther = Object.keys(MATCH_BRAND_GROUPS).some(otherKey => {
                if (otherKey === brandKey) return false;
                return MATCH_BRAND_GROUPS[otherKey].some(kw => combinedText.includes(kw)) && 
                       !keywords.some(kw => lBrand.includes(kw) || lTitle.includes(kw));
            });

            return !matchesOther;
        });

        if (!matchesAny) {
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
            return false;
        }
    }

    // 6. Budget Range & Fake Price Filter
    const price = listing.price;
    const budgetRange = rExtra.budgetRange;
    const maxBudget = rExtra.budget || (Array.isArray(budgetRange) ? budgetRange[1] : null);
    const minBudget = Array.isArray(budgetRange) ? budgetRange[0] : null;

    if (maxBudget && price > maxBudget) {
        return false;
    }
    if (minBudget && price < minBudget) {
        return false;
    }

    // Anti-Spam: Obvious fake price check (e.g., 1 ILS or 5 ILS listing)
    // If the buyer's budget is significant (e.g. > 100 ILS), filter out mock listing prices <= 5 ILS.
    if (maxBudget && maxBudget > 100 && price <= 5) {
        return false;
    }

    // 7. Specs Filter: RAM & CPU (Strict constraint logic)
    // RAM Match
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
        
        // Extract listing RAM
        const lExtraRam = lExtra.ram || "";
        const lRamStr = String(lExtraRam).toLowerCase().trim();
        let lRamVal = 0;
        if (lRamStr && /\d/.test(lRamStr)) {
            lRamVal = parseInt(lRamStr.replace(/\D/g, ""), 10);
        } else {
            // Fallback: extract from title or description
            const match = `${listing.title} ${listing.description || ""}`.match(/(\d+)\s*(gb|giga|ram)/i);
            if (match) {
                lRamVal = parseInt(match[1], 10);
            }
        }

        // If listing RAM is found, it must be at least the requested RAM
        if (lRamVal > 0 && lRamVal < rRamVal) {
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

        // Check if CPU details are matching
        const cpuMatch = 
            lCpuStr.includes(rCpuStr) || 
            rCpuStr.includes(lCpuStr) ||
            lTitle.includes(rCpuStr) ||
            lDesc.includes(rCpuStr);

        if (!cpuMatch) {
            // Allow loose matching only if they belong to the same tier (e.g. i7 matches i7-12700H)
            const getCpuTier = (text: string) => {
                if (text.includes("i9") || text.includes("ultra 9") || text.includes("m3 max") || text.includes("m4 max")) return "i9";
                if (text.includes("i7") || text.includes("ultra 7") || text.includes("m3 pro") || text.includes("m4 pro")) return "i7";
                if (text.includes("i5") || text.includes("ultra 5") || text.includes("m3") || text.includes("m2")) return "i5";
                if (text.includes("i3") || text.includes("m1")) return "i3";
                return null;
            };

            const rCpuTier = getCpuTier(rCpuStr);
            const lCpuTier = getCpuTier(lCpuStr || lTitle);

            if (rCpuTier && lCpuTier && rCpuTier !== lCpuTier) {
                return false;
            }
        }
    }

    // 8. Distance Filtering
    const rRadius = rExtra.radius; // null or undefined means Unlimited
    if (rRadius && rRadius > 0 && rRadius < 105) {
        const rLat = rExtra.lat;
        const rLng = rExtra.lng;
        const lLat = listing.latitude;
        const lLng = listing.longitude;

        if (rLat && rLng && lLat && lLng) {
            const distance = calculateDistance(rLat, rLng, lLat, lLng);
            if (distance > rRadius) {
                return false;
            }
        }
    }

    return true;
}

// Send a simulated SMS and WhatsApp message to Buyer and Seller
async function notifyMatch(listing: any, request: any) {
    // Fetch users details
    const [seller, buyer] = await Promise.all([
        prismadb.user.findUnique({ where: { id: listing.sellerId } }),
        request.userId ? prismadb.user.findUnique({ where: { id: request.userId } }) : null
    ]);

    const sellerName = seller ? `${seller.firstName || ""} ${seller.lastName || ""}`.trim() : "מוכר";
    const buyerName = buyer ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() : "קונה";

    const sellerPhone = seller?.phone || "לא צוין טלפון";
    const buyerPhone = buyer?.phone || "לא צוין טלפון";

    console.log(`\n============== [MATCH FOUND & SIMULATED NOTIFICATION] ==============`);
    console.log(`Match detected: "${listing.title}" (₪${listing.price}) matches Radar Search: "${request.query}"`);
    console.log(`Listing Owner (Seller): ${sellerName} (ID: ${listing.sellerId}, Phone: ${sellerPhone})`);
    console.log(`Radar Owner (Buyer): ${buyerName} (ID: ${request.userId || "guest"}, Phone: ${buyerPhone})`);
    
    // Simulate WhatsApp / SMS for Buyer
    console.log(`\n💬 [SMS / WhatsApp to BUYER - ${buyerPhone}]:`);
    console.log(`"היי ${buyerName}! סוכן הרדאר שלך מצא התאמה מעולה במרקטפלייס:`);
    console.log(`מוצר: ${listing.title}`);
    console.log(`מחיר: ₪${listing.price}`);
    console.log(`עיר: ${listing.locationName || "לא צוין"}`);
    console.log(`לינק לפרטים נוספים: https://qlikndeal.com/dashboard/marketplace/${listing.id}`);
    console.log(`בהצלחה!"`);

    // Simulate WhatsApp / SMS for Seller
    console.log(`\n💬 [SMS / WhatsApp to SELLER - ${sellerPhone}]:`);
    console.log(`"היי ${sellerName}! יש לנו חדשות טובות! נמצא קונה שמחפש בדיוק את המוצר שפרסמת ("${listing.title}").`);
    console.log(`הקונה הגדיר חיפוש רדאר תואם. תוכל לצפות בפרטים בלוח הבקשות או להתחיל משא ומתן עמו.`);
    console.log(`בהצלחה!"`);
    console.log(`=====================================================================\n`);
}

// Match a newly created/updated listing with all active requests
export async function matchListingWithRequests(listingId: string): Promise<number> {
    try {
        const listing = await prismadb.marketplaceListing.findUnique({
            where: { id: listingId }
        });
        if (!listing || listing.status !== "ACTIVE" || listing.listingType !== "SELL") {
            return 0;
        }

        const activeRequests = await prismadb.buyerRequest.findMany({
            where: { status: "ACTIVE" }
        });

        let matchCount = 0;
        for (const request of activeRequests) {
            if (isMatch(listing, request)) {
                // Update request status to MATCHED
                await prismadb.buyerRequest.update({
                    where: { id: request.id },
                    data: { status: "MATCHED" }
                });

                // Auto-create shipment if request has userId
                if (request.userId) {
                    const existing = await prismadb.shipment.findFirst({
                        where: {
                            listingId: listing.id,
                            buyerId: request.userId,
                            status: { not: "CANCELLED" }
                        }
                    });

                    if (!existing) {
                        const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
                        await prismadb.shipment.create({
                            data: {
                                shortId: shortId,
                                sellerId: listing.sellerId,
                                buyerId: request.userId,
                                listingId: listing.id,
                                status: "NEEDS_REVISION",
                                details: {
                                    create: {
                                        itemName: listing.title,
                                        value: listing.price,
                                        itemCondition: listing.condition || "Not specified",
                                        sellerNotes: listing.description,
                                        images: listing.images || "[]",
                                        videos: listing.videos || "[]",
                                        flexibleData: JSON.stringify({
                                            isMatchSuggestion: true,
                                            buyerRequestId: request.id,
                                            originalQuery: request.query,
                                            dealType: 'negotiation',
                                            offers: [{
                                                amount: listing.price,
                                                by: 'seller',
                                                createdAt: new Date().toISOString()
                                            }],
                                            lastOfferBy: 'seller',
                                            negotiationStatus: 'active'
                                        }),
                                    }
                                }
                            }
                        });
                    }
                }

                // Trigger simulated notification
                await notifyMatch(listing, request);
                matchCount++;
            }
        }

        return matchCount;
    } catch (error) {
        console.error("Error matching listing with requests:", error);
        return 0;
    }
}

// Match a newly created/updated request with all active listings
export async function matchRequestWithListings(requestId: string): Promise<boolean> {
    try {
        const request = await prismadb.buyerRequest.findUnique({
            where: { id: requestId }
        });
        if (!request) return false;

        const activeListings = await prismadb.marketplaceListing.findMany({
            where: { status: "ACTIVE", listingType: "SELL" }
        });

        let foundMatch = false;
        for (const listing of activeListings) {
            if (isMatch(listing, request)) {
                // Update request status to MATCHED
                await prismadb.buyerRequest.update({
                    where: { id: request.id },
                    data: { status: "MATCHED" }
                });

                // Auto-create shipment if request has userId
                if (request.userId) {
                    const existing = await prismadb.shipment.findFirst({
                        where: {
                            listingId: listing.id,
                            buyerId: request.userId,
                            status: { not: "CANCELLED" }
                        }
                    });

                    if (!existing) {
                        const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
                        await prismadb.shipment.create({
                            data: {
                                shortId: shortId,
                                sellerId: listing.sellerId,
                                buyerId: request.userId,
                                listingId: listing.id,
                                status: "NEEDS_REVISION",
                                details: {
                                    create: {
                                        itemName: listing.title,
                                        value: listing.price,
                                        itemCondition: listing.condition || "Not specified",
                                        sellerNotes: listing.description,
                                        images: listing.images || "[]",
                                        videos: listing.videos || "[]",
                                        flexibleData: JSON.stringify({
                                            isMatchSuggestion: true,
                                            buyerRequestId: request.id,
                                            originalQuery: request.query,
                                            dealType: 'negotiation',
                                            offers: [{
                                                amount: listing.price,
                                                by: 'seller',
                                                createdAt: new Date().toISOString()
                                            }],
                                            lastOfferBy: 'seller',
                                            negotiationStatus: 'active'
                                        }),
                                    }
                                }
                            }
                        });
                    }
                }

                // Trigger simulated notification
                await notifyMatch(listing, request);
                foundMatch = true;
                break; // One match is enough to change request status to MATCHED
            }
        }

        return foundMatch;
    } catch (error) {
        console.error("Error matching request with listings:", error);
        return false;
    }
}

