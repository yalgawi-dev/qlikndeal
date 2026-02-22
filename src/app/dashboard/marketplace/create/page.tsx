"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Suspense } from "react";

function CreateListingContent() {
    const searchParams = useSearchParams();
    const { user } = useUser();

    // Store mode in state so URL cleanup doesn't lose it
    const [mode, setMode] = useState<string | null>(null);
    const [isSmartMode, setIsSmartMode] = useState(false);
    const [initialSmartData, setInitialSmartData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [testerNote, setTesterNote] = useState("");
    const [testerImageBase64, setTesterImageBase64] = useState<string | null>(null);

    const submitNote = async () => {
        const logId = localStorage.getItem("currentParserLogId");
        if (!testerNote.trim() && !testerImageBase64) return;

        const testerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'אורח' : 'אורח';

        await fetch("/api/parser-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: logId || "unknown",
                testerNote: testerNote.trim(),
                testerImage: testerImageBase64,
                testerName
            }),
        });
        setTesterNote("");
        setTesterImageBase64(null);
        setShowNoteModal(false);
        alert("תודה! ההערה נשמרה ✓");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setTesterImageBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        // Capture mode ONCE before URL cleanup removes it
        const m = searchParams.get("mode");
        if (m) {
            setMode(m);
            setIsSmartMode(m === "smart");
        }
        console.log("CreateListingPage mounted, mode:", m);
        if (m === "smart") {
            const draft = localStorage.getItem("smartListingDraft");
            console.log("Found draft in localStorage:", draft ? "Yes" : "No");

            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    console.log("Parsed draft data:", parsed);

                    if (parsed && typeof parsed === 'object') {
                        setInitialSmartData(parsed);
                        // Clear draft after use to prevent stale data on future loads? 
                        // localStorage.removeItem("smartListingDraft"); 
                    }
                } catch (e) {
                    console.error("Failed to parse smart draft", e);
                }
            }
        }
        setIsLoaded(true);
    }, [mode, searchParams]);

    // Force re-render if initialSmartData changes
    useEffect(() => {
        if (initialSmartData) {
            console.log("Setting initialSmartData for form:", initialSmartData);
        }
    }, [initialSmartData]);

    // Extract shared data (legacy/query param based)
    const title = searchParams.get("title") || "";
    const text = searchParams.get("text") || "";
    const url = searchParams.get("url") || "";
    const imagesParam = searchParams.get("images");

    let images: string[] = [];
    if (imagesParam) {
        try {
            images = JSON.parse(imagesParam);
        } catch (e) {
            console.error("Failed to parse images param", e);
        }
    }

    // Clean up URL to prevent 431 Request Header Fields Too Large error on Server Actions
    useEffect(() => {
        if (searchParams.toString().length > 0) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    const sharedData = {
        title: title,
        description: text + (url ? `\n\nSource: ${url}` : ""),
        images: images,
        magicText: text || url || ""
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-black text-white pb-20">
                <Navbar />
                <div className="container mx-auto px-4 pt-8">
                    <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 relative flex items-center justify-center">
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

                        {/* Tester feedback banner — only shown when testerName is set */}
                        {isSmartMode && typeof window !== "undefined" && localStorage.getItem("testerName") && (
                            <div className="mx-6 mt-4 flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-400 text-lg">🧪</span>
                                    <div>
                                        <p className="text-amber-300 text-sm font-semibold">מצב בדיקה — {localStorage.getItem("testerName")}</p>
                                        <p className="text-amber-400/70 text-xs">בדוק את השדות שמילא ה-AI ותקן אם צריך</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowNoteModal(true)}
                                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    הוסף הערה
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            <ListingForm
                                key={initialSmartData ? 'smart-loaded' : 'default'}
                                onComplete={() => window.location.href = "/dashboard/marketplace"}
                                onCancel={() => window.location.href = "/dashboard/marketplace"}
                                initialData={initialSmartData || sharedData}
                                initialMagicText={!initialSmartData ? sharedData.magicText : undefined}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Note panel — small floating panel, doesn't block the form */}
            {showNoteModal && (
                <div
                    className="fixed bottom-6 left-6 z-50 w-80 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/60"
                    dir="rtl"
                >
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <span className="text-sm font-bold text-amber-400">💬 הערה לבודק</span>
                        <button
                            onClick={() => setShowNoteModal(false)}
                            className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Panel body */}
                    <div className="p-4">
                        <p className="text-xs text-gray-500 mb-3">מה לא היה מדויק? כתוב בזמן שאתה ממלא את הטופס 👇</p>
                        <textarea
                            value={testerNote}
                            onChange={e => setTesterNote(e.target.value)}
                            placeholder="לדוגמה: מחיר יצא 0, לא זיהה שהוא כמו חדש, כינוי שגוי..."
                            rows={4}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/40 resize-none mb-3"
                            autoFocus
                        />

                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-2">📸 צרף צילום מסך (אופציונלי):</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-xs text-slate-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-xs file:font-semibold
                                  file:bg-amber-500/10 file:text-amber-400
                                  hover:file:bg-amber-500/20"
                            />
                            {testerImageBase64 && (
                                <img src={testerImageBase64} alt="Preview" className="mt-2 max-h-32 rounded border border-white/10 object-contain" />
                            )}
                        </div>
                        <button
                            onClick={submitNote}
                            disabled={!testerNote.trim() && !testerImageBase64}
                            className="w-full mt-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-sm transition-all"
                        >
                            שמור הערה ✓
                        </button>
                    </div>
                </div>
            )}
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
