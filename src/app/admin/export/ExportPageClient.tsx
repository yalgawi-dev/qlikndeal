"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Laptop, Monitor, Tablet, Download, FileSpreadsheet, Loader2, Car, Settings, Tv, Package, Cpu } from "lucide-react";
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
    syncAio
} from "../export-actions";
import { toast } from "sonner";

export default function ExportPageClient() {
    const [loading, setLoading] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);

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

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">ייצוא מאגרי נתונים (V2.7)</h1>
                <p className="text-slate-500">הורד את רשימות המכשירים והמוצרים המלאות לקובץ אקסל (XLS) לצורך בקרה</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Laptops */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                        <Laptop size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">מחשבים ניידים בלבד</h2>
                    <p className="text-sm text-slate-500 mb-6">ייצוא מאגר מחשבים ניידים (Laptops) מעודכן</p>
                    <Button 
                        onClick={() => handleExport("laptop")} 
                        disabled={!!loading}
                        className="w-full flex items-center gap-2"
                    >
                        {loading === "laptop" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא מחשבים ניידים
                    </Button>
                </div>

                {/* Brand Desktops */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all border-green-200">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
                        <Monitor size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">מחשבי מותג</h2>
                    <p className="text-sm text-slate-500 mb-6">Dell Optiplex, HP EliteDesk וכו'</p>
                    <Button 
                        onClick={() => handleExport("desktop")} 
                        disabled={!!loading}
                        variant="secondary"
                        className="w-full flex items-center gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                        {loading === "desktop" ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                        ייצוא מחשבי מותג
                    </Button>
                </div>

                {/* All-in-One */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all border-cyan-200">
                    <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 text-cyan-600">
                        <Monitor size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">All-in-One (AIO)</h2>
                    <p className="text-sm text-slate-500 mb-6">iMac, HP Pavilion AIO, Yoga AIO</p>
                    <Button 
                        onClick={() => handleExport("aio")} 
                        disabled={!!loading}
                        variant="secondary"
                        className="w-full flex items-center gap-2 border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                    >
                        {loading === "aio" ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                        ייצוא AIO
                    </Button>
                </div>

                {/* Custom Builds */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all border-orange-200">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 text-orange-600">
                        <Settings size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">מפרטי מחשב (AI)</h2>
                    <p className="text-sm text-slate-500 mb-6">קטגוריות של מחשבים בהרכבה אישית</p>
                    <Button 
                        onClick={() => handleExport("custom")} 
                        disabled={!!loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 flex items-center gap-2 text-white"
                    >
                        {loading === "custom" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לאקסל
                    </Button>
                </div>

                {/* Phones */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                        <Tablet size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">סלולריים</h2>
                    <p className="text-sm text-slate-500 mb-6">סמסונג, אפל, שיאומי וגוגל</p>
                    <Button 
                        onClick={() => handleExport("phone")} 
                        disabled={!!loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2 text-white"
                    >
                        {loading === "phone" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לאקסל
                    </Button>
                </div>



                {/* Electronics */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 text-cyan-600">
                        <Tv size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">אלקטרוניקה</h2>
                    <p className="text-sm text-slate-500 mb-6">טלוויזיות, שעונים, אוזניות ועוד</p>
                    <Button 
                        onClick={() => handleExport("electronics")} 
                        disabled={!!loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2 text-white"
                    >
                        {loading === "electronics" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לאקסל
                    </Button>
                </div>

                {/* Appliances */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                        <Package size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">מוצרי חשמל</h2>
                    <p className="text-sm text-slate-500 mb-6">מקררים, מכונות כביסה, מזגנים</p>
                    <Button 
                        onClick={() => handleExport("appliance")} 
                        disabled={!!loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-white"
                    >
                        {loading === "appliance" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לאקסל
                    </Button>
                </div>

                {/* Motherboards */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 text-slate-600">
                        <Cpu size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">לוחות אם</h2>
                    <p className="text-sm text-slate-500 mb-6">מאגר לוחות אם (PC)</p>
                    <Button 
                        onClick={() => handleExport("motherboard")} 
                        disabled={!!loading}
                        className="w-full bg-slate-800 hover:bg-slate-900 flex items-center gap-2 text-white"
                    >
                        {loading === "motherboard" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לאקסל
                    </Button>
                </div>
            </div>

            {/* Database Sync Section */}
            <div className="mt-12 bg-slate-900 rounded-3xl p-8 border border-slate-800 text-right" dir="rtl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">תחזוקת מסד נתונים (סינכרון)</h2>
                        <p className="text-slate-400">בצע "איפוס וסינכרון" כדי לוודא שכל הקטגוריות מעודכנות ומסודרות לפי הקוד</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sync Brand Desktops */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-semibold text-white mb-2">סינכרון מחשבים נייחים</h3>
                        <p className="text-xs text-slate-400 mb-4">עדכון מאגר המחשבים הנייחים (Brand Desktops) לפי רשימות המותג.</p>
                        <Button 
                            onClick={() => handleSync("desktop")} 
                            disabled={!!syncing}
                            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            {syncing === "desktop" ? <Loader2 className="animate-spin" size={16} /> : <Monitor size={16} />}
                            סינכרון מחשבי מותג
                        </Button>
                    </div>

                    {/* Sync AIO */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-semibold text-white mb-2">סינכרון All-in-One</h3>
                        <p className="text-xs text-slate-400 mb-4">עדכון מאגר ה-All-in-One (iMac, HP AIO) עם נתוני מסך וחומרה.</p>
                        <Button 
                            onClick={() => handleSync("aio")} 
                            disabled={!!syncing}
                            className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700"
                        >
                            {syncing === "aio" ? <Loader2 className="animate-spin" size={16} /> : <Laptop size={16} />}
                            סינכרון AIO
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {/* Sync Electronics */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-semibold text-white mb-2">סינכרון אלקטרוניקה וחשמל</h3>
                        <p className="text-xs text-slate-400 mb-4">עדכון מאגרי ה-TV, שעונים, מקררים ומכונות כביסה.</p>
                        <Button 
                            onClick={() => handleSync("electronics")} 
                            disabled={!!syncing}
                            className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                        >
                            {syncing === "electronics" ? <Loader2 className="animate-spin" size={16} /> : <Settings size={16} />}
                            סינכרון אלקטרוניקה
                        </Button>
                    </div>

                    {/* Sync Motherboards */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-semibold text-white mb-2">סינכרון לוחות אם</h3>
                        <p className="text-xs text-slate-400 mb-4">עדכון מאגר לוחות האם (Chipsets, Sockets) למניעת טעויות.</p>
                        <Button 
                            onClick={() => handleSync("motherboard")} 
                            disabled={!!syncing}
                            className="w-full gap-2 bg-slate-700 hover:bg-slate-600"
                        >
                            {syncing === "motherboard" ? <Loader2 className="animate-spin" size={16} /> : <Cpu size={16} />}
                            סינכרון לוחות אם
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
