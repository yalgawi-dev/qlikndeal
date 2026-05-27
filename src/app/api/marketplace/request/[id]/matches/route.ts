import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { isMatch } from "@/lib/matchmaker";

export const dynamic = "force-dynamic";

// Calculate geographical distance using Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (v: number) => v * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await currentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const dbUser = await prismadb.user.findUnique({ where: { clerkId: user.id } });
        if (!dbUser) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // 1. Fetch the BuyerRequest
        const request = await prismadb.buyerRequest.findUnique({
            where: { id: params.id }
        });

        if (!request) {
            return new NextResponse("Request not found", { status: 404 });
        }

        // Verify that the request belongs to the user
        if (request.userId !== dbUser.id) {
            return new NextResponse("Unauthorized request access", { status: 403 });
        }

        // 2. Fetch all active SELL listings
        const listings = await prismadb.marketplaceListing.findMany({
            where: {
                status: "ACTIVE",
                listingType: "SELL"
            },
            include: {
                seller: {
                    select: { clerkId: true, firstName: true, lastName: true, imageUrl: true, city: true, roles: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // 3. Parse request extraData
        let rExtra: any = {};
        try {
            if (request.extraData) {
                rExtra = typeof request.extraData === "string" ? JSON.parse(request.extraData) : request.extraData;
            }
        } catch (e) {}

        const rLat = typeof rExtra.lat === "number" ? rExtra.lat : null;
        const rLng = typeof rExtra.lng === "number" ? rExtra.lng : null;

        // 4. Filter using isMatch
        const rawMatched = listings.filter(listing => isMatch(listing, request));

        // Sync request status in database based on actual matches
        const currentStatus = request.status;
        if (rawMatched.length === 0 && currentStatus === "MATCHED") {
            await prismadb.buyerRequest.update({
                where: { id: request.id },
                data: { status: "ACTIVE" }
            });
            request.status = "ACTIVE";
        } else if (rawMatched.length > 0 && currentStatus === "ACTIVE") {
            await prismadb.buyerRequest.update({
                where: { id: request.id },
                data: { status: "MATCHED" }
            });
            request.status = "MATCHED";
        }

        // Auto-create shipments for new matches (if request has userId)
        if (request.userId) {
            for (const listing of rawMatched) {
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
        }

        const matchedListings = rawMatched.map(listing => {
            let distanceKm: number | null = null;
            if (rLat !== null && rLng !== null && listing.latitude !== null && listing.longitude !== null) {
                distanceKm = getDistance(rLat, rLng, listing.latitude, listing.longitude);
            }
            return {
                ...listing,
                distanceKm
            };
        });


        // 5. Sort matches by distance (closest first), fallback to date
        matchedListings.sort((a, b) => {
            if (a.distanceKm !== null && b.distanceKm !== null) {
                return a.distanceKm - b.distanceKm;
            }
            if (a.distanceKm !== null) return -1;
            if (b.distanceKm !== null) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return NextResponse.json({
            success: true,
            results: matchedListings,
            total: matchedListings.length
        });

    } catch (error) {
        console.error("[MARKETPLACE_REQUEST_MATCHES_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
