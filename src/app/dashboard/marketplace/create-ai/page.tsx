"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SmartListingInput } from "@/components/marketplace/SmartListingInput";
import { ArrowRight, X, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreateAiPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/marketplace/analyze", {
                method: "POST",
                body: JSON.stringify({ text }),
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();

            // Store result in localStorage
            console.log("Saving draft to localStorage:", data);
            localStorage.setItem("smartListingDraft", JSON.stringify(data));

            router.push("/dashboard/marketplace/create?mode=smart");

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("משהו השתבש בעיבוד הנתונים. נסה שוב.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation / Close Button */}
            <Link
                href="/dashboard/marketplace"
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-gray-300 hover:text-white z-50 backdrop-blur-md border border-white/10"
                title="סגור וחזור ללוח"
            >
                <X size={24} />
            </Link>

            <div className="max-w-3xl w-full relative z-10">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-4 animate-pulse">
                        <Sparkles size={14} />
                        <span>AI Powered Listing</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight drop-shadow-2xl">
                        מה תרצה למכור היום?
                    </h1>
                    <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
                        ספר לנו על המוצר במילים שלך, וה-AI שלנו יהפוך אותו למודעה מושלמת תוך שניות.
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-1 shadow-2xl border border-white/10 ring-1 ring-white/5">
                    <div className="bg-slate-950/80 rounded-[22px] p-6 md:p-10">
                        <SmartListingInput
                            onAnalyze={handleAnalyze}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
