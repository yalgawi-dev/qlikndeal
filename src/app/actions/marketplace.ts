"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import he from 'he';

export async function createListing(data: {
    title: string;
    description: string;
    price: number;
    condition: string;
    images: string[];
    videos?: string[];
    category?: string;
    extraData?: any;
}) {
    console.log("createListing started", {
        title: data.title,
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
        const user = await currentUser();
        if (!user) {
            console.log("Unauthorized: No user");
            return { success: false, error: "Unauthorized" };
        }

        // Find local user
        let dbUser = await prismadb.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!dbUser) {
            console.log("User not found in DB, creating new user record from Clerk data...");
            dbUser = await prismadb.user.create({
                data: {
                    clerkId: user.id,
                    email: user.emailAddresses[0]?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    phone: user.phoneNumbers[0]?.phoneNumber,
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
                status: "ACTIVE",
                extraData: data.extraData ? JSON.stringify(data.extraData) : null
            }
        });
        console.log("Listing created successfully:", listing.id);

        // revalidatePath("/dashboard/marketplace");
        // Return minimal data to avoid serialization issues
        return { success: true, listing: { id: listing.id } as any };

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
            include: { seller: true },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, listings };
    } catch (error) {
        console.error("Get My Listings Error:", error);
        return { success: false, error: "Failed to fetch listings" };
    }
}

export async function updateListing(id: string, data: any) {
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

        const listing = await prismadb.marketplaceListing.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                price: parseFloat(data.price.toString()) || 0,
                condition: data.condition,
                category: data.category,
                images: JSON.stringify(data.images),
                videos: JSON.stringify(data.videos || []),
                extraData: data.extraData ? JSON.stringify(data.extraData) : null
            }
        });

        revalidatePath("/dashboard/marketplace");
        revalidatePath(`/dashboard/marketplace/${id}`);
        return { success: true, listing };
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
