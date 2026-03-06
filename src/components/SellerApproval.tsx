"use client";


import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit2, Shield, Truck, Video, X, CheckCircle, Smartphone, Box, Sparkles, Star, AlertTriangle } from "lucide-react";
import { updateShipmentBySeller, finalizeShipment } from "@/app/actions";
import { useRouter } from "next/navigation";
import { NegotiationPanel } from "./NegotiationPanel";

interface SellerApprovalProps {
    shipmentId: string;
    details: any;
    buyerName?: string;
}

export function SellerApproval({ shipmentId, details, buyerName = "הקונה" }: SellerApprovalProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-Poll for updates (e.g., if buyer pays or updates something)
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [router]);
    const [step, setStep] = useState(1);

    // Parse Flexible Data
    let flexibleData: any = {};
    try { flexibleData = JSON.parse(details.flexibleData || '{}'); } catch (e) { }

    const negotiationStatus = flexibleData.negotiationStatus || 'active';
    const lastOfferBy = flexibleData.lastOfferBy || 'buyer';
    const isPriceAgreed = negotiationStatus === 'agreed';
    const offers = flexibleData.offers || [];

    // Seller needs to sign the contract
    const [formData, setFormData] = useState({
        agreement: false
    });

    const handleApprove = async () => {
        setLoading(true);
        try {
            const res = await updateShipmentBySeller(shipmentId, {
                status: "SELLER_APPROVED" // Updated status
            });

            if (res.success) {
                setStep(2); // Success view
            } else {
                alert("שגיאה באישור: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("שגיאה בלתי צפויה");
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">המשלוח אושר בהצלחה!</h2>
                <p className="text-muted-foreground flex items-center justify-center gap-2 mb-8 text-sm px-4">
                    <Shield className="w-4 h-4 text-primary" />
                    חתמת על ההסכם! כעת הקונה ({buyerName}) יקבל הודעה לחתום מצידו ולהעביר לחשבון נאמנות.
                </p>
                <div className="flex justify-center flex-col items-center gap-3">
                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full mb-2"></div>
                    <Link
                        href="/dashboard/marketplace/my-listings"
                        className="inline-flex items-center justify-center rounded-xl font-bold transition-colors h-12 px-8 shadow-sm border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                    >
                        חזור לניהול מודעות
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 p-5 rounded-3xl mb-6 shadow-inner">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-base md:text-lg mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    זירת משא ומתן עם {buyerName}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {isPriceAgreed
                        ? "הסכמתם על המחיר! כעת נותר רק לאשר את ההסכם הרשמי כדי להתקדם לשלב העסקה המאובטחת."
                        : "הקונה שלח בקשה. תוכל לאשר את המחיר או לנהל משא ומתן בצ'אט מטה."}
                </p>
                {flexibleData.requestVideoCall && (
                    <div className="mt-4 bg-background p-3 rounded-2xl border border-primary/20 flex items-center gap-2 shadow-sm">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        <span className="text-sm font-bold text-foreground">הקונה ביקש שיחת וידאו לאימות</span>
                    </div>
                )}
                {flexibleData.shippingPayer && (
                    <div className="mt-3 bg-background p-3 rounded-2xl border border-primary/20 flex items-center gap-2 text-sm font-bold text-foreground shadow-sm">
                        <Truck className="w-4 h-4 text-primary" />
                        תשלום משלוח: {flexibleData.shippingPayer === 'buyer' ? 'על הקונה' : 'על המוכר'}
                    </div>
                )}
            </div>

            {/* Negotiation Panel */}
            {!isPriceAgreed && (
                <NegotiationPanel
                    shipmentId={shipmentId}
                    currentOffer={details.value}
                    lastOfferBy={lastOfferBy}
                    currentUserRole="seller"
                    offers={offers}
                />
            )}

            {/* Main Form - Only visible if price agreed */}
            {isPriceAgreed && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    
                    {/* Contract Box */}
                    <div className="border border-border rounded-3xl overflow-hidden bg-card shadow-sm">
                        <div className="bg-muted p-4 border-b border-border flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-foreground" />
                            <h4 className="font-bold text-foreground">הסכם סחר מוגן מקדמי</h4>
                        </div>
                        <div className="p-6">
                            <div className="bg-background/50 rounded-2xl border border-dashed p-6 text-center mb-6">
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                    מסמך ההסכם המלא ייכתב בשלב הבא של הפיתוח. בעתיד שני הצדדים יוכלו לראות פה חוזה מפורט המגן על כללי העסקה.
                                </p>
                            </div>
                            
                            {/* Agreement Checkbox */}
                            <label className="flex items-start gap-4 cursor-pointer p-5 bg-background border border-border/60 hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all shadow-sm group">
                                <input
                                    type="checkbox"
                                    checked={formData.agreement}
                                    onChange={e => setFormData({ ...formData, agreement: e.target.checked })}
                                    className="mt-1 rounded-md border-primary text-primary focus:ring-primary h-6 w-6 shrink-0 transition-transform group-active:scale-95 cursor-pointer"
                                />
                                <span className="text-sm font-medium leading-relaxed text-foreground cursor-pointer">
                                    אני מאשר שהמחיר לעסקה הוא <strong className="text-primary text-base">₪{details.value}</strong> ושאני מסכים לטיוטת ההסכם.
                                </span>
                            </label>
                        </div>
                    </div>

                    <Button
                        onClick={handleApprove}
                        disabled={!formData.agreement || loading}
                        className="w-full font-bold h-14 text-base shadow-lg shadow-primary/20 rounded-2xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground transform transition-all active:scale-[0.98]"
                    >
                        {loading ? "מעבד חתימה..." : "חתום על ההסכם והתקדם לעסקה 🤝"}
                    </Button>
                </div>
            )}
        </div>
    );
}
