"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserPhone } from "@/app/actions";
import { Smartphone, CheckCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface PhoneOnboardingProps {
    isOpen: boolean;
    onComplete: (phone: string) => void;
}

export function PhoneOnboarding({ isOpen, onComplete }: PhoneOnboardingProps) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        if (phone.length < 9) {
            setError("מספר לא תקין");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await updateUserPhone(phone);
            if (res.success) {
                onComplete(phone);
                router.refresh();
            } else {
                setError("אירעה שגיאה בשמירה");
            }
        } catch (err) {
            setError("שגיאת תקשורת");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onComplete("")}>
            <DialogContent className="max-w-sm rounded-[2rem] border border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
                <DialogHeader className="text-center space-y-4 pt-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        השלמת פרטים
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        כדי שנוכל לעדכן אותך על סטטוס עסקאות ב-WhatsApp, אנחנו צריכים את המספר הנייד שלך.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                type="tel"
                                placeholder="050-0000000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="text-center text-lg h-12 rounded-xl border-primary/20 focus:border-primary/50 bg-muted/30 transition-all font-mono tracking-widest"
                                dir="ltr"
                            />
                            {phone.length > 8 && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        {error && <p className="text-red-500 text-xs text-center font-bold px-2">{error}</p>}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 mb-2">
                        <Lock className="w-3 h-3" />
                        <span>המידע שלך מוצפן ומאובטח</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || phone.length < 9}
                            className="w-full h-12 text-lg rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02]"
                        >
                            {loading ? "שומר..." : "שמור והמשך 🚀"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onComplete("")}
                            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                            דלג בינתיים
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
