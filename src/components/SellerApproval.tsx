"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit2, Shield, Truck, Video, X, CheckCircle, Smartphone, Box, Sparkles, Star, AlertTriangle } from "lucide-react";
import { updateShipmentBySeller, finalizeShipment } from "@/app/actions";
import { useRouter } from "next/navigation";
import { NegotiationPanel } from "./NegotiationPanel";
import { LegalContract } from "@/components/LegalContract";

interface SellerApprovalProps {
    shipmentId: string;
    details: any;
    buyerName?: string;
    buyerId?: string;
    shipmentStatus?: string;
}

export function SellerApproval({ shipmentId, details, buyerName = "הקונה", buyerId, shipmentStatus }: SellerApprovalProps) {
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
    const messages = flexibleData.messages || [];

    const handleApprove = async (signatureData: { realName: string; idNo: string; signatureBase64: string }) => {
        setLoading(true);
        try {
            const res = await updateShipmentBySeller(shipmentId, {
                status: "SELLER_APPROVED", // Updated status
                flexibleDataUpdates: {
                    sellerRealName: signatureData.realName,
                    sellerIdNo: signatureData.idNo,
                    sellerSignature: signatureData.signatureBase64,
                    sellerSignedAt: new Date().toISOString()
                }
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

            {/* Negotiation Panel - always visible (shows agreement banner when price agreed) */}
            {(() => {
                const otherTyping = !!(flexibleData.buyerIsTyping && 
                    flexibleData.buyerTypingTime && 
                    (new Date().getTime() - new Date(flexibleData.buyerTypingTime).getTime() < 8000));
                const contractSection = document.getElementById('seller-contract-section');
                return (
                    <NegotiationPanel
                        shipmentId={shipmentId}
                        currentOffer={details.value}
                        lastOfferBy={lastOfferBy}
                        currentUserRole="seller"
                        onAgreement={() => contractSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        offers={offers}
                        messages={messages}
                        buyerId={buyerId}
                        otherUserIsTyping={otherTyping}
                        shipmentStatus={shipmentStatus}
                        itemName={details.itemName}
                        itemCondition={details.itemCondition}
                        sellerNotes={details.sellerNotes}
                        buyerName={buyerName}
                        flexibleData={flexibleData}
                    />
                );
            })()}

            {/* Main Form - Only visible if price agreed */}
            {isPriceAgreed && (
                <div id="seller-contract-section" className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <LegalContract
                        itemName={details.itemName}
                        value={details.value}
                        itemCondition={details.itemCondition}
                        sellerNotes={details.sellerNotes}
                        sellerName="את/ה"
                        buyerName={buyerName}
                        flexibleData={flexibleData}
                        isSigning={true}
                        role="seller"
                        onSign={handleApprove}
                    />
                </div>
            )}
        </div>
    );
}
