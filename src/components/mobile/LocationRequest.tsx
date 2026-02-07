"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

export function LocationRequest() {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("הדפדפן שלך לא תומך באיתור מיקום");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                setError("לא הצלחנו לקבל את המיקום. וודא שאישרת גישה.");
                setLoading(false);
                console.error(err);
            }
        );
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">המיקום שלי</span>
            </div>

            {coords ? (
                <div className="text-sm text-center ltr font-mono bg-muted/50 p-2 rounded">
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center">
                    לחץ כדי לשתף את המיקום המדויק שלך למשלוח
                </p>
            )}

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            <Button onClick={getLocation} disabled={loading} variant="outline" className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {coords ? "עדכן מיקום" : "שתף מיקום נוכחי"}
            </Button>
        </div>
    );
}
