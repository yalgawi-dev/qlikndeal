"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, RefreshCw, Download, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";

interface ParserLog {
    id: string;
    originalText: string;
    aiParsed: string;
    userFinal?: string;
    corrections?: string;
    testerNote?: string;
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

    const fetchLogs = async () => {
        setLoading(true);
        const res = await fetch("/api/parser-log?limit=100");
        const data = await res.json();
        if (data.success) setLogs(data.logs);
        setLoading(false);
    };

    useEffect(() => { fetchLogs(); }, []);

    const markQuality = async (id: string, quality: string) => {
        await fetch("/api/parser-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, quality, reviewed: true }),
        });
        setLogs(prev => prev.map(l => l.id === id ? { ...l, quality, reviewed: true } : l));
    };

    const deleteLog = async (id: string) => {
        if (!confirm("האם למחוק שורה זו?")) return;
        await fetch("/api/parser-log", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setLogs(prev => prev.filter(l => l.id !== id));
    };

    const deleteAll = async () => {
        if (!confirm(`האם למחוק את כל ${logs.length} הלוגים?\n\nטיפ: ייצא CSV לפני המחיקה לשמירת הנתונים.`)) return;
        // Export before clearing
        exportCSV();
        // Delete all one by one (no bulk endpoint yet)
        await Promise.all(logs.map(l => fetch("/api/parser-log", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: l.id }),
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
        const rows = [
            ["ID", "Date", "Tester", "Category", "Input Mode", "Quality", "Has Corrections", "Tester Note", "Original Text"],
            ...logs.map(l => [
                l.id,
                new Date(l.createdAt).toLocaleDateString("he-IL"),
                l.testerName || "",
                l.category || "",
                l.inputMode || "",
                l.quality || "",
                l.corrections ? "כן" : "לא",
                l.testerNote || "",
                `"${l.originalText.replace(/"/g, '""')}"`,
            ])
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "parser-logs.csv"; a.click();
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
                        <button onClick={fetchLogs} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors" title="רענן">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
                            <Download className="w-4 h-4" />
                            ייצוא CSV
                        </button>
                        {logs.length > 0 && (
                            <button
                                onClick={deleteAll}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm"
                                title="ייצא CSV ואחר כך מחק"
                            >
                                <Trash2 className="w-4 h-4" />
                                נקה הכל
                            </button>
                        )}
                    </div>
                </div>

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
