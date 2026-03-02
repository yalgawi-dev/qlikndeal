"use client";

import { useState } from "react";
import { Pencil, Eye, X, Save, Loader2 } from "lucide-react";
import { updateListingAsAdmin } from "@/app/admin/actions";
import { toast } from "sonner";

interface AdminListingActionsProps {
    listing: {
        id: string;
        title: string;
        price: number;
        description: string;
        condition: string;
        category: string | null;
        images: string;
        extraData: string | null;
        status: string;
        seller: {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
            phone: string | null;
        } | null;
    };
}

export default function AdminListingActions({ listing }: AdminListingActionsProps) {
    const [showPanel, setShowPanel] = useState(false);
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: listing.title,
        price: listing.price.toString(),
        description: listing.description || "",
        condition: listing.condition || "",
        category: listing.category || "",
    });

    const images: string[] = (() => {
        try { return JSON.parse(listing.images || "[]"); } catch { return []; }
    })();

    const extraData: Record<string, string> = (() => {
        try {
            const parsed = JSON.parse(listing.extraData || "{}");
            if (Array.isArray(parsed)) {
                return Object.fromEntries(parsed.map((e: any) => [e.key, e.value]));
            }
            return parsed;
        } catch { return {}; }
    })();

    const handleSave = async () => {
        setSaving(true);
        const res = await updateListingAsAdmin(listing.id, {
            title: form.title,
            price: parseFloat(form.price.replace(/,/g, "")) || listing.price,
            description: form.description,
            condition: form.condition,
            category: form.category,
        });

        if (res.success) {
            toast.success("המודעה עודכנה בהצלחה ✓");
            setMode("view");
            setShowPanel(false);
        } else {
            toast.error("שגיאה בעדכון: " + res.error);
        }
        setSaving(false);
    };

    return (
        <>
            {/* Action Buttons in Table */}
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={() => { setMode("view"); setShowPanel(true); }}
                    className="p-2 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="צפה במודעה"
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    onClick={() => { setMode("edit"); setShowPanel(true); }}
                    className="p-2 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    title="ערוך מודעה"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            </div>

            {/* Side Panel */}
            {showPanel && (
                <div className="fixed inset-0 z-50 flex" dir="rtl">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowPanel(false)}
                    />

                    {/* Panel */}
                    <div className="fixed left-0 top-0 h-full w-full max-w-2xl bg-gray-950 border-r border-white/10 shadow-2xl overflow-y-auto z-50 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-950 z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-8 rounded-full ${mode === "edit" ? "bg-emerald-400" : "bg-blue-400"}`} />
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        {mode === "edit" ? "עריכת מודעה" : "צפייה במודעה"}
                                    </h2>
                                    <p className="text-xs text-gray-500 truncate max-w-[300px]">{listing.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {mode === "view" ? (
                                    <button
                                        onClick={() => setMode("edit")}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        ערוך
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setMode("view")}
                                        className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        ביטול עריכה
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowPanel(false)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 space-y-6">

                            {/* Seller Info */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">פרטי המוכר</p>
                                <p className="text-white font-medium">{listing.seller?.firstName} {listing.seller?.lastName}</p>
                                <p className="text-gray-400 text-sm">{listing.seller?.phone || listing.seller?.email || "אין מידע"}</p>
                            </div>

                            {/* Images */}
                            {images.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">תמונות ({images.length})</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={img}
                                                    alt={`תמונה ${i + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fields */}
                            {mode === "view" ? (
                                <div className="space-y-3">
                                    {[
                                        { label: "כותרת", value: listing.title },
                                        { label: "מחיר", value: `₪${listing.price.toLocaleString()}` },
                                        { label: "קטגוריה", value: listing.category },
                                        { label: "מצב", value: listing.condition },
                                        { label: "תיאור", value: listing.description },
                                    ].filter(f => f.value).map(field => (
                                        <div key={field.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1 font-semibold">{field.label}</p>
                                            <p className="text-white text-sm whitespace-pre-wrap">{field.value}</p>
                                        </div>
                                    ))}

                                    {/* Extra Data */}
                                    {Object.keys(extraData).length > 0 && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase">מפרט טכני</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(extraData).map(([k, v]) => (
                                                    <div key={k} className="bg-black/30 rounded-lg p-2">
                                                        <p className="text-xs text-gray-500">{k}</p>
                                                        <p className="text-sm text-white">{v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {[
                                        { label: "כותרת", key: "title" as const, type: "text" },
                                        { label: "מחיר (₪)", key: "price" as const, type: "number" },
                                        { label: "קטגוריה", key: "category" as const, type: "text" },
                                        { label: "מצב", key: "condition" as const, type: "text" },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="block text-xs text-gray-400 mb-1.5 font-medium">{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={form[field.key]}
                                                onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-colors"
                                                dir="auto"
                                            />
                                        </div>
                                    ))}

                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1.5 font-medium">תיאור</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={5}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                                            dir="auto"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer (Edit mode only) */}
                        {mode === "edit" && (
                            <div className="p-6 border-t border-white/10 sticky bottom-0 bg-gray-950">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? "שומר..." : "שמור שינויים"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
