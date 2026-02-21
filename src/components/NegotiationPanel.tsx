"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, ArrowLeftRight, Clock, AlertCircle } from "lucide-react";
import { submitOffer, acceptOffer } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toggleVideoRequest } from "@/app/actions";
import { Video } from "lucide-react";

interface NegotiationPanelProps {
    shipmentId: string;
    currentOffer: number;
    lastOfferBy: 'buyer' | 'seller';
    currentUserRole: 'buyer' | 'seller';
    onAgreement?: () => void;
    isGuest?: boolean;
}

export function NegotiationPanel({
    shipmentId,
    currentOffer,
    lastOfferBy,
    currentUserRole,
    onAgreement,
    isGuest = false,
    hasVideoRequest = false // New prop
}: NegotiationPanelProps & { hasVideoRequest?: boolean }) { // Extend prop type locally or update interface

    const router = useRouter();
    const [isCountering, setIsCountering] = useState(false);
    const [counterAmount, setCounterAmount] = useState(currentOffer.toString());
    const [loading, setLoading] = useState(false);
    const [videoRequested, setVideoRequested] = useState(hasVideoRequest);

    // Guest Details State
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    const isMyTurn = lastOfferBy !== currentUserRole;

    const handleAccept = async () => {
        if (isGuest && (!guestName || !guestPhone)) {
            alert("אנא מלא שם וטלפון כדי להמשיך");
            return;
        }

        setLoading(true);
        try {
            const guestDetails = isGuest ? { name: guestName, phone: guestPhone } : undefined;
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
        if (isGuest && (!guestName || !guestPhone)) {
            alert("אנא מלא שם וטלפון כדי להמשיך");
            return;
        }

        setLoading(true);
        try {
            const amount = parseFloat(counterAmount);
            if (!amount || amount <= 0) return;

            const guestDetails = isGuest ? { name: guestName, phone: guestPhone } : undefined;
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
        <div className="bg-white/50 backdrop-blur-sm border border-primary/10 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <ArrowLeftRight className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">סטטוס משא ומתן</h3>
                        <p className="text-xs text-muted-foreground">
                            {isMyTurn ? "ממתין לתגובתך" : "ממתין לצד השני..."}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs text-muted-foreground block">הצעה נוכחית</span>
                    <span className="text-xl font-bold text-primary">₪{currentOffer}</span>
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
                        {isGuest && (
                            <div className="bg-muted/50 p-3 rounded-xl border border-primary/20 space-y-3 mb-2 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    פרטים מזהים (חובה)
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
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleAccept}
                                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold shadow-md"
                                    disabled={loading}
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    {currentUserRole === 'buyer' ? "קנה עכשיו במחיר זה" : "קבל הצעה זו"}
                                </Button>

                                <div className="relative flex items-center py-2">
                                    <div className="grow border-t border-muted-foreground/20"></div>
                                    <span className="shrink-0 px-2 text-xs text-muted-foreground bg-transparent">או</span>
                                    <div className="grow border-t border-muted-foreground/20"></div>
                                </div>

                                <Button
                                    onClick={() => setIsCountering(true)}
                                    variant="outline"
                                    className="w-full h-10 text-sm border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary"
                                    disabled={loading}
                                >
                                    {currentUserRole === 'buyer' ? "הצע מחיר אחר" : "שלח הצעה נגדית"}
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-top-2 fade-in">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute right-3 top-2 text-muted-foreground">₪</span>
                                        <Input
                                            type="number"
                                            value={counterAmount}
                                            onChange={e => setCounterAmount(e.target.value)}
                                            className="pr-6 h-10 text-lg font-bold"
                                            autoFocus
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCounter}
                                        className="w-24 h-10"
                                        disabled={loading}
                                    >
                                        שלח
                                    </Button>
                                    <Button
                                        onClick={() => setIsCountering(false)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-muted/30 p-3 rounded-lg text-center border border-dashed border-border">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <Clock className="w-4 h-4 animate-pulse" />
                            <span>הצעה נשלחה. ממתין לתשובה...</span>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
