import prismadb from '@/lib/prismadb';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Radar, Target, Zap, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import WishActionButton from '@/components/marketplace/WishActionButton';

const getCategoryBanner = (cat: string) => {
    switch(cat) {
        case "מחשבים ניידים": return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200";
        case "מחשבים שולחניים": return "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=1200";
        case "טלפונים סלולריים": return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1200";
        default: return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200";
    }
}

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
];

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
        if (ns.cpu && !extra.processor) extra.processor = getVal(ns.processor || ns.cpu);
        if (ns.ram && !extra.ram) extra.ram = getVal(ns.ram);
        if (ns.storage && !extra.storage) extra.storage = getVal(ns.storage);
        if (ns.gpu && !extra.gpu) extra.gpu = getVal(ns.gpu);
        if (ns.screen && !extra.screen) extra.screen = getVal(ns.screen);
        if (ns.display && !extra.display) extra.display = getVal(ns.display);
    }
    return extra;
};

function parseSpecsFromText(text: string, currentExtra: Record<string, any>): Record<string, any> {
    const extra = { ...currentExtra };
    const lowerText = text.toLowerCase();

    // 1. BRAND
    if (!extra.brand) {
        const brands = ["lenovo", "asus", "apple", "samsung", "dell", "hp", "msi", "gigabyte", "acer", "xiaomi", "lg", "intel", "amd"];
        const brandMatch = brands.find(b => lowerText.includes(b));
        if (brandMatch) {
            extra.brand = brandMatch.charAt(0).toUpperCase() + brandMatch.slice(1);
        } else if (text.includes("לנובו")) {
            extra.brand = "Lenovo";
        } else if (text.includes("אסוס")) {
            extra.brand = "Asus";
        } else if (text.includes("אפל") || text.includes("אייפון")) {
            extra.brand = "Apple";
        } else if (text.includes("סמסונג")) {
            extra.brand = "Samsung";
        } else if (text.includes("דל")) {
            extra.brand = "Dell";
        }
    }

    // 2. RAM
    if (!extra.ram) {
        const ramMatch = lowerText.match(/\b(8|16|32|64|128)\s*(?:gb|ג"ב|גיגה|ג'יגה)\b/);
        if (ramMatch) {
            extra.ram = `${ramMatch[1]}GB`;
        }
    }

    // 3. STORAGE
    if (!extra.storage) {
        const storageMatch = lowerText.match(/\b(128|256|512)\s*(?:gb|ג"ב|גיגה|ג'יגה)\b|\b(1|2)\s*(?:tb|טרה)\b/);
        if (storageMatch) {
            if (storageMatch[1]) {
                extra.storage = `${storageMatch[1]}GB`;
            } else if (storageMatch[2]) {
                extra.storage = `${storageMatch[2]}TB`;
            }
        }
    }

    // 4. PROCESSOR (CPU)
    if (!extra.processor) {
        if (lowerText.includes("i5") || lowerText.includes("core i5")) extra.processor = "Intel Core i5";
        else if (lowerText.includes("i7") || lowerText.includes("core i7")) extra.processor = "Intel Core i7";
        else if (lowerText.includes("i9") || lowerText.includes("core i9")) extra.processor = "Intel Core i9";
        else if (lowerText.includes("ryzen 5")) extra.processor = "AMD Ryzen 5";
        else if (lowerText.includes("ryzen 7")) extra.processor = "AMD Ryzen 7";
        else if (lowerText.includes("ryzen 9")) extra.processor = "AMD Ryzen 9";
        else if (lowerText.includes("m1")) extra.processor = "Apple M1";
        else if (lowerText.includes("m2")) extra.processor = "Apple M2";
        else if (lowerText.includes("m3")) extra.processor = "Apple M3";
    }

    // 5. GPU
    if (!extra.gpu) {
        if (lowerText.includes("rtx 3060")) extra.gpu = "NVIDIA RTX 3060";
        else if (lowerText.includes("rtx 3070")) extra.gpu = "NVIDIA RTX 3070";
        else if (lowerText.includes("rtx 3080")) extra.gpu = "NVIDIA RTX 3080";
        else if (lowerText.includes("rtx 4060")) extra.gpu = "NVIDIA RTX 4060";
        else if (lowerText.includes("rtx 4070")) extra.gpu = "NVIDIA RTX 4070";
        else if (lowerText.includes("rtx 4080")) extra.gpu = "NVIDIA RTX 4080";
        else if (lowerText.includes("rtx 4090")) extra.gpu = "NVIDIA RTX 4090";
    }

    // 6. Display spec (OLED, IPS, Hz, etc.)
    if (!extra.display) {
        const displayRegex = /(oled|ips|hz|dci-p3|retina|amoled|fhd|qhd|4k|2\.8k|120hz|144hz|60hz|90hz|240hz)/i;
        const displayMatch = lowerText.match(displayRegex);
        if (displayMatch) {
            const fullMatch = lowerText.match(/([a-z0-9\.\-%]+(?:\s+[a-z0-9\.\-%]+){0,5}\s*(?:oled|ips|hz|dci-p3|retina|amoled|fhd|qhd|4k|2\.8k|120hz|144hz|60hz|90hz|240hz)\b[a-z0-9\.\-%\s]*)/i);
            if (fullMatch) {
                extra.display = fullMatch[1].trim();
            }
        }
    }

    return extra;
}

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
        return `${value} ק״מ`;
    }
    if (key === "category") {
        if (!value || value === "General" || value === "GENERAL") return "כללי";
        if (value === "LAPTOPS" || value === "laptops") return "מחשבים ניידים";
        if (value === "SMARTPHONES" || value === "smartphones" || value === "MOBILE" || value === "PHONE") return "טלפונים סלולריים";
        return String(value);
    }
    return String(value);
}

export default async function WishPage({ params }: { params: { id: string } }) {
    const request = await prismadb.buyerRequest.findUnique({
        where: { id: params.id },
        include: { user: true }
    });

    if (!request) {
        notFound();
    }

    const userName = request.user?.firstName || "קונה רציני";
    
    const rawExtra = flattenExtraData(request.extraData);
    const textToParse = `${request.query} ${rawExtra.details || ""}`;
    const extraData = parseSpecsFromText(textToParse, rawExtra);

    const category = extraData.category || "כללי";
    const budgetRange = extraData.budgetRange || [0, extraData.budget || 0];
    const chips = extraData.chips || [];
    const bannerUrl = getCategoryBanner(category);

    const fieldsToShow = VIEWABLE_RADAR_FIELDS.filter(field => {
        if (field.key === "budgetRange") {
            return extraData.budgetRange || extraData.budget;
        }
        return extraData[field.key] !== undefined && extraData[field.key] !== null && String(extraData[field.key]).trim() !== "";
    });

    const { userId: clerkId } = await auth();
    let isOwner = false;
    if (clerkId && request.user?.clerkId === clerkId) {
        isOwner = true;
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden" dir="rtl">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/80 to-[#050505] z-10" />
                <img src={bannerUrl} alt="Category" className="w-full h-[60vh] object-cover opacity-30 blur-[2px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-16 flex flex-col items-center">
                
                {/* Back to Search Button */}
                <div className="w-full flex justify-start mb-6">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all text-sm font-bold backdrop-blur-md group"
                    >
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span>חזרה להמשך חיפוש</span>
                    </Link>
                </div>

                {/* Logo / Badge */}
                <div className="flex items-center gap-2 mb-12">
                    <Radar className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="text-2xl font-black tracking-widest text-white drop-shadow-md">Qlik<span className="text-cyan-400">ndeal</span></span>
                </div>

                {/* Main Radar Card */}
                <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(34,211,238,0.1)] mb-12 relative group">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="px-4 py-1 rounded-full bg-cyan-950/50 border border-cyan-400/30 text-cyan-400 text-sm font-bold tracking-wide flex items-center gap-2">
                            <Target className="w-4 h-4" /> סוכן חיפוש פעיל
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-center leading-tight mb-6">
                        {userName} מחפש לקנות <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                            {request.query}
                        </span>
                    </h1>

                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {category !== "כללי" && (
                            <div className="bg-[#111] border border-gray-800 px-5 py-2.5 rounded-xl font-bold text-gray-300">
                                {category}
                            </div>
                        )}
                        {(budgetRange[0] > 0 || budgetRange[1] > 0) && (
                            <div className="bg-cyan-950/30 border border-cyan-500/30 px-5 py-2.5 rounded-xl font-mono text-xl font-black text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]">
                                תקציב: ₪{budgetRange[0].toLocaleString()} - ₪{budgetRange[1].toLocaleString()}
                            </div>
                        )}
                    </div>

                    {chips.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {chips.map((chip: string) => (
                                <span key={chip} className="px-4 py-1.5 rounded-full border border-gray-700 bg-black/50 text-gray-400 text-sm font-bold">
                                    {chip}
                                </span>
                            ))}
                        </div>
                    )}

                    {extraData.details && (
                        <div className="bg-[#050505] p-6 rounded-2xl border border-gray-800 mb-8 max-w-2xl mx-auto">
                            <p className="text-gray-300 text-center leading-relaxed">
                                "{extraData.details}"
                            </p>
                        </div>
                    )}

                    {/* Specifications Grid */}
                    {fieldsToShow.length > 0 && (
                        <div className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-md rounded-2xl border border-gray-800/80 overflow-hidden mb-8">
                            <div className="px-6 py-4 bg-cyan-950/20 border-b border-gray-800/80 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                                <h3 className="font-bold text-lg text-gray-200">מפרט מבוקש ודרישות</h3>
                            </div>
                            <div className="divide-y divide-gray-800/50">
                                {fieldsToShow.map((field) => {
                                    const val = field.key === "budgetRange" ? extraData.budgetRange || extraData.budget : extraData[field.key];
                                    return (
                                        <div key={field.key} className="flex justify-between items-center px-6 py-3.5 hover:bg-white/5 transition-colors">
                                            <span className="text-gray-400 text-sm font-medium">{field.label}</span>
                                            <span className="text-white text-sm font-bold text-left max-w-[60%] break-words">
                                                {formatRadarValue(field.key, val, extraData)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Dual Conversion Hook */}
                    <div className="flex flex-col items-center gap-4 mt-10 w-full max-w-sm mx-auto">
                        {isOwner ? (
                            <Link href="/dashboard/marketplace/my-requests" className="w-full group">
                                <button className="w-full relative h-16 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-lg font-black rounded-2xl border border-white/10 hover:border-white/20 shadow-md transition-all active:scale-95 flex items-center justify-center gap-3">
                                    <span>הבקשה שלי - צפה בהצעות שקיבלת 📊</span>
                                </button>
                            </Link>
                        ) : (
                            <WishActionButton 
                                requestId={request.id} 
                                isAuthenticated={!!clerkId} 
                            />
                        )}

                        <Link 
                            href="/" 
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all text-lg font-black backdrop-blur-md"
                        >
                            חזרה להמשך חיפוש
                        </Link>
                        
                        <p className="text-gray-500 text-sm font-bold mt-4 text-center">
                            רוצה להגיע לעוד קונים? <Link href="/dashboard/marketplace/create" className="text-cyan-400 hover:underline">פרסם מודעה ב-30 שניות!</Link>
                        </p>
                    </div>
                </div>

                {/* Secondary CTA for New Users */}
                <div className="text-center bg-[#0a0a0a]/50 backdrop-blur-md p-8 rounded-3xl border border-gray-800/50 max-w-2xl w-full">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                    <h2 className="text-2xl font-bold text-white mb-2">מחפש משהו אחר?</h2>
                    <p className="text-gray-400 mb-6">צור לעצמך סוכן ראדאר חכם שייסרוק עבורך את הרשת.</p>
                    <Link href="/dashboard/marketplace/my-requests" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors">
                        <Plus className="w-5 h-5" /> הפעל סוכן אישי עכשיו
                    </Link>
                </div>

            </div>
        </main>
    );
}
