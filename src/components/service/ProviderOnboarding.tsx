"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createOrUpdateServiceProvider } from "@/app/actions/service-provider";
import { ServiceType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Loader2, Truck, Box, Hammer, MapPin } from "lucide-react";

export function ProviderOnboarding() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        bio: "",
        isFixedPrice: false,
        basePrice: "",
        serviceTypes: [] as ServiceType[]
    });

    const toggleService = (type: ServiceType) => {
        setFormData(prev => {
            const exists = prev.serviceTypes.includes(type);
            return {
                ...prev,
                serviceTypes: exists
                    ? prev.serviceTypes.filter(t => t !== type)
                    : [...prev.serviceTypes, type]
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createOrUpdateServiceProvider({
                ...formData,
                basePrice: formData.basePrice ? parseFloat(formData.basePrice) : undefined
            });

            if (res.success) {
                router.push("/dashboard/provider"); // Redirect to provider dashboard
            } else {
                alert("Error: " + res.error);
            }
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-gray-900/50 border border-gray-800 rounded-3xl backdrop-blur-xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    הפוך לנותן שירות
                </h2>
                <p className="text-gray-400 mt-2">הצטרף לקהילת המובילים והמקצוענים שלנו</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-gray-300">שם העסק / תצוגה</Label>
                    <Input
                        value={formData.displayName}
                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="למשל: הובלות הצפון"
                        className="bg-gray-800 border-gray-700 h-12 text-lg"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">סוגי שירות (בחר לפחות אחד)</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <ServiceToggle
                            icon={<Truck className="w-5 h-5" />}
                            label="הובלות"
                            selected={formData.serviceTypes.includes("DELIVERY")}
                            onClick={() => toggleService("DELIVERY")}
                        />
                        <ServiceToggle
                            icon={<Box className="w-5 h-5" />}
                            label="אריזה"
                            selected={formData.serviceTypes.includes("PACKING")}
                            onClick={() => toggleService("PACKING")}
                        />
                        <ServiceToggle
                            icon={<Hammer className="w-5 h-5" />}
                            label="פירוק והרכבה"
                            selected={formData.serviceTypes.includes("MOVING")}
                            onClick={() => toggleService("MOVING")}
                        />
                        <ServiceToggle
                            icon={<MapPin className="w-5 h-5" />}
                            label="שליחויות"
                            selected={formData.serviceTypes.includes("OTHER")}
                            onClick={() => toggleService("OTHER")}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">קצת עליך</Label>
                    <Textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="ניסיון, ציוד זמין, אזורי שירות..."
                        className="bg-gray-800 border-gray-700 min-h-[100px]"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                    <div className="space-y-0.5">
                        <Label className="text-base">מחיר קבוע?</Label>
                        <p className="text-xs text-gray-400">האם יש לך מחיר בסיס לשירות</p>
                    </div>
                    <Switch
                        checked={formData.isFixedPrice}
                        onCheckedChange={checked => setFormData({ ...formData, isFixedPrice: checked })}
                    />
                </div>

                {formData.isFixedPrice && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label>מחיר בסיס (₪)</Label>
                        <Input
                            type="number"
                            value={formData.basePrice}
                            onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                            className="bg-gray-800 border-gray-700"
                        />
                    </div>
                )}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-900/20">
                {loading ? <Loader2 className="animate-spin" /> : "סיום והרשמה"}
            </Button>
        </form>
    );
}

function ServiceToggle({ icon, label, selected, onClick }: { icon: any, label: string, selected: boolean, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${selected
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                }`}
        >
            {icon}
            <span className="font-bold">{label}</span>
        </button>
    )
}
