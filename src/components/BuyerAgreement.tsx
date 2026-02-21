"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Lock, Truck, Clock, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { NegotiationPanel } from "./NegotiationPanel";
import { finalizeShipment } from "@/app/actions";
import { createServiceRequest } from "@/app/actions/service-provider";

import { useUser } from "@clerk/nextjs";

interface BuyerAgreementProps {
    shipmentId: string;
    sellerName: string;
    details: any; // Added details prop
}

export function BuyerAgreement({ shipmentId, sellerName, details }: BuyerAgreementProps) {
    const { user, isLoaded } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1); // 1 = Details, 2 = Payment/Finalize
    const [loading, setLoading] = useState(false);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGuestDetails({ ...guestDetails, [e.target.name]: e.target.value });
    };

    const handleFinalize = async () => {
        setLoading(true);
        try {
            // 1. Finalize shipment (Payment/Order)
            const res = await finalizeShipment(shipmentId, {
                ...guestDetails,
                // Remove non-standard fields if finalizeShipment is strict, or assume it handles extras gracefully
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

    // Auto-Polling for Seller Approval (every 3 seconds)
    // MOVED TO TOP LEVEL - Run always, but logic inside might depend on state if needed. 
    // Actually, we only want this to run when waiting for seller.
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPriceAgreed && !isSellerFinalized) {
            interval = setInterval(() => {
                window.location.reload(); // Simple reload to check status
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isPriceAgreed, isSellerFinalized]);

    if (!isPriceAgreed) {
        return (
            <NegotiationPanel
                shipmentId={shipmentId}
                currentOffer={details.value}
                lastOfferBy={lastOfferBy}
                currentUserRole="buyer"
                isGuest={needsIdentification} // Pass combined flag
            />
        );
    }

    if (isPriceAgreed && !isSellerFinalized) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center animate-pulse">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                    <Clock className="w-8 h-8 animate-spin-slow" />
                </div>
                <h3 className="font-bold text-lg text-amber-900 mb-2">ממתין לאישור המוכר...</h3>
                <p className="text-amber-800 text-sm mb-4">
                    המחיר סוכם! כעת המוכר מזין את פרטי החבילה הסופיים.<br />
                    העמוד יתעדכן אוטומטית ברגע שהמוכר יסיים.
                </p>
            </div>
        );
    }

    // Original Flow (Ready to Pay)
    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="w-full text-lg h-12 font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
                {"אני מאשר ורוצה להמשיך"} <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>

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
        </>
    );
}
