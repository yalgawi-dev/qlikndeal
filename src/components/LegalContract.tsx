"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, PenTool, RefreshCw, Check, Calendar, FileText, User } from "lucide-react";

interface LegalContractProps {
    itemName: string;
    value: number;
    itemCondition?: string;
    sellerNotes?: string;
    sellerName: string;
    buyerName: string;
    flexibleData: any;
    isSigning?: boolean;
    role?: 'buyer' | 'seller';
    onSign?: (signatureData: { realName: string; idNo: string; signatureBase64: string; city?: string; street?: string }) => void;
}

export function LegalContract({
    itemName,
    value,
    itemCondition = "לא צוין",
    sellerNotes,
    sellerName,
    buyerName,
    flexibleData = {},
    isSigning = false,
    role,
    onSign
}: LegalContractProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [realName, setRealName] = useState("");
    const [idNo, setIdNo] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [hasSigned, setHasSigned] = useState(false);

    // Initialize from existing data if signing
    useEffect(() => {
        if (isSigning && role) {
            if (role === 'buyer') {
                setRealName(flexibleData.buyerRealName || buyerName || "");
                setIdNo(flexibleData.buyerIdNo || "");
                setCity(flexibleData.receiverAddress?.city || "");
                setStreet(flexibleData.receiverAddress?.street || "");
            } else {
                setRealName(flexibleData.sellerRealName || sellerName || "");
                setIdNo(flexibleData.sellerIdNo || "");
            }
        }
    }, [isSigning, role, flexibleData, buyerName, sellerName]);

    // Canvas drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set style
        ctx.strokeStyle = "#4f46e5"; // Indigo-600
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, [isSigning]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        
        let clientX = 0;
        let clientY = 0;
        
        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        
        // Prevent scrolling on mobile when drawing
        if (e.cancelable) {
            e.preventDefault();
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        
        let clientX = 0;
        let clientY = 0;
        
        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSigned(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
    };

    const handleConfirmSign = () => {
        if (!realName.trim()) {
            alert("אנא מלא שם מלא לאישור החוזה");
            return;
        }
        if (!idNo.trim() || idNo.length < 8) {
            alert("אנא מלא מספר תעודת זהות תקין");
            return;
        }
        if (role === 'buyer') {
            if (!city.trim()) {
                alert("אנא הזן עיר למשלוח");
                return;
            }
            if (!street.trim()) {
                alert("אנא הזן רחוב ומספר בית למשלוח");
                return;
            }
        }
        if (!hasSigned) {
            alert("אנא חתום בתיבת החתימה הגרפית");
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const signatureBase64 = canvas.toDataURL("image/png");

        if (onSign) {
            onSign({
                realName,
                idNo,
                signatureBase64,
                city: role === 'buyer' ? city : undefined,
                street: role === 'buyer' ? street : undefined
            });
        }
    };

    const formattedDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("he-IL") + " " + d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    };

    const conditionLabel = itemCondition === "New" ? "חדש באריזה" : itemCondition === "Used" ? "משומש" : itemCondition;

    return (
        <div className="bg-card text-card-foreground rounded-2xl border border-primary/20 overflow-hidden shadow-xl text-right" dir="rtl">
            {/* Stamp and Decorative Title */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 text-white text-center border-b border-primary/20 relative">
                <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Qlikndeal SafeTrade
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
                    חוזה מכר מחייב למכירת מוצר יד שנייה
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">נערך ונחתם באופן דיגיטלי מאובטח באמצעות פלטפורמת Qlikndeal</p>
            </div>

            <div className="p-5 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar text-xs sm:text-sm leading-relaxed text-slate-350 dark:text-slate-300">
                {/* Introduction section */}
                <div className="space-y-2 border-b border-border pb-4">
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                        שנערך ונחתם ביום {new Date().toLocaleDateString("he-IL")} בין הצדדים הבאים:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* Seller identity details */}
                        <div className="bg-muted/40 p-3.5 rounded-xl border border-border">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">צד א' - המוכר:</span>
                            {flexibleData.sellerSignedAt ? (
                                <div className="space-y-1">
                                    <div>שם מלא: <strong className="text-foreground">{flexibleData.sellerRealName || sellerName}</strong></div>
                                    <div>ת.ז.: <strong className="text-foreground">{flexibleData.sellerIdNo || "שדה חסר"}</strong></div>
                                    <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                        <Check className="w-3 h-3" /> נחתם ב- {formattedDate(flexibleData.sellerSignedAt)}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground italic">
                                    {isSigning && role === 'seller' ? "ממלא פרטים כעת..." : "טרם מולאו פרטי זיהוי וחתימה"}
                                </span>
                            )}
                        </div>

                        {/* Buyer identity details */}
                        <div className="bg-muted/40 p-3.5 rounded-xl border border-border">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">צד ב' - הקונה:</span>
                            {flexibleData.buyerSignedAt ? (
                                <div className="space-y-1">
                                    <div>שם מלא: <strong className="text-foreground">{flexibleData.buyerRealName || buyerName}</strong></div>
                                    <div>ת.ז.: <strong className="text-foreground">{flexibleData.buyerIdNo || "שדה חסר"}</strong></div>
                                    <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                        <Check className="w-3 h-3" /> נחתם ב- {formattedDate(flexibleData.buyerSignedAt)}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground italic">
                                    {isSigning && role === 'buyer' ? "ממלא פרטים כעת..." : "טרם מולאו פרטי זיהוי וחתימה"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 1: Declarations */}
                <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        1. הצהרות והסכמות הצדדים
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 pr-2">
                        <li>המוכר מצהיר כי הוא הבעלים החוקי והבלעדי של המוצר המתואר להלן, וכי אין כל שעבוד, עיקול או זכות צד ג' במוצר.</li>
                        <li>הקונה מצהיר בזאת כי ניתנה לו ההזדמנות המלאה לבחון את המוצר, מפרטו הטכני ותמונותיו כפי שהוצגו בזירה, והוא מוצא אותם מתאימים לחלוטין לצרכיו ומוותר על כל טענת ברירה או אי-התאמה בכפוף לתקינות המוצר המוצהרת.</li>
                        <li>שני הצדדים מסכימים ומבינים כי העסקה מוגנת ומבוטחת במערכת הנאמנות של <strong>Qlikndeal</strong>, והכספים יישמרו בבטחה ולא יועברו למוכר עד אשר יתקבל אישור מסירה ותקינות סופי מהקונה.</li>
                    </ul>
                </div>

                {/* Section 2: Product details */}
                <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" />
                        2. תיאור הממכר ותנאי העסקה
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1.5">
                        <div>
                            <span className="text-muted-foreground block text-[10px]">הפריט הנמכר:</span>
                            <span className="font-bold text-foreground">{itemName}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[10px]">מצב הפריט:</span>
                            <span className="font-bold text-foreground">{conditionLabel}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[10px]">המחיר המוסכם והסופי:</span>
                            <span className="font-extrabold text-primary text-base">₪{value.toLocaleString()}</span>
                        </div>
                    </div>
                    {sellerNotes && (
                        <div className="border-t border-border/60 pt-2.5 mt-2">
                            <span className="text-muted-foreground block text-[10px] font-bold">הצהרת המוכר לגבי מצב הפריט:</span>
                            <p className="text-muted-foreground text-xs italic leading-relaxed mt-0.5 bg-background/50 p-2 rounded border border-border/40">{sellerNotes}</p>
                        </div>
                    )}
                </div>

                {/* Section 3: Delivery terms */}
                <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        3. מסירה וכתובת משלוח
                    </h4>
                    <p className="pr-2">
                        הצדדים מסכימים כי המוצר יימסר לכתובת הקונה המעודכנת כפי שהוצהרה להלן:
                    </p>
                    <div className="bg-muted/50 p-3 rounded-xl border border-border mt-1">
                        <div>כתובת למשלוח: <strong className="text-foreground">
                            {flexibleData.receiverAddress?.city ? `${flexibleData.receiverAddress.street}, ${flexibleData.receiverAddress.city}` : "טרם עודכנה כתובת משלוח"}
                        </strong></div>
                    </div>
                    <p className="pr-2 text-xs text-muted-foreground mt-1">
                        ההובלה תבוצע באמצעות מערך ההובלות של פלטפורמת <strong>Qlikndeal</strong> או באיסוף עצמי מוסכם. על המוכר לארוז את המוצר בצורה בטוחה המונעת נזק במהלך ההובלה.
                    </p>
                </div>

                {/* Section 4: Escrow & Mismatch Cancellation */}
                <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        4. הגנת נאמנות, פער במציאות וביטול עסקה
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 pr-2">
                        <li><strong>שמירה בנאמנות:</strong> הקונה יפקיד את מלוא סכום העסקה לחשבון הנאמנות של <strong>Qlikndeal</strong>. כספים אלו לא ישוחררו למוכר עד לקבלת אישור הקונה או בחלוף 3 ימי עסקים מהמסירה ללא פתיחת אירוע מחלוקת.</li>
                        <li><strong>זכות ביטול עקב פער במציאות:</strong> המוכר מצהיר בזאת כי הנתונים, המפרט ומצב המוצר בפועל תואמים במדויק להצהרותיו. במידה שיתגלה כי הפרטים בפועל סותרים את הפרטים המוצהרים במעמד החוזה, <strong>לקונה עומדת הזכות המלאה לבטל את העסקה באופן מיידי</strong>.</li>
                        <li><strong>חיוב המוכר בעלויות:</strong> במקרה של ביטול העסקה עקב פער בנתונים או מצב לקוי שאינו תואם להצהרה, <strong>המוכר יחוייב במלוא עלות ההובלה והמשלוח</strong> (הלוך וחזור), והכספים שבנאמנות יוחזרו במלואם לקונה ללא עיכוב.</li>
                    </ul>
                </div>

                {/* Section 5: Arbitration */}
                <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        5. מנגנון בוררות מוסכם
                    </h4>
                    <p className="pr-2">
                        במקרה של מחלוקת, סכסוך או טענת אי-התאמה בין הצדדים, <strong>שני הצדדים מסמיכים וממנים בזאת באופן בלעדי את חברת Qlikndeal</strong> לשמש כגוף הבורר המוסכם. החלטת הבורר מטעם החברה תהיה סופית, חלוטה ומחייבת את הצדדים באופן מלא, והם מתחייבים לפעול על פיה ללא תנאי וללא זכות ערעור.
                    </p>
                </div>

                {/* Section 4: Signed base64 signatures rendering */}
                {(flexibleData.sellerSignature || flexibleData.buyerSignature) && (
                    <div className="border-t border-border pt-4 mt-4">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3">חתימות דיגיטליות מאומתות</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {flexibleData.sellerSignature && (
                                <div className="border border-border/80 p-3 rounded-xl bg-background/60 text-center flex flex-col items-center justify-between min-h-[120px]">
                                    <span className="text-[10px] text-muted-foreground block">חתימת המוכר ({flexibleData.sellerRealName})</span>
                                    <div className="w-full h-14 relative flex items-center justify-center my-1 bg-white rounded-lg p-1 border">
                                        <img src={flexibleData.sellerSignature} className="max-h-full max-w-full object-contain" alt="Seller Signature" />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 justify-center">
                                        <Calendar className="w-2.5 h-2.5" /> {formattedDate(flexibleData.sellerSignedAt)}
                                    </span>
                                </div>
                            )}
                            {flexibleData.buyerSignature && (
                                <div className="border border-border/80 p-3 rounded-xl bg-background/60 text-center flex flex-col items-center justify-between min-h-[120px]">
                                    <span className="text-[10px] text-muted-foreground block">חתימת הקונה ({flexibleData.buyerRealName})</span>
                                    <div className="w-full h-14 relative flex items-center justify-center my-1 bg-white rounded-lg p-1 border">
                                        <img src={flexibleData.buyerSignature} className="max-h-full max-w-full object-contain" alt="Buyer Signature" />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 justify-center">
                                        <Calendar className="w-2.5 h-2.5" /> {formattedDate(flexibleData.buyerSignedAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section 5: Signature Inputs & Drawing (Active State) */}
                {isSigning && role && (
                    <div className="border-t border-primary/20 pt-5 mt-4 space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                            <PenTool className="w-4 h-4" />
                            <span>חתימה אלקטרונית ואישור ההסכם</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">שם מלא לחתימה:</label>
                                <Input
                                    value={realName}
                                    onChange={e => setRealName(e.target.value)}
                                    placeholder="ישראל ישראלי"
                                    className="bg-background border-primary/20 h-9"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">מספר תעודת זהות:</label>
                                <Input
                                    value={idNo}
                                    onChange={e => setIdNo(e.target.value)}
                                    placeholder="9 ספרות"
                                    maxLength={9}
                                    className="bg-background border-primary/20 h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-foreground">צייר את חתימתך בתיבה מטה:</label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCanvas}
                                    className="h-6 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold gap-1 px-2 hover:bg-primary/10 rounded-lg"
                                >
                                    <RefreshCw className="w-2.5 h-2.5" /> נקה לוח
                                </Button>
                            </div>
                            
                            <div className="border border-primary/20 rounded-xl overflow-hidden bg-white shadow-inner relative">
                                <canvas
                                    ref={canvasRef}
                                    width={500}
                                    height={120}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full h-[120px] cursor-crosshair touch-none"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleConfirmSign}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 rounded-xl text-xs gap-1.5 transition-all shadow-md active:scale-98"
                        >
                            <Check className="w-4 h-4" />
                            אשר וחתום על החוזה
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
