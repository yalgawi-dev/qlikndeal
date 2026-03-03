"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Laptop, Monitor, Tablet, Download, FileSpreadsheet, Loader2, Car, Settings, Tv, Package, Cpu, Database, RefreshCw, Clock } from "lucide-react";
import { 
    exportComputersToCSV, 
    exportPhonesToCSV, 
    exportVehiclesToCSV, 
    exportCustomBuildsToCSV,
    exportElectronicsToCSV,
    exportAppliancesToCSV,
    exportMotherboardsToCSV,
    syncVehicles,
    syncElectronicsAndAppliances,
    syncMotherboards,
    syncBrandDesktops,
    syncAio,
    getDatabaseStats
} from "../export-actions";
import { toast } from "sonner";

interface CatalogStats {
    count: number;
    lastUpdate: Date | null;
}

export default function ExportPageClient() {
    const [loading, setLoading] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [stats, setStats] = useState<Record<string, CatalogStats>>({});
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchStats = async () => {
        setStatsLoading(true);
        const res = await getDatabaseStats();
        if (res.success && res.stats) {
            setStats(res.stats as any);
        }
        setStatsLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const downloadFile = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async (type: string) => {
        setLoading(type);
        try {
            let content = "";
            let fileName = "";
            const now = new Date();
            const timeStr = `${now.getHours()}_${now.getMinutes()}`;
            const dateStr = now.toLocaleDateString().replace(/\//g, '_');

            if (type === "phone") {
                content = await exportPhonesToCSV();
                fileName = `phone_database_${dateStr}.xls`;
            } else if (type === "laptop" || type === "desktop" || type === "aio") {
                content = await exportComputersToCSV(type as any);
                fileName = `${type}_database_${dateStr}_${timeStr}.xls`;
            } else if (type === "vehicle") {
                content = await exportVehiclesToCSV();
                fileName = `vehicles_database_${dateStr}.xls`;
            } else if (type === "custom") {
                content = await exportCustomBuildsToCSV();
                fileName = `custom_builds_database_${dateStr}.xls`;
            } else if (type === "electronics") {
                content = await exportElectronicsToCSV();
                fileName = `electronics_database_${dateStr}.xls`;
            } else if (type === "appliance") {
                content = await exportAppliancesToCSV();
                fileName = `appliances_database_${dateStr}.xls`;
            } else if (type === "motherboard") {
                content = await exportMotherboardsToCSV();
                fileName = `motherboards_database_${dateStr}.xls`;
            }

            downloadFile(content, fileName);
            toast.success("הקובץ נוצר בהצלחה וירד למחשב");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("ייצוא הקובץ נכשל");
        } finally {
            setLoading(null);
        }
    };

    const handleSync = async (schema: string) => {
        console.log("DEBUG: Sync initiated for:", schema);
        let confirmMsg = "פעולה זו תמחק את כל הנתונים הקיימים בקטגוריה זו ותחליף אותם בנתוני המערכת. להמשיך?";
        
        if (!confirm(confirmMsg)) {
            console.log("DEBUG: Sync cancelled by user");
            return;
        }
        
        setSyncing(schema);
        try {
            console.log("DEBUG: Calling server action sync...");
            let result: any;
            if (schema === "vehicle") result = await syncVehicles();
            if (schema === "electronics") result = await syncElectronicsAndAppliances();
            if (schema === "motherboard") result = await syncMotherboards();
            if (schema === "desktop") result = await syncBrandDesktops();
            if (schema === "aio") result = await syncAio();

            console.log("DEBUG: Sync result received:", result);

            if (result && result.success) {
                const msg = result.message || `הפעולה הושלמה בהצלחה!`;
                toast.success(msg);
                alert(msg); // Hard alert for visibility
                fetchStats(); // Update stats
            } else {
                const errorMsg = "הפעולה נכשלה: " + (result?.error || "שגיאה לא ידועה");
                console.error("DEBUG: Sync error:", result?.error);
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error("DEBUG: Fatal sync error:", error);
            toast.error("שגיאה בביצוע הפעולה");
        } finally {
            setSyncing(null);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "מעולם לא";
        return new Intl.DateTimeFormat('he-IL', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(date));
    };

    const CatalogCard = ({ 
        id, title, desc, icon: Icon, color, neonColor, statsKey 
    }: { 
        id: string, title: string, desc: string, icon: any, color: string, neonColor: string, statsKey: string 
    }) => {
        const itemStats = stats[statsKey] || { count: 0, lastUpdate: null };
        
        return (
            <div className={`relative group overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-500 hover:border-${neonColor}-500/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.4)]`}>
                <div className={`absolute -right-12 -top-12 w-32 h-32 bg-${neonColor}-500/10 blur-3xl rounded-full group-hover:bg-${neonColor}-500/20 transition-all duration-700`} />
                
                <div className="relative flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${neonColor}-500/20 text-${neonColor}-400 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                            <Icon size={24} />
                        </div>
                        <div className="text-left">
                            <span className={`text-2xl font-black text-${neonColor}-400/80`}>
                                {statsLoading ? "..." : itemStats.count.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">רשומות</div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-l group-hover:from-white group-hover:to-slate-400 transition-all">{title}</h3>
                    <p className="text-sm text-slate-400 mb-6 flex-grow">{desc}</p>

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-black/30 p-2 rounded-lg border border-white/5">
                            <Clock size={12} className={`text-${neonColor}-500/60`} />
                            <span>עדכון אחרון: {statsLoading ? "טוען..." : formatDate(itemStats.lastUpdate)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button 
                                onClick={() => handleExport(id)} 
                                disabled={!!loading}
                                className={`w-full h-11 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/5 text-xs font-bold gap-2`}
                            >
                                {loading === id ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                                ייצוא
                            </Button>
                            
                            {["desktop", "aio", "motherboard", "electronics", "vehicle"].includes(id) && (
                                <Button 
                                    onClick={() => handleSync(id)} 
                                    disabled={!!syncing}
                                    className={`w-full h-11 bg-${neonColor}-600/20 hover:bg-${neonColor}-600/40 text-${neonColor}-400 rounded-xl border border-${neonColor}-500/30 text-xs font-bold gap-2`}
                                >
                                    {syncing === id ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                                    סנכרון
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#050508] text-right" dir="rtl">
            <div className="p-6 lg:p-12 max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="relative mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
                    
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            <Database size={14} />
                            מרכז ניהול מאגרי נתונים V2.9
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
                            ניהול <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 via-blue-400 to-cyan-400">קטלוגים</span>
                        </h1>
                        <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                            בקרה ועדכון של כלל מאגרי המידע במערכת. ייצוא קבצי אקסל לבדיקה וביצוע סנכרון חכם מול מקורות הקוד.
                        </p>
                    </div>

                    <div className="relative flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={fetchStats}
                            disabled={statsLoading}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl px-6 h-14 font-bold"
                        >
                            {statsLoading ? <Loader2 className="animate-spin ml-2" /> : <RefreshCw className="ml-2" />}
                            רענן נתונים
                        </Button>
                    </div>
                </div>

                {/* Grid Grid - Premium Neon Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <CatalogCard 
                        id="laptop" title="מחשבים ניידים" desc="מאגר Laptops מקיף הכולל מותגים וסדרות 2024-2025."
                        icon={Laptop} color="blue" neonColor="blue" statsKey="laptop"
                    />
                    <CatalogCard 
                        id="desktop" title="מחשבי מותג" desc="נייחים מסדרות Dell Optiplex, HP Elite/Pro ומרכזי עבודה."
                        icon={Monitor} color="indigo" neonColor="indigo" statsKey="desktop"
                    />
                    <CatalogCard 
                        id="aio" title="All-in-One" desc="מחשבי iMac, HP Pavilion AIO, Lenovo Yoga AIO ועוד."
                        icon={Monitor} color="cyan" neonColor="cyan" statsKey="aio"
                    />
                    <CatalogCard 
                        id="motherboard" title="לוחות אם" desc="מאגר לוחות אם (PC) לשימוש במנוע החיפוש החכם לבנייה."
                        icon={Cpu} color="slate" neonColor="slate" statsKey="motherboard"
                    />
                    <CatalogCard 
                        id="phone" title="סלולריים" desc="סדרות iPhone, Samsung Galaxy, Xiaomi ו-Google Pixel."
                        icon={Tablet} color="purple" neonColor="purple" statsKey="mobile"
                    />
                    <CatalogCard 
                        id="vehicle" title="רכבים" desc="מאגר יצרני ודגמי רכבים יד שנייה וחדשים."
                        icon={Car} color="rose" neonColor="rose" statsKey="vehicle"
                    />
                    <CatalogCard 
                        id="electronics" title="אלקטרוניקה" desc="טלוויזיות, שעונים חכמים, אוזניות וגאדג'טים."
                        icon={Tv} color="amber" neonColor="amber" statsKey="electronics"
                    />
                    <CatalogCard 
                        id="appliance" title="מוצרי חשמל" desc="מקררים, מכונות כביסה, מזגנים ומדיחי כלים."
                        icon={Package} color="emerald" neonColor="emerald" statsKey="appliance"
                    />
                </div>

                {/* Footer Insight */}
                <div className="mt-16 bg-gradient-to-l from-indigo-900/20 to-transparent p-1 rounded-3xl">
                    <div className="bg-[#080810] rounded-[22px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <Settings size={32} className="animate-spin-slow" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-1">הערות תחזוקה</h4>
                                <p className="text-slate-500 text-sm max-w-md">כל פעולת סנכרון מבצעת "איפוס חכם" של הטבלה - מוחקת נתונים קיימים ומזריקה את הרשימות המעודכנות ביותר למניעת כפילויות.</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
                                System Status: ONLINE
                             </div>
                             <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                                All Services Active
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                
                /* Selection colors to match neon vibes */
                ::selection {
                    background: rgba(99, 102, 241, 0.3);
                    color: white;
                }
            `}</style>
        </div>
    );
}
