"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createListing, updateListing } from "@/app/actions/marketplace";
import { Loader2, Plus, Image as ImageIcon, X, Sparkles, Smartphone, Cpu, MemoryStick, HardDrive, Battery, Camera } from "lucide-react";
import { MobileSearchUI } from "@/components/marketplace/MobileSearchUI";

export const MOBILE_CONDITION_OPTIONS = [
    "חדש באריזה",
    "כמו חדש (ללא שריטות)",
    "משומש במצב טוב",
    "יש שריטות/מכות מובהקות",
    "תקול / למכירה לחלקים"
];

// ---- Types ----
interface MobileSpec {
    brand: string;
    model: string;
    ram: string;
    storage: string;
    screen: string;
    cpu: string;
    os: string;
    battery: string;
    rear_camera: string;
    front_camera: string;
    condition: string;
    extras: string; // free text for damages / extras
}

interface FormDetails {
    title: string;
    price: string;
    description: string;
    contactPhone: string;
    images: string[];
}

interface MobileListingFormProps {
    onComplete: () => void;
    onCancel?: () => void;
    initialData?: any;
    isEditing?: boolean;
    listingId?: string;
}

// ==== MAIN COMPONENT ====
export function MobileListingForm({ onComplete, onCancel, initialData, isEditing, listingId }: MobileListingFormProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");

    const [spec, setSpec] = useState<MobileSpec>({
        brand: initialData?.extraData?.יצרן || "",
        model: initialData?.extraData?.דגם || "",
        ram: initialData?.extraData?.RAM || "",
        storage: initialData?.extraData?.["נפח אחסון"] || "",
        screen: initialData?.extraData?.["גודל מסך"] || "",
        cpu: initialData?.extraData?.מעבד || "",
        os: initialData?.extraData?.["מערכת הפעלה"] || "",
        battery: initialData?.extraData?.סוללה || "",
        rear_camera: initialData?.extraData?.["מצלמה אחורית"] || "",
        front_camera: initialData?.extraData?.["מצלמה קדמית"] || "",
        condition: initialData?.condition || "משומש במצב טוב",
        extras: initialData?.extraData?.החרגות || "",
    });

    const [details, setDetails] = useState<FormDetails>({
        title: initialData?.title || "",
        price: initialData?.price ? initialData.price.toString() : "",
        description: initialData?.description || "",
        contactPhone: initialData?.contactPhone || initialData?.extraData?.["טלפון ליצירת קשר"] || user?.primaryPhoneNumber?.phoneNumber || "",
        images: initialData?.images || [],
    });

    const handleApplySearchEngineSpecs = (result: any) => {
        const assumedBrand = result.model_name?.split(" ")[0] || "אחר";
        const assumedModel = result.model_name?.split(" ").slice(1).join(" ") || result.model_name || "דגם לא ידוע";

        setSpec(s => ({
            ...s,
            brand: result.brand || assumedBrand,
            model: result.model_number || assumedModel,
            extras: result.model_name || "",
            ram: result.ram || s.ram,
            storage: result.storage || s.storage,
            screen: result.display || s.screen,
            cpu: result.cpu || s.cpu,
            os: result.os || s.os,
            battery: result.battery || s.battery,
            rear_camera: result.rear_camera || s.rear_camera,
            front_camera: result.front_camera || s.front_camera,
        }));

        let extractedPrice = "";
        if (result.price) {
            const num = result.price.replace(/[^\d]/g, "");
            if (num) extractedPrice = num;
        }

        setDetails(d => ({
            ...d,
            title: result.model_name || d.title,
            price: extractedPrice || d.price,
            description: d.description + (d.description ? "\n" : "") + (result.notes ? `הערות מפרט: ${result.notes}` : ""),
        }));

        // Scroll to specs section smoothly after applying
        setTimeout(() => {
            document.getElementById("manual-specs-section")?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, "").replace(/\D/g, "");
        setDetails(d => ({ ...d, price: val }));
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
            if (data.success) setDetails(d => ({ ...d, images: [...d.images, data.url] }));
        } catch { }
        finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!spec.brand || !spec.model) { alert("יש לחפש ולסנכרן מפרט ממנוע החיפוש תחילה או להזין דגם ידנית"); return; }

        setLoading(true);
        try {
            const extraData: Record<string, string> = {
                "יצרן": spec.brand,
                "דגם": spec.model,
                "מעבד": spec.cpu,
                "RAM": spec.ram,
                "נפח מובנה": spec.storage,
                "מסך": spec.screen,
                "מערכת הפעלה": spec.os,
                "סוללה": spec.battery,
                "מצלמה ראשית": spec.rear_camera,
                "הערות הדגם": spec.extras,
            };
            Object.keys(extraData).forEach(k => { if (!extraData[k]) delete extraData[k]; });
            if (details.contactPhone) extraData["טלפון ליצירת קשר"] = details.contactPhone;

            const payload = {
                title: details.title,
                description: details.description,
                price: parseFloat(details.price || "0"),
                condition: spec.condition,
                category: "Mobile",
                images: details.images,
                extraData,
            };

            const res = isEditing && listingId ? await updateListing(listingId, payload) : await createListing(payload);
            if (res.success) { onComplete(); } else { alert("שגיאה מצד השרת"); }
        } catch (err: any) { alert(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-gray-800" dir="rtl">
            {/* Header Sticky */}
            <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 rounded-t-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        פרסום סלולר חכם
                    </h2>
                    <p className="text-gray-400 text-xs">חפש במנוע ואנחנו נשלים עבורך את המפרט הטכני!</p>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="text-gray-500 hover:text-white bg-gray-800 p-1.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
                <div className="mb-8">
                    <MobileSearchUI onApplySpecs={handleApplySearchEngineSpecs} />
                </div>

                <form id="manual-specs-section" onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">

                    {/* MANUAL INFO OVERRIDE  */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">מידע בסיסי (ניתן להזין ידנית)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-gray-300">יצרן / מותג</Label>
                                <Input value={spec.brand} onChange={e => setSpec(s => ({ ...s, brand: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="Apple, Samsung..." dir="ltr" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-300">דגם מלא</Label>
                                <Input value={spec.model} onChange={e => setSpec(s => ({ ...s, model: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="Galaxy S23 Ultra, iPhone 14 Pro..." dir="ltr" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300 font-bold block mb-2">כותרת המודעה מומלצת <span className="text-red-500">*</span></Label>
                            <Input
                                value={details.title}
                                onChange={e => setDetails(d => ({ ...d, title: e.target.value }))}
                                placeholder="למשל: למכירה רכב משפחתי שמור..."
                                className="bg-gray-800 border-gray-700 text-lg py-6"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">לסיכום - מה מצבו?</Label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {MOBILE_CONDITION_OPTIONS.map(opt => {
                                    const isSel = spec.condition === opt;
                                    const cColor = opt.includes("חדש") ? "green" : opt.includes("לחלקים") ? "red" : "blue";
                                    return (
                                        <button
                                            key={opt} type="button"
                                            onClick={() => setSpec(s => ({ ...s, condition: opt }))}
                                            className={`py-2 px-1 text-sm rounded-lg border font-medium transition-all ${isSel ? (cColor === "green" ? "bg-green-600/20 border-green-500 text-green-300" : cColor === "red" ? "bg-red-600/20 border-red-500 text-red-300" : "bg-blue-600/20 border-blue-500 text-blue-300")
                                                : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-500"
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">טלפון ליצירת קשר</Label>
                                <Input value={details.contactPhone} onChange={e => setDetails(d => ({ ...d, contactPhone: e.target.value }))} dir="ltr" className="bg-gray-800 border-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-bold">מחיר מבוקש (₪) <span className="text-red-500">*</span></Label>
                                <Input value={details.price ? Number(details.price.replace(/,/g, "")).toLocaleString() : ""} onChange={handlePriceChange} dir="ltr" className="bg-gray-800 border-blue-500 font-bold text-center text-lg" placeholder="0" />
                            </div>
                        </div>

                        <div className="space-y-2 mt-4">
                            <Label className="text-gray-300">טקסט חופשי למודעה (תיאור)</Label>
                            <Textarea
                                value={details.description}
                                onChange={e => setDetails(d => ({ ...d, description: e.target.value }))}
                                placeholder="כתוב כאן פירוט כמו: מגיע עם מגן מסך, כיסוי, סיבת מכירה..."
                                className="bg-gray-800 border-gray-700 h-24"
                            />
                        </div>
                    </div>

                    {/* ==== SECTION: IMAGES ==== */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">גלריית תמונות</h3>

                        {details.images.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                                {details.images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700 group">
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setDetails(d => ({ ...d, images: d.images.filter((_, j) => j !== i) }))} className="absolute top-2 right-2 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-gray-500 hover:bg-gray-800/50 transition-colors">
                                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400 mb-2" /> : <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />}
                                <span className="text-sm font-medium text-gray-300">{uploading ? "מעלה תמונה..." : "העלה קובץ מהמכשיר"}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>

                            <div className="flex-1 flex flex-col justify-center gap-2">
                                <Label className="text-gray-400 text-xs">או הזן קישור ממקור חיצוני:</Label>
                                <div className="flex">
                                    <Input
                                        value={imageUrlInput}
                                        onChange={e => setImageUrlInput(e.target.value)}
                                        className="bg-gray-800 border-gray-700 rounded-l-none text-sm"
                                        dir="ltr" placeholder="https://"
                                    />
                                    <Button type="button" onClick={() => {
                                        if (imageUrlInput) { setDetails(d => ({ ...d, images: [...d.images, imageUrlInput] })); setImageUrlInput(""); }
                                    }} className="rounded-r-none border-l-0 bg-gray-700 hover:bg-gray-600">הוסף</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ALWAYS VISIBLE SUBMIT */}
                    <div className="sticky bottom-4 pt-6 border-t border-gray-800 bg-gray-900/90 backdrop-blur z-10 p-4 -mx-4 md:mx-0 md:p-0 md:bg-transparent rounded-xl">
                        <Button
                            type="submit"
                            disabled={loading || !spec.brand || !spec.model || !details.price}
                            className="w-full h-14 text-lg font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6 ml-2" /> : null}
                            פרסם מכשיר בענן 🚀
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
