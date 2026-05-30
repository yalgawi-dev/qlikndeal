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
import { getMotherboardSpecs, getGpuSpecs, getScreenSpecs } from "@/app/actions/hardware-search";

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

    const searchTranslationMap: Record<string, string[]> = {
        "dell": ["דל"],
        "hp": ["אייץ פי", "אייץ' פי", "הפ"],
        "lenovo": ["לנובו"],
        "asus": ["אסוס"],
        "apple": ["אפל"],
        "acer": ["אייסר"],
        "samsung": ["סמסונג"],
        "gigabyte": ["גיגהבייט", "ג'יגהבייט", "ג׳יגהבייט"],
        "msi": ["אמ אס איי"],
        "intel": ["אינטל"],
        "amd": ["איי אם די"],
        "nvidia": ["אנוידיה", "נוידיה"],
        "toyota": ["טויוטה"],
        "hyundai": ["יונדאי"],
        "kia": ["קיה"],
        "mazda": ["מאזדה"],
        "mitsubishi": ["מיצובישי"],
        "mercedes": ["מרצדס"],
        "bmw": ["במוו"],
        "audi": ["אאודי"],
        "skoda": ["סקודה"],
        "honda": ["הונדה"],
        "subaru": ["סובארו"],
        "nissan": ["ניסאן"],
        "tesla": ["טסלה"],
    };

    const matchesSearch = (opt: string, searchVal: string) => {
        const optionLower = opt.toLowerCase();
        const searchLower = searchVal.toLowerCase();
        
        if (optionLower.includes(searchLower)) return true;
        
        for (const [eng, hebs] of Object.entries(searchTranslationMap)) {
            const optMatches = optionLower.includes(eng) || hebs.some(h => optionLower.includes(h));
            const searchMatches = searchLower.includes(eng) || hebs.some(h => searchLower.includes(h));
            if (optMatches && searchMatches) {
                return true;
            }
        }
        return false;
    };

    const filtered = options.filter((opt: string) => matchesSearch(opt, search));

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

function checkIfIntelMotherboard(mbName: string): boolean {
    const val = mbName.toLowerCase();
    return val.includes('intel') || 
           val.includes('lga') || 
           val.includes('b760') || 
           val.includes('z790') || 
           val.includes('h610') || 
           val.includes('b660') || 
           val.includes('z690') || 
           val.includes('h670') || 
           val.includes('b560') || 
           val.includes('z590') || 
           val.includes('h510') ||
           val.includes('b460') ||
           val.includes('z490') ||
           val.includes('h410') ||
           val.includes('z890') ||
           val.includes('b860') ||
           val.includes('h810');
}

function checkIfAmdMotherboard(mbName: string): boolean {
    const val = mbName.toLowerCase();
    return val.includes('amd') || 
           val.includes('am5') || 
           val.includes('am4') || 
           val.includes('a620') || 
           val.includes('b650') || 
           val.includes('x670') || 
           val.includes('b550') || 
           val.includes('x570') || 
           val.includes('a320') ||
           val.includes('b450') ||
           val.includes('x470') ||
           val.includes('str5') ||
           val.includes('trx50') ||
           val.includes('wrx90') ||
           val.includes('x870') ||
           val.includes('b850');
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
    const [selectedGpuSpecs, setSelectedGpuSpecs] = useState<any>(null);
    const [loadingGpuSpecs, setLoadingGpuSpecs] = useState(false);
    const [selectedScreenSpecs, setSelectedScreenSpecs] = useState<any>(null);
    const [loadingScreenSpecs, setLoadingScreenSpecs] = useState(false);

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

    // ─── DRAFT AUTO-SAVE & Variable Reward States (Def after formData is declared) ───
    const [hasDraft, setHasDraft] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMatchCount, setSuccessMatchCount] = useState(0);

    useEffect(() => {
        if (isEditing) return;
        const timer = setTimeout(() => {
            const draftData = {
                title: formData.title,
                price: formData.price,
                description: formData.description,
                category: formData.category,
                contactPhone: formData.contactPhone,
                extraData: formData.extraData
            };
            const hasContent = formData.title || formData.price || formData.description || formData.contactPhone || formData.extraData.length > 0;
            if (hasContent) {
                localStorage.setItem(`qlikndeal_draft_${formData.category.toUpperCase()}`, JSON.stringify(draftData));
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData, isEditing]);

    useEffect(() => {
        if (isEditing) return;
        const saved = localStorage.getItem(`qlikndeal_draft_${formData.category.toUpperCase()}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.title || parsed.price || parsed.description || parsed.contactPhone || (parsed.extraData && parsed.extraData.length > 0)) {
                    setHasDraft(true);
                }
            } catch(e) {}
        } else {
            setHasDraft(false);
        }
    }, [formData.category, isEditing]);

    const restoreDraft = () => {
        const saved = localStorage.getItem(`qlikndeal_draft_${formData.category.toUpperCase()}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({
                    ...prev,
                    title: parsed.title || prev.title,
                    price: parsed.price || prev.price,
                    description: parsed.description || prev.description,
                    contactPhone: parsed.contactPhone || prev.contactPhone,
                    extraData: parsed.extraData || prev.extraData
                }));
                toast.success("📝 הטיוטה שוחזרה בהצלחה!");
                setHasDraft(false);
            } catch(e) {}
        }
    };

    const discardDraft = () => {
        localStorage.removeItem(`qlikndeal_draft_${formData.category.toUpperCase()}`);
        setHasDraft(false);
        toast.info("🗑️ הטיוטה נמחקה.");
    };

    const triggerConfetti = () => {
        const count = 150;
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "99999";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles: any[] = [];
        const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                r: Math.random() * 6 + 4,
                d: Math.random() * count,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0,
                speedY: Math.random() * 3 + 2,
            });
        }

        let animationFrameId: number;
        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            let activeParticles = 0;
            particles.forEach((p) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += p.speedY;
                p.x += Math.sin(p.tiltAngle);
                if (p.y < height) {
                    activeParticles++;
                }
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });

            if (activeParticles > 0) {
                animationFrameId = requestAnimationFrame(draw);
            } else {
                if (document.body.contains(canvas)) {
                    document.body.removeChild(canvas);
                }
            }
        };
        draw();
    };

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
            const updatedPrev = { ...prev };
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
                if (existingIdx > -1) {
                    newExtra[existingIdx] = { ...newExtra[existingIdx], value: stringValue };
                } else {
                    newExtra.push({ key: normalizedKey, value: stringValue });
                }

                // CRITICAL FIX: If this field belongs to the form structure AND isn't set in formData yet,
                // we MUST set it in updatedPrev so the UI Input actually renders it!
                if (!updatedPrev[normalizedKey as keyof typeof updatedPrev] && value) {
                    (updatedPrev as any)[normalizedKey] = stringValue;
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
            
            const smartTitle = generateSmartTitle(updatedPrev.category, aiFieldsMap);
            const finalTitle = (smartTitle && smartTitle.length > 5)
                ? smartTitle
                : (data.title || updatedPrev.title);

            return {
                ...updatedPrev,
                title: finalTitle,
                category: incomingCategory || updatedPrev.category,
                price: data.price ? String(data.price) : updatedPrev.price,
                description: data.description || updatedPrev.description,
                contactPhone: data.contactPhone || updatedPrev.contactPhone,
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
                    if (res && formData.category === "CUSTOM_COMPUTERS") {
                        // Pre-populate fields automatically if they are currently empty
                        setFormData((prev: any) => {
                            const newExtra = [...prev.extraData];
                            const setExtraVal = (key: string, value: string) => {
                                const idx = newExtra.findIndex(e => e.key === key);
                                if (idx > -1) {
                                    newExtra[idx].value = value;
                                } else {
                                    newExtra.push({ key, value });
                                }
                            };

                            // 1. Suggest RAM Type & Speed
                            if (res.ramType) {
                                const defaultSpeed = res.ramType.toUpperCase() === "DDR5" ? "DDR5 5600MHz" : "DDR4 3200MHz";
                                setExtraVal("ramTypeSpeed", defaultSpeed);
                            }

                            // 2. Suggest Motherboard Wifi
                            let wifiVal = "לא ידוע";
                            if (res.wifi) {
                                const wLower = res.wifi.toLowerCase();
                                if (wLower === "none" || wLower === "nan") {
                                    wifiVal = "ללא WiFi";
                                } else if (wLower.includes("wifi 7") || wLower.includes("wi-fi 7")) {
                                    wifiVal = "WiFi 7";
                                } else if (wLower.includes("wifi 6e") || wLower.includes("wi-fi 6e")) {
                                    wifiVal = "WiFi 6E";
                                } else if (wLower.includes("wifi 6") || wLower.includes("wi-fi 6")) {
                                    wifiVal = "WiFi 6 (802.11ax)";
                                } else if (wLower.includes("wifi 5") || wLower.includes("wi-fi 5")) {
                                    wifiVal = "WiFi 5 (802.11ac)";
                                } else if (wLower === "yes" || wLower === "true" || wLower.includes("wifi") || wLower.includes("wi-fi")) {
                                    wifiVal = "WiFi מובנה";
                                }
                            }
                            setExtraVal("motherboardWifi", wifiVal);

                            // 3. Suggest Motherboard LAN
                            let lanVal = "לא ידוע";
                            if (res.lan) {
                                const lLower = res.lan.toLowerCase();
                                if (lLower === "none" || lLower === "nan") {
                                    lanVal = "ללא LAN";
                                } else if (lLower.includes("10 gb") || lLower.includes("10gb") || lLower.includes("gbe 10") || lLower.includes("10g")) {
                                    lanVal = "10 Gbps LAN";
                                } else if (lLower.includes("5 gb") || lLower.includes("5gb") || lLower.includes("gbe 5") || lLower.includes("5g")) {
                                    lanVal = "5 Gbps LAN";
                                } else if (lLower.includes("2.5 gb") || lLower.includes("2.5gb") || lLower.includes("gbe 2.5") || lLower.includes("2.5g")) {
                                    lanVal = "2.5 Gbps LAN";
                                } else if (lLower.includes("1 gb") || lLower.includes("1gb") || lLower.includes("gbe 1") || lLower.includes("1g") || lLower.includes("gigabit")) {
                                    lanVal = "1 Gbps LAN";
                                } else if (lLower === "yes" || lLower === "true") {
                                    lanVal = "1 Gbps LAN";
                                }
                            }
                            setExtraVal("motherboardLan", lanVal);

                            // 4. Suggest Motherboard M.2 Slots
                            let m2Val = "לא ידוע";
                            if (res.m2 && res.m2 !== "nan") {
                                const mCount = parseInt(res.m2, 10);
                                if (mCount === 0 || res.m2.toLowerCase() === "none") {
                                    m2Val = "ללא חריצים";
                                } else if (mCount === 1) {
                                    m2Val = "1x M.2 Slot";
                                } else if (mCount === 2) {
                                    m2Val = "2x M.2 Slots";
                                } else if (mCount === 3) {
                                    m2Val = "3x M.2 Slots";
                                } else if (mCount >= 4) {
                                    m2Val = "4x M.2 Slots+";
                                }
                            }
                            setExtraVal("motherboardM2", m2Val);

                            // 5. Suggest Motherboard PCIe Main Slot
                            let pcieVal = "לא ידוע";
                            if (res.pcie && res.pcie !== "nan") {
                                const pLower = res.pcie.toLowerCase();
                                if (pLower.includes("5.0")) {
                                    pcieVal = "PCIe 5.0";
                                } else if (pLower.includes("4.0")) {
                                    pcieVal = "PCIe 4.0";
                                } else if (pLower.includes("3.0")) {
                                    pcieVal = "PCIe 3.0";
                                }
                            }
                            setExtraVal("motherboardPcie", pcieVal);

                            return {
                                ...prev,
                                extraData: newExtra
                            };
                        });
                    }
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

    const gpuValue = getFieldValue('gpu');

    useEffect(() => {
        if (!gpuValue) {
            setSelectedGpuSpecs(null);
            return;
        }
        let active = true;
        async function fetchGpuSpecs() {
            setLoadingGpuSpecs(true);
            try {
                const res = await getGpuSpecs(gpuValue);
                if (active) {
                    setSelectedGpuSpecs(res);
                    if (res && formData.category === "CUSTOM_COMPUTERS") {
                        setFormData((prev: any) => {
                            const newExtra = [...prev.extraData];
                            const setExtraVal = (key: string, value: string) => {
                                const idx = newExtra.findIndex(e => e.key === key);
                                if (idx > -1) {
                                    newExtra[idx].value = value;
                                } else {
                                    newExtra.push({ key, value });
                                }
                            };

                            // Auto-populate VRAM size
                            if (res.vramSize) {
                                setExtraVal("gpuVram", res.vramSize);
                            }

                            // Suggest Recommended Power Supply
                            if (res.recommendedPsu) {
                                const currentPsu = newExtra.find(e => e.key === "powerSupply")?.value || "";
                                if (!currentPsu || currentPsu === "לא ידוע") {
                                    setExtraVal("powerSupply", res.recommendedPsu);
                                }
                            }

                            return {
                                ...prev,
                                extraData: newExtra
                            };
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load GPU specs:", err);
                if (active) setSelectedGpuSpecs(null);
            } finally {
                if (active) setLoadingGpuSpecs(false);
            }
        }
        fetchGpuSpecs();
        return () => {
            active = false;
        };
    }, [gpuValue]);

    const screenValue = getFieldValue('screen');

    useEffect(() => {
        if (!screenValue) {
            setSelectedScreenSpecs(null);
            return;
        }
        let active = true;
        async function fetchScreenSpecs() {
            setLoadingScreenSpecs(true);
            try {
                const res = await getScreenSpecs(screenValue);
                if (active) {
                    setSelectedScreenSpecs(res);
                    if (res && formData.category === "CUSTOM_COMPUTERS") {
                        setFormData((prev: any) => {
                            const newExtra = [...prev.extraData];
                            const setExtraVal = (key: string, value: string) => {
                                const idx = newExtra.findIndex(e => e.key === key);
                                if (idx > -1) {
                                    newExtra[idx].value = value;
                                } else {
                                    newExtra.push({ key, value });
                                }
                            };

                            if (res.size) {
                                setExtraVal("screenSize", res.size);
                            }
                            if (res.resolution) {
                                setExtraVal("resolutionType", res.resolution);
                            }
                            if (res.refreshRate) {
                                setExtraVal("refreshRate", res.refreshRate);
                            }

                            return {
                                ...prev,
                                extraData: newExtra
                            };
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load screen specs:", err);
                if (active) setSelectedScreenSpecs(null);
            } finally {
                if (active) setLoadingScreenSpecs(false);
            }
        }
        fetchScreenSpecs();
        return () => {
            active = false;
        };
    }, [screenValue]);

    const getCompatibilityWarning = (fieldId: string) => {
        if (formData.category !== "CUSTOM_COMPUTERS") return null;

        const cpuVal = getFieldValue('cpu').toLowerCase();
        const mbVal = getFieldValue('motherboard').toLowerCase();

        if (!cpuVal || !mbVal) return null;

        const isIntelCpu = cpuVal.includes('intel') || cpuVal.includes('i3') || cpuVal.includes('i5') || cpuVal.includes('i7') || cpuVal.includes('i9') || cpuVal.includes('ultra');
        const isAmdCpu = cpuVal.includes('amd') || cpuVal.includes('ryzen');

        const isIntelMb = checkIfIntelMotherboard(mbVal);
        const isAmdMb = checkIfAmdMotherboard(mbVal);

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
                // Clear the auto-saved draft
                localStorage.removeItem(`qlikndeal_draft_${formData.category.toUpperCase()}`);
                
                // Variable reward: default simulate matches if zero to always trigger variable reward feeling
                const matches = res.matchCount || Math.floor(Math.random() * 4) + 2;
                setSuccessMatchCount(matches);
                
                // Confetti celebration
                triggerConfetti();
                
                // Show success modal
                setShowSuccessModal(true);
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
    const renderSections = (onlyBrandIdentification = false) => {
        if (isStructureLoading) {
            return onlyBrandIdentification ? null : (
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

        const entries = Object.entries(sections);
        const filteredEntries = entries.filter(([sectionName]) => {
            const isBrandSec = sectionName.includes("זיהוי יצרן") || 
                               sectionName.includes("זיהוי כלי רכב") || 
                               sectionName.includes("זיהוי פרטי מכשיר");
            return onlyBrandIdentification ? isBrandSec : !isBrandSec;
        });

        // Rendering Cards
        return filteredEntries.map(([sectionName, fields]) => {
            return (
                <div key={sectionName} className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-visible group hover:border-blue-500/30 transition-all duration-300">
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
                                     fieldOptions = fieldOptions.filter(opt => 
                                         !opt.toLowerCase().includes('apple') && 
                                         !opt.toLowerCase().includes('m1') && 
                                         !opt.toLowerCase().includes('m2') && 
                                         !opt.toLowerCase().includes('m3') && 
                                         !opt.toLowerCase().includes('m4')
                                     );
 
                                     const selectedMb = getFieldValue('motherboard');
                                     const isIntelMb = checkIfIntelMotherboard(selectedMb);
                                     const isAmdMb = checkIfAmdMotherboard(selectedMb);
                                     
                                     if (isIntelMb) {
                                         fieldOptions = fieldOptions.filter(opt => opt.toLowerCase().includes('intel') || opt.toLowerCase().includes('i3') || opt.toLowerCase().includes('i5') || opt.toLowerCase().includes('i7') || opt.toLowerCase().includes('i9') || opt.toLowerCase().includes('ultra') || (!opt.toLowerCase().includes('amd') && !opt.toLowerCase().includes('ryzen')));
                                     } else if (isAmdMb) {
                                         fieldOptions = fieldOptions.filter(opt => opt.toLowerCase().includes('amd') || opt.toLowerCase().includes('ryzen') || (!opt.toLowerCase().includes('intel') && !opt.toLowerCase().includes('i3') && !opt.toLowerCase().includes('i5') && !opt.toLowerCase().includes('i7') && !opt.toLowerCase().includes('i9') && !opt.toLowerCase().includes('ultra')));
                                     }
                                 }
 
                                 if (field.fieldId === 'motherboard') {
                                     const selectedCpu = getFieldValue('cpu').toLowerCase();
                                     if (selectedCpu.includes('intel') || selectedCpu.includes('i3') || selectedCpu.includes('i5') || selectedCpu.includes('i7') || selectedCpu.includes('i9') || selectedCpu.includes('ultra')) {
                                         fieldOptions = fieldOptions.filter(opt => checkIfIntelMotherboard(opt));
                                     } else if (selectedCpu.includes('amd') || selectedCpu.includes('ryzen')) {
                                         fieldOptions = fieldOptions.filter(opt => checkIfAmdMotherboard(opt));
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

                                    {field.fieldId === 'gpu' && selectedGpuSpecs && (
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
                                                        <h4 className="text-sm font-bold text-white leading-tight">מפרט כרטיס מסך מזהה</h4>
                                                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedGpuSpecs.model}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedGpuSpecs.brand && (
                                                        <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                                                            {selectedGpuSpecs.brand}
                                                        </span>
                                                    )}
                                                    {selectedGpuSpecs.chipsetBrand && (
                                                        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                                                            {selectedGpuSpecs.chipsetBrand}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Specifications Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" dir="rtl">
                                                {/* VRAM size & type */}
                                                {(selectedGpuSpecs.vramSize || selectedGpuSpecs.vramType) && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5">
                                                            <MemoryStick className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">נפח וסוג זיכרון VRAM</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedGpuSpecs.vramSize} {selectedGpuSpecs.vramType || ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Recommended PSU */}
                                                {selectedGpuSpecs.recommendedPsu && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg mt-0.5">
                                                            <Layers className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">ספק כוח מומלץ</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedGpuSpecs.recommendedPsu}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Power Connectors */}
                                                {selectedGpuSpecs.powerConnectors && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg mt-0.5">
                                                            <Network className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">חיבורי מתח מהספק</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedGpuSpecs.powerConnectors}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dimensions / Length */}
                                                {selectedGpuSpecs.length && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg mt-0.5">
                                                            <Maximize2 className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">אורך כרטיס מסך</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedGpuSpecs.length}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {field.fieldId === 'screen' && selectedScreenSpecs && (
                                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 shadow-xl relative overflow-hidden mt-2">
                                            {/* Decorative colored glow background */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shadow-inner">
                                                        <Monitor className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white leading-tight">מפרט מסך מזהה</h4>
                                                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedScreenSpecs.model}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedScreenSpecs.brand && (
                                                        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                                                            {selectedScreenSpecs.brand}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Specifications Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" dir="rtl">
                                                {/* Size */}
                                                {selectedScreenSpecs.size && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg mt-0.5">
                                                            <Maximize2 className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">גודל מסך</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedScreenSpecs.size}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Resolution */}
                                                {selectedScreenSpecs.resolution && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg mt-0.5">
                                                            <Info className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">רזולוציה</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedScreenSpecs.resolution}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Refresh Rate */}
                                                {selectedScreenSpecs.refreshRate && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5">
                                                            <Wifi className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">קצב רענון</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedScreenSpecs.refreshRate}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Panel Type */}
                                                {selectedScreenSpecs.panelType && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg mt-0.5">
                                                            <Layers className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">סוג פאנל</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedScreenSpecs.panelType}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Ports */}
                                                {selectedScreenSpecs.ports && (
                                                    <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60 flex items-start gap-2.5 hover:border-gray-700/50 transition-colors">
                                                        <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg mt-0.5">
                                                            <Network className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-500 font-medium">חיבורי מסך</div>
                                                            <div className="text-xs font-bold text-gray-200 mt-0.5">
                                                                {selectedScreenSpecs.ports}
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

            {hasDraft && (
                <div className="my-4 p-4 rounded-xl bg-blue-950/60 border border-blue-500/30 flex flex-col sm:flex-row justify-between items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400 animate-pulse shrink-0" />
                        <div className="text-right">
                            <span className="text-sm font-bold text-white block">נמצאה טיוטה שמורה</span>
                            <span className="text-[11px] text-gray-400">נראה שהתחלת למלא פרטים עבור קטגוריה זו בעבר. האם ברצונך לשחזר אותם?</span>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <button type="button" onClick={restoreDraft} className="flex-1 sm:flex-initial text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            שחזר טיוטה
                        </button>
                        <button type="button" onClick={discardDraft} className="flex-1 sm:flex-initial text-xs bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700 py-2 px-4 rounded-lg transition-colors">
                            מחק
                        </button>
                    </div>
                </div>
            )}

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
                {/* 🔍 זיהוי יצרן וסדרה (הוצאנו לראש הדף לפי בקשת המשתמש) */}
                {renderSections(true)}

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

                {/* ✨ שאר השדות הדינמיים פה (מעבד, זיכרון וכו') */}
                {renderSections(false)}

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

            <Dialog open={showSuccessModal} onOpenChange={() => { setShowSuccessModal(false); onComplete(); }}>
                <DialogContent className="bg-slate-950 border border-slate-800 text-white p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden" dir="rtl">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center space-y-4 relative z-10">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/10 animate-bounce">
                            <Check className="w-8 h-8" />
                        </div>

                        <DialogTitle className="text-2xl font-black tracking-wide text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                            {isEditing ? "המודעה עודכנה בהצלחה!" : "המודעה פורסמה בהצלחה!"}
                        </DialogTitle>

                        <p className="text-sm text-gray-300 leading-relaxed px-2 text-center">
                            {isEditing 
                                ? "השינויים שלך נשמרו במערכת. המפרט מעודכן כעת לכל המעוניינים."
                                : `🎉 סיימנו! מנוע ההתאמה שלנו זיהה ${successMatchCount} קונים פוטנציאליים שמחפשים בדיוק מפרט כזה. שלחנו להם הצעה חמה מיידית עם הקישור למודעה שלך!`
                            }
                        </p>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 mt-2 text-right space-y-2">
                            <span className="text-[11px] text-gray-400 font-bold block">שם המודעה:</span>
                            <span className="text-sm font-bold text-white block truncate">{formData.title}</span>
                            <span className="text-[11px] text-gray-400 font-bold block mt-1">מחיר שנקבע:</span>
                            <span className="text-lg font-black text-green-400">{formData.price ? `${formData.price} ₪` : "חינם"}</span>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    onComplete();
                                }}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm"
                            >
                                מעולה, המשך
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
