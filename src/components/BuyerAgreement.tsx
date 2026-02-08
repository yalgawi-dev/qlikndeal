"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Lock, Truck, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { NegotiationPanel } from "./NegotiationPanel";

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
    });

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
        // TODO: Call server action finalizeShipment
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        // Show success / redirect
        alert("העסקה הושלמה! (לוגיקה בבנייה)");
    };

    // Check if user is logged in but missing phone
    const isGuestUser = isLoaded && !user;
    const isMissingPhone = isLoaded && !!user && (!user.phoneNumbers || user.phoneNumbers.length === 0);
    const needsIdentification = isGuestUser || isMissingPhone;

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
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center animate-in fade-in">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                    <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-amber-900 mb-2">המחיר סוכם! ממתין למוכר</h3>
                <p className="text-amber-800 text-sm">
                    הגעתם להסכמה על המחיר.<br />
                    כעת המוכר צריך למלא את פרטי החבילה והמצב כדי שתוכל להתקדם לתשלום.
                </p>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        בדוק אם המוכר סיים
                    </Button>
                </div>
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
                אני מאשר ורוצה להמשיך <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">
                            {step === 1 ? "פרטים למשלוח" : "סיום והזמנה"}
                        </DialogTitle>
                    </DialogHeader>

                    {step === 1 && (
                        <div className="grid gap-4 py-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2 items-start">
                                <Truck className="w-4 h-4 mt-1 shrink-0" />
                                <div>
                                    הכנס את הכתובת אליה תרצה ש{sellerName} ישלח את המוצר.
                                    <span className="block font-bold mt-1 text-xs opacity-80">אין צורך להירשם לאפליקציה בשלב זה.</span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">שם מלא</label>
                                <input
                                    name="fullName"
                                    value={guestDetails.fullName}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="ישראל ישראלי"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">טלפון (לעדכוני משלוח)</label>
                                <input
                                    name="phone"
                                    value={guestDetails.phone}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="050-1234567"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">עיר</label>
                                    <input
                                        name="city"
                                        value={guestDetails.city}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="תל אביב"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">רחוב ומספר</label>
                                    <input
                                        name="street"
                                        value={guestDetails.street}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="דיזנגוף 10"
                                    />
                                </div>
                            </div>

                            <Button onClick={() => setStep(2)} className="w-full mt-4">
                                המשך לתשלום <ArrowLeft className="mr-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-4 py-4 text-center">
                            <div className="flex flex-col items-center justify-center py-6 gap-3">
                                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-lg">תשלום מאובטח</h3>
                                <p className="text-muted-foreground text-sm max-w-[80%]">
                                    הכסף מוחזק בנאמנות עד שתאשר שהמוצר הגיע ותואם את התיאור.
                                </p>
                            </div>

                            <Button
                                onClick={handleFinalize}
                                disabled={loading}
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                            >
                                {loading ? "מבצע הזמנה..." : "שלם והזמן שליח"}
                            </Button>
                            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                                חזור
                            </Button>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="grid gap-4 py-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="font-bold text-xl">ההזמנה התקבלה בהצלחה!</h3>
                            <p className="text-muted-foreground text-sm px-4">
                                פרטי המשלוח נשלחו ל-{sellerName}.<br />
                                שליח יצור איתך קשר בטלפון שהזנת ({guestDetails.phone}) לתיאום המסירה.
                            </p>

                            <Button onClick={() => setIsOpen(false)} className="mt-4">
                                סגור
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
