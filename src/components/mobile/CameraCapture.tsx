"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import Image from "next/image";

export function CameraCapture() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="relative w-full max-w-[300px] aspect-video bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
                {imageSrc ? (
                    <Image src={imageSrc} alt="Preview" fill className="object-cover" />
                ) : (
                    <Camera className="w-12 h-12 text-muted-foreground/50" />
                )}

                {/* Hidden input hack for maximum compatibility */}
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCapture}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </div>

            <Button variant="outline" className="w-full max-w-[300px] relative pointer-events-none">
                <Camera className="w-4 h-4 mr-2" />
                צלם תמונה
            </Button>
            <p className="text-xs text-muted-foreground text-center">
                לחץ על האזור העליון כדי להפעיל את המצלמה
            </p>
        </div>
    );
}
