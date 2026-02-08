"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Box, Truck, Shield, Sparkles, Star, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
import { updateShipmentBySeller } from "@/app/actions";
import Link from "next/link";
import { NegotiationPanel } from "./NegotiationPanel";

interface SellerApprovalProps {
    shipmentId: string;
    details: any;
    buyerName: string;
}

export function SellerApproval({ shipmentId, details, buyerName }: SellerApprovalProps) {
    // const router = useRouter(); // Removed useRouter
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Parse Flexible Data
    let flexibleData: any = {};
    try { flexibleData = JSON.parse(details.flexibleData || '{}'); } catch (e) { }

    const negotiationStatus = flexibleData.negotiationStatus || 'active';
    const lastOfferBy = flexibleData.lastOfferBy || 'buyer';
    const isPriceAgreed = negotiationStatus === 'agreed';

    // Seller needs to fill these
    const [formData, setFormData] = useState({
        packageSize: "medium" as "small" | "medium" | "large" | "huge",
        condition: "used" as "new" | "like-new" | "used" | "damaged",
        sellerNotes: "",
        agreement: false
    });

    const handleApprove = async () => {
        setLoading(true);
        try {
            const res = await updateShipmentBySeller(shipmentId, {
                packageSize: formData.packageSize,
                itemCondition: formData.condition,
                sellerNotes: formData.sellerNotes,
                status: "SELLER_APPROVED" // New status or existing "SHARED" with flag? Let's assume we update details.
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
                <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                    הפרטים עודכנו. כעת הקונה ({buyerName}) יקבל הודעה להשלמת התשלום.
                </p>
                <div className="flex justify-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                        חזור לדשבורד
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm mb-1">
                    <Smartphone className="w-4 h-4" />
                    בקשה מקונה: {buyerName}
                </h3>
                <p className="text-blue-800 text-xs text-balance">
                    {isPriceAgreed
                        ? "המחיר סוכם! כעת עליך להשלים את פרטי החבילה והמצב כדי לסגור את העסקה."
                        : "הקונה שלח בקשה. ניתן לאשר את המחיר או לנהל משא ומתן."}
                </p>
                {flexibleData.requestVideoCall && (
                    <div className="mt-3 bg-white/50 p-2 rounded-lg border border-blue-200 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-blue-900">הקונה ביקש שיחת וידאו</span>
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
                />
            )}

            {/* Main Form - Only visible if price agreed */}
            {isPriceAgreed && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    {/* 1. Package Size */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                            גודל חבילה (עבור השליח)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: "small", label: "קטנה", icon: <Box className="h-4 w-4" />, desc: "מעטפה" },
                                { id: "medium", label: "בינונית", icon: <Box className="h-5 w-5" />, desc: "קופסה" },
                                { id: "large", label: "גדולה", icon: <Box className="h-6 w-6" />, desc: "מזוודה" },
                                { id: "huge", label: "ענקית", icon: <Truck className="h-6 w-6" />, desc: "ריהוט" }
                            ].map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => setFormData({ ...formData, packageSize: size.id as any })}
                                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all ${formData.packageSize === size.id ? "bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/20" : "bg-card border-border hover:bg-accent"}`}
                                >
                                    <div className="mb-1 opacity-80">{size.icon}</div>
                                    <span className="text-xs font-bold">{size.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Condition Declaration */}
                    <div className="space-y-2 pt-4 border-t border-dashed">
                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                            הצהרת מצב (מהקונה)
                        </label>
                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50 space-y-3">
                            <div className="flex gap-2">
                                {[
                                    { id: 'new', label: 'חדש', icon: <Sparkles className="w-4 h-4 text-green-500" /> },
                                    { id: 'like-new', label: 'כמו חדש', icon: <Star className="w-4 h-4 text-blue-500" /> },
                                    { id: 'used', label: 'משומש', icon: <Box className="w-4 h-4 text-orange-500" /> },
                                    { id: 'damaged', label: 'פגום', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> }
                                ].map((cond) => (
                                    <button
                                        key={cond.id}
                                        onClick={() => setFormData({ ...formData, condition: cond.id as any })}
                                        className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-lg text-[10px] font-bold border transition-all ${formData.condition === cond.id ? 'bg-background border-primary shadow-sm ring-1 ring-primary/30' : 'bg-background/50 border-border hover:bg-background'}`}
                                    >
                                        <div>{cond.icon}</div>
                                        <span>{cond.label}</span>
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={formData.sellerNotes}
                                onChange={e => setFormData({ ...formData, sellerNotes: e.target.value })}
                                className="w-full text-xs p-2.5 bg-background border border-input rounded-lg h-20 resize-none focus:ring-1 focus:ring-primary"
                                placeholder="תאר פגמים, שריטות או הערות חשובות..."
                            />
                        </div>
                    </div>

                    {/* 3. Agreement */}
                    <div className="pt-4">
                        <label className="flex items-start gap-3 cursor-pointer p-3 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50 select-none">
                            <input
                                type="checkbox"
                                checked={formData.agreement}
                                onChange={e => setFormData({ ...formData, agreement: e.target.checked })}
                                className="mt-0.5 rounded border-primary text-primary focus:ring-primary h-5 w-5 shrink-0"
                            />
                            <span className="text-xs font-medium leading-relaxed text-muted-foreground">
                                אני מאשר שפרטי המוצר (<b>{details.itemName}</b>) והמחיר (<b>₪{details.value}</b>) נכונים, ושיש ברשותי את המוצר במצב המוצהר.
                            </span>
                        </label>
                    </div>

                    <Button
                        onClick={handleApprove}
                        disabled={!formData.agreement || loading || !formData.sellerNotes}
                        className="w-full font-bold h-12 text-base shadow-lg shadow-primary/20 mt-4"
                    >
                        {loading ? "מעדכן..." : "אשר ושלח לקונה"}
                    </Button>
                </div>
            )}
        </div>
    );
}
