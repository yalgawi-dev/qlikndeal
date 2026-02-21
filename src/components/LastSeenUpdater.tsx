"use client";

import { useEffect } from "react";
import { updateLastSeen } from "@/app/actions";

export function LastSeenUpdater({ shipmentId, role }: { shipmentId: string, role: 'buyer' | 'seller' }) {
    useEffect(() => {
        // Initial update
        updateLastSeen(shipmentId, role);

        // Update every 10 seconds
        const interval = setInterval(() => {
            updateLastSeen(shipmentId, role);
        }, 10000);

        return () => clearInterval(interval);
    }, [shipmentId, role]);

    return null;
}
