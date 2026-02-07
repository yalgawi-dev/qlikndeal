"use client";

import { Navbar } from "@/components/Navbar";
import { ShipmentForm } from "@/components/ShipmentForm";

export default function TrustLinkPage() {
    return (
        <main className="min-h-screen flex flex-col bg-muted/20">
            <Navbar />
            <div className="container px-4 py-12 flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">יצירת לינק בטוח</h1>
                    <p className="text-muted-foreground">בטח את העסקה שלך תוך שניות.</p>
                </div>
                <ShipmentForm mode="public-link" onCancel={() => window.history.back()} />
            </div>
        </main>
    );
}
