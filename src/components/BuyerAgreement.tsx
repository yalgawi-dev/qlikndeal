"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Lock, Truck, Clock, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { NegotiationPanel } from "./NegotiationPanel";
import { finalizeShipment } from "@/app/actions";
import { createServiceRequest } from "@/app/actions/service-provider";
import { LegalContract } from "@/components/LegalContract";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface BuyerAgreementProps {
    shipmentId: string;
    sellerName: string;
    details: any;
    shipmentStatus?: string;
}

export function BuyerAgreement({ shipmentId, sellerName, details, shipmentStatus }: BuyerAgreementProps) {
    const { user, isLoaded } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1); // 1 = Details, 2 = Payment/Finalize
    const [loading, setLoading] = useState(false);
    const [buyerSignatureData, setBuyerSignatureData] = useState<{
        realName: string;
        idNo: string;
        signatureBase64: string;
    } | null>(null);

    // Guest Form State
    const [guestDetails, setGuestDetails] = useState({
        fullName: "",
        phone: "",
        city: "",
        street: "",
        needsDelivery: false
    });

    const [payer, setPayer] = useState<'buyer' | 'seller'>('buyer'); // Default to buyer pays


    // Negotiation Logic
    let flexibleData: any = {};
    try { flexibleData = JSON.parse(details.flexibleData || '{}'); } catch (e) { }

    const negotiationStatus = flexibleData.negotiationStatus || 'active';
    const lastOfferBy = flexibleData.lastOfferBy || 'buyer';
    const isPriceAgreed = negotiationStatus === 'agreed';
    const isSellerFinalized = flexibleData.sellerApprovedAt;
    const offers = flexibleData.offers || [];
    const messages = flexibleData.messages || [];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGuestDetails({ ...guestDetails, [e.target.name]: e.target.value });
    };

    const handleFinalize = async () => {
        setLoading(true);
        try {
            // 1. Finalize shipment (Payment/Order)
            const res = await finalizeShipment(shipmentId, {
                ...guestDetails,
                buyerRealName: buyerSignatureData?.realName,
                buyerIdNo: buyerSignatureData?.idNo,
                buyerSignature: buyerSignatureData?.signatureBase64,
                buyerSignedAt: new Date().toISOString()
            }, payer);

            if (res.success) {
                // 2. If delivery requested, create Service Request
                if (guestDetails.needsDelivery) {
                    await createServiceRequest(
                        shipmentId,
                        `הובלה עבור ${details.itemName} (מ- ${guestDetails.city} ל- יעד המוכר)`,
                        { pickup: "כתובת מוכר (TBD)", dropoff: `${guestDetails.street}, ${guestDetails.city}` }
                    );
                }

                setStep(3);
            } else {
                alert("שגיאה: " + res.error);
            }
        } catch (error) {
            console.error(error);
            alert("שגיאה בביצוע ההזמנה");
        } finally {
            setLoading(false);
        }
    };

    // Check if user is logged in but missing phone
    const isGuestUser = isLoaded && !user;
    const isMissingPhone = isLoaded && !!user && (!user.phoneNumbers || user.phoneNumbers.length === 0);
    const needsIdentification = isGuestUser || isMissingPhone;

    const router = useRouter();

    // Auto-polling: refresh every 5s to keep chat, offers and status in sync
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000);
        return () => clearInterval(interval);
    }, [router]);

    // Ref for scrolling to contract section
    const contractRef = useRef<HTMLDivElement>(null);

    const scrollToContract = () => {
        contractRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!isPriceAgreed) {
        const otherTyping = !!(flexibleData.sellerIsTyping && 
            flexibleData.sellerTypingTime && 
            (new Date().getTime() - new Date(flexibleData.sellerTypingTime).getTime() < 8000));
        return (
            <NegotiationPanel
                shipmentId={shipmentId}
                currentOffer={details.value}
                lastOfferBy={lastOfferBy}
                currentUserRole="buyer"
                onAgreement={() => setStep(2)}
                isGuest={needsIdentification}
                offers={offers}
                messages={messages}
                otherUserIsTyping={otherTyping}
                buyerId={user?.id || undefined}
                shipmentStatus={shipmentStatus}
                itemName={details.itemName}
                itemCondition={details.itemCondition}
                sellerNotes={details.sellerNotes}
                sellerName={sellerName}
                buyerName={user?.firstName || "קונה"}
                flexibleData={flexibleData}
            />
        );
    }

    // Price Agreed — show NegotiationPanel (with agreement banner) + Contract below
    const otherTyping = !!(flexibleData.sellerIsTyping && 
        flexibleData.sellerTypingTime && 
        (new Date().getTime() - new Date(flexibleData.sellerTypingTime).getTime() < 8000));

    return (
        <div className="space-y-6">
            {/* Keep showing the negotiation panel with chat history + agreement banner */}
            <NegotiationPanel
                shipmentId={shipmentId}
                currentOffer={details.value}
                lastOfferBy={lastOfferBy}
                currentUserRole="buyer"
                onAgreement={scrollToContract}
                isGuest={needsIdentification}
                offers={offers}
                messages={messages}
                otherUserIsTyping={otherTyping}
                buyerId={user?.id || undefined}
                shipmentStatus={shipmentStatus}
                itemName={details.itemName}
                itemCondition={details.itemCondition}
                sellerNotes={details.sellerNotes}
                sellerName={sellerName}
                buyerName={user?.firstName || "קונה"}
                flexibleData={flexibleData}
            />

            {/* Contract / Waiting Section */}
            <div ref={contractRef}>
                {isPriceAgreed && !isSellerFinalized ? (
                    /* Waiting for seller to sign first */
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 text-center shadow-inner animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                            <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">ממתין לחתימת המוכר...</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                            המחיר סוכם! כעת המוכר צריך לאשר ולחתום על טיוטת ההסכם מצידו.<br />
                            <span className="text-xs opacity-70">העמוד יתעדכן אוטומטית ברגע שהמוכר יחתום ותוכל להתקדם.</span>
                        </p>
                    </div>
                ) : (
                    /* Seller has signed — buyer can sign now */
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <LegalContract
                            itemName={details.itemName}
                            value={details.value}
                            itemCondition={details.itemCondition}
                            sellerNotes={details.sellerNotes}
                            sellerName={sellerName}
                            buyerName={user?.firstName || "קונה"}
                            flexibleData={flexibleData}
                            isSigning={true}
                            role="buyer"
                            onSign={(sigData) => {
                                setBuyerSignatureData(sigData);
                                setIsOpen(true);
                            }}
                        />
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">
                            {step === 1 ? "פרטים למשלוח" : "סיום והזמנה"}
                        </DialogTitle>
                    </DialogHeader>

                    {step === 1 && (
                        <div className="grid gap-4 py-4">
                            {!user && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullName" className="text-right">שם מלא</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={guestDetails.fullName}
                                            onChange={handleInputChange}
                                            className="text-right"
                                            placeholder="ישראל ישראלי"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone" className="text-right">טלפון</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={guestDetails.phone}
                                            onChange={handleInputChange}
                                            className="text-right"
                                            placeholder="050-0000000"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="city" className="text-right">עיר</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={guestDetails.city}
                                    onChange={handleInputChange}
                                    className="text-right"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="street" className="text-right">רחוב ומספר</Label>
                                <Input
                                    id="street"
                                    name="street"
                                    value={guestDetails.street}
                                    onChange={handleInputChange}
                                    className="text-right"
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg reverse-row">
                                <Label htmlFor="delivery-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    אני צריך הובלה לפריט זה
                                </Label>
                                <Switch
                                    id="delivery-mode"
                                    checked={guestDetails.needsDelivery}
                                    onCheckedChange={(checked) => setGuestDetails(prev => ({ ...prev, needsDelivery: checked }))}
                                />
                            </div>

                            <Button onClick={() => setStep(2)} className="w-full mt-4">
                                המשך <ArrowLeft className="mr-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-4">
                            <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                                <h4 className="font-bold">סיכום הזמנה</h4>
                                <p>פריט: {details.itemName}</p>
                                <p>מחיר: ₪{details.value}</p>
                                {guestDetails.needsDelivery && <p className="text-sm mt-2 text-green-700">+ בקשה להצעת מחיר להובלה</p>}
                            </div>

                            <p className="text-sm text-gray-500">
                                בלחיצה על &quot;אישור וסיום&quot;, העסקה תיסגר ופרטי הקשר יועברו למוכר.
                            </p>

                            <Button
                                onClick={handleFinalize}
                                disabled={loading}
                                className="w-full h-12 text-lg"
                            >
                                {loading ? "מעבד..." : "אישור וסיום עסקה"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="w-full"
                            >
                                חזרה
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6 space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-green-700">העסקה הושלמה בהצלחה!</h3>
                            <p className="text-gray-600">
                                פרטי המוכר נשלחו אליך בוואטסאפ/סמס.<br />
                                {guestDetails.needsDelivery && "בקשת ההובלה שלך נקלטה ונשלחה למובילים באזור."}
                            </p>
                            <Button onClick={() => window.location.reload()} className="mt-4">
                                סגור ורענן
                            </Button>
                        </div>
                    )}

                </DialogContent>
            </Dialog>
        </div>
    );
}
