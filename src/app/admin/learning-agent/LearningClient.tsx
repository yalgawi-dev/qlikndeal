"use client";

import { useState } from "react";
import { addCapability, deleteCapability, deleteSearchLog, autoAnalyzeKeyword, fetchExternalKnowledge } from "../learning-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, BrainCircuit, Search, Activity } from "lucide-react";
import { toast } from "sonner";

export default function LearningClient({ initialMappings, initialLogs }: { initialMappings: any[], initialLogs: any[] }) {
    const [mappings, setMappings] = useState(initialMappings);
    const [logs, setLogs] = useState(initialLogs);
    
    // Form state for adding new mapping
    const [keyword, setKeyword] = useState("");
    const [minRam, setMinRam] = useState("");
    const [minCpuTier, setMinCpuTier] = useState("");
    const [minGpuTier, setMinGpuTier] = useState("");
    const [category, setCategory] = useState("Laptops");
    
    // Scraper Pulse State
    const [scrapeQuery, setScrapeQuery] = useState("");
    const [isScraping, setIsScraping] = useState(false);

    const handleAdd = async () => {
        if (!keyword) return toast.error("חובה להזין מילת מפתח");
        
        const data = {
            keyword,
            minRam: minRam ? parseInt(minRam) : null,
            minCpuTier: minCpuTier ? parseInt(minCpuTier) : null,
            minGpuTier: minGpuTier ? parseInt(minGpuTier) : null,
            category
        };
        
        await addCapability(data as any);
        toast.success("נוסף למאגר בהצלחה");
        
        // Optimistic UI update
        setMappings([...mappings.filter(m => m.keyword !== keyword), data].sort((a,b) => a.keyword.localeCompare(b.keyword)));
        
        setKeyword(""); setMinRam(""); setMinCpuTier(""); setMinGpuTier("");
    };

    const handleDeleteMapping = async (kw: string) => {
        await deleteCapability(kw);
        toast.success("נמחק מהמאגר");
        setMappings(mappings.filter(m => m.keyword !== kw));
    };

    const handleDeleteLog = async (id: string) => {
        await deleteSearchLog(id);
        toast.success("יומן החיפוש נמחק");
        setLogs(logs.filter(l => l.id !== id));
    };

    const handleMapLog = async (query: string, logId: string) => {
        const toastId = toast.loading("מפענח אוטומטית...");
        try {
            const result = await autoAnalyzeKeyword(query);
            setKeyword(query);
            setMinRam(result.minRam ? result.minRam.toString() : "");
            setMinCpuTier(result.minCpuTier ? result.minCpuTier.toString() : "");
            setMinGpuTier(result.minGpuTier ? result.minGpuTier.toString() : "");
            setCategory(result.category);
            handleDeleteLog(logId);
            toast.success("פוענח בהצלחה! שמור למאגר לאישור.", { id: toastId });
        } catch {
            setKeyword(query);
            handleDeleteLog(logId);
            toast.error("כישלון בפענוח, הועבר לעריכה ידנית", { id: toastId });
        }
    };

    const handlePulse = async () => {
        if (!scrapeQuery) return toast.error("יש להזין מונח לסריקה");
        setIsScraping(true);
        const toastId = toast.loading("מפעיל סורק חיצוני (Playwright)...");
        try {
            const res = await fetchExternalKnowledge(scrapeQuery);
            toast.success(`הסריקה הושלמה! נוספו ${res.count} תוצאות חדשות למאגר בסטטוס PENDING_REVIEW.`, { id: toastId });
            setScrapeQuery("");
            // Force reload to see new mappings
            window.location.reload();
        } catch (e) {
            toast.error("שגיאה בסריקה", { id: toastId });
        }
        setIsScraping(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEARCH LOGS */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Search className="w-5 h-5 text-indigo-400"/> מונחים שטרם נלמדו (יומן חיפושים)</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {logs.length === 0 && <p className="text-gray-500 text-sm">אין חיפושים חדשים במערכת.</p>}
                    {logs.map((log) => (
                        <div key={log.id} className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                            <div>
                                <span className="font-bold text-white text-lg">{log.query}</span>
                                <div className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString("he-IL")}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30" onClick={() => handleMapLog(log.query, log.id)}>
                                    <BrainCircuit className="w-4 h-4 ml-1"/> למד
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/30" onClick={() => handleDeleteLog(log.id)}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* KNOWLEDGE BASE MANAGEMENT */}
            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-green-400"/> הוספת יכולת חדשה</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">מילת מפתח (תוכנה/משחק)</label>
                            <Input placeholder="למשל: FIFA 24" value={keyword} onChange={e => setKeyword(e.target.value)} className="bg-black/50 border-white/10 text-white"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">קטגוריה</label>
                            <Input placeholder="Laptops" value={category} onChange={e => setCategory(e.target.value)} className="bg-black/50 border-white/10 text-white"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">RAM מינימלי (GB)</label>
                            <Input type="number" placeholder="8" value={minRam} onChange={e => setMinRam(e.target.value)} className="bg-black/50 border-white/10 text-white"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">דירוג מעבד (1-4)</label>
                            <Input type="number" placeholder="2 (למשל i5)" value={minCpuTier} onChange={e => setMinCpuTier(e.target.value)} className="bg-black/50 border-white/10 text-white"/>
                        </div>
                    </div>
                    <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                        <Plus className="w-4 h-4 ml-2"/> שמור למאגר
                    </Button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-purple-400"/> מאגר ידע קיים ({mappings.length})</h2>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {mappings.map(map => (
                            <div key={map.keyword} className="bg-black/30 p-3 rounded-xl border border-white/5 flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-bold text-white text-base">{map.keyword}</span>
                                    <div className="text-gray-400 mt-1 flex gap-3">
                                        <span>RAM: {map.minRam || 'אין'}</span>
                                        <span>CPU Tier: {map.minCpuTier || 'אין'}</span>
                                        <span>GPU Tier: {map.minGpuTier || 'אין'}</span>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-8 w-8" onClick={() => handleDeleteMapping(map.keyword)}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* THE "PULSE" SCRAPER BUTTON */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-300">
                        <Activity className="w-5 h-5 text-indigo-400" /> סורק מידע חיצוני (The Pulse)
                    </h2>
                    <p className="text-sm text-gray-400">הזן שם תוכנה, משחק או מקצוע כדי לסרוק אתרים מקצועיים (Benchmarks, System Requirements).</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="למשל: Adobe Premiere, 3D Animator" 
                            value={scrapeQuery} 
                            onChange={e => setScrapeQuery(e.target.value)} 
                            className="bg-black/50 border-white/10 text-white flex-1"
                        />
                        <Button 
                            onClick={handlePulse} 
                            disabled={isScraping}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            {isScraping ? "סורק..." : "הפעל סורק"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
