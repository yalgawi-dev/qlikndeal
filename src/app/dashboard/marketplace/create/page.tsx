"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateListingPage() {
    const searchParams = useSearchParams();

    const mode = searchParams.get("mode");
    const [initialSmartData, setInitialSmartData] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        console.log("CreateListingPage mounted, mode:", mode);
        if (mode === "smart") {
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
    }, [mode]);

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
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />
            <div className="container mx-auto px-4 pt-8">
                <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 relative flex items-center justify-center">
                        <h1 className="text-2xl font-bold text-center">
                            {mode === "smart" ? "עריכת מודעה חכמה" : "יצירת מודעה חדשה"}
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
