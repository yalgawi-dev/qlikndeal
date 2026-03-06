import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Facebook, MessageCircle, Send, Twitter, Linkedin, Instagram, Video, Check } from "lucide-react"
import { toast } from "sonner"

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    url: string
    title: string
    text?: string
}

const PLATFORMS = [
    { id: 'whatsapp', name: 'וואטסאפ', icon: MessageCircle, color: '#25D366' },
    { id: 'facebook', name: 'פייסבוק', icon: Facebook, color: '#1877F2' },
    { id: 'telegram', name: 'טלגרם', icon: Send, color: '#0088cc' },
    { id: 'twitter', name: 'טוויטר', icon: Twitter, color: '#1DA1F2' },
    { id: 'linkedin', name: 'לינקדאין', icon: Linkedin, color: '#0A66C2' },
    { id: 'instagram', name: 'אינסטגרם*', icon: Instagram, color: '#E1306C' },
    { id: 'tiktok', name: 'טיקטוק*', icon: Video, color: '#a0a0a0' },
];

export function ShareModal({ isOpen, onClose, url: initialUrl, title, text }: ShareModalProps) {
    // 1. Fixing the Localhost Blue Link issue!
    // Replacing localhost with standard website format temporarily so WhatsApp displays it correctly in your dev environment.
    const url = initialUrl.replace('http://localhost:3000', 'https://qlikndeal.vercel.app');
    
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const formattedTitle = title.replace('Qlikndeal - ', '');
    const plainMessageText = `הזדמנות באתר Qlikndeal!\n\n${formattedTitle}\n${text || 'המקום הבטוח לקנות ולמכור.'}\n\nלצפייה בתמונות ופרטים נוספים:\n${url}`;

    const handleCopy = async (showToast = true) => {
        try {
            await navigator.clipboard.writeText(plainMessageText);
            if (showToast) toast.success("הקישור והטקסט הועתקו בהצלחה!");
        } catch (err) {
            if (showToast) toast.error("שגיאה בהעתקת הקישור");
        }
    };

    const handleShareSelected = async () => {
        if (selectedPlatforms.length === 0) {
            toast.error("אנא בחר לפחות אפליקציה אחת לפרסום מתוך הרשימה");
            return;
        }

        const messageTemplate = `🔥 *הזדמנות באתר Qlikndeal!* 🔥\n\n✨ *${formattedTitle}*\n${text || 'המקום הבטוח לקנות ולמכור.'}\n\n👇 *לצפייה בתמונות, פרטים נוספים ורכישה בטוחה, לחצו על הלינק:*\n${url}`;

        let copiedForSocial = false;

        selectedPlatforms.forEach(platform => {
            if (platform === 'whatsapp') {
                window.open(`https://wa.me/?text=${encodeURIComponent(messageTemplate)}`, '_blank');
            } else if (platform === 'telegram') {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('🔥 ' + formattedTitle)}`, '_blank');
            } else if (platform === 'facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            } else if (platform === 'twitter') {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(plainMessageText)}`, '_blank');
            } else if (platform === 'linkedin') {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
            } else if (platform === 'instagram' || platform === 'tiktok') {
                copiedForSocial = true;
            }
        });

        if (copiedForSocial) {
            navigator.clipboard.writeText(plainMessageText).then(() => {
                toast.success(
                    <div dir="rtl" className="flex flex-col gap-1">
                        <span className="font-bold text-lg">📌 הטקסט והלינק הועתקו!</span>
                        <span>אינסטגרם וטיקטוק לא מאפשרות לשתף אוטומטית.</span>
                        <span>פתח את האפליקציה בטלפון ועשה "הדבק".</span>
                    </div>, 
                    { duration: 6000 }
                );
            });
        } else {
            toast.success("נפתחו " + selectedPlatforms.length + " לשוניות לפרסום!");
        }

        setSelectedPlatforms([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#161b22] border-white/10 text-white" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        היכן תרצה לפרסם את המודעה?
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        בחר את הערוצים בהם תרצה לפרסם ולחץ על "שלח פרסום לכולם".<br/>* אינסטגרם וטיקטוק יבצעו העתקה ללוח בלבד.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col gap-4 py-2">
                    <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1 custom-scrollbar">
                        {PLATFORMS.map((platform) => {
                            const isSelected = selectedPlatforms.includes(platform.id);
                            return (
                                <div 
                                    key={platform.id}
                                    onClick={() => togglePlatform(platform.id)}
                                    className={`relative flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div style={{ color: platform.color }}>
                                            <platform.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-200">{platform.name}</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-500'}`}>
                                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    
                    <Button 
                        onClick={handleShareSelected}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg h-12 text-lg rounded-xl mt-2 font-bold"
                    >
                        פרסם ב- {selectedPlatforms.length} ערוצים
                    </Button>
                    
                    <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#161b22] px-2 text-gray-500">או עשה זאת ידנית</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse relative">
                        <div className="grid flex-1 gap-2">
                            <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 truncate" dir="ltr">
                                {url}
                            </div>
                        </div>
                        <Button type="button" size="sm" variant="secondary" className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white" onClick={() => handleCopy(true)}>
                            <Copy className="h-4 w-4 ml-2" />
                            העתק
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
