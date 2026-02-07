import { getShipmentByShortId } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyerAgreement } from "@/components/BuyerAgreement";

export default async function ShipmentLinkPage({ params }: { params: { shortId: string } }) {
    const { success, shipment, error } = await getShipmentByShortId(params.shortId);

    if (!success || !shipment || !shipment.details) {
        return notFound();
    }

    const details = shipment.details;
    const seller = shipment.seller;

    // Parse specific flexible data if needed
    let flexibleData = {};
    try {
        if (details.flexibleData) {
            flexibleData = JSON.parse(details.flexibleData as string);
        }
    } catch (e) { }

    return (
        <main className="min-h-screen bg-muted/20 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-2xl">
                {/* Header / Trust Badge */}
                <div className="flex items-center justify-center gap-2 mb-8 opacity-80">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <span className="font-bold text-lg">Qlikndeal Secure Transaction</span>
                </div>

                <div className="grid gap-6">
                    {/* Seller Profile Card */}
                    <Card className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-sm border-none shadow-sm">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                            {seller.imageUrl ? (
                                <Image src={seller.imageUrl} alt="Seller" fill className="object-cover" />
                            ) : (
                                <User className="w-6 h-6 m-auto mt-3 text-gray-500" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">המוכר</p>
                            <h2 className="font-bold text-lg">{seller.firstName} {seller.lastName}</h2>
                        </div>
                    </Card>

                    {/* The "Digital Handshake" Agreement Card */}
                    <Card className="overflow-hidden border-primary/20 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                        {/* Product Image Section (Mock for now if empty) */}
                        <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">תמונת מוצר</span>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{details.itemName}</h1>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {details.itemCondition}
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-primary">
                                    ₪{details.value}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                                <h3 className="font-bold text-amber-900 mb-2 text-sm">הצהרת המוכר (מצב המוצר):</h3>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    {details.sellerNotes || "אין הערות מיוחדות. המוצר תקין."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-center text-sm text-muted-foreground mb-4">
                                    בלחיצה על אישור, אני מסכים למצב המוצר כפי שתואר ע"י המוכר.
                                </p>

                                <BuyerAgreement
                                    shipmentId={shipment.id}
                                    sellerName={seller.firstName || "המוכר"}
                                />

                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    התשלום מאובטח ומוחזק בנאמנות עד לאישור המסירה.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}
