import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, Package, MapPin, DollarSign, Calendar, Upload, Camera, CreditCard, Shield, User, Smartphone, X, Box, CheckCircle, Truck, Scale, Facebook, Twitter, Link as LinkIcon, Share2, MessageCircle, Sparkles, Star, AlertTriangle, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { createShipment } from "@/app/actions";

interface ShipmentFormProps {
    mode: "public-link" | "dashboard";
    userMode?: "seller" | "buyer";
    onCancel?: () => void;
    dbUser?: any; // Added dbUser prop
    initialData?: {
        itemName?: string;
        value?: string;
        condition?: string;
        description?: string;
        images?: string[];
    };
}

export function ShipmentForm({ mode, userMode = "seller", onCancel, dbUser, initialData }: ShipmentFormProps) {
    // Force HMR update
    const { user } = useUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    // Media Upload State
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [videoUrlInput, setVideoUrlInput] = useState("");
    const [uploading, setUploading] = useState(false);

    // Filter defaults to prevent 'undefined' issues
    const [serviceType, setServiceType] = useState<"secure" | "delivery">("secure");
    const [includeCondition, setIncludeCondition] = useState(true);

    // Form State
    const [details, setDetails] = useState<{
        itemName: string;
        value: string;
        description: string;
        packageSize: "small" | "medium" | "large" | "huge";
        images: string[];
        videos: string[];
        condition: "new" | "like-new" | "used" | "damaged";
        defects: string;
        agreement: boolean;
        requestVideoCall: boolean;
        dealType: 'negotiation' | 'closed';
    }>({
        itemName: "",
        value: "",
        description: "",
        packageSize: "medium",
        images: [],
        videos: [],
        condition: "used",
        defects: "",
        agreement: false,
        requestVideoCall: false,
        dealType: 'negotiation'
    });

    // Effect to apply initial data
    useEffect(() => {
        if (initialData) {
            setDetails(prev => ({
                ...prev,
                itemName: initialData.itemName || prev.itemName,
                value: initialData.value || prev.value,
                condition: (initialData.condition as any) || prev.condition,
                description: initialData.description || prev.description,
                images: initialData.images || prev.images // Added images
            }));
        }
    }, [initialData]);

    const [sender, setSender] = useState({
        name: "", phone: "", city: "", street: "", number: "",
        isBusiness: false, companyName: "", taxId: ""
    });

    const [receiver, setReceiver] = useState({
        name: "", phone: "", city: "", street: "", number: "",
        isBusiness: false, companyName: "", taxId: ""
    });

    // Prefill User Data
    useEffect(() => {
        if (!user) return;
        const userData = {
            name: user.fullName || "",
            // PRIORITIZE DB PHONE over Clerk phone
            phone: dbUser?.phone || user.primaryPhoneNumber?.phoneNumber || "",
            city: dbUser?.userData?.city || "",
            street: dbUser?.userData?.street || "",
            number: dbUser?.userData?.houseNumber || "",
            isBusiness: false, companyName: "", taxId: ""
        };

        if (userMode === "seller") {
            setSender(prev => ({ ...prev, ...userData }));
        } else if (userMode === "buyer") {
            setReceiver(prev => ({ ...prev, ...userData }));
        }
    }, [user, userMode, dbUser]);

    // Logic: Hide condition report in delivery mode by default OR if Deal Type is Closed (simplified flow)
    useEffect(() => {
        if (serviceType === "delivery" || userMode === "buyer" || details.dealType === 'closed') {
            setIncludeCondition(false);
        } else {
            setIncludeCondition(true);
        }
    }, [serviceType, userMode, details.dealType]);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const [createdLink, setCreatedLink] = useState("");

    const isStep2Valid = () => {
        if (userMode === "seller") {
            return sender.name && sender.phone && sender.city && sender.street && sender.number;
        } else {
            return receiver.name && receiver.phone && receiver.city && receiver.street && receiver.number;
        }
    };

    const addImage = () => {
        if (imageUrlInput) {
            setDetails(prev => ({ ...prev, images: [...prev.images, imageUrlInput] }));
            setImageUrlInput("");
        }
    };

    const removeImage = (index: number) => {
        setDetails(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const addVideo = () => {
        if (videoUrlInput) {
            setDetails(prev => ({ ...prev, videos: [...(prev.videos || []), videoUrlInput] }));
            setVideoUrlInput("");
        }
    };

    const removeVideo = (index: number) => {
        setDetails(prev => ({ ...prev, videos: (prev.videos || []).filter((_, i) => i !== index) }));
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
                    setDetails(prev => ({ ...prev, images: [...prev.images, data.url] }));
                } else {
                    setDetails(prev => ({ ...prev, videos: [...(prev.videos || []), data.url] }));
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

    const handleCreateLink = async () => {
        setLoading(true);

        const formData = {
            serviceType,
            itemName: details.itemName,
            value: details.value,
            description: includeCondition ? details.description : "Delivery Only",
            packageSize: details.packageSize,
            condition: details.condition,
            defects: details.defects,
            images: details.images,
            videos: details.videos,
            sender,
            receiver, // Add receiver to payload
            requestVideoCall: details.requestVideoCall, // Add video call request
            dealType: details.dealType, // Add deal type
            userMode
        };

        const result = await createShipment(formData);

        setLoading(false);

        if (result.success) {
            setCreatedLink(`${window.location.origin}/link/${result.shortId}`);
            setSuccess(true);
        } else {
            console.error("Create Link Failed:", result.error);
            alert("שגיאה ביצירת הלינק: " + result.error); // Temporary alert to show user the error
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Prevent accidental submit on Enter key if not on last step
        if (step < 3) {
            nextStep();
        }
        // Note: Step 3 button calls handleCreateLink directly, not this form submit
    };

    if (success) {
        // Maintain the same relative structure as the main form to prevent resizing jumps
        return (
            <div className="w-full h-full flex flex-col bg-card overflow-hidden">
                {/* Fixed Header for Success Screen */}
                <div className="bg-background z-20 shrink-0 border-b border-border/50 py-4 px-4 text-center relative">
                    {onCancel && (
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(); }} className="absolute top-2 left-2 p-1.5 rounded-full bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                            <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                    )}
                    <h2 className="text-lg font-bold text-foreground">לינק נוצר בהצלחה!</h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 animate-in zoom-in spin-in-12 duration-500">
                        <CheckCircle className="h-8 w-8" />
                    </div>

                    <h3 className="text-xl font-bold mb-2">
                        {mode === "public-link" ? "הלינק שלך מוכן!" : "המשלוח נוצר בהצלחה!"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                        שתף את הלינק עם ה{userMode === 'seller' ? 'קונה' : 'מוכר'} כדי להשלים את העסקה בבטחה.
                    </p>

                    <div className="bg-muted p-4 rounded-xl w-full mb-6 break-all font-mono text-sm border border-primary/20 text-primary font-bold select-all relative group shadow-inner" dir="ltr">
                        {createdLink}
                        <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer rounded-xl" onClick={() => {
                            navigator.clipboard.writeText(createdLink);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}>
                            <span className="font-sans text-xs font-bold text-foreground flex items-center gap-1">
                                <span className="bg-primary text-white p-1 rounded-full"><Check className="h-3 w-3" /></span>
                                לחץ להעתקה
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mb-4">
                        {/* Social Buttons */}
                        <div className="col-span-2">
                            <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-md shadow-green-500/20 h-11" onClick={() => {
                                // Logic to define the target phone number for automated sending
                                const targetPhone = userMode === 'seller' ? receiver.phone : sender.phone;
                                const cleanPhone = targetPhone?.replace(/\D/g, '') || ''; // Remove non-digits
                                const prefix = cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone;

                                const text = encodeURIComponent(`היי ${userMode === 'seller' ? receiver.name : sender.name}, הנה לינק לתשלום מאובטח ב-Qlikndeal עבור ${details.itemName}: ${createdLink}`);
                                window.open(`https://wa.me/${prefix}?text=${text}`, '_blank');
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 fill-white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                </svg>
                                {userMode === 'seller' && receiver.phone ? `שלח ל-${receiver.name || 'קונה'}` : 'שלח בוואטסאפ'}
                            </Button>
                        </div>

                        <div className="col-span-2 flex justify-center gap-4 pt-4 border-t border-border/50 mt-2">
                            <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${createdLink}`, '_blank')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 hover:scale-105 transition-all group w-full sm:w-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#1877F2]">
                                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.95-2.971 3.595v.948h4.015l-.259 3.667h-3.756v7.986a10.277 10.277 0 0 0 5.267-9.267c0-5.698-4.633-10.318-10.332-10.318S-1.5 9.256-1.5 14.954a10.271 10.271 0 0 0 10.601 8.737z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1877F2]">Facebook</span>
                            </button>
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`תשלום מאובטח עבור ${details.itemName}`)}&url=${createdLink}`, '_blank')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 hover:scale-105 transition-all group w-full sm:w-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#1DA1F2]">
                                    <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1DA1F2]">Twitter</span>
                            </button>
                            <button onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Qlikndeal תשלום מאובטח',
                                        text: `תשלום מאובטח עבור ${details.itemName}`,
                                        url: createdLink,
                                    })
                                }
                            }} className="p-3 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-110 transition-all">
                                <Share2 className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer for Reset */}
                <div className="p-4 border-t bg-background shrink-0">
                    <Button variant="ghost" className="w-full text-muted-foreground text-xs hover:bg-transparent hover:text-primary" onClick={() => {
                        setSuccess(false);
                        setStep(1);
                        setDetails({ ...details, itemName: "", value: "", description: "" });
                    }}>
                        צור משלוח נוסף
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-card overflow-hidden">
            {/* Header Area - Fixed */}
            <div className="bg-background z-20 shrink-0 border-b border-border/50">
                {/* Progress Bar with Neon Glow */}
                <div className="w-full h-1 bg-muted/50">
                    <div className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.8)]" style={{ width: `${(step / 3) * 100}%` }} />
                </div>

                <div className="relative pt-4 pb-2 px-4 text-center">
                    {/* Role Badge - Compact */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 py-0.5 px-3 ${userMode === 'seller' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'} font-bold text-[10px] rounded-b-lg border-b border-x border-white/5 shadow-sm`}>
                        {userMode === 'seller' ? 'יוצר כמוכר' : 'יוצר כקונה'}
                    </div>

                    {/* Close Button */}
                    {onCancel && (
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(); }} className="absolute top-2 left-2 p-1.5 rounded-full bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                            <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                    )}

                    <h2 className="text-lg font-bold text-foreground">
                        {step === 1 && "פרטי המשלוח"}
                        {step === 2 && "כתובות ואיסוף"}
                        {step === 3 && "אישור וסיכום"}
                    </h2>
                </div>
            </div>

            {/* Scrollable Content Area - Flex Grow - Hidden Scrollbar */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <form id="shipment-form" onSubmit={handleSubmit} className="h-full flex flex-col">

                    {step === 1 && (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-muted/40 p-3 rounded-2xl border border-border/60 shadow-inner mb-3">
                                <label className="text-xs font-bold text-foreground px-1 mb-2 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold shadow-md shadow-primary/30">1</span>
                                    בחר סוג עסקה
                                </label>

                                <div className="grid grid-cols-2 gap-3 h-20"> {/* Fixed height to keep it compact */}
                                    <button
                                        type="button"
                                        onClick={() => setDetails({ ...details, dealType: 'negotiation' })}
                                        className={`relative overflow-hidden rounded-xl px-2 flex flex-row items-center justify-start gap-3 transition-all duration-300 group ${details.dealType === 'negotiation'
                                            ? 'bg-gradient-to-r from-primary/20 to-primary/5 border border-primary shadow-[0_0_15px_rgba(var(--primary),0.15)] ring-1 ring-primary/20'
                                            : 'bg-background border border-transparent hover:border-primary/20 hover:bg-muted/50 grayscale opacity-80 hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        <div className={`p-2 rounded-full shrink-0 transition-all duration-300 ${details.dealType === 'negotiation' ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                            <Scale className="w-4 h-4" />
                                        </div>
                                        <div className="text-right flex-1 min-w-0">
                                            <span className={`block font-black text-sm truncate ${details.dealType === 'negotiation' ? 'text-primary drop-shadow-sm' : 'text-muted-foreground group-hover:text-foreground'}`}>משא ומתן</span>
                                            <span className="block text-[9px] font-medium text-muted-foreground leading-tight truncate">אישור לפני תשלום</span>
                                        </div>
                                        {/* Status Dot */}
                                        {details.dealType === 'negotiation' && (
                                            <span className="absolute top-2 left-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDetails({ ...details, dealType: 'closed' })}
                                        className={`relative overflow-hidden rounded-xl px-2 flex flex-row items-center justify-start gap-3 transition-all duration-300 group ${details.dealType === 'closed'
                                            ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/5 border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                                            : 'bg-background border border-transparent hover:border-blue-500/20 hover:bg-muted/50 grayscale opacity-80 hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        <div className={`p-2 rounded-full shrink-0 transition-all duration-300 ${details.dealType === 'closed' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-muted text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-500'}`}>
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div className="text-right flex-1 min-w-0">
                                            <span className={`block font-black text-sm truncate ${details.dealType === 'closed' ? 'text-blue-500 drop-shadow-sm' : 'text-muted-foreground group-hover:text-foreground'}`}>עסקה סגורה</span>
                                            <span className="block text-[9px] font-medium text-muted-foreground leading-tight truncate">תשלום מידי וסופי</span>
                                        </div>
                                        {/* Status Dot */}
                                        {details.dealType === 'closed' && (
                                            <span className="absolute top-2 left-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Service Type - Hidden by default (Defaults to Secure) to reduce clutter */}
                            <div className="flex justify-end mb-2">
                                <button
                                    type="button"
                                    onClick={() => setServiceType(prev => prev === "secure" ? "delivery" : "secure")}
                                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
                                >
                                    {serviceType === "secure" ? (
                                        <><span>מעדיף משלוח בלבד ללא הגנת תשלום?</span><Truck className="w-3 h-3" /></>
                                    ) : (
                                        <><span>חזור לעסקה בטוחה (מומלץ)</span><Shield className="w-3 h-3 text-primary" /></>
                                    )}
                                </button>
                            </div>

                            {/* Visual Indicator for Delivery Only Mode */}
                            {serviceType === "delivery" && (
                                <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 mb-3 border border-blue-200">
                                    <Truck className="w-4 h-4" />
                                    מצב משלוח בלבד (ללא תשלום מאובטח)
                                </div>
                            )}

                            {/* Item & Price Row */}
                            <div className="grid grid-cols-[1.2fr_1fr] gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-muted-foreground">שם הפריט</label>
                                    <input required value={details.itemName} onChange={e => setDetails({ ...details, itemName: e.target.value })} className="w-full h-12 px-3 bg-muted/30 border border-input rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary transition-all" placeholder="לדוגמה: אייפון 14" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-primary">מחיר מבוקש</label>
                                    <div className="relative group">
                                        {/* Currency Symbol - Hidden to allow cleaner centering, or positioned nicely */}
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-black text-muted-foreground/30 pointer-events-none">₪</span>
                                        {/* Input - Text CENTERED */}
                                        <input required type="number" value={details.value} onChange={e => setDetails({ ...details, value: e.target.value })} className="w-full h-12 px-8 bg-muted/30 border border-primary/30 rounded-xl text-2xl font-black text-center focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-[0_0_15px_rgba(var(--primary),0.05)] focus:shadow-[0_0_20px_rgba(var(--primary),0.1)]" placeholder="0" dir="ltr" inputMode="numeric" />
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted-foreground">תמונות (העלאה או קישור)</label>
                                <div className="flex gap-2 items-center overflow-x-auto pb-2">
                                    <input
                                        value={imageUrlInput}
                                        onChange={e => setImageUrlInput(e.target.value)}
                                        placeholder="הדבק קישור לתמונה (URL)"
                                        className="h-9 px-2.5 rounded-lg border text-xs bg-background min-w-[150px] focus:ring-1 focus:ring-primary"
                                    />
                                    <Button type="button" onClick={addImage} size="icon" className="shrink-0 h-9 w-9 bg-primary/10 hover:bg-primary/20 text-primary">
                                        <Plus className="w-4 h-4" />
                                    </Button>

                                    <div className="relative">
                                        <label className={`flex-shrink-0 w-9 h-9 rounded-lg border-2 border-dashed border-primary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                                            {uploading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Camera className="w-4 h-4 text-primary" />}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} />
                                        </label>
                                    </div>

                                    {details.images.map((img, i) => (
                                        <div key={i} className="relative flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-border group">
                                            <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-2 h-2" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Video Upload Section */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted-foreground">סרטונים (העלאה או קישור)</label>
                                <div className="flex gap-2 items-center overflow-x-auto pb-2">
                                    <input
                                        value={videoUrlInput}
                                        onChange={e => setVideoUrlInput(e.target.value)}
                                        placeholder="הדבק קישור לסרטון (URL)"
                                        className="h-9 px-2.5 rounded-lg border text-xs bg-background min-w-[150px] focus:ring-1 focus:ring-primary"
                                    />
                                    <Button type="button" onClick={addVideo} size="icon" className="shrink-0 h-9 w-9 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500">
                                        <Plus className="w-4 h-4" />
                                    </Button>

                                    <div className="relative">
                                        <label className={`flex-shrink-0 w-9 h-9 rounded-lg border-2 border-dashed border-blue-500/30 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/5 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                                            {uploading ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <span className="text-[8px] font-bold text-blue-500">MP4</span>}
                                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
                                        </label>
                                    </div>

                                    {(details.videos || []).map((vid, i) => (
                                        <div key={i} className="relative flex-shrink-0 w-16 h-9 rounded-lg overflow-hidden border border-border group bg-black">
                                            <video src={vid} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(i)}
                                                className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-2 h-2" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Package Size - Formatted with LARGER TEXT - SELLER ONLY - HIDDEN IN NEGOTIATION */}
                            {userMode === "seller" && details.dealType === 'closed' && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-muted-foreground">גודל חבילה</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: "small", label: "קטנה", icon: <Box className="h-4 w-4" />, desc: "מעטפה/ספר" },
                                            { id: "medium", label: "בינונית", icon: <Box className="h-5 w-5" />, desc: "קופסת נעליים" },
                                            { id: "large", label: "גדולה", icon: <Box className="h-6 w-6" />, desc: "אריזה/מזוודה" },
                                            { id: "huge", label: "ענקית", icon: <Truck className="h-6 w-6" />, desc: "ריהוט/משטח" }
                                        ].map((size) => (
                                            <button
                                                key={size.id}
                                                type="button"
                                                onClick={() => setDetails({ ...details, packageSize: size.id as any })}
                                                className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all ${details.packageSize === size.id ? "bg-primary/10 border-primary text-primary shadow-sm scale-[1.02] ring-1 ring-primary/20" : "bg-card border-border hover:bg-accent hover:border-accent-foreground/20"}`}
                                            >
                                                <div className="mb-1 opacity-80">{size.icon}</div>
                                                <span className="text-sm font-bold leading-none">{size.label}</span>
                                                <span className="text-[11px] text-muted-foreground leading-tight text-center mt-1 font-medium">{size.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Condition Report - Digital Handshake with COLORED ICONS - SELLER ONLY */}
                            {userMode === "seller" && (
                                <div className="space-y-2 pt-3 border-t border-dashed">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="h-4 w-4 text-primary" />
                                            <h3 className="font-bold text-xs uppercase tracking-wide">הצהרת מצב</h3>
                                        </div>

                                        {/* Toggle for Delivery Mode */}
                                        {serviceType === 'delivery' && (
                                            <div className="flex items-center gap-2">
                                                <label htmlFor="cond-toggle" className="text-[10px] text-muted-foreground cursor-pointer select-none">הוסף הצהרה</label>
                                                <input
                                                    id="cond-toggle"
                                                    type="checkbox"
                                                    checked={includeCondition}
                                                    onChange={e => setIncludeCondition(e.target.checked)}
                                                    className="h-3 w-3 rounded border-primary text-primary focus:ring-primary"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {includeCondition && (
                                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50 space-y-3 animate-in slide-in-from-top-2 fade-in">
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'new', label: 'חדש', icon: <Sparkles className="w-4 h-4 text-green-500" /> },
                                                    { id: 'like-new', label: 'כמו חדש', icon: <Star className="w-4 h-4 text-blue-500" /> },
                                                    { id: 'used', label: 'משומש', icon: <Box className="w-4 h-4 text-orange-500" /> },
                                                    { id: 'damaged', label: 'פגום', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> }
                                                ].map((cond) => (
                                                    <button
                                                        key={cond.id}
                                                        type="button"
                                                        onClick={() => setDetails({ ...details, condition: cond.id as any })}
                                                        className={`flex-1 py-3 flex flex-col items-center gap-1.5 rounded-lg text-[10px] font-bold border transition-all ${details.condition === cond.id ? 'bg-primary/10 border-primary text-primary shadow-sm scale-[1.02] ring-1 ring-primary/20' : 'bg-card border-border hover:bg-accent hover:border-accent-foreground/20'}`}
                                                    >
                                                        <div className={details.condition === cond.id ? 'drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]' : ''}>{cond.icon}</div>
                                                        <span className={details.condition === cond.id ? 'font-black drop-shadow-[0_0_5px_rgba(var(--primary),0.2)]' : 'text-muted-foreground'}>{cond.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <textarea
                                                value={details.description}
                                                onChange={e => setDetails({ ...details, description: e.target.value })}
                                                className="w-full text-xs p-2.5 bg-background border border-input rounded-lg h-16 resize-none focus:ring-1 focus:ring-primary"
                                                placeholder="פרט כאן פגמים, שריטות או הערות חשובות לקונה..."
                                                maxLength={300}
                                            />

                                            <label className="flex items-start gap-2 cursor-pointer p-2 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50 select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={details.agreement}
                                                    onChange={e => setDetails({ ...details, agreement: e.target.checked })}
                                                    className="mt-0.5 rounded border-primary text-primary focus:ring-primary h-4 w-4 shrink-0"
                                                />
                                                <span className="text-[10px] font-medium leading-tight text-muted-foreground">
                                                    אני מצהיר שהתיאור מדויק. ידוע לי שאי-גילוי פרטים עלול לבטל את העסקה.
                                                </span>
                                            </label>

                                            {/* Video Call Option inside Condition Report (Seller Only for now) */}
                                            <div className="mt-3 flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-blue-500/10 p-1.5 rounded-full text-blue-500">
                                                        <Camera className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-bold">שיחת וידאו לאימות</h4>
                                                        <p className="text-[9px] text-muted-foreground">אפשר לקונה לבקש שיחת וידאו לראות את המוצר.</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BUYER ONLY - Request Video Call & Add Notes */}
                            {userMode === "buyer" && (
                                <div className="space-y-4 pt-4 border-t border-dashed">
                                    {/* Video Call Request */}
                                    <div className="flex items-center justify-between bg-blue-500/5 p-3 rounded-xl border border-blue-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                                                <Camera className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">בקש שיחת וידאו?</h4>
                                                <p className="text-[10px] text-muted-foreground">מומלץ לראות את המוצר בשיחת וידאו לפני אישור סופי.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={details.requestVideoCall}
                                                onChange={e => setDetails({ ...details, requestVideoCall: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>

                                    {/* Optional Note to Seller */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground">הערה למוכר (אופציונלי)</label>
                                        <textarea
                                            value={details.description}
                                            onChange={e => setDetails({ ...details, description: e.target.value })}
                                            className="w-full text-xs p-3 bg-muted/30 border border-input rounded-xl h-20 resize-none focus:ring-1 focus:ring-primary"
                                            placeholder="האם המוצר מגיע עם מטען? האם יש שריטות?"
                                            maxLength={200}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2 - Compact Addresses with Hiding Logic */}
                    {step === 2 && (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            {/* Role: SELLER -> Show Sender Fields Only */}
                            {userMode === "seller" && (
                                <div className="space-y-3 p-4 rounded-xl border bg-primary/5 border-primary/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">1</span>
                                            פרטי השולח (אני)
                                        </h3>
                                        <span className="text-[10px] font-bold text-primary bg-background px-2 py-0.5 rounded border border-primary/20">חובה למילוי</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold">שם מלא</label>
                                            <input required placeholder="ישראל ישראלי" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full focus:ring-1 focus:ring-primary" value={sender.name} onChange={e => setSender({ ...sender, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold">טלפון</label>
                                            <input required placeholder="050-0000000" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full focus:ring-1 focus:ring-primary" value={sender.phone} onChange={e => setSender({ ...sender, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold">כתובת לאיסוף (ממני)</label>
                                        <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr] gap-2">
                                            <input required placeholder="עיר" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={sender.city} onChange={e => setSender({ ...sender, city: e.target.value })} />
                                            <input required placeholder="רחוב" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={sender.street} onChange={e => setSender({ ...sender, street: e.target.value })} />
                                            <input required placeholder="מס'" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={sender.number} onChange={e => setSender({ ...sender, number: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Role: BUYER -> Show Receiver Fields Only */}
                            {userMode === "buyer" && (
                                <div className="space-y-3 p-4 rounded-xl border bg-primary/5 border-primary/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">1</span>
                                            פרטי המקבל (אני)
                                        </h3>
                                        <span className="text-[10px] font-bold text-primary bg-background px-2 py-0.5 rounded border border-primary/20">חובה למילוי</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold">שם מלא</label>
                                            <input required placeholder="ישראל ישראלי" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={receiver.name} onChange={e => setReceiver({ ...receiver, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold">טלפון</label>
                                            <input required placeholder="050-0000000" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={receiver.phone} onChange={e => setReceiver({ ...receiver, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold">כתובת למסירה</label>
                                        <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr] gap-2">
                                            <input required placeholder="עיר" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={receiver.city} onChange={e => setReceiver({ ...receiver, city: e.target.value })} />
                                            <input required placeholder="רחוב" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={receiver.street} onChange={e => setReceiver({ ...receiver, street: e.target.value })} />
                                            <input required placeholder="מס'" className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full" value={receiver.number} onChange={e => setReceiver({ ...receiver, number: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Counterparty Info State - Ghosted */}
                            {/* Counterparty Info - Active Input for Automation */}
                            <div className="space-y-3 p-4 rounded-xl border bg-secondary/20 border-secondary/20">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] text-white font-bold">2</span>
                                        {userMode === 'seller' ? 'פרטי הקונה (לשליחה אוטומטית)' : 'פרטי המוכר (לשליחה אוטומטית)'}
                                    </h3>
                                    <span className="text-[10px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/20">אופציונלי</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold">{userMode === 'seller' ? 'שם הקונה' : 'שם המוכר'}</label>
                                        <input
                                            placeholder="ישראל ישראלי"
                                            className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full focus:ring-1 focus:ring-secondary"
                                            value={userMode === 'seller' ? receiver.name : sender.name}
                                            onChange={e => userMode === 'seller' ? setReceiver({ ...receiver, name: e.target.value }) : setSender({ ...sender, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold">{userMode === 'seller' ? 'טלפון הקונה' : 'טלפון המוכר'}</label>
                                        <input
                                            placeholder="050-0000000"
                                            className="h-9 px-2.5 rounded-lg border text-xs bg-background w-full focus:ring-1 focus:ring-secondary"
                                            value={userMode === 'seller' ? receiver.phone : sender.phone}
                                            onChange={e => userMode === 'seller' ? setReceiver({ ...receiver, phone: e.target.value }) : setSender({ ...sender, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-secondary" />
                                    <span>מלא פרטים אלו כדי שהמערכת תוכל לשלוח את הלינק <b>אוטומטית</b> בוואטסאפ/SMS.</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 pt-2">
                            <div className="bg-muted/40 p-5 rounded-2xl text-sm border border-border/60 space-y-4 shadow-sm">
                                <div className="flex justify-between border-b border-border/50 pb-3">
                                    <span className="text-muted-foreground text-xs font-medium">מוצר</span>
                                    <span className="font-bold text-sm text-right">
                                        {details.itemName}
                                        {userMode === 'seller' && (
                                            <span className="text-muted-foreground font-normal"> ({details.condition === 'new' ? 'חדש' : details.condition === 'like-new' ? 'כמו חדש' : details.condition === 'used' ? 'משומש' : 'פגום'})</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground text-xs font-medium">סה&quot;כ לתשלום</span>
                                    <span className="font-black text-3xl text-primary tracking-tight">₪{Number(details.value).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="text-[11px] text-muted-foreground text-center px-4 bg-yellow-500/5 p-3 rounded-xl text-yellow-500 border border-yellow-500/20 leading-relaxed">
                                <Shield className="h-3 w-3 inline-block mb-0.5 ml-1" />
                                {userMode === 'seller'
                                    ? "הכסף של הקונה מוגן. התשלום יועבר אליך רק לאחר שהקונה יאשר שקיבל את המוצר."
                                    : "הכסף שלך מוגן. התשלום יועבר למוכר רק לאחר שתאשר שקיבלת את המוצר לשביעות רצונך."
                                }
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons Fixed to Bottom */}
                    <div className="pt-4 mt-auto border-t bg-background sticky bottom-0 z-20">
                        <div className="flex gap-3">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-11 text-sm">
                                    חזור
                                </Button>
                            )}

                            {step < 3 ? (
                                <Button type="button" onClick={nextStep} className="flex-[2] font-bold h-11 text-base shadow-lg shadow-primary/20" disabled={
                                    (step === 1 && (!details.itemName || !details.value || (includeCondition && !details.agreement))) ||
                                    (step === 2 && !isStep2Valid())
                                }>
                                    המשך לשלב הבא
                                </Button>
                            ) : (
                                <Button type="button" onClick={handleCreateLink} className="flex-[2] font-bold h-11 text-base bg-gradient-to-r from-primary to-primary/80 hover:to-primary shadow-xl shadow-primary/25" disabled={loading}>
                                    {loading ? "מייצר קישור..." : "✨ צור לינק לתשלום"}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
