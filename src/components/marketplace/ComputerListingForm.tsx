"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createListing, updateListing } from "@/app/actions/marketplace";
import { Loader2, Plus, Image as ImageIcon, X, Search, ChevronDown, Check, Monitor, Cpu, MemoryStick, HardDrive, Maximize2, AlertCircle, Sparkles } from "lucide-react";
import {
    COMPUTER_DATABASE,
    RAM_OPTIONS,
    STORAGE_OPTIONS,
    SCREEN_SIZE_OPTIONS,
    OS_OPTIONS,
    GPU_OPTIONS,
    CPU_OPTIONS,
    ComputerModelFamily,
    ComputerSubModel,
    getSpecOptionsForSubModel,
    CONDITION_OPTIONS
} from "@/lib/computer-data";

// ---- Types ----
interface ComputerSpec {
    brand: string;
    family: string;
    subModel: string;
    ram: string;
    storage: string;
    screen: string;
    cpu: string;
    gpu: string;
    os: string;
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

interface ComputerListingFormProps {
    onComplete: () => void;
    onCancel?: () => void;
    initialData?: any;
    isEditing?: boolean;
    listingId?: string;
}

const COMPUTER_TYPE_LABELS: Record<string, string> = {
    laptop: "💻 נייד",
    desktop: "🖥️ נייח",
    gaming: "🎮 גיימינג",
    workstation: "⚙️ תחנת עבודה",
    "all-in-one": "🖥️ All-in-One",
    mini: "📦 מיני PC",
};

// ---- Searchable Dropdown ----
function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder,
    disabled = false,
    emptyLabel = "אין תוצאות",
    uncertain = false,
}: {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    disabled?: boolean;
    emptyLabel?: string;
    uncertain?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() =>
        options.filter(o => o.toLowerCase().includes(query.toLowerCase())),
        [options, query]
    );

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm text-right transition-all
                    ${disabled ? "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed" :
                        uncertain ? "bg-yellow-500/5 border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-300" :
                            open ? "bg-gray-800 border-purple-500 shadow-[0_0_0_2px_rgba(168,85,247,0.2)]" :
                                "bg-gray-800 border-gray-700 hover:border-gray-500"}`}
            >
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180 text-purple-400" : uncertain ? "text-yellow-500/50" : "text-gray-400"}`} />
                <span className={value ? (uncertain ? "text-yellow-100 font-medium" : "text-white") : "text-gray-500"}>
                    {value || placeholder}
                </span>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="חפש ברשימה..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pr-7 pl-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
                                dir="auto"
                            />
                        </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">{emptyLabel}</div>
                        ) : (
                            filtered.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => { onChange(opt); setOpen(false); setQuery(""); }}
                                    className={`w-full text-right px-4 py-2 text-sm transition-colors flex items-center justify-between
                                        ${value === opt ? "bg-purple-600/30 text-purple-200" : "text-gray-200 hover:bg-gray-800"}`}
                                >
                                    <span>{value === opt && <Check className="w-3.5 h-3.5 text-purple-400" />}</span>
                                    <span>{opt}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ---- Spec Selector with "Uncertain" states ----
function SpecSelector({
    label,
    options,
    value,
    onChange,
    icon,
    disabled = false,
    placeholder,
    uncertain = false,
    onConfirm,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    placeholder?: string;
    uncertain?: boolean;
    onConfirm?: () => void;
}) {
    return (
        <div className={`space-y-1.5 p-3 rounded-xl border transition-all ${uncertain ? 'bg-yellow-500/10 border-yellow-500/40 relative' : 'bg-transparent border-transparent'}`}>
            <div className="flex items-center justify-between mb-1 text-sm">
                <div className="flex items-center gap-2">
                    {icon && <span className={uncertain ? "text-yellow-500" : "text-purple-400"}>{icon}</span>}
                    <Label className={uncertain ? "text-yellow-400 font-bold flex items-center gap-1.5" : "text-gray-300 font-medium"}>
                        {label}
                        {uncertain && <span title="נתון זה הושלם אוטומטית - אנא אמת שיש בידך את אותו המפרט"><AlertCircle className="w-3.5 h-3.5 animate-pulse" /></span>}
                    </Label>
                </div>
                {uncertain && onConfirm && (
                    <button type="button" onClick={onConfirm} className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-2 py-0.5 rounded transition-colors flex items-center gap-1">
                        <Check className="w-3 h-3" /> אשר
                    </button>
                )}
            </div>

            <SearchableDropdown
                options={options}
                value={value}
                onChange={(val) => {
                    onChange(val);
                    if (onConfirm) onConfirm(); // Interacting with it counts as confirm
                }}
                disabled={disabled}
                placeholder={placeholder || `בחר ${label}`}
                uncertain={uncertain}
            />
        </div>
    );
}

// ============================================================
//  MAIN COMPONENT (One Page Smart Form)
// ============================================================
export function ComputerListingForm({ onComplete, onCancel, initialData, isEditing, listingId }: ComputerListingFormProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");

    // Tracking uncertain auto-filled fields
    const [uncertainFields, setUncertainFields] = useState<string[]>([]);

    // Global search for submodels
    const [globalSearch, setGlobalSearch] = useState("");
    const [showGlobalResults, setShowGlobalResults] = useState(false);

    const [spec, setSpec] = useState<ComputerSpec>({
        brand: initialData?.extraData?.יצרן || "",
        family: initialData?.extraData?.סדרה || "",
        subModel: initialData?.extraData?.דגם || "",
        ram: initialData?.extraData?.RAM || "",
        storage: initialData?.extraData?.["נפח אחסון"] || "",
        screen: initialData?.extraData?.["גודל מסך"] || "",
        cpu: initialData?.extraData?.מעבד || "",
        gpu: initialData?.extraData?.["כרטיס מסך"] || "",
        os: initialData?.extraData?.["מערכת הפעלה"] || "",
        condition: initialData?.condition || "Used",
        extras: initialData?.extraData?.החרגות || "",
    });

    const [details, setDetails] = useState<FormDetails>({
        title: initialData?.title || "",
        price: initialData?.price ? initialData.price.toString() : "",
        description: initialData?.description || "",
        contactPhone: initialData?.contactPhone || initialData?.extraData?.["טלפון ליצירת קשר"] || user?.primaryPhoneNumber?.phoneNumber || "",
        images: initialData?.images || [],
    });

    const removeUncertain = (field: string) => {
        setUncertainFields(prev => prev.filter(f => f !== field));
    };

    // Auto-generate title logic
    useEffect(() => {
        if (spec.brand && spec.subModel) {
            const parts = [
                spec.brand,
                spec.subModel,
                spec.cpu ? `- ${spec.cpu.replace("Apple ", "").replace("Intel Core ", "").replace("AMD Ryzen ", "Ryzen ")}` : "",
                spec.ram ? `${spec.ram}` : "",
                spec.storage ? `${spec.storage}` : "",
            ].filter(Boolean);
            const auto = parts.join(" ").substring(0, 80);
            setDetails(d => ({ ...d, title: auto }));
        }
    }, [spec.brand, spec.subModel, spec.cpu, spec.ram, spec.storage]);

    // Flat list of all available submodels for the fast global search
    const allModelsFlat = useMemo(() => {
        const list: { brand: string; family: ComputerModelFamily; sub: ComputerSubModel; sku?: any; searchText: string; displayName: string }[] = [];
        for (const brand of Object.keys(COMPUTER_DATABASE)) {
            const families = COMPUTER_DATABASE[brand];
            for (const fam of families) {
                for (const sub of fam.subModels) {
                    // add the base submodel
                    list.push({
                        brand,
                        family: fam,
                        sub,
                        searchText: `${brand} ${fam.name} ${sub.name}`.toLowerCase(),
                        displayName: sub.name
                    });

                    // add specific SKUs
                    if (sub.skus) {
                        for (const sku of sub.skus) {
                            list.push({
                                brand,
                                family: fam,
                                sub,
                                sku,
                                searchText: `${brand} ${fam.name} ${sub.name} ${sku.id}`.toLowerCase(),
                                displayName: `${sub.name} (מק"ט: ${sku.id})`
                            });
                        }
                    }
                }
            }
        }
        return list;
    }, []);

    const filteredGlobalModels = useMemo(() => {
        if (!globalSearch.trim()) return [];
        const queryTerms = globalSearch.toLowerCase().split(' ').filter(Boolean);
        return allModelsFlat.filter(m =>
            queryTerms.every(term => m.searchText.includes(term))
        ).slice(0, 10); // show top 10
    }, [globalSearch, allModelsFlat]);

    // Derived options based on current selections
    const modelFamilies = useMemo(() => spec.brand ? (COMPUTER_DATABASE[spec.brand] || []) : [], [spec.brand]);
    const selectedFamilyObj = useMemo(() => modelFamilies.find(f => f.name === spec.family), [spec.family, modelFamilies]);
    const subModelsList = useMemo(() => selectedFamilyObj ? selectedFamilyObj.subModels : [], [selectedFamilyObj]);

    const specOptions = useMemo(() => {
        if (spec.brand && spec.family && spec.subModel) {
            return getSpecOptionsForSubModel(spec.brand, spec.family, spec.subModel);
        }
        return {
            ram: RAM_OPTIONS,
            storage: STORAGE_OPTIONS,
            screen: SCREEN_SIZE_OPTIONS,
            cpu: [...CPU_OPTIONS.Intel, ...CPU_OPTIONS.AMD, ...CPU_OPTIONS.Apple],
            gpu: GPU_OPTIONS,
        };
    }, [spec.brand, spec.family, spec.subModel]);

    // "Smart Pick" Logic
    const applySmartModelPick = (brand: string, familyName: string, sub: ComputerSubModel, sku?: any) => {
        const newSpec = { ...spec, brand, family: familyName, subModel: sub.name };
        const newUncertain: string[] = [];

        // Choose source data: specific SKU if provided, else general submodel
        const sourceData = sku || sub;

        // Autofill logic
        if (sourceData.screenSize && sourceData.screenSize.length > 0) {
            newSpec.screen = sourceData.screenSize[0];
            if (sourceData.screenSize.length > 1) newUncertain.push('screen');
        }
        if (sourceData.cpu && sourceData.cpu.length > 0) {
            newSpec.cpu = sourceData.cpu[0];
            if (sourceData.cpu.length > 1) newUncertain.push('cpu');
        }
        if (sourceData.gpu && sourceData.gpu.length > 0) {
            newSpec.gpu = sourceData.gpu[0];
            if (sourceData.gpu.length > 1) newUncertain.push('gpu');
        }
        if (sourceData.ram && sourceData.ram.length > 0) {
            newSpec.ram = sourceData.ram[0];
            if (sourceData.ram.length > 1) newUncertain.push('ram');
        }
        if (sourceData.storage && sourceData.storage.length > 0) {
            newSpec.storage = sourceData.storage[0];
            if (sourceData.storage.length > 1) newUncertain.push('storage');
        }
        if (sourceData.os && sourceData.os.length > 0) {
            newSpec.os = sourceData.os[0];
            if (sourceData.os.length > 1) newUncertain.push('os');
        }

        setSpec(newSpec);
        setUncertainFields(newUncertain);
        setGlobalSearch("");
        setShowGlobalResults(false);
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
        if (!spec.brand || !spec.subModel) { alert("נא לבחור יצרן ודגם"); return; }
        if (uncertainFields.length > 0) {
            const confirmed = confirm("חלק מהמפרט שסופק אוטומטית (מסומן בצהוב) עדיין לא אושר על ידך. האם אתה בטוח שאתה רוצה לפרסם?");
            if (!confirmed) return;
        }

        setLoading(true);
        try {
            const extraData: Record<string, string> = {
                "סוג המחשב": selectedFamilyObj ? selectedFamilyObj.type : "",
                "יצרן": spec.brand,
                "סדרה": spec.family,
                "דגם": spec.subModel,
                "מעבד": spec.cpu,
                "RAM": spec.ram,
                "נפח אחסון": spec.storage,
                "גודל מסך": spec.screen,
                "כרטיס מסך": spec.gpu,
                "מערכת הפעלה": spec.os,
                "החרגות": spec.extras,
            };
            Object.keys(extraData).forEach(k => { if (!extraData[k]) delete extraData[k]; });
            if (details.contactPhone) extraData["טלפון ליצירת קשר"] = details.contactPhone;

            const payload = {
                title: details.title,
                description: details.description,
                price: parseFloat(details.price || "0"),
                condition: spec.condition,
                category: "Computers",
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
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        פרסום מחשב חכם
                    </h2>
                    <p className="text-gray-400 text-xs">הזן דגם ואנו נשלים עבורך את שאר הפרטים!</p>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="text-gray-500 hover:text-white bg-gray-800 p-1.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">

                {/* GLOBAL SEARCH HERO */}
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-5 mb-8 relative">
                    <Label className="text-indigo-300 font-bold mb-3 block text-base text-center">הדרך המהירה - להזין רק שם של דגם 🚀</Label>
                    <div className="relative">
                        <Search className="absolute right-3 top-3 w-5 h-5 text-indigo-400" />
                        <Input
                            value={globalSearch}
                            onChange={(e) => {
                                setGlobalSearch(e.target.value);
                                setShowGlobalResults(true);
                            }}
                            onFocus={() => setShowGlobalResults(true)}
                            placeholder='חפש דגם... למשל "Thinkpad X1" או "Macbook Pro M2"'
                            className="bg-black/50 border-indigo-500/30 pr-10 pl-4 py-6 text-lg rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.1)] focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                            dir="ltr"
                        />
                        {globalSearch && (
                            <button onClick={() => { setGlobalSearch(''); setShowGlobalResults(false); }} className="absolute left-3 top-3 text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {showGlobalResults && globalSearch.length > 1 && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-gray-900 border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-72 overflow-y-auto">
                            {filteredGlobalModels.length > 0 ? (
                                filteredGlobalModels.map(m => (
                                    <button
                                        key={`${m.brand}-${m.family.name}-${m.sub.name}-${m.sku?.id || 'base'}`}
                                        onClick={() => applySmartModelPick(m.brand, m.family.name, m.sub, m.sku)}
                                        className="w-full text-right p-3 hover:bg-indigo-900/40 border-b border-gray-800 last:border-0 transition-colors"
                                    >
                                        <div className="font-bold text-white text-base" dir="ltr">{m.displayName}</div>
                                        <div className="text-indigo-300/70 text-xs mt-0.5">{m.brand} • {m.family.name}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">לא נמצא דגם שתואם להתחלה הזו... נסה צורת כתיבה אחרת.</div>
                            )}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">

                    {/* ==== SECTION: IDENTIFICATION ==== */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">זיהוי (יצרן וסדרה)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SpecSelector
                                label="יצרן"
                                options={Object.keys(COMPUTER_DATABASE)}
                                value={spec.brand}
                                onChange={v => {
                                    setSpec(s => ({ ...s, brand: v }));
                                }}
                            />
                            <SpecSelector
                                label="סדרה (Family)"
                                options={spec.brand ? modelFamilies.map(f => f.name) : Array.from(new Set(allModelsFlat.map(m => m.family.name)))}
                                value={spec.family}
                                onChange={v => {
                                    const mappedBrand = spec.brand ? spec.brand : allModelsFlat.find(m => m.family.name === v)?.brand || "";
                                    setSpec(s => ({ ...s, brand: mappedBrand, family: v }));
                                }}
                            />
                            <SpecSelector
                                label="תת דגם / מק״ט"
                                options={[...(spec.family ? subModelsList.map(s => s.name) : Array.from(new Set(allModelsFlat.map(m => m.sub.name)))), "אחר / לא ברשימה"]}
                                value={spec.subModel}
                                onChange={v => {
                                    if (v !== "אחר / לא ברשימה") {
                                        const found = allModelsFlat.find(m => m.sub.name === v || m.displayName === v);
                                        if (found) applySmartModelPick(found.brand, found.family.name, found.sub, found.sku);
                                    } else {
                                        setSpec(s => ({ ...s, subModel: v }));
                                    }
                                }}
                            />
                        </div>
                        {spec.subModel === "אחר / לא ברשימה" && (
                            <Input
                                value={spec.subModel === "אחר / לא ברשימה" ? "" : spec.subModel}
                                onChange={e => setSpec(s => ({ ...s, subModel: e.target.value }))}
                                placeholder="הקלד את הדגם המלא ידנית..."
                                className="bg-gray-800 border-gray-700"
                                dir="ltr"
                            />
                        )}
                    </div>

                    {/* ==== SECTION: SPECS ==== */}
                    <div className="space-y-4 relative">
                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">מפרט טכני</h3>
                        {!spec.brand && !spec.family && !spec.subModel && <div className="absolute inset-x-0 bottom-0 top-10 bg-gray-900/80 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center">
                            <div className="text-gray-400 bg-gray-900 border border-gray-700 px-4 py-2 rounded-full text-sm">אנא בחר דגם או התחל זיהוי מהיר למעלה</div>
                        </div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SpecSelector
                                label="זיכרון RAM"
                                options={specOptions.ram}
                                value={spec.ram}
                                onChange={v => setSpec(s => ({ ...s, ram: v }))}
                                icon={<MemoryStick className="w-4 h-4" />}
                                uncertain={uncertainFields.includes('ram')}
                                onConfirm={() => removeUncertain('ram')}
                            />
                            <SpecSelector
                                label="נפח אחסון"
                                options={specOptions.storage}
                                value={spec.storage}
                                onChange={v => setSpec(s => ({ ...s, storage: v }))}
                                icon={<HardDrive className="w-4 h-4" />}
                                uncertain={uncertainFields.includes('storage')}
                                onConfirm={() => removeUncertain('storage')}
                            />
                            <SpecSelector
                                label="מעבד (CPU)"
                                options={specOptions.cpu}
                                value={spec.cpu}
                                onChange={v => setSpec(s => ({ ...s, cpu: v }))}
                                icon={<Cpu className="w-4 h-4" />}
                                uncertain={uncertainFields.includes('cpu')}
                                onConfirm={() => removeUncertain('cpu')}
                            />
                            <SpecSelector
                                label="כרטיס מסך (GPU)"
                                options={specOptions.gpu.length > 0 ? specOptions.gpu : GPU_OPTIONS}
                                value={spec.gpu}
                                onChange={v => setSpec(s => ({ ...s, gpu: v }))}
                                icon={<Monitor className="w-4 h-4" />}
                                uncertain={uncertainFields.includes('gpu')}
                                onConfirm={() => removeUncertain('gpu')}
                            />
                            <SpecSelector
                                label="גודל מסך"
                                options={specOptions.screen}
                                value={spec.screen}
                                onChange={v => setSpec(s => ({ ...s, screen: v }))}
                                icon={<Maximize2 className="w-4 h-4" />}
                                uncertain={uncertainFields.includes('screen')}
                                onConfirm={() => removeUncertain('screen')}
                                disabled={selectedFamilyObj?.type === "desktop" || selectedFamilyObj?.type === "mini"}
                            />
                            <SpecSelector
                                label="מערכת הפעלה"
                                options={OS_OPTIONS}
                                value={spec.os}
                                onChange={v => setSpec(s => ({ ...s, os: v }))}
                                uncertain={uncertainFields.includes('os')}
                                onConfirm={() => removeUncertain('os')}
                            />
                        </div>
                    </div>

                    {/* ==== SECTION: DETAILS ==== */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">פרטים ומצב המחשב</h3>

                        <div className="space-y-2">
                            <Label className="text-gray-300">החרגות / נזקים פיזיים</Label>
                            <Input
                                value={spec.extras}
                                onChange={e => setSpec(s => ({ ...s, extras: e.target.value }))}
                                placeholder="למשל: סוללה חלשה, בקע קטן בפלסטיק... (השאר ריק אם הכול מושלם)"
                                className="bg-gray-800 border-orange-500/30 text-orange-400 placeholder:text-gray-600 focus:border-orange-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">לסיכום - מה מצבו?</Label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                {CONDITION_OPTIONS.map(opt => {
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
                                placeholder="כתוב כאן כל מה שצריך מסביב - סיבת מכירה, תוספות מעניינות..."
                                className="bg-gray-800 border-gray-700 h-24"
                            />
                        </div>
                    </div>

                    {/* ==== SECTION: IMAGES ==== */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">גלריית תמונות</h3>
                        <p className="text-gray-500 text-xs mt-1 mb-2">בעתיד המערכת תוסיף כאן באופן אוטומטי תמונת מלאי (Stock Image) לדגם במידה ואין ברשותך תמונות מקור.</p>

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
                                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-purple-400 mb-2" /> : <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />}
                                <span className="text-sm font-medium text-gray-300">{uploading ? "מעלה תמונה..." : "העלה קובץ מהמכשיר"}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>

                            <div className="flex-1 flex flex-col justify-center gap-2">
                                <Label className="text-gray-400 text-xs">או הזן קישור מרשת:</Label>
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
                            disabled={loading || !spec.brand || !spec.subModel || !details.price}
                            className={`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-lg ${uncertainFields.length > 0
                                ? "bg-yellow-600 hover:bg-yellow-700 text-white" // highlight that something needs checking
                                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20"
                                }`}
                        >
                            {loading ? <Loader2 className="animate-spin w-6 h-6 ml-2" /> : null}
                            {uncertainFields.length > 0 ? "פרסם מודעה (שים לב לנתונים הצהובים)" : "פרסם מודעה 🚀"}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
