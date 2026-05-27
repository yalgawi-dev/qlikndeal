"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { createShipmentFromRequest } from "@/app/actions/marketplace";

interface WishActionButtonProps {
    requestId: string;
    isAuthenticated: boolean;
}

export default function WishActionButton({ requestId, isAuthenticated }: WishActionButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleOffer = async () => {
        if (!isAuthenticated) {
            // Redirect to login with callback URL
            const redirectUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `/sign-in?redirectUrl=${redirectUrl}`;
            return;
        }

        setError(null);
        startTransition(async () => {
            try {
                const res = await createShipmentFromRequest(requestId);
                if (res.success && res.shortId) {
                    router.push(`/link/${res.shortId}`);
                } else {
                    setError(res.error || "שגיאה ביצירת זירת המסחר");
                }
            } catch (err) {
                console.error("Error creating shipment from request:", err);
                setError("אירעה שגיאה בלתי צפויה. נסה שנית.");
            }
        });
    };

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <button
                onClick={handleOffer}
                disabled={isPending}
                className="w-full relative h-16 bg-black border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-950 text-xl font-black rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_#22d3ee] transition-all active:scale-95 overflow-hidden flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)] -translate-x-[150%] group-hover:translate-x-[150%] duration-1000 ease-in-out" />
                {isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                ) : (
                    <MessageSquare className="w-6 h-6 drop-shadow-[0_0_8px_#22d3ee]" />
                )}
                <span>יש לי כזה - הצע מוצר 🤝</span>
            </button>
            {error && (
                <p className="text-red-400 text-sm font-bold text-center mt-1 animate-pulse">
                    {error}
                </p>
            )}
        </div>
    );
}
