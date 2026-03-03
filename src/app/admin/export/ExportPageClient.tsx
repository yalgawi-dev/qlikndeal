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
    exportMotherboardsToCSV
} from "../export-actions";
import { toast } from "sonner";

export default function ExportPageClient() {
    const [loading, setLoading] = useState<string | null>(null);

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
            } else if (type === "laptop" || type === "desktop") {
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
                    <h2 className="text-xl font-semibold mb-2">מחשבים ניידים</h2>
                    <p className="text-sm text-slate-500 mb-6">רשימת מותגים, סדרות ומפרטים</p>
                    <Button 
                        onClick={() => handleExport("laptop")} 
                        disabled={!!loading}
                        className="w-full flex items-center gap-2"
                    >
                        {loading === "laptop" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לאקסל
                    </Button>
                </div>

                {/* Desktops */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all border-green-200">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
                        <Monitor size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">מחשבים נייחים</h2>
                    <p className="text-sm text-slate-500 mb-6">מחשבי מותג ו-All-in-One</p>
                    <Button 
                        onClick={() => handleExport("desktop")} 
                        disabled={!!loading}
                        variant="secondary"
                        className="w-full flex items-center gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                        {loading === "desktop" ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
                        ייצוא לאקסל
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

                {/* Vehicles */}
                <div className="bg-white p-6 rounded-2xl border-2 border-red-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 text-red-600">
                        <Car size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-red-700">רכבים - בדיקה</h2>
                    <p className="text-sm text-slate-500 mb-6">בדוק אם נתונים השתרבבו לכאן בטעות</p>
                    <Button 
                        onClick={() => handleExport("vehicle")} 
                        disabled={!!loading}
                        variant="default"
                        className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                        {loading === "vehicle" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לבדיקה
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
        </div>
    );
}
