"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyPhone, createListing, updateListing } from "@/app/actions/marketplace";
import { Loader2, Image as ImageIcon, X, Sparkles } from "lucide-react";
import { SmartAiInput } from "./SmartAiInput";

export function ListingForm({ onComplete, onCancel, initialData, isEditing, listingId }: any) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uncertainFields, setUncertainFields] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        description: "",
        category: "General",
        contactPhone: "",
        images: [] as string[],
        extraData: [] as { key: string; value: string }[]
    });

    // 1. טעינת נתונים ראשונית מה-AI או מעריכה
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                price: initialData.price?.toString() || "",
                description: initialData.description || "",
                category: initialData.category || "General",
                contactPhone: initialData.contactPhone || "",
                images: initialData.images || [],
                extraData: initialData.extraData ? 
                    Object.entries(initialData.extraData).map(([key, value]) => ({ key, value: String(value) })) : []
            });
        }
    }, [initialData]);

    // 2. טעינת טלפון המשתמש
    useEffect(() => {
        if (!formData.contactPhone) {
            getMyPhone().then(res => { if (res.phone) setFormData(p => ({ ...p, contactPhone: res.phone })); });
        }
    }, []);

    // 3. הזרקת נתוני AI (הפיכת הקטגוריה לאותיות גדולות לבדיקה)
    const applyAiData = (ai: any) => {
        setFormData(prev => {
            const newExtra = [...prev.extraData];
            const mainKeys = ["title", "price", "category", "contactPhone", "description"];
            const updated: any = { ...prev };

            Object.keys(ai).forEach(key => {
                if (mainKeys.includes(key) && ai[key]) {
                    updated[key] = ai[key];
                } else if (!["success", "suggestions"].includes(key) && ai[key]) {
                    const existingIdx = newExtra.findIndex(e => e.key === key);
                    if (existingIdx > -1) newExtra[existingIdx].value = String(ai[key]);
                    else newExtra.push({ key: key, value: String(ai[key]) });
                }
            });
            return { ...updated, extraData: newExtra };
        });

        if (ai.suggestions) {
            const suggestFields = ai.suggestions.map((s: any) => s.field);
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
        } catch { } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price || "0"),
                condition: formData.extraData.find((e: any) => e.key === "condition")?.value || "לא צוין", // REQUIRED BY API
                extraData: formData.extraData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
            };
            const res = isEditing ? await updateListing(listingId, payload) : await createListing(payload);
            if (res.success) onComplete();
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // בדיקה חסינת אותיות גדולות/קטנות לקטגוריה
    const isPhoneCategory = formData.category?.toUpperCase() === "PHONES" || formData.category?.toUpperCase() === "PHONE";

    return (
        <div className="space-y-6 max-h-[85vh] overflow-y-auto px-1 text-right" dir="rtl">
            <SmartAiInput category={formData.category} onResult={applyAiData} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-400">כותרת המודעה</Label>
                        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                        className={`bg-gray-800 border-gray-700 ${uncertainFields.includes('title') ? 'border-yellow-500' : ''}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-400">מחיר (₪)</Label>
                            <Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
                            className={`bg-gray-800 border-gray-700 font-bold ${uncertainFields.includes('price') ? 'border-yellow-500' : ''}`} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">טלפון</Label>
                            <Input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="bg-gray-800 border-gray-700" />
                        </div>
                    </div>
                </div>

                {/* בלוק כחול ייעודי לטלפונים - עובד עם PHONES או PHONE */}
                {isPhoneCategory && (
                    <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-800/50 space-y-4 animate-in slide-in-from-top">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Sparkles size={16} />
                            <span className="text-sm font-bold">הגדרות סלולר חכמות</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300/70">בריאות סוללה</Label>
                                <Input 
                                    placeholder="למשל: 95%" 
                                    value={formData.extraData.find(d => d.key === 'BatteryHealth')?.value || ''}
                                    onChange={(e) => {
                                        const newExtra = [...formData.extraData];
                                        const idx = newExtra.findIndex(d => d.key === 'BatteryHealth');
                                        if (idx > -1) newExtra[idx].value = e.target.value;
                                        else newExtra.push({ key: 'BatteryHealth', value: e.target.value });
                                        setFormData({...formData, extraData: newExtra});
                                    }}
                                    className="bg-blue-950/30 border-blue-800 placeholder:text-blue-700/50"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* שדות אקסטרה - מציג הכל חוץ מהסוללה שכבר למעלה */}
                {formData.extraData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.extraData.map((field, index) => (
                            field.key !== 'BatteryHealth' && (
                                <div key={index} className="flex flex-col gap-1 bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                                    <span className="text-[10px] text-purple-400 font-bold uppercase">{field.key}</span>
                                    <Input value={field.value} 
                                        onChange={(e) => {
                                            const newExtra = [...formData.extraData];
                                            newExtra[index].value = e.target.value;
                                            setFormData({...formData, extraData: newExtra});
                                        }}
                                        className="h-8 bg-transparent border-none p-0 text-white focus-visible:ring-0" 
                                    />
                                </div>
                            )
                        ))}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.01]">
                    {loading ? <Loader2 className="animate-spin ml-2" /> : "פרסם מודעה 🚀"}
                </Button>
            </form>
        </div>
    );
}