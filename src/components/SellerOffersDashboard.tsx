"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Clock, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface SellerOffersDashboardProps {
    negotiations: any; // The map of negotiations
    baseLink: string; // The base URL for navigation
}

export function SellerOffersDashboard({ negotiations, baseLink }: SellerOffersDashboardProps) {
    const router = useRouter();

    // Auto-refresh every 5 seconds to check for new offers
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000);
        return () => clearInterval(interval);
    }, [router]);

    const buyers = Object.keys(negotiations).map(buyerId => ({
        id: buyerId,
        ...negotiations[buyerId]
    })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (buyers.length === 0) {
        return (
            <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-muted-foreground">עדיין אין הצעות</h3>
                <p className="text-sm text-muted-foreground/80">שתף את הלינק כדי לקבל הצעות מקונים.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {buyers.length}
                </span>
                הצעות פעילות
            </h3>

            <div className="grid gap-3">
                {buyers.map((offer) => {
                    const lastOffer = offer.offers[offer.offers.length - 1];
                    const isAgreed = offer.status === 'agreed';

                    return (
                        <Card
                            key={offer.id}
                            onClick={() => router.push(`${baseLink}?buyerId=${offer.id}`)}
                            className="p-4 cursor-pointer hover:bg-accent/50 transition-all border-l-4 border-l-primary flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold flex items-center gap-2">
                                        {offer.buyerName || "קונה אנונימי"}
                                        {isAgreed && <CheckCircle className="w-4 h-4 text-green-500" />}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(offer.updatedAt), { addSuffix: true, locale: he })}
                                    </div>
                                </div>
                            </div>

                            <div className="text-left">
                                <div className="text-lg font-bold text-primary">
                                    ₪{lastOffer?.amount || 0}
                                </div>
                                <div className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-end gap-1">
                                    לפרטים <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
