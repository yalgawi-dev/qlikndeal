"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Check } from "lucide-react";

export function NotificationRequest() {
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            alert("הדפדפן שלך לא תומך בהתראות");
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
            new Notification("כיף שהצטרפת!", {
                body: "מעכשיו תוכל לקבל עדכונים על משלוחים.",
                icon: "/icon-192x192.png" // We need to make sure this exists or use a placeholder
            });
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span className="font-medium">התראות</span>
            </div>

            <div className="text-sm text-center">
                {permission === "granted" ? (
                    <span className="text-green-500 flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" /> התראות פעילות
                    </span>
                ) : permission === "denied" ? (
                    <span className="text-destructive flex items-center justify-center gap-1">
                        <BellOff className="w-4 h-4" /> התראות חסומות
                    </span>
                ) : (
                    <span className="text-muted-foreground">קבל עדכונים בזמן אמת</span>
                )}
            </div>

            <Button
                onClick={requestPermission}
                disabled={permission === "granted" || permission === "denied"}
                variant={permission === "granted" ? "outline" : "default"}
                className="w-full"
            >
                {permission === "granted" ? "מאושר" : "אפשר התראות"}
            </Button>
        </div>
    );
}
