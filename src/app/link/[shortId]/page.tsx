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
import { StatusStepper } from "@/components/StatusStepper";
import { LastSeenUpdater } from "@/components/LastSeenUpdater";
import { BackButton } from "@/components/BackButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    const isSellerApproved = shipmentStatus === ("AGREED" as any) || flexibleData.sellerApprovedAt;

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
                        <div className="mb-4">
                            <BackButton label="חזור לעמוד ראשי" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-8 opacity-80">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <span className="font-bold text-lg">זירת סחר משותפת</span>
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
                    <div className="mb-4">
                        <BackButton label="חזור לשליטה" />
                    </div>
                    {/* Intimate Dual-Party Header */}
                    <div className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-primary/20 mb-6 bg-gradient-to-b from-card to-card/50">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 overflow-hidden bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold relative shadow-inner ring-2 ring-background">
                                {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Me" /> : <User className="w-8 h-8" />}
                                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></span>
                            </div>
                            <span className="text-xs font-bold mt-2">{user?.firstName || "את/ה"} (המוכר)</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center px-4 flex-1">
                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap mb-2 shadow-sm border border-primary/20">
                                סחר חי 🔴
                            </div>
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent relative">
                                <ArrowRight className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-full rotate-180" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 overflow-hidden bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold shadow-inner ring-2 ring-background text-2xl">
                                {shipment.buyer?.imageUrl ? <img src={shipment.buyer?.imageUrl} className="w-full h-full object-cover" alt="Buyer" /> : currentBuyerName.charAt(0)}
                            </div>
                            <span className="text-xs font-bold mt-2">{currentBuyerName} (הקונה)</span>
                        </div>
                    </div>

                    <Card className="overflow-hidden border-border/50 shadow-2xl bg-slate-50/50 dark:bg-[#0b141a] flex flex-col rounded-3xl">
                        {/* Compact Product Context */}
                        <div className="bg-card p-3 md:p-4 border-b border-border flex items-center gap-4 shadow-sm z-10">
                            <div className="w-16 h-16 bg-muted rounded-xl flex-shrink-0 overflow-hidden relative shadow-inner border border-border/50">
                                {details.images && JSON.parse(details.images).length > 0 ? (
                                    <img
                                        src={JSON.parse(details.images)[0]}
                                        alt={details.itemName || "Product Image"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 opacity-20" /></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-sm md:text-base font-bold truncate text-foreground">{details.itemName}</h1>
                                <div className="text-sm font-bold text-primary font-mono mt-0.5">₪{details.value}</div>
                            </div>
                            {isPublicListing && (
                                <Button variant="outline" size="sm" asChild className="rounded-xl flex-shrink-0 h-8 text-[10px] md:text-xs px-2">
                                    <Link href={`/link/${params.shortId}`}>חזרה</Link>
                                </Button>
                            )}
                            
                            {/* PRODUCT DETAILS DIALOG TRIGGER */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="hidden sm:flex text-xs h-8 bg-background shadow-sm hover:bg-muted font-bold ml-2">
                                        לפרטי המוצר
                                    </Button>
                                </DialogTrigger>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" className="flex sm:hidden h-8 w-8 rounded-full bg-background shadow-sm hover:bg-muted ml-2">
                                        <Package className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[400px] sm:max-w-[450px] w-[95vw] p-0 overflow-hidden bg-background rounded-3xl border border-primary/20" dir="rtl">
                                    <ScrollArea className="max-h-[85vh] overflow-y-auto">
                                    <div className="p-6">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-2xl overflow-hidden shadow-inner border border-border/50">
                                            {details.images && JSON.parse(details.images).length > 0 ? (
                                                <img src={JSON.parse(details.images)[0]} className="w-full h-full object-cover" alt="Product" />
                                            ) : (
                                                <div className="w-full h-full flex justify-center items-center"><Package className="w-8 h-8 opacity-20" /></div>
                                            )}
                                        </div>
                                        <DialogHeader>
                                            <DialogTitle className="text-center font-bold text-xl">{details.itemName}</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-4">
                                            <div className="bg-primary/5 p-4 rounded-2xl text-center border border-primary/10">
                                                <span className="text-sm text-muted-foreground block mb-1">מחיר העלאה:</span>
                                                <span className="text-2xl font-bold font-mono text-primary">₪{details.value}</span>
                                            </div>
                                            {details.sellerNotes && (
                                                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest block mb-1">הערות מוכר / תיאור:</span>
                                                    <p className="text-sm text-amber-900 dark:text-amber-400">{details.sellerNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="p-4 md:p-6 bg-slate-50 dark:bg-transparent">
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
    let currentThread: any = null;
    if (currentBuyerId && negotiations[currentBuyerId]) {
        const thread = negotiations[currentBuyerId];
        currentThread = thread;
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


    // Determine Stepper State
    const dealType = flexibleData.dealType || 'negotiation';
    const negotiationStatus = flexibleData.negotiationStatus || 'active';
    const isCancelled = shipment.status === 'CANCELLED';

    let currentStep: 'understanding' | 'negotiation' | 'agreement' | 'payment' | 'shipping' = 'negotiation';

    // To add semantics to "Understanding" - assume that's the starting state before anyone speaks
    if (currentThread && currentThread.offers?.length === 0) {
        currentStep = 'understanding'; 
    }

    if (dealType === 'closed') {
        currentStep = 'payment'; // Skip negotiation
    } else if (negotiationStatus === 'agreed') {
        currentStep = 'agreement';
    } 
    
    if (shipment.status === ('SELLER_APPROVED' as any) || shipment.status === 'AGREED') {
        currentStep = 'payment';
    }

    if (shipment.status === 'PAID') currentStep = 'shipping';
    if (shipment.status === 'DELIVERED') currentStep = 'shipping'; // End of road for now


    // Extract Last Seen Data
    const buyerLastSeen = flexibleData.buyerLastSeen;
    const sellerLastSeen = flexibleData.sellerLastSeen;

    return (
        <main className="min-h-screen bg-muted/20 flex flex-col items-center p-4 md:p-8 relative">
            {/* Auto-Update Last Seen Component (Client Side Logic Wrapper) */}
            <LastSeenUpdater shipmentId={shipment.id} role={viewerIsSeller ? 'seller' : 'buyer'} />
            
            <div className="w-full max-w-2xl">
                <div className="mb-4">
                    <BackButton label="חזור" className="text-muted-foreground hover:text-foreground mb-4" />
                </div>
                
                {/* Intimate Dual-Party Header */}
                <div className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-primary/20 mb-6 bg-gradient-to-b from-card to-card/50">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 overflow-hidden bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold relative shadow-inner ring-2 ring-background">
                             {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Me" /> : <User className="w-8 h-8" />}
                             <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></span>
                        </div>
                        <span className="text-xs font-bold mt-2">{user?.firstName || "את/ה"} (הקונה)</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center px-4 flex-1">
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap mb-2 shadow-sm border border-primary/20">
                            סחר חי 🔴
                        </div>
                        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent relative">
                            <ArrowRight className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-full" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 overflow-hidden bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold shadow-inner ring-2 ring-background text-2xl">
                            {seller.imageUrl ? <img src={seller.imageUrl} className="w-full h-full object-cover" alt="Seller" /> : (seller.firstName || "מ").charAt(0)}
                        </div>
                        <span className="text-xs font-bold mt-2">{seller.firstName || "המוכר"} (המוכר)</span>
                    </div>
                </div>

                {/* Status Stepper */}
                <div className="mb-6">
                    <StatusStepper
                        currentStep={currentStep}
                        isCancelled={isCancelled}
                        buyerLastSeen={buyerLastSeen}
                        sellerLastSeen={sellerLastSeen}
                        viewerRole="buyer"
                    />
                </div>

                <Card className="overflow-hidden border-border/50 shadow-2xl bg-slate-50/50 dark:bg-[#0b141a] flex flex-col rounded-3xl">
                    {/* Compact Product Context */}
                    <div className="bg-card p-3 md:p-4 border-b border-border flex items-center gap-4 shadow-sm z-10">
                        <div className="w-16 h-16 bg-muted rounded-xl flex-shrink-0 overflow-hidden relative shadow-inner border border-border/50">
                            {details.images && JSON.parse(details.images).length > 0 ? (
                                <img
                                    src={JSON.parse(details.images)[0]}
                                    alt={details.itemName || "Product Image"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 opacity-20" /></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-sm md:text-base font-bold truncate text-foreground">{details.itemName}</h1>
                            <div className="text-sm font-bold text-primary font-mono mt-0.5">₪{details.value}</div>
                        </div>
                        
                        {/* PRODUCT DETAILS DIALOG TRIGGER */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="hidden sm:flex text-xs h-8 bg-background shadow-sm hover:bg-muted font-bold ml-2">
                                    לפרטי המוצר
                                </Button>
                            </DialogTrigger>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="flex sm:hidden h-8 w-8 rounded-full bg-background shadow-sm hover:bg-muted ml-2">
                                    <Package className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[400px] sm:max-w-[450px] w-[95vw] p-0 overflow-hidden bg-background rounded-3xl border border-primary/20" dir="rtl">
                                <ScrollArea className="max-h-[85vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-2xl overflow-hidden shadow-inner border border-border/50">
                                        {details.images && JSON.parse(details.images).length > 0 ? (
                                            <img src={JSON.parse(details.images)[0]} className="w-full h-full object-cover" alt="Product" />
                                        ) : (
                                            <div className="w-full h-full flex justify-center items-center"><Package className="w-8 h-8 opacity-20" /></div>
                                        )}
                                    </div>
                                    <DialogHeader>
                                        <DialogTitle className="text-center font-bold text-xl">{details.itemName}</DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4 space-y-4">
                                        <div className="bg-primary/5 p-4 rounded-2xl text-center border border-primary/10">
                                            <span className="text-sm text-muted-foreground block mb-1">מחיר מבוקש:</span>
                                            <span className="text-2xl font-bold font-mono text-primary">₪{details.value}</span>
                                        </div>
                                        {details.sellerNotes && (
                                            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                                                <span className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest block mb-1">הערות מוכר / תיאור:</span>
                                                <p className="text-sm text-amber-900 dark:text-amber-400">{details.sellerNotes}</p>
                                            </div>
                                        )}
                                        <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2">
                                           <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">סוג העסקה:</span>
                                                <span className="font-bold">{dealType === 'fixed' ? 'מחיר סופי' : 'משא ומתן'}</span>
                                           </div>
                                        </div>
                                    </div>
                                </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="p-4 md:p-6 bg-slate-50 dark:bg-transparent flex flex-col gap-4">
                        {details.sellerNotes && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 shadow-sm">
                                <h4 className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-1">הערת המוכר / תיאור מצב:</h4>
                                <p className="text-amber-900 dark:text-amber-400 text-sm font-medium">
                                    {details.sellerNotes}
                                </p>
                            </div>
                        )}

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
