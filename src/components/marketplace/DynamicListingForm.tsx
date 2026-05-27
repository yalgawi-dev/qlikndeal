"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createListing, updateListing, getMyPhone } from "@/app/actions/marketplace";
import { Loader2, Sparkles, Box, HardDrive, Cpu, Monitor, Maximize2, MemoryStick, AlertCircle, Check, X, ImagePlus, Video, MapPin, LocateFixed, Wifi, Layers, Calendar, Network, Info } from "lucide-react";
import { SmartAiInput } from "./SmartAiInput";
import { UniversalCatalogSearch } from "@/components/marketplace/UniversalCatalogSearch";
import Script from "next/script";
import { toast } from "sonner";
import { getMotherboardSpecs } from "@/app/actions/hardware-search";

// ─── ICON MAPPER ✨ ──────────────────────────────────────────────
const IconMapper: Record<string, any> = {
    HardDrive: HardDrive, Cpu: Cpu, Monitor: Monitor, 
    Maximize2: Maximize2, MemoryStick: MemoryStick, Settings: Box
};

// ─── SMART TITLE GENERATOR ──────────────────────────────
// מנגנון פנימי 100% - בניית כותרת מסחרית במקום ליקוח "השורה הראשונה" בתור כותרת
function generateSmartTitle(category: string, fields: Record<string, string>): string {
    const get = (...keys: string[]) => {
        for (const k of keys) if (fields[k] && fields[k].trim()) return fields[k].trim();
        return "";
    };

    const cat = (category || "").toUpperCase();

    // מחשב נייד / לפטופ
    if (["LAPTOPS", "LAPTOP"].includes(cat)) {
        const brand   = get("brand", "יצרן");
        const family  = get("family");                         // סדרת יצרן (ROG / ZenBook...)
        const model   = get("subModel", "model_name", "דגם"); // תוקן: "גמוד" היה אשר שגוי
        const ram     = get("ram", "RAM");
        const storage = get("storage", "אחסון");
        const year    = get("release_year", "שנת השקה");

        // תמיד התחל מ-"מחשב נייד" — שום מצב לא ייצר כותרת ריקה או "1TB SSD /"
        let title = "מחשב נייד";

        if (brand) {
            title += ` ${brand}`;
            // הוסף סדרה (ROG) אם אינה כבר בשם היצרן
            if (family && !brand.toLowerCase().includes(family.toLowerCase())) {
                title += ` ${family}`;
            }
            if (model) title += ` ${model}`;
        } else if (family || model) {
            if (family) title += ` ${family}`;
            if (model && model !== family) title += ` ${model}`;
        } else {
            title += " למכירה";  // "מחשב נייד למכירה" כשאין יצרן/דגם
        }

        // הוסף RAM/SSD רק אם יש נתוני יצרן/דגם (לא לזהם את הכותרת במקה שאין יצרןמודל)
        if (brand || family || model) {
            const modelLower = `${brand} ${family} ${model}`.toLowerCase();
            const storageClean = storage.replace(/\s*(SSD|HDD)$/i, "").trim();
            const alreadyHasStorage = storage && (modelLower.includes(storageClean.toLowerCase()) || /\d+\s*(?:tb|gb)/i.test(modelLower));
            const alreadyHasRam = ram && modelLower.includes(ram.replace("GB","").trim());
            if (ram && !alreadyHasRam) title += ` ${ram}`;
            if (storage && !alreadyHasStorage) title += ` / ${storage}`;
        }
        if (year && year.length === 4 && !title.includes(year)) title += ` (${year})`;
        return title.trim();
    }

    // מחשב שולחני
    if (["DESKTOPS", "DESKTOP"].includes(cat)) {
        const brand = get("brand", "יצרן");
        const model = get("subModel", "model_name");
        const cpu = get("cpu", "מעבד");
        const ram = get("ram", "RAM");
        let title = brand && model ? `מחשב שולחני ${brand} ${model}` : brand ? `מחשב נייח ${brand}` : "מחשב שולחני";
        if (ram) title += ` ${ram}`;
        return title;
    }

    // All-in-One
    if (["AIO"].includes(cat)) {
        const brand = get("brand"); const model = get("subModel");
        return brand && model ? `AIO ${brand} ${model}` : brand ? `AIO ${brand}` : "All-in-One";
    }

    // טלפון
    if (["PHONES", "MOBILES", "PHONE"].includes(cat)) {
        const brand = get("brand", "יצרן");
        const model = get("subModel", "model_name", "דגם");
        const storage = get("storage", "נפח אחסון");
        const color = get("color", "צבע");
        let title = "";
        if (brand && model) title = `${brand} ${model}`;
        else if (brand) title = brand;
        if (storage) title += ` ${storage}`;
        if (color && color.length < 15) title += ` צבע: ${color}`;
        return title.trim();
    }

    // רכב
    if (["VEHICLES", "VEHICLE", "CARS"].includes(cat)) {
        const brand = get("brand", "make", "יצרן");
        const model = get("subModel", "model", "דגם");
        const year = get("release_year", "year", "שנת ייץ", "שנת יצור");
        const km = get("km", "קילומטראז'", "קילומטר");
        let title = brand && model ? `${brand} ${model}` : brand || model || "רכב";
        if (year) title += ` ${year}`;
        if (km) title += ` | ${km} ק"מ`;
        return title.trim();
    }

    // אלקטרוניקה
    if (["ELECTRONICS"].includes(cat)) {
        const brand = get("brand", "יצרן");
        const model = get("subModel", "model_name");
        const type = get("category", "קטגוריה");
        let title = type ? `${type}` : "מוצר אלקטרוני";
        if (brand) title += ` ${brand}`;
        if (model) title += ` ${model}`;
        return title.trim();
    }

    // חשמליים ביתיים
    if (["APPLIANCES"].includes(cat)) {
        const brand = get("brand"); const model = get("subModel");
        const type = get("category", "קטגוריה");
        const capacity = get("capacity", "קיבולת");
        let title = type ? type : "מוצר חשמל";
        if (brand) title += ` ${brand}`;
        if (model) title += ` ${model}`;
        if (capacity) title += ` ${capacity}`;
        return title.trim();
    }

    // ברירת מחדל: brand + model
    const brand = get("brand", "יצרן");
    const model = get("subModel", "model_name", "דגם");
    if (brand && model) return `${brand} ${model}`;
    if (brand) return brand;
    return "";
}

function SearchableSelect({ value, onChange, options, placeholder, icon: IconComponent, isUncertain }: any) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = options.filter((opt: string) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 w-full h-10 rounded-md bg-gray-800 text-white border px-3 cursor-pointer select-none hover:border-gray-600 transition-all ${
                    isUncertain ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gray-700'
                }`}
            >
                {IconComponent && <IconComponent className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                <span className="flex-1 truncate text-xs text-right">
                    {value || placeholder || "- בחר או הקלד -"}
                </span>
                <span className="text-slate-500 text-[10px] shrink-0">▼</span>
            </div>

            {open && (
                <div className="absolute z-[999] top-full mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-2xl p-2 space-y-1.5 flex flex-col" style={{ minWidth: '100%' }}>
                    <input
                        autoFocus
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="הקלד לחיפוש..."
                        className="w-full h-8 px-2.5 rounded bg-gray-950 border border-gray-800 text-white text-xs outline-none focus:border-blue-500/50"
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (search.trim()) {
                                    onChange(search.trim());
                                    setOpen(false);
                                    setSearch("");
                                }
                            }
                        }}
                    />
                    <div className="overflow-y-auto space-y-0.5 max-h-48 pr-1" style={{ direction: 'rtl' }}>
                        {search.trim() && !filtered.some((opt: string) => opt.toLowerCase() === search.toLowerCase().trim()) && (
                            <div
                                onClick={() => {
                                    onChange(search.trim());
                                    setOpen(false);
                                    setSearch("");
                                }}
                                className="px-2 py-1.5 rounded text-xs cursor-pointer text-blue-400 hover:bg-gray-800 font-bold text-right border border-dashed border-blue-900/50"
                            >
                                + הוסף: "{search.trim()}"
                            </div>
                        )}
                        {filtered.length > 0 ? (
                            filtered.map((opt: string) => (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        onChange(opt);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className={`px-2 py-1.5 rounded text-xs cursor-pointer text-right transition-colors ${
                                        value === opt ? 'bg-blue-600 text-white font-bold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            !search.trim() && <div className="text-slate-500 text-[10px] p-2 text-center">אין אופציות זמינות</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function DynamicListingForm({ onComplete, initialData, isEditing, listingId, initialCategory, initialListingType }: any) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uncertainFields, setUncertainFields] = useState<{field: string, weight: number}[]>([]);
    const [isSimulation, setIsSimulation] = useState(true); // עובד במצב הרצת סימולציה כברירת מחדל לאור בקשתך!
    const [customFieldName, setCustomFieldName] = useState("");
    const [customFieldValue, setCustomFieldValue] = useState("");
    const [showCustomFieldBox, setShowCustomFieldBox] = useState(false);
    const [nsfwModel, setNsfwModel] = useState<any>(null);
    const [isNsfwLoading, setIsNsfwLoading] = useState(true);
    const [selectedMbSpecs, setSelectedMbSpecs] = useState<any>(null);
    const [loadingMbSpecs, setLoadingMbSpecs] = useState(false);

    useEffect(() => {
        // We load the model via CDN script tags below to bypass Next.js webpack build errors 
        // regarding static analysis of tensorflow modules.
    }, []);
    
    // ─── DB-Driven Form Metadata ─────────────────────────────────────
    const [formStructure, setFormStructure] = useState<any[]>([]);
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    const [baseOptions, setBaseOptions] = useState<Record<string, string[]>>({}); // אופציות בסיס (לא מסוננות)
    const [isStructureLoading, setIsStructureLoading] = useState(true);
    const CASCADE_BRAND_FIELDS = ['brand', 'יצרן'];
    const CASCADE_SERIES_FIELDS = ['family', 'series', 'סדרה'];
    const CASCADE_MODEL_FIELDS = ['subModel', 'model', 'דגם'];

    const [formData, setFormData] = useState(() => {
        const activeCategory = initialCategory || "LAPTOPS"; // INITIAL fallback
        const handledKeys = ["title", "price", "description", "category", "contactPhone", "success", "suggestions", "images", "extraData"];
        const INTERNAL_KEYS = ["isCatalogMatch", "sourceTable", "batteryPercent", "modelName", "model", "originalField"];
        
        let initialExtra: {key: string, value: string}[] = [];
        
        // Populate extra data from flat AI result object (only if it's NOT a DB listing object)
        if (initialData && !isEditing && !initialData.id) {
            Object.keys(initialData).forEach(key => {
                if (handledKeys.includes(key) || INTERNAL_KEYS.includes(key)) return;
                const val = initialData[key];
                if (val !== undefined && val !== null && val !== "") {
                    initialExtra.push({ key, value: String(val) });
                }
            });
        }
            
        // Allow override if extraData existed somehow (e.g. DB listing object)
        if (initialData && initialData.extraData) {
             if (Array.isArray(initialData.extraData)) {
                 initialData.extraData.forEach((item: any) => {
                     if (item && item.key && item.value !== undefined) {
                         const existing = initialExtra.find(e => e.key === item.key);
                         if (existing) existing.value = String(item.value);
                         else initialExtra.push({ key: item.key, value: String(item.value) });
                     }
                 });
             } else if (typeof initialData.extraData === "object") {
                 Object.entries(initialData.extraData).forEach(([key, val]) => {
                     const existing = initialExtra.find(e => e.key === key);
                     if (existing) existing.value = String(val);
                     else initialExtra.push({ key, value: String(val) });
                 });
             }
        }

        return {
            title: initialData?.title || "",
            price: initialData?.price?.toString() || "",
            description: initialData?.description || "",
            category: initialData?.category || activeCategory,
            listingType: initialData?.listingType || initialListingType || "SELL",
            contactPhone: initialData?.contactPhone || "",
            images: initialData?.images ? (typeof initialData.images === "string" ? JSON.parse(initialData.images) : initialData.images) : [] as string[],
            videos: initialData?.videos ? (typeof initialData.videos === "string" ? JSON.parse(initialData.videos) : initialData.videos) : [] as string[],
            extraData: initialExtra
        };
    });

    useEffect(() => {
        if (!formData.contactPhone) {
            getMyPhone().then(res => { if (res.phone) setFormData(p => ({ ...p, contactPhone: res.phone })); });
        }
    }, [formData.contactPhone]);

    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [locationName, setLocationName] = useState("");
    const [locationMode, setLocationMode] = useState<"LIVE" | "HOME" | "">("");
    const [gettingLocation, setGettingLocation] = useState(false);

    // City Dialog State
    const [showCityDialog, setShowCityDialog] = useState(false);
    const [citySearch, setCitySearch] = useState("");
    const [cityResults, setCityResults] = useState<any[]>([]);
    const cityDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

    const loadHomeLocation = () => {
        const savedLat = localStorage.getItem("home_lat");
        const savedLng = localStorage.getItem("home_lng");
        const savedCity = localStorage.getItem("home_city");
        if (savedLat && savedLng && savedCity) {
            setLat(parseFloat(savedLat));
            setLng(parseFloat(savedLng));
            setLocationName(savedCity + " 🏠");
            setLocationMode("HOME");
        } else {
            setLocationName("לא אותר מיקום");
            setLocationMode("");
        }
    };

    const getDeviceLocation = () => {
        setLocationMode("LIVE");
        setGettingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (p) => {
                    const newLat = p.coords.latitude; const newLng = p.coords.longitude;
                    setLat(newLat); setLng(newLng);
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=10&accept-language=he`);
                        const data = await res.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || data.name;
                        if (city) { setLocationName(`${city} 📍`); setGettingLocation(false); return; }
                    } catch {}
                    setLocationName("מיקום נוכחי 📍");
                    setGettingLocation(false);
                },
                () => { 
                    setGettingLocation(false); 
                    loadHomeLocation(); 
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else { 
            setGettingLocation(false); 
            loadHomeLocation(); 
        }
    };

    useEffect(() => {
        getDeviceLocation();
    }, []);

    // ⚡ שאיבת מבנה חכם מהשרת לפי הקטגוריה הנוכחית
    useEffect(() => {
        async function fetchUIEngine() {
            setIsStructureLoading(true);
            try {
                const currentCat = formData.category || initialCategory || "GENERAL";
                const res = await fetch(`/api/marketplace/form-structure?category=${currentCat}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormStructure(data.structure || []);
                    const opts = data.options || {};
                    setDynamicOptions(opts);
                    setBaseOptions(opts); // שמור אופציות בסיס לאיפוס cascade
                }
            } catch (e) {
                console.error("Failed to load Universal Form JSON UI Engine from DB", e);
            } finally {
                setIsStructureLoading(false);
            }
        }
        fetchUIEngine();
    }, [formData.category]);

    // ⚡ CASCADE: סינון דו-כיווני — כל שדה מסנן את כל שאר השדות
    // שמור אילו שדות אוטומלאו מהקטלוג כדי שנוכל לנקות אותם בשינוי
    const autoFilledKeysRef = React.useRef<Set<string>>(new Set());

    const fetchCascade = async (key: string, value: string) => {
        const category = formData.category;
        if (!category) return;

        const isBrand = CASCADE_BRAND_FIELDS.includes(key);
        const isSeries = CASCADE_SERIES_FIELDS.includes(key);
        const isModelField = CASCADE_MODEL_FIELDS.includes(key);

        if (!isBrand && !isSeries && !isModelField) return;

        // שליפת כל הערכים הנוכחיים — לשם סינון דו-כיווני אמיתי
        const currentBrand  = isBrand  ? value : (getFieldValue('brand')  || getFieldValue('יצרן') || "");
        const currentSeries = isSeries ? value : (getFieldValue('family') || getFieldValue('series') || "");
        const currentModel  = isModelField ? value : "";

        // אם מוחקים שדה → שלח cascade עם שדות אחרים בלבד
        const params = new URLSearchParams({ category });
        if (currentBrand  && !isBrand)  params.set('brand', currentBrand);
        if (currentBrand  && isBrand && value)  params.set('brand', value);
        if (currentSeries && !isSeries) params.set('series', currentSeries);
        if (currentSeries && isSeries && value) params.set('series', value);
        if (currentModel  && value)     params.set('model', value);

        try {
            const res = await fetch(`/api/marketplace/catalog-cascade?${params}`);
            if (!res.ok) return;
            const data = await res.json();

            setDynamicOptions(prev => {
                const next = { ...prev };

                // עדכן יצרנים (כשמסננים לפי סדרה/דגם)
                if (data.brands?.length > 0) {
                    next['brand'] = data.brands;
                } else if (!currentBrand && !currentSeries && !currentModel) {
                    next['brand'] = baseOptions['brand'] || [];
                } else if (data.brands?.length === 0 && (isSeries || isModelField) && !currentBrand) {
                    next['brand'] = baseOptions['brand'] || [];
                }

                // עדכן סדרות
                if (data.series?.length > 0) {
                    next['family'] = data.series;
                    next['series'] = data.series;
                } else {
                    next['family'] = baseOptions['family'] || [];
                    next['series'] = baseOptions['series'] || [];
                }

                // עדכן דגמים
                if (data.models?.length > 0) {
                    next['subModel'] = data.models;
                    next['model']    = data.models;
                } else {
                    next['subModel'] = baseOptions['subModel'] || [];
                    next['model']    = baseOptions['model']    || [];
                }

                return next;
            });

            // AUTO-FILL: נבחר דגם ← מלא את כל השדות הידועים
            if (isModelField && value && data.autoFill) {
                const af = data.autoFill;
                // ⚡ BUG-FIX: אל תדרוס את שדה הדגם עצמו (subModel/model) —
                // זה גרם לדגם שהמשתמש ערך לחזור לערך המקורי מהקטלוג.
                // מלא רק שדות משניים (RAM, CPU, מסך וכו') ולא את שם הדגם.
                const MODEL_SELF_KEYS = new Set([...CASCADE_MODEL_FIELDS, 'modelName']);
                const newAutoKeys = new Set(
                    Object.keys(af).filter(k => af[k] && !MODEL_SELF_KEYS.has(k))
                );

                setFormData(prev => {
                    let newExtra = [...prev.extraData];

                    // 1. נקה קודם את כל השדות שאוטומלאו מהקטלוג בעבר (מלבד שדה הדגם)
                    autoFilledKeysRef.current.forEach(oldKey => {
                        if (MODEL_SELF_KEYS.has(oldKey)) return; // אל תנקה את שדה הדגם
                        const idx = newExtra.findIndex(e => e.key === oldKey);
                        if (idx > -1) newExtra[idx].value = "";
                    });

                    // 2. מלא את הערכים החדשים — **מלבד** שדות הדגם עצמם
                    Object.entries(af).forEach(([afKey, afVal]) => {
                        if (!afVal) return;
                        if (MODEL_SELF_KEYS.has(afKey)) return; // 🛡️ אל תדרוס את הדגם
                        const idx = newExtra.findIndex(e => e.key === afKey);
                        if (idx > -1) newExtra[idx].value = String(afVal);
                        else newExtra.push({ key: afKey, value: String(afVal) });
                    });

                    // 3. שמור אילו שדות אוטומלאו עכשיו
                    autoFilledKeysRef.current = newAutoKeys;

                    const mergedMap: Record<string, string> = {};
                    newExtra.forEach(e => { mergedMap[e.key] = e.value; });
                    const smartTitle = generateSmartTitle(prev.category, mergedMap);
                    return { ...prev, extraData: newExtra, title: smartTitle || prev.title };
                });
            } else if (isModelField && !value) {
                // מוחקים דגם → נקה את שדות ה-auto-fill
                setFormData(prev => {
                    const newExtra = prev.extraData.map(e =>
                        autoFilledKeysRef.current.has(e.key) ? { ...e, value: "" } : e
                    );
                    autoFilledKeysRef.current = new Set();
                    return { ...prev, extraData: newExtra };
                });
            }
        } catch (e) {
            console.error('[CASCADE] Error:', e);
        }
    };


    const applyAiData = (ai: any) => {
        const data = ai.result || ai;
        
        // ⚡ Extract category alert logic OUTSIDE of synchronous state updates to prevent React pausing bugs
        const incomingCategory = data.category?.toUpperCase();
        const currentCategory = formData.category?.toUpperCase();
        const isCategoryChanged = incomingCategory && currentCategory && incomingCategory !== currentCategory;

        if (isCategoryChanged && currentCategory !== "GENERAL") {
            setTimeout(() => {
                alert(`זיהינו שהטקסט שייך לקטגוריית ${incomingCategory} ולכן ריעננו את הטופס כדי לשמור על דיוק הנתונים.`);
            }, 100);
        }

        // ─── FIELD ALIAS NORMALIZATION (defined outside setFormData for reuse) ─────
        const FIELD_ALIASES: Record<string, string> = {
            // Brand / Model
            "series":  "family",
            "סדרה":   "family",
            "brand": "brand",
            "יצרן": "brand",
            "make": "brand",
            "submodel": "subModel",
            "דגם": "subModel",
            // RAM
            "ram": "ram",
            "זכרון": "ram",
            "זיכרון": "ram",
            // Storage
            "storage": "storage",
            "אחסון": "storage",
            "נפח": "storage",
            "נפח אחסון": "storage",
            // Extra Storage
            "extrastorage": "extraStorage",
            "extra storage": "extraStorage",
            "אחסון נוסף": "extraStorage",
            // CPU
            "cpu": "cpu",
            "מעבד": "cpu",
            // GPU — כרטיס מסך (חדש)
            "gpu": "gpu",
            "כרטיס מסך": "gpu",
            "graphics": "gpu",
            "כרטיס גרפי": "gpu",
            // Screen
            "screensize": "screen",
            "screen size": "screen",
            "מסך": "screen",
            "גודל מסך": "screen",
            // Resolution type — FHD / QHD / 4K (חדש)
            "סוג רזולוציה": "resolutionType",
            "resolution type": "resolutionType",
            "רזולוציה": "resolutionType",
            // Refresh rate
            "תדר רענון": "refreshRate",
            "refresh rate": "refreshRate",
            "הרץ": "refreshRate",
            // OS
            "מערכת הפעלה": "os",
            "operating system": "os",
            // Year
            "year": "releaseYear",
            "release_year": "releaseYear",
            "releaseyear": "releaseYear",
            "שנה": "releaseYear",
            "שנת יצור": "releaseYear",
            "שנת ייצור": "releaseYear",
            // Misc
            "color": "color",
            "צבע": "color",
            "condition": "condition",
            "מצב": "condition"
        };

        const normalizeFieldKey = (oriKey: string): string => {
            const key = oriKey.trim().toLowerCase();
            const alias = FIELD_ALIASES[key];

            // Hardcoded aliases are authoritative — return directly (no formStructure needed)
            if (alias) return alias;

            // Dynamic: check if key matches a formStructure fieldId directly
            if (formStructure.length > 0) {
                const match = formStructure.find((fs: any) =>
                    fs.fieldId.toLowerCase() === key ||
                    (fs.labelHera && fs.labelHera.toLowerCase() === key)
                );
                if (match) return match.fieldId;
            }

            // Fallback: return original key as-is
            return oriKey;
        };

        setFormData(prev => {
            const newExtra = isCategoryChanged ? [] : [...prev.extraData];
            const handledKeys = ["title", "price", "description", "category", "contactPhone", "success", "suggestions"];
            const INTERNAL_KEYS = ["isCatalogMatch", "sourceTable", "batteryPercent", "modelName", "model", "originalField"];

            // מיפוי שדות מה-AI לתוך extraData
            Object.keys(data).forEach(key => {
                if (handledKeys.includes(key)) return;
                if (INTERNAL_KEYS.includes(key)) return; // מסנן שדות פנימיים!
                const value = data[key];
                if (!value) return;
                const stringValue = Array.isArray(value) ? value.join(", ") : String(value);

                // Normalize: "series" / "סדרה" → "family" (כאשר קיים ב-formStructure)
                const normalizedKey = normalizeFieldKey(key);

                const existingIdx = newExtra.findIndex(e => e.key === normalizedKey);
                if (existingIdx > -1) newExtra[existingIdx].value = stringValue;
                else newExtra.push({ key: normalizedKey, value: stringValue });

                // CRITICAL FIX: If this field belongs to the form structure AND isn't set in formData yet,
                // we MUST set it in prev so the UI Input actually renders it!
                if (!prev[normalizedKey as keyof typeof prev] && value) {
                    (prev as any)[normalizedKey] = stringValue;
                }
            });

            // ――― בניית כותרת חכמה ―――
            const aiFieldsMap: Record<string, string> = {};
            newExtra.forEach(e => { aiFieldsMap[e.key] = e.value; });
            if (data.attributes && Array.isArray(data.attributes)) {
                data.attributes.forEach((attr: { key: string; value: string }) => {
                    if (attr.key && attr.value) aiFieldsMap[attr.key] = attr.value;
                });
            }
            if (data.make) aiFieldsMap["brand"] = data.make;
            if (data.model) aiFieldsMap["subModel"] = data.model;
            
            const smartTitle = generateSmartTitle(prev.category, aiFieldsMap);
            const finalTitle = (smartTitle && smartTitle.length > 5)
                ? smartTitle
                : (data.title || prev.title);

            return {
                ...prev,
                title: finalTitle,
                category: incomingCategory || prev.category,
                price: data.price ? String(data.price) : prev.price,
                description: data.description || prev.description,
                contactPhone: data.contactPhone || prev.contactPhone,
                extraData: newExtra
            };
        });


        if (data.suggestions) {
            const suggests = data.suggestions
                .filter((s: any) => s.action === "SUGGEST")
                .map((s: any) => ({ field: normalizeFieldKey(s.field), weight: s.confidence ? Math.round(s.confidence * 100) : (s.weight || 0) }));
                
            setUncertainFields(prev => {
                const merged = [...prev];
                suggests.forEach((s: any) => {
                    const idx = merged.findIndex(m => m.field === s.field);
                    if (idx > -1) merged[idx] = s;
                    else merged.push(s);
                });
                return merged;
            });
        }
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormData(prev => {
            const existingIdx = prev.extraData.findIndex(e => e.key === key);
            if (existingIdx > -1) {
                const arr = [...prev.extraData];
                arr[existingIdx].value = value;
                return { ...prev, extraData: arr };
            }
            return { ...prev, extraData: [...prev.extraData, { key, value }] };
        });
        // מוחק את הבועה ברגע שהיוזר משנה/מקליד בעצמו ערך
        setUncertainFields(prev => prev.filter(f => f.field !== key));
        // ⚡ CASCADE: סינון אוטומטי של אופציות תלויות
        fetchCascade(key, value);
    };

    const getFieldValue = (key: string) => {
        return formData.extraData.find(e => e.key === key)?.value || "";
    };

    const motherboardValue = getFieldValue('motherboard');

    useEffect(() => {
        if (!motherboardValue) {
            setSelectedMbSpecs(null);
            return;
        }
        let active = true;
        async function fetchSpecs() {
            setLoadingMbSpecs(true);
            try {
                const res = await getMotherboardSpecs(motherboardValue);
                if (active) {
                    setSelectedMbSpecs(res);
                }
            } catch (err) {
                console.error("Failed to load motherboard specs:", err);
                if (active) setSelectedMbSpecs(null);
            } finally {
                if (active) setLoadingMbSpecs(false);
            }
        }
        fetchSpecs();
        return () => {
            active = false;
        };
    }, [motherboardValue]);

    const getCompatibilityWarning = (fieldId: string) => {
        if (formData.category !== "CUSTOM_COMPUTERS") return null;

        const cpuVal = getFieldValue('cpu').toLowerCase();
        const mbVal = getFieldValue('motherboard').toLowerCase();

        if (!cpuVal || !mbVal) return null;

        const isIntelCpu = cpuVal.includes('intel') || cpuVal.includes('i3') || cpuVal.includes('i5') || cpuVal.includes('i7') || cpuVal.includes('i9') || cpuVal.includes('ultra');
        const isAmdCpu = cpuVal.includes('amd') || cpuVal.includes('ryzen');

        const isIntelMb = mbVal.includes('intel') || mbVal.includes('lga') || mbVal.includes('h610') || mbVal.includes('b760') || mbVal.includes('z790') || mbVal.includes('b660') || mbVal.includes('z690');
        const isAmdMb = mbVal.includes('amd') || mbVal.includes('am5') || mbVal.includes('am4') || mbVal.includes('a620') || mbVal.includes('b650') || mbVal.includes('x670') || mbVal.includes('b550') || mbVal.includes('x570') || mbVal.includes('a320');

        if (fieldId === 'motherboard' || fieldId === 'cpu') {
            if (isIntelCpu && isAmdMb) {
                return "⚠️ מעבד Intel אינו תואם ללוח אם של AMD";
            }
            if (isAmdCpu && isIntelMb) {
                return "⚠️ מעבד AMD אינו תואם ללוח אם של Intel";
            }
        }
        return null;
    };

    const addCustomField = () => {
        if (!customFieldName || !customFieldValue) return;
        handleFieldChange(customFieldName, customFieldValue);
        setCustomFieldName("");
        setCustomFieldValue("");
        setShowCustomFieldBox(false);
    };

    const removeCustomField = (key: string) => {
        setFormData(prev => ({
            ...prev,
            extraData: prev.extraData.filter(e => e.key !== key)
        }));
    };

    const killAIHallucination = (key: string, value: string) => {
        removeCustomField(key);
        // ⚡ הבקשה של ה-AI Architect: ענישה מיידית שקטה בלחיצת כפתור (Fire & Forget) ⚡
        fetch('/api/marketplace/master-penalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: key, value, category: formData.category || "GENERAL" })
        }).catch(e => console.error('Kill switch failed', e));
        console.log(`[KILL-SWITCH] Penalized AI for ${key}=${value}`);
    };

    const acceptSuggestion = (field: string) => {
        setUncertainFields(prev => prev.filter(f => f.field !== field));
    };

    const rejectSuggestion = (field: string) => {
        // שמור את הערך השגוי לפני הגריפה
        const badValue = getFieldValue(field);
        // מוחק את הערך השגוי כדי שהמשתמש ימלא מחדש
        handleFieldChange(field, "");
        setUncertainFields(prev => prev.filter(f => f.field !== field));
        // ⚡ ענישה מיידית (Fire & Forget)
        if (badValue && badValue.length > 0) {
            fetch('/api/marketplace/master-penalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, value: badValue, category: formData.category || "GENERAL" })
            }).catch(e => console.error('Reject penalize failed:', e));
            console.log(`[REJECT-PENALIZE] ענשתי AI על ${field}=${badValue}`);
        }
    };

    const getUncertain = (fieldId: string) => uncertainFields.find(f => f.field === fieldId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const extraDataObject = formData.extraData.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});

            // פונקציית למידה "על יבש" דרך ה-Log API במצב סמולציה (כדי לא ללכלך את המרקטפלייס!)
            if (isSimulation) {
                // ⚡ PERF-FIX: ביטול window.confirm החוסם — הוחלף בכפתור Submit הקיים כאישור.
                // המשתמש כבר לחץ "פרסם" — זה האישור שלו. אין צורך בדיאלוג נוסף.
                const currentLogId = localStorage.getItem("currentParserLogId");
                if (currentLogId) {
                    const reportData = {
                        title: formData.title,
                        price: parseFloat(formData.price || "0"),
                        ...extraDataObject
                    };
                    
                    // 🔥 True Fire & Forget — לא await! המשתמש לא ממתין כלל.
                    // הלמידה רצה ברקע בזמן שה-UI כבר מסיים.
                    fetch("/api/parser-log", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: currentLogId, userFinal: reportData })
                    }).catch(e => console.error("Learning background error", e));
                }
                
                // ⚡ סיים מיד — אפס loading וקרא ל-onComplete בלי להמתין לשרת
                setLoading(false);
                if(onComplete) onComplete();
                return;
            }

            let finalLat = lat || initialData?.latitude || null;
            let finalLng = lng || initialData?.longitude || null;
            let finalCity = locationName.replace(/📍|🏠/g, "").trim() || "";

            // בדיקת מיקום חכמה ומהירה - ללא המתנה ל-GPS וללא עצירת המשתמש!
            if (!isSimulation && !finalLat) {
                const savedLat = localStorage.getItem("home_lat");
                const savedLng = localStorage.getItem("home_lng");
                const savedCity = localStorage.getItem("home_city");
                
                if (savedLat && savedLng) {
                    finalLat = parseFloat(savedLat);
                    finalLng = parseFloat(savedLng);
                    if (savedCity && !extraDataObject["city"]) {
                        extraDataObject["city"] = savedCity;
                    }
                }
            }
            if (finalCity && !extraDataObject["city"]) {
                extraDataObject["city"] = finalCity;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price || "0"),
                category: formData.category,
                contactPhone: formData.contactPhone,
                images: formData.images,
                videos: formData.videos, // NEW
                condition: extraDataObject["condition"] || "לא צוין", // REQUIRED BY API
                latitude: finalLat,
                longitude: finalLng,
                listingType: formData.listingType || "SELL",
                extraData: extraDataObject
            };

            const res = isEditing ? await updateListing(listingId, payload) : await createListing(payload);
            if (res.success) {
                if (res.matchCount && res.matchCount > 0) {
                    toast.success(`🎉 נמצאו ${res.matchCount} קונים מתאימים! הודעה נשלחה אליהם.`);
                    setTimeout(() => {
                        onComplete();
                    }, 2500);
                } else {
                    toast.success(isEditing ? "המודעה עודכנה בהצלחה" : "המודעה פורסמה בהצלחה");
                    setTimeout(() => {
                        onComplete();
                    }, 1000);
                }
            }
        } catch (e) { 
            console.error(e); 
            toast.error("שגיאה בפרסום המודעה");
        } finally { 
            setLoading(false); 
        }
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Compress to JPEG with 0.7 quality to save DB space
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const checkNSFW = async (dataUrl: string): Promise<boolean> => {
        if (!nsfwModel) return true; // If model didn't load, allow pass
        return new Promise((resolve) => {
            const img = new Image();
            img.src = dataUrl;
            img.onload = async () => {
                try {
                    const predictions = await nsfwModel.classify(img);
                    const isNSFW = predictions.some((p: any) => 
                        (p.className === 'Porn' || p.className === 'Hentai' || p.className === 'Sexy') && p.probability > 0.65
                    );
                    resolve(!isNSFW); // return true if SAFE
                } catch (e) {
                    console.error("Classification error:", e);
                    resolve(true); // default to safe on error
                }
            };
            img.onerror = () => resolve(true);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setLoading(true); // Show loader during compression
        try {
            const safeImages: string[] = [];
            for (const f of files) {
                const compressed = await compressImage(f);
                const isSafe = await checkNSFW(compressed);
                if (isSafe) {
                    safeImages.push(compressed);
                } else {
                    alert(`🚨 אזהרת מערכת: באחת התמונות זוהה תוכן שעשוי להיות פוגעני/מיני. התמונה נחסמה ולא הועלתה.`);
                }
            }
            if (safeImages.length > 0) {
                setFormData(prev => ({ ...prev, images: [...prev.images, ...safeImages] }));
            }
        } catch (err) {
            console.error("Compression failed", err);
            alert("שגיאה בהעלאת התמונה.");
        } finally {
            setLoading(false);
            if (e.target) e.target.value = ''; // reset input
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        // Strict 5MB limit for video to avoid blowing up the DB / Payload limits
        if (file.size > 5 * 1024 * 1024) {
            alert("הסרטון כבד מדי! המערכת זמנית תומכת בסרטונים עד 5MB (בגרסת בטא זו).");
            e.target.value = ''; // Reset input
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, videos: [reader.result as string] }));
        reader.readAsDataURL(file);
    };

    // מנגנון בניית UI חכם אוניברסלי: ארגון השדות לפי Section
    const renderSections = () => {
        if (isStructureLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                    <div>טוען מבנה דינמי...</div>
                </div>
            );
        }

        const sections = formStructure.reduce((acc: Record<string, any[]>, field) => {
            const sec = field.sectionName || "שונות";
            if (!acc[sec]) acc[sec] = [];
            acc[sec].push(field);
            return acc;
        }, {});

        // Rendering Cards
        return Object.entries(sections).map(([sectionName, fields]) => {
            return (
                <div key={sectionName} className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                    <Label className="text-blue-400 font-bold flex items-center gap-2 mb-4 text-sm border-b border-gray-800 pb-2">
                        <Box className="w-4 h-4 text-blue-500" /> {sectionName}
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border-blue-500">
                        {fields.map(field => {
                            const IconComponent = field.icon ? IconMapper[field.icon] || Box : null;
                            
                            // Apply options filtering for motherboard-CPU compatibility
                            let fieldOptions = dynamicOptions[field.fieldId] || [];

                            if (formData.category === "CUSTOM_COMPUTERS") {
                                if (field.fieldId === 'cpu') {
                                    // Exclude Apple CPUs from Custom Computers
                                    fieldOptions = fieldOptions.filter(opt => 
                                        !opt.toLowerCase().includes('apple') && 
                                        !opt.toLowerCase().includes('m1') && 
                                        !opt.toLowerCase().includes('m2') && 
                                        !opt.toLowerCase().includes('m3') && 
                                        !opt.toLowerCase().includes('m4')
                                    );

                                    const selectedMb = getFieldValue('motherboard').toLowerCase();
                                    const isIntelMb = selectedMb.includes('intel') || selectedMb.includes('lga') || selectedMb.includes('h610') || selectedMb.includes('b760') || selectedMb.includes('z790') || selectedMb.includes('b660') || selectedMb.includes('z690');
                                    const isAmdMb = selectedMb.includes('amd') || selectedMb.includes('am5') || selectedMb.includes('am4') || selectedMb.includes('a620') || selectedMb.includes('b650') || selectedMb.includes('x670') || selectedMb.includes('b550') || selectedMb.includes('x570') || selectedMb.includes('a320');
                                    
                                    if (isIntelMb) {
                                        fieldOptions = fieldOptions.filter(opt => opt.toLowerCase().includes('intel') || opt.toLowerCase().includes('i3') || opt.toLowerCase().includes('i5') || opt.toLowerCase().includes('i7') || opt.toLowerCase().includes('i9') || opt.toLowerCase().includes('ultra') || (!opt.toLowerCase().includes('amd') && !opt.toLowerCase().includes('ryzen')));
                                    } else if (isAmdMb) {
                                        fieldOptions = fieldOptions.filter(opt => opt.toLowerCase().includes('amd') || opt.toLowerCase().includes('ryzen') || (!opt.toLowerCase().includes('intel') && !opt.toLowerCase().includes('i3') && !opt.toLowerCase().includes('i5') && !opt.toLowerCase().includes('i7') && !opt.toLowerCase().includes('i9') && !opt.toLowerCase().includes('ultra')));
                                    }
                                }

                                if (field.fieldId === 'motherboard') {
                                    const selectedCpu = getFieldValue('cpu').toLowerCase();
                                    if (selectedCpu.includes('intel') || selectedCpu.includes('i3') || selectedCpu.includes('i5') || selectedCpu.includes('i7') || selectedCpu.includes('i9') || selectedCpu.includes('ultra')) {
                                        fieldOptions = fieldOptions.filter(opt => opt.toLowerCase().includes('intel') || !opt.toLowerCase().includes('amd'));
                                    } else if (selectedCpu.includes('amd') || selectedCpu.includes('ryzen')) {
                                        fieldOptions = fieldOptions.filter(opt => opt.toLowerCase().includes('amd') || !opt.toLowerCase().includes('intel'));
                                    }
                                }
                            }

                            return (
                                <React.Fragment key={field.fieldId}>
                                    {/* ─── CUSTOM INTERCEPT: UI סוללה ייעודי לטלפונים ─── */}
                                    {field.fieldId === "batteryHealth" || field.fieldId === "batteryPercent" ? (
                                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-blue-900/20 border border-blue-800/50 p-4 rounded-xl mt-2 flex flex-col md:flex-row gap-4 animate-in fade-in">
                                            <div className="flex-1 w-full space-y-2">
                                                <Label className="text-blue-300">אחוזי בריאות סוללה</Label>
                                                <Input 
                                                    value={getFieldValue(field.fieldId)} 
                                                    onChange={e => handleFieldChange(field.fieldId, e.target.value)}
                                                    className="bg-blue-950/50 border-blue-800 font-bold text-center text-blue-100" 
                                                    placeholder="למשל: 95%"
                                                />
                                            </div>
                                            <div className="flex-1 w-full space-y-2">
                                                <Label className="text-blue-300">מצב סוללה (כללי)</Label>
                                                <select
                                                    value={getFieldValue('BatteryStatus')}
                                                    onChange={(e) => handleFieldChange('BatteryStatus', e.target.value)}
                                                    className="w-full h-10 rounded-md bg-blue-950/50 border border-blue-800 px-3 text-blue-100 outline-none"
                                                >
                                                    <option value="">- בחר מצב תקינות -</option>
                                                    <option value="✅ תקינה לגמרי">✅ תקינה לגמרי</option>
                                                    <option value="❌ דורשת החלפה">❌ דורשת החלפה</option>
                                                    <option value="🔋 הוחלפה לאחרונה">🔋 הוחלפה לאחרונה</option>
                                                    <option value="❓ לא ידוע">❓ לא ידוע</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`space-y-1.5 min-h-[70px] relative transition-all rounded-lg p-2 ${getUncertain(field.fieldId) ? 'bg-yellow-500/10 border border-yellow-500/40 pb-7' : 'border border-transparent'} ${field.colSpan > 1 ? `col-span-${field.colSpan}` : ''}`}>
                                            <Label className={`text-xs flex items-center gap-1 ${getUncertain(field.fieldId) ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                                                {IconComponent && <IconComponent className="w-3.5 h-3.5 text-slate-500" />}
                                                {field.labelHera}
                                                {getUncertain(field.fieldId) && <AlertCircle className="w-3.5 h-3.5 animate-pulse ml-1" />}
                                                {field.isDynamic && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded">AI</span>}
                                                
                                                {getUncertain(field.fieldId) && (
                                                    <span className="mr-auto text-[9px] bg-yellow-600/30 text-yellow-300 px-1.5 py-0.5 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                                        משקולת: {getUncertain(field.fieldId)?.weight}%
                                                    </span>
                                                )}
                                            </Label>
                                            
                                            {field.fieldType === "select" ? (
                                                <SearchableSelect
                                                    value={getFieldValue(field.fieldId)}
                                                    onChange={(val: string) => handleFieldChange(field.fieldId, val)}
                                                    options={fieldOptions}
                                                    placeholder={field.labelHera ? `- בחר ${field.labelHera} -` : "- בחר או הקלד -"}
                                                    icon={IconComponent}
                                                    isUncertain={!!getUncertain(field.fieldId)}
                                                />
                                            ) : (
                                                <Input 
                                                    value={getFieldValue(field.fieldId)} 
                                                    onChange={e => handleFieldChange(field.fieldId, e.target.value)}
                                                    className={`bg-gray-800 text-white ${getUncertain(field.fieldId) ? 'border-yellow-500/50' : 'border-gray-700'}`} 
                                                />
                                            )}

                                            {getCompatibilityWarning(field.fieldId) && (
                                                <div className="text-[10px] text-red-400 font-bold mt-1 bg-red-950/30 p-1.5 rounded border border-red-900/40 animate-in fade-in slide-in-from-top-1">
                                                    {getCompatibilityWarning(field.fieldId)}
                                                </div>
                                            )}

                                            {getUncertain(field.fieldId) && (
                                                <div className="absolute bottom-1 right-2 left-2 flex gap-1">
                                                    <button type="button" onClick={() => acceptSuggestion(field.fieldId)} className="flex-1 text-[10px] bg-green-500 hover:bg-green-400 text-white font-bold py-1 rounded transition-colors flex items-center justify-center gap-1">
                                                        <Check className="w-3 h-3" /> אשר
                                                    </button>
                                                    <button type="button" onClick={() => rejectSuggestion(field.fieldId)} className="flex-1 text-[10px] bg-red-500 hover:bg-red-400 text-white font-bold py-1 rounded transition-colors flex items-center justify-center gap-1">
                                                        <X className="w-3 h-3" /> דחה
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {field.fieldId === 'motherboard' && selectedMbSpecs && (
                                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 shadow-xl relative overflow-hidden mt-2">
                                            {/* Decorative colored glow background */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-inner">
                                                        <Info className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white leading-tight">מפרט לוח אם מזהה</h4>
                                                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedMbSpecs.model}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedMbSpecs.socket && (
                                                        <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                                                            {selectedMbSpecs.socket}
                                                        </span>
                                                    )}
                                                    {selectedMbSpecs.chipset && (
                                                        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                                                            {selectedMbSpecs.chipset}
                                                        </span>
                                                    )}
                                                    {selectedMbSpecs.formFactor && (
                                                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                                                            {selectedMbSpecs.formFactor}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Specifications Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" dir="rtl">
                                                {/* RAM Type & Max RAM */}
                                                {(selectedMbSpecs.ramType || selectedMbSpecs.maxRam) && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5">
                                                            <MemoryStick className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">זיכרון מירבי וסוג</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedMbSpecs.ramType || "DDR4/DDR5"} 
                                                                {selectedMbSpecs.maxRam ? ` (עד ${selectedMbSpecs.maxRam}GB)` : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* PCIe Info */}
                                                {selectedMbSpecs.pcie && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg mt-0.5">
                                                            <Layers className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">חריצי PCIe</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedMbSpecs.pcie}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* M.2 slots */}
                                                {selectedMbSpecs.m2 && selectedMbSpecs.m2 !== "nan" && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg mt-0.5">
                                                            <HardDrive className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">חיבורי M.2 SSD</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedMbSpecs.m2}x חיבורים
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* LAN */}
                                                {selectedMbSpecs.lan && selectedMbSpecs.lan !== "nan" && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg mt-0.5">
                                                            <Network className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">כרטיס רשת קווי (LAN)</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedMbSpecs.lan}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* WiFi */}
                                                {selectedMbSpecs.wifi && selectedMbSpecs.wifi !== "nan" && selectedMbSpecs.wifi !== "None" && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg mt-0.5">
                                                            <Wifi className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">תקשורת אלחוטית WiFi</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedMbSpecs.wifi}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Release Year */}
                                                {selectedMbSpecs.releaseYear && selectedMbSpecs.releaseYear !== "nan" && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg mt-0.5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">שנת יציאה לשוק</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedMbSpecs.releaseYear}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="space-y-6 max-h-[85vh] overflow-y-auto px-2 text-right" dir="rtl">
            <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs" strategy="lazyOnload" />
            <Script src="https://cdn.jsdelivr.net/npm/nsfwjs" strategy="lazyOnload" onLoad={() => {
                if (typeof window !== 'undefined' && (window as any).nsfwjs) {
                    (window as any).nsfwjs.load().then((model: any) => {
                        setNsfwModel(model);
                        setIsNsfwLoading(false);
                    }).catch((err: any) => {
                        console.error("NSFW load error:", err);
                        setIsNsfwLoading(false);
                    });
                }
            }} />
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white leading-none">מנוע AI אוניברסלי</h3>
                            <p className="text-xs text-purple-200 mt-1">מערכת דינמית מלאה. העיצוב מיובא מ-DB.</p>
                        </div>
                        <select 
                            value={formData.category?.toUpperCase()}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value, extraData: [], title: "", description: "" })}
                            className="bg-gray-950 border border-gray-700 text-white text-sm rounded px-2 py-1 outline-none"
                        >
                            <option value="GENERAL">כללי</option>
                            <option value="SMARTPHONES">טלפונים סלולריים</option>
                            <option value="LAPTOPS">מחשבים ניידים</option>
                            <option value="DESKTOPS">מחשבים נייחים (מותג)</option>
                            <option value="AIO">מחשבי All-in-One</option>
                            <option value="CUSTOM_COMPUTERS">מחשבים בהרכבה עצמית / גיימינג</option>
                        </select>
                    </div>
                </div>
            </div>

            <SmartAiInput category={formData.category} onResult={applyAiData} />

            {/* ✅ Universal Catalog Search – מתחת לתיבת ה-AI, פעיל לכל הקטגוריות הנתמכות */}
            <div className="mb-4">
                <UniversalCatalogSearch
                    category={formData.category}
                    onApplySpecs={(mappedFields) => {
                        setFormData(prev => {
                            const newExtra = [...prev.extraData];
                            // Merge ALL mapped fields from the catalog into extraData
                            Object.entries(mappedFields).forEach(([key, value]) => {
                                if (!value) return;
                                const stringVal = String(value);
                                const idx = newExtra.findIndex(e => e.key === key);
                                if (idx > -1) newExtra[idx].value = stringVal;
                                else newExtra.push({ key, value: stringVal });
                            });
                            // בניית כותרת חכמה אוטומטית מהשדות שמולאו
                            const mergedFieldsMap: Record<string, string> = {};
                            newExtra.forEach(e => { mergedFieldsMap[e.key] = e.value; });
                            // הוסף את השדות החדשים מהקטלוג גם
                            Object.entries(mappedFields).forEach(([k, v]) => { if (v) mergedFieldsMap[k] = v; });
                            const autoTitle = generateSmartTitle(prev.category, mergedFieldsMap);
                            return {
                                ...prev,
                                extraData: newExtra,
                                title: autoTitle || prev.title  // אל דרוס כותרת תקפית
                            };
                        });
                    }}
                />
            </div>

            <form onSubmit={handleSubmit} onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault(); }} className="space-y-6">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4 shadow-lg border-t-purple-500/20">
                    <Label className="text-purple-400 font-bold mb-2 block border-b border-gray-800 pb-2">פרטים מזהים (קבוע לכל מוצר)</Label>
                    <div className="space-y-1.5">
                        <Label className="text-gray-400 text-xs">כותרת המודעה</Label>
                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={`bg-gray-800 border-gray-700 text-white ${getUncertain('title') ? 'border-yellow-500 bg-yellow-500/10' : ''}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-red-400 font-bold">* מחיר (₪)</Label>
                            <Input value={formData.price} type="number" onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className={`bg-gray-800 border-gray-700 font-bold ${getUncertain('price') ? 'border-yellow-500 bg-yellow-500/10' : ''}`} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-red-400 font-bold">* טלפון לקשר</Label>
                            <Input value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4 shadow-lg border-t-blue-500/20">
                    <Label className="text-blue-400 font-bold mb-2 block border-b border-gray-800 pb-2">תמונות ווידאו</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-red-400 font-bold">* תמונות המוצר (חובה)</Label>
                            <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
                                <Input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="text-gray-400 text-sm">
                                    <ImagePlus className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                                    <span>לחץ להעלאת תמונות או גרור לכאן</span>
                                </div>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                    {formData.images.map((img: string, i: number) => (
                                        <div key={i} className="relative w-16 h-16 shrink-0">
                                            <img src={img} className="w-full h-full object-cover rounded-md border border-gray-700" />
                                            <button type="button" onClick={() => setFormData(p => ({...p, images: p.images.filter((_, idx) => idx !== i)}))} className="absolute -top-2 -right-2 bg-red-500 rounded-full text-white w-5 h-5 flex items-center justify-center text-xs">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-400 font-bold">סרטון קצר (אופציונלי)</Label>
                            <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
                                <Input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="text-gray-400 text-sm">
                                    <Video className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                                    <span>לחץ להעלאת וידאו או גרור</span>
                                </div>
                            </div>
                            {formData.videos.length > 0 && (
                                <div className="mt-2 text-green-400 text-xs font-bold flex items-center justify-between">
                                    <div className="flex items-center gap-1"><Check className="w-4 h-4"/> הועלה סרטון בהצלחה</div>
                                    <button type="button" onClick={() => setFormData(p => ({...p, videos: []}))} className="text-red-400 hover:text-red-300">הסר</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ✨ המנוע הדינמי שמצייר את הקלפים והשדות ספציפית לקטגוריה */}
                {renderSections()}

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4 shadow-lg border-t-green-500/20">
                    <div className="flex flex-col gap-1 mb-2 border-b border-gray-800 pb-3">
                        <Label className="text-green-400 font-bold flex items-center gap-2 text-lg">
                            <MapPin className="w-5 h-5" /> כתובת לאיסוף המוצר
                        </Label>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                            כאן נכנסת הכתובת המדויקת שממנה אתה מוכר את המוצר.<br/>
                            זהו המיקום אליו הקונים יצטרכו להגיע (או המיקום ממנו אנו נחשב את עלויות ההובלה במידת הצורך).
                        </p>
                    </div>
                    <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${locationMode === 'LIVE' || !locationMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                               {gettingLocation ? <Loader2 className="w-5 h-5 animate-spin"/> : locationMode === 'LIVE' || !locationMode ? <LocateFixed className="w-5 h-5"/> : <MapPin className="w-5 h-5"/>}
                            </div>
                            <span className="text-xl font-bold text-white">
                               {gettingLocation ? "מאתר מיקום..." : (locationName || "לא אותר מיקום")}
                            </span>
                        </div>
                        <div className="flex gap-3">
                           {locationMode === 'HOME' && (
                              <button type="button" onClick={getDeviceLocation} className="text-xs text-green-400 border border-green-500/30 hover:bg-green-500/10 px-3 py-2 rounded-lg flex items-center gap-2 transition-all">
                                 <LocateFixed className="w-3.5 h-3.5"/> אתר אותי כעת
                              </button>
                           )}
                           <button type="button" onClick={() => setShowCityDialog(true)} className="text-xs text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 px-3 py-2 rounded-lg flex items-center gap-2 transition-all">
                              <MapPin className="w-3.5 h-3.5"/> בחר עיר ידנית
                           </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
                     <Label className="text-gray-400 text-xs block mb-1">תיאור העסקה / פגמים (אופציונלי)</Label>
                     <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="שתפו פרטים נוספים על המוצר..."
                            className="w-full bg-gray-800 border-gray-700 text-white text-sm rounded-lg p-3 min-h-[100px] outline-none focus:border-purple-500" />
                </div>

                {/* שדות מותאמים אישית (שדות דינמיים שה-AI מצא מחוץ לטופס, או שהמשתמש הוסיף) */}
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 space-y-3">
                    <Label className="text-blue-400 font-bold mb-2 flex items-center gap-2 border-b border-gray-800 pb-2">שדות חיצוניים מותאמים אישית</Label>
                    
                    {formData.extraData.filter(ed => ed.key !== 'BatteryStatus' && ed.key !== 'condition' && !formStructure.find(fs => fs.fieldId === ed.key)).map(cf => (
                        <div key={cf.key} className={`flex flex-col md:flex-row items-center gap-2 p-3 rounded-xl border transition-all ${getUncertain(cf.key) ? 'bg-yellow-500/10 border-yellow-500/40 relative pb-10' : 'bg-[#151b2b] border-gray-700'}`}>
                            <div className="flex-1 w-full relative">
                                <Label className="text-xs text-gray-400 mb-1 block">שם השדה</Label>
                                <Input disabled value={cf.key} className={`bg-gray-900 text-white h-9 ${getUncertain(cf.key) ? 'border-yellow-500/50' : 'border-gray-600'}`} />
                            </div>
                            <div className="flex-[2] w-full relative">
                                <Label className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                                    ערך <span className="text-[10px] text-purple-400">(ניתן לעריכה)</span>
                                    {getUncertain(cf.key) && (
                                        <span className="mr-auto text-[9px] bg-yellow-600/30 text-yellow-300 px-1.5 py-0.5 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                            משקולת: {getUncertain(cf.key)?.weight}%
                                        </span>
                                    )}
                                </Label>
                                <Input value={cf.value} onChange={e => handleFieldChange(cf.key, e.target.value)} className={`bg-gray-900 text-white h-9 ${getUncertain(cf.key) ? 'border-yellow-500/50' : 'border-gray-600'}`} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => killAIHallucination(cf.key, cf.value)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-9 h-9 shrink-0 mt-5 relative group">
                                <X size={16} />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    מחק והענש AI
                                </span>
                            </Button>
                            
                            {getUncertain(cf.key) && (
                                <div className="absolute bottom-1 right-2 left-2 flex gap-1 justify-center max-w-[200px] mx-auto">
                                    <button type="button" onClick={() => acceptSuggestion(cf.key)} className="flex-1 text-[10px] bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-2 rounded transition-colors flex items-center justify-center gap-1">
                                        <Check className="w-3 h-3" /> אשר שדה
                                    </button>
                                    <button type="button" onClick={() => rejectSuggestion(cf.key)} className="flex-1 text-[10px] bg-red-500 hover:bg-red-400 text-white font-bold py-1 px-2 rounded transition-colors flex items-center justify-center gap-1">
                                        <X className="w-3 h-3" /> דחה ע"י AI
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* סיכום עסקה - תקציר השדות אדום (שודרג לפורמט חוזה משפטי מכירתי!) */}
                <div className="bg-[#0c0505] border-2 border-red-900/60 rounded-xl overflow-hidden mt-8 shadow-[0_0_30px_rgba(220,38,38,0.15)] relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
                    <div className="bg-gradient-to-l from-red-950/90 to-black p-4 text-center border-b-2 border-red-900/80">
                        <h3 className="text-red-400 font-black text-lg tracking-wider flex items-center justify-center gap-3">
                            <span className="bg-red-500 text-black px-2 py-0.5 rounded text-xs">טיוטת חוזה</span>
                            הצהרת מוכר: מפרט טכני מלא
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">הנתונים המפורטים מטה יהוו חלק בלתי נפרד מאסמכתת הרכישה מול הקונה.</p>
                    </div>
                    
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-sm relative z-10">
                        <div className="flex justify-between items-center border-b border-red-900/20 pb-2">
                            <span className="text-red-300 font-bold bg-red-950/40 px-3 py-1 rounded shadow-inner">כותרת העסקה</span>
                            <span className="text-white ml-2 font-medium">{formData.title || <span className="text-gray-600">-- להשלמה --</span>}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-red-900/20 pb-2">
                            <span className="text-red-300 font-bold bg-red-950/40 px-3 py-1 rounded shadow-inner">מחיר סופי (₪)</span>
                            <span className="text-white ml-2 font-black text-lg">{formData.price ? formData.price + " ₪" : <span className="text-gray-600 font-medium text-sm">-- להשלמה --</span>}</span>
                        </div>
                        
                        {/* כאן נרוץ על כל השדות שהמערכת מאפשרת למלא (FormStructure) בשביל להראות הכל! */}
                        {formStructure.map(fs => {
                            const val = getFieldValue(fs.fieldId);
                            return (
                                <div key={fs.fieldId} className="flex justify-between items-center border-b border-red-900/20 pb-2">
                                    <span className="text-red-400 font-semibold bg-red-950/20 px-2 py-0.5 rounded text-xs">{fs.labelHera}</span>
                                    <span className="text-gray-200 ml-2 font-medium dir-ltr text-left text-sm">{val || <span className="text-gray-600 text-xs">-- להשלמה --</span>}</span>
                                </div>
                            );
                        })}
                        
                        {/* וכאן נוסיף שדות דינמיים שה-AI או המשתמש המציאו שמחוץ למסד */}
                        {formData.extraData.filter(ed => !formStructure.find(f => f.fieldId === ed.key)).map(ed => (
                            <div key={ed.key} className="flex justify-between items-center border-b border-red-900/20 pb-2 bg-yellow-900/10 rounded px-1">
                                <span className="text-yellow-500 font-semibold bg-yellow-900/20 px-2 py-0.5 rounded text-xs flex gap-1 items-center"><Sparkles className="w-3 h-3"/> {ed.key}</span>
                                <span className="text-gray-200 ml-2 font-medium dir-ltr text-left text-sm">{ed.value || "--"}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* כפתור הוספת שדה מותאם אישית */}
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800">
                    {!showCustomFieldBox ? (
                        <Button type="button" variant="outline" className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-purple-500" onClick={() => setShowCustomFieldBox(true)}>
                            + אין פה נתון חשוב? הוסף שדה מותאם אישית למפרט
                        </Button>
                    ) : (
                        <div className="flex flex-col md:flex-row items-end gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <div className="flex-1 w-full space-y-1">
                                <Label className="text-xs text-gray-400">שם השדה (למשל: תוספות)</Label>
                                <Input value={customFieldName} onChange={e => setCustomFieldName(e.target.value)} className="bg-gray-900 border-gray-600 text-white" placeholder="שם השדה..." />
                            </div>
                            <div className="flex-1 w-full space-y-1">
                                <Label className="text-xs text-gray-400">ערך השדה</Label>
                                <Input value={customFieldValue} onChange={e => setCustomFieldValue(e.target.value)} className="bg-gray-900 border-gray-600 text-white" placeholder="ערך..." />
                            </div>
                            <Button type="button" onClick={addCustomField} className="bg-purple-600 hover:bg-purple-500 w-full md:w-auto h-10 mt-2 md:mt-0 shadow-lg">הוסף למפרט</Button>
                            <Button type="button" variant="ghost" className="text-gray-400 w-full md:w-auto mt-2 md:mt-0" onClick={() => setShowCustomFieldBox(false)}>ביטול</Button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 mt-4 mb-2 shadow-lg">
                    <input type="checkbox" id="simMode" checked={isSimulation} onChange={e => setIsSimulation(e.target.checked)} className="w-4 h-4 cursor-pointer accent-purple-500 rounded" />
                    <Label htmlFor="simMode" className="text-purple-300 font-bold cursor-pointer select-none">הדמיית למידה: נתח ולמד מהתיקון שלי בלי לפרסם באמת את המודעה למרקטפלייס</Label>
                </div>

                <div className="pt-4 pb-12">
                    {(!isSimulation && formData.images.length === 0) && <div className="text-red-400 text-sm font-bold text-center mb-2 animate-pulse">חובה להעלות לפחות תמונה אחת של המוצר (אלא אם זו הדמיית למידה)</div>}
                    <Button type="submit" disabled={loading || !formData.price || !formData.contactPhone || (!isSimulation && formData.images.length === 0)} className={`w-full py-6 text-lg font-bold bg-gradient-to-l ${uncertainFields.length > 0 ? 'from-yellow-600 to-orange-500 hover:from-yellow-500 hover:to-orange-400' : 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'} shadow-xl shadow-purple-500/20 group`}>
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 
                            <span className="flex items-center gap-2">
                                {uncertainFields.length > 0 ? "⚠️ פרסם / למד מודעה (ממתינים שדות לאישור)" : "פרסם מודעה 🚀"} 
                                <span className="text-white/60 text-sm font-normal">({formData.category || "GENERAL"})</span>
                            </span>
                        }
                    </Button>
                </div>
            </form>

            <Dialog open={showCityDialog} onOpenChange={setShowCityDialog}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md p-6" dir="rtl">
                    <DialogTitle className="text-xl font-bold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-cyan-400"/> בחר מרכז חיפוש
                    </DialogTitle>
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Input 
                                placeholder="הקלד עיר לחפש..." 
                                value={citySearch}
                                onChange={(e) => {
                                    setCitySearch(e.target.value);
                                    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
                                    if (e.target.value.trim().length > 1) {
                                        cityDebounceRef.current = setTimeout(async () => {
                                            try {
                                                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(e.target.value)}&countrycodes=il&format=json&limit=5&accept-language=he`);
                                                const data = await res.json();
                                                setCityResults(data || []);
                                            } catch { setCityResults([]); }
                                        }, 400);
                                    } else { setCityResults([]); }
                                }}
                                className="bg-gray-800 border-gray-700 text-white h-12 text-lg focus:ring-cyan-500"
                            />
                            {cityResults.length > 0 && (
                                <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden max-h-[250px] overflow-y-auto">
                                    {cityResults.map(res => (
                                        <div 
                                            key={res.place_id} 
                                            className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-0"
                                            onClick={() => {
                                                const cityName = res.name || res.display_name.split(",")[0];
                                                localStorage.setItem("home_city", cityName);
                                                localStorage.setItem("home_lat", res.lat);
                                                localStorage.setItem("home_lng", res.lon);
                                                setShowCityDialog(false);
                                                setLat(parseFloat(res.lat));
                                                setLng(parseFloat(res.lon));
                                                setLocationMode("HOME");
                                                setLocationName(cityName + " 🏠");
                                            }}
                                        >
                                            <div className="font-bold text-white">{res.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{res.display_name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
