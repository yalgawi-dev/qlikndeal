"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BuyerRequestCard } from "@/components/marketplace/BuyerRequestCard";
import { Search, Loader2, Plus, ArrowRight, Laptop, Monitor, Smartphone, Package, Radar, Activity, RefreshCw, MapPin, LocateFixed, MapIcon, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import dynamic from 'next/dynamic';
import { RadarDetailModal } from "@/components/marketplace/RadarDetailModal";
import { deleteRequest, updateRequest } from "@/app/actions/marketplace";

const LocationMap = dynamic(() => import('@/components/marketplace/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-500">טוען מפה...</div>
});

const VISUAL_CATEGORIES = [
    { id: "מחשבים ניידים", icon: <Laptop className="w-8 h-8" />, label: "לפטופ" },
    { id: "מחשבים שולחניים", icon: <Monitor className="w-8 h-8" />, label: "נייח / AIO" },
    { id: "טלפונים סלולריים", icon: <Smartphone className="w-8 h-8" />, label: "סמארטפון" },
    { id: "כללי", icon: <Package className="w-8 h-8" />, label: "אחר" }
];

const WIZARD_CONFIG: Record<string, { key: string, label: string, options: string[], prefix: string, hasModifiers?: boolean }[]> = {
    "מחשבים ניידים": [
        { key: "usage", label: "למה ישמש המחשב בעיקר?", options: ["גיימינג כבד", "עבודה משרדית / לימודים", "תכנות ופיתוח", "עריכת וידאו וגרפיקה"], prefix: "המיועד בעיקר ל" },
        { key: "brand", label: "איזה מותג?", options: ["Dell", "Lenovo", "Apple", "Asus", "HP", "Acer"], prefix: "מתוצרת" },
        { key: "cpu", label: "מעבד (CPU)?", options: ["i5 / Ryzen 5", "i7 / Ryzen 7", "i9 או מקביל", "מעבדי M"], prefix: "הכולל מעבד של", hasModifiers: true },
        { key: "ram", label: "זיכרון (RAM)?", options: ["8GB", "16GB", "32GB", "64GB"], prefix: "עם זיכרון פנימי של", hasModifiers: true },
        { key: "storage", label: "נפח אחסון?", options: ["256GB SSD", "512GB SSD", "1TB SSD"], prefix: "ונפח אחסון של", hasModifiers: true }
    ],
    "טלפונים סלולריים": [
        { key: "usage", label: "מה הכי חשוב לך במכשיר?", options: ["מצלמה מטורפת", "סוללה לכל היום", "ביצועים למשחקים", "עבודה וביזנס"], prefix: "עם דגש חזק על" },
        { key: "brand", label: "איזה יצרן?", options: ["Apple", "Samsung", "Xiaomi", "Google Pixel"], prefix: "מתוצרת" },
        { key: "storage", label: "נפח אחסון?", options: ["128GB", "256GB", "512GB", "1TB"], prefix: "עם אחסון בנפח של", hasModifiers: true },
        { key: "features", label: "תכונות חשובות?", options: ["גרסאות Pro / Ultra", "תמיכה ב-5G", "סוללה חזקה במיוחד", "מסך גדול"], prefix: "שכולל" }
    ],
    "מחשבים שולחניים": [
        { key: "usage", label: "סוג וייעוד המחשב?", options: ["גיימינג מתקדם", "עמדת עבודה מקצועית", "מחשב משרדי בסיסי", "All-In-One"], prefix: "המיועד עבור" },
        { key: "gpu", label: "כרטיס מסך?", options: ["RTX 3060/4060", "RTX 4070", "כרטיס מסך מובנה"], prefix: "עם כרטיס מסך מסוג", hasModifiers: true },
        { key: "ram", label: "זיכרון (RAM)?", options: ["16GB", "32GB", "64GB"], prefix: "וזיכרון של", hasModifiers: true }
    ],
    "כללי": [
        { key: "condition", label: "מצב המוצר?", options: ["חדש סגור באריזה", "כמו חדש (שומש בקושי)", "יכול להיות משומש"], prefix: "במצב של" },
        { key: "warranty", label: "אחריות?", options: ["חובה עם אחריות בתוקף", "אפשר גם בלי אחריות"], prefix: "ו" }
    ]
};

const DB_CATEGORY_MAP: Record<string, string> = {
    "מחשבים ניידים": "LAPTOPS",
    "מחשבים שולחניים": "DESKTOPS",
    "טלפונים סלולריים": "SMARTPHONES",
    "כללי": "GENERAL"
};

const getPrefixForField = (fieldId: string, label: string) => {
    if (fieldId === "touchscreen") return "מסך מגע:";
    if (fieldId === "color") return "בצבע";
    if (fieldId === "resolutionType") return "עם רזולוציה מסוג";
    if (fieldId === "display") return "עם מסך";
    return `עם ${label} של`;
};


function MyRequestsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("query") || "";

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // new states
    const [customOptions, setCustomOptions] = useState<Record<string, string[]>>({});
    const [activeCustomInput, setActiveCustomInput] = useState<string | null>(null);
    const [customInputValue, setCustomInputValue] = useState("");
    const [dbFields, setDbFields] = useState<any[]>([]);
    const [dbOptions, setDbOptions] = useState<Record<string, string[]>>({});
    const [baseOptions, setBaseOptions] = useState<Record<string, string[]>>({});
    const [dynamicSteps, setDynamicSteps] = useState<{ key: string, label: string, options: string[], prefix: string, hasModifiers?: boolean }[]>([]);
    const [hideWizard, setHideWizard] = useState(false);
    const [stepSearch, setStepSearch] = useState<Record<string, string>>({});
    const [showActiveRadarsDialog, setShowActiveRadarsDialog] = useState(false);
    const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const budgetRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    
    const CATEGORY_SINGULAR: Record<string, string> = {
        "מחשבים ניידים": "מחשב נייד",
        "מחשבים שולחניים": "מחשב נייח",
        "טלפונים סלולריים": "סמארטפון",
        "כללי": "מוצר"
    };

    // Form State
    const [showForm, setShowForm] = useState(!!initialQuery);
    const [submitting, setSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    
    const [category, setCategory] = useState("");
    const [budgetRange, setBudgetRange] = useState<[number, number]>([2000, 4500]);
    const [details, setDetails] = useState("");
    
    // Narrative Builder State
    const [narrativeState, setNarrativeState] = useState<Record<string, string[]>>({});
    const [stepModifiers, setStepModifiers] = useState<Record<string, string>>({});
    const [query, setQuery] = useState(""); // The actual editable string
    
    // AI Advisor State
    const [aiAdvice, setAiAdvice] = useState<{ message: string, type: 'warning' | 'suggestion' } | null>(null);
    
    // Budget State Interactions
    const [budgetTouched, setBudgetTouched] = useState(false);
    const [budgetFlexible, setBudgetFlexible] = useState(false);

    const [detailRequest, setDetailRequest] = useState<any>(null);
    const [isDeletingReq, setIsDeletingReq] = useState<string | null>(null);

    // Location State
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [locationName, setLocationName] = useState("");
    const [locationMode, setLocationMode] = useState<"LIVE" | "HOME" | "">("");
    const [gettingLocation, setGettingLocation] = useState(false);
    const [radius, setRadius] = useState([25]); // Radius state in km
    const [showMap, setShowMap] = useState(false);

    // City Dialog State
    const [showCityDialog, setShowCityDialog] = useState(false);
    const [citySearch, setCitySearch] = useState("");
    const [cityResults, setCityResults] = useState<any[]>([]);
    const cityDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

    const currentConfig = category ? (WIZARD_CONFIG[category] || WIZARD_CONFIG["כללי"]) : [];

    const resetForm = () => {
        setCategory("");
        setBudgetRange([2000, 4500]);
        setBudgetTouched(false);
        setBudgetFlexible(false);
        setDetails("");
        setNarrativeState({});
        setStepModifiers({});
        setQuery("");
        setEditId(null);
        setShowForm(false);
        setIsScanning(false);
        setRadius([25]);
        getDeviceLocation();
        setDynamicSteps([]);
        setCustomOptions({});
        setHideWizard(false);
    };

    const handleEdit = (req: any) => {
        setEditId(req.id);
        setQuery(req.query || "");
        try {
            const extra = JSON.parse(req.extraData || "{}");
            if (extra.budgetRange) setBudgetRange(extra.budgetRange);
            else if (extra.budget) setBudgetRange([0, extra.budget]);
            
            setCategory(extra.category !== "General" ? extra.category : "");
            setDetails(extra.details || "");
            if (extra.narrativeState) setNarrativeState(extra.narrativeState);

            // Restore location and radius constraints
            setLat(extra.lat || null);
            setLng(extra.lng || null);
            if (extra.city) {
                setLocationName(extra.city + " 📍");
                setLocationMode("HOME");
            } else {
                setLocationName("לא אותר מיקום");
                setLocationMode("");
            }
            setRadius([extra.radius === null || extra.radius === undefined ? 105 : extra.radius]);
        } catch(e) {}
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/marketplace/my-requests");
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            toast.error("שגיאה בטעינת הבקשות שלך");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("בטוח שברצונך לכבות סוכן חיפוש זה?")) return;
        setIsDeletingReq(id);
        const res = await deleteRequest(id);
        if (res.success) {
            toast.success("הסוכן כובה בהצלחה");
            setRequests(p => p.filter(r => r.id !== id));
            setDetailRequest(null);
        } else {
            toast.error("שגיאה בכיבוי הסוכן");
        }
        setIsDeletingReq(null);
    };

    const handleUpdateRequest = async (id: string, query: string, extraData?: any) => {
        const res = await updateRequest(id, { query, extraData: extraData ? JSON.stringify(extraData) : undefined });
        if (res.success) {
            setRequests(p => p.map(r => r.id === id ? { ...r, query, extraData: extraData ? JSON.stringify(extraData) : r.extraData } : r));
            setDetailRequest((prev: any) => prev ? { ...prev, query, extraData: extraData ? JSON.stringify(extraData) : prev.extraData } : null);
            toast.success("החיפוש עודכן ✓");
        } else {
            toast.error("שגיאה בעדכון");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Narrative Engine Logic
    const generateStory = (state: Record<string, string[]>, cat: string, budget: [number, number], notes: string, mods: Record<string, string>, bTouched: boolean, bFlex: boolean, dynSteps: any[] = []) => {
        if (!cat) return "";
        const singularName = CATEGORY_SINGULAR[cat] || cat;
        let story = `מחפש לקנות ${singularName}`;
        
        const config = WIZARD_CONFIG[cat] || WIZARD_CONFIG["כללי"];
        const allSteps = [...config, ...dynSteps];
        allSteps.forEach(step => {
            const selected = state[step.key];
            if (selected && selected.length > 0) {
                if (!selected.includes("Flexible")) {
                    const modifier = mods[step.key];
                    const modStr = (modifier && modifier !== "בדיוק") ? ` ${modifier}` : "";
                    story += ` ${step.prefix}${modStr} ${selected.join(" או ")}`;
                }
            }
        });

        // Add Budget Logic - ONLY if touched
        if (bTouched) {
            if (bFlex) {
                story += `, גמיש בתקציב (ללא הגבלה מסוימת)`;
            } else {
                if (budget[0] === 0) {
                   story += `, בתקציב של עד ₪${budget[1].toLocaleString()}`;
                } else {
                   story += `, בתקציב שנע בין ₪${budget[0].toLocaleString()} ל-₪${budget[1].toLocaleString()}`;
                }
            }
        }

        // Add Notes Logic
        if (notes.trim()) {
            story += `. הערה חשובה נוספת: ${notes.trim()}`;
        } else {
            story += `.`;
        }

        return story;
    };

    // Auto-update query when wizard buttons are clicked
    useEffect(() => {
        if (Object.keys(narrativeState).length > 0 || category || budgetTouched || dynamicSteps.length > 0) {
            setQuery(generateStory(narrativeState, category, budgetRange, details, stepModifiers, budgetTouched, budgetFlexible, dynamicSteps));
        }

        // Smart AI Advisor Logic
        const usage = narrativeState["usage"] || [];
        const ram = narrativeState["ram"] || [];
        const cpu = narrativeState["cpu"] || [];
        const gpu = narrativeState["gpu"] || [];
        
        let newAdvice: { message: string, type: "warning" | "suggestion" } | null = null;

        if (usage.some(u => u.includes("גיימינג") || u.includes("עריכת וידאו") || u.includes("עמדת עבודה מקצועית"))) {
            if (ram.includes("8GB")) {
                newAdvice = { message: "💡 טיפ מסוכן הראדאר: למטרות גיימינג או עריכה, זיכרון של 8GB עלול שלא להספיק. מומלץ לבחור לפחות 16GB כדי שהמחשב יעבוד חלק תחת עומס.", type: "warning" as const };
            } else if (cpu.includes("i5 / Ryzen 5") && category === "מחשבים ניידים") {
                newAdvice = { message: "💡 טיפ מסוכן הראדאר: לגיימינג כבד בנייד, מעבד i5 עלול להוות צוואר בקבוק. שקול לעלות ל-i7 או לבחור מעבד גרפי חזק.", type: "suggestion" as const };
            } else if (gpu.includes("כרטיס מסך מובנה")) {
                newAdvice = { message: "💡 טיפ מסוכן הראדאר: משחקים מתקדמים ועריכת וידאו דורשים כרטיס מסך ייעודי. כרטיס מסך מובנה יקשה מאוד על המערכת.", type: "warning" as const };
            }
        } else if (usage.some(u => u.includes("משרדי") || u.includes("לימודים"))) {
            if (ram.includes("32GB") || ram.includes("64GB")) {
                newAdvice = { message: "💡 טיפ מסוכן הראדאר: לעבודה משרדית או לימודים, 32GB זה הרבה מעל הצורך. 16GB יספיקו לך בהחלט ויחסכו לך כסף!", type: "suggestion" as const };
            }
        }
        
        setAiAdvice(newAdvice);
        
    }, [narrativeState, category, budgetRange, details, stepModifiers, budgetTouched, budgetFlexible, dynamicSteps]);


    const handleAddCustomValue = (stepKey: string) => {
        const val = customInputValue.trim();
        if (!val) return;
        
        setCustomOptions(prev => {
            const current = prev[stepKey] || [];
            if (current.includes(val)) return prev;
            return { ...prev, [stepKey]: [...current, val] };
        });
        
        toggleWizardOption(stepKey, val);
        setActiveCustomInput(null);
        customInputValue && setCustomInputValue("");
    };

    const handleAddDynamicStep = (fieldId: string) => {
        const field = dbFields.find(f => f.fieldId === fieldId);
        if (!field) return;
        
        const label = field.labelHera || field.fieldId;
        const options = dbOptions[fieldId] || [];
        const prefix = getPrefixForField(fieldId, label);
        
        setDynamicSteps(prev => {
            if (prev.some(s => s.key === fieldId)) return prev;
            return [...prev, {
                key: fieldId,
                label: label,
                options: options,
                prefix: prefix,
                hasModifiers: ["ram", "storage", "extraStorage"].includes(fieldId)
            }];
        });
    };

    const getAvailableAdditionalFields = () => {
        if (!category) return [];
        const predefinedKeys = (WIZARD_CONFIG[category] || []).map(s => s.key);
        const dynamicKeys = dynamicSteps.map(s => s.key);
        const excludedFields = ["title", "price", "description", "category", "images", "videos", ...predefinedKeys, ...dynamicKeys];
        return dbFields.filter(f => !excludedFields.includes(f.fieldId));
    };

    // Load category DB fields dynamically
    useEffect(() => {
        if (!category) {
            setDbFields([]);
            return;
        }
        
        const dbCatCode = DB_CATEGORY_MAP[category] || "GENERAL";
        if (dbCatCode === "GENERAL") {
            setDbFields([]);
            return;
        }
        
        async function loadDbFields() {
            try {
                const res = await fetch(`/api/marketplace/form-structure?category=${dbCatCode}`);
                if (res.ok) {
                    const data = await res.json();
                    setDbFields(data.structure || []);
                    setDbOptions(data.options || {});
                    setBaseOptions(data.options || {});
                }
            } catch (e) {
                console.error("Failed to load DB category fields", e);
            }
        }
        loadDbFields();
    }, [category]);

    // Restore dynamic steps from narrativeState when editing
    useEffect(() => {
        if (dbFields.length === 0 || !editId || !category) return;
        
        const predefinedKeys = (WIZARD_CONFIG[category] || []).map(s => s.key);
        const savedKeys = Object.keys(narrativeState);
        
        const newDynSteps: { key: string, label: string, options: string[], prefix: string, hasModifiers?: boolean }[] = [];
        savedKeys.forEach(key => {
            if (!predefinedKeys.includes(key) && !dynamicSteps.some(s => s.key === key)) {
                const field = dbFields.find(f => f.fieldId === key);
                if (field) {
                    const label = field.labelHera || field.fieldId;
                    newDynSteps.push({
                        key,
                        label,
                        options: dbOptions[key] || [],
                        prefix: getPrefixForField(key, label),
                        hasModifiers: ["ram", "storage", "extraStorage"].includes(key)
                    });
                }
            }
        });
        
        if (newDynSteps.length > 0) {
            setDynamicSteps(prev => [...prev, ...newDynSteps]);
        }
    }, [dbFields, editId, category]);

    // Bidirectional dynamic option cascade based on current selections
    useEffect(() => {
        if (!category) return;
        const dbCatCode = DB_CATEGORY_MAP[category] || "GENERAL";
        if (dbCatCode === "GENERAL") return;

        const selectedBrands = narrativeState["brand"] || [];
        const selectedSeries = narrativeState["family"] || narrativeState["series"] || narrativeState["סדרה"] || [];
        const selectedModels = narrativeState["subModel"] || narrativeState["model"] || narrativeState["דגם"] || [];

        // If no filters are selected, restore to baseOptions
        if (selectedBrands.length === 0 && selectedSeries.length === 0 && selectedModels.length === 0) {
            setDbOptions(baseOptions);
            return;
        }

        const firstBrand = selectedBrands[0] || "";
        const firstSeries = selectedSeries[0] || "";
        const firstModel = selectedModels[0] || "";

        const params = new URLSearchParams({ category: dbCatCode });
        if (firstBrand) params.set("brand", firstBrand);
        if (firstSeries) params.set("series", firstSeries);
        if (firstModel) params.set("model", firstModel);

        async function fetchCascade() {
            try {
                const res = await fetch(`/api/marketplace/catalog-cascade?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setDbOptions(prev => {
                        const next = { ...prev };
                        if (data.brands && data.brands.length > 0) {
                            next["brand"] = data.brands;
                            next["יצרן"] = data.brands;
                        } else if (!firstBrand && !firstSeries && !firstModel) {
                            next["brand"] = baseOptions["brand"] || [];
                            next["יצרן"] = baseOptions["יצרן"] || [];
                        }
                        if (data.series && data.series.length > 0) {
                            next["family"] = data.series;
                            next["series"] = data.series;
                            next["סדרה"] = data.series;
                        } else {
                            next["family"] = baseOptions["family"] || [];
                            next["series"] = baseOptions["series"] || [];
                            next["סדרה"] = baseOptions["סדרה"] || [];
                        }
                        if (data.models && data.models.length > 0) {
                            next["subModel"] = data.models;
                            next["model"] = data.models;
                            next["דגם"] = data.models;
                        } else {
                            next["subModel"] = baseOptions["subModel"] || [];
                            next["model"] = baseOptions["model"] || [];
                            next["דגם"] = baseOptions["דגם"] || [];
                        }
                        return next;
                    });
                }
            } catch (e) {
                console.error("Failed to fetch cascade options for radar agent", e);
            }
        }
        
        fetchCascade();
    }, [narrativeState["brand"], narrativeState["family"], narrativeState["subModel"], category, baseOptions]);

    // Auto-grow textarea height dynamic adjustment based on content size
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            // Ensure height does not shrink below its initial min-height (140px)
            const newHeight = Math.max(textarea.scrollHeight, 140);
            const finalHeight = Math.min(newHeight, 350);
            textarea.style.height = `${finalHeight}px`;
        }
    }, [query, category]);

    // Populate customOptions when editing with values that are not in standard lists
    useEffect(() => {
        if (!editId || !category) return;
        const config = WIZARD_CONFIG[category] || WIZARD_CONFIG["כללי"];
        const allSteps = [...config, ...dynamicSteps];
        
        const newCustomOptions: Record<string, string[]> = { ...customOptions };
        let changed = false;
        
        Object.entries(narrativeState).forEach(([key, values]) => {
            if (!values) return;
            const step = allSteps.find(s => s.key === key);
            const standardOptions = step ? step.options : (dbOptions[key] || []);
            
            const customVals = values.filter(v => v !== "Flexible" && !standardOptions.includes(v));
            if (customVals.length > 0) {
                const existing = newCustomOptions[key] || [];
                const added = customVals.filter(v => !existing.includes(v));
                if (added.length > 0) {
                    newCustomOptions[key] = [...existing, ...added];
                    changed = true;
                }
            }
        });
        
        if (changed) {
            setCustomOptions(newCustomOptions);
        }
    }, [narrativeState, editId, category, dynamicSteps, dbOptions]);


        const getOptionsForStep = (stepKey: string, defaultOptions: string[]) => {
        const isPredefined = currentConfig.some(s => s.key === stepKey);
        const dbList = dbOptions[stepKey] || [];
        let list = isPredefined ? [...defaultOptions] : [];
        
        if (isPredefined) {
            dbList.forEach(opt => {
                if (!list.some(x => x.toLowerCase() === opt.toLowerCase())) {
                    list.push(opt);
                }
            });
        } else {
            list = [...dbList];
        }

        // Merge custom options so that user-added inputs also show as chips
        const customList = customOptions[stepKey] || [];
        customList.forEach(opt => {
            if (!list.some(x => x.toLowerCase() === opt.toLowerCase())) {
                list.push(opt);
            }
        });
        
        // Filter out DB diagnostic strings leaking into options
        list = list.filter(opt => {
            const lower = opt.toLowerCase();
            return !(
                lower.includes("diagnostics") ||
                lower.includes("סה\"כ ב-") ||
                lower.includes("db:") ||
                lower.includes("ישנים:") ||
                lower.includes("שרת:") ||
                lower.includes("זמן הפקה:") ||
                lower.includes("term-")
            );
        });
        
        const selectedBrands = (narrativeState["brand"] || []).map(b => b.toLowerCase());
        const isAppleOnly = selectedBrands.length > 0 && selectedBrands.every(b => b.includes("apple") || b.includes("אפל"));
        const isPcOnly = selectedBrands.length > 0 && selectedBrands.every(b => !b.includes("apple") && !b.includes("אפל"));
        const isSamsungOnly = selectedBrands.length > 0 && selectedBrands.every(b => b.includes("samsung") || b.includes("סמסונג"));
        
        const appleCpuKeywords = ["m1", "m2", "m3", "m4", "m5", "מעבדי M", "apple", "silicon"];
        const pcCpuKeywords = ["intel", "amd", "ryzen", "i3", "i5", "i7", "i9"];

        const brandKeywordsMap: Record<string, string[]> = {
            "apple": ["apple", "macbook", "imac", "mac mini", "mac studio", "mac pro", "ipad", "iphone", "אפל", "אייפון", "מקבוק"],
            "lenovo": ["lenovo", "thinkpad", "ideapad", "yoga", "legion", "thinkcentre", "thinkstation", "לנובו", "יוגה", "ליג'ן", "פינקפד"],
            "dell": ["dell", "latitude", "inspiron", "xps", "precision", "vostro", "optiplex", "alienware", "דל", "אקס פי אס", "לטיטיוד"],
            "asus": ["asus", "zenbook", "vivobook", "rog", "tuf", "expertbook", "אסוס", "זנבוק", "טאף"],
            "hp": ["hp", "pavilion", "elitebook", "probook", "omen", "envy", "spectre", "zbook", "victus", "אייץ'", "פביליון", "אומן"],
            "acer": ["acer", "aspire", "swift", "spin", "nitro", "predator", "אייסר", "ניטרו"],
            "samsung": ["samsung", "galaxy", "סמסונג", "גלקסי"],
            "xiaomi": ["xiaomi", "redmi", "poco", "שיאומי", "רדמי", "פוקו"],
            "google": ["google", "pixel", "גוגל", "פיקסל"]
        };
        
        if (stepKey === "cpu") {
            if (isAppleOnly) {
                list = list.filter(opt => {
                    const lower = opt.toLowerCase();
                    return appleCpuKeywords.some(kw => lower.includes(kw)) && !pcCpuKeywords.some(kw => lower.includes(kw));
                });
                if (!list.some(opt => opt.toLowerCase().includes("m1"))) {
                    list = ["מעבדי M", "Apple M1", "Apple M2", "Apple M3", "Apple M4", "Apple M5", ...list];
                }
            } else if (isPcOnly) {
                list = list.filter(opt => {
                    const lower = opt.toLowerCase();
                    return !appleCpuKeywords.some(kw => lower.includes(kw));
                });
            }
        }
        
        if (stepKey === "gpu") {
            if (isAppleOnly) {
                list = list.filter(opt => {
                    const lower = opt.toLowerCase();
                    return lower.includes("apple") || lower.includes("gpu") || lower.includes("m1") || lower.includes("m2") || lower.includes("m3") || lower.includes("m4") || lower.includes("8c") || lower.includes("10c") || lower.includes("10-core");
                });
            } else if (isPcOnly) {
                list = list.filter(opt => {
                    const lower = opt.toLowerCase();
                    return !lower.includes("apple") && !lower.includes("m1") && !lower.includes("m2") && !lower.includes("m3");
                });
            }
        }

        if (stepKey === "subModel" || stepKey === "model" || stepKey === "דגם" || stepKey === "family" || stepKey === "series" || stepKey === "סדרה") {
            if (selectedBrands.length > 0) {
                list = list.filter(opt => {
                    const lowerOpt = opt.toLowerCase();
                    return selectedBrands.some(b => {
                        const matchedBrandKey = Object.keys(brandKeywordsMap).find(key => b.includes(key) || key.includes(b));
                        const keywords = matchedBrandKey ? brandKeywordsMap[matchedBrandKey] : [b];
                        return keywords.some(kw => lowerOpt.includes(kw));
                    });
                });
            }
        }

        if (stepKey === "os" || stepKey === "operatingSystem" || stepKey === "מערכת הפעלה") {
            if (isAppleOnly) {
                if (category === "טלפונים סלולריים") {
                    list = list.filter(opt => opt.toLowerCase().includes("ios"));
                    if (list.length === 0) list = ["iOS"];
                } else {
                    list = list.filter(opt => opt.toLowerCase().includes("macos") || opt.toLowerCase().includes("os x"));
                    if (list.length === 0) list = ["macOS"];
                }
            } else {
                list = list.filter(opt => !opt.toLowerCase().includes("macos") && !opt.toLowerCase().includes("ios"));
            }
        }

        if (stepKey === "features" || stepKey === "תכונות") {
            if (isAppleOnly) {
                list = list.filter(opt => {
                    const lower = opt.toLowerCase();
                    return !lower.includes("s-pen") && !lower.includes("galaxy") && !lower.includes("גלקסי") && !lower.includes("ultra") && !lower.includes("אולטרה") && !lower.includes("סמסונג") && !lower.includes("samsung");
                });
            } else if (selectedBrands.length > 0 && !isAppleOnly) {
                list = list.filter(opt => {
                    const lower = opt.toLowerCase();
                    return !lower.includes("magsafe") && !lower.includes("dynamic island") && !lower.includes("מגסייף") && !lower.includes("אייפון") && !lower.includes("iphone") && !lower.includes("apple") && !lower.includes("אפל");
                });
            }
        }
        
        list.sort((a, b) => a.localeCompare(b, 'he', { sensitivity: 'base', numeric: true }));
        return list;
    };

    const toggleWizardOption = (stepKey: string, option: string) => {
        setNarrativeState(prev => {
            const current = prev[stepKey] || [];
            
            if (option === "Flexible") {
                return { ...prev, [stepKey]: ["Flexible"] };
            }
            
            let newArray = current.filter(x => x !== "Flexible"); // remove flexible if specific clicked
            
            if (newArray.includes(option)) {
                newArray = newArray.filter(x => x !== option);
            } else {
                newArray = [...newArray, option];
            }
            return { ...prev, [stepKey]: newArray };
        });

        // Auto-scroll to next step or budget section
        const config = WIZARD_CONFIG[category] || WIZARD_CONFIG["כללי"];
        const allSteps = [...config, ...dynamicSteps];
        const currIndex = allSteps.findIndex(s => s.key === stepKey);
        if (currIndex !== -1) {
            if (currIndex + 1 < allSteps.length) {
                const nextStep = allSteps[currIndex + 1];
                setTimeout(() => {
                    const element = stepRefs.current[nextStep.key];
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }, 200);
            } else {
                setTimeout(() => {
                    if (budgetRef.current) {
                        budgetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }, 200);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) {
            toast.error("אנא בחר קטגוריית יעד");
            return;
        }
        
        if (query.length < 5) {
            toast.error("חובה להזין מפרט בתיבת הטקסט או לבחור מהכפתורים");
            return;
        }

        setIsScanning(true);
        setSubmitting(true);
        
        setTimeout(async () => {
            try {
                const url = editId ? `/api/marketplace/request/${editId}` : "/api/marketplace/request";
                const method = editId ? "PUT" : "POST";
                
                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        query: query,
                        extraData: JSON.stringify({
                            budgetRange: budgetRange,
                            budget: budgetRange[1],
                            category: category || "General",
                            details: details,
                            narrativeState: narrativeState,
                            lat,
                            lng,
                            city: locationName.replace(/📍|🏠/g, "").trim(),
                            radius: radius[0] === 105 ? null : radius[0]
                        })
                    })
                });

                if (res.ok) {
                    toast.success(editId ? "רדאר עודכן!" : "רדאר החיפוש הופעל בהצלחה! 📡");
                    resetForm();
                    fetchRequests();
                } else {
                    toast.error("חיבור נכשל, נסה שוב");
                    setIsScanning(false);
                    setSubmitting(false);
                }
            } catch (error) {
                toast.error("שגיאה לא צפויה במערכת");
                setIsScanning(false);
                setSubmitting(false);
            }
        }, 1200);
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col">
            <Navbar />
            
            <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex gap-4 items-center mb-6 text-sm flex-wrap" dir="rtl">
                            <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors font-bold">
                                <ArrowRight className="w-4 h-4 ml-1.5" />
                                חזרה למרקטפלייס
                            </Link>
                            <span className="text-gray-700">|</span>
                            <button onClick={() => router.back()} className="inline-flex items-center text-gray-400 hover:text-gray-300 transition-colors font-bold">
                                חזור שלב אחורה
                            </button>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            <Radar className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 animate-pulse" /> סוכן ראדאר
                        </h1>
                        <p className="text-gray-400 max-w-2xl text-lg">
                            תגיד לראדאר מה אתה מחפש, והוא יסרוק עבורך את הרשת 24/7. התראה תשלח אליך ברגע שתתגלה התאמה מושלמת.
                        </p>
                        {requests.length > 0 && !category && (
                            <button
                                type="button"
                                onClick={() => setShowActiveRadarsDialog(true)}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-sm font-bold hover:bg-cyan-900/30 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] active:scale-95 animate-in fade-in"
                            >
                                <Radar className="w-4 h-4 text-cyan-400 animate-pulse" />
                                צפייה וניהול סוכני רדאר פעילים באוויר ({requests.length})
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Right Column: Wizard Form Steps */}
                        <div className={`${category ? "lg:col-span-7" : "lg:col-span-12 max-w-4xl mx-auto w-full"} space-y-6`}>
                            {/* Step 1: Category Selection Card */}
                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                <div className="flex items-center gap-2 text-cyan-400 mb-6">
                                    <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#050505]">1</div>
                                    <h3 className="font-bold text-lg text-white">בחר קטגוריה</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {VISUAL_CATEGORIES.map((cat) => {
                                        const isActive = category === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    setCategory(cat.id);
                                                    setNarrativeState({}); // reset story on category change
                                                    setDynamicSteps([]);
                                                    setCustomOptions({});
                                                    // Scroll helper
                                                    setTimeout(() => {
                                                        const firstStep = (WIZARD_CONFIG[cat.id] || WIZARD_CONFIG["כללי"])[0];
                                                        if (firstStep) {
                                                            const element = stepRefs.current[firstStep.key];
                                                            if (element) {
                                                                element.scrollIntoView({ behavior: "smooth", block: "center" });
                                                            }
                                                        }
                                                    }, 300);
                                                }}
                                                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-300 border-2 ${
                                                    isActive 
                                                    ? "bg-[#0a0a0a] border-cyan-400 shadow-[0_0_15px_#22d3ee] scale-105" 
                                                    : "bg-[#0a0a0a] border-gray-800 hover:border-gray-600 hover:bg-[#111]"
                                                }`}
                                            >
                                                <div className={isActive ? "text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" : "text-gray-500"}>
                                                    {cat.icon}
                                                </div>
                                                <span className={`font-bold text-sm ${isActive ? "text-white" : "text-gray-400"}`}>
                                                    {cat.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Wizard Steps & Constraints (Visible only after Category is chosen) */}
                            {category && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    {/* Step 2: Wizard Flow Card */}
                                    <div className="bg-[#0a0a0a] border border-cyan-500/10 rounded-3xl p-6 md:p-8 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                                        <div className="flex items-center justify-between gap-2 mb-6 border-b border-gray-800 pb-4">
                                            <div className="flex items-center gap-2 text-cyan-400">
                                                <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#050505]">2</div>
                                                <h3 className="font-bold text-lg text-white">
                                                    דרישת החיפוש שלך
                                                </h3>
                                            </div>
                                            {!hideWizard && (
                                                <button type="button" onClick={() => { setNarrativeState({}); setStepModifiers({}); setDetails(""); setBudgetTouched(false); setBudgetFlexible(false); setBudgetRange([2000,4500]); setDynamicSteps([]); setCustomOptions({}); setQuery(generateStory({}, category, [2000,4500], "", {}, false, false, [])); }} className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm">
                                                    <RefreshCw className="w-4 h-4" /> איפוס בחירות
                                                </button>
                                            )}
                                        </div>

                                        {/* Mode Selector Buttons */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setHideWizard(false)}
                                                className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-300 border flex flex-col items-center justify-center gap-1.5 ${
                                                    !hideWizard 
                                                    ? "bg-[#091a24] border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                                                    : "bg-[#0a0a0a] border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
                                                }`}
                                            >
                                                <span className="text-base">✦ סיוע מודרך (מומלץ)</span>
                                                <span className="text-[10px] opacity-75 font-normal">הקלק על מאפייני חומרה מוכנים למניעת התאמות לא רלוונטיות</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHideWizard(true)}
                                                className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-300 border flex flex-col items-center justify-center gap-1.5 ${
                                                    hideWizard 
                                                    ? "bg-[#181124] border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                                                    : "bg-[#0a0a0a] border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
                                                }`}
                                            >
                                                <span className="text-base">✍️ כתיבה חופשית</span>
                                                <span className="text-[10px] opacity-75 font-normal">הקלד את מפרט החיפוש לבד בתיבת הטקסט (ללא כפתורים)</span>
                                            </button>
                                        </div>

                                        {/* Wizard Options Flow */}
                                        {!hideWizard && (
                                            <div className="space-y-8 pl-2 border-r-2 border-gray-800 pr-4">
                                                {[...currentConfig, ...dynamicSteps].map((step, index) => {
                                                    const isPredefined = index < currentConfig.length;
                                                    const prevStepKey = (index > 0 && isPredefined) ? currentConfig[index - 1].key : null;
                                                    const isVisible = !prevStepKey || (narrativeState[prevStepKey] && narrativeState[prevStepKey].length > 0) || !isPredefined;
                                                    
                                                    if (!isVisible) return null;

                                                    const selectedInStep = narrativeState[step.key] || [];
                                                    const allFilteredOptions = getOptionsForStep(step.key, step.options);
                                                    const searchVal = stepSearch[step.key] || "";
                                                    
                                                    const activeSelected = selectedInStep.filter(opt => opt !== "Flexible");
                                                    const nonSelected = allFilteredOptions.filter(opt => !activeSelected.includes(opt));
                                                    
                                                    const optionsToShow = searchVal 
                                                        ? allFilteredOptions.filter(opt => opt.toLowerCase().includes(searchVal.toLowerCase()))
                                                        : [...activeSelected, ...nonSelected.slice(0, Math.max(0, 8 - activeSelected.length))]
                                                            .sort((a, b) => a.localeCompare(b, 'he', { sensitivity: 'base', numeric: true }));

                                                    return (
                                                        <div key={step.key} ref={el => { stepRefs.current[step.key] = el; }} className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500 group/step relative scroll-mt-24">
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-gray-400 font-bold hover:text-white transition-colors cursor-help">{step.label}</h4>
                                                                    <span className="text-[10px] font-normal text-cyan-400/70 opacity-0 group-hover/step:opacity-100 transition-opacity duration-300">
                                                                        (לא יודע? לחץ על "לא מעניין אותי (דלג)")
                                                                    </span>
                                                                    {!isPredefined && (
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => {
                                                                                setDynamicSteps(prev => prev.filter(s => s.key !== step.key));
                                                                                setNarrativeState(prev => {
                                                                                    const next = { ...prev };
                                                                                    delete next[step.key];
                                                                                    return next;
                                                                                });
                                                                            }}
                                                                            className="text-[10px] text-red-500 hover:text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/20 bg-red-500/5 transition-colors"
                                                                        >
                                                                            הסר שדה
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {step.hasModifiers && (
                                                                    <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-1 border border-gray-800">
                                                                        {["לפחות", "בדיוק", "עד"].map(mod => (
                                                                            <button 
                                                                                key={mod}
                                                                                type="button"
                                                                                onClick={() => setStepModifiers(prev => ({...prev, [step.key]: mod}))}
                                                                                className={`text-xs px-3 py-1 rounded-md transition-all font-medium ${
                                                                                    stepModifiers[step.key] === mod || (!stepModifiers[step.key] && mod === "בדיוק")
                                                                                    ? "bg-cyan-950 text-cyan-400 border border-cyan-500/30" 
                                                                                    : "text-gray-500 hover:text-gray-300"
                                                                                }`}
                                                                            >
                                                                                {mod}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                {allFilteredOptions.length > 8 && (
                                                                    <div className="w-full mb-1">
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder={`🔍 חפש/סנן ${step.label.replace('?', '')}...`}
                                                                            value={stepSearch[step.key] || ""}
                                                                            onChange={e => setStepSearch(prev => ({...prev, [step.key]: e.target.value}))}
                                                                            className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-cyan-400 w-full max-w-xs placeholder:text-gray-600 text-white transition-all focus:shadow-[0_0_8px_#22d3ee]"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {optionsToShow.map(opt => {
                                                                    const isSelected = selectedInStep.includes(opt);
                                                                    return (
                                                                        <button
                                                                            key={opt}
                                                                            type="button"
                                                                            onClick={() => toggleWizardOption(step.key, opt)}
                                                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                                                                isSelected 
                                                                                ? "bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-[0_0_12px_#22d3ee] scale-105" 
                                                                                : "bg-[#0a0a0a] border-gray-800 text-gray-400 hover:border-gray-600 hover:bg-[#111]"
                                                                            }`}
                                                                        >
                                                                            {opt}
                                                                        </button>
                                                                    );
                                                                })}

                                                                {activeCustomInput === step.key ? (
                                                                    <div className="flex items-center gap-2 border border-cyan-500/50 rounded-xl p-1 bg-black animate-in fade-in duration-200">
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="ערך מותאם..." 
                                                                            value={customInputValue}
                                                                            onChange={e => setCustomInputValue(e.target.value)}
                                                                            list={`datalist-radar-${step.key}`}
                                                                            className="bg-transparent text-white text-sm px-2 py-1 outline-none w-48 focus:ring-0 text-right"
                                                                            dir="rtl"
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    handleAddCustomValue(step.key);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <datalist id={`datalist-radar-${step.key}`}>
                                                                            {allFilteredOptions.filter(opt => !optionsToShow.includes(opt)).map(opt => (
                                                                                <option key={opt} value={opt} />
                                                                            ))}
                                                                        </datalist>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleAddCustomValue(step.key)}
                                                                            className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-2 py-1 rounded-lg"
                                                                        >
                                                                            הוסף
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => { setActiveCustomInput(null); setCustomInputValue(""); }}
                                                                            className="text-gray-500 hover:text-white px-1"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setActiveCustomInput(step.key); setCustomInputValue(""); }}
                                                                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-400 border border-dashed border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all"
                                                                    >
                                                                        + אחר
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleWizardOption(step.key, "Flexible")}
                                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                                                        selectedInStep.includes("Flexible")
                                                                        ? "bg-purple-900/40 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.6)] scale-105" 
                                                                        : "bg-[#0a0a0a] border-gray-800 text-gray-500 hover:border-gray-600 hover:bg-[#111]"
                                                                    }`}
                                                                >
                                                                    לא מעניין אותי (דלג)
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Additional Fields Selector Dropdown */}
                                                {getAvailableAdditionalFields().length > 0 && (
                                                    <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between gap-4 flex-wrap">
                                                        <div className="text-right">
                                                            <h4 className="text-white font-bold text-sm">הוסף סינון חומרה/מפרט נוסף</h4>
                                                            <p className="text-xs text-gray-500 mt-0.5">בחר שדה מתוך מאגר המפרטים הקיים במערכת</p>
                                                        </div>
                                                        <select
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    handleAddDynamicStep(e.target.value);
                                                                    e.target.value = "";
                                                                }
                                                            }}
                                                            className="bg-[#0a0a0a] border border-cyan-500/30 text-cyan-400 text-sm rounded-xl px-4 py-2 outline-none focus:border-cyan-400 cursor-pointer"
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>+ הוסף שדה סינון...</option>
                                                            {getAvailableAdditionalFields().map(f => (
                                                                <option key={f.fieldId} value={f.fieldId}>
                                                                    {f.labelHera || f.fieldId}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 3: Range Slider */}
                                    {!hideWizard && (
                                        <div ref={budgetRef} className="space-y-6 bg-[#0a0a0a] p-6 rounded-3xl border border-gray-800/80 shadow-[0_0_20px_rgba(0,0,0,0.4)] scroll-mt-24">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-cyan-400">
                                                        <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#0a0a0a]">3</div>
                                                        <h3 className="font-bold text-lg text-white">תקציב רצוי</h3>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setBudgetFlexible(!budgetFlexible); setBudgetTouched(true); }}
                                                        className={`text-sm px-3 py-1 rounded-full border transition-all ${
                                                            budgetFlexible 
                                                            ? "bg-purple-900/40 border-purple-500/50 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                                                            : "bg-[#0a0a0a] border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600"
                                                        }`}
                                                    >
                                                        גמיש בתקציב
                                                    </button>
                                                </div>
                                                <div className={`font-mono text-xl font-bold transition-opacity ${budgetFlexible ? 'opacity-30' : 'text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]'}`}>
                                                    {budgetFlexible ? "ללא הגבלה" : `₪${budgetRange[0].toLocaleString()} - ₪${budgetRange[1].toLocaleString()}`}
                                                </div>
                                            </div>
                                            
                                            <div className={`pt-4 pb-2 px-2 transition-opacity ${budgetFlexible ? 'opacity-30 pointer-events-none' : 'opacity-100'}`} dir="rtl">
                                                <Slider
                                                    defaultValue={[2000, 4500]}
                                                    min={0}
                                                    max={15000}
                                                    step={100}
                                                    value={budgetRange}
                                                    onValueChange={(val) => {
                                                        setBudgetRange(val as [number, number]);
                                                        setBudgetTouched(true);
                                                        setBudgetFlexible(false);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Notes & Details */}
                                    {!hideWizard && (
                                        <div className="space-y-4 bg-[#0a0a0a] p-6 rounded-3xl border border-gray-800/80 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                                <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#0a0a0a]">4</div>
                                                <h3 className="font-bold text-lg text-white">הערות ותוספות (לא חובה)</h3>
                                            </div>
                                            <Textarea 
                                                placeholder="דרישות חופשיות נוספות? פגמים שאתה מוכן לקבל? ציין כאן..." 
                                                value={details} 
                                                onChange={e => setDetails(e.target.value)}
                                                className="bg-[#050505] border-gray-800 min-h-[80px] focus:ring-0 focus:border-cyan-400 focus:shadow-[0_0_15px_#22d3ee] rounded-2xl resize-none placeholder:text-gray-600 transition-shadow text-white p-4"
                                            />
                                        </div>
                                    )}

                                    {/* Step 5: Location */}
                                    <div className="space-y-4 bg-[#0a0a0a] p-6 rounded-3xl border border-gray-800/80 shadow-[0_0_20px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                                            <label className="text-base font-bold text-gray-200 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#0a0a0a]">5</div>
                                                <h3 className="font-bold text-lg text-white">רדיוס ומיקום חיפוש</h3>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-cyan-400 bg-cyan-950/60 border border-cyan-800/30 px-2.5 py-1 rounded-md text-sm font-bold">
                                                    {radius[0] === 105 ? "כל הארץ" : `עד ${radius[0]} ק"מ`}
                                                </span>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowMap(true)} disabled={!lat && !lng} className="h-7 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 px-2 gap-1 rounded-md transition-all">
                                                    <MapIcon className="w-3.5 h-3.5"/> הצג מפה
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="bg-[#050505] p-4 rounded-2xl border border-gray-800">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-gray-400 text-sm">מרכז סריקת רדאר:</span>
                                                <div className="flex gap-3">
                                                    {locationMode === 'HOME' && (
                                                        <button type="button" onClick={getDeviceLocation} className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
                                                            <LocateFixed className="w-3 h-3"/> חזור ל-GPS
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => setShowCityDialog(true)} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                                                        <MapPin className="w-3 h-3"/> בחר עיר אחרת
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${locationMode === 'LIVE' || !locationMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {gettingLocation ? <Loader2 className="w-5 h-5 animate-spin"/> : locationMode === 'LIVE' || !locationMode ? <LocateFixed className="w-5 h-5"/> : <MapPin className="w-5 h-5"/>}
                                                </div>
                                                <span className="text-xl font-bold text-white">
                                                    {gettingLocation ? "מאתר מיקום..." : (locationName || "לא אותר מיקום")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Slider
                                                defaultValue={[25]}
                                                min={5}
                                                max={105}
                                                step={5}
                                                value={radius}
                                                onValueChange={(val) => {
                                                    if (!lat && !lng) {
                                                        toast.error("יש לבחור מיקום תחילה");
                                                        return;
                                                    }
                                                    setRadius(val);
                                                }}
                                                disabled={!lat && !lng}
                                            />
                                            <div className="w-full flex justify-between mt-2 px-1">
                                                <span className="text-[10px] text-gray-500">5 ק"מ</span>
                                                <span className="text-[11px] text-cyan-400 font-bold tracking-wide">105 (כל הארץ)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Left Column: Sticky Query Preview, Advisor & Submit buttons */}
                        {category && (
                            <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                {/* Active Radars Trigger Card */}
                                {requests.length > 0 && (
                                    <div 
                                        onClick={() => setShowActiveRadarsDialog(true)}
                                        className="group cursor-pointer bg-gradient-to-r from-cyan-950/20 to-blue-950/20 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-950 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                                                <Radar className="w-5 h-5 text-cyan-400 animate-pulse" />
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-sm text-white">סוכני רדאר פעילים באוויר</div>
                                                <div className="text-xs text-cyan-400/80">יש לך {requests.length} סוכנים פעילים</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                                            צפייה וניהול ←
                                        </div>
                                    </div>
                                )}

                                {/* Form Actions Card */}
                                <div className="bg-[#0a0a0a] border border-cyan-500/20 rounded-3xl p-6 shadow-[0_0_20px_rgba(34,211,238,0.05)] relative overflow-hidden">
                                    {isScanning && (
                                        <div className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-sm flex flex-col items-center justify-center border border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-in fade-in duration-300">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full border border-cyan-400/20 border-t-cyan-400 animate-spin" />
                                                <Radar className="w-10 h-10 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse drop-shadow-[0_0_10px_#22d3ee]" />
                                                <div className="absolute inset-0 rounded-full shadow-[0_0_30px_#22d3ee] animate-ping opacity-20" />
                                            </div>
                                            <h3 className="text-lg font-black text-cyan-400 mt-6 tracking-widest drop-shadow-[0_0_8px_#22d3ee]">מפעיל ראדאר...</h3>
                                        </div>
                                    )}

                                    <h3 className="font-bold text-lg text-white mb-4 border-b border-gray-800 pb-2">מפרט סוכן הרדאר</h3>
                                    
                                    {/* Live Editable Textarea Preview */}
                                    <div className="relative mb-4">
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-xl pointer-events-none z-10" />
                                        <Textarea 
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            placeholder="בחר מאפיינים להרכבת ההצהרה או הקלד חופשי כאן..."
                                            className="w-full min-h-[140px] bg-[#050505] border border-gray-800/80 p-4 pr-5 rounded-2xl shadow-[inset_0_0_15px_rgba(0,0,0,0.4)] text-base leading-relaxed text-cyan-50 font-medium focus:ring-0 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.1)] transition-shadow resize-none"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-4 leading-normal">
                                        הטקסט למעלה הוא השאילתה שהסוכן יחפש עבורך ברשת. ניתן להקליד ולתקן אותו באופן חופשי.
                                    </p>

                                    {/* AI Advice Block */}
                                    {aiAdvice && (
                                        <div className="mb-4 bg-cyan-950/20 border border-cyan-800/30 rounded-2xl p-4 text-xs text-cyan-300 leading-relaxed text-right animate-in fade-in duration-300">
                                            {aiAdvice.message}
                                        </div>
                                    )}

                                    {/* CTAs */}
                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            disabled={submitting || !category}
                                            className="w-full py-4 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-base transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-xl"
                                        >
                                            {submitting ? (
                                                <span className="flex items-center gap-2 justify-center"><Loader2 className="w-5 h-5 animate-spin text-black" /> מפעיל ראדאר...</span>
                                            ) : editId ? (
                                                "עדכן סוכן חיפוש ✓"
                                            ) : (
                                                "הפעל סוכן ראדאר 📡"
                                            )}
                                        </Button>
                                        {(editId || category || query.trim()) && (
                                            <Button
                                                type="button"
                                                onClick={resetForm}
                                                variant="outline"
                                                className="w-full h-11 border-gray-800 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm"
                                            >
                                                ביטול ואיפוס הטופס
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {showMap && lat && lng && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" dir="ltr">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl h-[80vh] sm:h-[70vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4" dir="rtl">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-cyan-400"/> תצוגת מפה ורדיוס
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowMap(false)} className="text-gray-400 hover:text-white hover:bg-gray-800">
                                <X className="w-5 h-5"/>
                            </Button>
                        </div>
                        <div className="flex-1 relative bg-gray-800">
                            <LocationMap lat={lat} lng={lng} radiusKm={radius[0]} />
                        </div>
                    </div>
                </div>
            )}

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

            <Dialog open={showActiveRadarsDialog} onOpenChange={setShowActiveRadarsDialog}>
                <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-xl max-h-[85vh] overflow-y-auto p-6" dir="rtl">
                    <DialogTitle className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-800 pb-3 text-cyan-400">
                        <Radar className="w-5 h-5 text-cyan-400 animate-pulse"/> סוכני רדאר פעילים באוויר ({requests.length})
                    </DialogTitle>
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center p-8 bg-[#0a0a0a] rounded-2xl border border-gray-800">
                            <p className="text-gray-500 text-sm">אין לך סוכני רדאר פעילים כרגע.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            {requests.map(req => (
                                <BuyerRequestCard 
                                    key={req.id} 
                                    request={req} 
                                    onEdit={(r) => {
                                        handleEdit(r);
                                        setShowActiveRadarsDialog(false);
                                    }}
                                    onDelete={handleDelete}
                                    onClick={() => setDetailRequest(req)}
                                />
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {detailRequest && (
                <RadarDetailModal
                    key={detailRequest?.id}
                    request={detailRequest}
                    onClose={() => setDetailRequest(null)}
                    onDelete={handleDelete}
                    onUpdate={handleUpdateRequest}
                    isDeleting={isDeletingReq}
                />
            )}

        </main>
    );
}

export default function MyRequestsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>}>
            <MyRequestsContent />
        </Suspense>
    );
}
