"use client";

import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserDetails } from "@/app/actions";
import { ShieldAlert, UserCheck, Phone, CreditCard, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfileForcerProps {
    dbUser: {
        id: string;
        clerkId?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
        idNo?: string | null;
    } | null;
}

export function UserProfileForcer({ dbUser }: UserProfileForcerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    // State for the form
    const [formData, setFormData] = useState({
        firstName: dbUser?.firstName || "",
        lastName: dbUser?.lastName || "",
        phone: dbUser?.phone || "",
        idNo: dbUser?.idNo || "",
    });

    // If user is not logged in at all (Clerk user not logged in or is guest), we don't force clerk profile updates.
    // (Guest details are handled separately at checkout/signing).
    if (!dbUser || !dbUser.clerkId) return null;

    // Check if any critical secure trade details are missing
    const isMissingDetails = !dbUser.firstName || !dbUser.lastName || !dbUser.phone || !dbUser.idNo;

    if (!isMissingDetails) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            alert("אנא מלא שם פרטי ושם משפחה");
            return;
        }
        if (!formData.phone.trim() || formData.phone.length < 9) {
            alert("אנא מלא מספר טלפון תקין");
            return;
        }
        if (!formData.idNo.trim() || formData.idNo.length < 8) {
            alert("אנא מלא תעודת זהות תקינה (לפחות 8 או 9 ספרות)");
            return;
        }

        setLoading(true);
        try {
            const res = await updateUserDetails(formData);
            if (res.success) {
                router.refresh();
            } else {
                alert("שגיאה בעדכון הפרטים. אנא נסה שנית.");
            }
        } catch (error) {
            console.error(error);
            alert("שגיאה בתקשורת עם השרת");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
                className="max-w-[450px] w-[95vw] p-0 overflow-hidden bg-background rounded-3xl border border-red-500/20 text-right shadow-2xl" 
                dir="rtl"
            >
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-6 text-white text-center border-b border-red-500/20 relative">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-2">
                        <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-center font-extrabold text-lg sm:text-xl text-white flex items-center justify-center gap-2">
                            השלמת פרטי זיהוי לעסקה
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-red-400/90 mt-1">
                        כדי למנוע זיוף נתונים ולהבטיח מסחר בטוח, חובה להשלים פרטי קשר וזיהוי רשמיים בפרופיל שלך.
                    </p>
                    <p className="text-[10px] text-red-300/60 mt-0.5">
                        ניתן לסגור חלון זה, אך לא תוכל לחתום על החוזה ללא השלמת הפרטים.
                    </p>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-xs font-bold text-foreground">שם פרטי</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="ישראל"
                                className="bg-background border-border/80 h-10"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-xs font-bold text-foreground">שם משפחה</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="ישראלי"
                                className="bg-background border-border/80 h-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-bold text-foreground flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            מספר טלפון נייד
                        </Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="05X-XXXXXXX"
                            className="bg-background border-border/80 h-10 text-left"
                            type="tel"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="idNo" className="text-xs font-bold text-foreground flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-primary" />
                            מספר תעודת זהות (למניעת זיוף)
                        </Label>
                        <Input
                            id="idNo"
                            value={formData.idNo}
                            onChange={e => setFormData({ ...formData, idNo: e.target.value })}
                            placeholder="9 ספרות"
                            maxLength={9}
                            className="bg-background border-border/80 h-10"
                            required
                        />
                        <p className="text-[10px] text-muted-foreground">פרט זה נשמר בבטחה במערכת ויוצג אך ורק כחלק מחתימת החוזה הרשמי לעסקה זו.</p>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 h-11 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/10 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span>מעדכן פרופיל...</span>
                        ) : (
                            <>
                                <UserCheck className="w-4 h-4" />
                                <span>עדכן כרטיס אישי והמשך לעסקה</span>
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
