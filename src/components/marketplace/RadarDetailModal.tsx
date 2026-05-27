"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    Loader2, Pencil, Trash2, Share2, CheckCircle2, Calendar, Zap, X, Radar, ShoppingBag, ArrowLeft
} from "lucide-react";

export interface RadarDetailModalProps {
    request: any;
    onClose: () => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, query: string, extraData?: any) => Promise<void>;
    isDeleting: string | null;
}

// Human-readable Hebrew labels for known keys
const RADAR_FIELD_LABELS: Record<string, string> = {
    category:      "קטגוריה",
    brand:         "יצרן",
    model:         "דגם",
    ram:           "זיכרון RAM",
    storage:       "נפח אחסון",
    processor:     "מעבד (CPU)",
    gpu:           "כרטיס מסך (GPU)",
    screen:        "גודל מסך",
    display:       "מפרט מסך",
    budgetRange:   "טווח מחיר",
    city:          "עיר / מיקום",
    radius:        "רדיוס חיפוש",
    details:       "הערות / פרטים נוספים",
};

const VIEWABLE_RADAR_FIELDS = [
    { key: "category", label: "קטגוריה" },
    { key: "brand", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "ram", label: "זיכרון RAM" },
    { key: "storage", label: "נפח אחסון" },
    { key: "processor", label: "מעבד (CPU)" },
    { key: "gpu", label: "כרטיס מסך (GPU)" },
    { key: "screen", label: "גודל מסך" },
    { key: "display", label: "מפרט מסך" },
    { key: "budgetRange", label: "טווח מחיר" },
    { key: "city", label: "עיר / מיקום" },
    { key: "radius", label: "רדיוס חיפוש" },
    { key: "details", label: "הערות נוספות" }
];

function formatRadarValue(key: string, value: any, extraData: any): string {
    if (value === "Flexible" || value === "flexible" || value === "Flexible (any)" || value === "Flexible (Any)") {
        return "גמיש";
    }
    if (key === "budgetRange") {
        let arr = value;
        if (typeof value === "string") {
            try { arr = JSON.parse(value); } catch { arr = value.split(",").map(Number); }
        }
        if (Array.isArray(arr) && arr.length >= 2) {
            const min = Number(arr[0]);
            const max = Number(arr[1]);
            if (min === 0 || isNaN(min)) {
                return `עד ₪${max.toLocaleString()}`;
            }
            return `מ-₪${min.toLocaleString()} עד ₪${max.toLocaleString()}`;
        }
        if (extraData.budget) {
            return `עד ₪${Number(extraData.budget).toLocaleString()}`;
        }
        return "לא צוין";
    }
    if (key === "radius") {
        return value && value > 0 ? `${value} ק״מ` : "ללא הגבלה";
    }
    if (key === "category") {
        if (!value || value === "General" || value === "GENERAL") return "כללי";
        if (value === "LAPTOPS" || value === "laptops") return "מחשבים ניידים";
        if (value === "SMARTPHONES" || value === "smartphones" || value === "MOBILE" || value === "PHONE") return "טלפונים סלולריים";
        return String(value);
    }
    return String(value);
}

function parseBudgetFromText(text: string): { budgetRange?: [number, number]; budget?: number } | null {
    // Clean string by removing commas
    const cleanText = text.replace(/,/g, "");

    // 1. Range matching pattern: e.g. "בין 2000 ל 3000 שח", "3000 - 4000 ₪"
    const rangeRegex = /(?:בין\s+)?(?:₪|ש"ח|שח)?\s*(\d{3,6})\s*(?:₪|ש"ח|שח|שקלים)?\s*(?:עד|ל-|ל\s+|-)\s*(?:₪|ש"ח|שח)?\s*(\d{3,6})\s*(?:₪|ש"ח|שח|שקלים)?/i;
    const rangeMatch = cleanText.match(rangeRegex);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10);
        const max = parseInt(rangeMatch[2], 10);
        if (!isNaN(min) && !isNaN(max) && min < max) {
            return { budgetRange: [min, max], budget: max };
        }
    }

    // 2. Single budget matching pattern (with prefix): e.g. "עד 3000 שח", "תקציב: 4000", "מחיר 2500 שקלים"
    const singleRegex = /(?:עד|תקציב|מחיר|ב-|ב\s+)\s*(?:₪|ש"ח|שח)?\s*(\d{3,6})\s*(?:₪|ש"ח|שח|שקלים)?/i;
    const singleMatch = cleanText.match(singleRegex);
    if (singleMatch) {
        const val = parseInt(singleMatch[1], 10);
        if (!isNaN(val)) {
            return { budgetRange: [0, val], budget: val };
        }
    }

    // 3. Suffix matching pattern: e.g. "3000 שח", "4000₪"
    const suffixRegex = /(\d{3,6})\s*(?:₪|ש"ח|שח|שקלים)\b/i;
    const suffixMatch = cleanText.match(suffixRegex);
    if (suffixMatch) {
        const val = parseInt(suffixMatch[1], 10);
        if (!isNaN(val)) {
            return { budgetRange: [0, val], budget: val };
        }
    }

    // 4. Context validation fallback
    const numbers = [...cleanText.matchAll(/\b(\d{3,6})\b/g)];
    for (const match of numbers) {
        const val = parseInt(match[1], 10);
        const idx = match.index ?? 0;
        const windowStart = Math.max(0, idx - 20);
        const windowEnd = Math.min(cleanText.length, idx + match[0].length + 20);
        const surrounding = cleanText.substring(windowStart, windowEnd);
        
        // Verify it is not part of storage (e.g. 512GB) or RAM
        const isSpec = /gb|tb|gig|גיגה|ג'יגה|ראם|ram/i.test(surrounding.substring(idx - windowStart, windowEnd - windowStart + 10));
        if (!isSpec && /(?:תקציב|מחיר|₪|ש"ח|שח|שקלים|מחפש|קונה)/i.test(surrounding)) {
            return { budgetRange: [0, val], budget: val };
        }
    }

    return null;
}

function parseFieldsFromText(text: string): Record<string, any> {
    const fields: Record<string, any> = {};
    const cleanText = text.replace(/,/g, "");

    // 1. Category
    if (/מחשב נייד|לפטופ|laptop/i.test(cleanText)) {
        fields.category = "מחשבים ניידים";
    } else if (/מחשב נייח|שולחני|desktop|AIO|all-in-one|all in one/i.test(cleanText)) {
        fields.category = "מחשבים שולחניים";
    } else if (/סמארטפון|טלפון סלולרי|טלפון|נייד|smartphone|phone|אייפון|iphone/i.test(cleanText)) {
        if (!/מחשב נייד/i.test(cleanText)) {
            fields.category = "טלפונים סלולריים";
        }
    }

    // 2. Brand
    const brandsMap: Record<string, string> = {
        apple: "Apple", "אפל": "Apple", iphone: "Apple", "אייפון": "Apple", macbook: "Apple", "מקבוק": "Apple",
        dell: "Dell", "דל": "Dell",
        lenovo: "Lenovo", "לנובו": "Lenovo", thinkpad: "Lenovo",
        asus: "Asus", "אסוס": "Asus", rog: "Asus", zenbook: "Asus",
        hp: "HP", "אייץ פי": "HP",
        acer: "Acer", "אייסר": "Acer",
        samsung: "Samsung", "סמסונג": "Samsung", galaxy: "Samsung", "גלקסי": "Samsung",
        xiaomi: "Xiaomi", "שיאומי": "Xiaomi", redmi: "Xiaomi",
        google: "Google", "גוגל": "Google", pixel: "Google", "פיקסל": "Google",
    };
    for (const [key, val] of Object.entries(brandsMap)) {
        const isHebrew = /[א-ת]/.test(key);
        const match = isHebrew 
            ? new RegExp(`(?:^|\\s|\\b)${key}(?:$|\\s|\\b)`, 'i').test(cleanText)
            : new RegExp(`\\b${key}\\b`, 'i').test(cleanText);
        
        if (match) {
            fields.brand = val;
            break;
        }
    }

    // Model extraction
    const modelMatch = cleanText.match(/(?:דגם|דגם\s+של)\s+([a-zA-Z0-9\s\-]+)(?:עם|ב-|ב\s+|,|\.|$)/i);
    if (modelMatch) {
        fields.model = modelMatch[1].trim();
    }

    // 3. RAM
    const ramRegex = /\b(\d+)\s*(?:gb|gig|גיגה|ג'יגה|גב|ram)\b/i;
    const ramMatch = cleanText.match(ramRegex);
    if (ramMatch) {
        fields.ram = `${ramMatch[1]}GB`;
    }

    // 4. Storage
    const storageRegex = /\b(\d+)\s*(?:gb|tb|gig|גיגה|ג'יגה|טרה|טרא)\s*(?:ssd|hdd|אחסון|דיסק|כונן)?\b/i;
    const tbRegex = /\b(\d+)\s*(?:tb|טרה|טרא)\b/i;
    const tbMatch = cleanText.match(tbRegex);
    if (tbMatch) {
        fields.storage = `${tbMatch[1]}TB`;
    } else {
        const matches = [...cleanText.matchAll(new RegExp(storageRegex, 'gi'))];
        for (const m of matches) {
            const num = parseInt(m[1], 10);
            const hasStorageKeyword = /ssd|hdd|אחסון|דיסק|כונן/i.test(m[0]);
            if (num >= 128 || hasStorageKeyword) {
                fields.storage = `${num}GB`;
                if (/ssd/i.test(m[0])) fields.storage += " SSD";
                break;
            }
        }
    }

    // 5. CPU / Processor
    const cpuPatterns = [
        { regex: /core\s*i([3579])\b/i, label: (m: string[]) => `Intel i${m[1]}` },
        { regex: /\bi([3579])-?\d*\b/i, label: (m: string[]) => `Intel i${m[1]}` },
        { regex: /ryzen\s*([3579])\b/i, label: (m: string[]) => `AMD Ryzen ${m[1]}` },
        { regex: /\b(m[1234])\s*(pro|max|ultra)?\b/i, label: (m: string[]) => `Apple ${m[1].toUpperCase()}${m[2] ? ' ' + m[2].charAt(0).toUpperCase() + m[2].slice(1) : ''}` }
    ];
    for (const pat of cpuPatterns) {
        const m = cleanText.match(pat.regex);
        if (m) {
            fields.processor = pat.label(m);
            break;
        }
    }

    // 6. GPU
    const gpuRegex = /\b(rtx\s*\d{4}(?:\s*ti)?|gtx\s*\d{3,4}|radeon|מובנה|intel iris)\b/i;
    const gpuMatch = cleanText.match(gpuRegex);
    if (gpuMatch) {
        fields.gpu = gpuMatch[1].toUpperCase();
    }

    // 7. Screen Size
    const screenRegex = /(\d+(?:\.\d+)?)\s*(?:אינץ'|אינצ'|אינטש|אינטצ'|"|''|inch)/i;
    const screenMatch = cleanText.match(screenRegex);
    if (screenMatch) {
        fields.screen = `${screenMatch[1]} אינץ'`;
    }

    // 7b. Display spec (OLED, IPS, Hz, resolution, etc.)
    const displayRegex = /(?:מסך\s+)?([a-zA-Z0-9\.\-%]+(?:\s+[a-zA-Z0-9\.\-%]+){0,5}\s*(?:oled|ips|hz|dci-p3|retina|amoled|fhd|qhd|4k|2\.8k|120hz|144hz|60hz|90hz|240hz)\b[a-zA-Z0-9\.\-%\s]*)/i;
    const displayMatch = cleanText.match(displayRegex);
    if (displayMatch) {
        fields.display = displayMatch[1].trim();
    }

    // 8. City
    const cityKeywords = ['תל אביב', 'ראשון לציון', 'ירושלים', 'חיפה', 'פתח תקווה', 'נתניה', 'חולון', 'בני ברק', 'רמת גן', 'אשדוד', 'באר שבע', 'הרצליה', 'כפר סבא', 'רעננה', 'מודיעין', 'רחובות', 'בת ים', 'גבעתיים', 'הוד השרון', 'יהוד', 'קריית אונו', 'אשקלון', 'חדרה'];
    let foundCity = "";
    for (const city of cityKeywords) {
        if (new RegExp(city, 'i').test(cleanText)) {
            foundCity = city;
            break;
        }
    }
    if (!foundCity) {
        const cityPrefixMatch = cleanText.match(/(?:באזור|באיזור|בעיר)\s+([א-ת]+(?:\s+[א-ת]+)?)/i);
        if (cityPrefixMatch) {
            foundCity = cityPrefixMatch[1].trim();
        }
    }
    if (foundCity) {
        fields.city = foundCity;
    }

    // 9. Radius
    const radiusRegex = /(?:רדיוס חיפוש|רדיוס|טווח חיפוש|טווח)?\s*(\d+)\s*(?:ק"מ|קמ|קילומטר)/i;
    const radiusMatch = cleanText.match(radiusRegex);
    if (radiusMatch) {
        fields.radius = parseInt(radiusMatch[1], 10);
    }

    // 10. Budget Range
    const parsedBudget = parseBudgetFromText(cleanText);
    if (parsedBudget) {
        if (parsedBudget.budgetRange) fields.budgetRange = parsedBudget.budgetRange;
        if (parsedBudget.budget !== undefined) fields.budget = parsedBudget.budget;
    }

    return fields;
}

function generateQueryText(extra: any) {
    const category = extra.category || "";
    let categoryHebrew = "מוצר";
    if (category === "מחשבים ניידים" || category === "LAPTOPS" || category === "laptops") categoryHebrew = "מחשב נייד";
    else if (category === "מחשבים שולחניים") categoryHebrew = "מחשב נייח";
    else if (category === "טלפונים סלולריים" || category === "SMARTPHONES" || category === "MOBILE" || category === "PHONE") categoryHebrew = "סמארטפון";
    else if (category && category !== "General" && category !== "כללי") categoryHebrew = category;

    let text = `מחפש לקנות ${categoryHebrew}`;
    if (extra.brand) text += ` מתוצרת ${extra.brand}`;
    if (extra.model) text += ` דגם ${extra.model}`;
    if (extra.processor) text += ` עם מעבד ${extra.processor}`;
    if (extra.ram) text += ` זיכרון ${extra.ram}`;
    if (extra.storage) text += ` ואחסון ${extra.storage}`;
    if (extra.gpu) text += ` וכרטיס מסך ${extra.gpu}`;
    if (extra.screen) text += ` מסך ${extra.screen}`;
    if (extra.display) text += ` עם תצוגת ${extra.display}`;
    if (extra.condition) text += ` במצב ${extra.condition}`;

    if (extra.budgetRange && Array.isArray(extra.budgetRange)) {
        const [min, max] = extra.budgetRange;
        if (Number(min) > 0) {
            text += `, בתקציב מ-₪${Number(min).toLocaleString()} עד ₪${Number(max).toLocaleString()}`;
        } else if (Number(max) > 0) {
            text += `, בתקציב של עד ₪${Number(max).toLocaleString()}`;
        }
    } else if (extra.budget) {
        text += `, בתקציב של עד ₪${Number(extra.budget).toLocaleString()}`;
    }

    if (extra.city) {
        text += `, באזור ${extra.city}`;
    }
    if (extra.radius) {
        text += ` (רדיוס חיפוש ${extra.radius} ק״מ)`;
    }

    if (extra.details && extra.details.trim()) {
        text += `. הערה נוספת: ${extra.details.trim()}`;
    } else {
        text += `.`;
    }
    return text;
}

export function RadarDetailModal({
    request, onClose, onDelete, onUpdate, isDeleting,
}: RadarDetailModalProps) {
    // Parse and filter extra data with narrativeState flattening
    const flattenExtraData = (rawExtra: any): Record<string, any> => {
        let extra: Record<string, any> = {};
        try {
            extra = typeof rawExtra === "string" ? JSON.parse(rawExtra) : rawExtra;
        } catch {}
        if (!extra || typeof extra !== "object" || Array.isArray(extra)) extra = {};
        
        const getVal = (val: any) => Array.isArray(val) ? String(val[0] || "") : String(val || "");
        if (extra.narrativeState && typeof extra.narrativeState === "object") {
            const ns = extra.narrativeState;
            if (ns.brand && !extra.brand) extra.brand = getVal(ns.brand);
            if (ns.cpu && !extra.processor) extra.processor = getVal(ns.cpu);
            if (ns.ram && !extra.ram) extra.ram = getVal(ns.ram);
            if (ns.storage && !extra.storage) extra.storage = getVal(ns.storage);
            if (ns.gpu && !extra.gpu) extra.gpu = getVal(ns.gpu);
            if (ns.screen && !extra.screen) extra.screen = getVal(ns.screen);
            if (ns.display && !extra.display) extra.display = getVal(ns.display);
        }
        return extra;
    };

    const initialExtra = flattenExtraData(request.extraData);

    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(request.query);
    const [extra, setExtra] = useState<Record<string, any>>(initialExtra);
    const [saving, setSaving] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const shareUrl = `https://qlikndeal.vercel.app/radar/${request.id}`;

    const statusCfg: Record<string, { label: string; cls: string }> = {
        ACTIVE:   { label: "פעיל",         cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
        MATCHED:  { label: "נמצאה התאמה", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
        ARCHIVED: { label: "ארכיון",       cls: "bg-gray-700/30 text-gray-400 border-gray-600" },
    };
    
    let currentStatus = request.status;
    if (currentStatus === "MATCHED" && !loadingMatches && matches.length === 0) {
        currentStatus = "ACTIVE";
    }
    const s = statusCfg[currentStatus] ?? statusCfg.ARCHIVED;


    // Sync state on prop updates
    useEffect(() => {
        const flattened = flattenExtraData(request.extraData);
        setEditText(request.query);
        setExtra(flattened);
    }, [request]);

    // Fetch matching listings
    useEffect(() => {
        if (!request || editMode) return;
        
        const fetchMatches = async () => {
            setLoadingMatches(true);
            try {
                const res = await fetch(`/api/marketplace/request/${request.id}/matches`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.results)) {
                        setMatches(data.results);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch matching listings:", err);
            } finally {
                setLoadingMatches(false);
            }
        };

        fetchMatches();
    }, [request.id, editMode]);

    const handleTextChange = (newVal: string) => {
        setEditText(newVal);
        const parsed = parseFieldsFromText(newVal);
        setExtra(prev => {
            const next = { ...prev };
            
            // Unify fields to clear ones deleted by user in the text box
            const parsedKeys = ["category", "brand", "model", "ram", "storage", "processor", "gpu", "screen", "display", "city", "radius", "budgetRange", "budget"];
            
            parsedKeys.forEach(k => {
                if (parsed[k] !== undefined) {
                    next[k] = parsed[k];
                } else {
                    delete next[k];
                }
            });

            // Keep narrativeState in sync if it exists
            if (next.narrativeState && typeof next.narrativeState === "object") {
                const ns = { ...next.narrativeState };
                parsedKeys.forEach(k => {
                    const nsKey = k === "processor" ? "cpu" : k;
                    if (["brand", "processor", "ram", "storage", "gpu", "screen", "display"].includes(k)) {
                        if (parsed[k] !== undefined) {
                            ns[nsKey] = [String(parsed[k])];
                        } else {
                            delete ns[nsKey];
                        }
                    }
                });
                if (parsed.budgetRange) {
                    ns.budgetRange = parsed.budgetRange;
                    ns.budget = parsed.budget || parsed.budgetRange[1] || 0;
                } else {
                    delete ns.budgetRange;
                    delete ns.budget;
                }
                next.narrativeState = ns;
            }
            return next;
        });
    };

    const updateFieldAndSyncText = (key: string, value: any) => {
        setExtra(prev => {
            const next = { ...prev, [key]: value };
            
            // Unify budgetRange and budget
            if (key === "budgetRange" && Array.isArray(value)) {
                next.budget = value[1] || 0;
            }
            
            // Sync to narrativeState if it exists
            if (next.narrativeState && typeof next.narrativeState === "object") {
                const ns = { ...next.narrativeState };
                const nsKey = key === "processor" ? "cpu" : key;
                if (["brand", "processor", "ram", "storage", "gpu", "screen", "display"].includes(key)) {
                    ns[nsKey] = [String(value)];
                }
                if (key === "budgetRange" && Array.isArray(value)) {
                    ns.budgetRange = value;
                    ns.budget = value[1] || 0;
                }
                next.narrativeState = ns;
            }
            
            const newText = generateQueryText(next);
            setEditText(newText);
            return next;
        });
    };

    const handleSave = async () => {
        if (!editText.trim()) return;
        setSaving(true);
        try {
            await onUpdate(request.id, editText.trim(), extra);
            setEditMode(false);
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: "בקשת קנייה ב-Qlikndeal", text: request.query, url: shareUrl });
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success("הקישור הועתק ללוח");
        }
    };

    const fieldsToShow = VIEWABLE_RADAR_FIELDS.filter(field => {
        if (field.key === "budgetRange") {
            return extra.budgetRange || extra.budget;
        }
        return extra[field.key] !== undefined && extra[field.key] !== null && String(extra[field.key]).trim() !== "";
    });

    return (
        <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent
                className="bg-[#0d0f18] border border-white/10 text-white p-0 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                dir="rtl"
            >
                <DialogTitle className="sr-only">{request.query}</DialogTitle>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-cyan-950/40">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-cyan-600 text-white">🔍 Radar — חיפוש שמור</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-5 space-y-4">
                    {editMode ? (
                        <div className="space-y-4">
                            {/* Textarea for Query */}
                            <div className="bg-gray-900/60 rounded-xl p-4 border border-cyan-500/20">
                                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">מלל המודעה / מה אתה מחפש</label>
                                <textarea
                                    value={editText}
                                    onChange={e => handleTextChange(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-800/80 border border-cyan-500/30 rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-cyan-400 text-right font-medium"
                                    dir="rtl"
                                />
                            </div>

                            {/* Structured Fields Form */}
                            <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800/60 space-y-4">
                                <h4 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-2">נתונים מובנים למערכת ההתאמות</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Category */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">קטגוריה</label>
                                        <select
                                            value={extra.category || ""}
                                            onChange={e => updateFieldAndSyncText("category", e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                                        >
                                            <option value="General">כללי</option>
                                            <option value="מחשבים ניידים">מחשבים ניידים</option>
                                            <option value="מחשבים שולחניים">מחשבים שולחניים</option>
                                            <option value="טלפונים סלולריים">טלפונים סלולריים</option>
                                        </select>
                                    </div>

                                    {/* Brand */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">יצרן</label>
                                        <input
                                            type="text"
                                            value={extra.brand || ""}
                                            onChange={e => updateFieldAndSyncText("brand", e.target.value)}
                                            placeholder="לדוגמה: Apple, Dell"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* Model */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">דגם</label>
                                        <input
                                            type="text"
                                            value={extra.model || ""}
                                            onChange={e => updateFieldAndSyncText("model", e.target.value)}
                                            placeholder="לדוגמה: iPhone 15 Pro, Latitude 5420"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* RAM */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">זיכרון RAM</label>
                                        <input
                                            type="text"
                                            value={extra.ram || ""}
                                            onChange={e => updateFieldAndSyncText("ram", e.target.value)}
                                            placeholder="לדוגמה: 16GB, 8GB"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* Storage */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">נפח אחסון</label>
                                        <input
                                            type="text"
                                            value={extra.storage || ""}
                                            onChange={e => updateFieldAndSyncText("storage", e.target.value)}
                                            placeholder="לדוגמה: 512GB SSD, 1TB"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* Processor */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">מעבד (CPU)</label>
                                        <input
                                            type="text"
                                            value={extra.processor || ""}
                                            onChange={e => updateFieldAndSyncText("processor", e.target.value)}
                                            placeholder="לדוגמה: Intel i7, M3 Max"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* GPU */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">כרטיס מסך (GPU)</label>
                                        <input
                                            type="text"
                                            value={extra.gpu || ""}
                                            onChange={e => updateFieldAndSyncText("gpu", e.target.value)}
                                            placeholder="לדוגמה: RTX 4060, מובנה"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* Screen size */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">גודל מסך</label>
                                        <input
                                            type="text"
                                            value={extra.screen || ""}
                                            onChange={e => updateFieldAndSyncText("screen", e.target.value)}
                                            placeholder="לדוגמה: 14 אינץ', 6.1'"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* Display spec */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">מפרט מסך</label>
                                        <input
                                            type="text"
                                            value={extra.display || ""}
                                            onChange={e => updateFieldAndSyncText("display", e.target.value)}
                                            placeholder="לדוגמה: OLED, 120Hz"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>
                                    
                                    {/* City */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">עיר / מיקום</label>
                                        <input
                                            type="text"
                                            value={extra.city || ""}
                                            onChange={e => updateFieldAndSyncText("city", e.target.value)}
                                            placeholder="לדוגמה: תל אביב, חיפה"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>

                                    {/* Radius */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">רדיוס חיפוש (ק״מ)</label>
                                        <input
                                            type="number"
                                            value={extra.radius === null || extra.radius === undefined ? "" : extra.radius}
                                            onChange={e => {
                                                const val = e.target.value === "" ? null : Number(e.target.value);
                                                updateFieldAndSyncText("radius", val);
                                            }}
                                            placeholder="ללא הגבלה"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-400 text-right"
                                        />
                                    </div>
                                </div>

                                {/* Budget Range (Min / Max) */}
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">טווח תקציב (₪)</label>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1 flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1">
                                            <span className="text-xs text-gray-500">מ-</span>
                                            <input
                                                type="number"
                                                value={Array.isArray(extra.budgetRange) ? extra.budgetRange[0] : 0}
                                                onChange={e => {
                                                    const min = Number(e.target.value);
                                                    const max = Array.isArray(extra.budgetRange) ? Number(extra.budgetRange[1] || 0) : 0;
                                                    updateFieldAndSyncText("budgetRange", [min, max]);
                                                }}
                                                className="w-full bg-transparent border-0 p-1 text-sm text-white focus:outline-none text-right"
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1">
                                            <span className="text-xs text-gray-500">עד-</span>
                                            <input
                                                type="number"
                                                value={Array.isArray(extra.budgetRange) ? extra.budgetRange[1] : (extra.budget || 0)}
                                                onChange={e => {
                                                    const max = Number(e.target.value);
                                                    const min = Array.isArray(extra.budgetRange) ? Number(extra.budgetRange[0] || 0) : 0;
                                                    updateFieldAndSyncText("budgetRange", [min, max]);
                                                }}
                                                className="w-full bg-transparent border-0 p-1 text-sm text-white focus:outline-none text-right"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">הערות / פרטים נוספים</label>
                                    <textarea
                                        value={extra.details || ""}
                                        onChange={e => updateFieldAndSyncText("details", e.target.value)}
                                        rows={2}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:border-cyan-400 text-right"
                                        placeholder="הערות נוספות..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl disabled:opacity-50 transition-colors">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    שמור
                                </button>
                                <button onClick={() => { setEditText(request.query); setExtra(initialExtra); setEditMode(false); }}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                    בטל
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Query view */}
                            <div className="bg-gray-900/60 rounded-xl p-4 border border-cyan-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">מה אתה מחפש?</p>
                                    <button onClick={() => { setEditText(request.query); setExtra(initialExtra); setEditMode(true); }}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors font-bold">
                                        <Pencil className="w-3 h-3" />ערוך
                                    </button>
                                </div>
                                <p className="text-white text-sm leading-relaxed whitespace-pre-line font-medium">{request.query}</p>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>פורסם ב-{new Date(request.createdAt).toLocaleDateString("he-IL")}</span>
                            </div>

                            {/* Filtered & labelled extra fields */}
                            {fieldsToShow.length > 0 && (
                                <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800/60 bg-gray-800/30">
                                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                        <span className="text-sm font-bold text-gray-200">פרטי הבקשה</span>
                                    </div>
                                    {fieldsToShow.map(field => {
                                        const val = field.key === "budgetRange" ? extra.budgetRange || extra.budget : extra[field.key];
                                        return (
                                            <div key={field.key} className="flex justify-between items-start px-4 py-2.5 border-b border-gray-800/30 last:border-0 hover:bg-gray-800/20">
                                                <span className="text-gray-400 text-sm font-medium">{field.label}</span>
                                                <span className="text-white text-sm font-bold text-left max-w-[55%] break-words">
                                                    {formatRadarValue(field.key, val, extra)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Matching Listings Section */}
                            <div className="space-y-3 pt-3 border-t border-white/10">
                                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                                    <Radar className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                    מודעות מתאימות שנמצאו במרקטפלייס ({matches.length})
                                </h4>
                                
                                {loadingMatches ? (
                                    <div className="flex items-center justify-center p-6 bg-gray-900/40 rounded-xl border border-white/5">
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                        <span className="text-xs text-gray-400 mr-2 font-medium">מחפש התאמות במרקטפלייס...</span>
                                    </div>
                                ) : matches.length === 0 ? (
                                    <div className="p-4 bg-gray-900/20 rounded-xl border border-white/5 text-center">
                                        <p className="text-gray-500 text-[11px] font-medium">לא נמצאו מודעות מכירה תואמות כרגע. נשלח אליך התראה ברגע שיעלה מוצר מתאים!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {matches.map((l: any) => {
                                            let img = null;
                                            try {
                                                const parsed = JSON.parse(l.images || "[]");
                                                img = parsed[0] || null;
                                            } catch {}
                                            
                                            return (
                                                <a
                                                    key={l.id}
                                                    href={`/dashboard/marketplace/${l.id}`}
                                                    className="flex items-center gap-3 p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all duration-200 group/item text-right"
                                                >
                                                    {/* Product Image */}
                                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                                                        {img ? (
                                                            <img src={img} alt={l.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="w-4 h-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Text details */}
                                                    <div className="flex-1 min-w-0 text-right">
                                                        <h5 className="text-xs font-bold text-white group-hover/item:text-cyan-400 transition-colors truncate">{l.title}</h5>
                                                        <p className="text-[10px] text-gray-400 mt-1 flex flex-wrap items-center gap-1.5 justify-start" dir="rtl">
                                                            <span className="font-bold text-white">₪{Number(l.price).toLocaleString()}</span>
                                                            <span className="text-gray-600">•</span>
                                                            <span>{l.locationName || "לא צוין מיקום"}</span>
                                                            {l.distanceKm !== null && l.distanceKm !== undefined && (
                                                                <>
                                                                    <span className="text-gray-600">•</span>
                                                                    <span>{Math.round(l.distanceKm)} ק"מ</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Arrow */}
                                                    <ArrowLeft className="w-3.5 h-3.5 text-gray-500 group-hover/item:text-cyan-400 group-hover/item:-translate-x-0.5 transition-all shrink-0" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="bg-cyan-950/30 rounded-xl p-3 border border-cyan-500/20 text-xs text-cyan-300">
                                💡 מוכרים שיש להם מוצר מתאים יוכלו לראות את הבקשה שלך וליצור איתך קשר ישירות.
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-white/10 p-4 flex gap-2" dir="rtl">
                    {!editMode && (
                        <button onClick={() => { setEditText(request.query); setExtra(initialExtra); setEditMode(true); }}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors">
                            <Pencil className="w-4 h-4" />ערוך
                        </button>
                    )}
                    <button onClick={handleShare}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors">
                        <Share2 className="w-4 h-4" />שתף
                    </button>
                    <button onClick={() => { onClose(); onDelete(request.id); }}
                        disabled={isDeleting === request.id}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 mr-auto">
                        {isDeleting === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        מחק
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
