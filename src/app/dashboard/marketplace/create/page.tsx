"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { DynamicListingForm } from "@/components/marketplace/DynamicListingForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function CreateListingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mode = searchParams.get("mode");
    const listingTypeParam = (searchParams.get("listingType") || "SELL") as "SELL" | "BUY";
    const [initialSmartData, setInitialSmartData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isComputer, setIsComputer] = useState(false);
    const [manualCategory, setManualCategory] = useState<string | null>(null);
    const [desktopModalOpen, setDesktopModalOpen] = useState(false);

    useEffect(() => {
        if (mode === "smart") {
            const draft = localStorage.getItem("smartListingDraft");
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    setInitialSmartData(parsed);
                    
                    const cat = parsed.category?.toUpperCase() || "";
                    // רשימת קטגוריות שנחשבות "מחשב" כדי להפעיל את הטופס המפורט
                    const computerCats = ["COMPUTERS", "LAPTOPS", "DESKTOPS", "מחשבים"];
                    
                    if (computerCats.includes(cat)) {
                        setIsComputer(true);
                    }
                } catch (e) {
                    console.error("Failed to parse smart draft", e);
                }
            }
        }
        setIsLoaded(true);
    }, [mode]);

    if (!isLoaded) return <div className="min-h-screen bg-black text-white flex items-center justify-center italic">טוען...</div>;

    // --- שלב א': מסך הכרטיסיות (מופיע רק ביצירה ידנית) ---
    if (mode !== "smart" && !manualCategory) {
        return (
            <main className="min-h-screen bg-[#05050A] text-white pb-20" dir="rtl">
                <Navbar />
                <div className="container mx-auto px-4 pt-12 max-w-3xl flex flex-col items-center">
                    <div className="text-center mb-10">
                        <div className="flex gap-4 items-center justify-center mb-6 text-sm flex-wrap text-center">
                            <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors font-bold">
                                <ArrowRight className="w-4 h-4 ml-1.5" />
                                חזרה למרקטפלייס
                            </Link>
                            <span className="text-gray-700">|</span>
                            <button onClick={() => router.back()} className="inline-flex items-center text-gray-400 hover:text-gray-300 transition-colors font-bold">
                                חזור שלב אחורה
                            </button>
                        </div>
                        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            מה ברצונך להוסיף?
                        </h1>
                        <p className="text-gray-400 text-sm">בחר קטגוריה לחוויה הטובה ביותר</p>
                    </div>

                    <div className="w-full space-y-4">
                        
                        {/* 1. כרטיסיית מחשב */}
                        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#110e1f] to-[#0b0c16] border border-purple-500/20 shadow-2xl overflow-hidden hover:border-purple-500/40 transition-all">
                            <div className="absolute top-4 right-4 bg-indigo-600/20 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-indigo-500/20">
                                מנוע חיפוש חכם <span className="text-yellow-400 animate-pulse">✦</span>
                            </div>
                            
                            <div className="flex flex-col items-center mb-6 pt-4">
                                <span className="text-4xl mb-2 grayscale opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">💻</span>
                                <h2 className="text-2xl font-bold text-white">מחשב</h2>
                                <p className="text-gray-500 text-xs mt-1">בחר סוג מחשב:</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setDesktopModalOpen(true)} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#1a1b30]/50 border border-blue-500/10 hover:border-blue-500/40 hover:bg-[#1a1b30] transition-all group">
                                    <span className="text-3xl group-hover:scale-110 transition-transform">🖥️</span>
                                    <div className="text-center">
                                        <div className="font-bold text-sm text-white">מחשב נייח</div>
                                        <div className="text-[10px] text-gray-500 mt-1">Desktop / All-in-One</div>
                                    </div>
                                </button>
                                <button onClick={() => setManualCategory("laptop")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#1a1b30]/50 border border-purple-500/10 hover:border-purple-500/40 hover:bg-[#1a1b30] transition-all group">
                                    <span className="text-3xl group-hover:scale-110 transition-transform">💻</span>
                                    <div className="text-center">
                                        <div className="font-bold text-sm text-white">מחשב נייד</div>
                                        <div className="text-[10px] text-gray-500 mt-1">Laptop / Gaming</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 2. כרטיסיית סלולר */}
                        <button onClick={() => setManualCategory("Phones")} className="w-full p-6 pb-8 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070b14] border border-blue-500/20 shadow-xl hover:border-blue-500/40 transition-all text-center relative group">
                            <div className="absolute top-4 right-4 bg-blue-600/20 text-blue-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-500/20">
                                מנוע חיפוש חכם <span className="text-yellow-400">✦</span>
                            </div>
                            
                            <div className="flex flex-col items-center mt-2">
                                <span className="text-4xl mb-3 grayscale opacity-80 group-hover:scale-110 transition-transform">📱</span>
                                <h2 className="text-2xl font-bold text-white mb-2">סמארטפון / סלולר</h2>
                                <p className="text-gray-400 text-xs">Smartphones / Tablets / Smartwatches</p>
                                <p className="text-blue-500/60 text-[10px] mt-3 tracking-widest">בחר יצרן ⬅ דגם ⬅ מפרט ⬅ פרסם</p>
                            </div>
                        </button>

                        {/* 3. כרטיסיית כללי */}
                        <button onClick={() => setManualCategory("General")} className="w-full p-5 rounded-2xl bg-[#0d0e12] border border-gray-800 shadow-xl hover:border-gray-600 transition-all flex items-center justify-between group">
                            <div className="text-right">
                                <p className="text-gray-500 text-[10px] mb-1">רכב, טלפון, ריהוט, אלקטרוניקה ועוד</p>
                                <h2 className="text-xl font-bold text-gray-200">מוצר כללי</h2>
                                <div className="flex gap-2 mt-2">
                                    <span className="bg-gray-900 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-gray-800">🚗 רכב</span>
                                    <span className="bg-gray-900 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-gray-800">🛋️ ריהוט</span>
                                    <span className="bg-gray-900 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-gray-800">📻 אלקטרוניקה</span>
                                </div>
                            </div>
                            <span className="text-4xl opacity-50 grayscale group-hover:scale-110 transition-transform">📦</span>
                        </button>

                    </div>
                </div>

                {/* מודאל "סוג מחשב נייח" */}
                {desktopModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#0b101e] border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-in fade-in zoom-in duration-200">
                            
                            {/* Header */}
                            <div className="bg-[#111626] border-b border-slate-800 p-4 flex items-center justify-between">
                                <button onClick={() => setDesktopModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                                    ✕
                                </button>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-blue-400">🖥️</span> פרסם מחשב נייח
                                </h3>
                                <span className="text-xs text-slate-500 mx-2">— מנה קטגוריה</span>
                            </div>
                            
                            {/* Content */}
                            <div className="p-8 pb-12">
                                <div className="text-center text-slate-300 font-bold mb-6 text-xl">סוג מחשב נייח (Desktop)</div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button onClick={() => { setManualCategory("desktop"); setDesktopModalOpen(false); }} className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-[#141b2d] border border-slate-700 hover:border-blue-500 hover:bg-[#1a233a] transition-all text-center group">
                                        <div className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">מחשב מותג</div>
                                        <div className="text-xs text-slate-500">Dell OptiPlex, HP ProDesk<br/>וכדומה</div>
                                    </button>
                                    <button onClick={() => { setManualCategory("aio"); setDesktopModalOpen(false); }} className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-[#141b2d] border border-slate-700 hover:border-purple-500 hover:bg-[#1a233a] transition-all text-center group">
                                        <div className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">All-in-One</div>
                                        <div className="text-xs text-slate-500">iMac, HP Pavilion AiO<br/>וכדומה</div>
                                    </button>
                                    <button onClick={() => { setManualCategory("custom"); setDesktopModalOpen(false); }} className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-[#141b2d] border border-slate-700 hover:border-emerald-500 hover:bg-[#1a233a] transition-all text-center group">
                                        <div className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">בנייה עצמית /<br/>גיימינג</div>
                                        <div className="text-xs text-slate-500">בחירת רכיבים מפורטת</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        );
    }


    // --- שלב ב': בחירת הטופס הנכון ---
    const isComputerForm = isComputer || ["laptop", "desktop", "aio", "custom"].includes(manualCategory as string);

    return (
        <main className="min-h-screen bg-[#05050A] text-white pb-20" dir="rtl">
            <Navbar />
            <div className="container mx-auto px-4 pt-8">
                <div className="max-w-3xl mx-auto">
                    
                    {/* כפתור חזרה לבחירת קטגוריה */}
                    <div className="mb-6">
                        <button 
                            onClick={() => {
                                if (mode === "smart") {
                                    window.history.back(); // חזרה מהמוד החכם
                                } else {
                                    setManualCategory(null); // איפוס הקטגוריה שנבחרה
                                }
                            }}
                            className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors text-sm bg-gray-900/50 hover:bg-gray-800 px-4 py-2 rounded-lg border border-gray-800"
                        >
                            <span className="text-lg leading-none">←</span> 
                            {mode === "smart" ? "חזרה למרקטפלייס" : "חזרה לבחירת קטגוריה"}
                        </button>
                    </div>

                    {isComputerForm ? (
                        <DynamicListingForm 
                            initialData={initialSmartData}
                            initialListingType={listingTypeParam}
                            initialCategory={
                                manualCategory === "desktop" ? "DESKTOPS" :
                                manualCategory === "aio" ? "AIO" :
                                manualCategory === "custom" ? "CUSTOM_COMPUTERS" :
                                "LAPTOPS"
                            }
                            onComplete={() => router.push("/dashboard/marketplace/my-listings")}
                        />
                    ) : (
                        <DynamicListingForm 
                            initialData={initialSmartData} 
                            initialListingType={listingTypeParam}
                            initialCategory={manualCategory === "Phones" ? "SMARTPHONES" : "GENERAL"}
                            onComplete={() => router.push("/dashboard/marketplace/my-listings")}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}

export default function CreateListingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">טוען...</div>}>
            <CreateListingContent />
        </Suspense>
    );
}