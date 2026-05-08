"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyPhone, createListing, updateListing } from "@/app/actions/marketplace";
import { Loader2, Image as ImageIcon, X, Sparkles } from "lucide-react";
import { SmartAiInput } from "./SmartAiInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function FreeCombobox({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (v: string) => void, placeholder?: string }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value || "");

    useEffect(() => { setSearch(value || ""); }, [value]);

    // Show options if they match the search, but hide the exact match to not show duplicate
    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()) && o.toLowerCase() !== search.toLowerCase());

    return (
        <div className="relative w-full">
            <Input 
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 250)}
                placeholder={placeholder}
                className="h-8 bg-transparent border-none p-0 text-white focus-visible:ring-0 px-1 placeholder:text-gray-600 focus:bg-gray-800/30 rounded-sm transition-colors"
                dir="auto"
            />
            {open && filtered.length > 0 && (
                <div className="absolute z-[100] top-full right-0 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-gray-700 bg-gray-950 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] p-1 scrollbar-thin scrollbar-thumb-gray-800" dir="rtl">
                    {filtered.map((opt, i) => (
                        <div key={i} 
                            className="px-2 py-2 text-sm text-gray-300 hover:bg-purple-600 hover:text-white cursor-pointer rounded-sm transition-colors"
                            onClick={() => {
                                setSearch(opt);
                                onChange(opt);
                                setOpen(false);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ListingForm({ onComplete, onCancel, initialData, isEditing, listingId }: any) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uncertainFields, setUncertainFields] = useState<string[]>([]);
    const [aiOptions, setAiOptions] = useState<Record<string, string[]>>({});
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

    // 2.5 משיכת האופציות מהקטלוג והמילון הדינמי ("זהב טהור")
    useEffect(() => {
        if (formData.category && formData.category !== "General") {
            fetch(`/api/marketplace/form-structure?category=${formData.category}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.options) {
                        setAiOptions(data.options);
                    }
                })
                .catch(err => console.error("Failed to fetch AI form structure options:", err));
        }
    }, [formData.category]);

    // 3. הזרקת נתוני AI (הפיכת הקטגוריה לאותיות גדולות לבדיקה)
    const applyAiData = (ai: any) => {
        setFormData(prev => {
            const incomingCategory = ai.category?.toUpperCase();
            const currentCategory = prev.category?.toUpperCase();
            const isCategoryChanged = incomingCategory && incomingCategory !== currentCategory;
            
            if (isCategoryChanged && currentCategory !== "GENERAL") {
                alert(`זיהינו שהטקסט שייך לקטגוריית ${incomingCategory} ולכן ריעננו את הטופס כדי לשמור על דיוק הנתונים.`);
            }

            // MUSS: WIPE OUT older category data if AI switched us! (Prevents Frankenstein bugs)
            const newExtra = isCategoryChanged ? [] : [...prev.extraData];
            
            const mainKeys = ["title", "price", "category", "contactPhone", "description"];
            const updated: any = { ...prev, category: incomingCategory || prev.category };

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
                
                <div className="flex items-center justify-between bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                    <Label className="text-gray-300 ms-1">קטגוריית מודעה:</Label>
                    <Select value={formData.category?.toUpperCase()} onValueChange={(val) => setFormData({ ...formData, category: val, extraData: [] })}>
                        <SelectTrigger className="w-[200px] h-8 bg-gray-950 border-gray-700 text-white font-bold">
                            <SelectValue placeholder="בחר קטגוריה..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            <SelectItem value="GENERAL">כללי</SelectItem>
                            <SelectItem value="PHONES">טלפונים סלולריים</SelectItem>
                            <SelectItem value="LAPTOPS">מחשבים ניידים</SelectItem>
                            <SelectItem value="DESKTOPS">מחשבים נייחים</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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
                                <Label className="text-blue-300/70">מצב תקינות (באופן כללי)</Label>
                                <Select 
                                     value={formData.extraData.find(d => d.key === 'BatteryStatus')?.value || ''}
                                     onValueChange={(val) => {
                                        const newExtra = [...formData.extraData];
                                        const idx = newExtra.findIndex(d => d.key === 'BatteryStatus');
                                        if (idx > -1) newExtra[idx].value = val;
                                        else newExtra.push({ key: 'BatteryStatus', value: val });
                                        setFormData({...formData, extraData: newExtra});
                                    }}
                                >
                                    <SelectTrigger className="bg-blue-950/50 border-blue-800 text-blue-100 placeholder:text-blue-700/50">
                                        <SelectValue placeholder="בחר..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-blue-950 border-blue-900 text-blue-100">
                                        <SelectItem value="תקינה">✅ תקינה לגמרי</SelectItem>
                                        <SelectItem value="לא תקינה">❌ דורשת החלפה</SelectItem>
                                        <SelectItem value="הוחלפה לאחרונה">🔋 הוחלפה לאחרונה</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-blue-300/70">אחוזי בריאות סוללה</Label>
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
                                    className="bg-blue-950/30 border-blue-800 placeholder:text-blue-700/50 text-blue-100 font-bold text-center"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* שדות אקסטרה - מציג הכל חוץ מהסוללה שכבר למעלה */}
                {formData.extraData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.extraData.map((field, index) => {
                            if (field.key === 'BatteryHealth' || field.key === 'BatteryStatus') return null;
                            const options = aiOptions[field.key];
                            const hasOptions = options && options.length > 0;

                            return (
                                <div key={index} className="flex flex-col gap-1 bg-gray-900/30 p-3 rounded-lg border border-gray-800 transition-all hover:bg-gray-800/40">
                                    <span className="text-[10px] text-purple-400 font-bold uppercase">{field.key}</span>
                                    {hasOptions ? (
                                        <FreeCombobox 
                                            value={field.value}
                                            options={options}
                                            onChange={(val) => {
                                                const newExtra = [...formData.extraData];
                                                newExtra[index].value = val;
                                                setFormData({...formData, extraData: newExtra});
                                            }}
                                            placeholder="בחר או הקלד..."
                                        />
                                    ) : (
                                        <Input value={field.value} 
                                            onChange={(e) => {
                                                const newExtra = [...formData.extraData];
                                                newExtra[index].value = e.target.value;
                                                setFormData({...formData, extraData: newExtra});
                                            }}
                                            className="h-8 bg-transparent border-none p-0 text-white focus-visible:ring-0 px-1" 
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.01]">
                    {loading ? <Loader2 className="animate-spin ml-2" /> : "פרסם מודעה 🚀"}
                </Button>
            </form>
        </div>
    );
}