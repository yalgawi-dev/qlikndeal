"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { User, ShoppingBag, MessageCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { createShipmentFromListing } from "@/app/actions/marketplace";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface ListingCardProps {
    listing: any;
    currentUserId?: string;
    isOwner?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    isDeleting?: boolean;
}


// Map English/mixed category values → Hebrew display labels (null = hide the badge)
const CATEGORY_HE: Record<string, string | null> = {
    // Computers
    "computers": "מחשבים",
    "laptop": "מחשב נייד",
    "desktop": "מחשב שולחני",
    "מחשב נייד": "מחשב נייד",
    "מחשב נייח": "מחשב שולחני",
    "מחשבים": "מחשבים",
    // Phones
    "phones": "סלולרי",
    "mobile": "סלולרי",
    "סלולרי": "סלולרי",
    "פלאפלים": "סלולרי",
    // Electronics
    "electronics": "אלקטרוניקה",
    "audio": "שמע ואוזניות",
    "tv": "טלוויזיות",
    "gaming": "גיימינג",
    "אלקטרוניקה": "אלקטרוניקה",
    "גיימינג": "גיימינג",
    "טלוויזיות": "טלוויזיות",
    // Cars
    "cars": "רכבים",
    "car": "רכבים",
    "רכבים": "רכבים",
    "רכב": "רכבים",
    // Home & Furniture
    "furniture": "ריהוט",
    "home": "בית",
    "appliances": "מוצרי חשמל",
    "חשמל": "מוצרי חשמל",
    "ריהוט": "ריהוט",
    "בית": "בית",
    // Real Estate
    "real estate": "נדלן",
    "נדלן": "נדלן",
    "דירות": "נדלן",
    // Fashion
    "fashion": "אופנה",
    "אופנה": "אופנה",
    // General
    "general": null, // hide "General"
    "כללי": null,    // hide "כללי"
};

function translateCategory(cat: string | null | undefined): string | null {
    if (!cat) return null;
    const lower = cat.toLowerCase().trim();
    if (lower in CATEGORY_HE) return CATEGORY_HE[lower];
    // Check if value exists in map directly (Hebrew keys)
    if (cat in CATEGORY_HE) return CATEGORY_HE[cat];
    // Return as-is if not in map (already Hebrew or unknown)
    return cat;
}

export function ListingCard({ listing, currentUserId, isOwner, onEdit, onDelete, isDeleting }: ListingCardProps) {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(false);

    const actualIsOwner = isOwner || (isLoaded && user && listing?.seller?.clerkId === user.id);

    const handleBuyNow = async () => {
        setLoading(true);
        try {
            const res = await createShipmentFromListing(listing.id);
            if (res.success) {
                router.push(`/link/${res.shortId}`);
            } else {
                alert("שגיאה ביצירת עסקה: " + res.error);
            }
        } catch (e) {
            alert("שגיאה לא צפויה");
        } finally {
            setLoading(false);
        }
    };

    // If it's a catalog item, we don't buy it, we use it for reference
    const isCatalog = listing.type === "catalog";
    const isExternal = listing.type === "external";
    const isInternalListing = listing.type === "internal";

    const images = listing.images ? (typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images) : [];
    const mainImage = Array.isArray(images) && images.length > 0 ? images[0] : null;

    const extraData = listing.extraData ? (typeof listing.extraData === 'string' ? JSON.parse(listing.extraData) : listing.extraData) : {};
    const highlights = extraData["דגשים"] ? extraData["דגשים"].split(", ") : [];

    const handleExternalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (listing.sourceUrl) window.open(listing.sourceUrl, "_blank");
    };

    return (
        <Card
            className={`overflow-hidden border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-all duration-300 group shadow-lg shadow-purple-900/5 cursor-pointer flex flex-col h-full ${isCatalog ? 'border-blue-500/30 ring-1 ring-blue-500/10' : ''}`}
            onClick={() => {
                if (isExternal) {
                    if (listing.sourceUrl) window.open(listing.sourceUrl, "_blank");
                } else if (!isCatalog) {
                    router.push(`/dashboard/marketplace/${listing.id}`);
                }
            }}
        >

            {/* Image Area */}
            <div className={`aspect-video w-full bg-gray-800 relative overflow-hidden ${isCatalog ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/40' : ''}`}>
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ShoppingBag className="w-12 h-12 opacity-20" />
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    <div className={`bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-1 rounded text-xs font-bold`}>
                        {isCatalog ? "קטלוג 📚" : (listing.condition === "New" ? "חדש" : listing.condition === "Used" ? "משומש" : listing.condition)}
                    </div>
                    {isExternal && (
                        <div className="bg-blue-600/80 backdrop-blur-md border border-blue-400/30 text-white px-2 py-1 rounded text-xs">
                           פייסבוק 🌐
                        </div>
                    )}
                    {(() => {
                        const displayCat = translateCategory(listing.category);
                        return displayCat ? (
                            <div className="bg-purple-600/80 backdrop-blur-md border border-purple-400/30 text-white px-2 py-1 rounded text-xs">
                                {displayCat}
                            </div>
                        ) : null;
                    })()}
                </div>

                {/* Owner Controls */}
                {isOwner && (
                    <div className="absolute top-2 left-2 flex gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-blue-600 hover:border-blue-500 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                            }}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-black/60 backdrop-blur-md border border-white/10 text-red-400 hover:bg-red-600 hover:text-white rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isDeleting) onDelete?.();
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                    </div>
                )}
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3rem]">{listing.title}</h3>
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {listing.seller?.firstName || "Unknown"} {listing.seller?.lastName || ""}
                        </div>
                    </div>
                    <div className="text-right ml-2">
                        <div className="font-bold text-xl text-green-400">
                            {listing.price > 0 ? `₪${listing.price.toLocaleString()}` : (isCatalog ? "קטלוג" : "צור קשר")}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {highlights.slice(0, 3).map((h: string, i: number) => (
                            <span key={i} className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 border border-gray-700">{h}</span>
                        ))}
                    </div>
                )}
                <p className="text-sm text-gray-400 line-clamp-3 min-h-[60px]">
                    {listing.description}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-2 flex gap-2 mt-auto">
                {isCatalog ? (
                    <Button
                        variant="outline"
                        className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/marketplace/create?template=${listing.id}`);
                        }}
                    >
                        מכור מוצר כזה ✨
                    </Button>
                ) : isExternal ? (
                    <Button
                        onClick={handleExternalClick}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                        צפה בפייסבוק 🌐
                    </Button>
                ) : actualIsOwner ? (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation(); 
                            router.push(`/dashboard/marketplace/my-listings`);
                        }}
                        className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold border-0 shadow-md"
                    >
                        צפה במודעות שלי ובבקשות 📊
                    </Button>
                ) : (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleBuyNow();
                        }}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold border-0 shadow-md shadow-teal-900/20"
                    >
                        {loading ? "פותח זירה..." : "לפתיחת זירת סחר ומשא ומתן 🤝"}
                    </Button>
                )}
                
                {!isCatalog && (
                    <Button variant="outline" size="icon" className="border-gray-700 hover:bg-gray-800 text-gray-300">
                        <MessageCircle className="w-5 h-5" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
