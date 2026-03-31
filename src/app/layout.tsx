import type { Metadata } from "next";
import "./globals.css";
import { Outfit } from "next/font/google";

// ⚡ Self-hosted font via next/font — eliminates external network request per page
const outfit = Outfit({
    subsets: ["latin"],
    weight: ["300", "400", "600", "800"],
    display: "swap",
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "Qlikndeal - המהפכה בעסקאות יד-שנייה",
    description: "הצטרפו לכוח הקנייה החברתי למשלוחים! הפתרון המהפכני לקנייה ומכירה בטוחה ברשת. בדיקת איכות, תשלום מאובטח ומשלוחים במחירים מוזלים.",
    openGraph: {
        title: "Qlikndeal - הצלע החסרה לעסקה מושלמת",
        description: "המהפכה כבר כאן! משלוחים חברתיים מוזלים, בדיקת איכות ותשלום בטוח. הצטרפו עכשיו.",
        type: "website",
        locale: "he_IL",
        siteName: "Qlikndeal",
    }
};

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="he" dir="rtl" className={`dark ${outfit.variable}`}>
                <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary selection:text-white">
                    {children}
                    <Toaster richColors position="bottom-right" />
                </body>
            </html>
        </ClerkProvider>
    );
}

