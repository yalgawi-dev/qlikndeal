/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListingById, createShipmentFromListing, incrementListingViews, toggleListingFavoriteCount } from "@/app/actions/marketplace";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ShoppingBag, ArrowRight, MapPin, Truck, ShieldCheck, Share2, Heart, User, Sparkles, Eye, HeartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { toast } from "sonner";
import { ShareModal } from "@/components/marketplace/ShareModal";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

function getOnlineStatus(lastActiveAt: string | Date | null | undefined) {
    if (!lastActiveAt) return { isOnline: false, label: "לא היה מחובר לאחרונה" };
    const activeDate = new Date(lastActiveAt);
    const now = new Date();
    const diffMs = now.getTime() - activeDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 5) {
        return { isOnline: true, label: "פעיל כעת" };
    }
    if (diffMins < 60) {
        return { isOnline: false, label: `נראה לאחרונה: לפני ${diffMins} דק'` };
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
        return { isOnline: false, label: `נראה לאחרונה: לפני ${diffHours} שעות` };
    }
    const diffDays = Math.floor(diffHours / 24);
    return { isOnline: false, label: `נראה לאחרונה: לפני ${diffDays} ימים` };
}

export default function ListingPage() {
    const params = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [creatingShipment, setCreatingShipment] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    
    const { user, isLoaded } = useUser();
    const isOwner = isLoaded && user && listing?.seller?.clerkId === user.id;
    
    // Ref to ensure we only count the view ONCE per page load, after Clerk is ready
    const viewCounted = useRef(false);

    // ── Step 1: Fetch the listing data (always, as soon as we have an ID) ──
    useEffect(() => {
        const fetchListing = async () => {
            if (!params.id) return;
            try {
                const res = await getListingById(params.id as string);
                if (res.success && res.listing) {
                    setListing(res.listing);
                    if (res.listing.images) {
                        const images = JSON.parse(res.listing.images);
                        if (images.length > 0) setSelectedImage(images[0]);
                    }
                } else {
                    toast.error("המוצר לא נמצא");
                    router.push("/dashboard/marketplace");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [params.id, router]);

    // ── Step 2: Count the view ONLY after Clerk is loaded & we know who the user is ──
    // This runs once isLoaded becomes true and we have a listing.
    // We skip the owner to avoid inflating their own view count.
    useEffect(() => {
        if (!isLoaded || !listing || viewCounted.current) return;
        const isOwnerVisit = user && user.id === listing.seller?.clerkId;
        if (isOwnerVisit) return; // Don't count self-views
        
        viewCounted.current = true;
        // Fire-and-forget: increment and update local state for live feedback
        incrementListingViews(params.id as string).then(() => {
            setListing((prev: any) => prev ? { ...prev, viewsCount: (prev.viewsCount ?? 0) + 1 } : prev);
        });
    }, [isLoaded, listing?.id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleBuyNow = async () => {
        if (!listing) return;
        setCreatingShipment(true);
        try {
            const res = await createShipmentFromListing(listing.id);
            if (res.success) {
                if (res.isExisting) {
                    toast.info("יש לך כבר זירת סחר פתוחה למודעה זו — מעביר אותך...");
                } else {
                    toast.success("זירת הסחר נפתחה! 🤝 מעביר אותך לניהול המשא ומתן...");
                }
                router.push(`/link/${res.shortId}`);
            } else if (res.error === "SELF_LISTING") {
                toast.error("זו המודעה שלך — לא ניתן לפתוח זירת סחר עם עצמך 😅");
            } else {
                toast.error(res.error || "שגיאה בפתיחת זירת הסחר, נסה שנית");
            }
        } catch (e) {
            toast.error("שגיאה לא צפויה, נסה שנית");
        } finally {
            setCreatingShipment(false);
        }
    };


    const handleShareClick = () => {
        setShareModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white pb-20">
                <Navbar />
                <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
                    <div className="h-8 w-1/3 bg-gray-800 rounded"></div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-800 rounded-xl"></div>
                        <div className="space-y-4">
                            <div className="h-10 w-3/4 bg-gray-800 rounded"></div>
                            <div className="h-6 w-1/2 bg-gray-800 rounded"></div>
                            <div className="h-32 bg-gray-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) return null;

    const images = listing.images ? JSON.parse(listing.images) : [];
    const extraData = listing.extraData ? JSON.parse(listing.extraData) : {};
    const features = Object.entries(extraData).filter(([key]) => key !== "דגשים" && key !== "טלפון ליצירת קשר");
    const highlights = extraData["דגשים"] ? extraData["דגשים"].split(", ") : [];

    return (
        <div className="min-h-screen bg-black text-white pb-32 md:pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Buttons */}
                <div className="flex gap-4 items-center mb-6 text-sm flex-wrap" dir="rtl">
                    <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors font-bold">
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                        חזרה למרקטפלייס
                    </Link>
                    <span className="text-gray-700">|</span>
                    <button onClick={() => router.back()} className="inline-flex items-center text-gray-400 hover:text-gray-300 transition-colors font-bold">
                        חזור שלב אחורה
                    </button>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Mobile-first: Price + Actions shown FIRST on mobile, moves right on desktop */}
                    <div className="lg:col-span-5 lg:order-2 space-y-4">
                        {/* Main Image */}
                        <div className="aspect-[4/3] sm:aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative group">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={listing.title}
                                    className="w-full h-full object-contain bg-black/50 backdrop-blur-sm"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <ShoppingBag className="w-20 h-20 opacity-20" />
                                </div>
                            )}

                            <div className="absolute top-4 right-4 flex gap-2">
                                {listing.condition && listing.condition !== "לא צוין" && (
                                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-sm font-bold shadow-lg">
                                        {listing.condition === "New" ? "חדש באריזה" :
                                            listing.condition === "Like New" ? "כמו חדש" :
                                                listing.condition === "Used" ? "משומש" :
                                                    listing.condition}
                                    </Badge>
                                )}
                                {listing.category && (
                                    <Badge variant="outline" className="bg-black/50 backdrop-blur border-gray-600 text-gray-200">
                                        {listing.category}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? "border-purple-500 ring-2 ring-purple-500/30" : "border-transparent opacity-70 hover:opacity-100"}`}
                                    >
                                        <Image src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" width={400} height={400} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description Section */}
                        <Card className="bg-gray-900/50 border-gray-800 mt-8">
                            <CardHeader>
                                <CardTitle className="text-xl">תיאור המוצר</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {listing.description}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Images column: below price on mobile, left on desktop */}
                    <div className="lg:col-span-7 lg:order-1 space-y-4">

                        {/* Summary Card - hidden on mobile (shown at top via order) */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-8 space-y-5 shadow-xl shadow-purple-900/10">
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                                    {listing.title}
                                </h1>
                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                    <span>פורסם בתאריך {new Date(listing.createdAt).toLocaleDateString('he-IL')}</span>
                                    {listing.seller?.city && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.seller.city}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-baseline justify-between border-b border-gray-800 pb-6">
                                <div className="text-4xl font-bold text-green-400 font-mono">
                                    ₪{listing.price.toLocaleString()}
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            try {
                                                const favs = JSON.parse(localStorage.getItem("qlik_favorites") || "[]");
                                                const isFav = favs.includes(listing.id);
                                                if (isFav) {
                                                    const updated = favs.filter((id: string) => id !== listing.id);
                                                    localStorage.setItem("qlik_favorites", JSON.stringify(updated));
                                                    toast.success("הוסר מהמועדפים");
                                                    toggleListingFavoriteCount(listing.id, false);
                                                    setListing((prev: any) => prev ? { ...prev, favoritesCount: Math.max(0, (prev.favoritesCount ?? 0) - 1) } : prev);
                                                } else {
                                                    favs.push(listing.id);
                                                    localStorage.setItem("qlik_favorites", JSON.stringify(favs));
                                                    toast.success("נוסף למועדפים ❤️");
                                                    toggleListingFavoriteCount(listing.id, true);
                                                    setListing((prev: any) => prev ? { ...prev, favoritesCount: (prev.favoritesCount ?? 0) + 1 } : prev);
                                                }
                                            } catch (e) {}
                                        }}
                                        className="rounded-full hover:bg-gray-800 text-gray-400 hover:text-red-500"
                                    >
                                        <Heart className={`w-6 h-6 ${(() => {
                                            try {
                                                const favs = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("qlik_favorites") || "[]" : "[]");
                                                return favs.includes(listing.id) ? "fill-red-500 text-red-500" : "";
                                            } catch { return ""; }
                                        })()}`} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleShareClick} className="rounded-full hover:bg-gray-800 text-gray-400 hover:text-blue-500">
                                        <Share2 className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                {isOwner ? (
                                    <>
                                        {/* ── Owner Insights Panel ── */}
                                        <div className="rounded-2xl border border-gray-700/80 bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden mb-3 shadow-inner">
                                            {/* Header */}
                                            <div className="px-4 pt-3 pb-2 border-b border-gray-700/50">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">📊 ביצועי המודעה שלך</div>
                                            </div>
                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 divide-x divide-gray-700/50" dir="rtl">
                                                {/* Views */}
                                                <div className="p-4 text-center group">
                                                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                                        <Eye className="w-4 h-4 text-blue-400" />
                                                        <span className="text-[11px] text-gray-400 font-medium">צפיות</span>
                                                    </div>
                                                    <div className="text-4xl font-black text-white tabular-nums leading-none">
                                                        {(listing.viewsCount ?? 0).toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 mt-1">
                                                        {(listing.viewsCount ?? 0) === 0
                                                            ? "עוד אף אחד לא נכנס"
                                                            : (listing.viewsCount ?? 0) === 1
                                                            ? "אדם 1 צפה במודעה"
                                                            : `${listing.viewsCount} אנשים נכנסו`}
                                                    </div>
                                                </div>
                                                {/* Favorites */}
                                                <div className="p-4 text-center group">
                                                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                                        <Heart className="w-4 h-4 text-rose-400" />
                                                        <span className="text-[11px] text-gray-400 font-medium">מועדפים</span>
                                                    </div>
                                                    <div className="text-4xl font-black text-rose-400 tabular-nums leading-none">
                                                        {(listing.favoritesCount ?? 0).toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 mt-1">
                                                        {(listing.favoritesCount ?? 0) === 0
                                                            ? "טרם נשמר כמועדף"
                                                            : `${listing.favoritesCount} ${(listing.favoritesCount ?? 0) === 1 ? "אדם שמר" : "אנשים שמרו"}`}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Conversion Bar */}
                                            {(listing.viewsCount ?? 0) > 0 && (
                                                <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="text-[10px] text-gray-400">שיעור מועדפים</span>
                                                        <span className="text-[10px] font-bold text-cyan-400">
                                                            {Math.min(100, Math.round(((listing.favoritesCount ?? 0) / (listing.viewsCount ?? 1)) * 100))}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-rose-400 rounded-full transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, Math.round(((listing.favoritesCount ?? 0) / (listing.viewsCount ?? 1)) * 100))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => router.push(`/dashboard/marketplace/my-listings`)}
                                            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg border border-slate-600"
                                        >
                                            צפה במודעות שלי ובבקשות 📊
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleBuyNow}
                                            disabled={creatingShipment}
                                            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-emerald-900/20"
                                        >
                                            {creatingShipment ? "פותח זירה..." : "לפתיחת זירת סחר ומשא ומתן 🤝"}
                                        </Button>
                                        {extraData["טלפון ליצירת קשר"] && (
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const cleanPhone = extraData["טלפון ליצירת קשר"].replace(/\D/g, "");
                                                    const text = encodeURIComponent(`היי ${listing.seller?.firstName || 'מוכר'}, ראיתי את המודעה שלך ל-${listing.title} ב-Qlikndeal ואשמח לדעת אם זה עדיין רלוונטי.`);
                                                    window.open(`https://wa.me/${cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone}?text=${text}`, "_blank");
                                                }}
                                                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold h-12 text-base rounded-xl flex items-center justify-center gap-2 shadow-md"
                                            >
                                                💬 שלח הודעת וואטסאפ מהירה
                                            </Button>
                                        )}
                                    </>
                                )}
                                <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800 h-12 text-gray-300">
                                    <MessageCircle className="w-4 h-4 ml-2" /> שלח הודעה למוכר
                                </Button>
                            </div>

                            <div className="flex gap-3 text-xs text-gray-500 justify-center">
                                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> הגנת רוכש מלאה</span>
                                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> משלוח זמין</span>
                            </div>
                        </div>

                        {/* Tech Specs / Extra Data */}
                        {(features.length > 0 || highlights.length > 0) && (
                            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                                <CardHeader className="bg-gray-800/50 py-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" /> מפרט מקצועי
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Highlights Chips */}
                                    {highlights.length > 0 && (
                                        <div className="p-4 flex flex-wrap gap-2 border-b border-gray-800">
                                            {highlights.map((h: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="bg-purple-900/30 text-purple-300 hover:bg-purple-900/50">
                                                    ✨ {h}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Specs List */}
                                    <div className="divide-y divide-gray-800">
                                        {features.map(([key, value]: any, i) => {
                                            if (key === "תקינות סוללה") {
                                                const isOk = value === "תקינה";
                                                return (
                                                    <div key={i} className="flex justify-between items-center p-4 hover:bg-gray-800/30 transition-colors">
                                                        <span className="text-gray-400">🔋 {key}</span>
                                                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${isOk ? "bg-green-900/50 text-green-300 border border-green-700" : "bg-red-900/50 text-red-300 border border-red-700"}`}>
                                                            {isOk ? "✅ תקינה" : "❌ לא תקינה"}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            if (key === "אחוזי סוללה") {
                                                const pct = parseInt(value);
                                                const color = pct > 80 ? "bg-green-500" : pct > 50 ? "bg-yellow-500" : "bg-red-500";
                                                return (
                                                    <div key={i} className="p-4 hover:bg-gray-800/30 transition-colors">
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-gray-400">🔋 בריאות סוללה</span>
                                                            <span className="font-bold text-white">{value}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, isNaN(pct) ? 0 : pct)}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div key={i} className="flex justify-between p-4 hover:bg-gray-800/30 transition-colors">
                                                    <span className="text-gray-400">{key}</span>
                                                    <span className="font-medium text-white max-w-[60%] text-left">{value}</span>
                                                </div>
                                            );
                                        })}
                                        {/* Show phone if available */}
                                        {extraData["טלפון ליצירת קשר"] && (
                                            <div className="flex justify-between p-4 bg-gray-800/30">
                                                <span className="text-gray-400">טלפון</span>
                                                <span className="font-medium text-white text-left dir-ltr">{extraData["טלפון ליצירת קשר"]}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Seller Profile */}
                        {listing.seller && (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                                        {listing.seller.imageUrl ? (
                                            <Image src={listing.seller.imageUrl} alt={listing.seller.firstName} className="w-full h-full object-cover" width={400} height={400} />
                                        ) : (
                                            <User className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                                                   <div>
                                        <div className="font-bold text-lg">
                                            {listing.seller.firstName} {listing.seller.lastName}
                                        </div>
                                        {!isOwner && (() => {
                                            const status = getOnlineStatus(listing.seller.lastActiveAt);
                                            return (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
                                                    <span className={`w-3 h-3 rounded-full shrink-0 ${status.isOnline ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`} />
                                                    <span className={status.isOnline ? "text-green-400" : "text-red-400"}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                        <div className="text-sm text-gray-500 mt-1">
                                            חבר במערכת מאז {new Date(listing.seller.createdAt).getFullYear()}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="mr-auto text-blue-400 hover:text-blue-300">
                                        צפה בפרופיל
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            </div>

            {listing && (
                <ShareModal
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    url={`https://qlikndeal.vercel.app/listing/${listing.id}`}
                    title={`Qlikndeal - ${listing.title}`}
                    text={`כנסו לראות את ${listing.title} ב-Qlikndeal! מחיר: ₪${listing.price.toLocaleString()}`}
                />
            )}

            {/* Sticky Bottom CTA — mobile only */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-black/95 backdrop-blur-xl border-t border-gray-800 flex gap-3">
                {isOwner ? (
                    <button
                        onClick={() => router.push('/dashboard/marketplace/my-listings')}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-base rounded-xl py-3.5 transition-all active:scale-95"
                    >
                        📊 המודעות שלי
                    </button>
                ) : (
                    <button
                        onClick={handleBuyNow}
                        disabled={creatingShipment}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-black text-base rounded-xl py-3.5 shadow-lg disabled:opacity-50 transition-all active:scale-95"
                    >
                        {creatingShipment ? "פותח זירה..." : "🤝 לזירת סחר ומשא ומתן"}
                    </button>
                )}
                <button
                    onClick={handleShareClick}
                    className="w-14 h-14 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 transition-all active:scale-95"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

