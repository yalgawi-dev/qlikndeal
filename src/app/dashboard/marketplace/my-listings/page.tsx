"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { ComputerListingForm } from "@/components/marketplace/ComputerListingForm";
import { MobileListingForm } from "@/components/marketplace/MobileListingForm";
import { getMyListings, deleteListing } from "@/app/actions/marketplace";
import { Loader2, Plus, ArrowRight, ArrowLeft, Pencil, Trash2, ShoppingBag, Tag, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShareModal } from "@/components/marketplace/ShareModal";

// Parse listing data safely for use in edit forms
function prepareInitialData(listing: any) {
    let images: string[] = [];
    let videos: string[] = [];
    let extraData: any[] = [];
    let highlights: string[] = [];

    try { images = JSON.parse(listing.images || "[]"); } catch { images = []; }
    try { videos = JSON.parse(listing.videos || "[]"); } catch { videos = []; }

    try {
        const raw = JSON.parse(listing.extraData || "[]");
        if (Array.isArray(raw)) {
            extraData = raw;
            highlights = raw
                .filter((e: any) => e.key === "דגשים")
                .flatMap((e: any) => e.value?.split(",").map((s: string) => s.trim()) || []);
        } else if (typeof raw === "object") {
            extraData = Object.entries(raw).map(([key, value]) => ({ key, value: String(value) }));
        }
    } catch { extraData = []; }

    return {
        ...listing,
        price: listing.price?.toString() || "",
        images,
        videos,
        extraData,
        highlights,
    };
}

export default function MyListingsPage() {
    const router = useRouter();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState({ url: "", title: "" });

    const fetchMyListings = async () => {
        setLoading(true);
        const res = await getMyListings();
        if (res.success) {
            setListings(res.listings || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyListings();
    }, []);

    const handleEdit = (listing: any) => {
        setEditingListing(prepareInitialData(listing));
    };

    const handleDelete = async (id: string) => {
        if (!confirm("האם אתה בטוח שברצונך למחוק את המודעה? פעולה זו אינה הפיכה.")) return;
        setIsDeleting(id);
        const res = await deleteListing(id);
        if (res.success) {
            setListings(prev => prev.filter(l => l.id !== id));
            toast.success("המודעה הוסרה בהצלחה");
        } else {
            toast.error("שגיאה במחיקת המודעה");
        }
        setIsDeleting(null);
    };

    const handleShareClick = (id: string, title: string) => {
        setShareData({
            url: `${window.location.origin}/dashboard/marketplace/${id}`,
            title
        });
        setShareModalOpen(true);
    };

    const handleEditComplete = () => {
        setEditingListing(null);
        fetchMyListings();
        toast.success("המודעה עודכנה בהצלחה ✓");
    };

    // ── EDIT MODE ──────────────────────────────────────────────────────────────
    if (editingListing) {
        return (
            <div className="min-h-screen bg-black text-white pb-20">
                <Navbar />
                <div className="container mx-auto px-4 py-6 max-w-5xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => setEditingListing(null)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            חזור למודעות שלי
                        </button>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-6 bg-emerald-400 rounded-full" />
                            <h1 className="text-xl font-bold text-white">
                                עריכת מודעה: <span className="text-emerald-400">{editingListing.title}</span>
                            </h1>
                        </div>
                    </div>

                    {/* Edit Form based on category */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-4">
                        {editingListing.category === "Computers" ? (
                            <ComputerListingForm
                                initialData={editingListing}
                                onComplete={handleEditComplete}
                                onCancel={() => setEditingListing(null)}
                                isEditing={true}
                                listingId={editingListing.id}
                            />
                        ) : editingListing.category === "Mobile" ? (
                            <MobileListingForm
                                initialData={editingListing}
                                onComplete={handleEditComplete}
                                onCancel={() => setEditingListing(null)}
                                isEditing={true}
                                listingId={editingListing.id}
                            />
                        ) : (
                            <ListingForm
                                initialData={editingListing}
                                onComplete={handleEditComplete}
                                onCancel={() => setEditingListing(null)}
                                isEditing={true}
                                listingId={editingListing.id}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── LIST MODE ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
                            <ArrowRight className="w-5 h-5 ml-2" /> חזור
                        </Button>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            המודעות שלי
                        </h1>
                    </div>
                    <Button
                        onClick={() => router.push("/dashboard/marketplace")}
                        className="bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        מודעה חדשה
                    </Button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">אין לך מודעות פעילות עדיין</h3>
                        <p className="text-gray-400 mb-6">זה הזמן להתחיל למכור!</p>
                        <Button
                            onClick={() => router.push("/dashboard/marketplace")}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            פרסם מודעה חדשה
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {listings.map(listing => {
                            const images: string[] = (() => { try { return JSON.parse(listing.images || "[]"); } catch { return []; } })();
                            const mainImage = images[0] || null;

                            return (
                                <div
                                    key={listing.id}
                                    className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex gap-0"
                                >
                                    {/* Image */}
                                    <div className="w-32 md:w-48 flex-shrink-0 bg-gray-800">
                                        {mainImage ? (
                                            <img
                                                src={mainImage}
                                                alt={listing.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full min-h-[100px] flex items-center justify-center text-gray-600">
                                                <ShoppingBag className="w-8 h-8 opacity-30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 flex flex-col justify-between gap-2" dir="rtl">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                                <div>
                                                    <h3 className="font-bold text-white text-lg leading-tight">{listing.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        {listing.category && listing.category !== "General" && (
                                                            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                                                                {listing.category}
                                                            </span>
                                                        )}
                                                        <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full">
                                                            {listing.condition}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${listing.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gray-700 text-gray-400"}`}>
                                                            {listing.status === "ACTIVE" ? "פעיל" : listing.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-emerald-400 font-bold text-xl whitespace-nowrap">
                                                    ₪{listing.price.toLocaleString()}
                                                </div>
                                            </div>

                                            {listing.description && (
                                                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                                    {listing.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => handleEdit(listing)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                ערוך מודעה
                                            </button>
                                            <button
                                                onClick={() => handleDelete(listing.id)}
                                                disabled={isDeleting === listing.id}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                            >
                                                {isDeleting === listing.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                                מחק
                                            </button>
                                            <button
                                                onClick={() => handleShareClick(listing.id, listing.title)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors"
                                            >
                                                <Share2 className="w-4 h-4" />
                                                שתף לינק
                                            </button>
                                            <span className="text-xs text-gray-600 mr-auto">
                                                {new Date(listing.createdAt).toLocaleDateString("he-IL")}
                                            </span>
                                        </div>

                                        {/* Offers Display */}
                                        {listing.shipments && listing.shipments.length > 0 && (
                                            <div className="mt-4 border-t border-white/10 pt-4" dir="rtl">
                                                <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    הצעות פעילות ({listing.shipments.length})
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {listing.shipments.map((shipment: any) => {
                                                        const buyerName = shipment.buyer?.firstName || "קונה נסתר";
                                                        // Attempt to find latest offer
                                                        let latestOffer = null;
                                                        try {
                                                            const flex = JSON.parse(shipment.details?.flexibleData || "{}");
                                                            if (flex.offers && flex.offers.length > 1) { // 1 means only starting price
                                                                latestOffer = flex.offers[flex.offers.length - 1].amount;
                                                            }
                                                        } catch (e) {}

                                                        return (
                                                            <button
                                                                key={shipment.id}
                                                                onClick={() => router.push(`/link/${shipment.shortId}`)}
                                                                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl p-2 pr-3 pl-4 text-right transition-all flex items-center gap-3 group shadow-sm"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                                                                    {buyerName.charAt(0)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-white leading-tight">{buyerName}</span>
                                                                    {latestOffer ? (
                                                                        <span className="text-xs font-bold text-emerald-400">הצעה: ₪{latestOffer}</span>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400">טרם הציע נגדית</span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                url={shareData.url}
                title={`Qlikndeal - ${shareData.title}`}
                text={`כנסו לראות את ${shareData.title} ב-Qlikndeal! המקום הבטוח לקנות ולמכור.`}
            />
        </div>
    );
}
