"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, Settings, History, Filter, CheckCircle } from "lucide-react";

export default function WeightsTab() {
    const [expertChangeStep, setExpertChangeStep] = useState(0.10);
    const [extractionWeights, setExtractionWeights] = useState<Record<string, number>>({});
    const [rankingWeights, setRankingWeights] = useState<Record<string, number>>({});
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Filter out: "all", "ADMIN", "SYSTEM"
    const [filterSource, setFilterSource] = useState<"all" | "ADMIN" | "SYSTEM">("all");

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/weights");
        const data = await res.json();
        if (data.success) {
            setExpertChangeStep(data.config.expertChangeStep || 0.10);
            setExtractionWeights(data.config.extractionWeights || {});
            setRankingWeights(data.config.rankingWeights || {});
            setAuditLogs(data.logs || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/admin/weights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                expertChangeStep,
                extractionWeights,
                rankingWeights,
                adminName: "מנהל מערכת", // Usually from auth
                reason: "עדכון דרך ממשק האדמין"
            }),
        });
        const data = await res.json();
        if (data.success) {
            alert("ההגדרות עודכנו בהצלחה!");
            fetchData();
        } else {
            alert("שגיאה בשמירה: " + data.error);
        }
        setSaving(false);
    };

    const handleWeightChange = (type: 'extraction' | 'ranking', key: string, value: string) => {
        const setFn = type === 'extraction' ? setExtractionWeights : setRankingWeights;
        setFn(prev => ({
            ...prev,
            [key]: parseFloat(value) || 0
        }));
    };

    const filteredLogs = auditLogs.filter(log => filterSource === "all" || log.changeSource === filterSource);

    if (loading) return <div className="text-center py-20 text-gray-400">טוען משקולות...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Control Panel */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings className="text-blue-400" /> משקולות אלגוריתם (Fuse.js)
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            כוון את ההעדפות של מנוע החיפוש. 1.0 (חשיבות עליונה) עד 0.0 (התעלם לחלוטין).
                        </p>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors"
                    >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        שמור משקולות
                    </button>
                </div>

                <div className="mb-6 flex items-center justify-between bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                    <div>
                        <h3 className="text-lg font-bold text-purple-400">גודל קפיצה בלמידת אדמין (Expert Change Step)</h3>
                        <p className="text-sm text-gray-400">הקפיצה בערך המשקולת בכל פעם שהאדמין מאשר שינוי מהריבוע הצהוב (ברירת מחדל 0.10).</p>
                    </div>
                    <input 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        max="0.5" 
                        value={expertChangeStep} 
                        onChange={(e) => setExpertChangeStep(parseFloat(e.target.value) || 0.10)}
                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 w-24 text-center font-mono focus:border-purple-500 outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Extraction Dashboard */}
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-blue-400">Extraction Dashboard (יצירת מודעה)</h3>
                            <p className="text-xs text-gray-400">משפיע על רמת ההתאמה בעת יצירת מודעות חדשות וסריקת בינה על ידי מוכר/אדמין.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(extractionWeights).map(([key, val]) => (
                                <div key={key} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                    <span className="font-medium text-gray-300 text-sm truncate">{key}</span>
                                    <input 
                                        type="number" 
                                        step="0.05" 
                                        min="0" 
                                        max="1" 
                                        value={val} 
                                        onChange={(e) => handleWeightChange('extraction', key, e.target.value)}
                                        className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 w-16 text-center text-sm font-mono focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ranking Dashboard */}
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-emerald-400">Ranking Dashboard (חיפוש המערכת)</h3>
                            <p className="text-xs text-gray-400">משפיע על חיפושי קונים במרקטפלייס ורלוונטיות של תוצאות החיפוש החופשי.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(rankingWeights).map(([key, val]) => (
                                <div key={key} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                    <span className="font-medium text-gray-300 text-sm truncate">{key}</span>
                                    <input 
                                        type="number" 
                                        step="0.05" 
                                        min="0" 
                                        max="1" 
                                        value={val} 
                                        onChange={(e) => handleWeightChange('ranking', key, e.target.value)}
                                        className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 w-16 text-center text-sm font-mono focus:border-emerald-500 outline-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <History className="text-purple-400" /> היסטוריית למידה ועדכונים (Audit Log)
                    </h2>
                    
                    {/* Filters */}
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setFilterSource("all")}
                            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${filterSource === "all" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
                        >
                            הכל
                        </button>
                        <button 
                            onClick={() => setFilterSource("SYSTEM")}
                            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${filterSource === "SYSTEM" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:text-white"}`}
                        >
                            למידה עצמית
                        </button>
                        <button 
                            onClick={() => setFilterSource("ADMIN")}
                            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${filterSource === "ADMIN" ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"}`}
                        >
                            ידני (Admin)
                        </button>
                    </div>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        אין נתונים ביומן.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="text-gray-400 border-b border-white/10">
                                <tr>
                                    <th className="font-semibold py-3 px-4">תאריך סנכרון</th>
                                    <th className="font-semibold py-3 px-4">יוזם (מקור)</th>
                                    <th className="font-semibold py-3 px-4">שדה</th>
                                    <th className="font-semibold py-3 px-4">ערך ישן</th>
                                    <th className="font-semibold py-3 px-4">ערך מתוקן</th>
                                    <th className="font-semibold py-3 px-4 text-left">סיבת שינוי</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log: any) => {
                                    const isSystem = log.changeSource === "SYSTEM";
                                    const isAcked = log.isAcknowledged;
                                    
                                    return (
                                        <tr key={log.id} className={`border-b border-white/5 transition-colors ${!isAcked ? 'bg-amber-500/10 hover:bg-amber-500/20' : 'hover:bg-white/[0.02]'}`}>
                                            <td className="py-3 px-4 text-gray-300">
                                                {new Date(log.createdAt).toLocaleDateString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isSystem ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                    {isSystem ? '🧠 למידה עצמית' : '👤 ידני (Admin)'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-gray-300">{log.field}</td>
                                            <td className="py-3 px-4 text-gray-500 line-through">{log.oldWeight}</td>
                                            <td className="py-3 px-4 font-bold text-white">{log.newWeight}</td>
                                            <td className="py-3 px-4 text-left text-gray-400 flex items-center justify-between gap-4">
                                                <span>{log.reason || "-"}</span>
                                                {!isAcked && (
                                                    <button 
                                                        onClick={() => {
                                                            // Optimistic update
                                                            setAuditLogs(prev => prev.map(l => l.id === log.id ? { ...l, isAcknowledged: true } : l));
                                                            // Server update
                                                            fetch("/api/admin/weights", {
                                                                method: "PATCH",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ id: log.id, isAcknowledged: true })
                                                            });
                                                        }}
                                                        className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 rounded-lg transition-colors"
                                                        title="אשר שינוי"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
