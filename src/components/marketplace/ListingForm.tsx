"use client";


import { useState, useEffect, useRef } from "react";
import React from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createListing, updateListing, getMyListings, parseLinkMetadata, updateUserPhone, getAiKnowledge, getMyPhone } from "@/app/actions/marketplace";
import { analyzeListingText } from "@/lib/listing-ai";
import { CAR_MODELS } from "@/lib/car-data";
import { HardwareSearchEngine } from "./HardwareSearchEngine";
import { Loader2, Plus, Image as ImageIcon, X, Sparkles, Link as LinkIcon, Edit3, Trash2, Mic, MicOff } from "lucide-react";
import Link from "next/link";

const CATEGORY_MAP: Record<string, string> = {
    "רכב": "Vehicles",
    "נדלן": "Real Estate",
    "טלפונים": "Phones",
    "מחשבים": "Computers",
    "אלקטרוניקה": "Electronics",
    "ריהוט": "Furniture",
    "מוצרי חשמל לבית": "Appliances",
    "מוצרי חשמל": "Appliances",
    "ביגוד ואופנה": "Fashion",
    "ספורט ופנאי": "Sports",
    "תינוקות וילדים": "Kids",
    "חיות מחמד": "Pets",
    "כלי עבודה ומוסך": "Tools",
    "בריאות וקוסמטיקה": "Health",
    "כלי נגינה": "Audio",
    "תחביבים ואמנות": "Hobbies",
    "ספרים ומדיה": "Books",
    "בית וגינה": "HomeDecor",
    "כללי": "General"
};

const PHONE_FIELDS = [
    { key: "יצרן", label: "יצרן / מותג" },
    { key: "דגם", label: "שם הדגם" },
    { key: "מספר דגם", label: "מספר דגם / SKU" },
    { key: "סוג מכשיר", label: "סוג מכשיר" },
    { key: "מעבד", label: "מעבד (SoC)" },
    { key: "RAM", label: "זיכרון RAM" },
    { key: "נפח אחסון", label: "אחסון פנימי" },
    { key: "מסך", label: "מסך ותצוגה" },
    { key: "מצלמה אחורית", label: "מצלמה אחורית" },
    { key: "מצלמה קדמית", label: "מצלמה קדמית" },
    { key: "סוללה", label: "סוללה" },
    { key: "טעינה", label: "טעינה" },
    { key: "בריאות סוללה", label: "בריאות סוללה (%)" },
    { key: "מערכת הפעלה", label: "מערכת הפעלה" },
    { key: "קישוריות", label: "קישוריות" },
    { key: "כרטיס SIM", label: "תמיכה ב-SIM / eSIM" },
    { key: "חיבורים", label: "חיבורים ויציאות" },
    { key: "ביומטריקה", label: "ביומטריקה / אבטחה" },
    { key: "חומרים ועמידות", label: "חומרים ועמידות למים" },
    { key: "מימדים ומשקל", label: "מימדים ומשקל" },
    { key: "צבעים", label: "צבעים" },
    { key: "מחיר משוער", label: "מחיר השקה" },
    { key: "שנת השקה", label: "שנת השקה" },
    { key: "הערות נוספות", label: "הערות" },
    { key: "החרגות", label: "החרגות (שריטות/נזקים)" },
];

const COMPUTER_FIELDS = [
    { key: "יצרן", label: "יצרן / מותג" },
    { key: "דגם", label: "שם הדגם" },
    { key: "מספר דגם", label: "מספר דגם / SKU" },
    { key: "סוג מחשב", label: "סוג המחשב" },
    { key: "מעבד", label: "מעבד (CPU)" },
    { key: "כרטיס מסך", label: "כרטיס מסך (GPU)" },
    { key: "RAM", label: "זיכרון (RAM)" },
    { key: "נפח אחסון", label: "כוננים ואחסון" },
    { key: "גודל מסך", label: "מסך (אינץ' ותצוגה)" },
    { key: "סוללה", label: "סוללה (לניידים)" },
    { key: "מערכת הפעלה", label: "מערכת הפעלה" },
    { key: "חיבורים", label: "חיבורים ויציאות" },
    { key: "משקל ומימדים", label: "משקל ומימדים" },
    { key: "לוח אם", label: "לוח אם" },
    { key: "ספק כוח", label: "ספק כוח" },
    { key: "מארז וקירור", label: "מארז וקירור" },
    { key: "מחיר משוער", label: "מחיר השקה פוטנציאלי" },
    { key: "שנת השקה", label: "שנת השקה" },
    { key: "הערות נוספות", label: "הערות" },
    { key: "החרגות", label: "החרגות (שריטות/נזקים)" },
];

const CONDITION_MAP: Record<string, string> = {
    "new": "New",
    "like_new": "Like New",
    "used": "Used",
    "for_parts": "Refurbished",
    "good": "Used", // Map 'good' to 'Used'
    // Fallback for direct AI outputs
    "New": "New",
    "Like New": "Like New",
    "Used": "Used",
    "Refurbished": "Refurbished",
    // Hebrew fallbacks
    "חדש": "New",
    "כמו חדש": "Like New",
    "משומש": "Used",
    "מחודש": "Refurbished",
    "לחלקים": "Refurbished"
};

// --- Vehicle Field Helpers ---
const isKmKey = (k: string) => /קילומט|ק"מ|קמ|km/i.test(k);
const isYearKey = (k: string) => /שנת|שנה|model|year/i.test(k);
const isHandKey = (k: string) => /יד|hand/i.test(k);


export function ListingForm({ onComplete, onCancel, initialData, initialMagicText, isEditing, listingId }: {
    onComplete: () => void,
    onCancel?: () => void,
    initialData?: any,
    initialMagicText?: string,
    isEditing?: boolean,
    listingId?: string
}) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    // If we have magic text, start in magic text mode, otherwise manual
    const [mode, setMode] = useState<'manual' | 'magic_text' | 'magic_link' | 'magic_voice'>(
        initialMagicText ? (initialMagicText.startsWith("http") ? 'magic_link' : 'magic_text') : 'manual'
    );
    const [magicInput, setMagicInput] = useState(initialMagicText || "");

    // --- Voice Recording State ---
    const [isRecording, setIsRecording] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [recordingError, setRecordingError] = useState("");
    const recognitionRef = React.useRef<any>(null);

    // Helper to process extra data from AI attributes if present
    const processInitialExtraData = (data: any) => {
        let initialExtra: { key: string, value: string }[] = [];
        let initialHighlights: string[] = [];

        // 1. If explicit extraData exists (legacy or manual)
        if (data?.extraData) {
            if (Array.isArray(data.extraData)) {
                initialExtra = data.extraData;
            } else {
                initialExtra = Object.entries(data.extraData).map(([key, value]) => ({ key, value: String(value) }));
            }
        }

        // 2. If 'attributes' array exists (from AI), merge it
        if (data?.attributes && Array.isArray(data.attributes)) {
            // Separate Highlights ("דגשים")
            const highlightsAttrs = data.attributes.filter((attr: any) => attr.key === "דגשים");
            // Filter out highlights AND vehicle fields (year, hand, km) so they don't appear in extraData
            const otherAttrs = data.attributes.filter((attr: any) =>
                attr.key !== "דגשים" &&
                !isYearKey(attr.key) &&
                !isHandKey(attr.key) &&
                !isKmKey(attr.key)
            );

            // Add highlights to highlights array
            if (highlightsAttrs.length > 0) {
                highlightsAttrs.forEach((h: any) => {
                    // Check if highlight contains comma
                    if (h.value.includes(",")) {
                        h.value.split(",").map((s: string) => s.trim()).forEach((s: string) => initialHighlights.push(s));
                    } else {
                        initialHighlights.push(h.value);
                    }
                });
            }

            const aiAttributes = otherAttrs.map((attr: any) => ({
                key: attr.key,
                value: attr.unit ? `${attr.value} ${attr.unit}` : attr.value
            }));

            // Avoid duplicates
            aiAttributes.forEach((attr: { key: string; value: string; }) => {
                if (!initialExtra.some(e => e.key === attr.key)) {
                    initialExtra.push(attr);
                }
            });
        }

        // Also merge explicit highlights if they exist
        if (data?.highlights && Array.isArray(data.highlights)) {
            initialHighlights = [...initialHighlights, ...data.highlights];
        }

        // De-duplicate highlights
        initialHighlights = Array.from(new Set(initialHighlights));

        return { extraData: initialExtra, highlights: initialHighlights };
    };

    const processed = processInitialExtraData(initialData);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        price: initialData?.price ? initialData.price.toString() : "",
        description: initialData?.description || "",
        condition: CONDITION_MAP[initialData?.condition] || initialData?.condition || "Used",
        category: CATEGORY_MAP[initialData?.category] || initialData?.category || "General",
        make: initialData?.make || "",
        model: initialData?.model || "",
        year: initialData?.year || "",
        hand: initialData?.hand || "",
        kilometrage: initialData?.kilometrage || "",
        images: initialData?.images || [] as string[],
        videos: initialData?.videos || [] as string[],
        contactPhone: initialData?.contactPhone || initialData?.extraData?.["טלפון ליצירת קשר"] || "",
        extraData: processed.extraData,
        highlights: processed.highlights
    });

    const [imageUrlInput, setImageUrlInput] = useState("");
    const [videoUrlInput, setVideoUrlInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>(initialData?.missingFields || []);
    const [highlightInput, setHighlightInput] = useState("");
    const [showPhoneUpdate, setShowPhoneUpdate] = useState(false);

    // Auto-fill phone from DB (Onboarding) or Clerk profile
    useEffect(() => {
        if (formData.contactPhone) return; // already filled
        getMyPhone().then(res => {
            if (res.phone) setFormData(prev => ({ ...prev, contactPhone: res.phone }));
        });
    }, []);

    useEffect(() => {
        if (!formData.contactPhone && formData.description) {
            console.log("Attempting client-side phone rescue...");
            const analysis = analyzeListingText(formData.description);
            if (analysis.contactInfo) {
                console.log("Client-side rescue found phone:", analysis.contactInfo);
                setFormData(prev => ({ ...prev, contactPhone: analysis.contactInfo || "" }));
            }
        }
    }, [formData.description, formData.contactPhone]);

    // New State for "Other" and Conflict Detection
    const [customMake, setCustomMake] = useState("");
    const [customModel, setCustomModel] = useState("");
    const [detectedMake, setDetectedMake] = useState(initialData?.make || "");
    const [detectedModel, setDetectedModel] = useState(initialData?.model || "");
    const [showConflictWarning, setShowConflictWarning] = useState(false);
    const [originalAI, setOriginalAI] = useState<any>(null);
    const [aiKnowledge, setAiKnowledge] = useState<any>(null);

    // Tester fields
    const [testerName, setTesterName] = useState(user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "אורח");
    const [testerNote, setTesterNote] = useState("");
    const [isTestMode, setIsTestMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return !!initialMagicText || !!initialData?._logId || !!localStorage.getItem("currentParserLogId") || new URLSearchParams(window.location.search).get("mode") === "ai";
        }
        return false;
    });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const submitTesterNote = async () => {
        const logId = localStorage.getItem("currentParserLogId");
        if (!logId) {
            alert("לא נמצא תיעוד AI למודעה זו בסשן הנוכחי. נסה לבצע קריאת AI מחדש.");
            return;
        }
        if (!testerNote.trim()) {
            alert("אנא כתוב הערה לפני השמירה.");
            return;
        }
        try {
            await fetch("/api/parser-log", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: logId,
                    testerNote: testerNote.trim(),
                    testerName
                }),
            });
            alert("ההערה נשמרה בהצלחה באדמין ✓");
        } catch (error) {
            console.error(error);
            alert("שגיאה בשמירת הערה.");
        }
    };

    useEffect(() => {
        if (user && (!testerName || testerName === "אורח")) {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            if (fullName) {
                setTesterName(fullName);
            }
        }
    }, [user, testerName]);

    // Drag logic for AI tester panel
    const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });

    const handlePointerDownPanel = (e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button, input, textarea, label')) return;
        setIsDraggingPanel(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY, panelX: panelPos.x, panelY: panelPos.y };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMovePanel = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingPanel) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPanelPos({ x: dragStartRef.current.panelX + dx, y: dragStartRef.current.panelY + dy });
    };

    const handlePointerUpPanel = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDraggingPanel(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    useEffect(() => {
        const storedAI = localStorage.getItem("smartListingAiResult");
        if (storedAI) {
            try { setOriginalAI(JSON.parse(storedAI)); } catch (e) { }
        }
    }, []);

    // Fetch AI Knowledge on mount
    useEffect(() => {
        getAiKnowledge().then(kb => {
            if (kb) setAiKnowledge(kb);
        }).catch(err => console.error("Failed to fetch AI knowledge", err));
    }, []);

    // Conflict Detection Effect
    useEffect(() => {
        if (detectedMake && formData.make && formData.make !== "Other" && formData.make !== detectedMake) {
            setShowConflictWarning(true);
        } else {
            setShowConflictWarning(false);
        }
    }, [formData.make, detectedMake]);

    useEffect(() => {
        if (formData.contactPhone && user?.primaryPhoneNumber?.phoneNumber) {
            // Clean both numbers for comparison
            const userPhone = user.primaryPhoneNumber.phoneNumber.replace(/\D/g, "");

            // If form phone is valid length (e.g. > 9) and different from user phone
            // (userPhone often includes country code +972, formPhone typically 05...)
            const normalizedUserPhone = userPhone.startsWith("972") ? "0" + userPhone.slice(3) : userPhone;

            // Handle multiple phones (split by comma first, then clean)
            // Fix: split first, then match digits
            const firstFormPhoneRaw = formData.contactPhone.split(/[,/]/)[0];
            const firstFormPhone = firstFormPhoneRaw.replace(/\D/g, "");

            if (firstFormPhone.length > 8 && firstFormPhone !== normalizedUserPhone) {
                setShowPhoneUpdate(true);
            } else {
                setShowPhoneUpdate(false);
            }
        }
    }, [formData.contactPhone, user]);

    const handleUpdateProfilePhone = async () => {
        if (!formData.contactPhone) return;
        const res = await updateUserPhone(formData.contactPhone);
        if (res.success) {
            setShowPhoneUpdate(false);
        } else {
            alert("שגיאה בעדכון הטלפון");
        }
    };

    const formatPrice = (val: string) => {
        // Remove non-digits
        const digits = val.replace(/\D/g, "");
        if (!digits) return "";
        return parseInt(digits).toLocaleString();
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, "");
        if (!isNaN(Number(val))) {
            setFormData(prev => ({ ...prev, price: val }));
        }
    };

    // --- Voice Recording Logic ---
    const userStoppedRef = useRef(false);

    const startRecording = () => {
        setRecordingError("");
        setVoiceTranscript("");
        userStoppedRef.current = false;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setRecordingError("הדפדפן שלך לא תומך בהקלטת קול. נסה Chrome או Safari עדכני.");
            return;
        }

        const createAndStart = () => {
            const recognition = new SpeechRecognition();
            recognition.lang = "he-IL";
            // iOS doesn't support continuous well — it auto-stops; we restart manually
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: any) => {
                let finalTranscript = "";
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + " ";
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript || interimTranscript) {
                    setVoiceTranscript(prev => {
                        const base = prev.split("|||INTERIM")[0];
                        const newFinal = base + finalTranscript;
                        return interimTranscript ? newFinal + "|||INTERIM" + interimTranscript : newFinal;
                    });
                }
            };

            recognition.onerror = (event: any) => {
                // 'no-speech' and 'aborted' are normal on mobile, ignore them
                if (event.error === "no-speech" || event.error === "aborted") return;
                // Network errors on mobile are common
                if (event.error === "network") {
                    setRecordingError("שגיאת רשת. בדוק חיבור לאינטרנט.");
                    userStoppedRef.current = true;
                    setIsRecording(false);
                    return;
                }
                if (event.error === "not-allowed") {
                    setRecordingError("אין הרשאה למיקרופון. אשר גישה בהגדרות הדפדפן.");
                    userStoppedRef.current = true;
                    setIsRecording(false);
                    return;
                }
                setRecordingError("שגיאה: " + event.error);
            };

            recognition.onend = () => {
                // Auto-restart on iOS (which stops after a pause) unless user stopped
                if (!userStoppedRef.current) {
                    try {
                        const newRecognition = createAndStart();
                        recognitionRef.current = newRecognition;
                    } catch (e) {
                        // Failed to restart, just stop
                        setIsRecording(false);
                    }
                } else {
                    setIsRecording(false);
                }
            };

            try {
                recognition.start();
            } catch (e) {
                // Already started — ignore
            }
            return recognition;
        };

        const recognition = createAndStart();
        recognitionRef.current = recognition;
        setIsRecording(true);
    };

    const stopRecording = () => {
        userStoppedRef.current = true;
        recognitionRef.current?.stop();
        setIsRecording(false);
        // Clean up interim text on stop
        setVoiceTranscript(prev => prev.split("|||INTERIM")[0]);
    };

    const handleVoiceAnalyze = async () => {
        const cleanTranscript = voiceTranscript.split("|||INTERIM")[0].trim();
        if (!cleanTranscript) return;
        setMagicInput(cleanTranscript);
        setMode('magic_text');
        // slight delay to let state update, then trigger parse
        await new Promise(r => setTimeout(r, 50));
        handleMagicParse();
    };

    // --- Dynamic Fields Logic ---
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addField = () => {
        setFormData(prev => ({
            ...prev,
            extraData: [...prev.extraData, { key: "", value: "" }]
        }));
    };

    const updateField = (index: number, key: string, value: string) => {
        const newData = [...formData.extraData];
        newData[index] = { key, value };
        setFormData(prev => ({ ...prev, extraData: newData }));
    };

    const removeField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            extraData: prev.extraData.filter((_, i) => i !== index)
        }));
    };

    // --- Highlights Logic ---
    const addHighlight = () => {
        if (highlightInput && !formData.highlights.includes(highlightInput)) {
            setFormData(prev => ({ ...prev, highlights: [...prev.highlights, highlightInput] }));
            setHighlightInput("");
        }
    };

    const removeHighlight = (index: number) => {
        setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
    };

    // --- Suggestion Logic ---
    const addSuggestion = (field: string) => {
        setFormData(prev => ({
            ...prev,
            extraData: [...prev.extraData, { key: field, value: "" }]
        }));
        setMissingFields(prev => prev.filter(f => f !== field));
    };

    const handleExtraChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            extraData: prev.extraData.some(e => e.key === key)
                ? prev.extraData.map(e => e.key === key ? { ...e, value } : e)
                : [...prev.extraData, { key, value }]
        }));
    };
    const getExtraVal = (key: string) => {
        return formData.extraData.find(e => e.key === key)?.value || "";
    };


    // --- Magic Logic ---
    const handleMagicParse = async () => {
        if (!magicInput) return;
        setLoading(true);

        try {
            // 1. Get Full Text
            let textToAnalyze = magicInput;
            let initialDataFromServer = {} as any;

            if (mode === 'magic_link') {
                const res = await parseLinkMetadata(magicInput);
                if (res.success && res.data) {
                    initialDataFromServer = res.data;
                    textToAnalyze = (res.data.title || "") + " \n " + (res.data.description || "");
                } else {
                    alert("לא הצלחנו לשאוב פרטים מהקישור הזה. נסה להעתיק את הטקסט ידנית.");
                    setLoading(false);
                    return;
                }
            }

            // 2. Run Expert AI Analysis
            const analysis = analyzeListingText(textToAnalyze, { knowledgeBase: aiKnowledge });
            console.log("Magic Parse Debug:", { textToAnalyze, analysis, contactInfo: analysis.contactInfo });

            if (analysis.warning) {
                alert(analysis.warning);
            }

            // Extract highlights from attributes (key="דגשים")
            const extractedHighlights = analysis.attributes
                .filter(a => a.key === "דגשים")
                .map(a => a.value);

            // Filter out highlights and now-native vehicle fields from attributes
            const filteredAttributes = analysis.attributes.filter(a =>
                a.key !== "דגשים" &&
                !isYearKey(a.key) &&
                !isHandKey(a.key) &&
                !isKmKey(a.key)
            );

            // Map Category and Condition
            const mappedCategory = CATEGORY_MAP[analysis.category] || "General";
            const mappedCondition = CONDITION_MAP[analysis.condition] || "Used";

            if (["Computers", "Phones", "Electronics", "Appliances"].includes(mappedCategory)) {
                if (analysis.make && !filteredAttributes.some(a => a.key === "יצרן")) {
                    filteredAttributes.push({ key: "יצרן", value: analysis.make });
                }
                if (analysis.model && !filteredAttributes.some(a => a.key === "דגם")) {
                    filteredAttributes.push({ key: "דגם", value: analysis.model });
                }
            }

            const kmAttr = analysis.attributes.find(a => a.key.includes("קילומט") || a.key.includes("ק\"מ") || a.key === "קמ");
            console.log("Kilometrage Debug:", {
                allAttributes: analysis.attributes,
                foundKmAttr: kmAttr,
                value: kmAttr?.value
            });

            console.log("Setting Form Data with Phone:", analysis.contactInfo);

            // Store original analysis for feedback loop
            setOriginalAI(analysis);

            // 3. Merge Data
            setOriginalAI(analysis);

            setFormData(prev => ({
                ...prev,
                // Use Smart Title
                title: analysis.title || initialDataFromServer.title || prev.title,
                description: initialDataFromServer.description || prev.description || textToAnalyze,
                images: initialDataFromServer.images?.length > 0 ? initialDataFromServer.images : prev.images,

                // Use AI price if found
                price: analysis.price ? analysis.price.toString() : (initialDataFromServer.price || prev.price),

                category: mappedCategory,
                condition: mappedCondition,
                make: analysis.make || "", // Populate Make
                model: analysis.model || "", // Populate Model,
                year: analysis.attributes.find(a => isYearKey(a.key))?.value || "",
                hand: analysis.attributes.find(a => isHandKey(a.key))?.value || "",
                kilometrage: analysis.attributes.find(a => isKmKey(a.key))?.value || "",
                contactPhone: analysis.contactInfo || prev.contactPhone,


                // Merge extra data
                extraData: [
                    ...prev.extraData,
                    ...filteredAttributes.map(attr => ({
                        key: attr.key,
                        value: attr.unit ? `${attr.value} ${attr.unit}` : attr.value
                    })).filter(newAttr => !prev.extraData.some(existing => existing.key === newAttr.key))
                ],

                highlights: [
                    ...prev.highlights,
                    ...extractedHighlights.filter(h => !prev.highlights.includes(h))
                ],

                // Merge videos from link metadata
                videos: initialDataFromServer.videos?.length > 0 ? initialDataFromServer.videos : prev.videos
            }));

            // Set detected values for conflict check
            setDetectedMake(analysis.make || "");
            setDetectedModel(analysis.model || "");

            setMissingFields(analysis.missingFields || []);
            setMode('manual');

            // Log inline magic parsing explicitly
            try {
                if (!localStorage.getItem("currentParserLogId")) {
                    const logRes = await fetch("/api/parser-log", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            originalText: textToAnalyze,
                            aiParsed: JSON.stringify(analysis),
                            testerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'אורח',
                            category: mappedCategory,
                            inputMode: mode
                        }),
                    });
                    const logData = await logRes.json();
                    if (logData.id) localStorage.setItem("currentParserLogId", logData.id);
                }
            } catch (err) { console.error("Auto log failed", err) }

        } catch (error: any) {
            console.error("Magic parse failed:", error);
            alert(`אירעה שגיאה בניתוח המודעה: ${error?.message || "שגיאה לא ידועה"}`);
        } finally {
            setLoading(false);
        }
    };




    const addImage = () => {
        if (imageUrlInput) {
            setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput] }));
            setImageUrlInput("");
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== index) }));
    };

    const addVideo = () => {
        if (videoUrlInput) {
            setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), videoUrlInput] }));
            setVideoUrlInput("");
        }
    };

    const removeVideo = (index: number) => {
        setFormData(prev => ({ ...prev, videos: (prev.videos || []).filter((_: string, i: number) => i !== index) }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                if (type === 'image') {
                    setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
                } else {
                    setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), data.url] }));
                }
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert extraData array to object
        const extraDataObject = formData.extraData.reduce((acc, curr) => {
            if (curr.key) acc[curr.key] = curr.value;
            return acc;
        }, {} as any);

        // Add contact phone if present
        if (formData.contactPhone) {
            extraDataObject["טלפון ליצירת קשר"] = formData.contactPhone;
        }

        // Add highlights to extraData as a comma-separated string
        if (formData.highlights.length > 0) {
            extraDataObject["דגשים"] = formData.highlights.join(", ");
        }

        // Add model if present
        if (formData.make) {
            extraDataObject["יצרן"] = formData.make === "Other" ? customMake : formData.make;
        }
        if (formData.model) {
            extraDataObject["דגם"] = (formData.model === "Other" || formData.model === "OtherModel") ? customModel : formData.model;
        }

        // Add vehicle specific fields if present
        if (formData.year) extraDataObject["שנת ייצור"] = formData.year;
        if (formData.hand) extraDataObject["יד"] = formData.hand;
        if (formData.kilometrage) extraDataObject["קילומטראז'"] = formData.kilometrage;

        if (!formData.contactPhone?.trim()) { alert("נא להזין מספר טלפון ליצירת קשר"); return; }

        console.log("Submitting form data:", {
            title: formData.title,
            price: formData.price,
            imagesType: typeof formData.images,
            imagesIsArray: Array.isArray(formData.images),
            imagesLen: formData.images?.length,
            extraData: extraDataObject
        });

        if (!isEditing) {
            const existingRes = await getMyListings();
            if (existingRes.success && existingRes.listings) {
                const isDuplicate = existingRes.listings.some((l: any) => l.title === formData.title.trim());
                if (isDuplicate) {
                    const confirmedDup = confirm("המוצר כבר פורסם! האם אתה בטוח שאתה רוצה לפרסם את אותו מוצר שוב?");
                    if (!confirmedDup) return;
                }
            }
        }

        setLoading(true);
        try {
            if (isTestMode) {
                // Skips DB insertion - simulates success and sends feedback
                if (originalAI) {
                    const finalPrice = parseFloat(formData.price.toString().replace(/,/g, "") || "0");
                    let correctionsCount = 0;
                    const diffs: Record<string, any> = {};

                    if (originalAI.title?.trim() !== formData.title?.trim()) { correctionsCount++; diffs.title = { ai: originalAI.title, user: formData.title }; }
                    if (originalAI.price !== undefined && Number(originalAI.price) !== finalPrice) { correctionsCount++; diffs.price = { ai: originalAI.price, user: finalPrice }; }

                    const aiCategoryMapped = Object.keys(CATEGORY_MAP).find(k => CATEGORY_MAP[k] === formData.category) || formData.category;
                    if (originalAI.category !== aiCategoryMapped && CATEGORY_MAP[originalAI.category] !== formData.category) { correctionsCount++; diffs.category = { ai: originalAI.category, user: formData.category }; }

                    const logId = localStorage.getItem("currentParserLogId");
                    if (logId) {
                        await fetch("/api/parser-log", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                id: logId,
                                quality: correctionsCount > 3 ? "bad" : (correctionsCount > 0 ? "partial" : "good"),
                                reviewed: true,
                                testerName: testerName,
                                testerNote: testerNote,
                                userFinal: { ...formData, price: finalPrice, extraData: extraDataObject },
                                computedCorrections: Object.keys(diffs).length > 0 ? JSON.stringify(diffs) : null
                            })
                        });
                        localStorage.removeItem("currentParserLogId");
                    }
                }
                alert("המודעה נשמרה בלוגי הבדיקה בהצלחה (לא פורסמה).");
                onComplete();
                return;
            }

            const res = isEditing && listingId
                ? await updateListing(listingId, {
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price.toString().replace(/,/g, "") || "0"),
                    condition: formData.condition,
                    category: formData.category,
                    images: formData.images,
                    videos: formData.videos,
                    extraData: extraDataObject
                })
                : await createListing({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price.toString().replace(/,/g, "") || "0"),
                    condition: formData.condition,
                    category: formData.category,
                    images: formData.images,
                    videos: formData.videos,
                    extraData: extraDataObject
                });

            console.log("Server response:", res);

            if (!res) {
                throw new Error("No response from server. Check server logs.");
            }

            if (res.success) {
                // --- AI FEEDBACK LOOP ---
                // If we started with AI data, log the final result vs original for learning
                if (originalAI) {
                    try {
                        const finalPrice = parseFloat(formData.price.toString().replace(/,/g, "") || "0");

                        // Smart Diff comparing only what AI outputted to what user submitted
                        let correctionsCount = 0;
                        const diffs: Record<string, any> = {};

                        if (originalAI.title?.trim() !== formData.title?.trim()) {
                            correctionsCount++;
                            diffs.title = { ai: originalAI.title, user: formData.title };
                        }

                        if (originalAI.price !== undefined && Number(originalAI.price) !== finalPrice) {
                            correctionsCount++;
                            diffs.price = { ai: originalAI.price, user: finalPrice };
                        }

                        const aiCategoryMapped = Object.keys(CATEGORY_MAP).find(k => CATEGORY_MAP[k] === formData.category) || formData.category;
                        if (originalAI.category !== aiCategoryMapped && CATEGORY_MAP[originalAI.category] !== formData.category) {
                            correctionsCount++;
                            diffs.category = { ai: originalAI.category, user: formData.category };
                        }

                        // Condition check
                        const aiConditionMapped = Object.keys(CONDITION_MAP).find(k => CONDITION_MAP[k] === formData.condition) || formData.condition;
                        if (originalAI.condition && originalAI.condition !== aiConditionMapped && CONDITION_MAP[originalAI.condition] !== formData.condition) {
                            correctionsCount++;
                            diffs.condition = { ai: originalAI.condition, user: formData.condition };
                        }

                        // Vehicle fields check
                        if (formData.category === "Vehicles") {
                            if (originalAI.make && originalAI.make !== formData.make) { correctionsCount++; diffs.make = { ai: originalAI.make, user: formData.make }; }
                            if (originalAI.model && originalAI.model !== formData.model) { correctionsCount++; diffs.model = { ai: originalAI.model, user: formData.model }; }

                            const aiYear = originalAI.attributes?.find((a: any) => isYearKey(a.key))?.value;
                            if (aiYear && aiYear != formData.year) { correctionsCount++; diffs.year = { ai: aiYear, user: formData.year }; }
                        }

                        // Determine quality
                        let autoQuality = "good";
                        if (correctionsCount > 3) autoQuality = "bad";
                        else if (correctionsCount > 0) autoQuality = "partial";

                        const logId = localStorage.getItem("currentParserLogId");
                        if (logId) {
                            fetch("/api/parser-log", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    id: logId,
                                    quality: autoQuality,
                                    reviewed: true,
                                    userFinal: { ...formData, price: finalPrice, extraData: extraDataObject },
                                    computedCorrections: Object.keys(diffs).length > 0 ? JSON.stringify(diffs) : null
                                })
                            }).catch(err => console.error("Feedback patch failed", err));

                            localStorage.removeItem("currentParserLogId"); // clear it out
                        }

                        const feedbackData = {
                            originalAI,
                            finalUser: {
                                title: formData.title,
                                price: finalPrice,
                                description: formData.description,
                                category: formData.category,
                                extraData: extraDataObject,
                                highlights: formData.highlights
                            },
                            timestamp: new Date().toISOString()
                        };

                        // Fire and forget - don't await
                        fetch("/api/ai-feedback", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(feedbackData)
                        }).catch(err => console.error("Feedback log failed", err));
                    } catch (e) {
                        console.error("Error preparing feedback", e);
                    }
                }
                // ------------------------

                onComplete();
            } else {
                alert("Error: " + res.error);
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Something went wrong: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (cat: string) => {
        const map: Record<string, string> = {
            "Vehicles": "רכב 🚗",
            "Real Estate": "נדלן 🏠",
            "Phones": "טלפונים 📱",
            "Computers": "מחשבים 💻",
            "Electronics": "אלקטרוניקה 📡",
            "Furniture": "ריהוט 🛋️",
            "Appliances": "מוצרי חשמל 🔌",
            "Fashion": "אופנה וביגוד 👗",
            "Sports": "ספורט ופנאי ⚽",
            "Kids": "תינוקות וילדים 🧸",
            "Pets": "חיות מחמד 🐾",
            "Tools": "כלי עבודה 🔧",
            "Health": "בריאות וקוסמטיקה 💊",
            "Audio": "אודיו וסאונד 🔊",
            "Hobbies": "תחביבים ואמנות 🎨",
            "Books": "ספרים ומדיה 📚",
            "HomeDecor": "עיצוב הבית 🖼️",
            "General": "כללי וקשקושים 📦"
        };
        return map[cat] || cat;
    };

    // --- Mode Selection View ---
    if (mode === 'magic_voice') {
        const displayText = voiceTranscript.split("|||INTERIM")[0];
        const interimText = voiceTranscript.includes("|||INTERIM") ? voiceTranscript.split("|||INTERIM")[1] : "";
        return (
            <div className="space-y-6 py-4">
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" onClick={() => { stopRecording(); setMode('manual'); }} className="text-gray-400">חזור</Button>
                </div>

                {/* Recording UI */}
                <div className="text-center space-y-4">
                    <div className="relative mx-auto" style={{ width: 96, height: 96 }}>
                        {/* Pulse rings */}
                        {isRecording && (
                            <>
                                <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                                <span className="absolute inset-2 rounded-full bg-red-500/15 animate-ping" style={{ animationDelay: '0.2s' }} />
                            </>
                        )}
                        <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
                                }`}
                        >
                            {isRecording ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
                        </button>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">
                            {isRecording ? '🔴 מקליט... דברו!' : '🎙️ הקלטת קול'}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {isRecording ? 'לחצו שוב בסיום לעצור' : 'לחצו על המיקרופון כדי להתחיל'}
                        </p>
                    </div>
                </div>

                {/* Live Transcript */}
                {(displayText || interimText) && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 min-h-[80px] text-right">
                        <p className="text-sm text-gray-400 mb-1">מה שנאמר:</p>
                        <p className="text-white leading-relaxed">
                            {displayText}
                            {interimText && <span className="text-gray-500 italic">{interimText}</span>}
                        </p>
                    </div>
                )}

                {recordingError && (
                    <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg p-3 text-sm text-center">
                        {recordingError}
                    </div>
                )}

                {/* Analyze Button */}
                {displayText && !isRecording && (
                    <Button
                        onClick={handleVoiceAnalyze}
                        disabled={loading}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> נתח את מה שאמרתי</span>}
                    </Button>
                )}
            </div>
        );
    }

    if (mode !== 'manual') {
        return (
            <div className="space-y-6 py-4">
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" onClick={() => setMode('manual')} className="text-gray-400">חזור</Button>
                </div>

                <div className="text-center space-y-2">
                    <div className="h-16 w-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-purple-400">
                        {mode === 'magic_link' ? <LinkIcon className="w-8 h-8" /> : <Edit3 className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold">
                        {mode === 'magic_link' ? "הדבק קישור והמערכת תעבוד בשבילך" : "הדבק את הטקסט של המודעה"}
                    </h3>
                    <p className="text-sm text-gray-400">
                        המומחה שלנו ינתח את המודעה וימליץ על הפרטים החשובים לקונים.
                    </p>
                </div>

                <div className="space-y-4">
                    {mode === 'magic_link' ? (
                        <Input
                            placeholder="https://facebook.com/marketplace/..."
                            className="h-12 bg-gray-800 border-gray-700"
                            value={magicInput}
                            onChange={e => setMagicInput(e.target.value)}
                        />
                    ) : (
                        <Textarea
                            placeholder="למשל: למכירה ספה בצבע אפור, שמורה כחדשה, מחיר 500 ש״ח..."
                            className="h-32 bg-gray-800 border-gray-700"
                            value={magicInput}
                            onChange={e => setMagicInput(e.target.value)}
                        />
                    )}

                    <Button
                        onClick={handleMagicParse}
                        disabled={loading || !magicInput}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> נתח בצורה חכמה</span>}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            {/* Category Badge (Auto-Detected) - RESTORED & IMPROVED */}
            <div className="flex justify-between items-center bg-gray-900 p-2 rounded-lg border border-gray-800 relative">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">קטגוריה:</span>
                    <span className="font-bold text-purple-400 text-lg">{getCategoryLabel(formData.category)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs border-gray-700 bg-gray-800">
                            <span className="truncate">{getCategoryLabel(formData.category)}</span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Vehicles">רכב 🚗</SelectItem>
                            <SelectItem value="Real Estate">נדלן 🏠</SelectItem>
                            <SelectItem value="Phones">טלפונים 📱</SelectItem>
                            <SelectItem value="Computers">מחשבים 💻</SelectItem>
                            <SelectItem value="Electronics">אלקטרוניקה 📡</SelectItem>
                            <SelectItem value="Furniture">ריהוט 🛋️</SelectItem>
                            <SelectItem value="Appliances">מוצרי חשמל 🔌</SelectItem>
                            <SelectItem value="Fashion">אופנה וביגוד 👗</SelectItem>
                            <SelectItem value="Sports">ספורט ופנאי ⚽</SelectItem>
                            <SelectItem value="Kids">תינוקות וילדים 🧸</SelectItem>
                            <SelectItem value="Pets">חיות מחמד 🐾</SelectItem>
                            <SelectItem value="Tools">כלי עבודה 🔧</SelectItem>
                            <SelectItem value="Health">בריאות וקוסמטיקה 💊</SelectItem>
                            <SelectItem value="Audio">אודיו וסאונד 🔊</SelectItem>
                            <SelectItem value="Hobbies">תחביבים ואמנות 🎨</SelectItem>
                            <SelectItem value="Books">ספרים ומדיה 📚</SelectItem>
                            <SelectItem value="HomeDecor">עיצוב הבית 🖼️</SelectItem>
                            <SelectItem value="General">כללי / אחר 📦</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" onClick={() => setMode('magic_link')} className="text-blue-400 p-1 h-8 w-8" title="ייבוא מקישור">
                        <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setMode('magic_text')} className="text-green-400 p-1 h-8 w-8" title="העתק-הדבק טקסט">
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setVoiceTranscript(""); setRecordingError(""); setMode('magic_voice'); }} className="text-red-400 p-1 h-8 w-8" title="הקלטת קול">
                        <Mic className="w-4 h-4" />
                    </Button>

                    {/* Back Button removed (moved to page header) */}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {formData.category === "Computers" && (
                    <div className="space-y-2 p-3 bg-gray-900/50 rounded-lg border border-purple-500/20 mb-4 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-purple-300">תת-קטגוריה (סוג המחשב)</Label>
                        <Select value={getExtraVal("סוג המחשב") || "מחשב נייד (Laptop)"} onValueChange={val => handleExtraChange("סוג המחשב", val)}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-right" dir="rtl">
                                <SelectValue placeholder="בחר סוג מחשב (למשל: מחשב נייד, גיימינג...)" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="מחשב נייד (Laptop)">מחשב נייד (Laptop)</SelectItem>
                                <SelectItem value="מחשב נייח (Desktop)">מחשב נייח (Desktop)</SelectItem>
                                <SelectItem value="מחשב גיימינג">מחשב גיימינג</SelectItem>
                                <SelectItem value="מחשב All-in-One">מחשב All-in-One</SelectItem>
                                <SelectItem value="מיני מחשב (Mini PC)">מיני מחשב (Mini PC)</SelectItem>
                                <SelectItem value="תחנת עבודה (Workstation)">תחנת עבודה (Workstation)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>כותרת המוצר</Label>
                    <Input
                        value={formData.title}
                        onChange={e => handleChange("title", e.target.value)}
                        placeholder="למשל: ספה דו-מושבית במצב מצויין"
                        required
                        className="bg-gray-800 border-gray-700"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>מחיר (₪) <span className="text-red-500">*</span></Label>
                        <Input
                            type="text"
                            value={formData.price ? Number(formData.price.replace(/,/g, "")).toLocaleString() : ""}
                            onChange={handlePriceChange}
                            placeholder="0"
                            required
                            className="bg-gray-800 border-gray-700 font-mono text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>מצב</Label>
                        <Select value={formData.condition} onValueChange={val => handleChange("condition", val)}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="בחר מצב" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="New">חדש</SelectItem>
                                <SelectItem value="Like New">כמו חדש</SelectItem>
                                <SelectItem value="Used">משומש</SelectItem>
                                <SelectItem value="Refurbished">מחודש</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Make & Model Fields - Only for Vehicles */}
                {formData.category === "Vehicles" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>יצרן</Label>
                            <Select
                                value={formData.make}
                                onValueChange={val => {
                                    handleChange("make", val);
                                    handleChange("model", ""); // Reset model when make changes
                                }}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="בחר יצרן" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="Other" className="font-bold border-b mb-1">אחר (לא ברשימה)</SelectItem>
                                    {Object.keys(CAR_MODELS).sort((a, b) => a.localeCompare(b, "he")).map(make => (
                                        <SelectItem key={make} value={make}>{make}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>דגם</Label>
                            <Select
                                value={formData.model}
                                onValueChange={val => {
                                    handleChange("model", val);
                                    setCustomModel(""); // Reset custom model
                                }}
                                disabled={!formData.make || formData.make === "Other"}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="בחר דגם" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {formData.make && CAR_MODELS[formData.make] ? (
                                        CAR_MODELS[formData.make].map(model => (
                                            <SelectItem key={model} value={model}>{model}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="Other" disabled>בחר יצרן תחילה</SelectItem>
                                    )}
                                    <SelectItem value="OtherModel">דגם אחר / לא ברשימה</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Custom Make/Model Inputs if "Other" selected */}
                {formData.category === "Vehicles" && (
                    <div className="grid grid-cols-2 gap-4">
                        {formData.make === "Other" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>יצרן (אחר)</Label>
                                <Input
                                    value={customMake}
                                    onChange={e => setCustomMake(e.target.value)}
                                    placeholder="הכנס שם יצרן"
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        )}
                        {(formData.model === "OtherModel" || (formData.make === "Other" && formData.make)) && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>דגם (אחר)</Label>
                                <Input
                                    value={customModel}
                                    onChange={e => setCustomModel(e.target.value)}
                                    placeholder="הכנס שם דגם"
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Year, Hand, Kilometrage - Only for Vehicles */}
                {formData.category === "Vehicles" && (
                    <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>שנת ייצור</Label>
                            <Input
                                value={formData.year}
                                onChange={e => handleChange("year", e.target.value.replace(/\D/g, ""))}
                                placeholder="202X"
                                maxLength={4}
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>יד</Label>
                            <Input
                                value={formData.hand}
                                onChange={e => handleChange("hand", e.target.value)}
                                placeholder="1, 2..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>קילומטראז&apos;</Label>
                            <Input
                                value={formData.kilometrage ? Number(formData.kilometrage.toString().replace(/,/g, "")).toLocaleString() : ""}
                                onChange={e => {
                                    const val = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                                    handleChange("kilometrage", val);
                                }}
                                placeholder="ק״מ"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )}

                {/* Specific Fields for Real Estate */}
                {formData.category === "Real Estate" && (
                    <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>מספר חדרים</Label>
                            <Input
                                value={getExtraVal("חדרים")}
                                onChange={e => handleExtraChange("חדרים", e.target.value)}
                                placeholder="3.5"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>קומה</Label>
                            <Input
                                value={getExtraVal("קומה")}
                                onChange={e => handleExtraChange("קומה", e.target.value)}
                                placeholder="2 מתוך 4"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>מ״ר</Label>
                            <Input
                                value={getExtraVal("מ\"ר")}
                                onChange={e => handleExtraChange("מ\"ר", e.target.value)}
                                placeholder="100"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )}

                {/* Specific Fields for Phones & Computers */}
                {["Phones", "Computers"].includes(formData.category) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-3">
                        <HardwareSearchEngine
                            category={formData.category}
                            onSelect={(hardwareData) => {
                                // Update all empty matching extraData
                                let newExtra = [...formData.extraData];
                                Object.keys(hardwareData).forEach(aiKey => {
                                    // Hardware API keys map to Hebrew keys here depending on category. 
                                    // The HardwareSearchEngine will map standard JSON keys to Hebrew display keys internally 
                                    // so we expect it to return mapped keys like "מעבד", "RAM", etc.
                                    if (hardwareData[aiKey] && typeof hardwareData[aiKey] === 'string' && aiKey !== "notes") {
                                        const idx = newExtra.findIndex(e => e.key === aiKey);
                                        if (idx >= 0) {
                                            newExtra[idx].value = hardwareData[aiKey];
                                        } else {
                                            newExtra.push({ key: aiKey, value: hardwareData[aiKey] });
                                        }
                                    }
                                });
                                // Make/Model mappings
                                if (hardwareData["יצרן"]) handleChange("make", hardwareData["יצרן"]);
                                if (hardwareData["דגם"]) handleChange("model", hardwareData["דגם"]);
                                setFormData(prev => ({ ...prev, extraData: newExtra }));
                            }}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {(formData.category === "Phones" ? PHONE_FIELDS : COMPUTER_FIELDS).map(field => (
                                <div className="space-y-2" key={field.key}>
                                    <Label className={field.key === "החרגות" ? "text-orange-400" : ""}>{field.label}</Label>
                                    <Input
                                        value={getExtraVal(field.key)}
                                        onChange={e => handleExtraChange(field.key, e.target.value)}
                                        placeholder={field.key === "החרגות" ? "השאר ריק אם תקין" : ""}
                                        dir={/RAM|מעבד|GPU|מספר/.test(field.key) ? 'ltr' : 'rtl'}
                                        className={`bg-gray-800 border-gray-700 ${field.key === "החרגות" ? "border-orange-500/30 text-orange-400 placeholder:text-gray-500" : ""}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Specific Fields for Furniture / Home Decor */}
                {["Furniture", "HomeDecor"].includes(formData.category) && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>חומר</Label>
                            <Input
                                value={getExtraVal("חומר")}
                                onChange={e => handleExtraChange("חומר", e.target.value)}
                                placeholder="עץ, מתכת, בד..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>צבע</Label>
                            <Input
                                value={getExtraVal("צבע")}
                                onChange={e => handleExtraChange("צבע", e.target.value)}
                                placeholder="שחור, לבן, אפור..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )
                }

                {/* Specific Fields for Fashion & Kids */}
                {
                    ["Fashion", "Kids"].includes(formData.category) && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
                            <div className="space-y-2">
                                <Label>מותג</Label>
                                <Input
                                    value={getExtraVal("מותג")}
                                    onChange={e => handleExtraChange("מותג", e.target.value)}
                                    placeholder="Nike, Zara..."
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>מידה</Label>
                                <Input
                                    value={getExtraVal("מידה")}
                                    onChange={e => handleExtraChange("מידה", e.target.value)}
                                    placeholder="למשל: M, 42, גיל 3-4"
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        </div>
                    )
                }

                {/* Specific Fields for Electronics / Audio / Appliances / Sports */}
                {
                    ["Electronics", "Audio", "Appliances", "Sports"].includes(formData.category) && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
                            <div className="space-y-2">
                                <Label>יצרן / מותג</Label>
                                <Input
                                    value={getExtraVal("יצרן")}
                                    onChange={e => handleExtraChange("יצרן", e.target.value)}
                                    placeholder="יצרן הפריט..."
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>שנת ייצור / קניה</Label>
                                <Input
                                    value={formData.year}
                                    onChange={e => handleChange("year", e.target.value.replace(/\D/g, ""))}
                                    placeholder="202X"
                                    maxLength={4}
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        </div>
                    )
                }

                {/* Conflict Warning */}
                {
                    showConflictWarning && detectedMake && (
                        <div className="bg-orange-900/20 border border-orange-500/50 p-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-orange-500/10 p-2 rounded-full">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-400 text-sm">שים לב!</h4>
                                <p className="text-xs text-gray-300">
                                    זיהינו בטקסט שמדובר ברכב מסוג <span className="font-bold text-white">{detectedMake}</span>, אך בחרת <span className="font-bold text-white">{formData.make}</span>. האם אתה בטוח?
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowConflictWarning(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )
                }

                {/* Highlights Section */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-purple-400 font-bold">
                        <Sparkles className="w-4 h-4" /> דגשים חשובים
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2 min-h-[30px] p-2 bg-gray-900/40 rounded-lg border border-gray-800/50">
                        {formData.highlights.length === 0 && <span className="text-xs text-gray-500 italic">לא נבחרו דגשים עדיין...</span>}
                        {formData.highlights.map((h, i) => (
                            <div key={i} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-200">
                                {h}
                                <button type="button" onClick={() => removeHighlight(i)} className="hover:text-red-200 transition-colors"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={highlightInput}
                            onChange={e => setHighlightInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                            placeholder="הקלד דגש חשוב (למשל: יד ראשונה, מצבר חדש...)"
                            className="bg-gray-800 border-gray-700 h-9 text-sm"
                        />
                        <Button type="button" onClick={addHighlight} variant="secondary" size="sm" className="h-9 px-4">
                            <Plus className="w-4 h-4" /> הוסף
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300 font-bold">מספר טלפון ליצירת קשר <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.contactPhone}
                        onChange={e => handleChange("contactPhone", e.target.value)}
                        placeholder="05X-XXXXXXX"
                        dir="ltr"
                        className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-gray-400">יוצג לקונים במודעה</p>
                    {showPhoneUpdate && (
                        <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg flex items-center justify-between gap-4 mt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="text-sm text-blue-200">
                                המספר במודעה שונה מהפרופיל שלך. לעדכן את הפרופיל?
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPhoneUpdate(false)}
                                    className="h-7 text-gray-400 hover:text-white"
                                >
                                    לא
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUpdateProfilePhone}
                                    className="h-7 border-blue-500 text-blue-400 hover:bg-blue-900/50"
                                >
                                    כן, עדכן
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>תיאור</Label>
                    <Textarea
                        value={formData.description}
                        onChange={e => handleChange("description", e.target.value)}
                        placeholder="פרטים נוספים, מידות, סיבת מכירה..."
                        className="bg-gray-800 border-gray-700 min-h-[100px]"
                    />
                </div>

                {/* Suggestions / Missing Fields */}
                {
                    missingFields.filter(f => !["סוג דלק", "מיקום", "שנת ייצור"].includes(f)).length > 0 && (
                        <div className="bg-yellow-900/10 border border-yellow-500/30 p-3 rounded-lg">
                            <div className="text-yellow-500 text-xs font-bold mb-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                המלצת המערכת: כדאי להוסיף את הפרטים הבאים
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {missingFields.filter(f => !["סוג דלק", "מיקום", "שנת ייצור"].includes(f)).map((field) => (
                                    <button
                                        key={field}
                                        type="button"
                                        onClick={() => addSuggestion(field)}
                                        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs border border-yellow-500/30 transition-colors"
                                    >
                                        + {field}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Dynamic Fields Section */}
                <div className="space-y-2 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-purple-300">
                            <Sparkles className="w-3 h-3" /> מפרט מקצועי (זוהה ל{formData.category === "General" ? "מודעה" : formData.category})
                        </Label>
                        {formData.extraData.map((field, index) => {
                            const hiddenKeys = ["יצרן", "דגם", "נפח אחסון", "RAM", "מעבד", "גודל מסך", "סוג המחשב", "כרטיס מסך", "מערכת הפעלה", "לוח אם", "ספק כוח", "מארז וקירור", "החרגות", "סוללה", "חדרים", "קומה", "מ\"ר", "חומר", "צבע", "מותג", "מידה"];
                            if (hiddenKeys.includes(field.key)) return null;
                            return (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        placeholder="שם המאפיין"
                                        value={field.key}
                                        onChange={(e) => updateField(index, e.target.value, field.value)}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                    <Input
                                        placeholder="ערך"
                                        value={field.value}
                                        onChange={(e) => updateField(index, field.key, e.target.value)}
                                        className={`bg-gray-800 border-gray-700 ${field.value.includes("?") ? "border-yellow-500 text-yellow-500" : ""}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeField(index)}
                                        className="text-gray-400 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addField}
                            className="w-full border-dashed border-gray-700 hover:bg-gray-800"
                        >
                            <Plus className="h-4 w-4 mr-2" /> הוסף מאפיין
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>תמונות (העלאה או קישור)</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            value={imageUrlInput}
                            onChange={e => setImageUrlInput(e.target.value)}
                            placeholder="הדבק קישור לתמונה (URL)"
                            className="bg-gray-800 border-gray-700"
                        />
                        <Button type="button" onClick={addImage} size="icon" className="shrink-0 bg-gray-700 hover:bg-gray-600">
                            <Plus className="w-4 h-4" />
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'image')}
                                disabled={uploading}
                            />
                            <Label htmlFor="image-upload" className={`cursor-pointer flex items-center justify-center h-10 w-10 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                            </Label>
                        </div>
                    </div>
                    {formData.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {formData.images.map((img: string, i: number) => (
                                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>סרטונים (העלאה או קישור)</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            value={videoUrlInput}
                            onChange={e => setVideoUrlInput(e.target.value)}
                            placeholder="הדבק קישור לסרטון (URL)"
                            className="bg-gray-800 border-gray-700"
                        />
                        <Button type="button" onClick={addVideo} size="icon" className="shrink-0 bg-gray-700 hover:bg-gray-600">
                            <Plus className="w-4 h-4" />
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                id="video-upload"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'video')}
                                disabled={uploading}
                            />
                            <Label htmlFor="video-upload" className={`cursor-pointer flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-xs font-bold">MP4</span>}
                            </Label>
                        </div>
                    </div>
                    {(formData.videos || []).length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {formData.videos.map((vid: string, i: number) => (
                                <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                                    <video src={vid} controls className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeVideo(i)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tester AI floating panel */}
                {
                    originalAI && isMounted && createPortal(
                        <div
                            className="fixed top-1/4 right-6 z-[99999] flex flex-col gap-2 items-start pointer-events-none"
                            dir="rtl"
                            style={{ transform: `translate(${panelPos.x}px, ${panelPos.y}px)` }}
                        >
                            {!isTestMode && !testerNote && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); document.getElementById('ai-tester-panel')?.classList.toggle('hidden'); }}
                                    className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-black rounded-full px-4 py-3 shadow-xl shadow-amber-500/30 flex items-center gap-2 border border-amber-400/50 transition-all hover:scale-105 backdrop-blur-md cursor-pointer"
                                    title="הוסף הערת בדיקה"
                                >
                                    <Sparkles className="w-5 h-5 text-black" />
                                    <span className="font-bold text-sm">הוסף הערת בדיקה (AI)</span>
                                </button>
                            )}

                            <div id="ai-tester-panel" className={`pointer-events-auto bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-4 w-80 shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl transition-all ${isTestMode || testerNote ? 'block' : 'hidden'} animate-in slide-in-from-bottom-5`}>
                                <div
                                    className={`flex justify-between items-center mb-4 border-b border-amber-500/30 pb-3 ${isDraggingPanel ? 'cursor-grabbing' : 'cursor-grab'} focus:outline-none select-none`}
                                    onPointerDown={handlePointerDownPanel}
                                    onPointerMove={handlePointerMovePanel}
                                    onPointerUp={handlePointerUpPanel}
                                    onPointerCancel={handlePointerUpPanel}
                                >
                                    <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2"><Sparkles className="w-4 h-4" /> הערות בודק למערכת AI</h3>
                                    <button type="button" onClick={() => document.getElementById('ai-tester-panel')?.classList.add('hidden')} className="text-gray-400 hover:text-white leading-none text-2xl p-1">×</button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-amber-500/10 rounded-lg p-2.5 flex items-center justify-between border border-amber-500/20">
                                        <span className="text-xs text-amber-200">בודק:</span>
                                        <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{testerName}</span>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-amber-200 mb-1 block">הערות על זיהוי שגוי / חסר 👇</Label>
                                        <Textarea
                                            rows={4}
                                            className="text-sm bg-black/60 border-amber-500/30 resize-none focus:border-amber-500 text-white placeholder-gray-500"
                                            value={testerNote}
                                            onChange={e => setTesterNote(e.target.value)}
                                            placeholder="לדוגמה: מחיר יצא 0, לא זיהה יד 2, דגם שגוי..."
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={submitTesterNote}
                                        disabled={!testerNote.trim()}
                                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        שלח הערה למערכת ✓
                                    </button>
                                </div>
                            </div>
                        </div>
                        , document.body)
                }

                <div className="border-t border-amber-500/20 pt-4 mb-4">
                    <label className="flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-900/80 rounded-xl cursor-pointer transition-colors border border-amber-500/20">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="w-5 h-5 peer appearance-none border-2 border-amber-500/50 rounded-md bg-black checked:bg-amber-500 transition-all cursor-pointer"
                                checked={isTestMode}
                                onChange={e => setIsTestMode(e.target.checked)}
                            />
                            <svg className="absolute w-3 h-3 text-black left-1 top-[4px] pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-amber-200 text-sm font-bold">שמור כמודעת טסט (לא תפורסם בלוח הפומבי)</span>
                            <span className="text-gray-400 text-xs mt-0.5">תוצאות ה-AI נשמרות אוטומטית למטרות בדיקה ושיפור המערכת</span>
                        </div>
                    </label>
                </div>

                <Button type="submit" disabled={loading} className={`w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all ${isTestMode ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30" : "bg-green-600 hover:bg-green-700 shadow-green-500/30"}`}>
                    {loading ? <Loader2 className="animate-spin" /> : isTestMode ? "שמור בדיקת AI" : isEditing ? "עדכן מודעה" : "פרסם מודעה"}
                </Button>
            </form >
        </div >
    );
}
