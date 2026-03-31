"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createListing, updateListing, getMyPhone } from "@/app/actions/marketplace";
import { Loader2, Image as ImageIcon, X, Sparkles, Smartphone, Box, Battery } from "lucide-react";
import { SmartAiInput } from "./SmartAiInput";

// אפשרויות מצב לטלפונים
const MOBILE_CONDITIONS = ["חדש", "כמו חדש", "משומש (מצב טוב)", "משומש", "מחודש", "לחלקים"];

export function ListingForm({ onComplete, initialData, isEditing, listingId, initialCategory }: any) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uncertainFields, setUncertainFields] = useState<string[]>([]);
    
    // ✨ צינור הדם: שאיבת שלד הטופס הדינמי מה-DB
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    
    useEffect(() => {
        async function loadStructure() {
            if (initialCategory !== 'PHONES') return;
            try {
                const res = await fetch("/api/marketplace/form-structure?category=SMARTPHONES");
                if (res.ok) {
                    const data = await res.json();
                    if (data.options) setDynamicOptions(data.options);
                }
            } catch(e) { console.error("Failed to load generic form options from DB", e); }
        }
        loadStructure();
    }, [initialCategory]);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        price: initialData?.price?.toString() || "",
        description: initialData?.description || "",
        category: initialData?.category || initialCategory || "General",
        contactPhone: initialData?.contactPhone || "",
        images: initialData?.images || [] as string[],
        mobileCondition: initialData?.extraData?.["מצב"] || "",
        batteryHealth: initialData?.extraData?.["בריאות סוללה"]?.replace("%", "") || "100",
        extraData: initialData?.extraData ?
            Object.entries(initialData.extraData)
                .filter(([k]) => k !== "מצב" && k !== "בריאות סוללה")
                .map(([key, value]) => ({ key, value: String(value) })) : []
    });

    useEffect(() => {
        if (!formData.contactPhone) {
            getMyPhone().then(res => { if (res.phone) setFormData(p => ({ ...p, contactPhone: res.phone })); });
        }
    }, []);


    const applyAiData = (ai: any) => {
        console.log("🤖 AI DATA ARRIVED:", ai);
        if (!ai) return;

        // פתיחת המעטפת
        const data = ai.result || ai;

        setFormData(prev => {
            let newExtra = [...prev.extraData];
            // שדות שמטופלים בנפרד — לא ייכנסו ל-extraData
            const handledKeys = ["title", "price", "description", "category", "contactPhone",
                "condition", "batteryPercent", "storage", "success", "suggestions",
                "isCatalogMatch", "sourceTable", "brand", "model"];

            Object.keys(data).forEach(key => {
                if (handledKeys.includes(key)) return;
                const value = data[key];
                if (!value) return;
                const stringValue = Array.isArray(value) ? value.join(", ") : String(value);
                const existingIdx = newExtra.findIndex(e => e.key === key);
                if (existingIdx > -1) newExtra[existingIdx].value = stringValue;
                else newExtra.push({ key, value: stringValue });
            });

            // הוסף storage ל-extraData אם קיים
            if (data.storage) {
                const idx = newExtra.findIndex(e => e.key === "storage");
                if (idx > -1) newExtra[idx].value = String(data.storage);
                else newExtra.push({ key: "storage", value: String(data.storage) });
            }

            return {
                ...prev,
                title: data.title || prev.title,
                price: data.price ? String(data.price) : prev.price,
                description: data.description || prev.description,
                contactPhone: data.contactPhone || prev.contactPhone,
                // מצב מכשיר — ממופה מ-"condition"
                mobileCondition: data.condition || prev.mobileCondition,
                // בריאות סוללה — ממופה מ-"batteryPercent"
                batteryHealth: data.batteryPercent ? String(data.batteryPercent).replace("%", "") : prev.batteryHealth,
                extraData: newExtra
            };
        });

        // עדכון שדות "בביטחון בינוני" לפידבק ויזואלי
        if (data.suggestions) {
            const suggestFields = data.suggestions
                .filter((s: any) => s.action === "SUGGEST")
                .map((s: any) => s.field);
            setUncertainFields(prev => [...new Set([...prev, ...suggestFields])]);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.success) setFormData(p => ({ ...p, images: [...p.images, data.url] }));
        } catch (err) { console.error(err); } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const extraDataObject = formData.extraData.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});

            if (formData.category === "PHONES") {
                extraDataObject["מצב"] = formData.mobileCondition;
                extraDataObject["בריאות סוללה"] = formData.batteryHealth + "%";
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price || "0"),
                category: formData.category,
                contactPhone: formData.contactPhone,
                images: formData.images,
                condition: formData.mobileCondition || "",
                extraData: extraDataObject
            };

            const res = isEditing ? await updateListing(listingId, payload) : await createListing(payload);
            if (res.success) onComplete();
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 max-h-[85vh] overflow-y-auto px-2 text-right" dir="rtl">

            {/* הכותרת המעוצבת ששמרנו לכל הקטגוריות */}
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">פרסום מודעה חכם</h3>
                        <p className="text-xs text-purple-200 mt-1">השתמשו ב-AI למילוי מהיר או מלאו ידנית</p>
                    </div>
                </div>
            </div>

            <SmartAiInput category={formData.category} onResult={applyAiData} />

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="flex items-center gap-2 mb-2">
                    <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${formData.category !== 'General' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                        {formData.category === "PHONES" ? <Smartphone className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
                        סוג מוצר: {formData.category}
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-gray-400 text-xs">כותרת המודעה</Label>
                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={`bg-gray-800 border-gray-700 text-white ${uncertainFields.includes('title') ? 'border-yellow-500 bg-yellow-500/5' : ''}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-gray-400 text-xs">מחיר (₪)</Label>
                            <Input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className={`bg-gray-800 border-gray-700 font-bold ${uncertainFields.includes('price') ? 'border-yellow-500 bg-yellow-500/5' : ''}`} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-gray-400 text-xs">טלפון לקשר</Label>
                            <Input value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                    </div>
                </div>

                {formData.category === "PHONES" && (
                    <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 space-y-4 animate-in fade-in">
                        <Label className="text-blue-400 font-bold flex items-center gap-2"><Smartphone className="w-4 h-4" /> מצב המכשיר</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(dynamicOptions["condition"] || MOBILE_CONDITIONS).map(cond => (
                                <button key={cond} type="button" onClick={() => setFormData({ ...formData, mobileCondition: cond })}
                                    className={`py-2 text-xs rounded-lg border transition-all ${formData.mobileCondition === cond ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                    {cond}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                            <Battery className="w-5 h-5 text-green-400" />
                            <Label className="text-sm">בריאות סוללה:</Label>
                            <Input type="number" value={formData.batteryHealth} onChange={e => setFormData({ ...formData, batteryHealth: e.target.value })} className="w-20 bg-gray-800 h-8" />
                            <span className="text-gray-500">%</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.extraData.map((field, index) => (
                        <div key={index} className="bg-gray-900/30 p-3 rounded-lg border border-gray-800 flex flex-col gap-1 transition-all hover:border-purple-500/50">
                            <span className="text-[10px] text-purple-400 font-bold uppercase">{field.key}</span>
                            <Input value={field.value} onChange={e => {
                                const next = [...formData.extraData];
                                next[index].value = e.target.value;
                                setFormData({ ...formData, extraData: next });
                            }} className="h-7 bg-transparent border-none p-0 text-sm text-gray-200 focus-visible:ring-0" />
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
                    <Label className="font-bold text-gray-200">תמונות המוצר</Label>
                    <div className="grid grid-cols-4 gap-2">
                        {formData.images.map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                                <img src={img} className="object-cover w-full h-full" alt="" />
                                <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"><X className="w-3 h-3 text-white" /></button>
                            </div>
                        ))}
                        <label className="flex aspect-square items-center justify-center border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-all">
                            {uploading ? <Loader2 className="animate-spin text-gray-500" /> : <ImageIcon className="text-gray-500" />}
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                    </div>
                </div>

                <Button type="submit" disabled={loading || !formData.title || !formData.price} className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-xl hover:scale-[1.01] transition-transform">
                    {loading ? <Loader2 className="animate-spin ml-2" /> : "פרסם מודעה 🚀"}
                </Button>
            </form>
        </div>
    );
}