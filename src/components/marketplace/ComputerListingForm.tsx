"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createListing, updateListing, getMyListings, getMyPhone } from "@/app/actions/marketplace";
import { Loader2, Plus, Image as ImageIcon, X, Search, ChevronDown, Check, Monitor, Cpu, MemoryStick, HardDrive, Maximize2, AlertCircle, Sparkles } from "lucide-react";
import {
    LAPTOP_DATABASE,
    BRAND_DESKTOP_DATABASE,
    ALL_IN_ONE_DATABASE,
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
    CUSTOM_BUILD_CATEGORIES,
    DESKTOP_SUB_CATEGORIES
} from "@/lib/computer-data";
import { MOTHERBOARD_DATABASE } from "@/lib/motherboard-database";
import { ComputerSearchUI } from "@/components/marketplace/ComputerSearchUI";

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
    extras: string;      // free text for damages / extras
    sku: string;         // model number / SKU from DB
    battery: string;
    batteryHealth: string;
    batteryPercent: string;
    ports: string;
    weight: string;
    release_year: string;
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
    preSelectedCategory?: "laptop" | "desktop" | null;
}

const COMPUTER_TYPE_LABELS: Record<string, string> = {
    laptop: "💻 נייד",
    desktop: "🖥️ נייח",
    gaming: "🎮 גיימינג",
    workstation: "⚙️ תחנת עבודה",
    "all-in-one": "🖥️ All-in-One",
    mini: "📦 מיני PC",
};

const CUSTOM_BUILD_FIELDS = [
    { key: "מעבד", label: "מעבד (CPU)", dataKey: "cpu" as const },
    { key: "כרטיס מסך", label: "כרטיס מסך (GPU)", dataKey: "gpu" as const },
    { key: "לוח אם - יצרן", label: "יצרן לוח אם", dataKey: "motherboard_brand" as const },
    { key: "לוח אם - דגם", label: "דגם לוח אם (למשל: ROG STRIX Z790-E)", dataKey: "motherboard_model" as const },
    { key: "לוח אם - ערכת שבבים", label: "ערכת שבבים (Chipset)", dataKey: "motherboard_chipset" as const },
    { key: "לוח אם - שקע", label: "שקע מעבד (Socket)", dataKey: "motherboard_socket" as const },
    { key: "לוח אם - פורמט", label: "פורמט לוח אם", dataKey: "motherboard_form" as const },
    { key: "לוח אם - חיבור אלחוטי", label: "חיבור אלחוטי (Wi-Fi/BT)", dataKey: "motherboard_features" as const },
    { key: "לוח אם - כרטיס רשת", label: "חיבור רשת (Ethernet)", dataKey: "motherboard_ethernet" as const },
    { key: "לוח אם - חריצי M.2", label: "חריצי M.2", dataKey: "motherboard_m2" as const },
    { key: "לוח אם - דור PCIe", label: "דור PCIe ראשי", dataKey: "motherboard_pcie" as const },
    { key: "RAM - סוג", label: "סוג זיכרון (RAM)", dataKey: "ram_type" as const },
    { key: "RAM - תצורה", label: "תצורת זיכרון", dataKey: "ram_config" as const },
    { key: "כונן ראשי", label: "כונן ראשי", dataKey: "storage_primary" as const },
    { key: "כונן משני", label: "כונן משני", dataKey: "storage_secondary" as const },
    { key: "ספק כח - הספק", label: "הספק ספק כח (W)", dataKey: "psu_wattage" as const },
    { key: "ספק כח - תקן", label: "תקן ספק כח", dataKey: "psu_standard" as const },
    { key: "ספק כח - יעילות", label: "דירוג יעילות", dataKey: "psu_efficiency" as const },
    { key: "ספק כח - סוג", label: "סוג מודולריות", dataKey: "psu_modularity" as const },
    { key: "ספק כח - יצרן", label: "יצרן ספק כח", dataKey: "psu_brand" as const },
    { key: "קירור - סוג", label: "סוג קירור", dataKey: "cooler_type" as const },
    { key: "קירור - דגם", label: "דגם מקרר", dataKey: "cooler_model" as const },
    { key: "מארז - פורמט", label: "פורמט מארז", dataKey: "case_form" as const },
    { key: "מארז - זרימת אוויר", label: "זרימת אוויר (פאנל קדמי)", dataKey: "case_airflow" as const },
    { key: "מארז - חיבורים", label: "חיבורים קדמיים", dataKey: "case_io" as const },
    { key: "מארז - יצרן", label: "יצרן מארז", dataKey: "case_brand" as const },
    { key: "מערכת הפעלה", label: "מערכת הפעלה", dataKey: "os" as const },
];

const MONITOR_FIELDS = [
    { key: "מסך - גודל", label: "גודל מסך", dataKey: "monitor_size" as const },
    { key: "מסך - פאנל", label: "סוג פאנל", dataKey: "monitor_panel" as const },
    { key: "מסך - רזולוציה", label: "רזולוציה", dataKey: "monitor_resolution" as const },
    { key: "מסך - רענון", label: "קצב רענון", dataKey: "monitor_refresh" as const },
    { key: "מסך - יצרן", label: "יצרן מסך", dataKey: "monitor_brand" as const },
];

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
export function ComputerListingForm({ onComplete, onCancel, initialData, isEditing, listingId, preSelectedCategory }: ComputerListingFormProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [videoUrl, setVideoUrl] = useState(initialData?.extraData?.["סרטון"] || "");

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
        condition: initialData?.condition || "",
        extras: initialData?.extraData?.["החרגות / נזקים"] || initialData?.extraData?.החרגות || "",
        sku: initialData?.extraData?.["מספר דגם / SKU"] || "",
        battery: initialData?.extraData?.סוללה || "",
        batteryHealth: initialData?.extraData?.["תקינות סוללה"] || "",
        batteryPercent: (initialData?.extraData?.["אחוזי סוללה"] || "").replace("%", ""),
        ports: initialData?.extraData?.חיבורים || "",
        weight: initialData?.extraData?.משקל || "",
        release_year: initialData?.extraData?.["שנת ייצור"] || "",
    });

    const [mainCategory, setMainCategory] = useState<"laptop" | "desktop" | null>(
        initialData ? (initialData?.extraData?.["סוג המחשב"]?.includes("נייד") || initialData?.extraData?.["סוג המחשב"] === "laptop" ? "laptop" : "desktop") : (preSelectedCategory || null)
    );

    const [computerTypeMode, setComputerTypeMode] = useState<"brand_desktop" | "all_in_one" | "custom_build" | null>(() => {
        const type = initialData?.extraData?.["סוג המחשב"];
        if (!type) return preSelectedCategory === "desktop" ? null : null;
        if (type.includes("בנייה עצמית")) return "custom_build";
        if (type.includes("All-in-One")) return "all_in_one";
        if (type.includes("מותג")) return "brand_desktop";
        return null;
    });

    const [cbSpec, setCbSpec] = useState<Record<string, string>>(() => {
        if (!initialData?.extraData) return {};
        const initialCb: Record<string, string> = {};
        CUSTOM_BUILD_FIELDS.forEach(f => {
            if (initialData.extraData[f.key]) initialCb[f.key] = initialData.extraData[f.key];
        });
        MONITOR_FIELDS.forEach(f => {
            if (initialData.extraData[f.key]) initialCb[f.key] = initialData.extraData[f.key];
        });
        return initialCb;
    });

    const [details, setDetails] = useState<FormDetails>({
        title: initialData?.title || "",
        price: initialData?.price ? initialData.price.toString() : "",
        description: initialData?.description || "",
        contactPhone: initialData?.contactPhone || initialData?.extraData?.["טלפון ליצירת קשר"] || "",
        images: initialData?.images || [],
    });

    useEffect(() => {
        if (details.contactPhone) return; // already filled
        getMyPhone().then(res => {
            if (res.phone) setDetails(d => ({ ...d, contactPhone: res.phone }));
        });
    }, [details.contactPhone]);

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

    // Motherboard Smart Fill - Updates ALL related fields when a model is selected
    useEffect(() => {
        const mbModel = cbSpec["לוח אם - דגם"];
        if (mbModel && computerTypeMode === "custom_build") {
            // Find exact match from our database
            const match = MOTHERBOARD_DATABASE.find(m => m.model === mbModel);

            if (match) {
                // Normalize chipset: "Intel Z790" -> "Z790" to match our select options
                const chipset = match.chipset.replace("Intel ", "").replace("AMD ", "");

                setCbSpec(prev => ({
                    ...prev,
                    "לוח אם - יצרן": match.brand,
                    "לוח אם - ערכת שבבים": chipset,
                    "לוח אם - שקע": match.socket,
                    "לוח אם - פורמט": match.formFactor,
                    "RAM - סוג": (match.ramType.includes("/") ? match.ramType.split("/")[1] : match.ramType),
                    "לוח אם - חיבור אלחוטי": match.wifi !== "nan" ? match.wifi : "ללא",
                    "לוח אם - כרטיס רשת": match.lan,
                    "לוח אם - חריצי M.2": match.m2,
                    "לוח אם - דור PCIe": match.pcie,
                }));
            }
        }
    }, [cbSpec["לוח אם - דגם"]]);

    // active database for dynamic references
    const activeDb = useMemo(() => {
        if (!mainCategory) return COMPUTER_DATABASE;
        if (mainCategory === "laptop") return LAPTOP_DATABASE;
        if (computerTypeMode === "all_in_one") return ALL_IN_ONE_DATABASE;
        return BRAND_DESKTOP_DATABASE;
    }, [mainCategory, computerTypeMode]);

    // Flat list of all available submodels for the fast global search
    const allModelsFlat = useMemo(() => {
        const list: { brand: string; family: ComputerModelFamily; sub: ComputerSubModel; sku?: any; searchText: string; displayName: string }[] = [];
        for (const brand of Object.keys(activeDb)) {
            const families = activeDb[brand];
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
    }, [mainCategory, activeDb]);

    const filteredGlobalModels = useMemo(() => {
        if (!globalSearch.trim()) return [];
        const queryTerms = globalSearch.toLowerCase().split(' ').filter(Boolean);
        return allModelsFlat.filter(m =>
            queryTerms.every(term => m.searchText.includes(term))
        ).slice(0, 10); // show top 10
    }, [globalSearch, allModelsFlat]);

    // Derived options based on current selections
    const modelFamilies = useMemo(() => spec.brand ? (activeDb[spec.brand] || []) : [], [spec.brand, activeDb]);
    const selectedFamilyObj = useMemo(() => modelFamilies.find(f => f.name === spec.family), [spec.family, modelFamilies]);
    const subModelsList = useMemo(() => selectedFamilyObj ? selectedFamilyObj.subModels : [], [selectedFamilyObj]);
    const availableBrands = useMemo(() => Object.keys(activeDb).sort(), [activeDb]);

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

        // ── Spec fields (may have multiple options → mark uncertain) ──
        if (sourceData.screenSize?.length > 0) {
            newSpec.screen = sourceData.screenSize.length === 1 ? sourceData.screenSize[0] : "לא ידוע";
            if (sourceData.screenSize.length > 1) newUncertain.push('screen');
        } else { newSpec.screen = "לא ידוע"; }

        if (sourceData.cpu?.length > 0) {
            newSpec.cpu = sourceData.cpu.length === 1 ? sourceData.cpu[0] : "לא ידוע";
            if (sourceData.cpu.length > 1) newUncertain.push('cpu');
        } else { newSpec.cpu = "לא ידוע"; }

        if (sourceData.gpu?.length > 0) {
            newSpec.gpu = sourceData.gpu.length === 1 ? sourceData.gpu[0] : "לא ידוע";
            if (sourceData.gpu.length > 1) newUncertain.push('gpu');
        } else { newSpec.gpu = "לא ידוע"; }

        if (sourceData.ram?.length > 0) {
            newSpec.ram = sourceData.ram.length === 1 ? sourceData.ram[0] : "לא ידוע";
            if (sourceData.ram.length > 1) newUncertain.push('ram');
        } else { newSpec.ram = "לא ידוע"; }

        if (sourceData.storage?.length > 0) {
            newSpec.storage = sourceData.storage.length === 1 ? sourceData.storage[0] : "לא ידוע";
            if (sourceData.storage.length > 1) newUncertain.push('storage');
        } else { newSpec.storage = "לא ידוע"; }

        if (sourceData.os?.length > 0) {
            newSpec.os = sourceData.os.length === 1 ? sourceData.os[0] : "לא ידוע";
            if (sourceData.os.length > 1) newUncertain.push('os');
        } else { newSpec.os = "לא ידוע"; }

        // ── Rich fields – single values, always fill from sub (not sku) ──
        if (sub.battery) newSpec.battery = sub.battery;
        if (sub.ports) newSpec.ports = sub.ports;
        if (sub.weight) newSpec.weight = sub.weight;
        if (sub.release_year) newSpec.release_year = sub.release_year;
        // SKU: prefer the specific SKU id if user picked a SKU row;
        // otherwise auto-fill if the submodel has exactly one SKU
        if (sku?.id) {
            newSpec.sku = sku.id;
        } else if (sub.skus && sub.skus.length === 1) {
            newSpec.sku = sub.skus[0].id || "";
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

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingVideo(true);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.success) setVideoUrl(data.url);
        } catch { }
        finally { setUploadingVideo(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!spec.brand || !spec.subModel) { alert("נא לבחור יצרן ודגם"); return; }
        if (!details.contactPhone?.trim()) { alert("נא להזין מספר טלפון ליצירת קשר"); return; }
        if (uncertainFields.length > 0) {
            const confirmed = confirm("חלק מהמפרט שסופק אוטומטית (מסומן בצהוב) עדיין לא אושר על ידך. האם אתה בטוח שאתה רוצה לפרסם?");
            if (!confirmed) return;
        }

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
            let extraData: Record<string, string> = {};

            if (mainCategory === "laptop") {
                extraData = {
                    "סוג המחשב": "מחשב נייד",
                    "יצרן": spec.brand,
                    "סדרה": spec.family,
                    "דגם": spec.subModel,
                    "מספר דגם / SKU": spec.sku,
                    "מעבד": spec.cpu,
                    "RAM": spec.ram,
                    "נפח אחסון": spec.storage,
                    "גודל מסך": spec.screen,
                    "כרטיס מסך": spec.gpu,
                    "מערכת הפעלה": spec.os,
                    "סוללה": spec.battery,
                    "חיבורים": spec.ports,
                    "משקל": spec.weight,
                    "שנת ייצור": spec.release_year,
                    "החרגות / נזקים": spec.extras,
                    "סרטון": videoUrl,
                };
            } else if (computerTypeMode === "custom_build") {
                extraData = {
                    "סוג המחשב": "בנייה עצמית",
                    "מעבד": cbSpec["מעבד"] || "",
                    "כרטיס מסך": cbSpec["כרטיס מסך"] || "",
                    "RAM": `${cbSpec["RAM - סוג"] || ""} ${cbSpec["RAM - תצורה"] || ""}`.trim(),
                    "נפח אחסון": `${cbSpec["כונן ראשי"] || ""} ${cbSpec["כונן משני"] && cbSpec["כונן משני"] !== "אין" ? ' + ' + cbSpec["כונן משני"] : ""}`.trim(),
                    "החרגות / נזקים": spec.extras,
                    "סרטון": videoUrl,
                };
                CUSTOM_BUILD_FIELDS.forEach(f => { if (cbSpec[f.key]) extraData[f.key] = cbSpec[f.key]; });
                MONITOR_FIELDS.forEach(f => { if (cbSpec[f.key]) extraData[f.key] = cbSpec[f.key]; });
            } else {
                extraData = {
                    "סוג המחשב": computerTypeMode === "all_in_one" ? "מחשב All-in-One" : (selectedFamilyObj ? (selectedFamilyObj.type || "מחשב נייח") : "מחשב נייח"),
                    "יצרן": spec.brand,
                    "סדרה": spec.family,
                    "דגם": spec.subModel,
                    "מספר דגם / SKU": spec.sku,
                    "מעבד": spec.cpu,
                    "RAM": spec.ram,
                    "נפח אחסון": spec.storage,
                    "גודל מסך": spec.screen,
                    "כרטיס מסך": spec.gpu,
                    "מערכת הפעלה": spec.os,
                    "חיבורים": spec.ports,
                    "שנת ייצור": spec.release_year,
                    "החרגות / נזקים": spec.extras,
                    "סרטון": videoUrl,
                };
                if ((mainCategory as any) === "laptop") {
                    extraData["סוללה"] = spec.battery;
                    extraData["משקל"] = spec.weight;
                }
                if (computerTypeMode === "all_in_one") {
                    MONITOR_FIELDS.forEach(f => { if (cbSpec[f.key]) extraData[f.key] = cbSpec[f.key]; });
                }
            }

            Object.keys(extraData).forEach(k => { if (!extraData[k]) delete extraData[k]; });
            if (details.contactPhone) extraData["טלפון ליצירת קשר"] = details.contactPhone;
            if (mainCategory === "laptop" && spec.batteryHealth) extraData["תקינות סוללה"] = spec.batteryHealth;
            if (mainCategory === "laptop" && spec.batteryPercent) extraData["אחוזי סוללה"] = `${spec.batteryPercent}%`;

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

    const handleApplySearchEngineSpecs = (result: any) => {
        // The search engine result contains full specs - apply them all to the form
        setSpec(s => ({
            ...s,
            brand: result.brand || result.model_name?.split(" ")[0] || s.brand,
            family: result.family || s.family,
            subModel: result.model_name || s.subModel,
            sku: result.model_number || s.sku,          // ← SKU from DB
            ram: result.ram || s.ram,
            storage: result.storage || s.storage,
            screen: result.display || s.screen,
            cpu: result.cpu || s.cpu,
            gpu: result.gpu || s.gpu,
            os: result.os || s.os,
            battery: result.battery || s.battery,
            ports: result.ports || s.ports,
            weight: result.weight || s.weight,
            release_year: result.release_year || s.release_year,
        }));

        setDetails(d => ({
            ...d,
            title: result.model_name || d.title,
        }));

        setUncertainFields([]);

        // Scroll up to top of main form
        setTimeout(() => {
            document.getElementById("manual-specs-section")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    };

    const handleMainCategoryChange = (cat: "laptop" | "desktop") => {
        if (cat !== mainCategory) {
            setMainCategory(cat);
            setSpec(s => ({ ...s, brand: "", family: "", subModel: "", sku: "", condition: "", extras: "", ports: "", weight: "", release_year: "", batteryHealth: "", batteryPercent: "" }));
            setCbSpec({});
            setUncertainFields([]);
            setVideoUrl("");
        }
    };

    const handleComputerTypeModeChange = (mode: "brand_desktop" | "all_in_one" | "custom_build") => {
        if (mode !== computerTypeMode) {
            setComputerTypeMode(mode);
            setSpec(s => ({ ...s, brand: "", family: "", subModel: "", sku: "", condition: "", extras: "", ports: "", weight: "", release_year: "", batteryHealth: "", batteryPercent: "" }));
            setCbSpec({});
            setUncertainFields([]);
            setVideoUrl("");
        }
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

                {!mainCategory && !preSelectedCategory ? (
                    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 py-12">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-white">בחר את סוג המחשב שלך</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">המערכת החכמה שלנו תתאים את הטופס בדיוק לסוג המכשיר שלך</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                            <button
                                onClick={() => handleMainCategoryChange("laptop")}
                                className="group relative overflow-hidden rounded-2xl border-2 border-gray-700 bg-gray-800/50 p-6 flex flex-col items-center gap-4 hover:border-indigo-500 hover:bg-gray-800 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-5xl group-hover:scale-110 transition-transform">💻</span>
                                <div className="text-center">
                                    <h4 className="text-xl font-bold text-white">מחשב נייד</h4>
                                    <p className="text-xs text-gray-400 mt-1">לפטופ מכל המותגים</p>
                                </div>
                            </button>
                            <button
                                onClick={() => handleMainCategoryChange("desktop")}
                                className="group relative overflow-hidden rounded-2xl border-2 border-gray-700 bg-gray-800/50 p-6 flex flex-col items-center gap-4 hover:border-purple-500 hover:bg-gray-800 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-5xl group-hover:scale-110 transition-transform">🖥️</span>
                                <div className="text-center">
                                    <h4 className="text-xl font-bold text-white">מחשב נייח</h4>
                                    <p className="text-xs text-gray-400 mt-1">מחשב מותג, הרכבה עצמית או All-in-One</p>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ==== SECTION: COMPUTER TYPE ==== */}
                        {mainCategory === "desktop" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 mb-8">
                                <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">סוג מחשב נייח (Desktop)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {DESKTOP_SUB_CATEGORIES.map(category => (
                                        <button
                                            key={category.value}
                                            type="button"
                                            onClick={() => handleComputerTypeModeChange(category.value as any)}
                                            className={`p-4 rounded-xl border-2 text-right transition-all flex flex-col items-start ${computerTypeMode === category.value ? 'bg-indigo-900/30 border-indigo-500' : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'}`}
                                        >
                                            <span className={`font-bold ${computerTypeMode === category.value ? 'text-indigo-300' : 'text-gray-200'}`}>{category.label}</span>
                                            <span className="text-xs text-gray-400 mt-1">{category.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* GATEKEEPER LOGIC: Hide the rest if desktop and no type selected yet */}
                        {(mainCategory !== "desktop" || computerTypeMode !== null) && (
                            <>
                                {/* ──── SMART SEARCH (identification) ──── */}
                                {(mainCategory === "laptop" || computerTypeMode !== "custom_build") && (
                                    <div className="mb-6 animate-in fade-in slide-in-from-top-4">
                                        <ComputerSearchUI activeDb={activeDb} onApplySpecs={handleApplySearchEngineSpecs} />
                                    </div>
                                )}

                                <form id="manual-specs-section" onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">

                                    {computerTypeMode === 'custom_build' ? (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <h3 className="text-lg font-bold border-b border-indigo-900/50 pb-2 text-indigo-300">⚙️ מפרט בנייה עצמית (Custom Build)</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {CUSTOM_BUILD_FIELDS.map(field => {
                                                    const options = (CUSTOM_BUILD_CATEGORIES as any)[field.dataKey]?.options || [];

                                                    // Special handling for Motherboard Model: Searchable Dropdown with ABC sorting
                                                    if (field.dataKey === "motherboard_model") {
                                                        const mbOptions = MOTHERBOARD_DATABASE.map(m => m.model).sort((a, b) => a.localeCompare(b));
                                                        return (
                                                            <div key={field.key} className="space-y-1">
                                                                <Label className="text-gray-300 text-sm">{field.label}</Label>
                                                                <SearchableDropdown
                                                                    options={mbOptions}
                                                                    value={cbSpec[field.key] || ""}
                                                                    onChange={val => setCbSpec(s => ({ ...s, [field.key]: val }))}
                                                                    placeholder={`חפש ${field.label}...`}
                                                                    emptyLabel="לא נמצא דגם תואם"
                                                                />
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div key={field.key} className="space-y-1">
                                                            <Label className="text-gray-300 text-sm">{field.label}</Label>
                                                            {options && options.length > 0 ? (
                                                                <select
                                                                    value={cbSpec[field.key] || ""}
                                                                    onChange={e => setCbSpec(s => ({ ...s, [field.key]: e.target.value }))}
                                                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                                    dir={field.key.includes("עברית") ? "rtl" : "ltr"}
                                                                >
                                                                    <option value="" disabled>בחר {field.label}</option>
                                                                    {options.map((opt: string) => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <Input
                                                                    value={cbSpec[field.key] || ""}
                                                                    onChange={e => setCbSpec(s => ({ ...s, [field.key]: e.target.value }))}
                                                                    className="w-full bg-gray-900 border border-gray-700 text-sm py-2"
                                                                    placeholder={`הקלד ${field.label}...`}
                                                                    dir="ltr"
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <h3 className="text-lg font-bold border-b border-blue-900/50 pb-2 text-blue-300 mt-6">🖥️ מסך מחשב (אם מצורף)</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {MONITOR_FIELDS.map(field => {
                                                    const options = (CUSTOM_BUILD_CATEGORIES as any)[field.dataKey]?.options || [];
                                                    return (
                                                        <div key={field.key} className="space-y-1">
                                                            <Label className="text-blue-200 text-sm">{field.label}</Label>
                                                            <select
                                                                value={cbSpec[field.key] || ""}
                                                                onChange={e => setCbSpec(s => ({ ...s, [field.key]: e.target.value }))}
                                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                dir="ltr"
                                                            >
                                                                <option value="" disabled>בחר {field.label}</option>
                                                                {options.map((opt: string) => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-gray-300">⚠️ החרגות / נזקים פיזיים בעמדה</Label>
                                                <Input
                                                    value={spec.extras}
                                                    onChange={e => setSpec(s => ({ ...s, extras: e.target.value }))}
                                                    placeholder="למשל: סריטה על המארז... (השאר ריק אם הכול מושלם)"
                                                    className="bg-gray-800 border-orange-500/30 text-orange-400 placeholder:text-gray-600 focus:border-orange-500"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                                            {/* ==== SECTION: IDENTIFICATION ==== */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">זיהוי (יצרן וסדרה)</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <SpecSelector
                                                        label="יצרן"
                                                        options={availableBrands}
                                                        value={spec.brand}
                                                        onChange={v => {
                                                            setSpec(s => ({ ...s, brand: v }));
                                                        }}
                                                    />
                                                    <SpecSelector
                                                        label="סדרה (Family)"
                                                        options={(spec.brand ? modelFamilies.map(f => f.name) : Array.from(new Set(allModelsFlat.map(m => m.family.name)))).sort()}
                                                        value={spec.family}
                                                        onChange={v => {
                                                            const mappedBrand = spec.brand ? spec.brand : allModelsFlat.find(m => m.family.name === v)?.brand || "";
                                                            setSpec(s => ({ ...s, brand: mappedBrand, family: v }));
                                                        }}
                                                    />
                                                    <SpecSelector
                                                        label="תת דגם / מק״ט"
                                                        options={[
                                                            ...(spec.family
                                                                ? allModelsFlat.filter(m => m.family.name === spec.family).map(m => m.displayName)
                                                                : Array.from(new Set(allModelsFlat.map(m => m.displayName)))
                                                            ).sort(),
                                                            "אחר / לא ברשימה"
                                                        ]}
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
                                                    {(!selectedFamilyObj || (selectedFamilyObj.type !== "desktop" && selectedFamilyObj.type !== "mini" && selectedFamilyObj.type !== "workstation")) && (
                                                        <SpecSelector
                                                            label="גודל מסך"
                                                            options={specOptions.screen}
                                                            value={spec.screen}
                                                            onChange={v => setSpec(s => ({ ...s, screen: v }))}
                                                            icon={<Maximize2 className="w-4 h-4" />}
                                                            uncertain={uncertainFields.includes('screen')}
                                                            onConfirm={() => removeUncertain('screen')}
                                                        />
                                                    )}
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
                                                <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">מפרט יצרן (חדש)</h3>

                                                {/* SKU */}
                                                <div className="space-y-1">
                                                    <Label className="text-gray-400 text-xs font-mono">מספר דגם / SKU (מהתווית / קופסה)</Label>
                                                    <Input
                                                        value={spec.sku}
                                                        onChange={e => setSpec(s => ({ ...s, sku: e.target.value }))}
                                                        placeholder="לדוגמה: AN515-58-525P"
                                                        className="bg-gray-800 border-gray-700 font-mono text-sm"
                                                        dir="ltr"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {mainCategory !== "desktop" && (!selectedFamilyObj || (selectedFamilyObj.type !== "desktop" && selectedFamilyObj.type !== "mini" && selectedFamilyObj.type !== "workstation")) && (
                                                        <div className="space-y-1">
                                                            <Label className="text-gray-400 text-xs">🔋 סוללה (mAh / סוג)</Label>
                                                            <Input
                                                                value={spec.battery}
                                                                onChange={e => setSpec(s => ({ ...s, battery: e.target.value }))}
                                                                placeholder="לדוגמא: 72Wh, 6500mAh"
                                                                className="bg-gray-800 border-gray-700 text-sm"
                                                                dir="ltr"
                                                            />
                                                        </div>
                                                    )}
                                                    {mainCategory !== "desktop" && (!selectedFamilyObj || (selectedFamilyObj.type !== "desktop" && selectedFamilyObj.type !== "mini" && selectedFamilyObj.type !== "workstation")) && (
                                                        <div className="space-y-1">
                                                            <Label className="text-gray-400 text-xs">📏 משקל</Label>
                                                            <Input
                                                                value={spec.weight}
                                                                onChange={e => setSpec(s => ({ ...s, weight: e.target.value }))}
                                                                placeholder="לדוגמא: 2.2kg"
                                                                className="bg-gray-800 border-gray-700 text-sm"
                                                                dir="ltr"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <Label className="text-gray-400 text-xs">📅 שנת ייצור</Label>
                                                        <Input
                                                            value={spec.release_year}
                                                            onChange={e => setSpec(s => ({ ...s, release_year: e.target.value }))}
                                                            placeholder="לדוגמא: 2023"
                                                            className="bg-gray-800 border-gray-700 text-sm"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Ports - chip multi-select */}
                                                <div className="space-y-2">
                                                    <Label className="text-gray-400 text-xs">🔌 חיבורים (ports) – בחר או הקלד</Label>
                                                    {/* Auto-filled text from DB shown as hint */}
                                                    {spec.ports && spec.ports.includes(",") && (
                                                        <p className="text-xs text-blue-400/70 bg-blue-500/5 border border-blue-500/20 rounded px-2 py-1">
                                                            📌 לפי יצרן: {spec.ports}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            "USB-A 3.2", "USB-A 2.0", "USB-C 3.2",
                                                            "Thunderbolt 4", "Thunderbolt 3",
                                                            "HDMI 2.1", "HDMI 2.0", "HDMI 1.4",
                                                            "DisplayPort", "Mini DisplayPort",
                                                            "SD Card", "Ethernet (RJ-45)", "Audio 3.5mm", "VGA"
                                                        ].map(port => {
                                                            const active = spec.ports?.includes(port);
                                                            return (
                                                                <button
                                                                    key={port} type="button"
                                                                    onClick={() => {
                                                                        setSpec(s => {
                                                                            const current = (s.ports || "").split(",").map(p => p.trim()).filter(Boolean);
                                                                            const next = current.includes(port)
                                                                                ? current.filter(p => p !== port)
                                                                                : [...current, port];
                                                                            return { ...s, ports: next.join(", ") };
                                                                        });
                                                                    }}
                                                                    className={`px-2.5 py-1 rounded-full text-xs border font-medium transition-all ${active
                                                                        ? "bg-blue-500/20 border-blue-500 text-blue-300"
                                                                        : "bg-gray-800/50 border-gray-700 text-gray-500 hover:border-gray-500"
                                                                        }`}
                                                                >
                                                                    {active ? "✓ " : ""}{port}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <Input
                                                        value={spec.ports}
                                                        onChange={e => setSpec(s => ({ ...s, ports: e.target.value }))}
                                                        placeholder="או הקלד חיבורים בחופשי: USB-C, USB-A ×3, HDMI..."
                                                        className="bg-gray-800/40 border-gray-700 text-sm mt-1"
                                                        dir="ltr"
                                                    />
                                                </div>

                                                {computerTypeMode === 'all_in_one' && (
                                                    <div className="space-y-4 pb-4 border-b border-gray-800/50">
                                                        <h3 className="text-lg font-bold text-blue-300">🖥️ נתוני מסך מובנה</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {MONITOR_FIELDS.map(field => {
                                                                const options = (CUSTOM_BUILD_CATEGORIES as any)[field.dataKey]?.options || [];
                                                                return (
                                                                    <div key={field.key} className="space-y-1">
                                                                        <Label className="text-blue-200 text-sm">{field.label}</Label>
                                                                        <select
                                                                            value={cbSpec[field.key] || ""}
                                                                            onChange={e => setCbSpec(s => ({ ...s, [field.key]: e.target.value }))}
                                                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                            dir="ltr"
                                                                        >
                                                                            <option value="" disabled>בחר {field.label}</option>
                                                                            {options.map((opt: string) => (
                                                                                <option key={opt} value={opt}>{opt}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Extras / damages */}
                                                <div className="space-y-2">
                                                    <Label className="text-gray-300">⚠️ החרגות / נזקים פיזיים</Label>
                                                    <Input
                                                        value={spec.extras}
                                                        onChange={e => setSpec(s => ({ ...s, extras: e.target.value }))}
                                                        placeholder={mainCategory === "laptop"
                                                            ? "למשל: סוללה חלשה, בקע קטן בפלסטיק... (השאר ריק אם הכול מושלם)"
                                                            : "למשל: שריטות במארז, חיבור USB תקול... (השאר ריק אם הכול מושלם)"
                                                        }
                                                        className="bg-gray-800 border-orange-500/30 text-orange-400 placeholder:text-gray-600 focus:border-orange-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )} {/* Close regular computer fields form section */}

                                    {/* Condition */}
                                    <div className="space-y-2">
                                        <Label className="text-gray-300 font-bold">מצב המחשב <span className="text-red-500">*</span></Label>
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
                                        {!spec.condition && <p className="text-xs text-yellow-500 mt-1">⚠️ אנא בחר מצב מחשב</p>}
                                    </div>

                                    {/* Battery Health - Only for laptops */}
                                    {mainCategory === "laptop" && (
                                        <div className="space-y-2 border border-gray-700/50 rounded-xl p-3 bg-gray-800/20">
                                            <Label className="text-gray-300 text-sm font-semibold">🔋 תקינות סוללה</Label>
                                            <div className="flex gap-2">
                                                <button type="button"
                                                    onClick={() => setSpec(s => ({ ...s, batteryHealth: "תקינה" }))}
                                                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${spec.batteryHealth === "תקינה" ? "bg-green-600/20 border-green-500 text-green-300" : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800"
                                                        }`}>
                                                    ✅ תקינה
                                                </button>
                                                <button type="button"
                                                    onClick={() => setSpec(s => ({ ...s, batteryHealth: "לא תקינה" }))}
                                                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${spec.batteryHealth === "לא תקינה" ? "bg-red-600/20 border-red-500 text-red-300" : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800"
                                                        }`}>
                                                    ❌ לא תקינה
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Label className="text-gray-400 text-xs whitespace-nowrap">בריאות סוללה:</Label>
                                                <Input
                                                    type="number" min="1" max="100"
                                                    value={spec.batteryPercent}
                                                    onChange={e => setSpec(s => ({ ...s, batteryPercent: e.target.value }))}
                                                    className="bg-gray-800 border-gray-700 w-20 text-center text-sm"
                                                    dir="ltr" placeholder="%"
                                                />
                                                <span className="text-gray-500 text-xs">%</span>
                                                {spec.batteryPercent && (
                                                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${Number(spec.batteryPercent) > 80 ? 'bg-green-500' :
                                                            Number(spec.batteryPercent) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`} style={{ width: `${Math.min(100, Number(spec.batteryPercent))}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-2">
                                            <Label className="text-gray-300 font-bold">טלפון ליצירת קשר <span className="text-red-500">*</span></Label>
                                            <Input value={details.contactPhone} onChange={e => setDetails(d => ({ ...d, contactPhone: e.target.value }))} dir="ltr" className="bg-gray-800 border-gray-700" placeholder="05X-XXXXXXX" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300 font-bold">מחיר מבוקש (₪) <span className="text-red-500">*</span></Label>
                                            <Input value={details.price ? Number(details.price.replace(/,/g, "")).toLocaleString() : ""} onChange={handlePriceChange} dir="ltr" className="bg-gray-800 border-blue-500 font-bold text-center text-lg" placeholder="0" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-2">
                                        <Label className="text-gray-300">טקסט חופשי למודעה (תיאור)</Label>
                                        <Textarea
                                            value={details.description}
                                            onChange={e => setDetails(d => ({ ...d, description: e.target.value }))}
                                            placeholder="כתוב כאן כל מה שצריך מסביב - סיבת מכירה, תוספות מעניינות..."
                                            className="bg-gray-800 border-gray-700 h-24"
                                        />
                                    </div>

                                    {/* ==== SECTION: IMAGES ==== */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b border-gray-800 pb-2 text-gray-200">🖼️ תמונות וסרטון</h3>
                                        <p className="text-gray-500 text-xs">מומלץ להעלות תמונות אמיתיות (לא מספר דגם מרשת) + סרטון קצר שמוריא את המוצר מתפקד.</p>

                                        {/* Image previews */}
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

                                        {/* Video preview */}
                                        {videoUrl && (
                                            <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-purple-700/50 mb-3">
                                                <video src={videoUrl} controls className="w-full max-h-48 object-contain" />
                                                <button type="button" onClick={() => setVideoUrl("")} className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            {/* Image upload */}
                                            <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-gray-500 hover:bg-gray-800/50 transition-colors">
                                                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-purple-400 mb-2" /> : <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />}
                                                <span className="text-sm font-medium text-gray-300">{uploading ? "מעלה תמונה..." : "🖼️ העלה תמונה"}</span>
                                                <span className="text-xs text-gray-500 mt-1">תמונות מהמכשיר / סלולרי</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                            </label>

                                            {/* Video upload */}
                                            <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-purple-700/50 rounded-xl cursor-pointer hover:border-purple-600 hover:bg-purple-900/10 transition-colors">
                                                {uploadingVideo
                                                    ? <Loader2 className="w-6 h-6 animate-spin text-purple-400 mb-2" />
                                                    : <span className="text-2xl mb-2">🎬</span>
                                                }
                                                <span className="text-sm font-medium text-gray-300">
                                                    {uploadingVideo ? "מעלה סרטון..." : videoUrl ? "שנה סרטון" : "🎬 העלה סרטון"}
                                                </span>
                                                <span className="text-xs text-gray-500 mt-1">מכשיר / סלולרי בלבד (MP4, MOV...)</span>
                                                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* ──── DYNAMIC RISK / DATA SUMMARY REPORT ──── */}
                                    <div className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5 space-y-4">
                                        <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                                            📋 דוח סיכום נתונים – בדוק לפני פרסום
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {(() => {
                                                // Generate contextual report items
                                                let items: any[] = [];

                                                if (computerTypeMode === 'custom_build') {
                                                    // ── CUSTOM BUILD ──
                                                    items = [
                                                        { label: "לוח אם", val: cbSpec["לוח אם - יצרן"], required: true },
                                                        { label: "דגם לוח", val: cbSpec["לוח אם - דגם"], required: false },
                                                        { label: "מעבד", val: cbSpec["מעבד"], required: true },
                                                        { label: "קירור", val: cbSpec["קירור למעבד"], required: false },
                                                        { label: "כרטיס מסך", val: cbSpec["כרטיס מסך"], required: true },
                                                        { label: "זיכרון RAM", val: `${cbSpec["RAM - סוג"] || ""} ${cbSpec["RAM - תצורה"] || ""}`.trim(), required: true },
                                                        { label: "מהירות RAM", val: cbSpec["RAM - מהירות"], required: false },
                                                        { label: "כונן ראשי", val: cbSpec["כונן ראשי"], required: true },
                                                        { label: "כונן נוסף", val: cbSpec["כונן נוסף"], required: false },
                                                        { label: "מארז", val: cbSpec["מארז - יצרן"], required: true },
                                                        { label: "ספק כח", val: cbSpec["ספק כח - יצרן"], required: true },
                                                        { label: "מערכת הפעלה", val: cbSpec["מערכת הפעלה"], required: true },
                                                    ];

                                                    // Add monitor if custom build includes one
                                                    if (cbSpec["מסך - גודל"]) {
                                                        items.push(
                                                            { label: "מסך כלול", val: `${cbSpec["מסך - גודל"]} ${cbSpec["מסך - רזולוציה"] || ""}`.trim(), required: false }
                                                        );
                                                    }
                                                } else {
                                                    // ── BRANDED / AIO / LAPTOP ──
                                                    items = [
                                                        { label: "יצרן", val: spec.brand, required: true },
                                                        { label: "דגם", val: spec.subModel, required: true },
                                                        { label: "מעבד", val: spec.cpu, required: true },
                                                        { label: "כרטיס מסך", val: spec.gpu, required: false },
                                                        { label: "זיכרון RAM", val: spec.ram, required: true },
                                                        { label: "אחסון", val: spec.storage, required: true },
                                                        { label: "מערכת הפעלה", val: spec.os, required: true },
                                                    ];

                                                    if (mainCategory === "laptop") {
                                                        items.push(
                                                            { label: "גודל מסך", val: spec.screen, required: true },
                                                            { label: "תקינות סוללה", val: spec.batteryHealth, required: false },
                                                            { label: "בריאות %", val: spec.batteryPercent ? `${spec.batteryPercent}%` : "", required: false },
                                                            { label: "משקל", val: spec.weight, required: false }
                                                        );
                                                    } else if (computerTypeMode === "all_in_one") {
                                                        items.push(
                                                            { label: "מסך מובנה", val: cbSpec["מסך - גודל"], required: true },
                                                            { label: "רזולוציה", val: cbSpec["מסך - רזולוציה"], required: false }
                                                        );
                                                    } else if (mainCategory === "desktop") {
                                                        // General Desktop (Branded) - check if user added external monitor info
                                                        if (cbSpec["מסך - גודל"]) {
                                                            items.push({ label: "מסך חיצוני", val: cbSpec["מסך - גודל"], required: false });
                                                        }
                                                    }
                                                }

                                                // Common fields (Added to all)
                                                const common = [
                                                    { label: "מצב", val: spec.condition, required: true },
                                                    { label: "מחיר", val: details.price ? `₪${Number(details.price.replace(/,/g, "")).toLocaleString()}` : "", required: true },
                                                    { label: "טלפון לקשר", val: details.contactPhone, required: true },
                                                    { label: "נזקים/הערות", val: spec.extras || "ללא", required: false },
                                                    { label: "🖼️ תמונות", val: details.images.length > 0 ? `${details.images.length} תמונות` : "", required: false, warning: true },
                                                    { label: "🎬 סרטון", val: videoUrl || "", required: false, warning: true }
                                                ];

                                                return [...items, ...common];
                                            })().map(({ label, val, required, warning }) => {
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
                                        {uncertainFields.length > 0 && (
                                            <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                שדות מסומנים בצהוב לא אושרו – אנא בדוק לפני פרסום
                                            </div>
                                        )}
                                    </div>

                                    {/* ALWAYS VISIBLE SUBMIT */}
                                    <div className="sticky bottom-4 pt-4 border-t border-gray-800 bg-gray-900/90 backdrop-blur z-10 p-4 -mx-4 md:mx-0 md:p-0 md:bg-transparent rounded-xl">
                                        <Button
                                            type="submit"
                                            disabled={loading || !spec.brand || !spec.subModel || !details.price}
                                            className={`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-lg ${uncertainFields.length > 0
                                                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20"
                                                }`}
                                        >
                                            {loading ? <Loader2 className="animate-spin w-6 h-6 ml-2" /> : null}
                                            {uncertainFields.length > 0 ? "פרסם מודעה (שים לב לנתונים הצהובים)" : "פרסם מודעה 🚀"}
                                        </Button>
                                    </div>

                                </form>
                            </>
                        )}
                    </>
                )}

            </div>
        </div >
    );
}
