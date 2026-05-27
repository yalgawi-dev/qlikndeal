"use client";

import { useState, useEffect, useMemo } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createListing, updateListing, getMyPhone } from "@/app/actions/marketplace";
import { Loader2, X, Plus, Image as ImageIcon, Video, AlertCircle, Check, Smartphone, Cpu, MemoryStick, HardDrive, Maximize2, Monitor } from "lucide-react";
import { ComputerSearchUI } from "@/components/marketplace/ComputerSearchUI";
import { SmartAiInput } from "./SmartAiInput";

// --- Types ---
interface ComputerSpec {
    brand: string; family: string; subModel: string; ram: string; storage: string;
    screen: string; cpu: string; gpu: string; os: string; condition: string;
    extras: string; sku: string; battery: string; batteryHealth: string;
    batteryPercent: string; ports: string; weight: string; release_year: string;
    refreshRate: string;    // תדר רענון מסך (Hz)
    extraStorage: string;   // אחסון נוסף (SSD דיסק שני / HDD)
    resolutionType: string; // FHD / QHD / 4K
}

// שדות מובנים למצב וליציאות
const COMPUTER_CONDITIONS = ["חדש", "כמו חדש", "משומש - מצב מצוין", "משומש - מצב טוב", "משומש - מצב בינוני", "לחלקים / לא עובד"];
const PORT_OPTIONS = ["HDMI 2.1", "Thunderbolt 3", "Thunderbolt 4", "USB-C 3.2", "USB-A 3.2", "SD Card", "Mini DisplayPort", "DisplayPort", "HDMI 1.4", "HDMI 2.0", "VGA", "Audio 3.5mm", "Ethernet (RJ-45)"];

export function ComputerListingForm({ onComplete, initialData, isEditing, listingId, preSelectedCategory }: any) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uncertainFields, setUncertainFields] = useState<string[]>([]);
    const [customFields, setCustomFields] = useState<{ id: string, key: string, value: string }[]>([]);
    const [isSimulation, setIsSimulation] = useState(false);

    // ✨ שאיבת תשתית חיה ממסד הנתונים! (Data-Driven Forms)
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    const [isLoadingStructure, setIsLoadingStructure] = useState(true);

    useEffect(() => {
        async function loadStructure() {
            try {
                // נשלוף את השלד למחשבים ניידים!
                const res = await fetch("/api/marketplace/form-structure?category=LAPTOPS");
                if (res.ok) {
                    const data = await res.json();
                    if (data.options) {
                        setDynamicOptions(data.options);
                    }
                }
            } catch(e) { console.error("Failed to load generic form options from DB", e); }
            setIsLoadingStructure(false);
        }
        loadStructure();
    }, []);

    // שליפת נתונים קיימים (במצב עריכה)
    const extraDataObj = useMemo(() => {
        const raw = initialData?.extraData;
        if (!raw) return {};
        if (Array.isArray(raw)) {
            const obj: any = {};
            raw.forEach((item: any) => { if (item?.key) obj[item.key] = item?.value || ""; });
            return obj;
        }
        return raw;
    }, [initialData]);

    const [spec, setSpec] = useState<ComputerSpec>({
        brand: extraDataObj["brand"] || extraDataObj["יצרן"] || "",
        family: extraDataObj["family"] || extraDataObj["סדרה"] || "",
        subModel: extraDataObj["subModel"] || extraDataObj["דגם"] || "",
        ram: extraDataObj["ram"] || extraDataObj["RAM"] || "",
        storage: extraDataObj["storage"] || extraDataObj["נפח אחסון"] || "",
        screen: extraDataObj["screen"] || extraDataObj["גודל מסך"] || "",
        cpu: extraDataObj["cpu"] || extraDataObj["מעבד"] || "",
        gpu: extraDataObj["gpu"] || extraDataObj["כרטיס מסך"] || "",
        os: extraDataObj["os"] || extraDataObj["מערכת הפעלה"] || "",
        condition: initialData?.condition || extraDataObj["condition"] || extraDataObj["מצב"] || "",
        extras: extraDataObj["extras"] || extraDataObj["החרגות"] || "",
        sku: extraDataObj["sku"] || extraDataObj["SKU"] || "",
        battery: extraDataObj["battery"] || extraDataObj["סוללה"] || "",
        batteryHealth: extraDataObj["batteryHealth"] || extraDataObj["תקינות סוללה"] || "תקינה",
        batteryPercent: extraDataObj["batteryPercent"] || extraDataObj["אחוזי סוללה"] || "100",
        ports: extraDataObj["ports"] || extraDataObj["חיבורים"] || "",
        weight: extraDataObj["weight"] || extraDataObj["משקל"] || "",
        release_year: extraDataObj["release_year"] || extraDataObj["שנת ייצור"] || "",
        // שדות חדשים
        refreshRate: extraDataObj["refreshRate"] || extraDataObj["תדר רענון"] || "",
        extraStorage: extraDataObj["extraStorage"] || extraDataObj["אחסון נוסף"] || "",
        resolutionType: extraDataObj["resolutionType"] || extraDataObj["סוג רזולוציה"] || "",
    });

    const [selectedPorts, setSelectedPorts] = useState<string[]>(spec.ports ? spec.ports.split(", ") : []);
    const [mainCategory, setMainCategory] = useState<"laptop" | "desktop" | "aio" | "custom" | null>(preSelectedCategory || "laptop");
    const [dynamicFields, setDynamicFields] = useState<{ key: string, value: string }[]>([]); // ✨ שדות דינמיים!
    const [details, setDetails] = useState({
        title: initialData?.title || "", price: initialData?.price?.toString() || "",
        description: initialData?.description || "", contactPhone: initialData?.contactPhone || "",
        images: initialData?.images || [], videos: initialData?.videos || []
    });

    useEffect(() => {
        if (!details.contactPhone) getMyPhone().then(res => { if (res.phone) setDetails(p => ({ ...p, contactPhone: res.phone })); });
    }, [details.contactPhone]);

    // סנכרון מערך החיבורים ל-spec.ports
    useEffect(() => {
        setSpec(prev => ({ ...prev, ports: selectedPorts.join(", ") }));
    }, [selectedPorts]);

    // ---- מנגנון מיפוי חכם: AI ל-Dropdown Options ----
    const mapToOption = (aiValue: string, optionsList: string[]) => {
        if (!aiValue) return "";
        const cleanAi = aiValue.toLowerCase().replace(/[^a-z0-9]/gi, '');
        // 1. חיפוש הכלה מדויקת של השם מתוך רשימת ה-Dropdown
        const perfectlyMatched = optionsList.find(opt => {
            const cleanOpt = opt.toLowerCase().replace(/[^a-z0-9]/gi, '');
            return cleanOpt === cleanAi || cleanOpt.includes(cleanAi) || cleanAi.includes(cleanOpt);
        });
        if (perfectlyMatched) return perfectlyMatched;
        
        // 2. חיפוש רופף (למשל "i7" בתוך "Intel Core i7-13700H")
        const looselyMatched = optionsList.find(opt => opt.toLowerCase().includes(aiValue.toLowerCase()));
        if (looselyMatched) return looselyMatched;
        
        return aiValue;
    };

    // ---- לוגיקת AI דינמית ---
    const applyAiData = (ai: any) => {
        const data = ai.result || ai;
        
        setSpec(prev => ({
            ...prev,
            cpu: mapToOption(data.cpu, dynamicOptions["cpu"] || []),
            ram: mapToOption(data.ram ? String(data.ram) : "", dynamicOptions["ram"] || []),
            storage: mapToOption(data.storage ? String(data.storage) : "", dynamicOptions["storage"] || []),
            brand: data.brand || prev.brand,
            subModel: data.modelName || data.subModel || data.model || prev.subModel,
            os: mapToOption(data.os, dynamicOptions["os"] || []),
            family: data.family || prev.family,
            condition: mapToOption(data.condition, COMPUTER_CONDITIONS),
            batteryPercent: data.batteryPercent || prev.batteryPercent,
            batteryHealth: data.batteryHealth || prev.batteryHealth,
            gpu: mapToOption(data.gpu, dynamicOptions["gpu"] || []),
            screen: mapToOption(data.screenSize || data.screen, dynamicOptions["screen"] || []),
            // שדות חדשים
            refreshRate: data.refreshRate || prev.refreshRate,
            extraStorage: data.extraStorage || prev.extraStorage,
            resolutionType: data.resolutionType || prev.resolutionType,
        }));

        setDetails(prev => ({
            ...prev,
            title: data.title || "",
            price: data.price ? String(data.price) : "",
            contactPhone: data.contactPhone || prev.contactPhone, // טלפון נשאר אם אין חדש
            description: data.description || ""
        }));

        if (data.suggestions) {
            const suggestFields = data.suggestions.filter((s: any) => s.action === "SUGGEST").map((s: any) => s.field);
            setUncertainFields(prev => [...new Set([...prev, ...suggestFields])]);

            // הזרקת הערכים שחזרו כ"הצעה צהובה" לסטייט השוטף (אחרת השדה יצהיב אבל יישאר ריק/לא ידוע)
            data.suggestions.forEach((s: {field: string, value: string, action: string}) => {
                if (s.action === "SUGGEST") {
                    if (s.field === "storage") setSpec(prev => ({ ...prev, storage: s.value }));
                    else if (s.field === "ram") setSpec(prev => ({ ...prev, ram: s.value }));
                    else if (s.field === "os") setSpec(prev => ({ ...prev, os: s.value }));
                    else if (s.field === "cpu") setSpec(prev => ({ ...prev, cpu: s.value }));
                    else if (s.field === "brand") setSpec(prev => ({ ...prev, brand: s.value }));
                    else if (s.field === "subModel") setSpec(prev => ({ ...prev, subModel: s.value }));
                    else if (s.field === "title") setDetails(prev => ({ ...prev, title: s.value }));
                    else if (s.field === "price") setDetails(prev => ({ ...prev, price: s.value }));
                    else if (s.field === "condition") setSpec(prev => ({ ...prev, condition: s.value }));
                }
            });
        }

        const handledKeys = ["brand", "cpu", "ram", "storage", "subModel", "model", "os", "family", "condition", "batteryPercent", "gpu", "screenSize", "screen", "title", "price", "contactPhone", "description", "suggestions", "success", "category", "isCatalogMatch", "sourceTable", "refreshRate", "extraStorage", "resolutionType"];
        const newDynamics: { key: string, value: string }[] = [];
        
        // חילוץ סעיפים רגילים שחזרו כ-FILL פשוט
        Object.keys(data).forEach(key => {
            if (handledKeys.includes(key)) return;
            const val = data[key];
            if (!val) return;
            const strVal = Array.isArray(val) ? val.join(", ") : String(val);
            newDynamics.push({ key, value: strVal });
        });
        
        // ציד דינמי של שדות חדשים שצדו בצהוב (SUGGEST) אל תוך השדות הכלליים!
        if (data.suggestions) {
            data.suggestions.forEach((s: any) => {
                if (s.action === "SUGGEST" && !handledKeys.includes(s.field)) {
                    // ודא שלא דחפנו כבר מ-FILL
                    if (!newDynamics.find(d => d.key === s.field)) {
                        newDynamics.push({ key: s.field, value: s.value });
                    }
                }
            });
        }

        if (newDynamics.length > 0) {
            setDynamicFields(prev => {
                const merged = [...prev];
                newDynamics.forEach(nw => {
                    const idx = merged.findIndex(e => e.key === nw.key);
                    if (idx > -1) merged[idx].value = nw.value;
                    else merged.push(nw);
                });
                return merged;
            });
            
            // המרה ל-Custom Fields עבור תצוגה
            setCustomFields(newDynamics.map((d, i) => ({ id: `dyn_${Date.now()}_${i}`, key: d.key, value: d.value })));
        }
    };

    const removeUncertain = (field: string) => setUncertainFields(prev => prev.filter(f => f !== field));

    // activeDb and specOptions are no longer directly used for dropdown options,
    // but activeDb might still be relevant for ComputerSearchUI if it needs a specific structure.
    // For now, I'll keep activeDb as it was, assuming ComputerSearchUI might still use it.
    // However, the instruction implies removing the imports, so activeDb will be undefined.
    // I will remove the activeDb and specOptions useMemo.
    // The ComputerSearchUI component will need to be updated to not rely on activeDb directly,
    // or its usage here needs to be re-evaluated. For this change, I'll remove the activeDb definition.
    // The ComputerSearchUI component will likely need to fetch its own data or receive it differently.

    // Removed:
    // const activeDb = mainCategory === "laptop" ? LAPTOP_DATABASE : 
    //                  mainCategory === "aio" ? ALL_IN_ONE_DATABASE : 
    //                  BRAND_DESKTOP_DATABASE;
    // const specOptions = useMemo(() => {
    //     if (spec.brand && spec.family && spec.subModel) return getSpecOptionsForSubModel(spec.brand, spec.family, spec.subModel);
    //     return { ram: RAM_OPTIONS, storage: STORAGE_OPTIONS, screen: SCREEN_SIZE_OPTIONS, cpu: [...CPU_OPTIONS.Intel, ...CPU_OPTIONS.AMD, ...CPU_OPTIONS.Apple], gpu: GPU_OPTIONS, os: OS_OPTIONS };
    // }, [spec.brand, spec.family, spec.subModel]);


    const togglePort = (port: string) => {
        if (selectedPorts.includes(port)) setSelectedPorts(prev => prev.filter(p => p !== port));
        else setSelectedPorts(prev => [...prev, port]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.success) {
                if (type === 'image') setDetails(p => ({ ...p, images: [...p.images, data.url] }));
                else setDetails(p => ({ ...p, videos: [...(p.videos || []), data.url] }));
            }
        } catch { } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // הכנת האובייקט לפי שם בעברית עבור מאגר הנתונים
            const translatedExtraData: any = {
                "יצרן": spec.brand, "סדרה": spec.family, "דגם": spec.subModel,
                "RAM": spec.ram, "מעבד": spec.cpu, "כרטיס מסך": spec.gpu,
                "מערכת הפעלה": spec.os, "נפח אחסון": spec.storage, "גודל מסך": spec.screen,
                "SKU": spec.sku, "סוללה": spec.battery, "תקינות סוללה": spec.batteryHealth,
                "אחוזי סוללה": spec.batteryPercent + "%", "משקל": spec.weight,
                "שנת ייצור": spec.release_year, "חיבורים": spec.ports, "הערות/פגמים": spec.extras,
                // שדות חדשים
                "תדר רענון": spec.refreshRate,
                "אחסון נוסף": spec.extraStorage,
                "סוג רזולוציה": spec.resolutionType,
            };

            // הוספת השדות הדינמיים שהמשתמש אישר/שינה
            dynamicFields.forEach(df => {
                translatedExtraData[df.key] = df.value;
            });
            
            // הוספת השדות הידניים החדשים שהמשתמש יצר בטופס (Dynamic Custom Fields)
            customFields.forEach(cf => {
                if(cf.key.trim() && cf.value.trim()) {
                    translatedExtraData[cf.key.trim()] = cf.value.trim();
                }
            });

            // הפעלת מנגנון הלמידה! שולחים את המידע האנגלי לניהול טבלת ה-AI
            const currentLogId = localStorage.getItem("currentParserLogId");
            if (currentLogId) {
                const reportData: any = {
                    brand: spec.brand, cpu: spec.cpu, ram: spec.ram, storage: spec.storage,
                    subModel: spec.subModel, os: spec.os, family: spec.family, condition: spec.condition,
                    batteryPercent: spec.batteryPercent, gpu: spec.gpu, screen: spec.screen,
                    title: details.title, price: details.price
                };
                
                // צימוד של השדות הדינמיים שהמשתמש הוסיף אל תוך לוג הלמידה!
                customFields.forEach(cf => {
                    if (cf.key.trim() && cf.value.trim()) {
                        reportData[cf.key.trim()] = cf.value.trim();
                    }
                });
                try {
                    await fetch("/api/parser-log", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: currentLogId, userFinal: reportData })
                    });
                } catch (e) { console.error("Learning patch failed", e); }
            }

            if (isSimulation) {
                alert("הדמיית למידה בוצעה בהצלחה! הלמידה עודכנה בבסיס הנתונים ללא פירסום אמיתי במרקטפלייס.");
                setLoading(false);
                onComplete();
                return;
            }

            const payload = {
                ...details,
                price: parseFloat(details.price || "0"),
                condition: spec.condition,
                category: "Computers",
                extraData: translatedExtraData
            };
            const res = isEditing ? await updateListing(listingId, payload) : await createListing(payload);
            if (res.success) onComplete();
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const getFieldDisplay = (val: string) => val ? val : "לא מולא";

    return (
        <div className="flex flex-col h-full bg-[#0a0f1c] rounded-2xl border border-gray-800 shadow-2xl pb-16" dir="rtl">
            <div className="p-4 bg-gradient-to-l from-indigo-900/30 to-slate-900 border-b border-indigo-500/20 text-right">
                <h2 className="text-xl font-black text-indigo-100 flex items-center justify-end gap-2">
                    <Monitor className="text-indigo-400" />
                    פרסם מחשב {mainCategory === 'laptop' ? 'נייד' : mainCategory === 'desktop' ? 'מותג (נייח)' : mainCategory === 'aio' ? 'All-in-One' : 'בהרכבה עצמית'}
                </h2>
            </div>

            <div className="p-4 md:p-6 text-right space-y-8">
                {/* 1. Smart AI + Computer Auto Search */}
                <div className="space-y-4">
                    <SmartAiInput category={
                        mainCategory === "laptop" ? "LAPTOPS" :
                        mainCategory === "aio" ? "AIO" :
                        mainCategory === "custom" ? "CUSTOM_DESKTOPS" :
                        "DESKTOPS"
                    } onResult={applyAiData} />
                    {mainCategory !== "custom" && (
                        <ComputerSearchUI activeDb={null} onApplySpecs={(res: any) => setSpec({ ...spec, ...res })} subCategory={mainCategory || 'laptop'} />
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* 2. זיהוי יצרן (סדרה) */}
                    {mainCategory !== "custom" && (
                        <div className="space-y-4 relative">
                            <SectionTitle title="זיהוי יצרן (סדרה)" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SpecField label="יצרן" val={spec.brand} fn={(v: string) => setSpec({ ...spec, brand: v })} opts={dynamicOptions["brand"] || []} uncert={uncertainFields.includes('brand')} onConf={() => removeUncertain('brand')} />
                                <SpecField label="סדרה (Family)" val={spec.family} fn={(v: string) => setSpec({ ...spec, family: v })} opts={dynamicOptions["family"] || []} uncert={uncertainFields.includes('family')} onConf={() => removeUncertain('family')} />
                                <SpecField label="דגם יצרן / מק״ט" val={spec.subModel} fn={(v: string) => setSpec({ ...spec, subModel: v })} opts={dynamicOptions["subModel"] || []} uncert={uncertainFields.includes('subModel')} onConf={() => removeUncertain('subModel')} />
                            </div>
                        </div>
                    )}

                    {/* 3. מפרט טכני */}
                    <div className="space-y-4 relative">
                        <SectionTitle title="מפרט טכני" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SpecField label="מעבד (CPU)" val={spec.cpu} fn={(v) => setSpec({ ...spec, cpu: v })} opts={dynamicOptions["cpu"] || []} icon={<Cpu size={14} />} uncert={uncertainFields.includes('cpu')} onConf={() => removeUncertain('cpu')} />
                            <SpecField label="זיכרון RAM" val={spec.ram} fn={(v) => setSpec({ ...spec, ram: v })} opts={dynamicOptions["ram"] || []} icon={<MemoryStick size={14} />} uncert={uncertainFields.includes('ram')} onConf={() => removeUncertain('ram')} />
                            <SpecField label="נפח אחסון" val={spec.storage} fn={(v) => setSpec({ ...spec, storage: v })} opts={dynamicOptions["storage"] || []} icon={<HardDrive size={14} />} uncert={uncertainFields.includes('storage')} onConf={() => removeUncertain('storage')} />
                            <SpecField label="מערכת הפעלה" val={spec.os} fn={(v) => setSpec({ ...spec, os: v })} opts={dynamicOptions["os"] || []} icon={<Monitor size={14} />} uncert={uncertainFields.includes('os')} onConf={() => removeUncertain('os')} />
                            <SpecField label="גודל מסך" val={spec.screen} fn={(v) => setSpec({ ...spec, screen: v })} opts={dynamicOptions["screen"] || []} icon={<Maximize2 size={14} />} uncert={uncertainFields.includes('screen')} onConf={() => removeUncertain('screen')} />
                            <SpecField label="כרטיס מסך (GPU)" val={spec.gpu} fn={(v) => setSpec({ ...spec, gpu: v })} opts={dynamicOptions["gpu"] || []} icon={<Cpu size={14} />} uncert={uncertainFields.includes('gpu')} onConf={() => removeUncertain('gpu')} />
                            {/* שדות חדשים */}
                            <SpecField label="תדר רענון (Hz)" val={spec.refreshRate} fn={(v) => setSpec({ ...spec, refreshRate: v })} opts={["60Hz","75Hz","90Hz","120Hz","144Hz","165Hz","180Hz","240Hz","360Hz"]} icon={<Monitor size={14} />} uncert={uncertainFields.includes('refreshRate')} onConf={() => removeUncertain('refreshRate')} />
                            <SpecField label="סוג רזולוציה" val={spec.resolutionType} fn={(v) => setSpec({ ...spec, resolutionType: v })} opts={["HD","FHD","QHD","WQHD","4K UHD","WUXGA","WQXGA"]} icon={<Maximize2 size={14} />} uncert={uncertainFields.includes('resolutionType')} onConf={() => removeUncertain('resolutionType')} />
                            <SpecField label="אחסון נוסף" val={spec.extraStorage} fn={(v) => setSpec({ ...spec, extraStorage: v })} opts={["256GB SSD","512GB SSD","1TB SSD","2TB SSD","500GB HDD","1TB HDD","2TB HDD"]} icon={<HardDrive size={14} />} uncert={uncertainFields.includes('extraStorage')} onConf={() => removeUncertain('extraStorage')} />
                        </div>
                    </div>

                    {/* 4. מפרט יצרן (טקסטואלי) */}
                    <div className="space-y-4">
                        <SectionTitle title="מפרט יצרן (חדש)" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="דגם יצרן / SKU" val={spec.sku} fn={(e) => setSpec({ ...spec, sku: e.target.value })} placeholder="לדוגמה: 82B500M2IV" />
                            <InputField label="סוללה (mA / Wh)" val={spec.battery} fn={(e) => setSpec({ ...spec, battery: e.target.value })} placeholder="לדוגמה: 55Wh, 6500mAh" />
                            <InputField label="משקל" val={spec.weight} fn={(e) => setSpec({ ...spec, weight: e.target.value })} placeholder="לדוגמה: 2.2 ק״ג" />
                            <InputField label="שנת ייצור" val={spec.release_year} fn={(e) => setSpec({ ...spec, release_year: e.target.value })} placeholder="לדוגמה: 2023" />
                        </div>

                        <div className="pt-2">
                            <Label className="text-gray-300 font-bold mb-2 block">חיבורים (Ports) - בחר מה שקיים</Label>
                            <div className="flex flex-wrap gap-2">
                                {PORT_OPTIONS.map(port => (
                                    <button type="button" key={port} onClick={() => togglePort(port)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedPorts.includes(port) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                                        {port}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ✨ שדות דינמיים שה-AI מצא (אם יש) */}
                    {dynamicFields.length > 0 && (
                        <div className="space-y-4 bg-purple-900/10 border border-purple-500/30 p-4 rounded-xl">
                            <SectionTitle title="נתונים נוספים שזוהו אוטומטית (AI)" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dynamicFields.map((field, idx) => (
                                    <div key={idx} className="space-y-1.5 p-2 bg-[#151b2b] rounded-lg border border-purple-500/20">
                                        <Label className="text-purple-300 text-xs font-bold uppercase">{field.key}</Label>
                                        <Input
                                            value={field.value}
                                            onChange={e => {
                                                const newArr = [...dynamicFields];
                                                newArr[idx].value = e.target.value;
                                                setDynamicFields(newArr);
                                            }}
                                            className="bg-[#0a0f1c] border-slate-700 text-white h-10 placeholder:text-slate-600 focus:border-purple-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 5. מצב ושונות */}
                    <div className="space-y-6">
                        <SectionTitle title="מצב המחשב" error={!spec.condition} />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {["חדש", "כמו חדש", "משומש - מצב מצויין", "משומש - מצב טוב", "משומש - מצב בינוני", "לחלקים / לא עובד"].map(cond => (
                                <button type="button" key={cond} onClick={() => setSpec({ ...spec, condition: cond })} className={`py-2 text-xs md:text-sm rounded-lg border transition-all ${spec.condition === cond ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-[#151b2b] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                    {cond}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#151b2b] p-4 rounded-xl border border-slate-800">
                            <div>
                                <Label className="text-gray-300 font-bold block mb-3">🛠️ תקינות סוללה</Label>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setSpec({ ...spec, batteryHealth: "תקינה" })} className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${spec.batteryHealth === "תקינה" ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>תקינה ✓</button>
                                    <button type="button" onClick={() => setSpec({ ...spec, batteryHealth: "לא תקינה" })} className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${spec.batteryHealth === "לא תקינה" ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>לא תקינה ✗</button>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-300 font-bold block mb-3">בריאות סוללה (%)</Label>
                                <div className="flex items-center">
                                    <Input type="number" value={spec.batteryPercent} onChange={e => setSpec({ ...spec, batteryPercent: e.target.value })} className="bg-[#0a0f1c] border-slate-700 text-center text-white" />
                                    <span className="mr-2 text-slate-500">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#151b2b] p-4 rounded-xl border border-slate-800">
                            <Label className="text-yellow-500 font-bold flex items-center gap-1 mb-2 text-xs"><AlertCircle size={14} /> הערות / פגמים פיזיים</Label>
                            <InputField label="הערות / פגמים פיזיים" val={spec.extras} fn={(e) => setSpec({ ...spec, extras: e.target.value })} placeholder="למשל: סוללה חלשה, בקע קטן בפלסטיק... (השאר ריק אם הכל תקין)" />
                        </div>
                    </div>

                    {/* 6. פרטי העסקה */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 p-5 rounded-xl border border-blue-500/20">
                        <div className="md:col-span-2">
                            <InputField 
                                label="כותרת למודעה *" 
                                val={details.title} 
                                fn={(e) => setDetails({ ...details, title: e.target.value })} 
                                placeholder="לדוגמה: מחשב נייד מצוין לסטודנטים" 
                                uncert={uncertainFields.includes('title')} 
                                onConf={() => removeUncertain('title')} 
                            />
                        </div>
                        <InputField label="טלפון ליצירת קשר *" val={details.contactPhone} fn={(e) => setDetails({ ...details, contactPhone: e.target.value })} />
                        <InputField 
                            label="מחיר מבוקש (₪) *" 
                            val={details.price} 
                            fn={(e) => setDetails({ ...details, price: e.target.value })} 
                            uncert={uncertainFields.includes('price')} 
                            onConf={() => removeUncertain('price')} 
                        />
                    </div>

                    {/* 7. שדות בהתאמה אישית (Dynamic Custom Fields) */}
                    <div className="space-y-4">
                        <SectionTitle title="נתונים נוספים (הזנה חופשית)" />
                        <div className="bg-[#101520] border border-dashed border-slate-700 p-4 rounded-xl space-y-4">
                            {customFields.length === 0 && (
                                <p className="text-slate-500 text-sm text-center">אין נתונים נוספים. לחץ על הכפתור כדי להוסיף שדה חדש באופן עצמאי.</p>
                            )}
                            {customFields.map((cf) => (
                                <div key={cf.id} className={`flex flex-col md:flex-row items-center gap-2 p-2 rounded-xl border transition-all ${uncertainFields.includes(cf.key) ? 'bg-yellow-500/10 border-yellow-500/40 relative pb-10' : 'border-transparent'}`}>
                                    <div className="flex-1 w-full relative">
                                        <Input value={cf.key} onChange={(e) => setCustomFields(prev => prev.map(p => p.id === cf.id ? { ...p, key: e.target.value } : p))} placeholder="שם השדה (לדוגמה: תדר מסך)" className={`bg-[#151b2b] text-white h-10 md:h-9 text-sm pr-9 ${uncertainFields.includes(cf.key) ? 'border-yellow-500/50' : 'border-slate-700'}`} />
                                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] ${uncertainFields.includes(cf.key) ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>שם:</span>
                                    </div>
                                    <div className="flex-[2] w-full relative">
                                        <Input value={cf.value} onChange={(e) => setCustomFields(prev => prev.map(p => p.id === cf.id ? { ...p, value: e.target.value } : p))} placeholder="ערך (לדוגמה: 240Hz)" className={`bg-[#151b2b] text-white h-10 md:h-9 text-sm pr-9 ${uncertainFields.includes(cf.key) ? 'border-yellow-500/50' : 'border-slate-700'}`} />
                                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] ${uncertainFields.includes(cf.key) ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>ערך:</span>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setCustomFields(prev => prev.filter(p => p.id !== cf.id))} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-10 md:w-9 h-10 md:h-9 shrink-0">
                                        <X size={16} />
                                    </Button>
                                    
                                    {uncertainFields.includes(cf.key) && (
                                        <button type="button" onClick={() => removeUncertain(cf.key)} className="absolute bottom-1 right-2 left-2 text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 rounded transition-colors flex items-center justify-center gap-1">
                                            <Check className="w-3 h-3" /> אשר שדה חדש
                                        </button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => setCustomFields(prev => [...prev, { id: Date.now().toString(), key: '', value: '' }])} className="w-full border-dashed border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300 shadow-none text-sm h-10">
                                <Plus size={16} className="mr-2" /> הוסף נתון ייחודי למפרט
                            </Button>
                        </div>
                    </div>

                    {/* 8. תיאור חופשי */}
                    <div className="space-y-2">
                        <Label className="text-gray-300 font-bold">טקסט חופשי למודעה (תיאור)</Label>
                        <Textarea value={details.description} onChange={e => setDetails({ ...details, description: e.target.value })} placeholder="כתוב כאן כל מה שצריך מסביב: סיבות מכירה, תוספות מצורפות..." className="min-h-[100px] bg-[#151b2b] border-slate-700 text-white resize-none" />
                    </div>

                    {/* 9. העלאת מדיה */}
                    <div className="space-y-4">
                        <SectionTitle title="תמונות וסרטון" />
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-500/30 rounded-xl bg-indigo-500/5 cursor-pointer hover:bg-indigo-500/10 transition-colors">
                                {uploading ? <Loader2 className="animate-spin text-indigo-400 mb-2" /> : <ImageIcon className="w-8 h-8 text-indigo-400 mb-2" />}
                                <span className="font-bold text-indigo-300 text-sm">העלאת תמונה</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} />
                            </label>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-500/30 rounded-xl bg-purple-500/5 cursor-pointer hover:bg-purple-500/10 transition-colors">
                                {uploading ? <Loader2 className="animate-spin text-purple-400 mb-2" /> : <Video className="w-8 h-8 text-purple-400 mb-2" />}
                                <span className="font-bold text-purple-300 text-sm">העלאת סרטון</span>
                                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
                            </label>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {details.images.map((img, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                                    <img src={img} className="object-cover w-full h-full" alt="" />
                                    <button type="button" onClick={() => setDetails(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500/80 rounded-full p-1"><X className="w-3 h-3 text-white" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 9. דו"ח סיכום נתונים (Custom Dashboard Summary Box) */}
                    <div className="bg-[#110505] border border-red-900/50 rounded-2xl overflow-hidden mt-8 shadow-xl">
                        <div className="bg-gradient-to-l from-red-950/80 to-black p-3 text-center border-b border-red-900/50">
                            <h3 className="text-red-400 font-bold text-sm tracking-widest flex items-center justify-center gap-2">
                                📋 דו"ח סיכום נתונים - בדוק לפני פרסום
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">כותרת</span>
                                <span className="text-gray-300 ml-4 font-medium">{getFieldDisplay(details.title)}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">יצרן</span>
                                <span className="text-gray-300 ml-4 font-medium">{getFieldDisplay(spec.brand)}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">דגם</span>
                                <span className="text-gray-300 ml-4 font-medium">{getFieldDisplay(spec.subModel)}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">מעבד</span>
                                <span className="text-gray-300 ml-4 font-medium">{getFieldDisplay(spec.cpu)}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">RAM</span>
                                <span className="text-gray-300 ml-4 font-medium">{getFieldDisplay(spec.ram)}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">מערכת הפעלה</span>
                                <span className="text-gray-300 ml-4 font-medium">{getFieldDisplay(spec.os)}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">כרטיס מסך</span>
                                <span className="text-gray-300 ml-4 font-medium">{getFieldDisplay(spec.gpu)}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">תדר רענון</span>
                                <span className="text-gray-300 ml-4 font-medium">{spec.refreshRate || "לא מוללא"}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">אחסון נוסף</span>
                                <span className="text-gray-300 ml-4 font-medium">{spec.extraStorage || "אין"}</span>
                            </div>
                            <div className="flex justify-between border-b border-red-900/30 pb-1">
                                <span className="text-red-500 font-bold bg-red-950/50 px-2 rounded">תקינות סוללה</span>
                                <span className="text-gray-300 ml-4 font-medium">{spec.batteryHealth} ({spec.batteryPercent}%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 mt-4 mb-2">
                        <input type="checkbox" id="simMode" checked={isSimulation} onChange={e => setIsSimulation(e.target.checked)} className="w-4 h-4" />
                        <Label htmlFor="simMode" className="text-slate-300 font-bold">הדמיית למידה: נתח ולמד בלי לפרסם באמת (לצרכי בדיקות)</Label>
                    </div>

                    <Button type="submit" disabled={loading || (mainCategory !== "custom" && !spec.brand) || !details.price} className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-[0.98]">
                        {loading ? <Loader2 className="animate-spin ml-2" /> : null}
                        {uncertainFields.length > 0 ? "פרסם מודעה (שים לב לשדות הצהובים)" : "פרסם מודעה 🚀"}
                    </Button>
                </form>
            </div>
        </div>
    );
}

// ------ UI Helpers ------
function SectionTitle({ title, error }: { title: string, error?: boolean }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <h3 className="text-blue-400 font-bold flex items-center gap-1.5 border-b border-blue-900/50 pb-1">
                <span className="bg-blue-500 w-1.5 h-4 rounded-full inline-block"></span>
                {title}
                {error && <span className="text-red-500 text-xs ml-2 font-normal animate-pulse">*שדה חובה</span>}
            </h3>
        </div>
    );
}

function InputField({ label, val, fn, placeholder, type = "text", uncert, onConf }: any) {
    return (
        <div className={`space-y-1.5 p-2 rounded-xl transition-all ${uncert ? 'bg-yellow-500/10 border border-yellow-500/40 relative pb-8' : 'border border-transparent'}`}>
            <Label className={`text-xs font-bold flex items-center gap-1 ${uncert ? 'text-yellow-400' : 'text-gray-300'}`}>
                {label} {uncert && <AlertCircle className="w-3 h-3 animate-pulse" />}
            </Label>
            <Input type={type} value={val} onChange={fn} placeholder={placeholder} className={`bg-[#151b2b] text-white h-10 text-sm ${uncert ? 'border-yellow-500/50' : 'border-slate-700 focus:border-blue-500'}`} />
            
            {uncert && onConf && (
                <button type="button" onClick={onConf} className="absolute bottom-1 right-2 left-2 text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 rounded transition-colors flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> אשר נתון
                </button>
            )}
        </div>
    );
}

function SpecField({ label, val, fn, opts, icon, uncert, onConf }: any) {
    let options = opts || [];
    if (!Array.isArray(options)) options = Object.keys(options);

    return (
        <div className={`space-y-1.5 p-2 rounded-xl transition-all ${uncert ? 'bg-yellow-500/10 border border-yellow-500/40 relative pb-8' : 'border border-transparent'}`}>
            <Label className={`text-xs font-bold flex items-center gap-1 ${uncert ? 'text-yellow-400' : 'text-gray-400'}`}>
                {icon} {label} {uncert && <AlertCircle className="w-3 h-3 animate-pulse" />}
            </Label>

            {options.length > 0 ? (
                <select value={val} onChange={e => fn(e.target.value)} className={`w-full bg-[#151b2b] border rounded-lg h-10 px-3 text-sm ${uncert ? 'border-yellow-500/50 text-white' : 'border-slate-700 text-white focus:border-blue-500'}`}>
                    <option value="">בחר {label}</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <Input value={val} onChange={e => fn(e.target.value)} placeholder={`הקלד ${label}...`} className={`bg-[#151b2b] border h-10 text-white text-sm ${uncert ? 'border-yellow-500/50' : 'border-slate-700 focus:border-blue-500'}`} />
            )}

            {uncert && onConf && (
                <button type="button" onClick={onConf} className="absolute bottom-1 right-2 left-2 text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 rounded transition-colors flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> אשר נתון
                </button>
            )}
        </div>
    );
}