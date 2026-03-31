"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createListing, updateListing, getMyPhone } from "@/app/actions/marketplace";
import { Loader2, Sparkles, Box, HardDrive, Cpu, Monitor, Maximize2, MemoryStick, AlertCircle, Check, X } from "lucide-react";
import { SmartAiInput } from "./SmartAiInput";
import { UniversalCatalogSearch } from "@/components/marketplace/UniversalCatalogSearch";

// ─── ICON MAPPER ✨ ──────────────────────────────────────────────
const IconMapper: Record<string, any> = {
    HardDrive: HardDrive, Cpu: Cpu, Monitor: Monitor, 
    Maximize2: Maximize2, MemoryStick: MemoryStick, Settings: Box
};

// ─── SMART TITLE GENERATOR ──────────────────────────────
// מנגנון פנימי 100% - בניית כותרת מסחרית במקום ליקוח "השורה הראשונה" בתור כותרת
function generateSmartTitle(category: string, fields: Record<string, string>): string {
    const get = (...keys: string[]) => {
        for (const k of keys) if (fields[k] && fields[k].trim()) return fields[k].trim();
        return "";
    };

    const cat = (category || "").toUpperCase();

    // מחשב נייד / לפטופ
    if (["LAPTOPS", "LAPTOP"].includes(cat)) {
        const brand = get("brand", "יצרן");
        const model = get("subModel", "model_name", "גמוד");
        const ram = get("ram", "RAM");
        const storage = get("storage", "אחסון");
        const year = get("release_year", "שנת השקה");
        let title = "";
        if (brand && model) title = `מחשב נייד ${brand} ${model}`;
        else if (brand) title = `מחשב נייד ${brand}`;
        // אל להוסיף RAM/Storage אם כבר בדגם
        const modelLower = model.toLowerCase();
        const storageClean = storage.replace(/\s*(SSD|HDD)$/i, "").trim();
        const alreadyHasStorage = storage && (modelLower.includes(storageClean.toLowerCase()) || /\d+\s*(?:tb|gb)/i.test(modelLower));
        const alreadyHasRam = ram && modelLower.includes(ram.replace("GB","").trim());
        if (ram && !alreadyHasRam) title += ` ${ram}`;
        if (storage && !alreadyHasStorage) title += ` / ${storage}`;
        if (year && year.length === 4 && !title.includes(year)) title += ` (${year})`;
        return title.trim();
    }

    // מחשב שולחני
    if (["DESKTOPS", "DESKTOP"].includes(cat)) {
        const brand = get("brand", "יצרן");
        const model = get("subModel", "model_name");
        const cpu = get("cpu", "מעבד");
        const ram = get("ram", "RAM");
        let title = brand && model ? `מחשב שולחני ${brand} ${model}` : brand ? `מחשב נייח ${brand}` : "מחשב שולחני";
        if (ram) title += ` ${ram}`;
        return title;
    }

    // All-in-One
    if (["AIO"].includes(cat)) {
        const brand = get("brand"); const model = get("subModel");
        return brand && model ? `AIO ${brand} ${model}` : brand ? `AIO ${brand}` : "All-in-One";
    }

    // טלפון
    if (["PHONES", "MOBILES", "PHONE"].includes(cat)) {
        const brand = get("brand", "יצרן");
        const model = get("subModel", "model_name", "דגם");
        const storage = get("storage", "נפח אחסון");
        const color = get("color", "צבע");
        let title = "";
        if (brand && model) title = `${brand} ${model}`;
        else if (brand) title = brand;
        if (storage) title += ` ${storage}`;
        if (color && color.length < 15) title += ` צבע: ${color}`;
        return title.trim();
    }

    // רכב
    if (["VEHICLES", "VEHICLE", "CARS"].includes(cat)) {
        const brand = get("brand", "make", "יצרן");
        const model = get("subModel", "model", "דגם");
        const year = get("release_year", "year", "שנת ייץ", "שנת יצור");
        const km = get("km", "קילומטראז'", "קילומטר");
        let title = brand && model ? `${brand} ${model}` : brand || model || "רכב";
        if (year) title += ` ${year}`;
        if (km) title += ` | ${km} ק"מ`;
        return title.trim();
    }

    // אלקטרוניקה
    if (["ELECTRONICS"].includes(cat)) {
        const brand = get("brand", "יצרן");
        const model = get("subModel", "model_name");
        const type = get("category", "קטגוריה");
        let title = type ? `${type}` : "מוצר אלקטרוני";
        if (brand) title += ` ${brand}`;
        if (model) title += ` ${model}`;
        return title.trim();
    }

    // חשמליים ביתיים
    if (["APPLIANCES"].includes(cat)) {
        const brand = get("brand"); const model = get("subModel");
        const type = get("category", "קטגוריה");
        const capacity = get("capacity", "קיבולת");
        let title = type ? type : "מוצר חשמל";
        if (brand) title += ` ${brand}`;
        if (model) title += ` ${model}`;
        if (capacity) title += ` ${capacity}`;
        return title.trim();
    }

    // ברירת מחדל: brand + model
    const brand = get("brand", "יצרן");
    const model = get("subModel", "model_name", "דגם");
    if (brand && model) return `${brand} ${model}`;
    if (brand) return brand;
    return "";
}

export function DynamicListingForm({ onComplete, initialData, isEditing, listingId, initialCategory }: any) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uncertainFields, setUncertainFields] = useState<{field: string, weight: number}[]>([]);
    const [isSimulation, setIsSimulation] = useState(true); // עובד במצב הרצת סימולציה כברירת מחדל לאור בקשתך!
    const [customFieldName, setCustomFieldName] = useState("");
    const [customFieldValue, setCustomFieldValue] = useState("");
    const [showCustomFieldBox, setShowCustomFieldBox] = useState(false);
    
    // ─── DB-Driven Form Metadata ─────────────────────────────────────
    const [formStructure, setFormStructure] = useState<any[]>([]);
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
    const [isStructureLoading, setIsStructureLoading] = useState(true);

    const activeCategory = initialCategory || "LAPTOPS"; // Default fallback

    const [formData, setFormData] = useState(() => {
        const handledKeys = ["title", "price", "description", "category", "contactPhone", "success", "suggestions", "images", "extraData"];
        const INTERNAL_KEYS = ["isCatalogMatch", "sourceTable", "batteryPercent", "modelName", "model", "originalField"];
        
        let initialExtra: {key: string, value: string}[] = [];
        
        // Populate extra data from flat AI result object
        if (initialData) {
            Object.keys(initialData).forEach(key => {
                if (handledKeys.includes(key) || INTERNAL_KEYS.includes(key)) return;
                const val = initialData[key];
                if (val !== undefined && val !== null && val !== "") {
                    initialExtra.push({ key, value: String(val) });
                }
            });
            
            // Allow override if extraData existed somehow
            if (initialData.extraData) {
                 Object.entries(initialData.extraData).forEach(([key, val]) => {
                     const existing = initialExtra.find(e => e.key === key);
                     if (existing) existing.value = String(val);
                     else initialExtra.push({ key, value: String(val) });
                 });
            }
        }

        return {
            title: initialData?.title || "",
            price: initialData?.price?.toString() || "",
            description: initialData?.description || "",
            category: initialData?.category || activeCategory,
            contactPhone: initialData?.contactPhone || "",
            images: initialData?.images || [] as string[],
            extraData: initialExtra
        };
    });

    useEffect(() => {
        if (!formData.contactPhone) {
            getMyPhone().then(res => { if (res.phone) setFormData(p => ({ ...p, contactPhone: res.phone })); });
        }
    }, [formData.contactPhone]);

    // ⚡ שאיבת מבנה חכם מהשרת (עכשיו רץ בטיל בזכות ה-Cache!)
    useEffect(() => {
        async function fetchUIEngine() {
            setIsStructureLoading(true);
            try {
                // Fetch cached form JSON defining Cards, Sections, Inputs and Dropdowns!
                const res = await fetch(`/api/marketplace/form-structure?category=${activeCategory}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormStructure(data.structure || []);
                    setDynamicOptions(data.options || {});
                }
            } catch (e) {
                console.error("Failed to load Universal Form JSON UI Engine from DB", e);
            } finally {
                setIsStructureLoading(false);
            }
        }
        fetchUIEngine();
    }, [activeCategory]);

    const applyAiData = (ai: any) => {
        const data = ai.result || ai;
        setFormData(prev => {
            let newExtra = [...prev.extraData];
            const handledKeys = ["title", "price", "description", "category", "contactPhone", "success", "suggestions"];
            // שדות פנימיים שלא אמורים להופיע בטופס
            const INTERNAL_KEYS = ["isCatalogMatch", "sourceTable", "batteryPercent", "modelName", "model", "originalField"];
            
            // מיפוי שדות מה-AI לתוך extraData
            Object.keys(data).forEach(key => {
                if (handledKeys.includes(key)) return;
                if (INTERNAL_KEYS.includes(key)) return; // מסנן שדות פנימיים!
                const value = data[key];
                if (!value) return;
                const stringValue = Array.isArray(value) ? value.join(", ") : String(value);
                const existingIdx = newExtra.findIndex(e => e.key === key);
                if (existingIdx > -1) newExtra[existingIdx].value = stringValue;
                else newExtra.push({ key, value: stringValue });
            });

            // ――― בניית כותרת חכמה ―――――――――――――――――――――――――――――――――――――――――――――――――――――
            const aiFieldsMap: Record<string, string> = {};
            newExtra.forEach(e => { aiFieldsMap[e.key] = e.value; });
            if (data.attributes && Array.isArray(data.attributes)) {
                data.attributes.forEach((attr: { key: string; value: string }) => {
                    if (attr.key && attr.value) aiFieldsMap[attr.key] = attr.value;
                });
            }
            if (data.make) aiFieldsMap["brand"] = data.make;
            if (data.model) aiFieldsMap["subModel"] = data.model;
            
            const smartTitle = generateSmartTitle(prev.category, aiFieldsMap);
            const finalTitle = (smartTitle && smartTitle.length > 5)
                ? smartTitle
                : (data.title || prev.title);

            return {
                ...prev,
                title: finalTitle,
                price: data.price ? String(data.price) : prev.price,
                description: data.description || prev.description,
                contactPhone: data.contactPhone || prev.contactPhone,
                extraData: newExtra
            };
        });


        if (data.suggestions) {
            const suggests = data.suggestions
                .filter((s: any) => s.action === "SUGGEST")
                .map((s: any) => ({ field: s.field, weight: s.confidence ? Math.round(s.confidence * 100) : (s.weight || 0) }));
                
            setUncertainFields(prev => {
                const merged = [...prev];
                suggests.forEach((s: any) => {
                    const idx = merged.findIndex(m => m.field === s.field);
                    if (idx > -1) merged[idx] = s;
                    else merged.push(s);
                });
                return merged;
            });
        }
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormData(prev => {
            const existingIdx = prev.extraData.findIndex(e => e.key === key);
            if (existingIdx > -1) {
                const arr = [...prev.extraData];
                arr[existingIdx].value = value;
                return { ...prev, extraData: arr };
            }
            return { ...prev, extraData: [...prev.extraData, { key, value }] };
        });
    };

    const getFieldValue = (key: string) => {
        return formData.extraData.find(e => e.key === key)?.value || "";
    };

    const addCustomField = () => {
        if (!customFieldName || !customFieldValue) return;
        handleFieldChange(customFieldName, customFieldValue);
        setCustomFieldName("");
        setCustomFieldValue("");
        setShowCustomFieldBox(false);
    };

    const removeCustomField = (key: string) => {
        setFormData(prev => ({
            ...prev,
            extraData: prev.extraData.filter(e => e.key !== key)
        }));
    };

    const removeUncertain = (field: string) => {
        const currentValue = getFieldValue(field);
        const logId = typeof window !== 'undefined' ? localStorage.getItem("currentParserLogId") : null;
        if (currentValue && formData.category) {
            fetch("/api/parser-log/penalize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, wrongValue: currentValue, category: formData.category, logId })
            }).catch(() => {});
        }
        setUncertainFields(prev => prev.filter(f => f.field !== field));
    };

    const getUncertain = (fieldId: string) => uncertainFields.find(f => f.field === fieldId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const extraDataObject = formData.extraData.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});

            // פונקציית למידה "על יבש" דרך ה-Log API במצב סמולציה (כדי לא ללכלך את המרקטפלייס!)
            if (isSimulation) {
                const currentLogId = localStorage.getItem("currentParserLogId");
                if (currentLogId) {
                    const reportData = {
                        title: formData.title,
                        price: parseFloat(formData.price || "0"),
                        ...extraDataObject
                    };
                    await fetch("/api/parser-log", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: currentLogId, userFinal: reportData })
                    });
                }
                alert("הדמיית למידה בוצעה בהצלחה! הלמידה עודכנה בבסיס הנתונים ללא פירסום אמיתי במרקטפלייס.");
                setLoading(false);
                if(onComplete) onComplete();
                return;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price || "0"),
                category: formData.category,
                contactPhone: formData.contactPhone,
                images: formData.images,
                condition: extraDataObject["condition"] || "לא צוין", // REQUIRED BY API
                extraData: extraDataObject
            };

            const res = isEditing ? await updateListing(listingId, payload) : await createListing(payload);
            if (res.success) onComplete();
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // מנגנון בניית UI חכם אוניברסלי: ארגון השדות לפי Section
    const renderSections = () => {
        if (isStructureLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                    <div>טוען מבנה דינמי...</div>
                </div>
            );
        }

        const sections = formStructure.reduce((acc: Record<string, any[]>, field) => {
            const sec = field.sectionName || "שונות";
            if (!acc[sec]) acc[sec] = [];
            acc[sec].push(field);
            return acc;
        }, {});

        // Rendering Cards
        return Object.entries(sections).map(([sectionName, fields]) => {
            return (
                <div key={sectionName} className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                    <Label className="text-blue-400 font-bold flex items-center gap-2 mb-4 text-sm border-b border-gray-800 pb-2">
                        <Box className="w-4 h-4 text-blue-500" /> {sectionName}
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border-blue-500">
                        {fields.map(field => {
                            const IconComponent = field.icon ? IconMapper[field.icon] || Box : null;
                            const fieldOptions = dynamicOptions[field.fieldId] || [];

                            return (
                                <div key={field.fieldId} className={`space-y-1.5 min-h-[70px] relative transition-all rounded-lg p-2 ${getUncertain(field.fieldId) ? 'bg-yellow-500/10 border border-yellow-500/40 pb-7' : 'border border-transparent'} ${field.colSpan > 1 ? `col-span-${field.colSpan}` : ''}`}>
                                    <Label className={`text-xs flex items-center gap-1 ${getUncertain(field.fieldId) ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                                        {IconComponent && <IconComponent className="w-3.5 h-3.5 text-slate-500" />}
                                        {field.labelHera}
                                        {getUncertain(field.fieldId) && <AlertCircle className="w-3.5 h-3.5 animate-pulse ml-1" />}
                                        {/* הוסר הסימון כוכבית זמנית לבקשתך */}
                                        {field.isDynamic && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded">AI</span>}
                                        
                                        {/* תצוגת משקל הלמידה בבוקסה! */}
                                        {getUncertain(field.fieldId) && (
                                            <span className="mr-auto text-[9px] bg-yellow-600/30 text-yellow-300 px-1.5 py-0.5 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                                משקולת: {getUncertain(field.fieldId)?.weight}%
                                            </span>
                                        )}
                                    </Label>
                                    
                                    {field.fieldType === "select" ? (
                                        <select 
                                            value={getFieldValue(field.fieldId)} 
                                            onChange={e => handleFieldChange(field.fieldId, e.target.value)}
                                            className={`w-full bg-gray-800 border-gray-700 text-white text-sm rounded-lg p-2 focus:border-blue-500 outline-none ${getUncertain(field.fieldId) ? 'border-yellow-500/50' : ''}`}
                                        >
                                            <option value="">- בחירה -</option>
                                            {fieldOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <Input 
                                            value={getFieldValue(field.fieldId)} 
                                            onChange={e => handleFieldChange(field.fieldId, e.target.value)}
                                            className={`bg-gray-800 text-white ${getUncertain(field.fieldId) ? 'border-yellow-500/50' : 'border-gray-700'}`} 
                                        />
                                    )}

                                    {getUncertain(field.fieldId) && (
                                        <button type="button" onClick={() => removeUncertain(field.fieldId)} className="absolute bottom-1 right-2 left-2 text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 rounded transition-colors flex items-center justify-center gap-1">
                                            <Check className="w-3 h-3" /> אשר שדה
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="space-y-6 max-h-[85vh] overflow-y-auto px-2 text-right" dir="rtl">
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">מנוע AI אוניברסלי ({activeCategory})</h3>
                        <p className="text-xs text-purple-200 mt-1">מערכת דינמית מלאה. העיצוב מיובא ישירות מהמסד.</p>
                    </div>
                </div>
            </div>

            <SmartAiInput category={formData.category} onResult={applyAiData} />

            {/* ✅ Universal Catalog Search – מתחת לתיבת ה-AI, פעיל לכל הקטגוריות הנתמכות */}
            <div className="mb-4">
                <UniversalCatalogSearch
                    category={formData.category}
                    onApplySpecs={(mappedFields) => {
                        setFormData(prev => {
                            const newExtra = [...prev.extraData];
                            // Merge ALL mapped fields from the catalog into extraData
                            Object.entries(mappedFields).forEach(([key, value]) => {
                                if (!value) return;
                                const stringVal = String(value);
                                const idx = newExtra.findIndex(e => e.key === key);
                                if (idx > -1) newExtra[idx].value = stringVal;
                                else newExtra.push({ key, value: stringVal });
                            });
                            // בניית כותרת חכמה אוטומטית מהשדות שמולאו
                            const mergedFieldsMap: Record<string, string> = {};
                            newExtra.forEach(e => { mergedFieldsMap[e.key] = e.value; });
                            // הוסף את השדות החדשים מהקטלוג גם
                            Object.entries(mappedFields).forEach(([k, v]) => { if (v) mergedFieldsMap[k] = v; });
                            const autoTitle = generateSmartTitle(prev.category, mergedFieldsMap);
                            return {
                                ...prev,
                                extraData: newExtra,
                                title: autoTitle || prev.title  // אל דרוס כותרת תקפית
                            };
                        });
                    }}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4 shadow-lg border-t-purple-500/20">
                    <Label className="text-purple-400 font-bold mb-2 block border-b border-gray-800 pb-2">פרטים מזהים (קבוע לכל מוצר)</Label>
                    <div className="space-y-1.5">
                        <Label className="text-gray-400 text-xs">כותרת המודעה</Label>
                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={`bg-gray-800 border-gray-700 text-white ${getUncertain('title') ? 'border-yellow-500 bg-yellow-500/10' : ''}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-red-400 font-bold">* מחיר (₪)</Label>
                            <Input value={formData.price} type="number" onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className={`bg-gray-800 border-gray-700 font-bold ${getUncertain('price') ? 'border-yellow-500 bg-yellow-500/10' : ''}`} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-red-400 font-bold">* טלפון לקשר</Label>
                            <Input value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                    </div>
                </div>

                {/* ✨ המנוע הדינמי שמצייר את הקלפים והשדות ספציפית לקטגוריה */}
                {renderSections()}

                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
                     <Label className="text-gray-400 text-xs block mb-1">תיאור העסקה / פגמים (אופציונלי)</Label>
                     <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="שתפו פרטים נוספים על המוצר..."
                            className="w-full bg-gray-800 border-gray-700 text-white text-sm rounded-lg p-3 min-h-[100px] outline-none focus:border-purple-500" />
                </div>

                {/* שדות מותאמים אישית (שדות דינמיים שה-AI מצא מחוץ לטופס, או שהמשתמש הוסיף) */}
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 space-y-3">
                    <Label className="text-blue-400 font-bold mb-2 flex items-center gap-2 border-b border-gray-800 pb-2">שדות חיצוניים מותאמים אישית</Label>
                    
                    {formData.extraData.filter(ed => !formStructure.find(fs => fs.fieldId === ed.key)).map(cf => (
                        <div key={cf.key} className={`flex flex-col md:flex-row items-center gap-2 p-3 rounded-xl border transition-all ${getUncertain(cf.key) ? 'bg-yellow-500/10 border-yellow-500/40 relative pb-10' : 'bg-[#151b2b] border-gray-700'}`}>
                            <div className="flex-1 w-full relative">
                                <Label className="text-xs text-gray-400 mb-1 block">שם השדה</Label>
                                <Input disabled value={cf.key} className={`bg-gray-900 text-white h-9 ${getUncertain(cf.key) ? 'border-yellow-500/50' : 'border-gray-600'}`} />
                            </div>
                            <div className="flex-[2] w-full relative">
                                <Label className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                                    ערך <span className="text-[10px] text-purple-400">(ניתן לעריכה)</span>
                                    {getUncertain(cf.key) && (
                                        <span className="mr-auto text-[9px] bg-yellow-600/30 text-yellow-300 px-1.5 py-0.5 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                                            משקולת: {getUncertain(cf.key)?.weight}%
                                        </span>
                                    )}
                                </Label>
                                <Input value={cf.value} onChange={e => handleFieldChange(cf.key, e.target.value)} className={`bg-gray-900 text-white h-9 ${getUncertain(cf.key) ? 'border-yellow-500/50' : 'border-gray-600'}`} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(cf.key)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-9 h-9 shrink-0 mt-5">
                                <X size={16} />
                            </Button>
                            
                            {getUncertain(cf.key) && (
                                <button type="button" onClick={() => removeUncertain(cf.key)} className="absolute bottom-1 right-2 left-2 text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 rounded transition-colors flex items-center justify-center gap-1">
                                    <Check className="w-3 h-3" /> אשר שדה חדש מה-AI
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* סיכום עסקה - תקציר השדות אדום (שודרג לפורמט חוזה משפטי מכירתי!) */}
                <div className="bg-[#0c0505] border-2 border-red-900/60 rounded-xl overflow-hidden mt-8 shadow-[0_0_30px_rgba(220,38,38,0.15)] relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
                    <div className="bg-gradient-to-l from-red-950/90 to-black p-4 text-center border-b-2 border-red-900/80">
                        <h3 className="text-red-400 font-black text-lg tracking-wider flex items-center justify-center gap-3">
                            <span className="bg-red-500 text-black px-2 py-0.5 rounded text-xs">טיוטת חוזה</span>
                            הצהרת מוכר: מפרט טכני מלא
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">הנתונים המפורטים מטה יהוו חלק בלתי נפרד מאסמכתת הרכישה מול הקונה.</p>
                    </div>
                    
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-sm relative z-10">
                        <div className="flex justify-between items-center border-b border-red-900/20 pb-2">
                            <span className="text-red-300 font-bold bg-red-950/40 px-3 py-1 rounded shadow-inner">כותרת העסקה</span>
                            <span className="text-white ml-2 font-medium">{formData.title || <span className="text-gray-600">-- להשלמה --</span>}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-red-900/20 pb-2">
                            <span className="text-red-300 font-bold bg-red-950/40 px-3 py-1 rounded shadow-inner">מחיר סופי (₪)</span>
                            <span className="text-white ml-2 font-black text-lg">{formData.price ? formData.price + " ₪" : <span className="text-gray-600 font-medium text-sm">-- להשלמה --</span>}</span>
                        </div>
                        
                        {/* כאן נרוץ על כל השדות שהמערכת מאפשרת למלא (FormStructure) בשביל להראות הכל! */}
                        {formStructure.map(fs => {
                            const val = getFieldValue(fs.fieldId);
                            return (
                                <div key={fs.fieldId} className="flex justify-between items-center border-b border-red-900/20 pb-2">
                                    <span className="text-red-400 font-semibold bg-red-950/20 px-2 py-0.5 rounded text-xs">{fs.labelHera}</span>
                                    <span className="text-gray-200 ml-2 font-medium dir-ltr text-left text-sm">{val || <span className="text-gray-600 text-xs">-- להשלמה --</span>}</span>
                                </div>
                            );
                        })}
                        
                        {/* וכאן נוסיף שדות דינמיים שה-AI או המשתמש המציאו שמחוץ למסד */}
                        {formData.extraData.filter(ed => !formStructure.find(f => f.fieldId === ed.key)).map(ed => (
                            <div key={ed.key} className="flex justify-between items-center border-b border-red-900/20 pb-2 bg-yellow-900/10 rounded px-1">
                                <span className="text-yellow-500 font-semibold bg-yellow-900/20 px-2 py-0.5 rounded text-xs flex gap-1 items-center"><Sparkles className="w-3 h-3"/> {ed.key}</span>
                                <span className="text-gray-200 ml-2 font-medium dir-ltr text-left text-sm">{ed.value || "--"}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* כפתור הוספת שדה מותאם אישית */}
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800">
                    {!showCustomFieldBox ? (
                        <Button type="button" variant="outline" className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-purple-500" onClick={() => setShowCustomFieldBox(true)}>
                            + אין פה נתון חשוב? הוסף שדה מותאם אישית למפרט
                        </Button>
                    ) : (
                        <div className="flex flex-col md:flex-row items-end gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <div className="flex-1 w-full space-y-1">
                                <Label className="text-xs text-gray-400">שם השדה (למשל: תוספות)</Label>
                                <Input value={customFieldName} onChange={e => setCustomFieldName(e.target.value)} className="bg-gray-900 border-gray-600 text-white" placeholder="שם השדה..." />
                            </div>
                            <div className="flex-1 w-full space-y-1">
                                <Label className="text-xs text-gray-400">ערך השדה</Label>
                                <Input value={customFieldValue} onChange={e => setCustomFieldValue(e.target.value)} className="bg-gray-900 border-gray-600 text-white" placeholder="ערך..." />
                            </div>
                            <Button type="button" onClick={addCustomField} className="bg-purple-600 hover:bg-purple-500 w-full md:w-auto h-10 mt-2 md:mt-0 shadow-lg">הוסף למפרט</Button>
                            <Button type="button" variant="ghost" className="text-gray-400 w-full md:w-auto mt-2 md:mt-0" onClick={() => setShowCustomFieldBox(false)}>ביטול</Button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 mt-4 mb-2 shadow-lg">
                    <input type="checkbox" id="simMode" checked={isSimulation} onChange={e => setIsSimulation(e.target.checked)} className="w-4 h-4 cursor-pointer accent-purple-500 rounded" />
                    <Label htmlFor="simMode" className="text-purple-300 font-bold cursor-pointer select-none">הדמיית למידה: נתח ולמד מהתיקון שלי בלי לפרסם באמת את המודעה למרקטפלייס</Label>
                </div>

                <div className="pt-4 pb-12">
                    <Button type="submit" disabled={loading || !formData.price || !formData.contactPhone} className={`w-full py-6 text-lg font-bold bg-gradient-to-l ${uncertainFields.length > 0 ? 'from-yellow-600 to-orange-500 hover:from-yellow-500 hover:to-orange-400' : 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'} shadow-xl shadow-purple-500/20 group`}>
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 
                            <span className="flex items-center gap-2">
                                {uncertainFields.length > 0 ? "⚠️ פרסם / למד מודעה (ממתינים שדות לאישור)" : "פרסם מודעה 🚀"} 
                                <span className="text-white/60 text-sm font-normal">({activeCategory})</span>
                            </span>
                        }
                    </Button>
                </div>
            </form>
        </div>
    );
}
