"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { DynamicListingForm } from "@/components/marketplace/DynamicListingForm";
import { ShareModal } from "@/components/marketplace/ShareModal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getMyListings, getMyRequests, deleteListing, deleteRequest, updateRequest } from "@/app/actions/marketplace";
import { RadarDetailModal } from "@/components/marketplace/RadarDetailModal";
import Link from "next/link";
import {
    Loader2, Plus, ArrowRight, Pencil, Trash2, Share2, Sparkles,
    ShoppingBag, Tag, Search, Clock, CheckCircle2, XCircle, AlertCircle,
    ChevronLeft, ChevronRight, Calendar, Package, ExternalLink, Zap, X
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
function parseImages(raw: any): string[] {
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}
function parseExtraData(raw: any): Record<string, any> {
    let extra: Record<string, any> = {};
    try {
        const p = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(p)) {
            const o: Record<string, any> = {};
            p.forEach((e: any) => { if (e?.key) o[e.key] = e.value; });
            extra = o;
        } else if (p && typeof p === "object") {
            extra = p;
        }
    } catch {}

    // Flatten narrativeState for display if present
    if (extra.narrativeState && typeof extra.narrativeState === "object") {
        const ns = extra.narrativeState;
        const getVal = (val: any) => Array.isArray(val) ? String(val[0] || "") : String(val || "");
        if (ns.brand && !extra.brand) extra.brand = getVal(ns.brand);
        if (ns.cpu && !extra.cpu) extra.cpu = getVal(ns.cpu);
        if (ns.ram && !extra.ram) extra.ram = getVal(ns.ram);
        if (ns.storage && !extra.storage) extra.storage = getVal(ns.storage);
        if (ns.gpu && !extra.gpu) extra.gpu = getVal(ns.gpu);
        if (ns.screen && !extra.screen) extra.screen = getVal(ns.screen);
    }
    return extra;
}

const HIDDEN_LISTING_KEYS = new Set([
    "narrativeState", "chips", "aiAnchors", "lat", "lng", "userId", "id", 
    "createdAt", "updatedAt", "listingType", "status", "images", "videos", 
    "price", "title", "description", "category", "subModel", "family", "sku",
    "budget", "budgetRange", "details"
]);

const SPEC_KEY_LABELS: Record<string, string> = {
    brand: "יצרן",
    cpu: "מעבד",
    processor: "מעבד",
    gpu: "כרטיס מסך",
    ram: "זיכרון RAM",
    storage: "נפח אחסון",
    screen: "גודל מסך",
    os: "מערכת הפעלה",
    releaseYear: "שנת ייצור",
    release_year: "שנת ייצור",
    ports: "חיבורים",
    BatteryStatus: "מצב סוללה",
    condition: "מצב המוצר",
    city: "עיר / מיקום",
    radius: "רדיוס חיפוש",
    details: "הערות",
    model: "דגם",
};

function formatListingValue(k: string, v: any): string {
    if (v === undefined || v === null) return "";
    if (v === "Flexible" || v === "flexible" || v === "Flexible (any)" || v === "Flexible (Any)") {
        return "גמיש";
    }
    if (k === "radius") return `${v} ק״מ`;
    if (typeof v === "object") {
        if (Array.isArray(v)) {
            return v.map(item => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ");
        }
        return JSON.stringify(v);
    }
    return String(v);
}

function prepareForEdit(listing: any) {
    return {
        ...listing,
        price: listing.price?.toString() || "",
        images: parseImages(listing.images),
        videos: parseImages(listing.videos),
        extraData: (() => {
            try {
                const r = parseExtraData(listing.extraData);
                return Object.entries(r).map(([k, v]) => ({ key: k, value: formatListingValue(k, v) }));
            } catch { return []; }
        })(),
    };
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { label: string; cls: string; Icon: any }> = {
        ACTIVE:   { label: "פעיל",   cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", Icon: CheckCircle2 },
        SOLD:     { label: "נמכר",   cls: "bg-gray-500/20 text-gray-400 border-gray-500/30",          Icon: CheckCircle2 },
        ARCHIVED: { label: "מוסתר", cls: "bg-orange-500/20 text-orange-400 border-orange-500/30",     Icon: XCircle },
    };
    const s = cfg[status] ?? { label: status, cls: "bg-gray-700 text-gray-400 border-gray-600", Icon: AlertCircle };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${s.cls}`}>
            <s.Icon className="w-3 h-3" />{s.label}
        </span>
    );
}

// ─── ListingDetailModal ───────────────────────────────────────────────────────
function ListingDetailModal({
    listing, onClose, onEdit, onDelete, onShare, isDeleting,
}: {
    listing: any;
    onClose: () => void;
    onEdit: (l: any) => void;
    onDelete: (id: string) => void;
    onShare: (id: string, title: string) => void;
    isDeleting: string | null;
}) {
    const images = parseImages(listing.images);
    const extraData = parseExtraData(listing.extraData);
    const isBuyer = listing.listingType === "BUY";
    const [sel, setSel] = useState(images[0] ?? null);

    const conditionMap: Record<string, string> = {
        New: "חדש באריזה", "Like New": "כמו חדש",
        Good: "טוב", Fair: "סביר", Used: "משומש",
    };

    return (
        <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent
                className="bg-[#0d0f18] border border-white/10 text-white p-0 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                dir="rtl"
            >
                <DialogTitle className="sr-only">{listing.title}</DialogTitle>

                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0 ${isBuyer ? "bg-cyan-950/40" : "bg-purple-950/30"}`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${isBuyer ? "bg-cyan-600" : "bg-blue-600"}`}>
                            {isBuyer ? "🔍 מחפש לקנות" : "🏷️ מוכר"}
                        </span>
                        <StatusBadge status={listing.status} />
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1">
                    {/* Gallery */}
                    {images.length > 0 && (
                        <div className="relative bg-black">
                            <div className="aspect-video w-full overflow-hidden">
                                <img src={sel ?? images[0]} alt={listing.title} className="w-full h-full object-contain" />
                            </div>
                            {images.length > 1 && (
                                <>
                                    <div className="flex gap-2 p-2 overflow-x-auto bg-black/60">
                                        {images.map((img, i) => (
                                            <button key={i} onClick={() => setSel(img)}
                                                className={`w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${sel === img ? "border-purple-500" : "border-transparent opacity-50 hover:opacity-100"}`}>
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setSel(p => { const i = images.indexOf(p!); return images[(i - 1 + images.length) % images.length]; })}
                                        className="absolute left-2 top-[calc(50%-32px)] w-9 h-9 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setSel(p => { const i = images.indexOf(p!); return images[(i + 1) % images.length]; })}
                                        className="absolute right-2 top-[calc(50%-32px)] w-9 h-9 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <div className="p-5 space-y-4">
                        {/* Title & Price */}
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="text-lg font-bold text-white leading-tight flex-1">{listing.title}</h2>
                            <div className={`text-2xl font-bold whitespace-nowrap ${isBuyer ? "text-cyan-400" : "text-emerald-400"}`}>
                                {isBuyer ? "עד " : ""}₪{Number(listing.price).toLocaleString()}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {listing.category && listing.category !== "General" && (
                                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Package className="w-3 h-3" />{listing.category}
                                </span>
                            )}
                            {listing.condition && listing.condition !== "לא צוין" && (
                                <span className="text-xs bg-gray-700/60 text-gray-300 border border-gray-600/40 px-2 py-1 rounded-full">
                                    {conditionMap[listing.condition] ?? listing.condition}
                                </span>
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(listing.createdAt).toLocaleDateString("he-IL")}
                            </span>
                        </div>

                        {/* Description */}
                        {listing.description && (
                            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800/60">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">תיאור</p>
                                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                            </div>
                        )}

                        {/* Specs */}
                        {(() => {
                            const viewableSpecs = Object.entries(extraData).filter(([k, v]) => {
                                if (HIDDEN_LISTING_KEYS.has(k)) return false;
                                if (v === undefined || v === null || String(v).trim() === "") return false;
                                return true;
                            });
                            if (viewableSpecs.length === 0) return null;
                            return (
                                <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800/60 bg-gray-800/30">
                                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                        <span className="text-sm font-bold text-gray-200">מפרט ופרטים</span>
                                    </div>
                                    <div className="divide-y divide-gray-800/50">
                                        {viewableSpecs.map(([k, v]) => {
                                            const label = SPEC_KEY_LABELS[k] || k;
                                            const formattedVal = formatListingValue(k, v);
                                            return (
                                                <div key={k} className="flex justify-between items-center px-4 py-2.5 hover:bg-gray-800/20">
                                                    <span className="text-gray-400 text-sm">{label}</span>
                                                    <span className="text-white text-sm font-medium max-w-[55%] text-left break-words">{formattedVal}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Seller offers */}
                        {!isBuyer && listing.shipments?.length > 0 && (
                            <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800/60 bg-gray-800/30">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-bold text-gray-200">הצעות פעילות ({listing.shipments.length})</span>
                                </div>
                                {listing.shipments.map((s: any) => {
                                    const name = s.buyer?.firstName ?? "קונה נסתר";
                                    let offer = null;
                                    try {
                                        const f = JSON.parse(s.details?.flexibleData ?? "{}");
                                        if (f.offers?.length > 1) offer = f.offers[f.offers.length - 1].amount;
                                    } catch {}
                                    return (
                                        <a key={s.id} href={`/link/${s.shortId}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/30 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">{name[0]}</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white">{name}</div>
                                                <div className="text-xs text-gray-400">{offer ? `הצעה: ₪${offer}` : "טרם הציע נגדית"}</div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-500" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-white/10 p-4 flex gap-2" dir="rtl">
                    <button onClick={() => { onClose(); onEdit(listing); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors">
                        <Pencil className="w-4 h-4" />ערוך
                    </button>
                    <button onClick={() => onShare(listing.id, listing.title)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors">
                        <Share2 className="w-4 h-4" />שתף
                    </button>
                    <button onClick={() => { onClose(); onDelete(listing.id); }}
                        disabled={isDeleting === listing.id}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 mr-auto">
                        {isDeleting === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        מחק
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── ListingRow (unified card for both SELL and BUY) ──────────────────────────
function ListingRow({ listing, onClick }: { listing: any; onClick: () => void }) {
    const images = parseImages(listing.images);
    const img = images[0] ?? null;
    const isBuyer = listing.listingType === "BUY";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-right flex overflow-hidden rounded-2xl border transition-all cursor-pointer group
                ${isBuyer
                    ? "bg-gray-900/50 border-cyan-500/20 hover:border-cyan-400/50 hover:bg-gray-900/70"
                    : "bg-gray-900/50 border-white/10 hover:border-purple-500/40 hover:bg-gray-900/70"
                }`}
        >
            {/* Thumbnail */}
            <div className="w-28 md:w-36 flex-shrink-0 bg-gray-800 relative min-h-[88px]">
                {img
                    ? <img src={img} alt={listing.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center min-h-[88px]">
                        {isBuyer
                            ? <Search className="w-8 h-8 text-gray-600 opacity-30" />
                            : <ShoppingBag className="w-8 h-8 text-gray-600 opacity-30" />}
                      </div>
                }
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${isBuyer ? "bg-cyan-600/80" : "bg-blue-600/80"}`}>
                    {isBuyer ? "קונה" : "מוכר"}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 p-3 md:p-4 flex flex-col justify-between gap-1" dir="rtl">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-sm md:text-base leading-tight line-clamp-2 text-right">{listing.title}</h3>
                        <span className={`font-bold text-base md:text-lg whitespace-nowrap flex-shrink-0 ${isBuyer ? "text-cyan-400" : "text-emerald-400"}`}>
                            {isBuyer ? "עד " : ""}₪{Number(listing.price).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {isBuyer && (
                            <span className="text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">מחפש לקנות</span>
                        )}
                        {listing.category && listing.category !== "General" && (
                            <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full">{listing.category}</span>
                        )}
                        {listing.condition && !isBuyer && (
                            <span className="text-[11px] bg-gray-700/50 text-gray-400 px-1.5 py-0.5 rounded-full">{listing.condition}</span>
                        )}
                        <StatusBadge status={listing.status} />
                        {!isBuyer && listing.shipments?.length > 0 && (
                            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{listing.shipments.length} הצעות
                            </span>
                        )}
                    </div>
                    {listing.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1 text-right">{listing.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(listing.createdAt).toLocaleDateString("he-IL")}
                    <span className="mx-1 text-gray-700">•</span>
                    <span className={`text-[10px] ${isBuyer ? "text-cyan-500/60" : "text-purple-500/60"}`}>לחץ לפרטים מלאים</span>
                </div>
            </div>
        </button>
    );
}


// ─── BuyerRequestCard ─────────────────────────────────────────────────────────
function BuyerRequestCard({ request, onClick }: { request: any; onClick: () => void }) {
    const s = ({
        ACTIVE:   { label: "פעיל",         cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
        MATCHED:  { label: "נמצאה התאמה", cls: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
        ARCHIVED: { label: "ארכיון",       cls: "text-gray-400 border-gray-600 bg-gray-700/30" },
    } as any)[request.status] ?? { label: request.status, cls: "text-gray-400 border-gray-600 bg-gray-700/30" };

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-right bg-gray-900/50 border border-cyan-500/20 rounded-2xl p-4 flex gap-3 hover:border-cyan-400/50 hover:bg-gray-900/70 transition-all cursor-pointer"
            dir="rtl"
        >
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-sm text-right line-clamp-2">{request.query}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${s.cls}`}>{s.label}</span>
                </div>
                <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(request.createdAt).toLocaleDateString("he-IL")}
                    <span className="text-cyan-500/60 mx-1">· Radar</span>
                    <span className="text-gray-600">· לחץ לפרטים</span>
                </div>
            </div>
        </button>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MyListingsPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"seller" | "buyer">("seller");
    const [allListings, setAllListings] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState<any>(null);
    const [detailListing, setDetailListing] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareData, setShareData] = useState({ url: "", title: "" });
    const [createOpen, setCreateOpen] = useState(false);
    const [detailRequest, setDetailRequest] = useState<any>(null);
    const [isDeletingReq, setIsDeletingReq] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        const [lr, rr] = await Promise.all([getMyListings(), getMyRequests()]);
        if (lr.success) setAllListings(lr.listings ?? []);
        if (rr.success) setRequests(rr.requests ?? []);
        setLoading(false);
    };
    useEffect(() => { fetchAll(); }, []);

    const sellers = allListings.filter(l => l.listingType === "SELL" || !l.listingType);
    const buyers  = allListings.filter(l => l.listingType === "BUY");

    const openDetail  = (l: any) => setDetailListing(l);
    const closeDetail = () => setDetailListing(null);

    const handleEdit = (l: any) => {
        closeDetail();
        setEditingListing(prepareForEdit(l));
    };
    const handleDelete = async (id: string) => {
        if (!confirm("האם אתה בטוח שברצונך למחוק את המודעה?")) return;
        setIsDeleting(id);
        const res = await deleteListing(id);
        if (res.success) { setAllListings(p => p.filter(l => l.id !== id)); toast.success("המודעה הוסרה"); }
        else toast.error("שגיאה במחיקה");
        setIsDeleting(null);
    };
    const handleDeleteRequest = async (id: string) => {
        if (!confirm("האם אתה בטוח שברצונך למחוק את החיפוש השמור?")) return;
        setIsDeletingReq(id);
        const res = await deleteRequest(id);
        if (res.success) { setRequests(p => p.filter(r => r.id !== id)); toast.success("החיפוש השמור הוסר"); setDetailRequest(null); }
        else toast.error("שגיאה במחיקה");
        setIsDeletingReq(null);
    };

    const handleUpdateRequest = async (id: string, query: string, extraData?: any) => {
        const res = await updateRequest(id, { query, extraData: extraData ? JSON.stringify(extraData) : undefined });
        if (res.success) {
            setRequests(p => p.map(r => r.id === id ? { ...r, query, extraData: extraData ? JSON.stringify(extraData) : r.extraData } : r));
            setDetailRequest((prev: any) => prev ? { ...prev, query, extraData: extraData ? JSON.stringify(extraData) : prev.extraData } : null);
            toast.success("החיפוש עודכן ✓");
        } else {
            toast.error("שגיאה בעדכון");
        }
    };

    const handleShare = (id: string, title: string) => {
        setShareData({ url: `https://qlikndeal.vercel.app/listing/${id}`, title });
        setShareOpen(true);
    };
    const handleEditDone = () => {
        setEditingListing(null);
        fetchAll();
        toast.success("המודעה עודכנה ✓");
    };

    // ── EDIT MODE ───────────────────────────────────────────────────────────────
    if (editingListing) return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setEditingListing(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-colors">
                        <ArrowRight className="w-4 h-4" />חזור למודעות שלי
                    </button>
                    <div className="w-px h-6 bg-white/10" />
                    <h1 className="text-xl font-bold text-white">
                        עריכת מודעה: <span className="text-emerald-400">{editingListing.title}</span>
                    </h1>
                </div>
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-4">
                    <DynamicListingForm
                        initialData={editingListing}
                        onComplete={handleEditDone}
                        onCancel={() => setEditingListing(null)}
                        isEditing
                        listingId={editingListing.id}
                        initialListingType={editingListing.listingType ?? "SELL"}
                        initialCategory={
                            editingListing.category === "Computers" ? "LAPTOPS" :
                            ["PHONES", "MOBILE"].includes(editingListing.category?.toUpperCase()) ? "SMARTPHONES" :
                            "GENERAL"
                        }
                    />
                </div>
            </div>
        </div>
    );

    // ── MAIN ────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
            <Navbar />

            {/* ── Detail Modal ── */}
            {detailListing && (
                <ListingDetailModal
                    key={detailListing?.id}
                    listing={detailListing}
                    onClose={closeDetail}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onShare={handleShare}
                    isDeleting={isDeleting}
                />
            )}

            {/* Radar Request Detail Modal */}
            {detailRequest && (
                <RadarDetailModal
                    key={detailRequest?.id}
                    request={detailRequest}
                    onClose={() => setDetailRequest(null)}
                    onDelete={handleDeleteRequest}
                    onUpdate={handleUpdateRequest}
                    isDeleting={isDeletingReq}
                />
            )}

            {/* ── Create Modal ── */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl p-0 overflow-hidden" dir="rtl">
                    <div className="p-6 text-center border-b border-gray-800">
                        <DialogTitle className="text-2xl font-bold">
                            {tab === "seller" ? "פרסם כמוכר" : "פרסם כקונה"}
                        </DialogTitle>
                        <p className="text-gray-400 mt-2">בחר את הדרך הנוחה לך ביותר</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 p-6">
                        <Link href={`/dashboard/marketplace/create-ai?listingType=${tab === "buyer" ? "BUY" : "SELL"}`}
                            onClick={() => setCreateOpen(false)}
                            className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500 transition-all">
                            <div className="absolute top-3 right-3 bg-indigo-500 text-xs px-2 py-1 rounded-full font-bold animate-pulse">מומלץ ✨</div>
                            <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">יצירה חכמה עם AI</h3>
                            <p className="text-sm text-gray-400 text-center">ספר לנו במילים פשוטות — ה-AI יבנה מודעה מושלמת.</p>
                        </Link>
                        <Link href={`/dashboard/marketplace/create?listingType=${tab === "buyer" ? "BUY" : "SELL"}`}
                            onClick={() => setCreateOpen(false)}
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600 transition-all">
                            <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">יצירה ידנית</h3>
                            <p className="text-sm text-gray-400 text-center">מילוי ידני מלא לכל הקטגוריות.</p>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
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

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            האיזור האישי שלי
                        </h1>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}
                        className={tab === "seller" ? "bg-purple-600 hover:bg-purple-700 gap-2" : "bg-cyan-700 hover:bg-cyan-600 gap-2"}>
                        <Plus className="w-4 h-4" />
                        {tab === "seller" ? "מודעת מכירה חדשה" : "בקשת קנייה חדשה"}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 p-1 bg-gray-900/80 rounded-2xl border border-gray-800 w-fit">
                    {([["seller", Tag, "אני מוכר", sellers.length, "from-purple-600 to-indigo-600 shadow-purple-500/20"],
                       ["buyer",  Search, "אני קונה", buyers.length + requests.length, "from-cyan-600 to-teal-600 shadow-cyan-500/20"]] as any[]).map(
                        ([id, Icon, label, count, grad]) => (
                            <button key={id} onClick={() => setTab(id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                                    tab === id ? `bg-gradient-to-r ${grad} text-white shadow-lg` : "text-gray-400 hover:text-white"
                                }`}>
                                <Icon className="w-4 h-4" />
                                {label}
                                {count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === id ? "bg-white/20" : "bg-gray-700 text-gray-400"}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        )
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>
                ) : tab === "seller" ? (
                    sellers.length === 0 ? (
                        <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                            <Tag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">עדיין לא פרסמת מודעות מכירה</h3>
                            <p className="text-gray-400 mb-6">פרסם את המוצר שלך ומצא קונה!</p>
                            <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 hover:bg-purple-700">פרסם מודעת מכירה</Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-600 mb-1">לחץ על מודעה לפרטים מלאים ↓</p>
                            {sellers.map(l => <ListingRow key={l.id} listing={l} onClick={() => openDetail(l)} />)}
                        </div>
                    )
                ) : (
                    buyers.length === 0 && requests.length === 0 ? (
                        <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-cyan-900/30">
                            <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">עדיין לא פרסמת בקשות קנייה</h3>
                            <p className="text-gray-400 mb-6">פרסם מה אתה מחפש ומוכרים ייצרו איתך קשר!</p>
                            <Button onClick={() => setCreateOpen(true)} className="bg-cyan-700 hover:bg-cyan-600">פרסם בקשת קנייה</Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {buyers.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ShoppingBag className="w-3.5 h-3.5 text-cyan-500" />
                                        מודעות קנייה שפרסמתי ({buyers.length})
                                        <span className="normal-case font-normal text-gray-600">· לחץ לפרטים מלאים</span>
                                    </p>
                                    <div className="space-y-3">
                                        {buyers.map(l => <ListingRow key={l.id} listing={l} onClick={() => openDetail(l)} />)}
                                    </div>
                                </div>
                            )}
                            {requests.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Search className="w-3.5 h-3.5 text-cyan-500" />
                                        חיפושים שמורים — Radar ({requests.length})
                                    </p>
                                    <div className="space-y-3">
                                        {requests.map(r => <BuyerRequestCard key={r.id} request={r} onClick={() => setDetailRequest(r)} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>

            <ShareModal
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                url={shareData.url}
                title={`Qlikndeal - ${shareData.title}`}
                text={`כנסו לראות את ${shareData.title} ב-Qlikndeal! המקום הבטוח לקנות ולמכור.`}
            />
        </div>
    );
}
