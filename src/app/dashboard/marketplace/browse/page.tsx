"use client";

import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { getListings } from "@/app/actions/marketplace";
import { Heart, X, ChevronLeft, RotateCcw, Star, MapPin, Clock, Tag, Layers } from "lucide-react";
import Link from "next/link";

interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    images: string;
    category?: string;
    extraData?: string;
    seller?: { firstName?: string; lastName?: string; imageUrl?: string; city?: string };
    createdAt: string;
}

type SwipeDecision = "like" | "skip";

export default function BrowsePage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [decisions, setDecisions] = useState<Record<string, SwipeDecision>>({});
    const [loading, setLoading] = useState(true);
    const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<number | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            const res = await getListings();
            if (res.success) setListings(res.listings || []);
            setLoading(false);
        })();
    }, []);

    const currentListing = listings[currentIndex];
    const likedListings = listings.filter(l => decisions[l.id] === "like");
    const remaining = listings.length - currentIndex;

    function getImages(listing: Listing): string[] {
        try { return JSON.parse(listing.images) || []; } catch { return []; }
    }

    function getHighlights(listing: Listing): string[] {
        try {
            const extra = JSON.parse(listing.extraData || "{}");
            return extra.highlights || [];
        } catch { return []; }
    }

    function conditionLabel(c: string) {
        const map: Record<string, { label: string; color: string }> = {
            "חדש": { label: "חדש", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
            "כמו חדש": { label: "כמו חדש", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
            "משומש": { label: "משומש", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
            "לשיפוץ": { label: "לשיפוץ", color: "bg-red-500/20 text-red-300 border-red-500/40" },
        };
        return map[c] || { label: c, color: "bg-gray-500/20 text-gray-300 border-gray-500/40" };
    }

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return "לפני פחות משעה";
        if (hours < 24) return `לפני ${hours} שעות`;
        const days = Math.floor(hours / 24);
        return `לפני ${days} ימים`;
    }

    function decide(dir: SwipeDecision) {
        if (!currentListing) return;
        setAnimDir(dir === "like" ? "right" : "left");
        setTimeout(() => {
            setDecisions(prev => ({ ...prev, [currentListing.id]: dir }));
            setCurrentIndex(i => i + 1);
            setAnimDir(null);
            setDragX(0);
            if (currentIndex + 1 >= listings.length) setShowSummary(true);
        }, 350);
    }

    function undoLast() {
        if (currentIndex === 0) return;
        const prev = listings[currentIndex - 1];
        setCurrentIndex(i => i - 1);
        setDecisions(d => { const nd = { ...d }; delete nd[prev.id]; return nd; });
    }

    // Drag / touch handlers
    function onPointerDown(e: React.PointerEvent) {
        dragStart.current = e.clientX;
        setIsDragging(true);
    }
    function onPointerMove(e: React.PointerEvent) {
        if (!isDragging || dragStart.current === null) return;
        setDragX(e.clientX - dragStart.current);
    }
    function onPointerUp() {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragX > 100) decide("like");
        else if (dragX < -100) decide("skip");
        else setDragX(0);
        dragStart.current = null;
    }

    if (loading) return (
        <main className="min-h-screen bg-[#080812] text-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">טוען כרטיסיות...</p>
            </div>
        </main>
    );

    // Summary screen
    if (showSummary || (!loading && listings.length > 0 && currentIndex >= listings.length)) {
        return (
            <main className="min-h-screen bg-[#080812] text-white flex flex-col" dir="rtl">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-lg w-full space-y-6">
                        <div className="text-center space-y-2">
                            <div className="text-5xl">✨</div>
                            <h2 className="text-3xl font-bold">סיימת לגלוש!</h2>
                            <p className="text-gray-400">אהבת {likedListings.length} מתוך {listings.length} מוצרים</p>
                        </div>

                        {likedListings.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                                    המוצרים שאהבת
                                </h3>
                                <div className="space-y-3">
                                    {likedListings.map((l, i) => {
                                        const imgs = getImages(l);
                                        return (
                                            <div key={l.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                                <span className="text-gray-500 text-sm w-5">{i + 1}.</span>
                                                {imgs[0] && (
                                                    <img src={imgs[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{l.title}</p>
                                                    <p className="text-purple-400 font-bold text-sm">₪{l.price.toLocaleString()}</p>
                                                </div>
                                                <Link
                                                    href={`/dashboard/marketplace/${l.id}`}
                                                    className="text-xs bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 rounded-xl px-3 py-1.5 transition-colors whitespace-nowrap"
                                                >
                                                    פרטים
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setCurrentIndex(0); setDecisions({}); setShowSummary(false); }}
                                className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/15 font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                התחל מחדש
                            </button>
                            <Link
                                href="/dashboard/marketplace"
                                className="flex-1 py-4 rounded-2xl text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all"
                            >
                                למרקטפלייס
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!currentListing) return null;

    const imgs = getImages(currentListing);
    const highlights = getHighlights(currentListing);
    const cond = conditionLabel(currentListing.condition);
    const swipeHint = dragX > 60 ? "like" : dragX < -60 ? "skip" : null;

    const cardStyle: React.CSSProperties = {
        transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
        transition: animDir ? "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s" : isDragging ? "none" : "transform 0.2s ease",
        opacity: animDir ? 0 : 1,
        ...(animDir === "right" ? { transform: "translateX(120%) rotate(15deg)" } : {}),
        ...(animDir === "left" ? { transform: "translateX(-120%) rotate(-15deg)" } : {}),
    };

    return (
        <main className="min-h-screen bg-[#080812] text-white flex flex-col" dir="rtl">
            <Navbar />

            {/* Top bar */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between max-w-lg mx-auto w-full">
                <Link href="/dashboard/marketplace" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    חזרה
                </Link>
                <div className="text-center">
                    <p className="text-sm text-gray-400">גולש כרטיסיות</p>
                    <div className="flex gap-1 mt-1 justify-center">
                        {listings.slice(0, Math.min(listings.length, 8)).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i < currentIndex
                                    ? decisions[listings[i].id] === "like"
                                        ? "bg-pink-500 w-3"
                                        : "bg-gray-600 w-3"
                                    : i === currentIndex
                                        ? "bg-purple-400 w-5"
                                        : "bg-gray-700 w-3"
                                    }`}
                            />
                        ))}
                        {listings.length > 8 && <span className="text-gray-600 text-xs">+{listings.length - 8}</span>}
                    </div>
                </div>
                <button
                    onClick={undoLast}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                    title="חזור לקודם"
                >
                    <RotateCcw className="w-4 h-4 text-gray-300" />
                </button>
            </div>

            {/* Counter */}
            <p className="text-center text-sm text-gray-500 mb-3">
                {currentIndex + 1} / {listings.length}
                <span className="text-gray-600"> • {remaining} נשארו</span>
            </p>

            {/* Card area */}
            <div className="flex-1 flex items-start justify-center px-4 pb-4">
                <div className="max-w-sm w-full">

                    {/* Next card shadow (peek) */}
                    {currentIndex + 1 < listings.length && (
                        <div className="absolute inset-x-4 max-w-sm mx-auto h-[520px] bg-white/3 rounded-3xl scale-[0.96] translate-y-2 -z-10" />
                    )}

                    {/* Main swipe card */}
                    <div
                        ref={cardRef}
                        style={cardStyle}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerUp}
                        className="relative bg-[#12101f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none"
                    >
                        {/* Swipe overlays */}
                        <div
                            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center transition-opacity duration-100 rounded-3xl"
                            style={{ opacity: Math.max(0, dragX / 150) }}
                        >
                            <div className="bg-emerald-500/90 rounded-2xl px-6 py-3 border-4 border-emerald-400 rotate-[-12deg]">
                                <span className="text-white font-black text-3xl">♥ אהבתי!</span>
                            </div>
                        </div>
                        <div
                            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center transition-opacity duration-100 rounded-3xl"
                            style={{ opacity: Math.max(0, -dragX / 150) }}
                        >
                            <div className="bg-red-500/90 rounded-2xl px-6 py-3 border-4 border-red-400 rotate-[12deg]">
                                <span className="text-white font-black text-3xl">✕ דלגתי</span>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative h-64 bg-gray-800/50 overflow-hidden">
                            {imgs.length > 0 ? (
                                <img
                                    src={imgs[0]}
                                    alt={currentListing.title}
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Layers className="w-16 h-16 text-gray-600" />
                                </div>
                            )}

                            {/* Category badge */}
                            {currentListing.category && (
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {currentListing.category}
                                </div>
                            )}

                            {/* Image count */}
                            {imgs.length > 1 && (
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                    1/{imgs.length} תמונות
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">

                            {/* Title & Price */}
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-xl font-bold leading-tight flex-1">{currentListing.title}</h2>
                                <div className="text-right shrink-0">
                                    <p className="text-2xl font-black text-purple-400">₪{currentListing.price.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Condition + seller + time */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${cond.color}`}>
                                    {cond.label}
                                </span>
                                {currentListing.seller?.city && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {currentListing.seller.city}
                                    </span>
                                )}
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {timeAgo(currentListing.createdAt)}
                                </span>
                            </div>

                            {/* Highlights */}
                            {highlights.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {highlights.slice(0, 4).map((h, i) => (
                                        <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full px-2.5 py-1">
                                            ✓ {h}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Description snippet */}
                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                {currentListing.description}
                            </p>

                            {/* Seller info */}
                            {currentListing.seller && (
                                <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                                    {currentListing.seller.imageUrl ? (
                                        <img src={currentListing.seller.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-300">
                                            {(currentListing.seller.firstName?.[0] || "?")}
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-400">
                                        {currentListing.seller.firstName} {currentListing.seller.lastName}
                                    </span>
                                    <div className="mr-auto flex items-center gap-1 text-amber-400">
                                        <Star className="w-3 h-3 fill-amber-400" />
                                        <span className="text-xs">4.8</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex items-center justify-center gap-6">
                        {/* Skip */}
                        <button
                            onClick={() => decide("skip")}
                            className="w-16 h-16 rounded-full bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                        >
                            <X className="w-7 h-7 text-red-400" />
                        </button>

                        {/* View details */}
                        <Link
                            href={`/dashboard/marketplace/${currentListing.id}`}
                            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            פרטים מלאים
                        </Link>

                        {/* Like */}
                        <button
                            onClick={() => decide("like")}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 hover:from-pink-500/40 hover:to-purple-500/40 border border-pink-500/30 hover:border-pink-500/60 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                        >
                            <Heart className="w-7 h-7 text-pink-400" />
                        </button>
                    </div>

                    {/* Drag hint */}
                    <p className="text-center text-xs text-gray-600 mt-4">
                        גרור ימינה לאהוב • גרור שמאלה לדלג
                    </p>
                </div>
            </div>
        </main>
    );
}
