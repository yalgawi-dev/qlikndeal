"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Laptop, Monitor, Tablet, Download, FileSpreadsheet, Loader2, Car, Settings, Tv, Package, Cpu, Database, RefreshCw, Clock, Check, User, TableProperties } from "lucide-react";
import CatalogManagerModal from "./CatalogManagerModal";
import type { CatalogType } from "../catalog-actions";
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
import { 
    importLaptopsAction, 
    importDesktopsAction,
    importAioAction,
    importMobileAction,
    importVehicleAction,
    importElectronicsAction,
    importApplianceAction,
    importMotherboardAction,
    undoRecentInCategoryAction,
    ImportResult 
} from "../import-actions";
import { toast } from "sonner";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CatalogStats {
    count: number;
    lastUpdate: Date | null;
}

export default function ExportPageClient() {
    const [loading, setLoading] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [stats, setStats] = useState<Record<string, CatalogStats>>({});
    const [statsLoading, setStatsLoading] = useState(true);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);

    // Import State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importType, setImportType] = useState<string | null>(null);
    const [importData, setImportData] = useState<string>("");
    const [importPreview, setImportPreview] = useState<any[]>([]);
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // Catalog Manager State
    const [managerOpen, setManagerOpen] = useState(false);
    const [managerType, setManagerType] = useState<CatalogType>("laptop");
    const [managerTitle, setManagerTitle] = useState("");

    const fetchStats = async () => {
        setStatsLoading(true);
        const res = await getDatabaseStats();
        if (res.success && res.stats) {
            setStats(res.stats as any);
            // @ts-ignore
            if (res.recentLogs) setRecentLogs(res.recentLogs);
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

            if (type === "mobile" || type === "phone") {
                content = await exportPhonesToCSV();
                fileName = `mobile_database_${dateStr}.xls`;
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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setImportData(content);
            tryParseImport(content);
        };
        reader.readAsText(file);
    };

    const tryParseImport = (text: string) => {
        try {
            // Remove BOM if present and trim
            const trimmed = text.trim().replace(/^\uFEFF/, "");
            if (!trimmed) {
                setImportPreview([]);
                return;
            }

            let rawHeaders: string[] = [];
            let rowsRaw: string[][] = [];

            // ניסיון ראשון: JSON
            if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                const parsed = JSON.parse(trimmed);
                setImportPreview(Array.isArray(parsed) ? parsed : [parsed]);
                return;
            }

            // ניסיון שני: HTML Table (הפורמט שהמערכת שלנו מייצאת תחת סיומת XLS)
            if (trimmed.toLowerCase().includes("<table")) {
                const theadMatch = trimmed.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
                if (theadMatch) {
                    const thMatches = [...theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)];
                    rawHeaders = thMatches.map(m => m[1].replace(/<[^>]+>/g, "").trim());
                }

                const tbodyMatch = trimmed.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i) || trimmed.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
                if (tbodyMatch && rawHeaders.length > 0) {
                    const trMatches = [...tbodyMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
                    for (const tr of trMatches) {
                        const tdMatches = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
                        if (tdMatches.length > 0) {
                            rowsRaw.push(tdMatches.map(m => m[1].replace(/<[^>]+>/g, "").trim()));
                        }
                    }
                }
            } 
            // ניסיון שלישי: CSV או TSV
            else {
                const lines = trimmed.split(/\r?\n/);
                if (lines.length >= 2) {
                    const firstLine = lines[0];
                    const delimiter = firstLine.includes("\t") ? "\t" : ",";
                    
                    const parseLine = (line: string, delim: string) => {
                        const result = [];
                        let cur = '';
                        let inQuotes = false;
                        for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === delim && !inQuotes) {
                                result.push(cur);
                                cur = '';
                            } else {
                                cur += char;
                            }
                        }
                        result.push(cur);
                        return result.map(v => v.trim().replace(/^"|"$/g, ''));
                    };

                    rawHeaders = parseLine(firstLine, delimiter);
                    
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            rowsRaw.push(parseLine(lines[i], delimiter));
                        }
                    }
                }
            }

            if (rawHeaders.length < 2) {
                toast.error("מבנה הקובץ לא נראה תקין (חסרות עמודות מזוהות)");
                return;
            }

            // מיפוי עברית לאנגלית (כולל אנגלית באותיות קטנות לטיפול בכפילויות ווריאציות)
            const mapping: Record<string, string> = {
                "יצרן": "brand", "מותג": "brand", "make": "brand", "brand": "brand",
                "סדרה": "series", "series": "series",
                "דגם": "modelName", "model": "modelName", "modelname": "modelName",
                "סוג": "type", "type": "type",
                "מסך": "screenSize", "גודל מסך": "screenSize", "screensize": "screenSize",
                "מעבד": "cpu", "cpu": "cpu",
                "זיכרון ram": "ram", "זיכרון": "ram", "ram": "ram", "ramg": "ramG",
                "אחסון": "storage", "storage": "storage", "אחסון (gb)": "storages", "storages": "storages",
                "מאיץ גרפי": "gpu", "כרטיס מסך": "gpu", "gpu": "gpu",
                "שנה": "releaseYear", "year": "releaseYear", "releaseyear": "releaseYear",
                "הערות": "notes", "notes": "notes",
                "מק\"ט": "sku", "sku": "sku",
                "משקל": "weight", "weight": "weight",
                "חיבורים": "ports", "ports": "ports",
                "תצוגה": "display", "display": "display",
                "כינויים (he)": "hebrewAliases", "hebrewaliases": "hebrewAliases", "כינויים": "hebrewAliases",
                "סוללה": "battery", "battery": "battery",
                "מצלמה אחורית": "rearCamera", "rearcamera": "rearCamera",
                "מצלמה קדמית": "frontCamera", "frontcamera": "frontCamera",
                "nfc": "nfc", "טעינה אלחוטית": "wirelessCharging", "wirelesscharging": "wirelessCharging",
                "קטגוריה": "category", "category": "category",
                "קיבולת": "capacity", "capacity": "capacity",
                "דירוג אנרגטי": "energyRating", "energy rating": "energyRating", "energyrating": "energyRating",
                "מערכת הפעלה": "os", "os": "os"
            };

            const headers = rawHeaders.map(h => {
                const normalized = h.trim().toLowerCase();
                return mapping[normalized] || h.trim();
            });

            const rows = rowsRaw.map((values) => {
                const obj: any = {};
                headers.forEach((header, i) => {
                    let val: any = values[i] || "";
                    if (val && typeof val === 'string' && val.includes("/")) {
                        val = val.split("/").map((v: string) => v.trim());
                    }
                    if (header === "nfc" || header === "wirelessCharging") {
                        val = val === "V" || val === "v" || val === "true";
                    }
                    obj[header] = val;
                });
                return obj;
            });
            
            if (rows.length === 0) {
                toast.error("לא נמצאו נתונים לייבוא בקובץ");
            }

            setImportPreview(rows);
        } catch (err) {
            console.error("Parse error:", err);
            setImportPreview([]);
            toast.error("שגיאה בפענוח הקובץ. וודא שהוא בפורמט CSV או JSON תקין.");
        }
    };

    const handleUndoImport = async (targetCategory?: string) => {
        const cat = targetCategory || importType;
        if (!cat) return;
        if (!confirm("האם אתה בטוח שברצונך למחוק את קבוצת הרשומות האחרונה שנוספה בקטגוריה זו? (מחיקת קבוצת ייבוא אחת)")) return;
        setImportLoading(true);
        try {
            const res = await undoRecentInCategoryAction(cat);
            toast.success(`בוטל בהצלחה! ${res.deletedCount} רשומות מהייבוא האחרון נמחקו מהמאגר.`);
            fetchStats();
            if (!targetCategory) {
                setImportResult(null);
                setImportData("");
                setImportPreview([]);
                setImportModalOpen(false);
            }
        } catch (error: any) {
            toast.error("שגיאה במחיקה: " + error.message);
        } finally {
            setImportLoading(false);
        }
    };

    const executeImport = async () => {
        if (importPreview.length === 0) return;
        setImportLoading(true);
        setImportResult(null);

        try {
            let res: ImportResult & { newTotal?: number };
            const type = importType;

            if (type === "laptop") {
                res = await importLaptopsAction(importPreview);
            } else if (type === "desktop") {
                res = await importDesktopsAction(importPreview);
            } else if (type === "aio") {
                res = await importAioAction(importPreview);
            } else if (type === "mobile" || type === "phone") {
                res = await importMobileAction(importPreview);
                if (res.newTotal !== undefined) {
                    setStats(prev => ({
                        ...prev,
                        ["mobile"]: { count: res.newTotal!, lastUpdate: new Date() }
                    }));
                }
            } else if (type === "vehicle") {
                res = await importVehicleAction(importPreview);
            } else if (type === "electronics") {
                res = await importElectronicsAction(importPreview);
            } else if (type === "appliance") {
                res = await importApplianceAction(importPreview);
            } else if (type === "motherboard") {
                res = await importMotherboardAction(importPreview);
            } else {
                toast.error("ייבוא לקטגוריה זו טרם נתמך");
                return;
            }

            setImportResult(res);
            
            if (res.added > 0) {
                // Targeted refresh feel: update the specific stat locally first then fetch all
                if (type && res.newTotal !== undefined) {
                    setStats(prev => ({
                        ...prev,
                        [type]: { ...prev[type], count: res.newTotal!, lastUpdate: new Date() }
                    }));
                }
                fetchStats();
            }

            const message = res.added > 0 
                ? `✅ ייבוא הושלם! נוספו ${res.added} מוצרים חדשים. ${res.duplicatesInFile > 0 ? `(${res.duplicatesInFile} כפולים בקובץ סוננו)` : ''}`
                : `הסנכרון הסתיים. כל הרשומות כבר קיימות במערכת (${res.duplicatesInFile} כפולים בקובץ, ${res.skipped} קיימים ב-DB).`;
                
            toast.success(message);
        } catch (error: any) {
            toast.error("ייבוא נכשל: " + error.message);
        } finally {
            setImportLoading(false);
        }
    };

    const downloadTemplate = (id: string) => {
        let headers = "";
        let example = "";
        
        if (id === "laptop") {
            headers = "brand,series,modelName,type,screenSize,cpu,ram,storage,os,releaseYear,sku,weight,ports,display";
            example = "Apple,MacBook Air,M3,Laptop,13.6/15,M3,8GB/16GB/24GB,256GB/512GB,macOS,2024,SKU123,1.24kg,2x Thunderbolt,Liquid Retina";
        } else if (id === "desktop") {
            headers = "brand,series,modelName,cpu,gpu,ram,storage,os,releaseYear,sku,ports,weight,isMini";
            example = "Dell,OptiPlex,7010,i5-13500,UHD 770,16GB,512GB,Windows 11,2023,D-7010,4x USB 3.0,5kg,false";
        } else if (id === "aio") {
            headers = "brand,series,modelName,screenSize,cpu,gpu,ram,storage,os,releaseYear,sku,display,ports";
            example = "HP,Pavilion,27-ca,27,i7-13700T,RTX 3050,16GB,1TB,Windows 11,2023,HP-AIO-27,QHD IPS,4x USB-A/1x USB-C";
        } else if (id === "mobile" || id === "phone") {
            headers = "brand,series,modelName,hebrewAliases,storages,screenSize,releaseYear,cpu,ramG,os,battery,rearCamera,frontCamera,weight,nfc,wirelessCharging";
            example = "Samsung,S24,Galaxy S24,סמסונג S24/גלקסי 24,128/256/512,6.2,2024,Exynos 2400,8,Android 14,4000mAh,50MP,12MP,167g,true,true";
        } else if (id === "vehicle") {
            headers = "make,model,year,type,fuelType,transmission,engineSize,hp";
            example = "Toyota,Corolla,2024,Sedan,Hybrid,Automatic,1.8,140";
        } else if (id === "electronics") {
            headers = "brand,category,modelName,hebrewAliases,releaseYear,specs";
            example = 'Apple,Smartwatch,Series 9,אפל ווטש 9/Apple Watch 9,2023,"{""screen"": ""OLED"", ""gps"": true}"';
        } else if (id === "appliance") {
            headers = "brand,category,modelName,hebrewAliases,capacity,energyRating";
            example = "Samsung,Refrigerator,RF28,סמסונג מקרר,700L,A";
        } else if (id === "motherboard") {
            headers = "brand,model,chipset,socket,formFactor,ramType,maxRam,pcie,m2,lan,wifi,releaseYear";
            example = "ASUS,ROG STRIX Z790-E,Z790,LGA1700,ATX,DDR5,128GB,PCIe 5.0,5x M.2,2.5Gb,WiFi 6E,2023";
        }

        const content = `${headers}\n${example}`;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${id}_template.csv`;
        link.click();
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
        
        // We only show the "Updated Now" badge if there's a MANUAL import log in the last 12 hours for this category
        const lastManualLog = recentLogs.find((l: any) => l.category === id);
        const isRecentlyUpdated = lastManualLog && lastManualLog.added > 0 && (new Date().getTime() - new Date(lastManualLog.createdAt).getTime()) < 1000 * 60 * 60 * 12;

        // Define neon glow classes based on color
        const glowClass = {
            blue: "shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/50",
            indigo: "shadow-[0_0_20px_rgba(99,102,241,0.3)] border-indigo-500/50",
            cyan: "shadow-[0_0_20px_rgba(6,182,212,0.3)] border-cyan-500/50",
            slate: "shadow-[0_0_20px_rgba(148,163,184,0.3)] border-slate-500/50",
            purple: "shadow-[0_0_20px_rgba(168,85,247,0.3)] border-purple-500/50",
            rose: "shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-500/50",
            amber: "shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-500/50",
            emerald: "shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500/50",
        }[neonColor as keyof typeof stats] || "shadow-none";

        const textColor = {
            blue: "text-blue-400",
            indigo: "text-indigo-400",
            cyan: "text-cyan-400",
            slate: "text-slate-400",
            purple: "text-purple-400",
            rose: "text-rose-400",
            amber: "text-amber-400",
            emerald: "text-emerald-400",
        }[neonColor as keyof typeof stats] || "text-white";

        const bgColor = {
            blue: "bg-blue-500/10",
            indigo: "bg-indigo-500/10",
            cyan: "bg-cyan-500/10",
            slate: "bg-slate-500/10",
            purple: "bg-purple-500/10",
            rose: "bg-rose-500/10",
            amber: "bg-amber-500/10",
            emerald: "bg-emerald-500/10",
        }[neonColor as keyof typeof stats] || "bg-white/10";

        return (
            <div className={`relative group overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 transition-all duration-500 hover:scale-[1.02] ${isRecentlyUpdated ? 'shadow-[0_0_25px_rgba(239,68,68,0.3)] border-red-500/50' : glowClass}`}>
                {isRecentlyUpdated && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black animate-pulse shadow-lg shadow-red-500/20">
                        <RefreshCw size={10} className="animate-spin-slow" />
                        עודכן כרגע
                    </div>
                )}
                <div className={`absolute -right-8 -top-8 w-40 h-40 ${isRecentlyUpdated ? 'bg-red-500/10' : bgColor} blur-3xl rounded-full group-hover:opacity-100 opacity-50 transition-all duration-700`} />
                
                <div className="relative flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor} ${textColor} shadow-inner`}>
                            <Icon size={28} />
                        </div>
                        <div className="text-left">
                            <div className={`text-3xl font-black ${textColor} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`}>
                                {statsLoading ? "..." : itemStats.count.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mr-1">רשומות במאגר</div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 leading-none">{title}</h3>
                    <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">{desc}</p>

                    <div className="mt-auto space-y-5">
                        <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <Clock size={12} className={textColor} />
                                <span>סטטוס סנכרון אחרון</span>
                            </div>
                            <div className="text-xs text-slate-200 font-bold">
                                {statsLoading ? "מעדכן נתונים..." : formatDate(itemStats.lastUpdate)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Button 
                                onClick={() => handleExport(id)} 
                                disabled={!!loading}
                                className={`w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 text-xs font-black transition-all active:scale-95`}
                            >
                                {loading === id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} className="ml-2" />}
                                ייצוא
                            </Button>
                            
                            <Button 
                                onClick={() => {
                                    setImportType(id);
                                    setImportModalOpen(true);
                                    setImportData("");
                                    setImportPreview([]);
                                    setImportResult(null);
                                }}
                                className={`w-full h-12 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-2xl border border-indigo-500/30 text-xs font-black transition-all active:scale-95`}
                            >
                                <Package size={16} className="ml-2" />
                                ייבוא חכם
                            </Button>
                        </div>
                        
                        <Button
                            onClick={() => handleUndoImport(id)}
                            disabled={importLoading}
                            className={`w-full h-10 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl border border-red-500/20 text-xs font-black transition-all active:scale-95`}
                        >
                            <RefreshCw size={14} className="ml-2" />
                            ביטול ייבוא אחרון (Undo)
                        </Button>

                        <Button
                            onClick={() => {
                                setManagerType(id as CatalogType);
                                setManagerTitle(title);
                                setManagerOpen(true);
                            }}
                            className={`w-full h-10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-2xl border border-emerald-500/20 text-xs font-black transition-all active:scale-95`}
                        >
                            <TableProperties size={14} className="ml-2" />
                            נהל רשומות
                        </Button>

                        <div className="flex flex-col items-end gap-2 pt-4 border-t border-white/5 mt-4 opacity-50">
                             <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                DATABASE SECURE
                             </div>
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
                            בקרה ועדכון של כלל מאגרי המידע במערכת. ייצוא קבצי אקסל לבדיקה וביצוע ייבוא חכם למניעת כפילויות.
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
                        id="mobile" title="סלולריים" desc="סדרות iPhone, Samsung Galaxy, Xiaomi ו-Google Pixel."
                        icon={Tablet} color="purple" neonColor="purple" statsKey="mobile"
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
                                <p className="text-slate-500 text-sm max-w-md">המאגר מנוהל כעת בצורה חכמה בלבד. כל פעולת ייבוא בודקת כפילויות מול נתוני המערכת הקיימים ללא דריסת מידע קודם.</p>
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

            {/* Import Modal */}
            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogContent className="max-w-4xl bg-slate-900 border-white/10 text-white" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">ייבוא רשומות חדשות: {importType}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            העלה קובץ (CSV/JSON) או הדבק רשימת נתונים. המערכת תבצע מניעת כפילויות אוטומטית.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Input Column */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-300">הדבקת נתונים (JSON או CSV)</label>
                                <Textarea 
                                    className="h-64 bg-black/40 border-white/10 font-mono text-xs leading-relaxed"
                                    placeholder='brand,modelName,cpu,ram,storage\nApple,MacBook Air,M3,16GB,512GB'
                                    value={importData}
                                    onChange={(e) => {
                                        setImportData(e.target.value);
                                        tryParseImport(e.target.value);
                                    }}
                                />
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">או העלה קובץ</label>
                                        <Input 
                                            type="file" 
                                            accept=".csv,.json,.txt"
                                            onChange={handleFileUpload}
                                            className="bg-white/5 border-white/10 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Column */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-300 flex justify-between">
                                    תצוגה מקדימה
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                        {importPreview.length} רשומות זוהו
                                    </Badge>
                                </label>
                                <div className="h-64 overflow-y-auto bg-black/20 border border-white/5 rounded-xl p-4 space-y-2">
                                    {importPreview.length > 0 ? (
                                        importPreview.slice(0, 20).map((p, i) => (
                                            <div key={i} className="text-[10px] p-2 bg-white/5 rounded border border-white/5 flex justify-between">
                                                <span className="font-bold text-slate-300">
                                                    {p.brand || Object.values(p)[0] || ""} {p.modelName || Object.values(p)[2] || ""}
                                                </span>
                                                <span className="text-slate-500">
                                                    {Array.isArray(p.cpu) ? p.cpu[0] : (p.cpu || Object.values(p)[5] || "")}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic">
                                            הזן נתונים כדי לראות תצוגה מקדימה
                                        </div>
                                    )}
                                    {importPreview.length > 20 && (
                                        <div className="text-center text-[10px] text-slate-600 py-2">
                                            ומעוד {importPreview.length - 20} רשומות...
                                        </div>
                                    )}
                                </div>

                                {importResult && (
                                    <div className="p-4 bg-slate-800/60 border border-white/10 rounded-xl space-y-2">
                                        <h5 className="text-xs font-black text-white mb-2 flex items-center gap-2">
                                            {importResult.added > 0 ? "✅ תוצאות הייבוא" : "⚠️ הייבוא הסתיים, לא נוספו רשומות חדשות"}
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="flex justify-between px-2 py-1 bg-white/5 rounded-lg">
                                                <span className="text-slate-400">בקובץ:</span>
                                                <b className="text-white">{importResult.total}</b>
                                            </div>
                                            <div className="flex justify-between px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                                                <span className="text-slate-400">נוספו:</span>
                                                <b className="text-red-400">+{importResult.added}</b>
                                            </div>
                                            <div className="flex justify-between px-2 py-1 bg-orange-500/10 rounded-lg">
                                                <span className="text-slate-400">כפולים בקובץ:</span>
                                                <b className="text-orange-400">{importResult.duplicatesInFile}</b>
                                            </div>
                                            <div className="flex justify-between px-2 py-1 bg-amber-500/10 rounded-lg">
                                                <span className="text-slate-400">קיימים ב-DB:</span>
                                                <b className="text-amber-400">{importResult.skipped}</b>
                                            </div>
                                            {importResult.errors.length > 0 && (
                                                <div className="col-span-2 flex justify-between px-2 py-1 bg-red-900/20 rounded-lg border border-red-800/20">
                                                    <span className="text-slate-400">שגיאות:</span>
                                                    <b className="text-red-500">{importResult.errors.length}</b>
                                                </div>
                                            )}
                                            {importResult.newTotal && (
                                                <div className="col-span-2 flex justify-between px-2 py-1 bg-white/5 rounded-lg">
                                                    <span className="text-slate-400">סה"כ במאגר עכשיו:</span>
                                                    <b className="text-white">{importResult.newTotal.toLocaleString()}</b>
                                                </div>
                                            )}
                                        </div>
                                        {importResult.errors.length > 0 && (
                                            <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                                                {importResult.errors.slice(0, 5).map((err, i) => (
                                                    <div key={i} className="text-[10px] font-mono text-red-400 bg-red-950/30 px-2 py-1 rounded">{err}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 p-6 border-t border-white/5">
                        <div className="flex-1 space-x-2 space-x-reverse flex">
                            <Button 
                                variant="outline" 
                                onClick={() => setImportModalOpen(false)}
                                className="bg-white/5 border-white/10"
                            >
                                ביטול
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => importType && downloadTemplate(importType)}
                                className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
                            >
                                <Download size={14} className="ml-2" />
                                הורד תבנית
                            </Button>
                        </div>
                        {importResult ? (
                            <Button 
                                onClick={() => {
                                    setImportModalOpen(false);
                                    setImportResult(null);
                                    setImportData("");
                                    fetchStats();
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-bold"
                            >
                                <Check size={14} className="ml-2" />
                                סגור וסיים
                            </Button>
                        ) : (
                            <Button 
                                onClick={executeImport}
                                disabled={importPreview.length === 0 || importLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold"
                            >
                                {importLoading ? <Loader2 className="animate-spin ml-2" /> : <Package className="ml-2" />}
                                בצע ייבוא רשומות
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Recent Activity Log */}
            <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-700 group-hover:bg-indigo-500/20" />
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">פעולות אחרונות במאגר</h2>
                        <p className="text-xs text-slate-500">מעקב אחר ייבוא נתונים ושינויי קטלוג</p>
                    </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                    {recentLogs.length > 0 ? (
                        (() => {
                            // Group logs by day to handle colors
                            const groupedByDay: Record<string, any[]> = {};
                            recentLogs.forEach(log => {
                                const dayKey = new Date(log.createdAt).toLocaleDateString();
                                if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
                                groupedByDay[dayKey].push(log);
                            });

                            // Predefined premium colors for multiple updates same day
                            const dailyColors = [
                                "border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
                                "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
                                "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
                                "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
                                "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
                                "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            ];

                            return recentLogs.map((log: any) => {
                                const date = new Date(log.createdAt);
                                const dayKey = date.toLocaleDateString();
                                const logsThatDay = groupedByDay[dayKey] || [];
                                // Determine index of this log within its day group (youngest first)
                                const logDayIndex = logsThatDay.findIndex(l => l.id === log.id);
                                const colorClass = logsThatDay.length > 1 ? dailyColors[logDayIndex % dailyColors.length] : "border-white/5";
                                
                                const isNew = (new Date().getTime() - date.getTime()) < 1000 * 60 * 60 * 24;
                                
                                return (
                                    <div key={log.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-2xl border ${colorClass} hover:bg-white/[0.08] transition-all group/item mb-4`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${log.added > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                <Database className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-200 flex items-center gap-2">
                                                    ייבוא <span className="text-white font-black capitalize px-2 py-0.5 bg-white/5 rounded-md border border-white/10">{log.category}</span>
                                                    {isNew && <Badge className="bg-red-500/10 text-red-500 border-none text-[10px] py-0 h-4 px-1.5 animate-pulse">עדכון אחרון</Badge>}
                                                </div>
                                                <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-1 font-medium">
                                                    <span className="flex items-center gap-1 font-bold text-slate-300"><User size={12} className="text-indigo-400" /> {log.adminName || "מנהל מערכת"}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {date.toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                                            <div className="flex gap-2">
                                                {log.added > 0 && (
                                                    <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[11px] font-black text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                                        +{log.added} מוצרים חדשים (סנכרון מלא) ⚡
                                                    </div>
                                                )}
                                                {log.skipped > 0 && (
                                                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] font-bold text-amber-400">
                                                        {log.skipped} כפילויות שסוננו
                                                    </div>
                                                )}
                                                {log.errors > 0 && (
                                                    <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[11px] font-bold text-red-400">
                                                        {log.errors} שגיאות בקובץ
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Database className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-20" />
                            <p className="text-slate-500 text-sm">לא נמצאו פעולות ייבוא אחרונות במערכת.</p>
                        </div>
                    )}
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

            {/* Catalog Manager Modal */}
            <CatalogManagerModal
                type={managerType}
                title={managerTitle}
                open={managerOpen}
                onClose={() => { setManagerOpen(false); fetchStats(); }}
            />
        </div>
    );
}
