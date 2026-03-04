"use client";

import { useState, useEffect } from "react";
import { Database, User, Clock, RefreshCw, CheckCircle, AlertTriangle, XCircle, FileText, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ImportLog {
    id: string;
    category: string;
    totalInFile: number;
    added: number;
    skipped: number;
    duplicatesInFile: number;
    errors: number;
    errorDetails: string[];
    newTotal: number;
    adminName: string | null;
    createdAt: string | Date;
}

const CATEGORY_LABELS: Record<string, string> = {
    laptop: "מחשבים ניידים",
    desktop: "מחשבי מותג",
    aio: "All-in-One",
    mobile: "סלולריים",
    vehicle: "רכבים",
    electronics: "אלקטרוניקה",
    appliance: "מוצרי חשמל",
    motherboard: "לוחות אם",
};

const CATEGORY_COLORS: Record<string, string> = {
    laptop: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    desktop: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    aio: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    mobile: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    vehicle: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    electronics: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    appliance: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    motherboard: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default function ImportLogsClient({ initialLogs }: { initialLogs: ImportLog[] }) {
    const [logs, setLogs] = useState<ImportLog[]>(initialLogs);
    const [loading, setLoading] = useState(false);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/import-logs");
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (e) {
            console.error("Failed to fetch logs", e);
        }
        setLoading(false);
    };

    const filteredLogs = filterCategory === "all"
        ? logs
        : logs.filter(l => l.category === filterCategory);

    const categories = Array.from(new Set(logs.map(l => l.category)));

    const totalAdded = logs.reduce((sum, l) => sum + l.added, 0);
    const totalSkipped = logs.reduce((sum, l) => sum + l.skipped, 0);
    const totalDuplicates = logs.reduce((sum, l) => sum + l.duplicatesInFile, 0);

    return (
        <div className="min-h-screen bg-[#050508] text-right" dir="rtl">
            <div className="p-6 lg:p-12 max-w-6xl mx-auto">

                {/* Header */}
                <div className="relative mb-10">
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/admin/export" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm">
                            <ArrowLeft size={14} />
                            חזרה לניהול קטלוגים
                        </Link>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
                        <FileText size={12} />
                        היסטוריית ייבואים
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2">
                        לוג <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-cyan-400">ייבוא נתונים</span>
                    </h1>
                    <p className="text-slate-400">מעקב מלא אחר כל פעולות הייבוא – מי הכניס, מה, מתי וכמה.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "סה\"כ ייבואים", value: logs.length, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                        { label: "רשומות שנוספו", value: totalAdded.toLocaleString(), color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                        { label: "כפילויות שסוננו", value: (totalSkipped + totalDuplicates).toLocaleString(), color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                        { label: "כפילויות בקובץ", value: totalDuplicates.toLocaleString(), color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                    ].map((card) => (
                        <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
                            <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters + Refresh */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <button
                        onClick={() => setFilterCategory("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filterCategory === "all" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"}`}
                    >
                        הכל ({logs.length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filterCategory === cat ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"}`}
                        >
                            {CATEGORY_LABELS[cat] || cat} ({logs.filter(l => l.category === cat).length})
                        </button>
                    ))}
                    <Button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="mr-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl h-9 px-4 text-xs"
                    >
                        {loading ? <RefreshCw size={12} className="animate-spin ml-1" /> : <RefreshCw size={12} className="ml-1" />}
                        רענן לוג
                    </Button>
                </div>

                {/* Log List */}
                <div className="space-y-3">
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Database className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-20" />
                            <p className="text-slate-500">אין היסטוריית ייבוא עדיין.</p>
                        </div>
                    ) : filteredLogs.map(log => {
                        const date = new Date(log.createdAt);
                        const isExpanded = expandedLog === log.id;
                        const successRate = log.totalInFile > 0
                            ? Math.round((log.added / log.totalInFile) * 100)
                            : 0;

                        return (
                            <div key={log.id} className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                                {/* Main Row */}
                                <div
                                    className="flex flex-col md:flex-row md:items-center gap-4 p-5 cursor-pointer"
                                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                >
                                    {/* Category Badge */}
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black w-fit ${CATEGORY_COLORS[log.category] || "text-white bg-white/10 border-white/20"}`}>
                                        <Database size={11} />
                                        {CATEGORY_LABELS[log.category] || log.category}
                                    </div>

                                    {/* Who & When */}
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                                            <User size={12} className="text-indigo-400" />
                                            {log.adminName || "מערכת"}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                            <Clock size={10} />
                                            {date.toLocaleString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-2 flex-wrap md:mr-auto">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-[11px] font-medium text-slate-400">
                                            בקובץ: <span className="font-black text-white">{log.totalInFile}</span>
                                        </div>
                                        {log.added > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] font-black text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                                                <CheckCircle size={10} /> +{log.added} נוספו
                                            </div>
                                        )}
                                        {log.duplicatesInFile > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[11px] font-bold text-orange-400">
                                                <AlertTriangle size={10} /> {log.duplicatesInFile} כפול בקובץ
                                            </div>
                                        )}
                                        {log.skipped > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] font-bold text-amber-400">
                                                {log.skipped} קיימים ב-DB
                                            </div>
                                        )}
                                        {log.errors > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-900/30 border border-red-800/30 rounded-lg text-[11px] font-bold text-red-500">
                                                <XCircle size={10} /> {log.errors} שגיאות
                                            </div>
                                        )}
                                        {log.newTotal > 0 && (
                                            <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[11px] text-slate-500">
                                                סה"כ במאגר: <span className="font-black text-slate-300">{log.newTotal.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expand chevron */}
                                    <div className="text-slate-600">
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>

                                {/* Expanded: error details */}
                                {isExpanded && log.errorDetails && log.errorDetails.length > 0 && (
                                    <div className="border-t border-white/5 bg-black/30 p-5">
                                        <h4 className="text-xs font-black text-red-400 mb-3 flex items-center gap-2">
                                            <XCircle size={12} /> פרטי שגיאות ({log.errorDetails.length})
                                        </h4>
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                            {log.errorDetails.map((err, i) => (
                                                <div key={i} className="text-[11px] font-mono bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2 text-red-300">
                                                    {err}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {isExpanded && (!log.errorDetails || log.errorDetails.length === 0) && (
                                    <div className="border-t border-white/5 bg-emerald-950/10 p-4 text-center text-[11px] text-emerald-500 font-bold">
                                        ✅ הייבוא הסתיים ללא שגיאות
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
