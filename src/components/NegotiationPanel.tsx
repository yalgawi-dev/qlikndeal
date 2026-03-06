"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, ArrowLeftRight, Clock, AlertCircle } from "lucide-react";
import { submitOffer, acceptOffer } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toggleVideoRequest } from "@/app/actions";
import { Video } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface NegotiationPanelProps {
    shipmentId: string;
    currentOffer: number;
    lastOfferBy: 'buyer' | 'seller';
    currentUserRole: 'buyer' | 'seller';
    onAgreement?: () => void;
    isGuest?: boolean;
    hasVideoRequest?: boolean;
    offers?: { amount: number; by: 'buyer' | 'seller'; timestamp: string }[];
}

export function NegotiationPanel({
    shipmentId,
    currentOffer,
    lastOfferBy,
    currentUserRole,
    onAgreement,
    isGuest = false,
    hasVideoRequest = false,
    offers = []
}: NegotiationPanelProps) {

    const router = useRouter();
    const [isCountering, setIsCountering] = useState(false);
    const [counterAmount, setCounterAmount] = useState(currentOffer.toString());
    const [loading, setLoading] = useState(false);
    const [videoRequested, setVideoRequested] = useState(hasVideoRequest);

    // Guest Details State
    const { user } = useUser();
    // Pre-fill from Clerk user if available
    const [guestName, setGuestName] = useState(user?.fullName || "");
    const [guestPhone, setGuestPhone] = useState(user?.primaryPhoneNumber?.phoneNumber || "");

    let isMyTurn = lastOfferBy !== currentUserRole;
    if (offers.length === 0) {
        // If no offers yet, it is ONLY the buyer's turn to make the first move.
        // The seller must wait for the buyer to submit an offer or accept the list price.
        isMyTurn = currentUserRole === 'buyer';
    }

    const handleAccept = async () => {
        const needsGuestDetails = isGuest && (!user?.fullName || !user?.primaryPhoneNumber?.phoneNumber);
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
            const res = await submitOffer(shipmentId, amount, currentUserRole, undefined, guestDetails);
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



    const handleVideoToggle = async () => {
        setVideoRequested(!videoRequested);
        await toggleVideoRequest(shipmentId, !videoRequested);
        router.refresh();
    };

    return (
        <div className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-3xl p-5 mb-6 shadow-2xl shadow-primary/5">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-3 rounded-2xl text-primary shadow-inner">
                        <ArrowLeftRight className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-base tracking-tight text-foreground">זירת סחר ומשא ומתן</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></span>
                            {isMyTurn ? "תורך! הצע או קבל" : "ממתין לתגובת הצד השני..."}
                        </p>
                    </div>
                </div>
                <div className="text-right bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                    <span className="text-xs text-muted-foreground block font-medium">הצעה אחרונה מונחת</span>
                    <span className="text-2xl font-black text-primary font-mono">₪{currentOffer}</span>
                </div>
            </div>

            {/* Chat History Area (The Arena) */}
            <div className="relative rounded-2xl mb-6 shadow-inner border border-primary/10 overflow-hidden bg-slate-100 dark:bg-[#0b141a]">
                {/* Subtle chat background pattern (WhatsApp style dots/doodles placeholder using CSS gradient dots) */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative h-[45vh] max-h-[500px] overflow-y-auto custom-scrollbar p-4 space-y-4 flex flex-col">
                {offers.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center bg-card shadow-[0_0_20px_rgba(0,0,0,0.4)] dark:shadow-none border border-border/50 text-foreground text-sm py-5 px-6 rounded-3xl max-w-[85%] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
                            <span className="block text-3xl mb-3 drop-shadow-md">🤝</span>
                            <b className="text-base tracking-tight mb-2 block">זירת הסחר פתוחה ומוכנה</b>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                מחירו ההתחלתי של המוצר הוא: <span className="text-primary font-bold text-lg">₪{currentOffer}</span>.
                            </p>
                            <p className="text-xs opacity-80 leading-relaxed bg-muted/50 p-2 rounded-xl">
                                ניתן להגיש הצעת מחיר בהתאם לתקציבכם, או לסגור את העסקה במחיר המקורי באופן מיידי ולחסוך זמן.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* System Message for opening */}
                        <div className="flex justify-center flex-shrink-0 animate-in fade-in zoom-in duration-500">
                             <div className="bg-muted/80 backdrop-blur-sm border border-border/50 text-muted-foreground text-[10px] font-medium py-1 px-3 rounded-full shadow-sm">
                                זירת הסחר נפתחה. מחירו המקורי: ₪{currentOffer}
                             </div>
                        </div>

                        {/* Messages */}
                        {offers.map((offer, idx) => {
                            const isMe = offer.by === currentUserRole;
                            /* WhatsApp-like colors: #d9fdd3 for light mode outgoing, #005c4b for dark mode outgoing */
                            const bgColor = isMe 
                                ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100" 
                                : "bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100";
                            const alignment = isMe ? "justify-end" : "justify-start";
                            const borderRadius = isMe ? "rounded-l-2xl rounded-tr-2xl rounded-br-sm" : "rounded-r-2xl rounded-tl-2xl rounded-bl-sm";
                            const labelStr = isMe ? "הצעת:" : (offer.by === 'seller' ? 'המוכר הציע:' : 'הקונה הציע:');
                            
                            return (
                                <div key={idx} className={`flex ${alignment} w-full animate-in fade-in slide-in-from-bottom-2 flex-shrink-0`}>
                                    <div className={`px-4 py-3 ${borderRadius} ${bgColor} max-w-[80%] shadow-md relative group border border-black/5 dark:border-white/5`}>
                                        {/* Tail element mimicking chat bubble */}
                                        <div className={`absolute top-0 ${isMe ? '-right-2 border-l-[12px] border-l-[#d9fdd3] dark:border-l-[#005c4b]' : '-left-2 border-r-[12px] border-r-white dark:border-r-[#202c33]'} border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent w-0 h-0`}></div>
                                        
                                        <div className="text-[11px] font-bold opacity-60 mb-0.5 uppercase tracking-wider">
                                            {labelStr}
                                        </div>
                                        <div className="text-2xl font-black font-mono leading-none my-1 flex items-baseline gap-1">
                                            <span className="text-lg opacity-70">₪</span>{offer.amount}
                                        </div>
                                        <div className="text-[10px] opacity-50 mt-1 flex justify-end items-center gap-1">
                                            {new Date(offer.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && <Check className="w-3 h-3 opacity-70" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                </div>
            </div>

            {/* Video Call Request */}
            <div className="mb-4 flex justify-end">
                <Button
                    variant={videoRequested ? "secondary" : "ghost"}
                    size="sm"
                    onClick={handleVideoToggle}
                    className={`text-xs gap-2 ${videoRequested ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-muted-foreground'}`}
                >
                    <Video className={`w-4 h-4 ${videoRequested ? 'animate-pulse' : 'opacity-50'}`} />
                    {videoRequested ? "ביקשת שיחת וידאו" : "בקש שיחת וידאו"}
                </Button>
            </div>

            {
                isMyTurn ? (
                    <div className="space-y-3">
                        {/* Identification Fields (Guest or Logged In without phone) */}
                        {(isGuest && (!user?.fullName || !user?.primaryPhoneNumber?.phoneNumber)) && (
                            <div className="bg-muted/50 p-3 rounded-xl border border-primary/20 space-y-3 mb-2 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    פרטי התקשרות {(!user) ? "(חובה למשתמש אורח)" : "(השלם פרטים חסרים)"}
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground">שם מלא</label>
                                        <Input
                                            placeholder="ישראל ישראלי"
                                            className="h-8 text-xs bg-background"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground">הטלפון שלך (לעדכונים)</label>
                                        <Input
                                            placeholder="050-0000000"
                                            className="h-8 text-xs bg-background"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            type="tel"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {!isCountering ? (
                            <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-2 fade-in">
                                <Button
                                    onClick={handleAccept}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-green-900/20 text-white"
                                    disabled={loading}
                                >
                                    <Check className="w-6 h-6 mr-2" />
                                    {currentUserRole === 'buyer' 
                                        ? (offers.length === 0 ? "הסכם וקנה במחיר זה 🤝" : "קבל הצעה זו וקנה 🤝") 
                                        : "קבל הצעה זו וסגור עסקה"}
                                </Button>

                                <div className="relative flex items-center py-2">
                                    <div className="grow border-t border-border/50"></div>
                                    <span className="shrink-0 px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 bg-transparent">או</span>
                                    <div className="grow border-t border-border/50"></div>
                                </div>

                                <Button
                                    onClick={() => setIsCountering(true)}
                                    variant="outline"
                                    className="w-full h-12 rounded-2xl text-base border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary tracking-wide font-bold"
                                    disabled={loading}
                                >
                                    {currentUserRole === 'buyer' ? "הצע מחיר אחר 💬" : "שלח הצעה נגדית 💬"}
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-4 fade-in bg-card border border-primary/20 p-4 rounded-2xl shadow-lg">
                                <h4 className="text-sm font-bold text-foreground mb-3">{currentUserRole === 'buyer' ? "כמה תרצה להציע על המוצר?" : "הצעת מחיר חלופית לקונה"}</h4>
                                <div className="flex gap-2 relative">
                                    <div className="relative flex-1">
                                        <span className="absolute right-4 top-3 text-muted-foreground/70 font-mono text-xl">₪</span>
                                        <Input
                                            type="number"
                                            value={counterAmount}
                                            onChange={e => setCounterAmount(e.target.value)}
                                            className="pr-10 h-14 text-2xl font-black font-mono bg-background border-primary/30 rounded-xl focus-visible:ring-primary shadow-inner"
                                            autoFocus
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCounter}
                                        className="h-14 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md"
                                        disabled={loading}
                                    >
                                        שלח הצעה
                                    </Button>
                                    <Button
                                        onClick={() => setIsCountering(false)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-14 w-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-muted/30 backdrop-blur-md p-6 rounded-3xl text-center border border-dashed border-primary/30 shadow-inner flex flex-col items-center justify-center gap-4 py-8">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 relative shadow-lg shadow-primary/5">
                            <Clock className="w-7 h-7 animate-pulse" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                            </span>
                        </div>
                        <h4 className="font-extrabold text-lg text-foreground tracking-tight">
                            {offers.length === 0 ? "הזירה מוכנה ופעילה 🚀" : "הצעתך שוגרה בהצלחה! 🚀"}
                        </h4>
                        <p className="text-muted-foreground text-sm max-w-[250px] leading-relaxed">
                            {offers.length === 0 
                                ? (currentUserRole === 'seller' ? "אנו ממתינים כעת לקונה שיעיין במוצר ויגיש את הצעתו הראשונה או יסכים למחיר המקורי." : "התחל את המשא ומתן על ידי הגשת הצעה.") 
                                : "הצד השני קיבל התראה, אנו ממתינים כעת לתגובתו לעדכון העסקה..."}
                        </p>
                    </div>
                )
            }
        </div >
    );
}
