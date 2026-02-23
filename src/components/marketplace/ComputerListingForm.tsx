"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { createListing, updateListing } from "@/app/actions/marketplace";
import { Loader2, Plus, Image as ImageIcon, X, Search, ChevronRight, ChevronDown, Check, Monitor, Cpu, MemoryStick, HardDrive, Maximize2 } from "lucide-react";
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
    CONDITION_OPTIONS,
} from "@/lib/computer-data";

// ---- Types ----
type Step = "brand" | "family" | "submodel" | "specs" | "details";

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

// ---- Utility ----
const COMPUTER_TYPE_LABELS: Record<string, string> = {
    laptop: "💻 מחשב נייד (Laptop)",
    desktop: "🖥️ מחשב נייח (Desktop)",
    gaming: "🎮 מחשב גיימינג",
    workstation: "⚙️ תחנת עבודה",
    "all-in-one": "🖥️ All-in-One",
    mini: "📦 מיני מחשב (Mini PC)",
};

function SpecBadge({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-300">
            {icon && <span className="text-purple-400">{icon}</span>}
            <span className="text-gray-400">{label}:</span>
            <span className="font-medium text-white">{value}</span>
        </div>
    );
}

// ---- Dropdown with search ----
function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder,
    disabled = false,
    emptyLabel = "אין תוצאות",
}: {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    disabled?: boolean;
    emptyLabel?: string;
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
                        open ? "bg-gray-800 border-purple-500 shadow-[0_0_0_2px_rgba(168,85,247,0.2)]" :
                            "bg-gray-800 border-gray-700 hover:border-gray-500"}`}
            >
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                <span className={value ? "text-white" : "text-gray-500"}>{value || placeholder}</span>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {/* Search inside */}
                    <div className="p-2 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="חפש..."
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
                                    className={`w-full text-right px-4 py-2.5 text-sm transition-colors flex items-center justify-between
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

// ---- Spec Row with collapsible table ----
function SpecSelector({
    label,
    options,
    value,
    onChange,
    icon,
    disabled = false,
    placeholder,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                {icon && <span className="text-purple-400">{icon}</span>}
                <Label className="text-gray-300 text-sm">{label}</Label>
                {value && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{value}</span>}
            </div>
            <SearchableDropdown
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder || `בחר ${label}`}
                disabled={disabled}
            />
        </div>
    );
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export function ComputerListingForm({ onComplete, onCancel, initialData, isEditing, listingId }: ComputerListingFormProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState<Step>("brand");
    const [imageUrlInput, setImageUrlInput] = useState("");

    // ---- Computer Specs State ----
    const [spec, setSpec] = useState<ComputerSpec>({
        brand: initialData?.extraData?.יצרן || "",
        family: "",
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

    // ---- Brand search ----
    const [brandSearch, setBrandSearch] = useState(spec.brand || "");
    const [selectedFamily, setSelectedFamily] = useState<ComputerModelFamily | null>(null);
    const [selectedSubModel, setSelectedSubModel] = useState<ComputerSubModel | null>(null);

    // ---- Form Details ----
    const [details, setDetails] = useState<FormDetails>({
        title: initialData?.title || "",
        price: initialData?.price ? initialData.price.toString() : "",
        description: initialData?.description || "",
        contactPhone: initialData?.contactPhone || initialData?.extraData?.["טלפון ליצירת קשר"] || user?.primaryPhoneNumber?.phoneNumber || "",
        images: initialData?.images || [],
    });

    // Autofill phone from user
    useEffect(() => {
        if (user?.primaryPhoneNumber?.phoneNumber && !details.contactPhone) {
            setDetails(d => ({ ...d, contactPhone: user.primaryPhoneNumber!.phoneNumber }));
        }
    }, [user, details.contactPhone]);

    // ---- Filtered brands ----
    const filteredBrands = useMemo(() => {
        const q = brandSearch.toLowerCase().trim();
        if (!q) return Object.keys(COMPUTER_DATABASE);
        return Object.keys(COMPUTER_DATABASE).filter(b => b.toLowerCase().includes(q));
    }, [brandSearch]);

    // ---- Model families for selected brand ----
    const modelFamilies = useMemo(() => {
        return spec.brand ? (COMPUTER_DATABASE[spec.brand] || []) : [];
    }, [spec.brand]);

    // ---- Sub models for selected family ----
    const subModels = useMemo(() => {
        return selectedFamily?.subModels || [];
    }, [selectedFamily]);

    // ---- Spec options based on selection ----
    const specOptions = useMemo(() => {
        if (spec.brand && selectedFamily && spec.subModel) {
            return getSpecOptionsForSubModel(spec.brand, selectedFamily.name, spec.subModel);
        }
        return {
            ram: RAM_OPTIONS,
            storage: STORAGE_OPTIONS,
            screen: SCREEN_SIZE_OPTIONS,
            cpu: [...CPU_OPTIONS.Intel, ...CPU_OPTIONS.AMD],
            gpu: GPU_OPTIONS,
        };
    }, [spec.brand, selectedFamily, spec.subModel]);

    // ---- Auto-generate title ----
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

    // ---- Price input formatter ----
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, "").replace(/\D/g, "");
        setDetails(d => ({ ...d, price: val }));
    };

    // ---- Image handling ----
    const addImageUrl = () => {
        if (imageUrlInput.trim()) {
            setDetails(d => ({ ...d, images: [...d.images, imageUrlInput.trim()] }));
            setImageUrlInput("");
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
            if (data.success) setDetails(d => ({ ...d, images: [...d.images, data.url] }));
            else alert("שגיאה בהעלאה: " + data.error);
        } catch { alert("שגיאה בהעלאה"); }
        finally { setUploading(false); }
    };

    // ---- Submit ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!spec.brand) { alert("נא לבחור יצרן"); return; }
        if (!details.price) { alert("נא להזין מחיר"); return; }

        setLoading(true);
        try {
            const extraData: Record<string, string> = {
                "סוג המחשב": selectedFamily ? (COMPUTER_TYPE_LABELS[selectedFamily.type] || selectedFamily.type) : "",
                "יצרן": spec.brand,
                "סדרה": selectedFamily?.name || "",
                "דגם": spec.subModel,
                "מעבד": spec.cpu,
                "RAM": spec.ram,
                "נפח אחסון": spec.storage,
                "גודל מסך": spec.screen,
                "כרטיס מסך": spec.gpu,
                "מערכת הפעלה": spec.os,
                "החרגות": spec.extras,
            };
            // Remove empty
            Object.keys(extraData).forEach(k => { if (!extraData[k]) delete extraData[k]; });
            if (details.contactPhone) extraData["טלפון ליצירת קשר"] = details.contactPhone;

            const payload = {
                title: details.title || `${spec.brand} ${spec.subModel}`,
                description: details.description,
                price: parseFloat(details.price.replace(/,/g, "") || "0"),
                condition: spec.condition,
                category: "Computers",
                images: details.images,
                videos: [],
                extraData,
            };

            const res = isEditing && listingId
                ? await updateListing(listingId, payload)
                : await createListing(payload);

            if (res.success) {
                onComplete();
            } else {
                alert("שגיאה: " + (res as any).error);
            }
        } catch (err: any) {
            alert("שגיאה: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ---- Step progression ----
    const STEPS: { id: Step; label: string; icon: string }[] = [
        { id: "brand", label: "יצרן", icon: "🏭" },
        { id: "family", label: "סדרה", icon: "📁" },
        { id: "submodel", label: "דגם", icon: "💻" },
        { id: "specs", label: "מפרט", icon: "⚙️" },
        { id: "details", label: "פרטים", icon: "📋" },
    ];

    // --- Render current step ---
    const renderStepContent = () => {
        switch (step) {
            // ===================== STEP 1: BRAND =====================
            case "brand":
                return (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                value={brandSearch}
                                onChange={e => setBrandSearch(e.target.value)}
                                placeholder="חפש יצרן (Lenovo, Apple, Dell...)"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_2px_rgba(168,85,247,0.2)] transition-all"
                                dir="ltr"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {filteredBrands.map(brand => {
                                const families = COMPUTER_DATABASE[brand] || [];
                                const types = [...new Set(families.map(f => f.type))];
                                const isSelected = spec.brand === brand;
                                return (
                                    <button
                                        key={brand}
                                        type="button"
                                        onClick={() => {
                                            setSpec(s => ({ ...s, brand, family: "", subModel: "", ram: "", storage: "", screen: "", cpu: "", gpu: "", os: "" }));
                                            setSelectedFamily(null);
                                            setSelectedSubModel(null);
                                        }}
                                        className={`relative text-right p-4 rounded-xl border transition-all text-sm group
                                            ${isSelected
                                                ? "bg-purple-600/20 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                                                : "bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800"}`}
                                    >
                                        {isSelected && (
                                            <span className="absolute top-2 left-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </span>
                                        )}
                                        <div className="font-bold text-white text-base">{brand}</div>
                                        <div className="mt-1 flex flex-wrap gap-1 justify-end">
                                            {types.slice(0, 3).map(t => (
                                                <span key={t} className="text-xs text-gray-500">
                                                    {t === "laptop" ? "נייד" : t === "gaming" ? "גיימינג" : t === "desktop" ? "נייח" : t === "workstation" ? "תחנת עבודה" : t}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">{families.length} סדרות</div>
                                    </button>
                                );
                            })}
                        </div>

                        {filteredBrands.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                                <div className="text-2xl mb-2">🔍</div>
                                <div>לא נמצא יצרן כזה</div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSpec(s => ({ ...s, brand: brandSearch }));
                                    }}
                                    className="mt-2 text-purple-400 text-sm hover:underline"
                                >
                                    המשך עם &quot;{brandSearch}&quot;
                                </button>
                            </div>
                        )}
                    </div>
                );

            // ===================== STEP 2: FAMILY (Series) =====================
            case "family":
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span className="font-medium text-white">{spec.brand}</span>
                            <ChevronRight className="w-4 h-4" />
                            <span>בחר סדרה</span>
                        </div>

                        {modelFamilies.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>לא נמצאו סדרות</p>
                                <button type="button" onClick={() => setStep("submodel")} className="mt-2 text-purple-400 text-sm hover:underline">
                                    דלג לבחירת דגם ידנית
                                </button>
                            </div>
                        ) : (
                            modelFamilies.map(family => {
                                const isSelected = selectedFamily?.name === family.name;
                                return (
                                    <button
                                        key={family.name}
                                        type="button"
                                        onClick={() => {
                                            setSelectedFamily(family);
                                            setSpec(s => ({ ...s, family: family.name, subModel: "" }));
                                            setSelectedSubModel(null);
                                        }}
                                        className={`w-full text-right px-4 py-3 rounded-xl border transition-all flex items-center justify-between
                                            ${isSelected
                                                ? "bg-purple-600/20 border-purple-500"
                                                : "bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800"}`}
                                    >
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 text-xs">{family.subModels.length} דגמים</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                                                {COMPUTER_TYPE_LABELS[family.type]?.split(" ")[0] || family.type}
                                            </span>
                                            {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{family.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {COMPUTER_TYPE_LABELS[family.type] || family.type}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                );

            // ===================== STEP 3: SUB MODEL =====================
            case "submodel":
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span className="font-medium text-white">{spec.brand}</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white">{selectedFamily?.name}</span>
                            <ChevronRight className="w-4 h-4" />
                            <span>בחר דגם ספציפי</span>
                        </div>

                        {subModels.length === 0 ? (
                            <div className="space-y-2">
                                <Label className="text-gray-300">הכנס דגם ידנית</Label>
                                <Input
                                    value={spec.subModel}
                                    onChange={e => setSpec(s => ({ ...s, subModel: e.target.value }))}
                                    placeholder="למשל: ThinkPad X1 Carbon Gen 12"
                                    className="bg-gray-800 border-gray-700"
                                    dir="ltr"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="חפש דגם..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pr-9 pl-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                                        dir="ltr"
                                        onChange={e => {
                                            // filter handled inline
                                        }}
                                        id="submodel-search"
                                    />
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {subModels.map(sub => {
                                        const isSelected = spec.subModel === sub.name;
                                        return (
                                            <button
                                                key={sub.name}
                                                type="button"
                                                onClick={() => {
                                                    setSpec(s => ({ ...s, subModel: sub.name }));
                                                    setSelectedSubModel(sub);
                                                }}
                                                className={`w-full text-right px-4 py-3 rounded-xl border transition-all
                                                    ${isSelected
                                                        ? "bg-purple-600/20 border-purple-500"
                                                        : "bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800"}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-wrap gap-1">
                                                        {sub.screenSize?.map(s => (
                                                            <span key={s} className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">{s}</span>
                                                        ))}
                                                        {sub.ram && (
                                                            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">RAM: {sub.ram.slice(0, 2).join("/")}...</span>
                                                        )}
                                                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                                                    </div>
                                                    <div className="font-medium text-white text-sm">{sub.name}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSpec(s => ({ ...s, subModel: "אחר / לא ברשימה" }))}
                                    className="w-full text-right px-4 py-2.5 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 text-sm transition-all"
                                >
                                    דגם אחר / לא ברשימה
                                </button>

                                {spec.subModel === "אחר / לא ברשימה" && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <Input
                                            value={spec.subModel === "אחר / לא ברשימה" ? "" : spec.subModel}
                                            onChange={e => setSpec(s => ({ ...s, subModel: e.target.value }))}
                                            placeholder="הכנס דגם ידנית..."
                                            className="bg-gray-800 border-purple-500/50"
                                            dir="ltr"
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );

            // ===================== STEP 4: SPECS =====================
            case "specs":
                return (
                    <div className="space-y-5">
                        {/* Summary tile */}
                        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">בחרת:</div>
                            <div className="text-white font-bold text-lg">{spec.brand} {spec.subModel}</div>
                            {selectedFamily && <div className="text-purple-400 text-sm">{COMPUTER_TYPE_LABELS[selectedFamily.type]}</div>}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <SpecSelector
                                label="זיכרון RAM"
                                options={specOptions.ram}
                                value={spec.ram}
                                onChange={v => setSpec(s => ({ ...s, ram: v }))}
                                icon={<MemoryStick className="w-4 h-4" />}
                                placeholder="בחר כמות RAM"
                            />

                            <SpecSelector
                                label="נפח אחסון"
                                options={specOptions.storage}
                                value={spec.storage}
                                onChange={v => setSpec(s => ({ ...s, storage: v }))}
                                icon={<HardDrive className="w-4 h-4" />}
                                placeholder="בחר נפח אחסון"
                            />

                            {selectedFamily?.type !== "desktop" && selectedFamily?.type !== "mini" && (
                                <SpecSelector
                                    label="גודל מסך (אינץ')"
                                    options={specOptions.screen}
                                    value={spec.screen}
                                    onChange={v => setSpec(s => ({ ...s, screen: v }))}
                                    icon={<Maximize2 className="w-4 h-4" />}
                                    placeholder="בחר גודל מסך"
                                />
                            )}

                            <SpecSelector
                                label="מעבד (CPU)"
                                options={spec.brand === "Apple" ? CPU_OPTIONS.Apple : [...CPU_OPTIONS.Intel, ...CPU_OPTIONS.AMD]}
                                value={spec.cpu}
                                onChange={v => setSpec(s => ({ ...s, cpu: v }))}
                                icon={<Cpu className="w-4 h-4" />}
                                placeholder="בחר מעבד"
                            />

                            <SpecSelector
                                label="כרטיס מסך (GPU)"
                                options={specOptions.gpu.length > 0 ? specOptions.gpu : GPU_OPTIONS}
                                value={spec.gpu}
                                onChange={v => setSpec(s => ({ ...s, gpu: v }))}
                                icon={<Monitor className="w-4 h-4" />}
                                placeholder="בחר כרטיס מסך"
                            />

                            <SpecSelector
                                label="מערכת הפעלה"
                                options={OS_OPTIONS}
                                value={spec.os}
                                onChange={v => setSpec(s => ({ ...s, os: v }))}
                                placeholder="בחר מערכת הפעלה"
                            />

                            {/* Condition */}
                            <div className="space-y-1.5">
                                <Label className="text-gray-300 text-sm">מצב המחשב</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { val: "New", label: "חדש", color: "green" },
                                        { val: "Like New", label: "כמו חדש", color: "teal" },
                                        { val: "Used", label: "משומש", color: "yellow" },
                                        { val: "Refurbished", label: "מחודש", color: "orange" },
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setSpec(s => ({ ...s, condition: opt.val }))}
                                            className={`py-2.5 rounded-lg border text-sm font-medium transition-all
                                                ${spec.condition === opt.val
                                                    ? opt.color === "green" ? "bg-green-600/20 border-green-500 text-green-300"
                                                        : opt.color === "teal" ? "bg-teal-600/20 border-teal-500 text-teal-300"
                                                            : opt.color === "yellow" ? "bg-yellow-600/20 border-yellow-500 text-yellow-300"
                                                                : "bg-orange-600/20 border-orange-500 text-orange-300"
                                                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Extras / Damages */}
                            <div className="space-y-1.5">
                                <Label className="text-orange-400 text-sm">החרגות ונזקים (אופציונלי)</Label>
                                <Input
                                    value={spec.extras}
                                    onChange={e => setSpec(s => ({ ...s, extras: e.target.value }))}
                                    placeholder="למשל: סוללה חלשה, שריטה קלה במסך (השאר ריק אם תקין)"
                                    className="bg-gray-800 border-orange-500/30 text-orange-400 placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Specs summary */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                            <SpecBadge label="RAM" value={spec.ram} icon={<MemoryStick className="w-3 h-3" />} />
                            <SpecBadge label="אחסון" value={spec.storage} icon={<HardDrive className="w-3 h-3" />} />
                            <SpecBadge label='מסך' value={spec.screen} icon={<Maximize2 className="w-3 h-3" />} />
                            <SpecBadge label="CPU" value={spec.cpu} icon={<Cpu className="w-3 h-3" />} />
                            {spec.gpu && <SpecBadge label="GPU" value={spec.gpu} icon={<Monitor className="w-3 h-3" />} />}
                        </div>
                    </div>
                );

            // ===================== STEP 5: DETAILS =====================
            case "details":
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Auto-generated title */}
                        <div className="space-y-1.5">
                            <Label className="text-gray-300 text-sm">כותרת המודעה <span className="text-red-500">*</span></Label>
                            <Input
                                value={details.title}
                                onChange={e => setDetails(d => ({ ...d, title: e.target.value }))}
                                placeholder="יופג אוטומטית לפי הבחירה שלך"
                                required
                                className="bg-gray-800 border-gray-700 text-white"
                                dir="auto"
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-1.5">
                            <Label className="text-gray-300 text-sm">מחיר (₪) <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                value={details.price ? Number(details.price.replace(/,/g, "")).toLocaleString() : ""}
                                onChange={handlePriceChange}
                                placeholder="0"
                                required
                                className="bg-gray-800 border-gray-700 font-mono text-xl text-center"
                                dir="ltr"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label className="text-gray-300 text-sm">תיאור נוסף (אופציונלי)</Label>
                            <Textarea
                                value={details.description}
                                onChange={e => setDetails(d => ({ ...d, description: e.target.value }))}
                                placeholder="פרטים נוספים, סיבת מכירה, מה כלול במכירה..."
                                className="bg-gray-800 border-gray-700 h-24 text-right"
                                dir="rtl"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label className="text-gray-300 text-sm">טלפון ליצירת קשר</Label>
                            <Input
                                value={details.contactPhone}
                                onChange={e => setDetails(d => ({ ...d, contactPhone: e.target.value }))}
                                placeholder="05X-XXXXXXX"
                                className="bg-gray-800 border-gray-700"
                                type="tel"
                                dir="ltr"
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-sm">תמונות</Label>

                            {details.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {details.images.map((img, i) => (
                                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                                            <img src={img} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.src = "/placeholder-image.png")} />
                                            <button
                                                type="button"
                                                onClick={() => setDetails(d => ({ ...d, images: d.images.filter((_, j) => j !== i) }))}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    value={imageUrlInput}
                                    onChange={e => setImageUrlInput(e.target.value)}
                                    placeholder="קישור לתמונה (URL)"
                                    className="bg-gray-800 border-gray-700 text-sm"
                                    dir="ltr"
                                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addImageUrl} className="border-gray-700 shrink-0">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors">
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                                <span className="text-sm text-gray-400">{uploading ? "מעלה..." : "העלה תמונה מהמכשיר"}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>

                        {/* Spec summary card */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">סיכום מפרט</div>
                            <div className="text-white font-bold">{spec.brand} {spec.subModel}</div>
                            <div className="flex flex-wrap gap-2">
                                <SpecBadge label="מצב" value={spec.condition === "New" ? "חדש" : spec.condition === "Like New" ? "כמו חדש" : spec.condition === "Used" ? "משומש" : "מחודש"} />
                                <SpecBadge label="RAM" value={spec.ram} />
                                <SpecBadge label="אחסון" value={spec.storage} />
                                <SpecBadge label="מסך" value={spec.screen} />
                                <SpecBadge label="CPU" value={spec.cpu} />
                                {spec.gpu && <SpecBadge label="GPU" value={spec.gpu} />}
                                {spec.os && <SpecBadge label="OS" value={spec.os} />}
                            </div>
                            {spec.extras && (
                                <div className="text-orange-400 text-xs border-t border-gray-800 pt-2">⚠️ {spec.extras}</div>
                            )}
                        </div>

                        {/* Submit button */}
                        <Button
                            type="submit"
                            disabled={loading || !details.title || !details.price}
                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> שומר...</span>
                            ) : (
                                <span>{isEditing ? "עדכן מודעה" : "פרסם מודעה 🚀"}</span>
                            )}
                        </Button>
                    </form>
                );
        }
    };

    // ---- Nav helpers ----
    const canAdvance = () => {
        if (step === "brand") return !!spec.brand;
        if (step === "family") return !!selectedFamily;
        if (step === "submodel") return !!spec.subModel && spec.subModel !== "אחר / לא ברשימה";
        if (step === "specs") return true; // specs are optional
        return false;
    };

    const advance = () => {
        const order: Step[] = ["brand", "family", "submodel", "specs", "details"];
        const idx = order.indexOf(step);
        if (idx < order.length - 1) {
            // Skip family if no families available
            if (step === "brand" && modelFamilies.length === 0) {
                setStep("submodel");
            } else {
                setStep(order[idx + 1]);
            }
        }
    };

    const goBack = () => {
        const order: Step[] = ["brand", "family", "submodel", "specs", "details"];
        const idx = order.indexOf(step);
        if (idx > 0) setStep(order[idx - 1]);
        else if (onCancel) onCancel();
    };

    return (
        <div className="flex flex-col h-full max-h-[85vh]" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between px-1 pb-4 border-b border-gray-800 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💻</span>
                    <div>
                        <h2 className="text-white font-bold text-base">מנוע חיפוש מחשבים</h2>
                        <p className="text-gray-500 text-xs">בחר יצרן → דגם → מפרט → פרסם</p>
                    </div>
                </div>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-1 mb-5 shrink-0 overflow-x-auto pb-1">
                {STEPS.map((s, idx) => {
                    const isCurrent = s.id === step;
                    const isDone = STEPS.findIndex(x => x.id === step) > idx;
                    const isDisabled = idx > 0 && (
                        (idx >= 1 && !spec.brand) ||
                        (idx >= 2 && !selectedFamily && modelFamilies.length > 0) ||
                        (idx >= 3 && !spec.subModel)
                    );
                    return (
                        <React.Fragment key={s.id}>
                            <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => !isDisabled && setStep(s.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                                    ${isCurrent ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                        : isDone ? "bg-purple-900/40 text-purple-300 hover:bg-purple-900/60"
                                            : isDisabled ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                            >
                                {isDone ? <Check className="w-3 h-3" /> : <span>{s.icon}</span>}
                                {s.label}
                            </button>
                            {idx < STEPS.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-gray-700 shrink-0" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-1 pb-4">
                {renderStepContent()}
            </div>

            {/* Footer nav */}
            {step !== "details" && (
                <div className="flex gap-3 pt-4 border-t border-gray-800 mt-2 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={goBack}
                        className="flex-1 text-gray-400 hover:text-gray-300"
                    >
                        {step === "brand" && onCancel ? "ביטול" : "← חזור"}
                    </Button>
                    <Button
                        type="button"
                        onClick={advance}
                        disabled={!canAdvance()}
                        className={`flex-2 flex-grow-[2] transition-all
                            ${canAdvance()
                                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                                : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
                    >
                        {step === "specs" ? "המשך לפרטים →" : "המשך →"}
                    </Button>
                </div>
            )}
            {step === "details" && (
                <div className="pt-4 border-t border-gray-800 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={goBack}
                        className="text-gray-400 hover:text-gray-300 text-sm"
                    >
                        ← חזור לעריכת מפרט
                    </Button>
                </div>
            )}
        </div>
    );
}
