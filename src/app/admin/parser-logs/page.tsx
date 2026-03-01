"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Download, ArrowRight, Trash2, ChevronUp, ChevronDown, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ParserLog {
    id: string;
    originalText: string;
    aiParsed: string;
    userFinal?: string;
    corrections?: string;
    testerNote?: string;
    testerImage?: string;
    testerName?: string;
    category?: string;
    inputMode?: string;
    reviewed: boolean;
    quality?: string;
    createdAt: string;
}

export default function AdminParserLogsPage() {
    const [logs, setLogs] = useState<ParserLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "bad" | "partial" | "good" | "unreviewed">("all");
    const [showArchived, setShowArchived] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        const res = await fetch(`/api/parser-log?limit=100${showArchived ? "&archived=true" : ""}`);
        const data = await res.json();
        if (data.success) {
            // Only keep logs that have a tester note, an image, or actual corrections, unless archived
            const relevantLogs = data.logs.filter((l: any) =>
                showArchived ||
                l.testerNote ||
                l.testerImage ||
                (l.corrections && l.corrections !== "{}" && l.corrections !== "null")
            );
            setLogs(relevantLogs);
        }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchLogs(); }, [showArchived]);

    const markQuality = async (id: string, quality: string) => {
        await fetch("/api/parser-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, quality, reviewed: true }),
        });
        setLogs(prev => prev.map(l => l.id === id ? { ...l, quality, reviewed: true } : l));
    };

    const deleteLog = async (id: string) => {
        if (!confirm("האם למחוק שורה זו? (לא ניתן לבטל)")) return;
        await fetch("/api/parser-log", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setLogs(prev => prev.filter(l => l.id !== id));
    };

    const archiveBatch = async () => {
        if (!confirm(`לעבור ${logs.length} לוגים לארכיב?\n\nהלוגים ישמרו במסד הנתונים ויהיו זמינים דרך הכפתור 'ארכיב'.`)) return;
        exportCSV(); // Save a copy before archiving
        await Promise.all(logs.map(l => fetch("/api/parser-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: l.id, archived: true }),
        })));
        setLogs([]);
    };

    const filteredLogs = logs.filter(l => {
        if (filter === "unreviewed") return !l.reviewed;
        if (filter === "all") return true;
        return l.quality === filter;
    });

    const stats = {
        total: logs.length,
        good: logs.filter(l => l.quality === "good").length,
        partial: logs.filter(l => l.quality === "partial").length,
        bad: logs.filter(l => l.quality === "bad").length,
        unreviewed: logs.filter(l => !l.reviewed).length,
        withCorrections: logs.filter(l => l.corrections && l.corrections !== "{}").length,
    };

    const exportCSV = () => {
        const header = ["ID", "תאריך", "בודק", "קטגוריה", "מצב קלט", "איכות", "תיקונים", "הערת בודק", "טקסט מקורי", "פענוח AI", "סופי", "פירוט תיקונים"];
        
        let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
        <body dir="rtl">
        <table border="1">
        <thead>
            <tr>${header.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>`;

        logs.forEach(l => {
            html += `
            <tr>
                <td>${l.id}</td>
                <td>${new Date(l.createdAt).toLocaleDateString("he-IL")}</td>
                <td>${l.testerName || ""}</td>
                <td>${l.category || ""}</td>
                <td>${l.inputMode || ""}</td>
                <td>${l.quality || ""}</td>
                <td>${l.corrections && l.corrections !== "{}" ? "כן" : "לא"}</td>
                <td>${(l.testerNote || "").replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${l.originalText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${(l.aiParsed || "").replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${(l.userFinal || "").replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${(l.corrections || "").replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            </tr>`;
        });

        html += `</tbody></table></body></html>`;
        
        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `parser-logs_${new Date().toLocaleDateString()}.xls`;
        a.click();
    };

    const qualityBadge = (q?: string, reviewed?: boolean) => {
        if (!reviewed) return <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">לא נבדק</span>;
        if (q === "good") return <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">✓ טוב</span>;
        if (q === "partial") return <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">⚠ חלקי</span>;
        if (q === "bad") return <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">✗ גרוע</span>;
        return null;
    };

    return (
        <main className="min-h-screen bg-[#080812] text-white p-6" dir="rtl">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/marketplace"
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 hover:text-white"
                            title="חזרה ללוח בקרה"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                                🧠 לוגי AI Parser
                            </h1>
                            <p className="text-gray-400 mt-1">ניתוח שגיאות ולמידה עצמית של מנגנון הפענוח</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowArchived(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm ${showArchived ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400"}`}
                        >
                            🗂️ {showArchived ? "ארכיב" : "פעיל"}
                        </button>
                        <button onClick={fetchLogs} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors" title="רענן">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                            <Download className="w-4 h-4" />
                            ייצוא לאקסל
                        </button>
                        {!showArchived && logs.length > 0 && (
                            <button
                                onClick={archiveBatch}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all text-sm"
                                title="ייצא CSV ועבור לארכיב"
                            >
                                📁 ארכב אצווה
                            </button>
                        )}
                    </div>
                </div>

                {/* AI Learning Progress Metric */}
                {(() => {
                    const reviewedLogs = logs.filter(l => l.reviewed);
                    let score = 0;
                    if (reviewedLogs.length > 0) {
                        const goodCount = reviewedLogs.filter(l => l.quality === "good").length;
                        const partialCount = reviewedLogs.filter(l => l.quality === "partial").length;
                        // Score calculation: Good = 100%, Partial = 50%, Bad = 0%
                        const totalPoints = (goodCount * 1) + (partialCount * 0.5);
                        score = Math.round((totalPoints / reviewedLogs.length) * 100);
                    }

                    const categoryScores = Object.entries(
                        reviewedLogs.reduce((acc, log) => {
                            const cat = log.category || 'כללי';
                            if (!acc[cat]) acc[cat] = { total: 0, points: 0, bad: 0, good: 0 };
                            acc[cat].total++;
                            if (log.quality === 'good') { acc[cat].points += 1; acc[cat].good++; }
                            else if (log.quality === 'partial') acc[cat].points += 0.5;
                            else if (log.quality === 'bad') acc[cat].bad++;
                            return acc;
                        }, {} as Record<string, { total: number, points: number, bad: number, good: number }>)
                    ).map(([category, stats]) => ({
                        category,
                        score: Math.round((stats.points / stats.total) * 100),
                        total: stats.total,
                        bad: stats.bad,
                        good: stats.good
                    })).sort((a, b) => b.total - a.total);

                    return (
                        <div className="mb-8 space-y-4">
                            <div className="p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/10 border border-indigo-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                        <Sparkles className="text-purple-400 w-5 h-5" /> מדד ביצועי AI
                                    </h3>
                                    <p className="text-sm text-gray-400 max-w-md">
                                        הציון משקלל את כל הבדיקות שעברו בקרה (טוב = 100%, חלקי = 50%, גרוע = 0%).
                                        כל תיקון ולמידה משפרים את המודל לאורך זמן.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                                            {reviewedLogs.length > 0 ? `${score}%` : "n/a"}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">רמת דיוק כללית</div>
                                    </div>
                                    <div className="w-32 h-32 relative">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-gray-800"
                                                strokeDasharray="100, 100"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                stroke="currentColor" strokeWidth="3" fill="none"
                                            />
                                            <path
                                                className={`${score > 80 ? 'text-emerald-500' : score > 50 ? 'text-amber-500' : 'text-red-500'}`}
                                                strokeDasharray={`${score}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Category Specific Breakdown */}
                            {categoryScores.length > 0 && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-3 px-2">ציוני דיוק לפי קטגוריות:</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {categoryScores.map(c => (
                                            <div key={c.category} className="bg-white/5 rounded-xl p-3 flex flex-col justify-between">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold truncate max-w-[80px]" title={c.category}>{c.category}</span>
                                                    <span className={`text-xs font-bold ${c.score > 80 ? 'text-emerald-400' : c.score > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {c.score}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
                                                    <div
                                                        className={`h-1.5 rounded-full ${c.score > 80 ? 'bg-emerald-500' : c.score > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${c.score}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-[10px] text-gray-500 flex justify-between">
                                                    <span>{c.total} בדיקות</span>
                                                    {c.bad > 0 && <span className="text-red-400/80" title="שגיאות">{c.bad}✗</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
                    {[
                        { label: "סה״כ", value: stats.total, color: "text-white" },
                        { label: "לא נבדקו", value: stats.unreviewed, color: "text-gray-400" },
                        { label: "עם תיקונים", value: stats.withCorrections, color: "text-orange-400" },
                        { label: "✓ טוב", value: stats.good, color: "text-emerald-400" },
                        { label: "⚠ חלקי", value: stats.partial, color: "text-amber-400" },
                        { label: "✗ גרוע", value: stats.bad, color: "text-red-400" },
                    ].map(s => (
                        <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(["all", "unreviewed", "bad", "partial", "good"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === f
                                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                }`}
                        >
                            {{ all: "הכל", unreviewed: "לא נבדק", bad: "גרוע", partial: "חלקי", good: "טוב" }[f]}
                            <span className="mr-2 text-xs opacity-60">
                                {f === "all" ? logs.length
                                    : f === "unreviewed" ? stats.unreviewed
                                        : f === "good" ? stats.good
                                            : f === "partial" ? stats.partial
                                                : stats.bad}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Logs */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">טוען...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-20 bg-white/3 rounded-3xl border border-dashed border-white/10">
                        <p className="text-5xl mb-4">📋</p>
                        <p className="text-gray-500">אין לוגים עדיין</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredLogs.map(log => {
                            const corrections = log.corrections ? JSON.parse(log.corrections) : null;
                            const correctionCount = corrections ? Object.keys(corrections).length : 0;
                            const isOpen = expanded === log.id;

                            return (
                                <div key={log.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

                                    {/* Row header */}
                                    <div
                                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => setExpanded(isOpen ? null : log.id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{log.originalText}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(log.createdAt).toLocaleDateString("he-IL")} {new Date(log.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                {log.testerName && <span className="text-xs text-purple-400">👤 {log.testerName}</span>}
                                                {log.category && <span className="text-xs text-gray-400">📁 {log.category}</span>}
                                                {correctionCount > 0 && (
                                                    <span className="text-xs text-orange-400">⚡ {correctionCount} תיקונים</span>
                                                )}
                                                {log.testerNote && <span className="text-xs text-amber-400">💬 הערה</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {qualityBadge(log.quality, log.reviewed)}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteLog(log.id); }}
                                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                title="מחק שורה"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                        </div>
                                    </div>

                                    {/* Expanded detail */}
                                    {isOpen && (
                                        <div className="border-t border-white/10 p-5 space-y-5 bg-black/20">

                                            {/* Tester note */}
                                            {log.testerNote && (
                                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                                    <p className="text-xs text-amber-400 font-semibold mb-1">💬 הערת בודק</p>
                                                    <p className="text-sm text-amber-100">{log.testerNote}</p>
                                                </div>
                                            )}

                                            {log.testerImage && (
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <p className="text-xs text-gray-400 font-semibold mb-2">📸 צילום מסך מצורף</p>
                                                    <Image src={log.testerImage} alt="Screenshot attachment" width={400} height={300} className="rounded border border-white/20 object-contain max-w-full md:max-w-[400px]" />
                                                </div>
                                            )}

                                            {/* Corrections */}
                                            {corrections && correctionCount > 0 && (
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold mb-3">⚡ תיקונים ({correctionCount})</p>
                                                    <div className="space-y-2">
                                                        {Object.entries(corrections).map(([field, diff]: [string, any]) => (
                                                            <div key={field} className="grid grid-cols-3 gap-2 text-xs bg-white/5 rounded-xl p-3">
                                                                <span className="text-gray-400 font-medium">{field}</span>
                                                                <span className="text-red-300 line-through">{JSON.stringify(diff.ai)}</span>
                                                                <span className="text-emerald-300">→ {JSON.stringify(diff.user)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI parsed raw */}
                                            <details className="cursor-pointer">
                                                <summary className="text-xs text-gray-500 hover:text-gray-300">🤖 מה AI הבין (raw)</summary>
                                                <pre className="mt-2 text-xs bg-black/40 rounded-xl p-3 overflow-auto text-gray-300 max-h-40">
                                                    {JSON.stringify(JSON.parse(log.aiParsed), null, 2)}
                                                </pre>
                                            </details>

                                            {/* Quality controls */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                                <span className="text-xs text-gray-500 ml-auto">סמן איכות:</span>
                                                <button onClick={() => markQuality(log.id, "good")}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${log.quality === "good" ? "bg-emerald-500/30 text-emerald-300" : "bg-white/5 hover:bg-emerald-500/20 text-gray-400"}`}>
                                                    <CheckCircle className="w-3 h-3" /> טוב
                                                </button>
                                                <button onClick={() => markQuality(log.id, "partial")}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${log.quality === "partial" ? "bg-amber-500/30 text-amber-300" : "bg-white/5 hover:bg-amber-500/20 text-gray-400"}`}>
                                                    <AlertCircle className="w-3 h-3" /> חלקי
                                                </button>
                                                <button onClick={() => markQuality(log.id, "bad")}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${log.quality === "bad" ? "bg-red-500/30 text-red-300" : "bg-white/5 hover:bg-red-500/20 text-gray-400"}`}>
                                                    <XCircle className="w-3 h-3" /> גרוע
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
