import { getShipmentByShortId } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, User, ArrowRight, Package, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BuyerAgreement } from "@/components/BuyerAgreement";
import { SellerApproval } from "@/components/SellerApproval";
import { SellerOffersDashboard } from "@/components/SellerOffersDashboard";
import { currentUser } from "@clerk/nextjs/server";

export default async function ShipmentLinkPage({ params, searchParams }: { params: { shortId: string }, searchParams: { buyerId?: string } }) {
    const { success, shipment, error } = await getShipmentByShortId(params.shortId);
    const user = await currentUser();

    if (!success || !shipment || !shipment.details) {
        return notFound();
    }

    const details = shipment.details;
    const seller = shipment.seller;

    // Determine Modes
    let flexibleData: any = {};
    try {
        if (details.flexibleData) {
            flexibleData = JSON.parse(details.flexibleData as string);
        }
    } catch (e) { }

    const createdByMode = flexibleData.createdByMode;
    const isPublicListing = flexibleData.isPublicListing || false;
    const negotiations = flexibleData.negotiations || {};

    const shipmentStatus = shipment.status;
    const isSellerApproved = shipmentStatus === "SELLER_APPROVED" || flexibleData.sellerApprovedAt;

    // Check viewer identity
    const viewerIsSeller = user && seller.clerkId === user.id;
    // For Buyer Identification:
    // 1. If user is logged in, check against shipment.buyerId OR keys in negotiations
    // 2. Ideally we need a robust way to identify guests, but for now we rely on Clerk or "Guest Session" (not fully implemented yet)
    // For this implementation, we assume Logged In Buyers for Multi-Buyer to work best, or we'd need cookies.

    const viewerIsBuyer = user && (shipment.buyer?.clerkId === user.id || (user.id in negotiations));
    const currentBuyerId = user?.id;

    // --- VIEW LOGIC ---

    // A. SELLER VIEW
    if (viewerIsSeller) {
        // 1. If specific buyer selected via URL or only 1 active negotiation exists (and not public dashboard mode)
        const selectedBuyerId = searchParams.buyerId;

        // If we are in "Public Dashboard Mode" and no buyer selected -> Show Dashboard
        const showDashboard = isPublicListing && !selectedBuyerId && Object.keys(negotiations).length > 0;

        if (showDashboard) {
            return (
                <main className="min-h-screen bg-muted/20 flex flex-col items-center p-4 md:p-8">
                    <div className="w-full max-w-2xl">
                        <div className="flex items-center justify-center gap-2 mb-8 opacity-80">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <span className="font-bold text-lg">ניהול הצעות</span>
                        </div>
                        <SellerOffersDashboard
                            negotiations={negotiations}
                            baseLink={`/link/${params.shortId}`}
                        />
                        {/* Note: Passing server action to client component prop might not work directly for navigation if not handled.
                            Better approach for the dashboard item click: simplify to <Link> in the component or use client router.
                            For now, let's assume the component helps us navigate.
                        */}
                    </div>
                </main>
            );
        }

        // 2. Specific Negotiation View (Selected Buyer or Single Buyer)
        // If specific buyer selected, we temporarily override "details" to show THAT negotiation's state
        let effectiveDetails = { ...details, flexibleData: JSON.stringify(flexibleData) };
        let currentBuyerName = "קונה";

        if (selectedBuyerId && negotiations[selectedBuyerId]) {
            const thread = negotiations[selectedBuyerId];
            const threadFlexible = {
                ...flexibleData,
                offers: thread.offers,
                lastOfferBy: thread.lastOfferBy,
                negotiationStatus: thread.status
            };
            effectiveDetails = { ...details, flexibleData: JSON.stringify(threadFlexible) };
            currentBuyerName = thread.buyerName || "קונה";
        }

        const showSellerWaiting = isSellerApproved && !isPublicListing; // If public, we might still want dashboard accessible?

        // Determine if we show Approval or Waiting
        // In public listing, even if approved for one, we might want to see others? 
        // For simplicity: If we selected a buyer, we show the interaction with HIM.

        return (
            <main className="min-h-screen bg-muted/20 flex flex-col items-center p-4 md:p-8">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 opacity-80">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <span className="font-bold text-lg">Qlikndeal</span>
                        </div>
                        {isPublicListing && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/link/${params.shortId}`}>חזרה להצעות</Link>
                            </Button>
                        )}
                    </div>

                    <Card className="overflow-hidden border-primary/20 shadow-lg">
                        {/* Image & Price Header */}
                        <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                            {/* ... image logic ... */}
                            {details.images && JSON.parse(details.images).length > 0 ? (
                                <img
                                    src={JSON.parse(details.images)[0]}
                                    alt={details.itemName || "Product Image"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Package className="w-12 h-12 mb-2 opacity-50" />
                            )}
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h1 className="text-2xl font-bold">{details.itemName}</h1>
                                <div className="text-2xl font-bold text-primary">₪{details.value}</div>
                            </div>

                            {/* Seller Approval Component with Thread Context */}
                            <SellerApproval
                                shipmentId={shipment.id}
                                details={effectiveDetails}
                                buyerName={currentBuyerName}
                            />
                        </div>
                    </Card>
                </div>
            </main>
        );
    }

    // B. BUYER VIEW (or New Guest)
    // If buyer has history -> Show their history.
    // If new buyer -> Show "Make Offer" / "Buy Now".

    // We need to extract the specific negotiation thread for THIS buyer if exists.
    let effectiveDetails = details;
    if (currentBuyerId && negotiations[currentBuyerId]) {
        const thread = negotiations[currentBuyerId];
        const threadFlexible = {
            ...flexibleData,
            offers: thread.offers,
            lastOfferBy: thread.lastOfferBy,
            negotiationStatus: thread.status
        };
        effectiveDetails = { ...details, flexibleData: JSON.stringify(threadFlexible) };
    }

    // Logic: If isSellerApproved is true globally, it might be for SOMEONE ELSE. 
    // We need to check if it's approved for THIS buyer.
    // Actually, widespread 'SELLER_APPROVED' usually locks it. 
    // For Multi-Buyer, we probably need a 'Winner' field.
    // For now, let's assume if status is 'SELLER_APPROVED' and buyerId matches, it's done.

    return (
        <main className="min-h-screen bg-muted/20 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-center gap-2 mb-8 opacity-80">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <span className="font-bold text-lg">Qlikndeal Secure Transaction</span>
                </div>

                <Card className="overflow-hidden border-primary/20 shadow-lg">
                    {/* Product Section */}
                    <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                        {details.images && JSON.parse(details.images).length > 0 ? (
                            <img
                                src={JSON.parse(details.images)[0]}
                                alt={details.itemName || "Product Image"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Package className="w-12 h-12 mb-2 opacity-50" />
                        )}
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-2xl font-bold">{details.itemName}</h1>
                            <div className="text-2xl font-bold text-primary">₪{details.value}</div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                            <p className="text-amber-800 text-sm">
                                {details.sellerNotes || "אין הערות מיוחדות."}
                            </p>
                        </div>

                        <BuyerAgreement
                            shipmentId={shipment.id}
                            sellerName={seller.firstName || "המוכר"}
                            details={{ ...effectiveDetails, flexibleData: effectiveDetails.flexibleData }}
                        />
                    </div>
                </Card>
            </div>
        </main>
    );
}
