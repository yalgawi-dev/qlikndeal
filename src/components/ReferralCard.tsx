"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, Share2, Twitter, Check } from "lucide-react";

export function ReferralCard() {
    const [copied, setCopied] = useState(false);
    const [referralLink, setReferralLink] = useState("");

    useEffect(() => {
        setReferralLink(`${window.location.origin}?ref=ISRAEL_VIP`);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: string) => {
        const text = encodeURIComponent(`היי! אני רוצה להזמין אותך להצטרף למהפכה בעסקאות יד-שנייה: Qlikndeal.

🚀 פתרון מלא: גם משלוח, גם בדיקת איכות וגם תשלום מאובטח.
📦 משלוח חברתי: אנחנו כוח קנייה ענק שמוזיל את מחירי המשלוחים לכולם!
✅ גמיש: אפשר להשתמש רק למשלוחים או לכל החבילה.

הצטרף לאלפי המשתמשים בקהילה הגדולה ביותר ועזור לנו להגדיל את כוחנו!
כל משתמש חדש מגדיל את הכוח שלנו להוזיל את המחירים לכולנו. בוא להיות חלק מהמשפחה:`);
        const url = encodeURIComponent(referralLink);

        let shareUrl = "";
        switch (platform) {
            case "whatsapp":
                // Using api.whatsapp.com structure which handles both mobile and web better
                shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
        }

        if (shareUrl) window.open(shareUrl, "_blank");
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-primary/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg hover:shadow-primary/5 transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-10 -mt-10" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/20 rounded-full text-primary">
                        <Share2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">הגדל את הכוח של כולנו!</h3>
                        <p className="text-muted-foreground">עזרו לנו להגדיל את הקהילה. ככל שנהיה גדולים יותר, נשיג מחירי משלוח נמוכים יותר לכולם.</p>
                    </div>
                </div>

                <div className="bg-background/50 backdrop-blur-sm border border-border rounded-xl p-2 flex items-center gap-2 mb-6">
                    <code className="flex-1 px-3 py-2 text-sm font-mono text-muted-foreground truncate bg-muted/50 rounded-lg">
                        {referralLink}
                    </code>
                    <Button size="sm" variant="outline" onClick={handleCopy} className={copied ? "text-green-500" : ""}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">העתק</span>
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="h-12 border-green-500/20 hover:bg-green-500/10 hover:text-green-500 gap-2" onClick={() => handleShare("whatsapp")}>
                        {/* Whatsapp Icon handled by generic logic or custom svg if needed, using simple text/color for now or Lucide doesn't have Whatsapp, using Share2 generally or custom SVG */}
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        WhatsApp
                    </Button>
                    <Button variant="outline" className="h-12 border-blue-600/20 hover:bg-blue-600/10 hover:text-blue-600 gap-2" onClick={() => handleShare("facebook")}>
                        <Facebook className="w-5 h-5" />
                        Facebook
                    </Button>
                    <Button variant="outline" className="h-12 border-sky-500/20 hover:bg-sky-500/10 hover:text-sky-500 gap-2" onClick={() => handleShare("twitter")}>
                        <Twitter className="w-5 h-5" />
                        Twitter
                    </Button>
                </div>
            </div>
        </div>
    );
}
