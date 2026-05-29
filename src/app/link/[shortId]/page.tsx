import { getShipmentByShortId } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, User, ArrowRight, Package, Clock, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BuyerAgreement } from "@/components/BuyerAgreement";
import { SellerApproval } from "@/components/SellerApproval";
import { SellerOffersDashboard } from "@/components/SellerOffersDashboard";
import prismadb from "@/lib/prismadb";
import { UserProfileForcer } from "@/components/UserProfileForcer";
import { currentUser } from "@clerk/nextjs/server";
import { StatusStepper } from "@/components/StatusStepper";
import { LastSeenUpdater } from "@/components/LastSeenUpdater";
import { BackButton } from "@/components/BackButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function getOnlineStatus(lastActiveAt: string | Date | null | undefined) {
    if (!lastActiveAt) return false;
    const activeDate = new Date(lastActiveAt);
    const now = new Date();
    const diffMs = now.getTime() - activeDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins < 5;
}

const VIEWABLE_RADAR_FIELDS = [
    { key: "category", label: "קטגוריה" },
    { key: "brand", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "ram", label: "זיכרון RAM" },
    { key: "storage", label: "נפח אחסון" },
    { key: "processor", label: "מעבד (CPU)" },
    { key: "gpu", label: "כרטיס מסך (GPU)" },
    { key: "screen", label: "גודל מסך" },
    { key: "display", label: "מפרט מסך" },
    { key: "budgetRange", label: "טווח מחיר" },
    { key: "city", label: "עיר / מיקום" },
    { key: "radius", label: "רדיוס חיפוש" },
];

const flattenExtraData = (rawExtra: any): Record<string, any> => {
    let extra: Record<string, any> = {};
    try {
        extra = typeof rawExtra === "string" ? JSON.parse(rawExtra) : rawExtra;
    } catch {}
    if (!extra || typeof extra !== "object" || Array.isArray(extra)) extra = {};
    
    const getVal = (val: any) => Array.isArray(val) ? String(val[0] || "") : String(val || "");
    if (extra.narrativeState && typeof extra.narrativeState === "object") {
        const ns = extra.narrativeState;
        if (ns.brand && !extra.brand) extra.brand = getVal(ns.brand);
        if (ns.cpu && !extra.processor) extra.processor = getVal(ns.processor || ns.cpu);
        if (ns.ram && !extra.ram) extra.ram = getVal(ns.ram);
        if (ns.storage && !extra.storage) extra.storage = getVal(ns.storage);
        if (ns.gpu && !extra.gpu) extra.gpu = getVal(ns.gpu);
        if (ns.screen && !extra.screen) extra.screen = getVal(ns.screen);
        if (ns.display && !extra.display) extra.display = getVal(ns.display);
    }
    return extra;
};

function parseSpecsFromText(text: string, currentExtra: Record<string, any>): Record<string, any> {
    const extra = { ...currentExtra };
    const lowerText = text.toLowerCase();

    // 1. BRAND
    if (!extra.brand) {
        const brands = ["lenovo", "asus", "apple", "samsung", "dell", "hp", "msi", "gigabyte", "acer", "xiaomi", "lg", "intel", "amd"];
        const brandMatch = brands.find(b => lowerText.includes(b));
        if (brandMatch) {
            extra.brand = brandMatch.charAt(0).toUpperCase() + brandMatch.slice(1);
        } else if (text.includes("לנובו")) {
            extra.brand = "Lenovo";
        } else if (text.includes("אסוס")) {
            extra.brand = "Asus";
        } else if (text.includes("אפל") || text.includes("אייפון")) {
            extra.brand = "Apple";
        } else if (text.includes("סמסונג")) {
            extra.brand = "Samsung";
        } else if (text.includes("דל")) {
            extra.brand = "Dell";
        }
    }

    // 2. RAM
    if (!extra.ram) {
        const ramMatch = lowerText.match(/\b(8|16|32|64|128)\s*(?:gb|ג"ב|גיגה|ג'יגה)\b/);
        if (ramMatch) {
            extra.ram = `${ramMatch[1]}GB`;
        }
    }

    // 3. STORAGE
    if (!extra.storage) {
        const storageMatch = lowerText.match(/\b(128|256|512)\s*(?:gb|ג"ב|גיגה|ג'יגה)\b|\b(1|2)\s*(?:tb|טרה)\b/);
        if (storageMatch) {
            if (storageMatch[1]) {
                extra.storage = `${storageMatch[1]}GB`;
            } else if (storageMatch[2]) {
                extra.storage = `${storageMatch[2]}TB`;
            }
        }
    }

    // 4. PROCESSOR (CPU)
    if (!extra.processor) {
        if (lowerText.includes("i5") || lowerText.includes("core i5")) extra.processor = "Intel Core i5";
        else if (lowerText.includes("i7") || lowerText.includes("core i7")) extra.processor = "Intel Core i7";
        else if (lowerText.includes("i9") || lowerText.includes("core i9")) extra.processor = "Intel Core i9";
        else if (lowerText.includes("ryzen 5")) extra.processor = "AMD Ryzen 5";
        else if (lowerText.includes("ryzen 7")) extra.processor = "AMD Ryzen 7";
        else if (lowerText.includes("ryzen 9")) extra.processor = "AMD Ryzen 9";
        else if (lowerText.includes("m1")) extra.processor = "Apple M1";
        else if (lowerText.includes("m2")) extra.processor = "Apple M2";
        else if (lowerText.includes("m3")) extra.processor = "Apple M3";
    }

    // 5. GPU
    if (!extra.gpu) {
        if (lowerText.includes("rtx 3060")) extra.gpu = "NVIDIA RTX 3060";
        else if (lowerText.includes("rtx 3070")) extra.gpu = "NVIDIA RTX 3070";
        else if (lowerText.includes("rtx 3080")) extra.gpu = "NVIDIA RTX 3080";
        else if (lowerText.includes("rtx 4060")) extra.gpu = "NVIDIA RTX 4060";
        else if (lowerText.includes("rtx 4070")) extra.gpu = "NVIDIA RTX 4070";
        else if (lowerText.includes("rtx 4080")) extra.gpu = "NVIDIA RTX 4080";
        else if (lowerText.includes("rtx 4090")) extra.gpu = "NVIDIA RTX 4090";
    }

    // 6. Display spec (OLED, IPS, Hz, etc.)
    if (!extra.display) {
        const displayRegex = /(oled|ips|hz|dci-p3|retina|amoled|fhd|qhd|4k|2\.8k|120hz|144hz|60hz|90hz|240hz)/i;
        const displayMatch = lowerText.match(displayRegex);
        if (displayMatch) {
            const fullMatch = lowerText.match(/([a-z0-9\.\-%]+(?:\s+[a-z0-9\.\-%]+){0,5}\s*(?:oled|ips|hz|dci-p3|retina|amoled|fhd|qhd|4k|2\.8k|120hz|144hz|60hz|90hz|240hz)\b[a-z0-9\.\-%\s]*)/i);
            if (fullMatch) {
                extra.display = fullMatch[1].trim();
            }
        }
    }

    return extra;
}

function formatRadarValue(key: string, value: any, extraData: any): string {
    if (value === "Flexible" || value === "flexible" || value === "Flexible (any)" || value === "Flexible (Any)") {
        return "גמיש";
    }
    if (key === "budgetRange") {
        let arr = value;
        if (typeof value === "string") {
            try { arr = JSON.parse(value); } catch { arr = value.split(",").map(Number); }
        }
        if (Array.isArray(arr) && arr.length >= 2) {
            const min = Number(arr[0]);
            const max = Number(arr[1]);
            if (min === 0 || isNaN(min)) {
                return `עד ₪${max.toLocaleString()}`;
            }
            return `מ-₪${min.toLocaleString()} עד ₪${max.toLocaleString()}`;
        }
        if (extraData.budget) {
            return `עד ₪${Number(extraData.budget).toLocaleString()}`;
        }
        return "לא צוין";
    }
    if (key === "radius") {
        return `${value} ק״מ`;
    }
    if (key === "category") {
        if (!value || value === "General" || value === "GENERAL") return "כללי";
        if (value === "LAPTOPS" || value === "laptops") return "מחשבים ניידים";
        if (value === "SMARTPHONES" || value === "smartphones" || value === "MOBILE" || value === "PHONE") return "טלפונים סלולריים";
        return String(value);
    }
    return String(value);
}


export default async function ShipmentLinkPage({ params, searchParams }: { params: { shortId: string }, searchParams: { buyerId?: string } }) {
    const { success, shipment, error } = await getShipmentByShortId(params.shortId);
    const user = await currentUser();

    if (!success || !shipment || !shipment.details) {
        return notFound();
    }

    let dbUser: any = null;
    if (user && prismadb) {
        dbUser = await prismadb.user.findUnique({
            where: { clerkId: user.id }
        });
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

    let currentBuyerName = "קונה";
    if (user) {
        currentBuyerName = user.firstName || "קונה";
    }
    const selectedBuyerId = searchParams.buyerId;
    if (selectedBuyerId && negotiations[selectedBuyerId]) {
        currentBuyerName = negotiations[selectedBuyerId].buyerName || "קונה";
    } else if (currentBuyerId && negotiations[currentBuyerId]) {
        currentBuyerName = negotiations[currentBuyerId].buyerName || user?.firstName || "קונה";
    }

    // Parse specs for displaying in details card
    let rawExtra: Record<string, any> = {};
    if (shipment.listing?.extraData) {
        try {
            rawExtra = typeof shipment.listing.extraData === "string" ? JSON.parse(shipment.listing.extraData) : shipment.listing.extraData;
        } catch {}
    } else if (flexibleData.buyerRequestData) {
        try {
            rawExtra = typeof flexibleData.buyerRequestData === "string" ? JSON.parse(flexibleData.buyerRequestData) : flexibleData.buyerRequestData;
        } catch {}
    }
    
    const extra = flattenExtraData(rawExtra);
    const textToParse = `${details.itemName} ${details.sellerNotes || ""}`;
    const extraData = parseSpecsFromText(textToParse, extra);

    const fieldsToShow = VIEWABLE_RADAR_FIELDS.filter(field => {
        if (field.key === "budgetRange") {
            return extraData.budgetRange || extraData.budget;
        }
        return extraData[field.key] !== undefined && extraData[field.key] !== null && String(extraData[field.key]).trim() !== "";
    });

    // --- VIEW LOGIC ---

    // A. SELLER VIEW
    if (viewerIsSeller) {
        // 1. If specific buyer selected via URL or only 1 active negotiation exists (and not public dashboard mode)

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
        currentBuyerName = "קונה";

        if (selectedBuyerId && negotiations[selectedBuyerId]) {
            const thread = negotiations[selectedBuyerId];
            const threadFlexible = {
                ...flexibleData,
                offers: thread.offers,
                messages: thread.messages || [],
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
                <UserProfileForcer dbUser={dbUser} />
                <LastSeenUpdater shipmentId={shipment.id} role="seller" />
                <div className="w-full max-w-2xl">
                    <div className="mb-4 flex items-center justify-between">
                        <BackButton label="חזור לשליטה" />
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold backdrop-blur-md"
                        >
                            <span>חזרה להמשך חיפוש</span>
                        </Link>
                    </div>
                    {/* Intimate Dual-Party Header */}
                    <div className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-primary/20 mb-6 bg-gradient-to-b from-card to-card/50">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-16 h-16 overflow-hidden bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold shadow-inner ring-2 ring-background">
                                    {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Me" /> : <User className="w-8 h-8" />}
                                </div>
                                {(() => {
                                    return (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background z-20 bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                    );
                                })()}
                            </div>
                            <span className="text-xs font-bold mt-2">{user?.firstName || "את/ה"} (המוכר)</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center px-4 flex-1">
                            <div className="bg-emerald-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap mb-2 shadow-sm border border-emerald-500/20 flex items-center gap-1.5">
                                <span>סחר חי</span>
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent relative">
                                <ArrowRight className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-full rotate-180" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-16 h-16 overflow-hidden bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold shadow-inner ring-2 ring-background text-2xl">
                                    {shipment.buyer?.imageUrl ? <img src={shipment.buyer?.imageUrl} className="w-full h-full object-cover" alt="Buyer" /> : currentBuyerName.charAt(0)}
                                </div>
                                {(() => {
                                    const online = getOnlineStatus(flexibleData.buyerLastSeen);
                                    return (
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background z-20 ${online ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`} />
                                    );
                                })()}
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
                                            {fieldsToShow.length > 0 && (
                                                <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">מפרט ופרטים נוספים:</span>
                                                    <div className="divide-y divide-border">
                                                        {fieldsToShow.map((field) => {
                                                            const val = field.key === "budgetRange" ? extraData.budgetRange || extraData.budget : extraData[field.key];
                                                            return (
                                                                <div key={field.key} className="flex justify-between items-center py-2 text-sm">
                                                                    <span className="text-muted-foreground">{field.label}</span>
                                                                    <span className="font-bold text-foreground text-left max-w-[60%] break-words">
                                                                        {formatRadarValue(field.key, val, extraData)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
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

                        <div className="p-4 md:p-6 bg-slate-50 dark:bg-transparent flex flex-col gap-6">
                            {fieldsToShow.length > 0 && (
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-primary/20 overflow-hidden shadow-inner">
                                    <div className="px-4 py-2.5 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-cyan-400" />
                                        <span className="text-xs font-bold text-foreground">מפרט מבוקש ודרישות</span>
                                    </div>
                                    <div className="divide-y divide-border/40 px-4">
                                        {fieldsToShow.map((field) => {
                                            const val = field.key === "budgetRange" ? extraData.budgetRange || extraData.budget : extraData[field.key];
                                            return (
                                                <div key={field.key} className="flex justify-between items-center py-2.5 text-xs">
                                                    <span className="text-muted-foreground">{field.label}</span>
                                                    <span className="text-foreground font-bold text-left max-w-[60%] break-words">
                                                        {formatRadarValue(field.key, val, extraData)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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
            messages: thread.messages || [],
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
            <UserProfileForcer dbUser={dbUser} />
            {/* Auto-Update Last Seen Component (Client Side Logic Wrapper) */}
            <LastSeenUpdater shipmentId={shipment.id} role={viewerIsSeller ? 'seller' : 'buyer'} />
            
            <div className="w-full max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <BackButton label="חזור" className="text-muted-foreground hover:text-foreground" />
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold backdrop-blur-md"
                    >
                        <span>חזרה להמשך חיפוש</span>
                    </Link>
                </div>
                
                {/* Intimate Dual-Party Header */}
                <div className="flex items-center justify-between bg-card p-4 rounded-3xl shadow-lg border border-primary/20 mb-6 bg-gradient-to-b from-card to-card/50">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-16 h-16 overflow-hidden bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold shadow-inner ring-2 ring-background text-2xl">
                                {seller.imageUrl ? <img src={seller.imageUrl} className="w-full h-full object-cover" alt="Seller" /> : (seller.firstName || "מ").charAt(0)}
                            </div>
                            {(() => {
                                const online = getOnlineStatus(flexibleData.sellerLastSeen);
                                return (
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background z-20 ${online ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`} />
                                );
                            })()}
                        </div>
                        <span className="text-xs font-bold mt-2">{seller.firstName || "המוכר"} (המוכר)</span>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4 flex-1">
                        <div className="bg-emerald-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap mb-2 shadow-sm border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                            <span>סחר חי</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent relative">
                            <ArrowRight className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-full" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-16 h-16 overflow-hidden bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold shadow-inner ring-2 ring-background">
                                {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Me" /> : <User className="w-8 h-8" />}
                            </div>
                            {(() => {
                                return (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background z-20 bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                );
                            })()}
                        </div>
                        <span className="text-xs font-bold mt-2">{currentBuyerName} (הקונה)</span>
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
                                        {fieldsToShow.length > 0 && (
                                            <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">מפרט ופרטים נוספים:</span>
                                                <div className="divide-y divide-border">
                                                    {fieldsToShow.map((field) => {
                                                        const val = field.key === "budgetRange" ? extraData.budgetRange || extraData.budget : extraData[field.key];
                                                        return (
                                                            <div key={field.key} className="flex justify-between items-center py-2 text-sm">
                                                                <span className="text-muted-foreground">{field.label}</span>
                                                                <span className="font-bold text-foreground text-left max-w-[60%] break-words">
                                                                    {formatRadarValue(field.key, val, extraData)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
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

                    <div className="p-4 md:p-6 bg-slate-50 dark:bg-transparent flex flex-col gap-6">
                        {fieldsToShow.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-primary/20 overflow-hidden shadow-inner">
                                <div className="px-4 py-2.5 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-cyan-400" />
                                    <span className="text-xs font-bold text-foreground">מפרט מבוקש ודרישות</span>
                                </div>
                                <div className="divide-y divide-border/40 px-4">
                                    {fieldsToShow.map((field) => {
                                        const val = field.key === "budgetRange" ? extraData.budgetRange || extraData.budget : extraData[field.key];
                                        return (
                                            <div key={field.key} className="flex justify-between items-center py-2.5 text-xs">
                                                <span className="text-muted-foreground">{field.label}</span>
                                                <span className="text-foreground font-bold text-left max-w-[60%] break-words">
                                                    {formatRadarValue(field.key, val, extraData)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
