"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Navbar } from "@/components/Navbar";

function CreateListingContent() {
    const searchParams = useSearchParams();

    // Store mode in state so URL cleanup doesn't lose it
    const [mode, setMode] = useState<string | null>(null);
    const [isSmartMode, setIsSmartMode] = useState(false);
    const [initialSmartData, setInitialSmartData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Capture mode ONCE before URL cleanup removes it
        const m = searchParams.get("mode");
        if (m) {
            setMode(m);
            setIsSmartMode(m === "smart");
        }
        if (m === "smart") {
            const draft = localStorage.getItem("smartListingDraft");
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed && typeof parsed === 'object') {
                        setInitialSmartData(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse smart draft", e);
                }
            }
        }
        setIsLoaded(true);
    }, [searchParams]);

    // Extract shared data (legacy/query param based)
    const title = searchParams.get("title") || "";
    const text = searchParams.get("text") || "";
    const url = searchParams.get("url") || "";
    const imagesParam = searchParams.get("images");

    let images: string[] = [];
    if (imagesParam) {
        try {
            images = JSON.parse(imagesParam);
        } catch (e) { }
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
    );
}

export default function CreateListingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
            <CreateListingContent />
        </Suspense>
    );
}
