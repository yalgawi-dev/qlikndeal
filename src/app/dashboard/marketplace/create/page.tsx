"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { ComputerListingForm } from "@/components/marketplace/ComputerListingForm";
import { MobileListingForm } from "@/components/marketplace/MobileListingForm";
import { Navbar } from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, Camera, Monitor, Car, Smartphone, Package } from "lucide-react";
import html2canvas from "html2canvas";
import Image from "next/image";

type CategoryMode = "select" | "computer" | "laptop" | "desktop" | "mobile" | "general";

const CATEGORY_CARDS = [
    {
        id: "computer" as CategoryMode,
        icon: "💻",
        label: "מחשב",
        sublabel: "Laptop / Desktop / Gaming",
        color: "from-purple-600/20 to-blue-600/20 border-purple-500/40",
        hoverColor: "hover:from-purple-600/30 hover:to-blue-600/30 hover:border-purple-400/60",
    },
    {
        id: "general" as CategoryMode,
        icon: "📦",
        label: "מוצר כללי",
        sublabel: "רכב, טלפון, ריהוט ועוד",
        color: "from-gray-800/50 to-gray-800/30 border-gray-700",
        hoverColor: "hover:from-gray-700/50 hover:border-gray-600",
    },
];

function CreateListingContent() {
    const searchParams = useSearchParams();

    const [mode, setMode] = useState<string | null>(null);
    const [isSmartMode, setIsSmartMode] = useState(false);
    const [initialSmartData, setInitialSmartData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [categoryMode, setCategoryMode] = useState<CategoryMode>("select");

    const { user } = useUser();
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [testerNote, setTesterNote] = useState("");
    const [testerImageBase64, setTesterImageBase64] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const [noteWindowPos, setNoteWindowPos] = useState({ x: -1, y: -1 });
    const noteWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showNoteModal && noteWindowPos.x === -1 && typeof window !== 'undefined') {
            setNoteWindowPos({ x: Math.max(20, window.innerWidth - 450), y: Math.max(20, window.innerHeight - 500) });
        }
    }, [showNoteModal, noteWindowPos.x]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.closest('button')) return;

        const el = noteWindowRef.current;
        if (!el) return;

        el.setPointerCapture(e.pointerId);

        const startX = e.clientX - noteWindowPos.x;
        const startY = e.clientY - noteWindowPos.y;

        const onPointerMove = (moveEvent: PointerEvent) => {
            setNoteWindowPos({
                x: moveEvent.clientX - startX,
                y: moveEvent.clientY - startY
            });
        };

        const onPointerUp = (upEvent: PointerEvent) => {
            el.releasePointerCapture(upEvent.pointerId);
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerup', onPointerUp);
        };

        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
    };

    useEffect(() => {
        const m = searchParams.get("mode");
        const cat = searchParams.get("category");

        if (m) {
            setMode(m);
            setIsSmartMode(m === "smart");
        }

        // If category=computer in URL, jump directly to computer mode
        if (cat === "computer") {
            setCategoryMode("computer");
        } else if (cat === "laptop") {
            setCategoryMode("laptop");
        } else if (cat === "desktop") {
            setCategoryMode("desktop");
        } else if (cat === "general" || m === "smart") {
            setCategoryMode("general");
        }

        if (m === "smart") {
            const draft = localStorage.getItem("smartListingDraft");
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed && typeof parsed === 'object') {
                        setInitialSmartData(parsed);
                        // If AI detected Computers, auto set category
                        if (parsed.category === "Computers") {
                            setCategoryMode("laptop"); // default to laptop for AI
                        } else {
                            setCategoryMode("general");
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse smart draft", e);
                }
            }
        }
        setIsLoaded(true);
    }, [searchParams]);

    const title = searchParams.get("title") || "";
    const text = searchParams.get("text") || "";
    const url = searchParams.get("url") || "";
    const imagesParam = searchParams.get("images");

    let images: string[] = [];
    if (imagesParam) {
        try { images = JSON.parse(imagesParam); } catch (e) { }
    }

    const sharedData = {
        title,
        description: text + (url ? `\n\nSource: ${url}` : ""),
        images,
        magicText: text || url || ""
    };

    const submitNote = async () => {
        const logId = localStorage.getItem("currentParserLogId");
        if (logId && (testerNote.trim() || testerImageBase64)) {
            const currentUserName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown";
            await fetch("/api/parser-log", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: logId,
                    testerNote: testerNote.trim(),
                    testerImage: testerImageBase64,
                    testerName: currentUserName
                }),
            });
        }
        setTesterNote("");
        setTesterImageBase64(null);
        setShowNoteModal(false);
        alert("תודה! ההערה נשמרה ✓");
    };

    const captureScreenshot = async () => {
        setIsCapturing(true);
        try {
            const modalElement = document.getElementById("ai-note-modal-container");
            if (modalElement) modalElement.style.display = 'none';
            await new Promise(resolve => setTimeout(resolve, 50));
            const canvas = await html2canvas(document.body, { useCORS: true, allowTaint: true, windowWidth: document.documentElement.scrollWidth, windowHeight: document.documentElement.scrollHeight });
            const base64Image = canvas.toDataURL('image/jpeg', 0.6);
            setTesterImageBase64(base64Image);
            if (modalElement) modalElement.style.display = 'flex';
        } catch (error) {
            console.error("Screenshot failed:", error);
            alert("צילום המסך נכשל.");
        } finally {
            setIsCapturing(false);
        }
    };

    useEffect(() => {
        if (searchParams.toString().length > 0) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // ==========================================
    // CATEGORY SELECTION SCREEN
    // ==========================================
    if (categoryMode === "select") {
        return (
            <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
                <Navbar />
                <div className="container mx-auto px-4 pt-8">
                    <div className="max-w-lg mx-auto">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <a
                                href="/dashboard/marketplace"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors"
                            >
                                ← חזרה לשוק
                            </a>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                מה ברצונך להוסיף?
                            </h1>
                            <p className="text-gray-500 mt-2">בחר קטגוריה לחוויה הטובה ביותר</p>
                        </div>

                        {/* Category cards */}
                        <div className="space-y-4">
                            {/* Computer card - featured */}
                            <div className={`w-full bg-gradient-to-r ${CATEGORY_CARDS[0].color} ${CATEGORY_CARDS[0].hoverColor} border rounded-2xl p-6 transition-all duration-200`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                            <span className="text-xl">✨</span>
                                        </div>
                                        <span className="text-xs bg-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full font-medium">מנוע חיפוש חכם</span>
                                    </div>
                                    <div className="text-4xl">💻</div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-xl font-bold text-white">מחשב</div>
                                    <div className="text-gray-400 text-sm mt-1">בחר סוג מחשב:</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setCategoryMode("laptop")}
                                        className="flex flex-col items-center gap-2 py-3 px-4 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 hover:border-purple-400/60 transition-all group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">💻</span>
                                        <span className="text-sm font-bold text-white">מחשב נייד</span>
                                        <span className="text-xs text-purple-300">Laptop / Gaming</span>
                                    </button>
                                    <button
                                        onClick={() => setCategoryMode("desktop")}
                                        className="flex flex-col items-center gap-2 py-3 px-4 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 hover:border-blue-400/60 transition-all group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">🖥️</span>
                                        <span className="text-sm font-bold text-white">מחשב נייח</span>
                                        <span className="text-xs text-blue-300">Desktop / All-in-One</span>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile card - featured */}
                            <button
                                onClick={() => setCategoryMode("mobile")}
                                className={`w-full text-right bg-gradient-to-r from-blue-900/30 to-indigo-900/30 hover:from-blue-800/40 hover:to-indigo-800/40 border border-blue-500/20 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.01] group`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="text-xl">✨</span>
                                        </div>
                                        <span className="text-xs bg-blue-500/30 text-blue-300 px-2.5 py-1 rounded-full font-medium">מנוע סלולר חכם</span>
                                    </div>
                                    <div>
                                        <div className="text-4xl mb-1">📱</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-xl font-bold text-white">סמארטפון / סלולר</div>
                                    <div className="text-gray-400 text-sm mt-1">Smartphones / Tablets / Smartwatches</div>
                                    <div className="text-xs text-blue-400 mt-3 flex items-center gap-1">
                                        <span>בחר יצרן ← דגם ← מפרט ← פרסם</span>
                                    </div>
                                </div>
                            </button>

                            {/* General card */}
                            <button
                                onClick={() => setCategoryMode("general")}
                                className={`w-full text-right bg-gradient-to-r ${CATEGORY_CARDS[1].color} ${CATEGORY_CARDS[1].hoverColor} border rounded-2xl p-6 transition-all duration-200 hover:scale-[1.01]`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-400 text-sm">רכב, טלפון, ריהוט, אלקטרוניקה ועוד</div>
                                    <div className="text-4xl">📦</div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-xl font-bold text-white">מוצר כללי</div>
                                    <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                                        {["🚗 רכב", "📱 טלפון", "🛋️ ריהוט", "📡 אלקטרוניקה"].map(c => (
                                            <span key={c} className="bg-gray-800 px-2 py-0.5 rounded-full">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // COMPUTER FORM (Laptop)
    // ==========================================
    if (categoryMode === "laptop" || categoryMode === "desktop" || categoryMode === "computer") {
        const isDesktop = categoryMode === "desktop";
        return (
            <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
                <Navbar />
                <div className="container mx-auto px-4 pt-8">
                    <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 relative">
                            <button
                                onClick={() => setCategoryMode("select")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm transition-colors"
                            >
                                ← שנה קטגוריה
                            </button>
                            <h1 className="text-xl font-bold text-center text-white flex items-center justify-center gap-2">
                                {isDesktop ? "🖥️" : "💻"} פרסם מחשב {isDesktop ? "נייח" : "נייד"}
                            </h1>
                            <a
                                href="/dashboard/marketplace"
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-white"
                                title="ביטול וחזרה"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </a>
                        </div>

                        <div className="p-5">
                            <ComputerListingForm
                                onComplete={() => window.location.href = "/dashboard/marketplace/my-listings"}
                                onCancel={() => setCategoryMode("select")}
                                initialData={initialSmartData}
                            />
                        </div>
                    </div>
                </div>

                {/* Tester note button omitted in sub-forms for brevity or placed globally later */}
            </div>
        );
    }

    // ==========================================
    // MOBILE FORM
    // ==========================================
    if (categoryMode === "mobile") {
        return (
            <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
                <Navbar />
                <div className="container mx-auto px-4 pt-8">
                    <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 relative">
                            <button
                                onClick={() => setCategoryMode("select")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm transition-colors"
                            >
                                ← שנה קטגוריה
                            </button>
                            <h1 className="text-xl font-bold text-center text-white">
                                פרסם סלולר
                            </h1>
                            <a
                                href="/dashboard/marketplace"
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-white"
                                title="ביטול וחזרה"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </a>
                        </div>

                        <div className="p-5">
                            <MobileListingForm
                                onComplete={() => window.location.href = "/dashboard/marketplace/my-listings"}
                                onCancel={() => setCategoryMode("select")}
                                initialData={initialSmartData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // GENERAL FORM & GLOBAL ELEMENTS
    // ==========================================
    return (
        <>
            {/* The main General Form */}
            <div className="min-h-screen bg-black text-white pb-20">
                <Navbar />
                <div className="container mx-auto px-4 pt-8">
                    <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 relative flex items-center justify-center">
                            <button
                                onClick={() => setCategoryMode("select")}
                                className="absolute right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm transition-colors"
                            >
                                ← שנה קטגוריה
                            </button>
                            <h1 className="text-2xl font-bold text-center">
                                {isSmartMode ? "עריכת מודעה חכמה" : "יצירת מודעה חדשה"}
                            </h1>
                            <a
                                href="/dashboard/marketplace"
                                className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-white"
                                title="ביטול וחזרה"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </a>
                        </div>

                        <div className="p-6">
                            <ListingForm
                                key={initialSmartData ? 'smart-loaded' : 'default'}
                                onComplete={() => window.location.href = "/dashboard/marketplace/my-listings"}
                                onCancel={() => window.location.href = "/dashboard/marketplace"}
                                initialData={initialSmartData || sharedData}
                                initialMagicText={!initialSmartData ? sharedData.magicText : undefined}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowNoteModal(true)}
                    className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-sm font-medium backdrop-blur-md transition-all shadow-xl hover:scale-105"
                >
                    <MessageSquare className="w-4 h-4" />
                    הוסף הערה
                </button>

                {showNoteModal && (
                    <div
                        id="ai-note-modal-container"
                        ref={noteWindowRef}
                        onPointerDown={handlePointerDown}
                        style={{ left: noteWindowPos.x === -1 ? 'auto' : noteWindowPos.x, top: noteWindowPos.y === -1 ? 'auto' : noteWindowPos.y }}
                        className="fixed z-[100] bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl cursor-grab active:cursor-grabbing"
                        dir="rtl"
                    >
                        <h3 className="text-lg font-bold mb-1 pointer-events-none">💬 הוסף הערה לבודק</h3>
                        <p className="text-sm text-gray-400 mb-4 pointer-events-none">גרור את התיבה במידת הצורך. מה לא היה טוב בפענוח ה-AI?</p>
                        <textarea
                            value={testerNote}
                            onChange={(e) => setTesterNote(e.target.value)}
                            placeholder="כמה מילים על מה ה-AI פספס..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/40 resize-none min-h-[120px] mb-3"
                        />

                        <div className="mb-4">
                            <button
                                onClick={captureScreenshot}
                                disabled={isCapturing}
                                className="w-full mb-3 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-all"
                            >
                                {isCapturing ? "מצלם..." : <><Camera className="w-4 h-4" /> צלם את המסך הנוכחי</>}
                            </button>

                            {testerImageBase64 && (
                                <div className="mb-4 relative group">
                                    <button
                                        onClick={() => setTesterImageBase64(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        title="הסר תמונה"
                                    >×</button>
                                    <Image src={testerImageBase64} alt="Screenshot preview" width={400} height={300} className="rounded-lg border border-white/20 w-full object-cover max-h-32" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={submitNote}
                                disabled={!testerNote.trim() && !testerImageBase64}
                                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-sm transition-all"
                            >
                                שמור הערה ✓
                            </button>
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-sm transition-all"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function CreateListingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
            <CreateListingContent />
        </Suspense>
    );
}
