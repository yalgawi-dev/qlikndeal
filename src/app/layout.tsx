import type { Metadata } from "next";
// Assuming Inter is standard, but using generic sans if not installed or using Google Fonts via next/font
// Using native font stack for now to avoid download issues if offline/slow
import "./globals.css";

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
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="he" dir="rtl" className="dark">
                <head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet" />
                </head>
                <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary selection:text-white">
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
