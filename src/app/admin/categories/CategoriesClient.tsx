"use client";

import { useState } from "react";
import { addDynamicCategory } from "@/app/actions/category";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, X, BrainCircuit, Table, Tag } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesClient({ initialData }: { initialData: any[] }) {
    const [categories, setCategories] = useState(initialData);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [form, setForm] = useState({
        code: "",
        nameHebrew: "",
        prismaModel: "electronicsCatalog",
        nlpKeywords: "",
        regex: "",
        learnFields: "",
        uniqueKeys: ""
    });

    const handleSave = async () => {
        if (!form.code || !form.nameHebrew) return toast.error("קוד ושם חובה");
        
        setIsLoading(true);
        try {
            const res = await addDynamicCategory({
                code: form.code,
                nameHebrew: form.nameHebrew,
                prismaModel: form.prismaModel,
                nlpKeywords: form.nlpKeywords.split(",").map(s => s.trim()).filter(Boolean),
                regex: form.regex,
                learnFields: form.learnFields.split(",").map(s => s.trim()).filter(Boolean),
                uniqueKeys: form.uniqueKeys.split(",").map(s => s.trim()).filter(Boolean)
            });
            
            if (res.success) {
                toast.success("קטגוריה נוספה בהצלחה ללמידה!");
                setIsAdding(false);
                setCategories([...categories, res.data]);
                setForm({
                    code: "", nameHebrew: "", prismaModel: "electronicsCatalog",
                    nlpKeywords: "", regex: "", learnFields: "", uniqueKeys: ""
                });
            } else {
                toast.error(res.error || "שגיאה בשמירה");
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-lg shadow-xl shadow-purple-900/20 border border-purple-500/30">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="text-purple-400" />
                    <span className="font-semibold text-lg">סוכן למידה עצמאי</span>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="ml-2 w-4 h-4" /> הוסף קטגוריית AI
                </Button>
            </div>

            {isAdding && (
                <Card className="border-purple-300 shadow-lg animate-in slide-in-from-top-4">
                    <CardHeader className="bg-purple-50/50 flex flex-row justify-between items-center">
                        <CardTitle className="text-purple-900">יצירת לוגיקת קטגוריה חדשה</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}><X className="w-4 h-4" /></Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">קוד קטגוריה (אנגלית, למשל DRONES)</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">שם תצוגה עברי (למשל: רחפנים)</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.nameHebrew} onChange={e => setForm({...form, nameHebrew: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">מודל DB (שם טבלה - למשל electronicsCatalog)</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.prismaModel} onChange={e => setForm({...form, prismaModel: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">RegEx לזיהוי טקסט AI (למשל רחפן|dji)</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.regex} onChange={e => setForm({...form, regex: e.target.value})} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-semibold">מילות מפתח לניתוב (מופרדות בפסיק)</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="drone, drones, רחפן" value={form.nlpKeywords} onChange={e => setForm({...form, nlpKeywords: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">שדות ללמידת AI (AI Extraction Fields)</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="brand, modelName, battery" value={form.learnFields} onChange={e => setForm({...form, learnFields: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">מפתחות מניעת כפילות (Unique Keys)</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="brand, modelName" value={form.uniqueKeys} onChange={e => setForm({...form, uniqueKeys: e.target.value})} />
                        </div>
                        <Button className="col-span-2 mt-4" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "שומר..." : "שמור והפעל למידה אוטומטית למרקטפלייס"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat: any) => (
                    <Card key={cat.code} className="hover:shadow-lg transition-shadow border-t-4 border-t-purple-500 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex justify-between items-center">
                                <span>{cat.nameHebrew || cat.code}</span>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-mono">{cat.code}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3 mt-4 text-gray-600">
                            <div className="flex items-start gap-2 border-b pb-2">
                                <Table className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                <div><span className="font-semibold text-gray-900 block">טבלת Database:</span> <span className="font-mono text-xs">{cat.prismaModel}</span></div>
                            </div>
                            <div className="flex items-start gap-2 border-b pb-2">
                                <BrainCircuit className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-semibold text-gray-900 block">שדות הנלמדים אוטומטית החל מהיום:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {cat.learnFields?.map((f: string) => <span key={f} className="bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{f}</span>)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 pt-1">
                                <Tag className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                <div className="truncate w-full">
                                    <span className="font-semibold text-gray-900 block mb-1">ניתוב מילות מפתח (NLP):</span>
                                    <p className="text-xs max-w-[200px] truncate text-gray-500" title={cat.nlpKeywords?.join(', ')}>
                                        {cat.nlpKeywords?.length ? cat.nlpKeywords.join(', ') : cat.regex?.toString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
