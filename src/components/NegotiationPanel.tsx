"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, ArrowLeftRight, Clock, Send, DollarSign, Video, FileText, Shield, UserCheck, CheckCircle, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { submitOffer, acceptOffer, sendMessageInChat, updateTypingStatus } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toggleVideoRequest } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import { LegalContract } from "@/components/LegalContract";
import { toast } from "sonner";

interface NegotiationPanelProps {
    shipmentId: string;
    currentOffer: number;
    lastOfferBy: 'buyer' | 'seller';
    currentUserRole: 'buyer' | 'seller';
    onAgreement?: () => void;
    isGuest?: boolean;
    hasVideoRequest?: boolean;
    offers?: { amount: number; by: 'buyer' | 'seller'; timestamp: string }[];
    messages?: { id: string; sender: 'buyer' | 'seller'; text: string; timestamp: string }[];
    buyerId?: string;
    otherUserIsTyping?: boolean;
    shipmentStatus?: string;
    itemName?: string;
    itemCondition?: string;
    sellerNotes?: string;
    sellerName?: string;
    buyerName?: string;
    flexibleData?: any;
}

export function NegotiationPanel({
    shipmentId,
    currentOffer,
    lastOfferBy,
    currentUserRole,
    onAgreement,
    isGuest = false,
    hasVideoRequest = false,
    offers = [],
    messages = [],
    buyerId,
    otherUserIsTyping = false,
    shipmentStatus = "DRAFT",
    itemName = "מוצר",
    itemCondition,
    sellerNotes,
    sellerName = "המוכר",
    buyerName = "הקונה",
    flexibleData = {}
}: NegotiationPanelProps) {

    const router = useRouter();
    const [isCountering, setIsCountering] = useState(false);
    const [counterAmount, setCounterAmount] = useState(currentOffer.toString());
    const [loading, setLoading] = useState(false);
    const [videoRequested, setVideoRequested] = useState(hasVideoRequest);
    const [chatText, setChatText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isContractOpen, setIsContractOpen] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ═══ OPTIMISTIC MESSAGES — instant UI updates ═══
    const [optimisticMessages, setOptimisticMessages] = useState<
        { id: string; sender: 'buyer' | 'seller'; text: string; timestamp: string; pending?: boolean }[]
    >([]);

    // Merge server messages with optimistic ones (dedup by matching text+sender within 30s)
    const allMessages = (() => {
        const serverMsgs = [...messages];
        const pending = optimisticMessages.filter(opt => {
            // If a server message matches this optimistic one, skip it
            return !serverMsgs.some(srv =>
                srv.sender === opt.sender &&
                srv.text === opt.text &&
                Math.abs(new Date(srv.timestamp).getTime() - new Date(opt.timestamp).getTime()) < 30000
            );
        });
        return [...serverMsgs, ...pending];
    })();

    // Cleanup: remove optimistic messages that are now in server props
    useEffect(() => {
        if (optimisticMessages.length > 0 && messages.length > 0) {
            setOptimisticMessages(prev => prev.filter(opt =>
                !messages.some(srv =>
                    srv.sender === opt.sender &&
                    srv.text === opt.text &&
                    Math.abs(new Date(srv.timestamp).getTime() - new Date(opt.timestamp).getTime()) < 30000
                )
            ));
        }
    }, [messages]);

    // Track message count and show notification for new incoming messages
    const prevMessagesLength = useRef(messages.length);
    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const newMessages = messages.slice(prevMessagesLength.current);
            newMessages.forEach((msg) => {
                if (msg.sender !== currentUserRole) {
                    try {
                        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav");
                        audio.volume = 0.4;
                        audio.play().catch(() => {});
                    } catch (e) {}

                    toast.info(`הודעה חדשה מ${currentUserRole === 'buyer' ? sellerName : buyerName}`, {
                        description: msg.text,
                        duration: 5000,
                    });

                    // Flash tab title if document is hidden (user is in another tab)
                    if (document.hidden) {
                        let isFlashed = false;
                        const originalTitle = document.title;
                        const partnerName = currentUserRole === 'buyer' ? sellerName : buyerName;
                        const intervalId = setInterval(() => {
                            document.title = isFlashed 
                                ? originalTitle 
                                : `✉️ (1) הודעה חדשה מ-${partnerName}!`;
                            isFlashed = !isFlashed;
                        }, 1000);

                        const handleFocus = () => {
                            clearInterval(intervalId);
                            document.title = originalTitle;
                            window.removeEventListener("focus", handleFocus);
                        };
                        window.addEventListener("focus", handleFocus);
                    }
                }
            });
        }
        prevMessagesLength.current = messages.length;
    }, [messages, currentUserRole, sellerName, buyerName]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [allMessages.length, otherUserIsTyping]);

    const handleInputChange = (val: string) => {
        setChatText(val);

        if (!isTyping) {
            setIsTyping(true);
            updateTypingStatus(shipmentId, currentUserRole, true);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            updateTypingStatus(shipmentId, currentUserRole, false);
        }, 4000);
    };

    // Guest Details State
    const { user } = useUser();
    const needsGuestDetails = isGuest && (!user?.fullName || !user?.primaryPhoneNumber?.phoneNumber);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    let isMyTurn = lastOfferBy !== currentUserRole;
    if (offers.length === 0) {
        isMyTurn = currentUserRole === 'buyer';
    }

    const handleAccept = async () => {
        if (needsGuestDetails && (!guestName || !guestPhone)) {
            alert("אנא מלא שם וטלפון כדי להמשיך");
            return;
        }

        setLoading(true);
        try {
            const guestDetails = needsGuestDetails ? { name: guestName, phone: guestPhone } : undefined;
            const res = await acceptOffer(shipmentId, currentUserRole, guestDetails);
            if (res.success) {
                if (onAgreement) onAgreement();
                router.refresh();
            } else {
                alert("שגיאה: " + res.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCounter = async () => {
        const needsGuestDetails = isGuest && (!user?.fullName || !user?.primaryPhoneNumber?.phoneNumber);
        if (needsGuestDetails && (!guestName || !guestPhone)) {
            alert("אנא מלא שם וטלפון כדי להמשיך");
            return;
        }

        setLoading(true);
        try {
            const amount = parseFloat(counterAmount);
            if (!amount || amount <= 0) return;

            const guestDetails = needsGuestDetails ? { name: guestName, phone: guestPhone } : undefined;
            const res = await submitOffer(shipmentId, amount, currentUserRole, buyerId, guestDetails);
            if (res.success) {
                setIsCountering(false);
                router.refresh();
            } else {
                alert("שגיאה: " + res.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ═══ OPTIMISTIC SEND — instant message display ═══
    const handleSendText = async () => {
        const text = chatText.trim();
        if (!text) return;

        // 1. Clear input and stop typing indicator IMMEDIATELY
        setChatText("");
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);

        // 2. Add optimistic message to local state — appears INSTANTLY
        const optimisticMsg = {
            id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            sender: currentUserRole,
            text,
            timestamp: new Date().toISOString(),
            pending: true,
        };
        setOptimisticMessages(prev => [...prev, optimisticMsg]);

        // 3. Fire server action in background (non-blocking)
        sendMessageInChat(shipmentId, text, currentUserRole, buyerId)
            .then(res => {
                if (!res.success) {
                    // Mark as failed — remove from optimistic and show error
                    setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                    toast.error("שגיאה בשליחת ההודעה, נסה שוב");
                }
                // No router.refresh() needed — the 5s polling handles sync
            })
            .catch(() => {
                setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                toast.error("שגיאת רשת, ההודעה לא נשלחה");
            });

        // 4. Stop typing status in background (fire-and-forget)
        updateTypingStatus(shipmentId, currentUserRole, false).catch(() => {});
    };

    const handleVideoToggle = async () => {
        setVideoRequested(!videoRequested);
        await toggleVideoRequest(shipmentId, !videoRequested);
        router.refresh();
    };

    // Combine offers and text messages chronologically
    const timeline = [
        ...offers.map(o => ({
            type: 'offer' as const,
            id: `offer-${o.timestamp || o.amount}`,
            by: o.by,
            amount: o.amount,
            timestamp: o.timestamp || new Date().toISOString()
        })),
        ...allMessages.map(m => ({
            type: 'message' as const,
            id: m.id,
            by: m.sender,
            text: m.text,
            timestamp: m.timestamp,
            pending: (m as any).pending,
        }))
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Calculate contract status
    let contractStatusLabel = "משא ומתן פעיל 📝";
    let contractStatusColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    let contractProgressText = "שני הצדדים בעיצומו של משא ומתן להסכמה על המחיר.";
    if (shipmentStatus === "SELLER_APPROVED") {
        contractStatusLabel = "חתום ע״י המוכר ⏳";
        contractStatusColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
        contractProgressText = "המוכר חתם על ההסכם. ממתין לחתימה של הקונה לסגירת העסקה.";
    } else if (shipmentStatus === "AGREED" || shipmentStatus === "PAID" || shipmentStatus === "DELIVERED") {
        contractStatusLabel = "חוזה חתום ומאושר 🔒";
        contractStatusColor = "text-green-400 bg-green-500/10 border-green-500/20";
        contractProgressText = "העסקה נחתמה בהצלחה על ידי שני הצדדים ומאובטחת בנאמנות!";
    }

    const translatedCondition = itemCondition === "New" ? "חדש באריזה" : itemCondition === "Used" ? "משומש" : itemCondition || "לא צוין";

    // Check if negotiation is agreed (price accepted by both sides)
    const isNegotiationAgreed = flexibleData.negotiationStatus === 'agreed';

    return (
        <div className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-3xl p-5 mb-6 shadow-2xl shadow-primary/5 flex flex-col h-[75vh] min-h-[550px]" dir="rtl">
            {/* ═══════ AGREEMENT REACHED BANNER ═══════ */}
            {isNegotiationAgreed && (
                <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-5 text-white overflow-hidden shadow-xl shadow-emerald-500/20">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                        <div className="absolute top-2 left-2 w-12 h-12 rounded-full bg-white/10 blur-xl" />
                        
                        <div className="relative flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner">
                                    <CheckCircle className="w-7 h-7 text-white drop-shadow-md" />
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-right">
                                <h3 className="text-lg font-black tracking-tight mb-0.5">🎉 הסכמה הושגה!</h3>
                                <p className="text-emerald-100 text-sm leading-relaxed">
                                    שני הצדדים הסכימו על מחיר של <span className="font-black text-white text-lg mx-1">₪{currentOffer}</span>
                                </p>
                                <p className="text-emerald-200/80 text-xs mt-1">
                                    כעת יש לחתום על ההסכם הרשמי כדי להתקדם לשלב התשלום וההובלה.
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <Button
                                    onClick={() => onAgreement?.()}
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 font-extrabold h-12 px-6 rounded-xl shadow-lg shadow-black/10 text-sm gap-2 transition-all hover:scale-105"
                                >
                                    <FileText className="w-4 h-4" />
                                    המשך לחתימה על החוזה
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-primary/10 gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-2 rounded-2xl text-primary shadow-inner">
                        <ArrowLeftRight className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-foreground">זירת סחר ומשא ומתן</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            {isNegotiationAgreed ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-500 font-bold">✓ מחיר סוכם — ממתין לחתימות</span>
                                </>
                            ) : (
                                <>
                                    <span className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                    {isMyTurn ? "תורך! הצע או קבל" : "ממתין לתגובת הצד השני..."}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Contract Status Dialog Trigger */}
                    <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
                        <Button onClick={() => setIsContractOpen(true)} variant="outline" size="sm" className="rounded-2xl border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold gap-1 h-9 px-3">
                            <FileText className="w-3.5 h-3.5" />
                            <span>סטטוס החוזה</span>
                        </Button>
                        <DialogContent className="max-w-[650px] w-[95vw] p-0 overflow-hidden bg-background rounded-3xl border border-primary/20 text-right" dir="rtl">
                            <LegalContract
                                itemName={itemName}
                                value={currentOffer}
                                itemCondition={translatedCondition}
                                sellerNotes={sellerNotes}
                                sellerName={sellerName}
                                buyerName={buyerName}
                                flexibleData={flexibleData}
                            />
                        </DialogContent>
                    </Dialog>

                    <div className="text-right bg-primary/5 px-3 py-1.5 rounded-2xl border border-primary/10">
                        <span className="text-[10px] text-muted-foreground block font-medium">{isNegotiationAgreed ? 'מחיר מוסכם' : 'הצעה אחרונה מונחת'}</span>
                        <span className={`text-xl font-black font-mono ${isNegotiationAgreed ? 'text-emerald-500' : 'text-primary'}`}>₪{currentOffer}</span>
                    </div>
                </div>
            </div>

            {/* Chat Timeline (The Arena) */}
            <div className="relative flex-1 rounded-2xl mb-4 shadow-inner border border-primary/10 overflow-hidden bg-slate-100 dark:bg-[#0b141a]">
                <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div ref={scrollRef} className="relative h-full overflow-y-auto custom-scrollbar p-4 space-y-4 flex flex-col">
                    {timeline.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center bg-card shadow-[0_0_20px_rgba(0,0,0,0.4)] dark:shadow-none border border-border/50 text-foreground text-sm py-5 px-6 rounded-3xl max-w-[85%] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
                                <span className="block text-3xl mb-3 drop-shadow-md">🤝</span>
                                <b className="text-base tracking-tight mb-2 block">זירת הסחר פתוחה ומוכנה</b>
                                <p className="text-muted-foreground leading-relaxed mb-3">
                                    מחירו ההתחלתי של המוצר הוא: <span className="text-primary font-bold text-lg">₪{currentOffer}</span>.
                                </p>
                                <p className="text-xs opacity-80 leading-relaxed bg-muted/50 p-2 rounded-xl">
                                    ניתן לכתוב הודעה בצ'אט או להגיש הצעת מחיר חלופית בעזרת הכפתורים למטה.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center flex-shrink-0 animate-in fade-in zoom-in duration-500">
                                 <div className="bg-muted/80 backdrop-blur-sm border border-border/50 text-muted-foreground text-[10px] font-medium py-1 px-3 rounded-full shadow-sm">
                                    זירת הסחר נפתחה. מחיר מקורי: ₪{currentOffer}
                                 </div>
                            </div>

                            {timeline.map((item) => {
                                const isMe = item.by === currentUserRole;
                                const alignment = isMe ? "justify-end" : "justify-start";
                                const borderRadius = isMe ? "rounded-l-2xl rounded-tr-2xl rounded-br-sm" : "rounded-r-2xl rounded-tl-2xl rounded-bl-sm";
                                
                                if (item.type === 'offer') {
                                    // Price Offer bubble (distinct styling, green-tinted for outgoing, purple for incoming)
                                    const bgColor = isMe
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-100"
                                        : "bg-purple-500/20 border-purple-500/40 text-purple-100";
                                    const labelStr = isMe ? "הצעתך:" : (item.by === 'seller' ? 'הצעת המוכר:' : 'הצעת הקונה:');

                                    return (
                                        <div key={item.id} className={`flex ${alignment} w-full animate-in fade-in slide-in-from-bottom-2`}>
                                            <div className={`px-4 py-3 rounded-2xl border ${bgColor} max-w-[80%] shadow-lg relative flex flex-col gap-1`}>
                                                <span className="text-[10px] font-bold opacity-75 tracking-wider">{labelStr}</span>
                                                <div className="text-2xl font-black font-mono leading-none my-1 flex items-baseline gap-0.5">
                                                    <span className="text-sm opacity-80">₪</span>{item.amount}
                                                </div>
                                                <span className="text-[9px] opacity-60 text-left">
                                                    {new Date(item.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    // Regular chat message bubble
                                    const bgColor = isMe 
                                        ? "bg-indigo-600 text-white" 
                                        : "bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100";

                                    return (
                                        <div key={item.id} className={`flex ${alignment} w-full animate-in fade-in slide-in-from-bottom-2`}>
                                            <div className={`px-4 py-2.5 ${borderRadius} ${bgColor} max-w-[80%] shadow-md relative border border-black/5 dark:border-white/5 ${item.pending ? 'opacity-70' : ''}`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{item.text}</p>
                                                <div className="text-[9px] opacity-60 mt-1 flex justify-end items-center gap-1">
                                                    {new Date(item.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && (
                                                        item.pending 
                                                            ? <Clock className="w-3 h-3 opacity-50 animate-spin" style={{ animationDuration: '2s' }} />
                                                            : <Check className="w-3 h-3 opacity-70" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })}

                            {otherUserIsTyping && (
                                <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2">
                                    <div className="px-4 py-2.5 rounded-r-2xl rounded-tl-2xl rounded-bl-sm bg-white dark:bg-[#202c33] text-zinc-850 dark:text-zinc-100 shadow-md border border-black/5 dark:border-white/5 flex items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground ml-1">כותב/ת</span>
                                        <span className="flex gap-1 items-center pt-0.5">
                                            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons Area */}
            <div className="mb-3 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    {isNegotiationAgreed ? (
                        /* Agreement reached — show proceed CTA */
                        <Button
                            size="sm"
                            onClick={() => onAgreement?.()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-xl text-xs gap-1.5 shadow-md shadow-emerald-500/20 animate-pulse"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            המשך לחתימה
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </Button>
                    ) : isMyTurn ? (
                        /* My turn — show Accept & Counter */
                        <>
                            <Button
                                size="sm"
                                onClick={handleAccept}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-xl text-xs"
                                disabled={loading}
                            >
                                <Check className="w-3.5 h-3.5 ml-1" />
                                {offers.length === 0 ? "קנה במחיר זה" : "קבל הצעה"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setIsCountering(true)}
                                variant="outline"
                                className="border-primary/30 text-primary hover:bg-primary/5 font-bold h-9 rounded-xl text-xs"
                                disabled={loading}
                            >
                                <DollarSign className="w-3.5 h-3.5 ml-1" />
                                הצע מחיר
                            </Button>
                        </>
                    ) : (
                        /* Waiting for other party */
                        <div className="flex items-center gap-2 text-muted-foreground text-xs bg-muted/50 px-3 py-2 rounded-xl border border-border">
                            <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                            <span>ממתין שהצד השני יגיב להצעה שלך...</span>
                        </div>
                    )}
                </div>
                
                {!isNegotiationAgreed && (
                    <Button
                        variant={videoRequested ? "secondary" : "ghost"}
                        size="sm"
                        onClick={handleVideoToggle}
                        className={`text-xs gap-1.5 h-8 ${videoRequested ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-muted-foreground'}`}
                    >
                        <Video className={`w-3.5 h-3.5 ${videoRequested ? 'animate-pulse' : 'opacity-50'}`} />
                        {videoRequested ? "ביקשת שיחת וידאו" : "בקש שיחת וידאו"}
                    </Button>
                )}
            </div>

            {/* Guest details fields inside chat card if required */}
            {isGuest && (!user?.fullName || !user?.primaryPhoneNumber?.phoneNumber) && (
                <div className="bg-muted/50 p-2.5 rounded-xl border border-primary/20 space-y-2 mb-2">
                    <h4 className="text-[11px] font-bold text-primary flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        {user ? "השלמת פרטי התקשרות לחבר רשום (חובה להצעת מחיר)" : "פרטי התקשרות לאורח (חובה להצעת מחיר)"}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="שם מלא"
                            className="h-7 text-xs bg-background"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                        <Input
                            placeholder="טלפון"
                            className="h-7 text-xs bg-background"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            type="tel"
                        />
                    </div>
                </div>
            )}

            {/* Price Counter Offer Overlay Dialog/Card */}
            {isCountering && (
                <div className="absolute inset-x-4 bottom-16 z-30 animate-in slide-in-from-bottom-4 fade-in bg-slate-900 border border-primary/20 p-4 rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-white">הצעת מחיר חלופית</h4>
                        <button onClick={() => setIsCountering(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute right-3 top-2.5 text-muted-foreground font-mono text-base">₪</span>
                            <Input
                                type="number"
                                value={counterAmount}
                                onChange={e => setCounterAmount(e.target.value)}
                                className="pr-8 h-10 text-lg font-black font-mono bg-background border-primary/30 rounded-xl"
                                autoFocus
                            />
                        </div>
                        <Button
                            onClick={handleCounter}
                            className="h-10 px-4 rounded-xl font-bold bg-primary text-white text-xs"
                            disabled={loading}
                        >
                            שלח הצעה
                        </Button>
                    </div>
                </div>
            )}

            {/* Sticky Chat Input Bar */}
            <div className="flex gap-2 items-center mt-1 border-t border-primary/10 pt-3 flex-shrink-0">
                <Button
                    type="button"
                    onClick={() => setIsContractOpen(true)}
                    variant="outline"
                    className="h-10 px-3 bg-[#1e1b4b]/40 border-indigo-500/30 hover:bg-[#1e1b4b]/80 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                    title="הצג חוזה משפטי"
                >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">הצג חוזה</span>
                </Button>
                <Input
                    placeholder="הקלד הודעה..."
                    className="flex-1 h-10 bg-muted/60 dark:bg-slate-800/60 border-border focus:border-primary/50 text-foreground rounded-xl placeholder:text-muted-foreground text-sm"
                    value={chatText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendText();
                    }}
                />
                <Button
                    size="icon"
                    onClick={handleSendText}
                    className="h-10 w-10 rounded-xl shadow-md flex items-center justify-center shrink-0 transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-muted disabled:text-muted-foreground"
                    disabled={loading || !chatText.trim()}
                >
                    <Send className="w-4 h-4 rotate-180" />
                </Button>
            </div>
        </div>
    );
}
