"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { updateUserActivity } from "@/app/actions";

export function UserActivityTracker() {
    const { isSignedIn } = useAuth();

    useEffect(() => {
        if (!isSignedIn) return;

        // Initial check-in
        updateUserActivity();

        // Check-in every 45 seconds while user is active
        const interval = setInterval(() => {
            updateUserActivity();
        }, 45000);

        return () => clearInterval(interval);
    }, [isSignedIn]);

    return null;
}
