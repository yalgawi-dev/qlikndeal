"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import he from 'he';

// 🛡️ Constraint Enforcement Engine (Architect Rules: Safe Transactions & Data Accuracy)
async function validateConstraints(category: string | undefined, brand: string | undefined, modelName: string | undefined, extraData: any) {
    if (!category || !modelName || !extraData) return { valid: true };

    let catalogRecord: any = null;
    const catUpper = category.toUpperCase();
    
    if (catUpper === "LAPTOPS") {
        catalogRecord = await prismadb.laptopCatalog.findFirst({
            where: { modelName: { equals: modelName, mode: 'insensitive' } }
        });
    } else if (catUpper === "SMARTPHONES" || catUpper === "MOBILE" || catUpper === "PHONE") {
        catalogRecord = await prismadb.mobileCatalog.findFirst({
            where: { modelName: { equals: modelName, mode: 'insensitive' } }
        });
    }

    if (!catalogRecord || !catalogRecord.constraints) return { valid: true };

    const constraints = catalogRecord.constraints as any;
    if (!constraints.limits) return { valid: true };

    // 1. RAM LIMIT ENFORCEMENT
    if (constraints.limits.ram?.max && extraData.ram) {
        const userRamStr = String(extraData.ram);
        // Ignore parsing if they typed string without numbers
        if (/\d/.test(userRamStr)) {
             const userRamVal = parseInt(userRamStr.replace(/\D/g, ""), 10);
             if (userRamVal > constraints.limits.ram.max) {
                 return { valid: false, error: `🚨 המערכת זיהתה חריגה: סדרת המחשבים "${modelName}" תומכת בעד ${constraints.limits.ram.max}GB RAM לפי נתוני יצרן. אנא תקן את המפרט שהזנת.` };
             }
        }
    }

    // 2. STORAGE LIMIT ENFORCEMENT
    if (constraints.limits.storage?.max && (extraData.storage || extraData.storages)) {
        const userStorageStr = String(extraData.storage || extraData.storages).toLowerCase();
        if (/\d/.test(userStorageStr)) {
             let userStorageVal = parseInt(userStorageStr.replace(/\D/g, ""), 10);
             if (userStorageStr.includes("tb")) {
                 userStorageVal *= 1024; // Convert TB to GB for accurate comparison
             }
             if (userStorageVal > constraints.limits.storage.max) {
                 // Convert max back to a friendly display
                 const maxDisplay = constraints.limits.storage.max >= 1000 ? `${constraints.limits.storage.max / 1024}TB` : `${constraints.limits.storage.max}GB`;
                 return { valid: false, error: `🚨 המערכת זיהתה חריגה: מודל זה תומך בנפח אחסון מקסימלי של ${maxDisplay}. סומן שהוזן נפח שגוי (זיוף אפשרי).` };
             }
        }
    }

    // 3. GPU WHITELIST ENFORCEMENT
    if (constraints.limits.gpu && Array.isArray(constraints.limits.gpu) && extraData.gpu) {
        const allowedGpus = constraints.limits.gpu.map((g: string) => g.toLowerCase());
        const userGpu = String(extraData.gpu).toLowerCase();
        
        // Exclude generic inputs from verification
        if (userGpu !== "לא ידוע" && userGpu !== "מובנה") {
             const isValidGpu = allowedGpus.some((allowed: string) => userGpu.includes(allowed) || allowed.includes(userGpu));
             if (!isValidGpu) {
                 return { valid: false, error: `🚨 אזהרת אמינות: רכיב התצוגה (GPU) שבחרת לא קיים במפרטי היצרן עבור הדגם הנ"ל. אנא בחר כרטיס תקין מהרשימה או מחק ערך זה.` };
             }
        }
    }

    return { valid: true };
}

export async function createListing(data: {
    title: string; brand?: string; model?: string;
    description: string;
    price: number;
    condition: string;
    images: string[];
    videos?: string[];
    category?: string;
    latitude?: number;
    longitude?: number;
    extraData?: any;
    listingType?: "SELL" | "BUY";
}) {
    console.log("createListing started", {
        title: data.title, brand: data.brand, model: data.model,
        price: data.price,
        imagesCount: data.images?.length,
        descLength: data.description?.length,
        extraDataSize: data.extraData ? JSON.stringify(data.extraData).length : 0
    });

    // Check for massive payload
    if (data.description && data.description.length > 50000) {
        console.warn("WARNING: Description is huge!", data.description.length);
    }

    try {
        // ⚡ PERF: auth() validates JWT locally (~2ms) — no HTTP call to Clerk.
        // currentUser() was making an HTTP request to Clerk servers on every save (~700ms).
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            console.log("Unauthorized: No session");
            return { success: false, error: "Unauthorized" };
        }

        // --- Execute Safety Constraints Validation AND User lookup in Parallel ---
        const [vResult, initialDbUser] = await Promise.all([
            validateConstraints(
                data.category, 
                data.brand || data.extraData?.brand, 
                data.model || data.extraData?.modelName || data.extraData?.model, 
                data.extraData
            ),
            prismadb.user.findUnique({
                where: { clerkId }
            })
        ]);

        if (!vResult.valid) {
            console.warn("Validation Constraint Blocked Listing:", vResult.error);
            return { success: false, error: vResult.error };
        }
        // ---------------------------------------------

        let dbUser = initialDbUser;

        if (!dbUser) {
            // Only fetch full user data from Clerk when we need to create a new DB record (rare path)
            console.log("User not found in DB, fetching from Clerk to create record...");
            const fullUser = await currentUser();
            if (!fullUser) return { success: false, error: "Unauthorized" };
            dbUser = await prismadb.user.create({
                data: {
                    clerkId,
                    email: fullUser.emailAddresses[0]?.emailAddress,
                    firstName: fullUser.firstName,
                    lastName: fullUser.lastName,
                    imageUrl: fullUser.imageUrl,
                    phone: fullUser.phoneNumbers[0]?.phoneNumber,
                }
            });
        }

        console.log("Creating listing in DB for user:", dbUser.id);
        const listing = await prismadb.marketplaceListing.create({
            data: {
                sellerId: dbUser.id,
                title: data.title,
                description: data.description,
                price: parseFloat(data.price.toString()) || 0, // Fallback for NaN
                condition: data.condition,
                images: JSON.stringify(data.images),
                videos: JSON.stringify(data.videos || []),
                category: data.category || "General",
                latitude: data.latitude,
                longitude: data.longitude,
                status: "ACTIVE",
                listingType: data.listingType || "SELL",
                extraData: data.extraData ? JSON.stringify(data.extraData) : null
            }
        });
        console.log("Listing created successfully:", listing.id);

        // Match listing with active requests (radars)
        let matchCount = 0;
        if (listing.status === "ACTIVE" && listing.listingType === "SELL") {
            const { matchListingWithRequests } = await import("@/lib/matchmaker");
            matchCount = await matchListingWithRequests(listing.id);
        }

        // revalidatePath("/dashboard/marketplace");
        // Return minimal data to avoid serialization issues
        return { success: true, matchCount, listing: { id: listing.id } as any };

    } catch (error: any) {
        console.error("Create Listing Error (Detailed):", error);
        // Log specific prisma errors if possible
        if (error.code) console.error("Prisma Error Code:", error.code);
        if (error.meta) console.error("Prisma Error Meta:", error.meta);

        return {
            success: false,
            error: error.message || "Failed to create listing. Please try again."
        };
    }
}

export async function getListings() {
    try {
        const listings = await prismadb.marketplaceListing.findMany({
            where: { status: "ACTIVE" },
            include: {
                seller: {
                    select: {
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        imageUrl: true,
                        roles: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, listings };
    } catch (error) {
        console.error("Get Listings Error:", error);
        return { success: false, listings: [] };
    }
}

export async function createShipmentFromListing(listingId: string) {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const dbUser = await prismadb.user.findUnique({ where: { clerkId: user.id } });
        if (!dbUser) return { success: false, error: "User not found" };

        // Fetch the listing
        const listing = await prismadb.marketplaceListing.findUnique({
            where: { id: listingId }
        });

        if (!listing) return { success: false, error: "Listing not found" };

        // Create a new Shipment (Draft) linked to this listing
        const shipment = await prismadb.shipment.create({
            data: {
                shortId: Math.random().toString(36).substring(2, 7).toUpperCase(),
                sellerId: listing.sellerId,
                buyerId: dbUser.id, // The current user is the buyer
                listingId: listing.id,
                status: "DRAFT",
                details: {
                    create: {
                        itemName: listing.title,
                        value: listing.price,
                        itemCondition: listing.condition,
                        sellerNotes: listing.description,
                        images: listing.images
                    }
                }
            }
        });

        return { success: true, shipmentId: shipment.id, shortId: shipment.shortId };

    } catch (error) {
        console.error("Create Shipment from Listing Error:", error);
        return { success: false, error: "Failed to start transaction" };
    }
}

export async function getListingById(id: string) {
    try {
        const listing = await prismadb.marketplaceListing.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        imageUrl: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                        city: true,
                        roles: true
                    }
                }
            }
        });

        if (!listing) return { success: false, error: "Listing not found" };

        return { success: true, listing };
    } catch (error) {
        console.error("Get Listing By ID Error:", error);
        return { success: false, error: "Failed to fetch listing" };
    }
}

export async function getMyListings() {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const dbUser = await prismadb.user.findUnique({ where: { clerkId: user.id } });
        if (!dbUser) return { success: false, error: "User not found" };

        const listings = await prismadb.marketplaceListing.findMany({
            where: {
                sellerId: dbUser.id,
                status: { not: "ARCHIVED" } // Show ACTIVE and SOLD
            },
            include: { 
                seller: true,
                shipments: {
                    where: {
                        status: { notIn: ["CANCELLED", "DRAFT"] }
                    },
                    orderBy: {
                        updatedAt: "desc"
                    },
                    include: {
                        buyer: true,
                        details: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, listings };
    } catch (error) {
        console.error("Get My Listings Error:", error);
        return { success: false, error: "Failed to fetch listings" };
    }
}

export async function getMyRequests() {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const dbUser = await prismadb.user.findUnique({ where: { clerkId: user.id } });
        if (!dbUser) return { success: false, error: "User not found" };

        const requests = await prismadb.buyerRequest.findMany({
            where: {
                userId: dbUser.id,
                status: { not: "ARCHIVED" } // Fetch active/non-archived requests
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return { success: true, requests };
    } catch (error) {
        console.error("Get My Requests Error:", error);
        return { success: false, error: "Failed to fetch requests" };
    }
}

export async function deleteRequest(id: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, error: "Unauthorized" };
        const dbUser = await prismadb.user.findUnique({ where: { clerkId } });
        if (!dbUser) return { success: false, error: "User not found" };
        // Verify ownership
        const req = await prismadb.buyerRequest.findFirst({ where: { id, userId: dbUser.id } });
        if (!req) return { success: false, error: "Not found" };
        await prismadb.buyerRequest.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Delete Request Error:", error);
        return { success: false, error: "Failed to delete request" };
    }
}

export async function updateRequest(id: string, data: { query?: string; extraData?: string }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, error: "Unauthorized" };
        const dbUser = await prismadb.user.findUnique({ where: { clerkId } });
        if (!dbUser) return { success: false, error: "User not found" };
        const req = await prismadb.buyerRequest.findFirst({ where: { id, userId: dbUser.id } });
        if (!req) return { success: false, error: "Not found" };
        const updated = await prismadb.buyerRequest.update({
            where: { id },
            data: {
                ...(data.query && { query: data.query }),
                ...(data.extraData !== undefined && { extraData: data.extraData }),
                status: "ACTIVE", // Reset status back to ACTIVE on edit
            },
        });

        // Run smart matchmaker to check if it matches existing listings
        const { matchRequestWithListings } = await import("@/lib/matchmaker");
        await matchRequestWithListings(id);

        const finalRequest = await prismadb.buyerRequest.findUnique({
            where: { id }
        }) || updated;

        return { success: true, request: finalRequest };
    } catch (error) {
        console.error("Update Request Error:", error);
        return { success: false, error: "Failed to update request" };
    }
}

export async function updateListing(id: string, data: any) {
    try {
        // ⚡ PERF: auth() — local JWT validation, no Clerk HTTP call
        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, error: "Unauthorized" };

        // --- Parallelize Validation, User Lookup, and Listing Ownership Check ---
        const [dbUser, existing, vResult] = await Promise.all([
            prismadb.user.findUnique({ where: { clerkId } }),
            prismadb.marketplaceListing.findUnique({ where: { id } }),
            validateConstraints(
                data.category, 
                data.brand || data.extraData?.brand, 
                data.model || data.extraData?.modelName || data.extraData?.model, 
                data.extraData
            )
        ]);

        if (!dbUser) return { success: false, error: "User not found" };

        if (!existing || existing.sellerId !== dbUser.id) {
            return { success: false, error: "Unauthorized or listing not found" };
        }

        if (!vResult.valid) {
            console.warn("Validation Constraint Blocked Update:", vResult.error);
            return { success: false, error: vResult.error };
        }
        // ---------------------------------------------

        const listing = await prismadb.marketplaceListing.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                price: parseFloat(data.price.toString()) || 0,
                condition: data.condition,
                category: data.category,
                latitude: data.latitude,
                longitude: data.longitude,
                images: JSON.stringify(data.images),
                videos: JSON.stringify(data.videos || []),
                ...(data.listingType ? { listingType: data.listingType } : {}),
                extraData: data.extraData ? JSON.stringify(data.extraData) : null
            }
        });

        // Match listing with active requests (radars)
        let matchCount = 0;
        if (listing.status === "ACTIVE" && listing.listingType === "SELL") {
            const { matchListingWithRequests } = await import("@/lib/matchmaker");
            matchCount = await matchListingWithRequests(listing.id);
        }

        revalidatePath("/dashboard/marketplace");
        revalidatePath(`/dashboard/marketplace/${id}`);
        revalidatePath(`/listing/${id}`);         // Public landing page cache
        return { success: true, matchCount, listing };
    } catch (error) {
        console.error("Update Listing Error:", error);
        return { success: false, error: "Failed to update listing" };
    }
}

export async function deleteListing(id: string) {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const dbUser = await prismadb.user.findUnique({ where: { clerkId: user.id } });
        if (!dbUser) return { success: false, error: "User not found" };

        // Verify ownership
        const existing = await prismadb.marketplaceListing.findUnique({ where: { id } });
        if (!existing || existing.sellerId !== dbUser.id) {
            return { success: false, error: "Unauthorized or listing not found" };
        }

        // Soft delete (Archive)
        await prismadb.marketplaceListing.update({
            where: { id },
            data: { status: "ARCHIVED" }
        });

        revalidatePath("/dashboard/marketplace");
        revalidatePath(`/listing/${id}`);         // Clear public OG cache on delete
        return { success: true };
    } catch (error) {
        console.error("Delete Listing Error:", error);
        return { success: false, error: "Failed to delete listing" };
    }
}

export async function parseLinkMetadata(url: string) {
    try {
        // Basic validation
        if (!url.startsWith("http")) return { success: false, error: "Invalid URL" };

        const res = await fetch(url, {
            next: { revalidate: 3600 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
        }

        const html = await res.text();
        // he imported at top

        // Simple Regex Extraction for OG Tags
        const getMeta = (prop: string) => {
            const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`, "i")) ||
                html.match(new RegExp(`<meta name="${prop}" content="([^"]*)"`, "i"));
            return match ? (he.decode(match[1])) : "";
        };

        const title = getMeta("og:title") || getMeta("title") || "";
        const description = getMeta("og:description") || getMeta("description") || "";

        // Enhanced Image & Video Extraction
        const images: string[] = [];
        const videos: string[] = [];

        // 1. Try to parse JSON-LD for images (High Quality)
        try {
            const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
            if (jsonLdMatches) {
                jsonLdMatches.forEach(scriptTag => {
                    const jsonContent = scriptTag.replace(/<\/?script[^>]*>/gi, "");
                    try {
                        const data = JSON.parse(jsonContent);
                        // Helper to extract image from flexible JSON-LD structures
                        const extractImage = (obj: any) => {
                            if (!obj) return;
                            if (obj.image) {
                                if (Array.isArray(obj.image)) {
                                    obj.image.forEach((img: any) => {
                                        if (typeof img === 'string') images.push(img);
                                        else if (img.url) images.push(img.url);
                                    });
                                } else if (typeof obj.image === 'string') {
                                    images.push(obj.image);
                                } else if (obj.image.url) {
                                    images.push(obj.image.url);
                                }
                            }
                        };

                        // Helper to extract video from flexible JSON-LD structures
                        const extractVideo = (obj: any) => {
                            if (!obj) return;
                            if (obj.video) {
                                if (Array.isArray(obj.video)) {
                                    obj.video.forEach((vid: any) => {
                                        if (typeof vid === 'string') videos.push(vid);
                                        else if (vid.contentUrl) videos.push(vid.contentUrl);
                                        else if (vid.embedUrl) videos.push(vid.embedUrl);
                                    });
                                } else if (typeof obj.video === 'string') {
                                    videos.push(obj.video);
                                } else if (obj.video.contentUrl) {
                                    videos.push(obj.video.contentUrl);
                                } else if (obj.video.embedUrl) {
                                    videos.push(obj.video.embedUrl);
                                }
                            }
                        };

                        if (Array.isArray(data)) {
                            data.forEach(item => {
                                extractImage(item);
                                extractVideo(item);
                            });
                        } else {
                            extractImage(data);
                            extractVideo(data);
                        }
                    } catch (e) { /* ignore json parse errors */ }
                });
            }
        } catch (e) { console.error("JSON-LD Error", e); }

        // 2. Capture ALL og:image tags
        const ogImageRegex = /<meta property="og:image" content="([^"]*)"/gi;
        let ogMatch;
        while ((ogMatch = ogImageRegex.exec(html)) !== null) {
            if (ogMatch[1]) images.push(he.decode(ogMatch[1]));
        }

        // 3. Capture ALL og:video tags
        const ogVideoRegex = /<meta property="og:video(?::secure_url|:url)?" content="([^"]*)"/gi;
        let ogVideoMatch;
        while ((ogVideoMatch = ogVideoRegex.exec(html)) !== null) {
            if (ogVideoMatch[1]) videos.push(he.decode(ogVideoMatch[1]));
        }

        // 3. Fallback: Look for specific gallery classes (very basic heuristic for common sites)
        // (Skipped for now to avoid grabbing icons/logos, sticking to semantic data first)

        // Deduplicate and filter empty
        const uniqueImages = Array.from(new Set(images)).filter(img => img && img.startsWith('http'));
        const uniqueVideos = Array.from(new Set(videos)).filter(vid => vid && vid.startsWith('http'));

        // Enhanced Price Heuristics
        let price = "";

        // 1. Structured Data (JSON-LD)
        const priceFromJson = html.match(/"price":\s*"(\d+)"/);
        if (priceFromJson) {
            price = priceFromJson[1];
        } else {
            // 2. Regex for Hebrew/common patterns in description/title
            // Matches: "2000 שח", "2000 NIS", "מחיר: 2000", "ב-2000", "ב:2000"
            const priceRegex = /(?:מחיר|ב-|ב:|price|:)\s*(\d{2,6})\s*(?:₪|ש"ח|שח|NIS|\$)?/i;
            const priceMatch = (title + " " + description).match(priceRegex);

            // Also look for currency suffix: "2000 שח"
            const suffixRegex = /(\d{2,6})\s*(?:₪|ש"ח|שח|NIS)/i;
            const suffixMatch = (title + " " + description).match(suffixRegex);

            if (priceMatch && priceMatch[1]) price = priceMatch[1];
            else if (suffixMatch && suffixMatch[1]) price = suffixMatch[1];
        }

        return {
            success: true,
            data: {
                title,
                description,
                images: uniqueImages.length > 0 ? uniqueImages : [],
                videos: uniqueVideos.length > 0 ? uniqueVideos : [],
                price
            }
        };

    } catch (error) {
        console.error("Link Parse Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to parse link" };
    }
}

export async function updateUserPhone(phone: string) {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const dbUser = await prismadb.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!dbUser) return { success: false, error: "User not found" };

        await prismadb.user.update({
            where: { id: dbUser.id },
            data: { phone }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to update phone:", error);
        return { success: false, error: "Failed to update phone" };
    }
}

export async function getMyPhone() {
    try {
        const user = await currentUser();
        if (!user) return { success: false, phone: "" };

        const dbUser = await prismadb.user.findUnique({
            where: { clerkId: user.id },
            select: { phone: true }
        });

        // Priority: DB phone → Clerk phone → empty
        const phone = dbUser?.phone ||
            user.phoneNumbers?.[0]?.phoneNumber ||
            "";

        return { success: true, phone };
    } catch (error) {
        console.error("Failed to get phone:", error);
        return { success: false, phone: "" };
    }
}

// --- AI Knowledge Retrieval ---
import fs from "fs";
import path from "path";

export async function getAiKnowledge() {
    try {
        const filePath = path.join(process.cwd(), "data", "ai-knowledge.json");
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to load AI knowledge:", error);
    }
    return {};
}

export async function createShipmentFromRequest(requestId: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        let dbUser = await prismadb.user.findUnique({
            where: { clerkId }
        });

        if (!dbUser) {
            const fullUser = await currentUser();
            if (!fullUser) return { success: false, error: "Unauthorized" };
            dbUser = await prismadb.user.create({
                data: {
                    clerkId,
                    email: fullUser.emailAddresses[0]?.emailAddress,
                    firstName: fullUser.firstName,
                    lastName: fullUser.lastName,
                    imageUrl: fullUser.imageUrl,
                    phone: fullUser.phoneNumbers[0]?.phoneNumber,
                }
            });
        }

        const request = await prismadb.buyerRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            return { success: false, error: "בקשת הקונה לא נמצאה" };
        }

        if (request.userId === dbUser.id) {
            return { success: false, error: "לא ניתן להציע מוצר לבקשה של עצמך" };
        }

        // Parse budget values from request
        let value = 0;
        let detailsText = "";
        try {
            const extra = typeof request.extraData === "string" ? JSON.parse(request.extraData) : request.extraData;
            if (extra && typeof extra === "object") {
                if (extra.budget) {
                    value = parseFloat(extra.budget) || 0;
                } else if (extra.budgetRange) {
                    let br = extra.budgetRange;
                    if (typeof br === "string") {
                        try { br = JSON.parse(br); } catch { br = br.split(",").map(Number); }
                    }
                    if (Array.isArray(br) && br.length >= 2) {
                        value = parseFloat(br[1]) || parseFloat(br[0]) || 0;
                    }
                }
                if (extra.details) {
                    detailsText = String(extra.details);
                }
            }
        } catch (e) {
            console.error("Error parsing budget for shipment creation:", e);
        }

        const sellerNotes = `הצעה עבור בקשת קנייה: ${request.query}${detailsText ? `\n\nפרטי הבקשה:\n${detailsText}` : ""}`;

        const shipment = await prismadb.shipment.create({
            data: {
                shortId: Math.random().toString(36).substring(2, 7).toUpperCase(),
                sellerId: dbUser.id,
                buyerId: request.userId,
                listingId: null,
                status: "DRAFT",
                details: {
                    create: {
                        itemName: request.query,
                        value: value,
                        itemCondition: "דרוש לקנייה 🏷️",
                        sellerNotes: sellerNotes,
                        images: JSON.stringify([]),
                        videos: JSON.stringify([]),
                        flexibleData: JSON.stringify({
                            buyerRequestData: request.extraData,
                            dealType: 'negotiation',
                            offers: [{
                                amount: value,
                                by: 'seller',
                                createdAt: new Date().toISOString()
                            }],
                            lastOfferBy: 'seller',
                            negotiationStatus: 'active'
                        })
                    }
                }
            }
        });

        return { success: true, shipmentId: shipment.id, shortId: shipment.shortId };

    } catch (error) {
        console.error("Create Shipment from Request Error:", error);
        return { success: false, error: "Failed to start transaction" };
    }
}


