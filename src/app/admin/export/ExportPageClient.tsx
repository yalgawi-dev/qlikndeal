"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Laptop, Monitor, Tablet, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { exportComputersToCSV, exportPhonesToCSV } from "../export-actions";
import { toast } from "sonner";

export default function ExportPageClient() {
    const [loading, setLoading] = useState<string | null>(null);

    const downloadFile = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async (type: "laptop" | "desktop" | "phone") => {
        setLoading(type);
        try {
            let content = "";
            let fileName = "";

            if (type === "phone") {
                content = await exportPhonesToCSV();
                fileName = `phone_database_${new Date().toLocaleDateString()}.csv`;
            } else {
                content = await exportComputersToCSV(type);
                fileName = `${type}_database_${new Date().toLocaleDateString()}.csv`;
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
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">ייצוא מאגרי נתונים</h1>
                <p className="text-slate-500">הורד את רשימות המכשירים המלאות לקובץ אקסל (CSV)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Laptops */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                        <Laptop size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">מחשבים ניידים</h2>
                    <p className="text-sm text-slate-500 mb-6">רשימת מותגים, סדרות ומפרטים של מחשבים ניידים</p>
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
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
                        <Monitor size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">מחשבים נייחים</h2>
                    <p className="text-sm text-slate-500 mb-6">מחשבי מותג (AIO) ומפרטי בנייה עצמית לנייחים</p>
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

                {/* Phones */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                        <Tablet size={28} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">טלפונים סלולריים</h2>
                    <p className="text-sm text-slate-500 mb-6">רשימת דגמי סמסונג, אפל, שיאומי וגוגל פיקסל</p>
                    <Button 
                        onClick={() => handleExport("phone")} 
                        disabled={!!loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2 text-white"
                    >
                        {loading === "phone" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        ייצוא לאקסל
                    </Button>
                </div>
            </div>
        </div>
    );
}
