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

function MyRequestsContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("query") || "";

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
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
        try {
            const res = await fetch(`/api/marketplace/request/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("הסוכן כובה בהצלחה");
                fetchRequests();
            } else toast.error("שגיאה בכיבוי הסוכן");
        } catch (error) {
            toast.error("שגיאה בכיבוי הסוכן");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Narrative Engine Logic
    const generateStory = (state: Record<string, string[]>, cat: string, budget: [number, number], notes: string, mods: Record<string, string>, bTouched: boolean, bFlex: boolean) => {
        if (!cat) return "";
        const singularName = CATEGORY_SINGULAR[cat] || cat;
        let story = `מחפש לקנות ${singularName}`;
        
        const config = WIZARD_CONFIG[cat] || WIZARD_CONFIG["כללי"];
        config.forEach(step => {
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
        if (Object.keys(narrativeState).length > 0 || category || budgetTouched) {
            setQuery(generateStory(narrativeState, category, budgetRange, details, stepModifiers, budgetTouched, budgetFlexible));
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
        
    }, [narrativeState, category, budgetRange, details, stepModifiers, budgetTouched, budgetFlexible]);

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
                            radius: radius[0]
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
                        <Link href="/dashboard/marketplace" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4 transition-colors font-semibold">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            חזרה למרקטפלייס
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            <Radar className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 animate-pulse" /> סוכן ראדאר
                        </h1>
                        <p className="text-gray-400 max-w-2xl text-lg">
                            תגיד לראדאר מה אתה מחפש, והוא יסרוק עבורך את הרשת 24/7. התראה תשלח אליך ברגע שתתגלה התאמה מושלמת.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-6">
                        {showForm ? (
                            <div className="bg-[#0a0a0a] border border-cyan-400 rounded-3xl p-6 md:p-8 shadow-[0_0_20px_rgba(34,211,238,0.15)] relative overflow-hidden transition-all duration-500">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none" />
                                
                                {isScanning ? (
                                    <div className="absolute inset-0 z-50 bg-[#050505]/90 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl border border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-in fade-in duration-300">
                                        <div className="relative">
                                            <div className="w-32 h-32 rounded-full border border-cyan-400/20 border-t-cyan-400 animate-spin" />
                                            <Radar className="w-14 h-14 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse drop-shadow-[0_0_10px_#22d3ee]" />
                                            <div className="absolute inset-0 rounded-full shadow-[0_0_30px_#22d3ee] animate-ping opacity-30" />
                                        </div>
                                        <h3 className="text-2xl font-black text-cyan-400 mt-8 tracking-widest drop-shadow-[0_0_8px_#22d3ee]">מפעיל ראדאר...</h3>
                                    </div>
                                ) : null}

                                <form onSubmit={handleSubmit} className="relative z-10 space-y-8" dir="rtl">
                                    
                                    {/* Step 1: Category */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-cyan-400 mb-2">
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
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Step 2: Narrative Builder Wizard */}
                                    <div className={`space-y-8 transition-all duration-700 ease-out origin-top ${category ? "opacity-100 scale-y-100 h-auto" : "opacity-0 scale-y-0 h-0 overflow-hidden"}`}>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between gap-2 mb-2 border-b border-gray-800 pb-2">
                                                <div className="flex items-center gap-2 text-cyan-400">
                                                    <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#050505]">2</div>
                                                    <h3 className="font-bold text-lg text-white">מפרט סוכן רדאר (ניתן גם לערוך ידנית)</h3>
                                                </div>
                                                <button type="button" onClick={() => { setNarrativeState({}); setStepModifiers({}); setDetails(""); setBudgetTouched(false); setBudgetFlexible(false); setBudgetRange([2000,4500]); setQuery(generateStory({}, category, [2000,4500], "", {}, false, false)); }} className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm">
                                                    <RefreshCw className="w-4 h-4" /> איפוס בחירות
                                                </button>
                                            </div>
                                            
                                            {/* Live Editable Story Box */}
                                            <div className="relative">
                                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-r-2xl pointer-events-none z-10" />
                                                <Textarea 
                                                    value={query}
                                                    onChange={e => setQuery(e.target.value)}
                                                    placeholder="בחר מאפיינים להרכבת ההצהרה או הקלד חופשי..."
                                                    className="w-full min-h-[100px] bg-[#050505] border border-cyan-500/30 p-5 pr-6 rounded-2xl shadow-[inset_0_0_20px_rgba(34,211,238,0.05)] text-xl leading-relaxed text-cyan-50 font-medium focus:ring-0 focus:border-cyan-400 focus:shadow-[0_0_15px_#22d3ee] transition-shadow resize-none"
                                                />
                                            </div>

                                            {/* Wizard Options Flow */}
                                            <div className="space-y-8 pl-2 border-r-2 border-gray-800 pr-4">
                                                {currentConfig.map((step, index) => {
                                                    // Progressive Display: Only show if previous step has selections (or is the first step)
                                                    const prevStepKey = index > 0 ? currentConfig[index - 1].key : null;
                                                    const isVisible = !prevStepKey || (narrativeState[prevStepKey] && narrativeState[prevStepKey].length > 0);
                                                    
                                                    if (!isVisible) return null;

                                                    const selectedInStep = narrativeState[step.key] || [];

                                                    return (
                                                        <div key={step.key} className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <h4 className="text-gray-400 font-bold">{step.label}</h4>
                                                                {step.hasModifiers && (
                                                                    <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-1 border border-gray-800">
                                                                        {["לפחות", "בדיוק", "עד"].map(mod => (
                                                                            <button 
                                                                                key={mod}
                                                                                type="button"
                                                                                onClick={() => setStepModifiers(prev => ({...prev, [step.key]: mod}))}
                                                                                className={`text-xs px-3 py-1 rounded-md transition-all font-medium ${
                                                                                    stepModifiers[step.key] === mod || (!stepModifiers[step.key] && mod === "בדיוק")
                                                                                    ? "bg-cyan-900/40 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.2)]" 
                                                                                    : "text-gray-500 hover:text-gray-300"
                                                                                }`}
                                                                            >
                                                                                {mod}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {step.options.map(opt => {
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
                                                                    )
                                                                })}
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
                                                    )
                                                })}
                                            </div>
                                            
                                            {/* AI Advisor Popup */}
                                            {aiAdvice && (
                                                <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                                                    aiAdvice.type === 'warning' 
                                                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' 
                                                    : 'bg-blue-950/30 border-blue-500/50 text-blue-200'
                                                }`}>
                                                    <Radar className={`w-6 h-6 shrink-0 mt-0.5 ${aiAdvice.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                                                    <p className="text-sm font-medium leading-relaxed">{aiAdvice.message}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Step 3: Range Slider */}
                                        <div className="space-y-6 bg-[#050505] p-6 rounded-2xl border border-gray-800">
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
                                                            ? "bg-purple-900/40 border-purple-400 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
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

                                        {/* Step 4: Notes & Details */}
                                        <div className="space-y-4 bg-[#050505] p-6 rounded-2xl border border-gray-800">
                                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                                <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#0a0a0a]">4</div>
                                                <h3 className="font-bold text-lg text-white">הערות ותוספות (לא חובה)</h3>
                                            </div>
                                            <Textarea 
                                                placeholder="דרישות חופשיות נוספות? פגמים שאתה מוכן לקבל? ציין כאן..." 
                                                value={details} 
                                                onChange={e => setDetails(e.target.value)}
                                                className="bg-[#0a0a0a] border-gray-800 min-h-[80px] focus:ring-0 focus:border-cyan-400 focus:shadow-[0_0_15px_#22d3ee] rounded-2xl resize-none placeholder:text-gray-600 transition-shadow text-white p-4"
                                            />
                                        </div>

                                        {/* Step 5: Location */}
                                        <div className="space-y-4 bg-[#050505] p-6 rounded-2xl border border-gray-800">
                                            <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                                <div className="w-6 h-6 rounded-full border border-cyan-400 shadow-[0_0_8px_#22d3ee] flex items-center justify-center font-bold text-xs bg-[#0a0a0a]">5</div>
                                                <h3 className="font-bold text-lg text-white">המיקום שלי</h3>
                                            </div>
                                            <p className="text-gray-500 text-xs px-8 mb-3">זה המיקום שלך אליו המוכר יצטרך להגיע או למסור את המוצר.</p>
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

                                            <div className="mt-4 border-t border-gray-700/50 pt-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="text-sm text-gray-300 font-bold">עד איזה מרחק תהיה מוכן לנסוע לאיסוף?</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-cyan-400 font-bold bg-cyan-950 px-3 py-1 rounded text-sm">{radius[0]} ק"מ</span>
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => setShowMap(true)} 
                                                            disabled={!lat || !lng} 
                                                            className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 px-2 gap-1 rounded-md transition-all border border-blue-500/20"
                                                        >
                                                            <MapIcon className="w-3.5 h-3.5"/> הצג במפה
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Slider 
                                                    defaultValue={[25]} 
                                                    max={100} 
                                                    min={5} 
                                                    step={1} 
                                                    onValueChange={(v) => setRadius(v)} 
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="pt-6 flex justify-between items-center border-t border-gray-800">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                onClick={resetForm}
                                                className="text-gray-500 hover:text-white"
                                            >
                                                ביטול
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={submitting || !category || query.length < 5}
                                                className="group relative h-14 px-10 bg-black border border-cyan-400 text-cyan-400 hover:bg-cyan-950 text-xl font-black rounded-2xl shadow-[0_0_15px_#22d3ee] hover:shadow-[0_0_25px_#22d3ee] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                                            >
                                                <div className="absolute inset-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.2),transparent)] -translate-x-[150%] group-hover:translate-x-[150%] duration-1000 ease-in-out" />
                                                <span className="flex items-center gap-3 drop-shadow-[0_0_5px_#22d3ee]">
                                                    <Radar className="w-5 h-5 group-hover:animate-spin-slow" />
                                                    {editId ? "עדכן רדאר" : "הפעל רדאר חיפוש 📡"}
                                                </span>
                                            </Button>
                                        </div>

                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 text-center hover:bg-[#111] hover:border-cyan-400/50 transition-all cursor-pointer group shadow-lg" onClick={() => setShowForm(true)}>
                                <div className="bg-[#050505] border border-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 group-hover:text-cyan-400 group-hover:border-cyan-400 group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_20px_#22d3ee]">
                                    <Radar className="w-12 h-12 group-hover:animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black mb-3 text-white group-hover:text-cyan-400 transition-colors drop-shadow-md">צור סוכן רדאר חדש</h3>
                                <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
                                    במקום לחפש שוב ושוב - תן לסוכן שלנו לסרוק את הרשת 24/7 ולהתריע לך כשהמוצר שרצית עולה למרקט.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Existing Requests List */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 h-full">
                            <h2 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6 flex items-center gap-2 text-white">
                                <Activity className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]" />
                                רדארים פעילים באוויר
                            </h2>
                            
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center p-8 bg-[#050505] rounded-2xl border border-gray-800">
                                    <div className="w-12 h-12 rounded-full bg-gray-900 mx-auto flex items-center justify-center mb-4 border border-gray-800">
                                        <Search className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <p className="text-gray-500 text-sm">אין לך סוכני רדאר פעילים כרגע.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <BuyerRequestCard 
                                            key={req.id} 
                                            request={req} 
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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
