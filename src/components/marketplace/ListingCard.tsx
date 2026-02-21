"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { User, ShoppingBag, MessageCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { createShipmentFromListing } from "@/app/actions/marketplace";
import { useRouter } from "next/navigation";

interface ListingCardProps {
    listing: any;
    currentUserId?: string;
    isOwner?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    isDeleting?: boolean;
}

export function ListingCard({ listing, currentUserId, isOwner, onEdit, onDelete, isDeleting }: ListingCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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

    const images = listing.images ? JSON.parse(listing.images) : [];
    const mainImage = images.length > 0 ? images[0] : null;

    const extraData = listing.extraData ? JSON.parse(listing.extraData) : {};
    const highlights = extraData["דגשים"] ? extraData["דגשים"].split(", ") : [];

    return (
        <Card
            className="overflow-hidden border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-all duration-300 group shadow-lg shadow-purple-900/5 cursor-pointer flex flex-col h-full"
            onClick={() => router.push(`/dashboard/marketplace/${listing.id}`)}
        >

            {/* Image Area */}
            <div className="aspect-video w-full bg-gray-800 relative overflow-hidden">
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
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 px-2 py-1 rounded text-xs font-bold">
                        {listing.condition === "New" ? "חדש" : listing.condition === "Used" ? "משומש" : listing.condition}
                    </div>
                    {listing.category && listing.category !== "General" && (
                        <div className="bg-purple-600/80 backdrop-blur-md border border-purple-400/30 text-white px-2 py-1 rounded text-xs">
                            {listing.category}
                        </div>
                    )}
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
                            variant="destructive"
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
                    <div>
                        <h3 className="font-bold text-lg text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {listing.seller?.firstName || "Unknown Seller"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-xl text-green-400">₪{listing.price.toLocaleString()}</div>
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
                <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                    {listing.description}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-2 flex gap-2 mt-auto">
                <Button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleBuyNow();
                    }}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold border-0"
                >
                    {loading ? "יוצר לינק..." : "קנה בטוח 🛡️"}
                </Button>
                <Button variant="outline" size="icon" className="border-gray-700 hover:bg-gray-800 text-gray-300">
                    <MessageCircle className="w-5 h-5" />
                </Button>
            </CardFooter>
        </Card>
    );
}
