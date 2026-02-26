"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createListing, updateListing, getMyListings, getMyPhone } from "@/app/actions/marketplace";
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
    batteryHealth: string;
    batteryPercent: string;
    rear_camera: string;
    front_camera: string;
    dimensions: string;
    thickness: string;
    weight: string;
    expandable_storage: string;
    usb_type: string;
    wireless_charging: string;
    network: string;
    esim: string;
    nfc: string;
    wifi: string;
    headphone_jack: string;
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
        battery: initialData?.extraData?.["קיבולת סוללה"] || initialData?.extraData?.סוללה || "",
        batteryHealth: initialData?.extraData?.["תקינות סוללה"] || "",
        batteryPercent: (initialData?.extraData?.["אחוזי סוללה"] || "").replace("%", ""),
        rear_camera: initialData?.extraData?.["מצלמות אחוריות"] || initialData?.extraData?.["מצלמה אחורית"] || "",
        front_camera: initialData?.extraData?.["מצלמה קדמית"] || "",
        dimensions: initialData?.extraData?.מידות || "",
        thickness: initialData?.extraData?.עובי || "",
        weight: initialData?.extraData?.משקל || "",
        expandable_storage: initialData?.extraData?.["הרחבת זיכרון"] || "",
        usb_type: initialData?.extraData?.["סוג חיבור"] || "",
        wireless_charging: initialData?.extraData?.["טעינה אלחוטית"] || "",
        network: initialData?.extraData?.רשת || "",
        esim: initialData?.extraData?.["תמיכה ב-eSIM"] || "",
        nfc: initialData?.extraData?.NFC || "",
        wifi: initialData?.extraData?.WIFI || "",
        headphone_jack: initialData?.extraData?.["חיבור אוזניות"] || "",
        condition: initialData?.condition || "",
        extras: initialData?.extraData?.החרגות || "",
    });

    const [details, setDetails] = useState<FormDetails>({
        title: initialData?.title || "",
        price: initialData?.price ? initialData.price.toString() : "",
        description: initialData?.description || "",
        contactPhone: initialData?.contactPhone || initialData?.extraData?.["טלפון ליצירת קשר"] || "",
        images: initialData?.images || [],
    });

    // Auto-fill phone from DB (Onboarding) or Clerk profile
    useEffect(() => {
        if (details.contactPhone) return; // already filled
        getMyPhone().then(res => {
            if (res.phone) setDetails(d => ({ ...d, contactPhone: res.phone }));
        });
    }, []);

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
            dimensions: result.dimensions || s.dimensions,
            thickness: result.thickness || s.thickness,
            weight: result.weight || s.weight,
            expandable_storage: result.expandable_storage || s.expandable_storage,
            usb_type: result.usb_type || s.usb_type,
            wireless_charging: result.wireless_charging || s.wireless_charging,
            network: result.network || s.network,
            esim: result.esim || s.esim,
            nfc: result.nfc || s.nfc,
            wifi: result.wifi || s.wifi,
            headphone_jack: result.headphone_jack || s.headphone_jack,
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
        if (!details.contactPhone?.trim()) { alert("נא להזין מספר טלפון ליצירת קשר"); return; }

        if (!isEditing) {
            const existingRes = await getMyListings();
            if (existingRes.success && existingRes.listings) {
                const isDuplicate = existingRes.listings.some((l: any) => l.title === details.title.trim());
                if (isDuplicate) {
                    const confirmedDup = confirm("המוצר כבר פורסם! האם אתה בטוח שאתה רוצה לפרסם את אותו מוצר שוב?");
                    if (!confirmedDup) return;
                }
            }
        }

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
                "מידות": spec.dimensions,
                "עובי": spec.thickness,
                "הרחבת זיכרון": spec.expandable_storage,
                "מצלמות אחוריות": spec.rear_camera,
                "מצלמה קדמית": spec.front_camera,
                "קיבולת סוללה": spec.battery,
                "תקינות סוללה": spec.batteryHealth,
                "אחוזי סוללה": spec.batteryPercent ? `${spec.batteryPercent}%` : "",
                "סוג חיבור": spec.usb_type,
                "טעינה אלחוטית": spec.wireless_charging,
                "רשת": spec.network,
                "תמיכה ב-eSIM": spec.esim,
                "NFC": spec.nfc,
                "WIFI": spec.wifi,
                "חיבור אוזניות": spec.headphone_jack,
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
            {/* Header / Close Button */}
            {onCancel && (
                <div className="sticky top-0 z-20 flex justify-end p-4 -mb-12 items-start pointer-events-none">
                    <button onClick={onCancel} className="text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-500 p-2 rounded-full transition-all pointer-events-auto shadow-lg backdrop-blur-md">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
                <div className="mb-8">
                    <MobileSearchUI onApplySpecs={handleApplySearchEngineSpecs} />
                </div>

                <form id="manual-specs-section" onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">

                    {/* BASIC INFO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">פרטי מכשיר בסיסיים</h3>
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
                                placeholder="למשל: iPhone 15 Pro Max 256GB מצב מעולה..."
                                className="bg-gray-800 border-gray-700 text-lg py-6"
                            />
                        </div>

                        {/* ==== SECTION: MANUFACTURER SPECS ==== */}
                        <div className="space-y-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800/80">

                            {/* תצוגה ומבנה */}
                            <div className="space-y-3">
                                <h3 className="text-md font-bold text-gray-200 border-b border-gray-800 pb-1 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-blue-400" /> תצוגה ומבנה
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">גודל מסך</Label>
                                        <Input value={spec.screen} onChange={e => setSpec(s => ({ ...s, screen: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder='6.7"' />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">מידות</Label>
                                        <Input value={spec.dimensions} onChange={e => setSpec(s => ({ ...s, dimensions: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="162.9 x 78.2" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">עובי</Label>
                                        <Input value={spec.thickness} onChange={e => setSpec(s => ({ ...s, thickness: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="7.4mm" />
                                    </div>
                                </div>
                            </div>

                            {/* ביצועים וחומרה */}
                            <div className="space-y-3">
                                <h3 className="text-md font-bold text-gray-200 border-b border-gray-800 pb-1 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-purple-400" /> ביצועים וחומרה
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">מעבד</Label>
                                        <Input value={spec.cpu} onChange={e => setSpec(s => ({ ...s, cpu: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="Octa-core" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">זיכרון עבודה (RAM)</Label>
                                        <Input value={spec.ram} onChange={e => setSpec(s => ({ ...s, ram: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="6GB" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">נפח אחסון (ROM)</Label>
                                        <Input value={spec.storage} onChange={e => setSpec(s => ({ ...s, storage: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="128GB" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">הרחבת זיכרון</Label>
                                        <Input value={spec.expandable_storage} onChange={e => setSpec(s => ({ ...s, expandable_storage: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" placeholder="ללא אפשרות הרחבה..." />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-gray-400 text-xs">מערכת הפעלה</Label>
                                        <Input value={spec.os} onChange={e => setSpec(s => ({ ...s, os: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="Android 15" />
                                    </div>
                                </div>
                            </div>

                            {/* מערך צילום */}
                            <div className="space-y-3">
                                <h3 className="text-md font-bold text-gray-200 border-b border-gray-800 pb-1 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-pink-400" /> מערך צילום
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">מצלמות אחוריות</Label>
                                        <Textarea value={spec.rear_camera} onChange={e => setSpec(s => ({ ...s, rear_camera: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm min-h-[60px]" dir="ltr" placeholder="50MP OIS..." />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">מצלמה קדמית (סלפי)</Label>
                                        <Textarea value={spec.front_camera} onChange={e => setSpec(s => ({ ...s, front_camera: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm min-h-[60px]" dir="ltr" placeholder="12MP..." />
                                    </div>
                                </div>
                            </div>

                            {/* סוללה וטעינה */}
                            <div className="space-y-3">
                                <h3 className="text-md font-bold text-gray-200 border-b border-gray-800 pb-1 flex items-center gap-2">
                                    <Battery className="w-4 h-4 text-green-400" /> סוללה וטעינה
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">קיבולת סוללה</Label>
                                        <Input value={spec.battery} onChange={e => setSpec(s => ({ ...s, battery: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="5,000mAh" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">סוג חיבור</Label>
                                        <Input value={spec.usb_type} onChange={e => setSpec(s => ({ ...s, usb_type: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="USB Type-C" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">טעינה אלחוטית</Label>
                                        <Input value={spec.wireless_charging} onChange={e => setSpec(s => ({ ...s, wireless_charging: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" placeholder="כן / לא" />
                                    </div>
                                </div>
                            </div>

                            {/* קישוריות וטכנולוגיה */}
                            <div className="space-y-3">
                                <h3 className="text-md font-bold text-gray-200 border-b border-gray-800 pb-1 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-yellow-400" /> קישוריות וטכנולוגיה
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">רשת</Label>
                                        <Input value={spec.network} onChange={e => setSpec(s => ({ ...s, network: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" dir="ltr" placeholder="5G" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">תמיכה ב-eSIM</Label>
                                        <Input value={spec.esim} onChange={e => setSpec(s => ({ ...s, esim: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" placeholder="כן / לא" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">NFC</Label>
                                        <Input value={spec.nfc} onChange={e => setSpec(s => ({ ...s, nfc: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" placeholder="כן / לא" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">WIFI</Label>
                                        <Input value={spec.wifi} onChange={e => setSpec(s => ({ ...s, wifi: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" placeholder="כן / לא" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-400 text-xs">חיבור אוזניות (3.5 מ"מ)</Label>
                                        <Input value={spec.headphone_jack} onChange={e => setSpec(s => ({ ...s, headphone_jack: e.target.value }))}
                                            className="bg-gray-800 border-gray-700 text-sm" placeholder="ללא / כן" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extras / damages */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">⚠️ החרגות / נזקים פיזיים</Label>
                            <Input
                                value={spec.extras}
                                onChange={e => setSpec(s => ({ ...s, extras: e.target.value }))}
                                placeholder="למשל: שריטה קטנה בגב, ללא מטען... (השאר ריק אם הכול מושלם)"
                                className="bg-gray-800 border-orange-500/30 text-orange-400 placeholder:text-gray-600 focus:border-orange-500"
                            />
                        </div>

                        {/* Condition */}
                        <div className="space-y-2">
                            <Label className="text-gray-300 font-bold">מצב המכשיר <span className="text-red-500">*</span></Label>
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
                            {!spec.condition && <p className="text-xs text-yellow-500 mt-1">⚠️ אנא בחר מצב מכשיר</p>}
                        </div>

                        {/* Battery Health - between condition and phone */}
                        <div className="space-y-2 border border-gray-700/50 rounded-xl p-3 bg-gray-800/20">
                            <Label className="text-gray-300 text-sm font-semibold">🔋 תקינות סוללה</Label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSpec(s => ({ ...s, batteryHealth: "תקינה" }))}
                                    className={`flex-1 py-2 px-3 text-sm rounded-lg border font-medium transition-all ${spec.batteryHealth === "תקינה"
                                        ? "bg-green-600/20 border-green-500 text-green-300"
                                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800"
                                        }`}
                                >
                                    ✅ תקינה
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSpec(s => ({ ...s, batteryHealth: "לא תקינה" }))}
                                    className={`flex-1 py-2 px-3 text-sm rounded-lg border font-medium transition-all ${spec.batteryHealth === "לא תקינה"
                                        ? "bg-red-600/20 border-red-500 text-red-300"
                                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800"
                                        }`}
                                >
                                    ❌ לא תקינה
                                </button>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <Label className="text-gray-400 text-sm whitespace-nowrap">בריאות סוללה:</Label>
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        type="number"
                                        min="1" max="100"
                                        value={spec.batteryPercent}
                                        onChange={e => setSpec(s => ({ ...s, batteryPercent: e.target.value }))}
                                        className="bg-gray-800 border-gray-700 w-24 text-center"
                                        dir="ltr"
                                        placeholder="100"
                                    />
                                    <span className="text-gray-400 text-sm">%</span>
                                    {spec.batteryPercent && (
                                        <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${Number(spec.batteryPercent) > 80 ? 'bg-green-500' :
                                                    Number(spec.batteryPercent) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${Math.min(100, Number(spec.batteryPercent))}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-bold">טלפון ליצירת קשר <span className="text-red-500">*</span></Label>
                                <Input value={details.contactPhone} onChange={e => setDetails(d => ({ ...d, contactPhone: e.target.value }))} dir="ltr" className="bg-gray-800 border-gray-700" placeholder="05X-XXXXXXX" />
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

                    {/* ──── DYNAMIC RISK / DATA SUMMARY REPORT ──── */}
                    <div className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5 space-y-4">
                        <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                            📋 דוח סיכום נתונים – בדוק לפני פרסום
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                { label: "יצרן", val: spec.brand, required: true },
                                { label: "דגם", val: spec.model, required: true },
                                { label: "זיכרון RAM", val: spec.ram, required: false },
                                { label: "אחסון", val: spec.storage, required: false },
                                { label: "מסך", val: spec.screen, required: false },
                                { label: "מעבד", val: spec.cpu, required: false },
                                { label: "מערכת הפעלה", val: spec.os, required: false },
                                { label: "סוללה %", val: spec.batteryPercent ? `${spec.batteryPercent}%` : "", required: false },
                                { label: "מצב המכשיר", val: spec.condition, required: true },
                                { label: "נזקים / החרגות", val: spec.extras || "ללא", required: false },
                                { label: "מחיר", val: details.price ? `₪${Number(details.price.replace(/,/g, "")).toLocaleString()}` : "", required: true },
                                { label: "טלפון לקשר", val: details.contactPhone, required: true },
                                { label: "🖼️ תמונות", val: details.images.length > 0 ? `${details.images.length} תמונות` : "", required: false, warning: true },
                            ].map(({ label, val, required, warning }) => {
                                const isWarning = !val && warning;
                                return (
                                    <div key={label} className={`flex items-start gap-2 p-2 rounded-lg ${val
                                        ? "bg-gray-800/60"
                                        : required
                                            ? "bg-red-900/20 border border-red-800/40"
                                            : isWarning
                                                ? "bg-yellow-900/20 border border-yellow-700/40"
                                                : "bg-gray-800/30 border border-gray-700/40"
                                        }`}>
                                        <span className={val ? "text-green-400" : required ? "text-red-400" : isWarning ? "text-yellow-400" : "text-gray-500"} style={{ flexShrink: 0 }}>
                                            {val ? "✓" : required ? "✗" : isWarning ? "!" : "–"}
                                        </span>
                                        <span className="text-gray-400">{label}:</span>
                                        <span className={`font-medium truncate ${val ? "text-white" : required ? "text-red-400" : isWarning ? "text-yellow-400" : "text-gray-600"
                                            }`}>{val || (required ? "חסר!" : isWarning ? "מומלץ להוסיף" : "לא מולא")}</span>
                                    </div>
                                );
                            })}
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
