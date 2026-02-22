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
import { createListing, updateListing, parseLinkMetadata, updateUserPhone, getAiKnowledge } from "@/app/actions/marketplace";
import { analyzeListingText } from "@/lib/listing-ai";
import { CAR_MODELS } from "@/lib/car-data";
import { Loader2, Plus, Image as ImageIcon, X, Sparkles, Link as LinkIcon, Edit3, Trash2, Mic, MicOff } from "lucide-react";
import Link from "next/link";

const CATEGORY_MAP: Record<string, string> = {
    "╫¿╫¢╫ס": "Vehicles",
    "╫á╫ף╫£╫ƒ": "Real Estate",
    "╫ר╫£╫ñ╫ץ╫á╫ש╫¥": "Phones",
    "╫₧╫ק╫⌐╫ס╫ש╫¥": "Computers",
    "╫נ╫£╫º╫ר╫¿╫ץ╫á╫ש╫º╫פ": "Electronics",
    "╫¿╫ש╫פ╫ץ╫ר": "Furniture",
    "╫₧╫ץ╫ª╫¿╫ש ╫ק╫⌐╫₧╫£ ╫£╫ס╫ש╫¬": "Appliances",
    "╫₧╫ץ╫ª╫¿╫ש ╫ק╫⌐╫₧╫£": "Appliances",
    "╫ס╫ש╫ע╫ץ╫ף ╫ץ╫נ╫ץ╫ñ╫á╫פ": "Fashion",
    "╫í╫ñ╫ץ╫¿╫ר ╫ץ╫ñ╫á╫נ╫ש": "Sports",
    "╫¬╫ש╫á╫ץ╫º╫ץ╫¬ ╫ץ╫ש╫£╫ף╫ש╫¥": "Kids",
    "╫ק╫ש╫ץ╫¬ ╫₧╫ק╫₧╫ף": "Pets",
    "╫¢╫£╫ש ╫ó╫ס╫ץ╫ף╫פ ╫ץ╫₧╫ץ╫í╫ת": "Tools",
    "╫ס╫¿╫ש╫נ╫ץ╫¬ ╫ץ╫º╫ץ╫í╫₧╫ר╫ש╫º╫פ": "Health",
    "╫¢╫£╫ש ╫á╫ע╫ש╫á╫פ": "Audio",
    "╫¬╫ק╫ס╫ש╫ס╫ש╫¥ ╫ץ╫נ╫₧╫á╫ץ╫¬": "Hobbies",
    "╫í╫ñ╫¿╫ש╫¥ ╫ץ╫₧╫ף╫ש╫פ": "Books",
    "╫ס╫ש╫¬ ╫ץ╫ע╫ש╫á╫פ": "HomeDecor",
    "╫¢╫£╫£╫ש": "General"
};

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
    "╫ק╫ף╫⌐": "New",
    "╫¢╫₧╫ץ ╫ק╫ף╫⌐": "Like New",
    "╫₧╫⌐╫ץ╫₧╫⌐": "Used",
    "╫₧╫ק╫ץ╫ף╫⌐": "Refurbished",
    "╫£╫ק╫£╫º╫ש╫¥": "Refurbished"
};

// --- Vehicle Field Helpers ---
const isKmKey = (k: string) => /╫º╫ש╫£╫ץ╫₧╫ר|╫º"╫₧|╫º╫₧|km/i.test(k);
const isYearKey = (k: string) => /╫⌐╫á╫¬|╫⌐╫á╫פ|model|year/i.test(k);
const isHandKey = (k: string) => /╫ש╫ף|hand/i.test(k);


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
            // Separate Highlights ("╫ף╫ע╫⌐╫ש╫¥")
            const highlightsAttrs = data.attributes.filter((attr: any) => attr.key === "╫ף╫ע╫⌐╫ש╫¥");
            // Filter out highlights AND vehicle fields (year, hand, km) so they don't appear in extraData
            const otherAttrs = data.attributes.filter((attr: any) =>
                attr.key !== "╫ף╫ע╫⌐╫ש╫¥" &&
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
        contactPhone: initialData?.contactPhone || "",
        extraData: processed.extraData,
        highlights: processed.highlights
    });

    const [imageUrlInput, setImageUrlInput] = useState("");
    const [videoUrlInput, setVideoUrlInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>(initialData?.missingFields || []);
    const [highlightInput, setHighlightInput] = useState("");
    const [showPhoneUpdate, setShowPhoneUpdate] = useState(false);

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
    const [testerName, setTesterName] = useState(user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "╫נ╫ץ╫¿╫ק");
    const [testerNote, setTesterNote] = useState("");
    const [isTestMode, setIsTestMode] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const submitTesterNote = async () => {
        const logId = localStorage.getItem("currentParserLogId");
        if (!logId) {
            alert("╫£╫נ ╫á╫₧╫ª╫נ ╫¬╫ש╫ó╫ץ╫ף AI ╫£╫₧╫ץ╫ף╫ó╫פ ╫צ╫ץ ╫ס╫í╫⌐╫ƒ ╫פ╫á╫ץ╫¢╫ק╫ש. ╫á╫í╫פ ╫£╫ס╫ª╫ó ╫º╫¿╫ש╫נ╫¬ AI ╫₧╫ק╫ף╫⌐.");
            return;
        }
        if (!testerNote.trim()) {
            alert("╫נ╫á╫נ ╫¢╫¬╫ץ╫ס ╫פ╫ó╫¿╫פ ╫£╫ñ╫á╫ש ╫פ╫⌐╫₧╫ש╫¿╫פ.");
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
            alert("╫פ╫פ╫ó╫¿╫פ ╫á╫⌐╫₧╫¿╫פ ╫ס╫פ╫ª╫£╫ק╫פ ╫ס╫נ╫ף╫₧╫ש╫ƒ Γ£ף");
        } catch (error) {
            console.error(error);
            alert("╫⌐╫ע╫ש╫נ╫פ ╫ס╫⌐╫₧╫ש╫¿╫¬ ╫פ╫ó╫¿╫פ.");
        }
    };

    useEffect(() => {
        if (user && (!testerName || testerName === "╫נ╫ץ╫¿╫ק")) {
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
            alert("╫⌐╫ע╫ש╫נ╫פ ╫ס╫ó╫ף╫¢╫ץ╫ƒ ╫פ╫ר╫£╫ñ╫ץ╫ƒ");
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
            setRecordingError("╫פ╫ף╫ñ╫ף╫ñ╫ƒ ╫⌐╫£╫ת ╫£╫נ ╫¬╫ץ╫₧╫ת ╫ס╫פ╫º╫£╫ר╫¬ ╫º╫ץ╫£. ╫á╫í╫פ Chrome ╫נ╫ץ Safari ╫ó╫ף╫¢╫á╫ש.");
            return;
        }

        const createAndStart = () => {
            const recognition = new SpeechRecognition();
            recognition.lang = "he-IL";
            // iOS doesn't support continuous well Γאפ it auto-stops; we restart manually
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
                    setRecordingError("╫⌐╫ע╫ש╫נ╫¬ ╫¿╫⌐╫¬. ╫ס╫ף╫ץ╫º ╫ק╫ש╫ס╫ץ╫¿ ╫£╫נ╫ש╫á╫ר╫¿╫á╫ר.");
                    userStoppedRef.current = true;
                    setIsRecording(false);
                    return;
                }
                if (event.error === "not-allowed") {
                    setRecordingError("╫נ╫ש╫ƒ ╫פ╫¿╫⌐╫נ╫פ ╫£╫₧╫ש╫º╫¿╫ץ╫ñ╫ץ╫ƒ. ╫נ╫⌐╫¿ ╫ע╫ש╫⌐╫פ ╫ס╫פ╫ע╫ף╫¿╫ץ╫¬ ╫פ╫ף╫ñ╫ף╫ñ╫ƒ.");
                    userStoppedRef.current = true;
                    setIsRecording(false);
                    return;
                }
                setRecordingError("╫⌐╫ע╫ש╫נ╫פ: " + event.error);
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
                // Already started Γאפ ignore
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
                    alert("╫£╫נ ╫פ╫ª╫£╫ק╫á╫ץ ╫£╫⌐╫נ╫ץ╫ס ╫ñ╫¿╫ר╫ש╫¥ ╫₧╫פ╫º╫ש╫⌐╫ץ╫¿ ╫פ╫צ╫פ. ╫á╫í╫פ ╫£╫פ╫ó╫¬╫ש╫º ╫נ╫¬ ╫פ╫ר╫º╫í╫ר ╫ש╫ף╫á╫ש╫¬.");
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

            // Extract highlights from attributes (key="╫ף╫ע╫⌐╫ש╫¥")
            const extractedHighlights = analysis.attributes
                .filter(a => a.key === "╫ף╫ע╫⌐╫ש╫¥")
                .map(a => a.value);

            // Filter out highlights and now-native vehicle fields from attributes
            const filteredAttributes = analysis.attributes.filter(a =>
                a.key !== "╫ף╫ע╫⌐╫ש╫¥" &&
                !isYearKey(a.key) &&
                !isHandKey(a.key) &&
                !isKmKey(a.key)
            );

            // Map Category and Condition
            const mappedCategory = CATEGORY_MAP[analysis.category] || "General";
            const mappedCondition = CONDITION_MAP[analysis.condition] || "Used";

            const kmAttr = analysis.attributes.find(a => a.key.includes("╫º╫ש╫£╫ץ╫₧╫ר") || a.key.includes("╫º\"╫₧") || a.key === "╫º╫₧");
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
                            testerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '╫נ╫ץ╫¿╫ק',
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
            alert(`╫נ╫ש╫¿╫ó╫פ ╫⌐╫ע╫ש╫נ╫פ ╫ס╫á╫ש╫¬╫ץ╫ק ╫פ╫₧╫ץ╫ף╫ó╫פ: ${error?.message || "╫⌐╫ע╫ש╫נ╫פ ╫£╫נ ╫ש╫ף╫ץ╫ó╫פ"}`);
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
            extraDataObject["╫ר╫£╫ñ╫ץ╫ƒ ╫£╫ש╫ª╫ש╫¿╫¬ ╫º╫⌐╫¿"] = formData.contactPhone;
        }

        // Add highlights to extraData as a comma-separated string
        if (formData.highlights.length > 0) {
            extraDataObject["╫ף╫ע╫⌐╫ש╫¥"] = formData.highlights.join(", ");
        }

        // Add model if present
        if (formData.make) {
            extraDataObject["╫ש╫ª╫¿╫ƒ"] = formData.make === "Other" ? customMake : formData.make;
        }
        if (formData.model) {
            extraDataObject["╫ף╫ע╫¥"] = (formData.model === "Other" || formData.model === "OtherModel") ? customModel : formData.model;
        }

        // Add vehicle specific fields if present
        if (formData.year) extraDataObject["╫⌐╫á╫¬ ╫ש╫ש╫ª╫ץ╫¿"] = formData.year;
        if (formData.hand) extraDataObject["╫ש╫ף"] = formData.hand;
        if (formData.kilometrage) extraDataObject["╫º╫ש╫£╫ץ╫₧╫ר╫¿╫נ╫צ'"] = formData.kilometrage;

        console.log("Submitting form data:", {
            title: formData.title,
            price: formData.price,
            imagesType: typeof formData.images,
            imagesIsArray: Array.isArray(formData.images),
            imagesLen: formData.images?.length,
            extraData: extraDataObject
        });

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
                alert("╫פ╫₧╫ץ╫ף╫ó╫פ ╫á╫⌐╫₧╫¿╫פ ╫ס╫£╫ץ╫ע╫ש ╫פ╫ס╫ף╫ש╫º╫פ ╫ס╫פ╫ª╫£╫ק╫פ (╫£╫נ ╫ñ╫ץ╫¿╫í╫₧╫פ).");
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
            "Vehicles": "╫¿╫¢╫ס ≡ƒתק",
            "Real Estate": "╫á╫ף╫£╫ƒ ≡ƒןá",
            "Phones": "╫ר╫£╫ñ╫ץ╫á╫ש╫¥ ≡ƒף▒",
            "Computers": "╫₧╫ק╫⌐╫ס╫ש╫¥ ≡ƒע╗",
            "Electronics": "╫נ╫£╫º╫ר╫¿╫ץ╫á╫ש╫º╫פ ≡ƒףí",
            "Furniture": "╫¿╫ש╫פ╫ץ╫ר ≡ƒ¢כ∩╕ן",
            "Appliances": "╫₧╫ץ╫ª╫¿╫ש ╫ק╫⌐╫₧╫£ ≡ƒפל",
            "Fashion": "╫נ╫ץ╫ñ╫á╫פ ╫ץ╫ס╫ש╫ע╫ץ╫ף ≡ƒסק",
            "Sports": "╫í╫ñ╫ץ╫¿╫ר ╫ץ╫ñ╫á╫נ╫ש Γת╜",
            "Kids": "╫¬╫ש╫á╫ץ╫º╫ץ╫¬ ╫ץ╫ש╫£╫ף╫ש╫¥ ≡ƒº╕",
            "Pets": "╫ק╫ש╫ץ╫¬ ╫₧╫ק╫₧╫ף ≡ƒנ╛",
            "Tools": "╫¢╫£╫ש ╫ó╫ס╫ץ╫ף╫פ ≡ƒפº",
            "Health": "╫ס╫¿╫ש╫נ╫ץ╫¬ ╫ץ╫º╫ץ╫í╫₧╫ר╫ש╫º╫פ ≡ƒעך",
            "Audio": "╫נ╫ץ╫ף╫ש╫ץ ╫ץ╫í╫נ╫ץ╫á╫ף ≡ƒפך",
            "Hobbies": "╫¬╫ק╫ס╫ש╫ס╫ש╫¥ ╫ץ╫נ╫₧╫á╫ץ╫¬ ≡ƒמ¿",
            "Books": "╫í╫ñ╫¿╫ש╫¥ ╫ץ╫₧╫ף╫ש╫פ ≡ƒףת",
            "HomeDecor": "╫ó╫ש╫ª╫ץ╫ס ╫פ╫ס╫ש╫¬ ≡ƒצ╝∩╕ן",
            "General": "╫¢╫£╫£╫ש ╫ץ╫º╫⌐╫º╫ץ╫⌐╫ש╫¥ ≡ƒףª"
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
                    <Button variant="ghost" onClick={() => { stopRecording(); setMode('manual'); }} className="text-gray-400">╫ק╫צ╫ץ╫¿</Button>
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
                            {isRecording ? '≡ƒפ┤ ╫₧╫º╫£╫ש╫ר... ╫ף╫ס╫¿╫ץ!' : '≡ƒמש∩╕ן ╫פ╫º╫£╫ר╫¬ ╫º╫ץ╫£'}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {isRecording ? '╫£╫ק╫ª╫ץ ╫⌐╫ץ╫ס ╫ס╫í╫ש╫ץ╫¥ ╫£╫ó╫ª╫ץ╫¿' : '╫£╫ק╫ª╫ץ ╫ó╫£ ╫פ╫₧╫ש╫º╫¿╫ץ╫ñ╫ץ╫ƒ ╫¢╫ף╫ש ╫£╫פ╫¬╫ק╫ש╫£'}
                        </p>
                    </div>
                </div>

                {/* Live Transcript */}
                {(displayText || interimText) && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 min-h-[80px] text-right">
                        <p className="text-sm text-gray-400 mb-1">╫₧╫פ ╫⌐╫á╫נ╫₧╫¿:</p>
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
                        {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> ╫á╫¬╫ק ╫נ╫¬ ╫₧╫פ ╫⌐╫נ╫₧╫¿╫¬╫ש</span>}
                    </Button>
                )}
            </div>
        );
    }

    if (mode !== 'manual') {
        return (
            <div className="space-y-6 py-4">
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" onClick={() => setMode('manual')} className="text-gray-400">╫ק╫צ╫ץ╫¿</Button>
                </div>

                <div className="text-center space-y-2">
                    <div className="h-16 w-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-purple-400">
                        {mode === 'magic_link' ? <LinkIcon className="w-8 h-8" /> : <Edit3 className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold">
                        {mode === 'magic_link' ? "╫פ╫ף╫ס╫º ╫º╫ש╫⌐╫ץ╫¿ ╫ץ╫פ╫₧╫ó╫¿╫¢╫¬ ╫¬╫ó╫ס╫ץ╫ף ╫ס╫⌐╫ס╫ש╫£╫ת" : "╫פ╫ף╫ס╫º ╫נ╫¬ ╫פ╫ר╫º╫í╫ר ╫⌐╫£ ╫פ╫₧╫ץ╫ף╫ó╫פ"}
                    </h3>
                    <p className="text-sm text-gray-400">
                        ╫פ╫₧╫ץ╫₧╫ק╫פ ╫⌐╫£╫á╫ץ ╫ש╫á╫¬╫ק ╫נ╫¬ ╫פ╫₧╫ץ╫ף╫ó╫פ ╫ץ╫ש╫₧╫£╫ש╫Ñ ╫ó╫£ ╫פ╫ñ╫¿╫ר╫ש╫¥ ╫פ╫ק╫⌐╫ץ╫ס╫ש╫¥ ╫£╫º╫ץ╫á╫ש╫¥.
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
                            placeholder="╫£╫₧╫⌐╫£: ╫£╫₧╫¢╫ש╫¿╫פ ╫í╫ñ╫פ ╫ס╫ª╫ס╫ó ╫נ╫ñ╫ץ╫¿, ╫⌐╫₧╫ץ╫¿╫פ ╫¢╫ק╫ף╫⌐╫פ, ╫₧╫ק╫ש╫¿ 500 ╫⌐╫┤╫ק..."
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
                        {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> ╫á╫¬╫ק ╫ס╫ª╫ץ╫¿╫פ ╫ק╫¢╫₧╫פ</span>}
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
                    <span className="text-gray-400 text-sm">╫º╫ר╫ע╫ץ╫¿╫ש╫פ:</span>
                    <span className="font-bold text-purple-400 text-lg">{getCategoryLabel(formData.category)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs border-gray-700 bg-gray-800">
                            <span className="truncate">{getCategoryLabel(formData.category)}</span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Vehicles">╫¿╫¢╫ס ≡ƒתק</SelectItem>
                            <SelectItem value="Real Estate">╫á╫ף╫£╫ƒ ≡ƒןá</SelectItem>
                            <SelectItem value="Phones">╫ר╫£╫ñ╫ץ╫á╫ש╫¥ ≡ƒף▒</SelectItem>
                            <SelectItem value="Computers">╫₧╫ק╫⌐╫ס╫ש╫¥ ≡ƒע╗</SelectItem>
                            <SelectItem value="Electronics">╫נ╫£╫º╫ר╫¿╫ץ╫á╫ש╫º╫פ ≡ƒףí</SelectItem>
                            <SelectItem value="Furniture">╫¿╫ש╫פ╫ץ╫ר ≡ƒ¢כ∩╕ן</SelectItem>
                            <SelectItem value="Appliances">╫₧╫ץ╫ª╫¿╫ש ╫ק╫⌐╫₧╫£ ≡ƒפל</SelectItem>
                            <SelectItem value="Fashion">╫נ╫ץ╫ñ╫á╫פ ╫ץ╫ס╫ש╫ע╫ץ╫ף ≡ƒסק</SelectItem>
                            <SelectItem value="Sports">╫í╫ñ╫ץ╫¿╫ר ╫ץ╫ñ╫á╫נ╫ש Γת╜</SelectItem>
                            <SelectItem value="Kids">╫¬╫ש╫á╫ץ╫º╫ץ╫¬ ╫ץ╫ש╫£╫ף╫ש╫¥ ≡ƒº╕</SelectItem>
                            <SelectItem value="Pets">╫ק╫ש╫ץ╫¬ ╫₧╫ק╫₧╫ף ≡ƒנ╛</SelectItem>
                            <SelectItem value="Tools">╫¢╫£╫ש ╫ó╫ס╫ץ╫ף╫פ ≡ƒפº</SelectItem>
                            <SelectItem value="Health">╫ס╫¿╫ש╫נ╫ץ╫¬ ╫ץ╫º╫ץ╫í╫₧╫ר╫ש╫º╫פ ≡ƒעך</SelectItem>
                            <SelectItem value="Audio">╫נ╫ץ╫ף╫ש╫ץ ╫ץ╫í╫נ╫ץ╫á╫ף ≡ƒפך</SelectItem>
                            <SelectItem value="Hobbies">╫¬╫ק╫ס╫ש╫ס╫ש╫¥ ╫ץ╫נ╫₧╫á╫ץ╫¬ ≡ƒמ¿</SelectItem>
                            <SelectItem value="Books">╫í╫ñ╫¿╫ש╫¥ ╫ץ╫₧╫ף╫ש╫פ ≡ƒףת</SelectItem>
                            <SelectItem value="HomeDecor">╫ó╫ש╫ª╫ץ╫ס ╫פ╫ס╫ש╫¬ ≡ƒצ╝∩╕ן</SelectItem>
                            <SelectItem value="General">╫¢╫£╫£╫ש / ╫נ╫ק╫¿ ≡ƒףª</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" onClick={() => setMode('magic_link')} className="text-blue-400 p-1 h-8 w-8" title="╫ש╫ש╫ס╫ץ╫נ ╫₧╫º╫ש╫⌐╫ץ╫¿">
                        <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setMode('magic_text')} className="text-green-400 p-1 h-8 w-8" title="╫פ╫ó╫¬╫º-╫פ╫ף╫ס╫º ╫ר╫º╫í╫ר">
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setVoiceTranscript(""); setRecordingError(""); setMode('magic_voice'); }} className="text-red-400 p-1 h-8 w-8" title="╫פ╫º╫£╫ר╫¬ ╫º╫ץ╫£">
                        <Mic className="w-4 h-4" />
                    </Button>

                    {/* Back Button removed (moved to page header) */}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>╫¢╫ץ╫¬╫¿╫¬ ╫פ╫₧╫ץ╫ª╫¿</Label>
                    <Input
                        value={formData.title}
                        onChange={e => handleChange("title", e.target.value)}
                        placeholder="╫£╫₧╫⌐╫£: ╫í╫ñ╫פ ╫ף╫ץ-╫₧╫ץ╫⌐╫ס╫ש╫¬ ╫ס╫₧╫ª╫ס ╫₧╫ª╫ץ╫ש╫ש╫ƒ"
                        required
                        className="bg-gray-800 border-gray-700"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>╫₧╫ק╫ש╫¿ (Γג¬) <span className="text-red-500">*</span></Label>
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
                        <Label>╫₧╫ª╫ס</Label>
                        <Select value={formData.condition} onValueChange={val => handleChange("condition", val)}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="╫ס╫ק╫¿ ╫₧╫ª╫ס" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="New">╫ק╫ף╫⌐</SelectItem>
                                <SelectItem value="Like New">╫¢╫₧╫ץ ╫ק╫ף╫⌐</SelectItem>
                                <SelectItem value="Used">╫₧╫⌐╫ץ╫₧╫⌐</SelectItem>
                                <SelectItem value="Refurbished">╫₧╫ק╫ץ╫ף╫⌐</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Make & Model Fields - Only for Vehicles */}
                {formData.category === "Vehicles" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>╫ש╫ª╫¿╫ƒ</Label>
                            <Select
                                value={formData.make}
                                onValueChange={val => {
                                    handleChange("make", val);
                                    handleChange("model", ""); // Reset model when make changes
                                }}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="╫ס╫ק╫¿ ╫ש╫ª╫¿╫ƒ" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="Other" className="font-bold border-b mb-1">╫נ╫ק╫¿ (╫£╫נ ╫ס╫¿╫⌐╫ש╫₧╫פ)</SelectItem>
                                    {Object.keys(CAR_MODELS).sort((a, b) => a.localeCompare(b, "he")).map(make => (
                                        <SelectItem key={make} value={make}>{make}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>╫ף╫ע╫¥</Label>
                            <Select
                                value={formData.model}
                                onValueChange={val => {
                                    handleChange("model", val);
                                    setCustomModel(""); // Reset custom model
                                }}
                                disabled={!formData.make || formData.make === "Other"}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="╫ס╫ק╫¿ ╫ף╫ע╫¥" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {formData.make && CAR_MODELS[formData.make] ? (
                                        CAR_MODELS[formData.make].map(model => (
                                            <SelectItem key={model} value={model}>{model}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="Other" disabled>╫ס╫ק╫¿ ╫ש╫ª╫¿╫ƒ ╫¬╫ק╫ש╫£╫פ</SelectItem>
                                    )}
                                    <SelectItem value="OtherModel">╫ף╫ע╫¥ ╫נ╫ק╫¿ / ╫£╫נ ╫ס╫¿╫⌐╫ש╫₧╫פ</SelectItem>
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
                                <Label>╫ש╫ª╫¿╫ƒ (╫נ╫ק╫¿)</Label>
                                <Input
                                    value={customMake}
                                    onChange={e => setCustomMake(e.target.value)}
                                    placeholder="╫פ╫¢╫á╫í ╫⌐╫¥ ╫ש╫ª╫¿╫ƒ"
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        )}
                        {(formData.model === "OtherModel" || (formData.make === "Other" && formData.make)) && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>╫ף╫ע╫¥ (╫נ╫ק╫¿)</Label>
                                <Input
                                    value={customModel}
                                    onChange={e => setCustomModel(e.target.value)}
                                    placeholder="╫פ╫¢╫á╫í ╫⌐╫¥ ╫ף╫ע╫¥"
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
                            <Label>╫⌐╫á╫¬ ╫ש╫ש╫ª╫ץ╫¿</Label>
                            <Input
                                value={formData.year}
                                onChange={e => handleChange("year", e.target.value.replace(/\D/g, ""))}
                                placeholder="202X"
                                maxLength={4}
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫ש╫ף</Label>
                            <Input
                                value={formData.hand}
                                onChange={e => handleChange("hand", e.target.value)}
                                placeholder="1, 2..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫º╫ש╫£╫ץ╫₧╫ר╫¿╫נ╫צ&apos;</Label>
                            <Input
                                value={formData.kilometrage ? Number(formData.kilometrage.toString().replace(/,/g, "")).toLocaleString() : ""}
                                onChange={e => {
                                    const val = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                                    handleChange("kilometrage", val);
                                }}
                                placeholder="╫º╫┤╫₧"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )}

                {/* Specific Fields for Real Estate */}
                {formData.category === "Real Estate" && (
                    <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>╫₧╫í╫ñ╫¿ ╫ק╫ף╫¿╫ש╫¥</Label>
                            <Input
                                value={getExtraVal("╫ק╫ף╫¿╫ש╫¥")}
                                onChange={e => handleExtraChange("╫ק╫ף╫¿╫ש╫¥", e.target.value)}
                                placeholder="3.5"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫º╫ץ╫₧╫פ</Label>
                            <Input
                                value={getExtraVal("╫º╫ץ╫₧╫פ")}
                                onChange={e => handleExtraChange("╫º╫ץ╫₧╫פ", e.target.value)}
                                placeholder="2 ╫₧╫¬╫ץ╫ת 4"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫₧╫┤╫¿</Label>
                            <Input
                                value={getExtraVal("╫₧\"╫¿")}
                                onChange={e => handleExtraChange("╫₧\"╫¿", e.target.value)}
                                placeholder="100"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )}

                {/* Specific Fields for Phones & Computers */}
                {["Phones", "Computers"].includes(formData.category) && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>╫ש╫ª╫¿╫ƒ</Label>
                            <Input
                                value={getExtraVal("╫ש╫ª╫¿╫ƒ")}
                                onChange={e => handleExtraChange("╫ש╫ª╫¿╫ƒ", e.target.value)}
                                placeholder="╫£╫₧╫⌐╫£: Apple, Samsung"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫ף╫ע╫¥</Label>
                            <Input
                                value={getExtraVal("╫ף╫ע╫¥")}
                                onChange={e => handleExtraChange("╫ף╫ע╫¥", e.target.value)}
                                placeholder="iPhone 13 / Galaxy S21"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫á╫ñ╫ק ╫נ╫ק╫í╫ץ╫ƒ (GB)</Label>
                            <Input
                                value={getExtraVal("╫á╫ñ╫ק ╫נ╫ק╫í╫ץ╫ƒ")}
                                onChange={e => handleExtraChange("╫á╫ñ╫ק ╫נ╫ק╫í╫ץ╫ƒ", e.target.value)}
                                placeholder="128 / 256 / 512"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        {formData.category === "Computers" && (
                            <div className="space-y-2">
                                <Label>╫צ╫ש╫¢╫¿╫ץ╫ƒ (RAM)</Label>
                                <Input
                                    value={getExtraVal("╫צ╫ש╫¢╫¿╫ץ╫ƒ RAM")}
                                    onChange={e => handleExtraChange("╫צ╫ש╫¢╫¿╫ץ╫ƒ RAM", e.target.value)}
                                    placeholder="16GB"
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        )}
                        {formData.category === "Phones" && (
                            <div className="space-y-2">
                                <Label>╫ס╫¿╫ש╫נ╫ץ╫¬ ╫í╫ץ╫£╫£╫פ (%)</Label>
                                <Input
                                    value={getExtraVal("╫í╫ץ╫£╫£╫פ")}
                                    onChange={e => handleExtraChange("╫í╫ץ╫£╫£╫פ", e.target.value)}
                                    placeholder="85%"
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Specific Fields for Furniture / Home Decor */}
                {["Furniture", "HomeDecor"].includes(formData.category) && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>╫ק╫ץ╫₧╫¿</Label>
                            <Input
                                value={getExtraVal("╫ק╫ץ╫₧╫¿")}
                                onChange={e => handleExtraChange("╫ק╫ץ╫₧╫¿", e.target.value)}
                                placeholder="╫ó╫Ñ, ╫₧╫¬╫¢╫¬, ╫ס╫ף..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫ª╫ס╫ó</Label>
                            <Input
                                value={getExtraVal("╫ª╫ס╫ó")}
                                onChange={e => handleExtraChange("╫ª╫ס╫ó", e.target.value)}
                                placeholder="╫⌐╫ק╫ץ╫¿, ╫£╫ס╫ƒ, ╫נ╫ñ╫ץ╫¿..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )}

                {/* Specific Fields for Fashion & Kids */}
                {["Fashion", "Kids"].includes(formData.category) && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>╫₧╫ץ╫¬╫ע</Label>
                            <Input
                                value={getExtraVal("╫₧╫ץ╫¬╫ע")}
                                onChange={e => handleExtraChange("╫₧╫ץ╫¬╫ע", e.target.value)}
                                placeholder="Nike, Zara..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫₧╫ש╫ף╫פ</Label>
                            <Input
                                value={getExtraVal("╫₧╫ש╫ף╫פ")}
                                onChange={e => handleExtraChange("╫₧╫ש╫ף╫פ", e.target.value)}
                                placeholder="╫£╫₧╫⌐╫£: M, 42, ╫ע╫ש╫£ 3-4"
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )}

                {/* Specific Fields for Electronics / Audio / Appliances / Sports */}
                {["Electronics", "Audio", "Appliances", "Sports"].includes(formData.category) && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
                        <div className="space-y-2">
                            <Label>╫ש╫ª╫¿╫ƒ / ╫₧╫ץ╫¬╫ע</Label>
                            <Input
                                value={getExtraVal("╫ש╫ª╫¿╫ƒ")}
                                onChange={e => handleExtraChange("╫ש╫ª╫¿╫ƒ", e.target.value)}
                                placeholder="╫ש╫ª╫¿╫ƒ ╫פ╫ñ╫¿╫ש╫ר..."
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>╫⌐╫á╫¬ ╫ש╫ש╫ª╫ץ╫¿ / ╫º╫á╫ש╫פ</Label>
                            <Input
                                value={formData.year}
                                onChange={e => handleChange("year", e.target.value.replace(/\D/g, ""))}
                                placeholder="202X"
                                maxLength={4}
                                className="bg-gray-800 border-gray-700"
                            />
                        </div>
                    </div>
                )}

                {/* Conflict Warning */}
                {showConflictWarning && detectedMake && (
                    <div className="bg-orange-900/20 border border-orange-500/50 p-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-orange-500/10 p-2 rounded-full">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-400 text-sm">╫⌐╫ש╫¥ ╫£╫ס!</h4>
                            <p className="text-xs text-gray-300">
                                ╫צ╫ש╫פ╫ש╫á╫ץ ╫ס╫ר╫º╫í╫ר ╫⌐╫₧╫ף╫ץ╫ס╫¿ ╫ס╫¿╫¢╫ס ╫₧╫í╫ץ╫ע <span className="font-bold text-white">{detectedMake}</span>, ╫נ╫ת ╫ס╫ק╫¿╫¬ <span className="font-bold text-white">{formData.make}</span>. ╫פ╫נ╫¥ ╫נ╫¬╫פ ╫ס╫ר╫ץ╫ק?
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
                )}

                {/* Highlights Section */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-purple-400 font-bold">
                        <Sparkles className="w-4 h-4" /> ╫ף╫ע╫⌐╫ש╫¥ ╫ק╫⌐╫ץ╫ס╫ש╫¥
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2 min-h-[30px] p-2 bg-gray-900/40 rounded-lg border border-gray-800/50">
                        {formData.highlights.length === 0 && <span className="text-xs text-gray-500 italic">╫£╫נ ╫á╫ס╫ק╫¿╫ץ ╫ף╫ע╫⌐╫ש╫¥ ╫ó╫ף╫ש╫ש╫ƒ...</span>}
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
                            placeholder="╫פ╫º╫£╫ף ╫ף╫ע╫⌐ ╫ק╫⌐╫ץ╫ס (╫£╫₧╫⌐╫£: ╫ש╫ף ╫¿╫נ╫⌐╫ץ╫á╫פ, ╫₧╫ª╫ס╫¿ ╫ק╫ף╫⌐...)"
                            className="bg-gray-800 border-gray-700 h-9 text-sm"
                        />
                        <Button type="button" onClick={addHighlight} variant="secondary" size="sm" className="h-9 px-4">
                            <Plus className="w-4 h-4" /> ╫פ╫ץ╫í╫ú
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>╫₧╫í╫ñ╫¿ ╫ר╫£╫ñ╫ץ╫ƒ ╫£╫ש╫ª╫ש╫¿╫¬ ╫º╫⌐╫¿</Label>
                    <Input
                        value={formData.contactPhone}
                        onChange={e => handleChange("contactPhone", e.target.value)}
                        placeholder="05X-XXXXXXX"
                        className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-gray-400">╫ש╫ץ╫ª╫ע ╫£╫º╫ץ╫á╫ש╫¥ ╫ס╫₧╫ץ╫ף╫ó╫פ</p>
                    {showPhoneUpdate && (
                        <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg flex items-center justify-between gap-4 mt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="text-sm text-blue-200">
                                ╫פ╫₧╫í╫ñ╫¿ ╫ס╫₧╫ץ╫ף╫ó╫פ ╫⌐╫ץ╫á╫פ ╫₧╫פ╫ñ╫¿╫ץ╫ñ╫ש╫£ ╫⌐╫£╫ת. ╫£╫ó╫ף╫¢╫ƒ ╫נ╫¬ ╫פ╫ñ╫¿╫ץ╫ñ╫ש╫£?
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPhoneUpdate(false)}
                                    className="h-7 text-gray-400 hover:text-white"
                                >
                                    ╫£╫נ
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUpdateProfilePhone}
                                    className="h-7 border-blue-500 text-blue-400 hover:bg-blue-900/50"
                                >
                                    ╫¢╫ƒ, ╫ó╫ף╫¢╫ƒ
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>╫¬╫ש╫נ╫ץ╫¿</Label>
                    <Textarea
                        value={formData.description}
                        onChange={e => handleChange("description", e.target.value)}
                        placeholder="╫ñ╫¿╫ר╫ש╫¥ ╫á╫ץ╫í╫ñ╫ש╫¥, ╫₧╫ש╫ף╫ץ╫¬, ╫í╫ש╫ס╫¬ ╫₧╫¢╫ש╫¿╫פ..."
                        className="bg-gray-800 border-gray-700 min-h-[100px]"
                    />
                </div>

                {/* Suggestions / Missing Fields */}
                {missingFields.filter(f => !["╫í╫ץ╫ע ╫ף╫£╫º", "╫₧╫ש╫º╫ץ╫¥", "╫⌐╫á╫¬ ╫ש╫ש╫ª╫ץ╫¿"].includes(f)).length > 0 && (
                    <div className="bg-yellow-900/10 border border-yellow-500/30 p-3 rounded-lg">
                        <div className="text-yellow-500 text-xs font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            ╫פ╫₧╫£╫ª╫¬ ╫פ╫₧╫ó╫¿╫¢╫¬: ╫¢╫ף╫נ╫ש ╫£╫פ╫ץ╫í╫ש╫ú ╫נ╫¬ ╫פ╫ñ╫¿╫ר╫ש╫¥ ╫פ╫ס╫נ╫ש╫¥
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {missingFields.filter(f => !["╫í╫ץ╫ע ╫ף╫£╫º", "╫₧╫ש╫º╫ץ╫¥", "╫⌐╫á╫¬ ╫ש╫ש╫ª╫ץ╫¿"].includes(f)).map((field) => (
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
                )}

                {/* Dynamic Fields Section */}
                <div className="space-y-2 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-purple-300">
                            <Sparkles className="w-3 h-3" /> ╫₧╫ñ╫¿╫ר ╫₧╫º╫ª╫ץ╫ó╫ש (╫צ╫ץ╫פ╫פ ╫£{formData.category === "General" ? "╫₧╫ץ╫ף╫ó╫פ" : formData.category})
                        </Label>
                        {formData.extraData.map((field, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <Input
                                    placeholder="╫⌐╫¥ ╫פ╫₧╫נ╫ñ╫ש╫ש╫ƒ"
                                    value={field.key}
                                    onChange={(e) => updateField(index, e.target.value, field.value)}
                                    className="bg-gray-800 border-gray-700"
                                />
                                <Input
                                    placeholder="╫ó╫¿╫ת"
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
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addField}
                            className="w-full border-dashed border-gray-700 hover:bg-gray-800"
                        >
                            <Plus className="h-4 w-4 mr-2" /> ╫פ╫ץ╫í╫ú ╫₧╫נ╫ñ╫ש╫ש╫ƒ
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>╫¬╫₧╫ץ╫á╫ץ╫¬ (╫פ╫ó╫£╫נ╫פ ╫נ╫ץ ╫º╫ש╫⌐╫ץ╫¿)</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            value={imageUrlInput}
                            onChange={e => setImageUrlInput(e.target.value)}
                            placeholder="╫פ╫ף╫ס╫º ╫º╫ש╫⌐╫ץ╫¿ ╫£╫¬╫₧╫ץ╫á╫פ (URL)"
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
                    <Label>╫í╫¿╫ר╫ץ╫á╫ש╫¥ (╫פ╫ó╫£╫נ╫פ ╫נ╫ץ ╫º╫ש╫⌐╫ץ╫¿)</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            value={videoUrlInput}
                            onChange={e => setVideoUrlInput(e.target.value)}
                            placeholder="╫פ╫ף╫ס╫º ╫º╫ש╫⌐╫ץ╫¿ ╫£╫í╫¿╫ר╫ץ╫ƒ (URL)"
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
                {originalAI && isMounted && createPortal(
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
                                title="╫פ╫ץ╫í╫ú ╫פ╫ó╫¿╫¬ ╫ס╫ף╫ש╫º╫פ"
                            >
                                <Sparkles className="w-5 h-5 text-black" />
                                <span className="font-bold text-sm">╫פ╫ץ╫í╫ú ╫פ╫ó╫¿╫¬ ╫ס╫ף╫ש╫º╫פ (AI)</span>
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
                                <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2"><Sparkles className="w-4 h-4" /> ╫פ╫ó╫¿╫ץ╫¬ ╫ס╫ץ╫ף╫º ╫£╫₧╫ó╫¿╫¢╫¬ AI</h3>
                                <button type="button" onClick={() => document.getElementById('ai-tester-panel')?.classList.add('hidden')} className="text-gray-400 hover:text-white leading-none text-2xl p-1">├ק</button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-amber-500/10 rounded-lg p-2.5 flex items-center justify-between border border-amber-500/20">
                                    <span className="text-xs text-amber-200">╫ס╫ץ╫ף╫º:</span>
                                    <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{testerName}</span>
                                </div>
                                <div>
                                    <Label className="text-xs text-amber-200 mb-1 block">╫פ╫ó╫¿╫ץ╫¬ ╫ó╫£ ╫צ╫ש╫פ╫ץ╫ש ╫⌐╫ע╫ץ╫ש / ╫ק╫í╫¿ ≡ƒסח</Label>
                                    <Textarea
                                        rows={4}
                                        className="text-sm bg-black/60 border-amber-500/30 resize-none focus:border-amber-500 text-white placeholder-gray-500"
                                        value={testerNote}
                                        onChange={e => setTesterNote(e.target.value)}
                                        placeholder="╫£╫ף╫ץ╫ע╫₧╫פ: ╫₧╫ק╫ש╫¿ ╫ש╫ª╫נ 0, ╫£╫נ ╫צ╫ש╫פ╫פ ╫ש╫ף 2, ╫ף╫ע╫¥ ╫⌐╫ע╫ץ╫ש..."
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={submitTesterNote}
                                    disabled={!testerNote.trim()}
                                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                                >
                                    ╫⌐╫£╫ק ╫פ╫ó╫¿╫פ ╫£╫⌐╫¿╫ף Γ£ף
                                </button>

                                <div className="border-t border-amber-500/20 mt-4 pt-4">
                                    <label className="flex items-center gap-3 p-2 bg-black/40 hover:bg-black/60 rounded-lg cursor-pointer transition-colors border border-amber-500/10">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 peer appearance-none border border-amber-500/50 rounded bg-black checked:bg-amber-500 transition-all"
                                                checked={isTestMode}
                                                onChange={e => setIsTestMode(e.target.checked)}
                                            />
                                            <svg className="absolute w-2.5 h-2.5 text-black left-0.5 top-[3px] pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-amber-200 text-xs font-bold">╫⌐╫₧╫ץ╫¿ ╫£╫₧╫ר╫¿╫¬ ╫ר╫í╫ר╫ש╫¥ (AI)</span>
                                            <span className="text-gray-400 text-[10px]">╫₧╫ץ╫ף╫ó╫פ ╫צ╫ץ ╫£╫נ ╫¬╫¬╫ñ╫¿╫í╫¥ ╫ס╫£╫ץ╫ק ╫פ╫נ╫₧╫ש╫¬╫ש</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    , document.body)}

                <Button type="submit" disabled={loading} className={`w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all ${isTestMode ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30" : "bg-green-600 hover:bg-green-700 shadow-green-500/30"}`}>
                    {loading ? <Loader2 className="animate-spin" /> : isTestMode ? "╫⌐╫₧╫ץ╫¿ ╫ס╫ף╫ש╫º╫¬ AI" : isEditing ? "╫ó╫ף╫¢╫ƒ ╫₧╫ץ╫ף╫ó╫פ" : "╫ñ╫¿╫í╫¥ ╫₧╫ץ╫ף╫ó╫פ"}
                </Button>
            </form>
        </div>
    );
}
