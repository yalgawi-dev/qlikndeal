"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserDetails } from "@/app/actions"; // We will create this
import { User, MapPin, Phone, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileEditorProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

export function ProfileEditor({ isOpen, onClose, initialData }: ProfileEditorProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        city: "",
        street: "",
        houseNumber: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || "",
                lastName: initialData.lastName || "",
                phone: initialData.phone || "",
                city: initialData.city || "",
                street: initialData.street || "",
                houseNumber: initialData.houseNumber || ""
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await updateUserDetails(formData);
            if (res.success) {
                setSuccess(true);
                router.refresh();
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 1500);
            } else {
                alert("שגיאה בשמירת הנתונים: " + res.error);
            }
        } catch (error) {
            console.error(error);
            alert("שגיאה בתקשורת");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md rounded-3xl bg-card border border-border sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        עריכת פרטים אישיים
                    </DialogTitle>
                    <DialogDescription className="text-center text-xs">
                        עדכן את הפרטים שלך כדי לחסוך זמן ביצירת משלוחים.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-12 flex flex-col items-center justify-center text-green-500 animate-in zoom-in">
                        <CheckCircle className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-bold">הפרטים עודכנו!</h3>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground">שם פרטי</label>
                                <Input value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground">שם משפחה</label>
                                <Input value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} className="h-9" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground">טלפון נייד</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="h-9 pr-9" dir="ltr" className="text-right pr-9" />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-dashed">
                            <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />כתובת (לאיסוף/מסירה)
                            </label>
                            <div className="grid grid-cols-[1fr_1fr_0.5fr] gap-2">
                                <Input placeholder="עיר" value={formData.city} onChange={e => handleChange('city', e.target.value)} className="h-9 text-xs" />
                                <Input placeholder="רחוב" value={formData.street} onChange={e => handleChange('street', e.target.value)} className="h-9 text-xs" />
                                <Input placeholder="מס'" value={formData.houseNumber} onChange={e => handleChange('houseNumber', e.target.value)} className="h-9 text-xs" />
                            </div>
                        </div>

                        <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4 font-bold">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "שמור שינויים"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
