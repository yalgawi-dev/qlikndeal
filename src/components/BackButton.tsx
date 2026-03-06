"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BackButtonProps {
    label?: string;
    className?: string;
}

export function BackButton({ label = "חזור", className }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            onClick={() => router.back()}
            className={`text-gray-400 hover:text-white flex gap-2 p-0 hover:bg-transparent ${className || ""}`}
        >
            <ArrowRight className="w-4 h-4" /> {label}
        </Button>
    );
}
