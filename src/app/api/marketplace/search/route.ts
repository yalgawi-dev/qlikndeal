import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ results: [] });
        }

        const results = [];

        const terms = query.split(' ').filter(t => t.trim().length > 0);

        // 1. Search ShadowLeads (Facebook Scrape) - Smart Search
        const shadowLeads = await prismadb.shadowLead.findMany({
            where: {
                AND: terms.map(term => ({
                    OR: [
                        { postText: { contains: term, mode: "insensitive" as const } },
                        { sellerName: { contains: term, mode: "insensitive" as const } },
                    ]
                }))
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
        });

        // Map ShadowLeads
        const mappedShadow = shadowLeads.map(lead => ({
            id: lead.id,
            postText: lead.postText,
            sellerName: lead.sellerName,
            sellerLink: lead.sellerLink || lead.sourceUrl, // External Link
            images: lead.images,
            createdAt: lead.createdAt,
            type: 'external',
            sourceUrl: lead.sourceUrl
        }));

        // 2. Search Internal Shipments - Smart Search
        const shipments = await prismadb.shipment.findMany({
            where: {
                AND: [
                    ...terms.map(term => ({
                        details: {
                            is: {
                                itemName: { contains: term, mode: "insensitive" as const }
                            }
                        }
                    })),
                    { status: { not: "DELIVERED" } }
                ]
            },
            include: {
                details: true,
                seller: true
            },
            take: 20,
            orderBy: {
                createdAt: "desc"
            }
        });

        // Map Shipments
        // Map Shipments
        const mappedShipments = shipments.map(ship => {
            let flexibleData: any = {};
            try { flexibleData = JSON.parse(ship.details?.flexibleData || '{}'); } catch (e) { }

            return {
                id: ship.id,
                // Formatting post text to look like a listing
                postText: `${ship.details?.itemName || 'פריט ללא שם'}\n${ship.details?.sellerNotes || ''}`,
                sellerName: `${ship.seller.firstName || ''} ${ship.seller.lastName || ''}`.trim() || 'מוכר באפליקציה',
                sellerLink: `/link/${ship.shortId}`, // Internal Link
                images: ship.details?.images || '[]',
                createdAt: ship.createdAt,
                type: 'internal',
                sourceUrl: `/link/${ship.shortId}`,

                // Rich Details
                itemName: ship.details?.itemName,
                price: ship.details?.value,
                condition: ship.details?.itemCondition,
                packageSize: flexibleData.packageSize,
                sellerImage: ship.seller.imageUrl,
                isFlexible: true
            };
        });

        // Merge and Sort
        const allResults = [...mappedShipments, ...mappedShadow].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ results: allResults });
    } catch (error) {
        console.error("[MARKETPLACE_SEARCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
