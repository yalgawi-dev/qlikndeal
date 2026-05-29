"use client";

import { Navbar } from "@/components/Navbar";
import { ShipmentForm } from "@/components/ShipmentForm";
import { ReferralCard } from "@/components/ReferralCard";
import { Button } from "@/components/ui/button";
import { Package, Plus, Search, Filter, Inbox, Send, CheckCircle, Clock, Trash2, User, Store, Sparkles, Radar, Eye, ArrowRight, ShoppingBag, Heart, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraCapture } from "@/components/mobile/CameraCapture";
import { LocationRequest } from "@/components/mobile/LocationRequest";
import { NotificationRequest } from "@/components/mobile/NotificationRequest";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { ProfileImageEditor } from "@/components/profile/ProfileImageEditor";
import { getUserShipments, cancelShipment } from "@/app/actions";
import { BadgeCheck } from "lucide-react"; // Import filled badge icon
import { PhoneOnboarding } from "@/components/PhoneOnboarding";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { getMyListings, getMyRequests, deleteListing, getListingsByIds } from "@/app/actions/marketplace";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { BuyerRequestCard } from "@/components/marketplace/BuyerRequestCard";

const DEMO_SHIPMENTS_SELLER = [
    {
        id: 'demo-seller-inbox',
        shortId: 'DEMO-S-IN',
        status: 'NEEDS_REVISION',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (מוכר): הצעה נכנסת מקונה (ממתין לתגובתך)', value: 2400, images: '[]', description: 'הצעה חדשה לפריט שלך, לחץ כדי לענות' }
    },
    {
        id: 'demo-seller-sent',
        shortId: 'DEMO-S-OUT',
        status: 'SHARED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (מוכר): לינק תשלום ששלחת לקונה', value: 1500, images: '[]', description: 'לינק ישיר שנוצר על ידך וממתין לתשלום הקונה' }
    },
    {
        id: 'demo-seller-active',
        shortId: 'DEMO-S-ACT',
        status: 'AGREED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (מוכר): עסקה מאושרת - בדרך לשילוח', value: 3100, images: '[]', description: 'העסקה אושרה על ידי שני הצדדים וממתינה לשילוח' }
    },
    {
        id: 'demo-seller-history',
        shortId: 'DEMO-S-HIS',
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (מוכר): פריט שנמכר ונמסר בהצלחה 🎉', value: 850, images: '[]', description: 'העסקה הושלמה והכסף הועבר לחשבונך' }
    },
    {
        id: 'demo-seller-recycle',
        shortId: 'DEMO-S-DEL',
        status: 'CANCELLED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (מוכר): עסקה שבוטלה', value: 0, images: '[]', description: 'עסקה שנמחקה או בוטלה על ידי אחד הצדדים' }
    }
];

const DEMO_SHIPMENTS_BUYER = [
    {
        id: 'demo-buyer-inbox',
        shortId: 'DEMO-B-IN',
        status: 'NEEDS_REVISION',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (קונה): הצעה נגדית ממוכר (ממתין לאישורך)', value: 1800, images: '[]', description: 'המוכר שלח הצעה נגדית למשא ומתן' }
    },
    {
        id: 'demo-buyer-sent',
        shortId: 'DEMO-B-OUT',
        status: 'SHARED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (קונה): לינק תשלום שקיבלת ממוכר וממתין לתשלום', value: 950, images: '[]', description: 'לינק תשלום מאובטח שנשלח אליך להשלמת העסקה' }
    },
    {
        id: 'demo-buyer-active',
        shortId: 'DEMO-B-ACT',
        status: 'AGREED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (קונה): פריט שרכשת - בדרך אליך', value: 4200, images: '[]', description: 'התשלום בוצע והמשלוח בדרך לכתובת שלך' }
    },
    {
        id: 'demo-buyer-history',
        shortId: 'DEMO-B-HIS',
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (קונה): פריט שהתקבל בהצלחה 📦', value: 1200, images: '[]', description: 'העסקה הושלמה וקיבלת את המוצר' }
    },
    {
        id: 'demo-buyer-recycle',
        shortId: 'DEMO-B-DEL',
        status: 'CANCELLED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה (קונה): בקשה שבוטלה', value: 0, images: '[]', description: 'בקשת רכישה שבוטלה' }
    }
];

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

function DashboardContent() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams(); // Added searchParams
    const [userMode, setUserMode] = useState<"seller" | "buyer">("seller");

    const handleUserModeChange = (mode: "seller" | "buyer") => {
        setUserMode(mode);
        if (typeof window !== "undefined") {
            localStorage.setItem("dashboard_user_mode", mode);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlMode = searchParams.get("mode");
            if (urlMode === "seller" || urlMode === "buyer") {
                setUserMode(urlMode);
                localStorage.setItem("dashboard_user_mode", urlMode);
            } else {
                const savedMode = localStorage.getItem("dashboard_user_mode");
                if (savedMode === "seller" || savedMode === "buyer") {
                    setUserMode(savedMode);
                }
            }
            
            const urlTab = searchParams.get("tab");
            if (urlTab === "favorites" || urlTab === "inbox" || urlTab === "sent" || urlTab === "active" || urlTab === "history" || urlTab === "recycle") {
                setActiveTab(urlTab as any);
            }
        }
    }, [searchParams]);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "active" | "history" | "recycle" | "favorites">("sent");
    const [shipments, setShipments] = useState<any[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [favListings, setFavListings] = useState<any[]>([]);
    const [hideSplitAlert, setHideSplitAlert] = useState(false);
    const [dbImage, setDbImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedShipment, setSelectedShipment] = useState<any>(null); // For Details Modal
    const [showPhoneOnboarding, setShowPhoneOnboarding] = useState(false);
    const [showProfileEditor, setShowProfileEditor] = useState(false); // New State
    const [showCreateSelection, setShowCreateSelection] = useState(false); // Selection Modal state
    const [userData, setUserData] = useState<any>(null); // Added userData state
    const [initialShipmentData, setInitialShipmentData] = useState<any>(null); // Added initialShipmentData

    // Check for "Magic Import" params
    useEffect(() => {
        const create = searchParams.get("create");
        if (create === "true") {
            const itemName = searchParams.get("itemName");
            const value = searchParams.get("value");
            const condition = searchParams.get("condition");
            const description = searchParams.get("description");
            const imagesStr = searchParams.get("images");

            if (itemName) {
                setInitialShipmentData({
                    itemName,
                    value,
                    condition: condition === 'New' ? 'new' : condition === 'Like New' ? 'like-new' : 'used',
                    description,
                    images: imagesStr ? JSON.parse(imagesStr) : []
                });
                setShowForm(true);
            }
        }
    }, [searchParams]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("האם אתה בטוח שברצונך להעביר לסל המחזור?")) {
            await cancelShipment(id);
        }
    };

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            setLoading(true);

            // Timeout to prevent infinite loading
            const timeoutId = setTimeout(() => {
                if (mounted) setLoading(false);
            }, 5000);

            try {
                let favs: string[] = [];
                try {
                    favs = JSON.parse(localStorage.getItem("qlik_favorites") || "[]");
                } catch (e) {}

                const [res, listingsRes, requestsRes, favsRes] = await Promise.all([
                    getUserShipments(userMode),
                    getMyListings(),
                    getMyRequests(),
                    favs.length > 0 ? getListingsByIds(favs) : Promise.resolve({ success: true, listings: [] })
                ]);

                if (mounted) {
                    if (res.success) {
                        const demoData = userMode === "seller" ? DEMO_SHIPMENTS_SELLER : DEMO_SHIPMENTS_BUYER;
                        setShipments([...(res.shipments || []), ...demoData]);
                        if (res.userImage) setDbImage(res.userImage);
                        if (!res.userPhone) setShowPhoneOnboarding(true);
                        setUserData({
                            imageUrl: res.userImage,
                            phone: res.userPhone,
                            ...res.userData // Spread full user data including address
                        });
                    }
                    if (listingsRes.success) {
                        setListings(listingsRes.listings || []);
                    }
                    if (requestsRes.success) {
                        setRequests(requestsRes.requests || []);
                    }
                    if (favsRes.success) {
                        setFavListings(favsRes.listings || []);
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                clearTimeout(timeoutId);
                if (mounted) setLoading(false);
            }
        }

        if (isLoaded) {
            loadData();
        }

        return () => { mounted = false; };
    }, [userMode, isLoaded]);

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div className="text-lg font-bold animate-pulse">טוען נתונים...</div>
            <p className="text-xs text-muted-foreground">אנא המתן, מתחבר לשרת...</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4 opacity-50 hover:opacity-100 transition-opacity">
                טעינה ארוכה מדי? רענן עמוד
            </Button>
        </div>
    );

    // Filter Logic
    // INBOX: Items requiring MY attention (e.g. NEEDS_REVISION, or if I am buyer and status is SHARED... complicated logic for MVP)
    // For now: Inbox = NEEDS_REVISION.
    const inboxItems = shipments.filter(s => s.status === "NEEDS_REVISION" && s.status !== "CANCELLED");

    // SENT: Items I created that are waiting for others (SHARED).
    const sentItems = shipments.filter(s => s.status === "SHARED" && s.status !== "CANCELLED");

    const activeItems = shipments.filter(s => (s.status === "AGREED" || s.status === "PAID" || s.status === "SHIPPED") && s.status !== "CANCELLED");
    const historyItems = shipments.filter(s => (s.status === "DELIVERED") && s.status !== "CANCELLED");
    const recycledItems = shipments.filter(s => s.status === "CANCELLED");

    // Notification Logic (Red Badge for Inbox ONLY)
    const inboxCount = inboxItems.length;

    const renderEmptyState = (tab: string) => {
        if (loading) return null;
        return (
            <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-border/50 bg-muted/20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">אין כאן כלום כרגע</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1 mb-6">
                    {tab === "inbox" && "אין לך בקשות חדשות לטיפול."}
                    {tab === "sent" && "טרם שלחת בקשות."}
                    {tab === "active" && "אין משלוחים פעילים כרגע."}
                    {tab === "history" && "היסטוריית העסקאות שלך תופיע כאן."}
                    {tab === "recycle" && "סל המחזור ריק."}
                </p>
                {(tab === "sent" || tab === "active") && (
                    <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                        <Plus className="h-4 w-4" /> צור עסקה חדשה
                    </Button>
                )}
            </div>
        );
    };

    return (
        <main className="min-h-screen flex flex-col bg-muted/20">
            <Navbar />

            {/* Phone Onboarding Modal */}
            <PhoneOnboarding isOpen={showPhoneOnboarding} onComplete={() => setShowPhoneOnboarding(false)} />

            {/* Profile Editor Modal */}
            <ProfileEditor
                isOpen={showProfileEditor}
                onClose={() => setShowProfileEditor(false)}
                initialData={{
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    phone: userData?.phone,
                    city: userData?.city,
                    street: userData?.street,
                    houseNumber: userData?.houseNumber,
                    email: user?.primaryEmailAddress?.emailAddress
                }}
            />

            {/* ── Create Selection Modal ── */}
            <Dialog open={showCreateSelection} onOpenChange={setShowCreateSelection}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl p-0 overflow-hidden" dir="rtl">
                    <div className="p-6 text-center border-b border-gray-800">
                        <DialogTitle className="text-2xl font-bold">איך תרצה לפרסם?</DialogTitle>
                        <p className="text-gray-400 mt-2">בחר את הדרך הנוחה לך ביותר</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 p-6">
                        <Link href="/dashboard/marketplace/create-ai?listingType=SELL"
                            onClick={() => setShowCreateSelection(false)}
                            className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500 transition-all">
                            <div className="absolute top-3 right-3 bg-indigo-500 text-xs px-2 py-1 rounded-full font-bold animate-pulse">מומלץ ✨</div>
                            <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">יצירה חכמה עם AI</h3>
                            <p className="text-sm text-gray-400 text-center">ספר לנו במילים פשוטות — ה-AI יבנה מודעה מושלמת.</p>
                        </Link>
                        <Link href="/dashboard/marketplace/create?listingType=SELL"
                            onClick={() => setShowCreateSelection(false)}
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600 transition-all">
                            <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">יצירה ידנית</h3>
                            <p className="text-sm text-gray-400 text-center">מילוי ידני מלא לכל הקטגוריות.</p>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal for New Shipment */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-md w-full p-0 bg-transparent border-none shadow-none flex flex-col h-[600px] max-h-[80vh] scrollbar-hide">
                    <ShipmentForm
                        mode="dashboard"
                        userMode={userMode}
                        onCancel={() => setShowForm(false)}
                        dbUser={userData}
                        initialData={initialShipmentData}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal for Details (Read Only) */}
            <Dialog open={!!selectedShipment} onOpenChange={(open) => !open && setSelectedShipment(null)}>
                <DialogContent className="max-w-md bg-card border border-border">
                    <DialogHeader>
                        <DialogTitle className="text-center">פרטי משלוח</DialogTitle>
                    </DialogHeader>
                    {selectedShipment && (
                        <div className="space-y-4 p-2">
                            <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                <span className="text-muted-foreground">פריט</span>
                                <span className="font-bold">{selectedShipment.details?.itemName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                <span className="text-muted-foreground">שווי</span>
                                <span className="font-bold text-primary">₪{selectedShipment.details?.value}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                <span className="text-muted-foreground">מצב</span>
                                <span className="font-bold">{selectedShipment.details?.condition}</span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-xl text-xs">
                                <div className="font-bold mb-1">תיאור/פגמים:</div>
                                {selectedShipment.details?.description || "אין הערות"}
                            </div>
                            <Button onClick={() => setSelectedShipment(null)} className="w-full">סגור</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="container px-4 py-8 md:py-10 flex-1 max-w-5xl mx-auto">
                {/* Account Split Alert Banner */}
                {!hideSplitAlert && user?.primaryEmailAddress?.emailAddress === "yalgawi@gmail.com" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-5 mb-6 flex items-start gap-4 text-right shadow-[0_0_15px_rgba(234,179,8,0.05)] animate-in fade-in slide-in-from-top-2 duration-300 relative" dir="rtl">
                        <button
                            type="button"
                            onClick={() => setHideSplitAlert(true)}
                            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-yellow-500 hover:text-yellow-400 transition-colors z-10"
                            title="סגור"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <span className="text-2xl mt-0.5">⚠️</span>
                        <div className="space-y-1 pl-6">
                            <h4 className="font-bold text-yellow-500 text-base">חשבונות מפוצלים זוהו במערכת</h4>
                            <p className="text-sm text-yellow-100/80 leading-relaxed">
                                שים לב! במאגר הנתונים קיימות מודעות המפוצלות בין חשבון זה (<span className="font-mono text-white">yalgawi@gmail.com</span>)
                                לחשבון השני שלך (<span className="font-mono text-white">darohadd@walla.com</span>). בחשבון זה יש לך מודעה אחת בלבד, 
                                בעוד שבחשבון השני יש לך <strong className="text-yellow-400">7 מודעות נוספות</strong>. 
                                כדי לראות ולנהל את שאר המודעות, מומלץ להתנתק ולהתחבר מחדש עם החשבון השני.
                            </p>
                        </div>
                    </div>
                )}
                {!hideSplitAlert && user?.primaryEmailAddress?.emailAddress === "darohadd@walla.com" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-5 mb-6 flex items-start gap-4 text-right shadow-[0_0_15px_rgba(234,179,8,0.05)] animate-in fade-in slide-in-from-top-2 duration-300 relative" dir="rtl">
                        <button
                            type="button"
                            onClick={() => setHideSplitAlert(true)}
                            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-yellow-500 hover:text-yellow-400 transition-colors z-10"
                            title="סגור"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <span className="text-2xl mt-0.5">⚠️</span>
                        <div className="space-y-1 pl-6">
                            <h4 className="font-bold text-yellow-500 text-base">חשבונות מפוצלים זוהו במערכת</h4>
                            <p className="text-sm text-yellow-100/80 leading-relaxed">
                                שים לב! במאגר הנתונים קיימות מודעות המפוצלות בין חשבון זה (<span className="font-mono text-white">darohadd@walla.com</span>)
                                לחשבון השני שלך (<span className="font-mono text-white">yalgawi@gmail.com</span>). בחשבון זה יש לך 7 מודעות, 
                                בעוד שבחשבון השני יש לך מודעה אחת.
                            </p>
                        </div>
                    </div>
                )}

                {/* HERO SECTION: Profile & Actions */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-center md:items-start">
                    {/* Compact Profile Card */}
                    <div className="bg-card border rounded-3xl p-5 shadow-sm flex items-center gap-4 w-full md:min-w-[300px] md:w-auto relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                        <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-full bg-muted border-2 border-background shadow-md overflow-hidden">
                                {dbImage || user?.imageUrl ? (
                                    <Image src={dbImage || user?.imageUrl || ""} alt="Profile" className="w-full h-full object-cover" width={400} height={400} />
                                ) : (
                                    <div className="w-full h-full bg-primary/20 animate-pulse" />
                                )}
                            </div>
                            <ProfileImageEditor currentImage={dbImage || user?.imageUrl} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-foreground leading-tight flex items-center gap-2">
                                {user ? `היי ${user.firstName || user.username}` : "אורח"}
                                {/* Verified Badge - Blue Check */}
                                <span className="text-blue-500" title="חשבון מאומת">
                                    <BadgeCheck className="w-5 h-5 fill-blue-500 text-white" />
                                </span>
                            </h1>
                            <div className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1.5 align-middle">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                מחובר כ{userMode === 'seller' ? 'מוכר' : 'קונה'}
                                <span className="mx-1">•</span>
                                <span className="text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded-md border border-yellow-500/20 shadow-sm">
                                    <span>🏆</span> Gold
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-mono opacity-80 w-full text-center" dir="ltr">
                                {user?.primaryEmailAddress?.emailAddress}
                            </div>
                            <button
                                onClick={() => setShowProfileEditor(true)}
                                className="text-xs text-primary hover:text-primary/80 mt-2 font-bold flex items-center gap-1 transition-colors mx-auto md:mx-0"
                            >
                                ✍️ עריכת פרופיל וכתובת משלוח
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats / Switcher */}
                    <div className="flex-1 w-full bg-card border rounded-3xl p-1.5 shadow-sm flex items-center">
                        <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl w-full">
                            <button
                                onClick={() => handleUserModeChange("seller")}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${userMode === "seller" ? "bg-background text-primary shadow-sm ring-1 ring-border/5" : "text-muted-foreground hover:bg-background/50"}`}
                            >
                                <span>🏷️</span> <span className="hidden xs:inline">אני </span>מוכר
                            </button>
                            <button
                                onClick={() => handleUserModeChange("buyer")}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${userMode === "buyer" ? "bg-background text-primary shadow-sm ring-1 ring-border/5" : "text-muted-foreground hover:bg-background/50"}`}
                            >
                                <span>📦</span> <span className="hidden xs:inline">אני </span>קונה
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN DASHBOARD CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

                    {/* Left Column: Main Area */}
                    <div className="space-y-6">

                        {/* Quick Action Cards */}
                        <div className={`grid grid-cols-2 sm:grid-cols-2 ${userMode === "seller" ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-3`}>
                            {userMode === "seller" ? (
                                <>
                                    {/* Primary Action: Marketplace */}
                                    <button
                                        onClick={() => router.push('/')}
                                        className="relative overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/10 hover:from-indigo-500/30 hover:to-purple-500/20 border border-indigo-500/30 rounded-3xl p-5 text-right transition-all group shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                    >
                                        <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-br-full -ml-4 -mt-4 transition-transform group-hover:scale-110" />
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">המרקטפלייס</h3>
                                        <p className="text-xs text-indigo-200/70">קנה ומכור פריטים במהירות ובקלות</p>
                                    </button>

                                    {/* Secondary Action: My Listings */}
                                    <button
                                        onClick={() => router.push('/dashboard/marketplace/my-listings')}
                                        className="relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 text-right transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-gray-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        {listings.length > 0 && (
                                            <span className="absolute top-4 left-4 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                                                {listings.length}
                                            </span>
                                        )}
                                        <h3 className="text-xl font-bold text-white mb-1">המודעות שלי</h3>
                                        <p className="text-xs text-gray-500">ניהול המוצרים שהעלית למכירה</p>
                                    </button>

                                    {/* Fourth Action: Create Listing Dialog */}
                                    <button
                                    onClick={() => setShowCreateSelection(true)}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 text-right transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">פרסם מודעה</h3>
                                        <p className="text-xs text-gray-500">העלה מוצר חדש למרקטפלייס</p>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Primary Action: Marketplace */}
                                    <button
                                        onClick={() => router.push('/')}
                                        className="relative overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/10 hover:from-indigo-500/30 hover:to-purple-500/20 border border-indigo-500/30 rounded-3xl p-5 text-right transition-all group shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                    >
                                        <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-br-full -ml-4 -mt-4 transition-transform group-hover:scale-110" />
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">המרקטפלייס</h3>
                                        <p className="text-xs text-indigo-200/70">חפש וקנה פריטים ממוכרים</p>
                                    </button>

                                    {/* Secondary Action: Radar Agent / Smart Agent */}
                                    <button
                                        onClick={() => router.push('/dashboard/marketplace/my-requests')}
                                        className="relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 text-right transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-gray-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Radar className="w-6 h-6 animate-pulse text-amber-400" />
                                        </div>
                                        {requests.length > 0 && (
                                            <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                                {requests.length}
                                            </span>
                                        )}
                                        <h3 className="text-xl font-bold text-white mb-1">סוכן חכם (ראדאר)</h3>
                                        <p className="text-xs text-gray-500">ניהול והפעלת סוכני חיפוש</p>
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {/* Mode-specific Listings or Radar Requests Grid */}
                        {userMode === "seller" ? (
                            <div className="space-y-4 bg-card border border-white/5 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Store className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-bold">המודעות הפעילות שלי למכירה ({listings.length})</h2>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => router.push('/dashboard/marketplace/my-listings')}
                                        className="text-xs text-primary hover:bg-primary/10 gap-1"
                                    >
                                        נהל מודעות <ArrowRight className="w-3 h-3 rotate-180" />
                                    </Button>
                                </div>

                                {listings.length === 0 ? (
                                    <div className="text-center py-10 rounded-2xl border border-dashed border-border/50 bg-[#0a0a0a]/50">
                                        <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                        <p className="text-sm text-muted-foreground mb-4">עדיין לא פרסמת מודעות למכירה בחשבון זה.</p>
                                        <Button
                                        onClick={() => setShowCreateSelection(true)}
                                        size="sm"
                                        className="gap-1.5 font-bold"
                                        >
                                        <Plus className="w-4 h-4" /> פרסם מודעה ראשונה
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {listings.slice(0, 4).map((listing) => (
                                            <ListingCard 
                                                key={listing.id} 
                                                listing={listing} 
                                                isOwner={true}
                                                onEdit={() => router.push('/dashboard/marketplace/my-listings')}
                                                onDelete={async () => {
                                                    if (confirm("האם אתה בטוח שברצונך למחוק את המודעה?")) {
                                                        const res = await deleteListing(listing.id);
                                                        if (res.success) {
                                                            setListings(prev => prev.filter(l => l.id !== listing.id));
                                                        }
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 bg-card border border-white/5 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Radar className="w-5 h-5 text-amber-500 animate-pulse" />
                                        <h2 className="text-xl font-bold">סוכני הראדאר הפעילים שלי ({requests.length})</h2>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => router.push('/dashboard/marketplace/my-requests')}
                                        className="text-xs text-amber-500 hover:bg-amber-500/10 gap-1"
                                    >
                                        נהל סוכנים <ArrowRight className="w-3 h-3 rotate-180" />
                                    </Button>
                                </div>

                                {requests.length === 0 ? (
                                    <div className="text-center py-10 rounded-2xl border border-dashed border-border/50 bg-[#0a0a0a]/50">
                                        <Radar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                        <p className="text-sm text-muted-foreground mb-4">לא מצאנו סוכני ראדאר פעילים בחשבון זה.</p>
                                        <Button 
                                            onClick={() => router.push('/dashboard/marketplace/my-requests?create=true')} 
                                            size="sm" 
                                            className="bg-amber-600 hover:bg-amber-700 hover:text-white text-white font-bold gap-1.5"
                                        >
                                            <Plus className="w-4 h-4" /> הפעל סוכן ראדאר חדש
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {requests.slice(0, 4).map((request) => (
                                            <BuyerRequestCard 
                                                key={request.id} 
                                                request={request}
                                                onEdit={() => router.push(`/dashboard/marketplace/my-requests`)}
                                                onDelete={async (id) => {
                                                    if (confirm("האם אתה בטוח שברצונך למחוק סוכן זה?")) {
                                                        try {
                                                            const res = await fetch(`/api/marketplace/request/${id}`, { method: "DELETE" });
                                                            if (res.ok) {
                                                                setRequests(prev => prev.filter(r => r.id !== id));
                                                            }
                                                        } catch (e) {}
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── My Trade Transactions & Negotiations Section (Request 3) ── */}
                        <div className="space-y-4 bg-card border border-white/5 rounded-3xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Inbox className="w-5 h-5 text-indigo-400" />
                                    <h2 className="text-xl font-bold">ניהול משא ומתן ועסקאות ({shipments.length})</h2>
                                </div>
                                <div className="flex bg-muted/60 p-1 rounded-xl gap-1 text-[11px] font-bold overflow-x-auto self-start sm:self-auto">
                                    <button
                                        onClick={() => setActiveTab("inbox")}
                                        className={`px-3 py-1.5 rounded-lg transition-all relative whitespace-nowrap ${activeTab === "inbox" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        בקשות נכנסות
                                        {inboxCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] animate-pulse font-black">
                                                {inboxCount}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("sent")}
                                        className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${activeTab === "sent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        עסקאות שיצרתי
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("active")}
                                        className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${activeTab === "active" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        עסקאות פעילות
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("history")}
                                        className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${activeTab === "history" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        הושלמו
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                {activeTab === "inbox" && (inboxItems.length > 0 ? inboxItems.map(item => (
                                    <ActionCard key={item.id} shipment={item} userMode={userMode} type="inbox" onDelete={handleDelete} />
                                )) : renderEmptyState("inbox"))}

                                {activeTab === "sent" && (sentItems.length > 0 ? sentItems.map(item => (
                                    <ActionCard key={item.id} shipment={item} userMode={userMode} type="sent" onDelete={handleDelete} />
                                )) : renderEmptyState("sent"))}

                                {activeTab === "active" && (activeItems.length > 0 ? activeItems.map(item => (
                                    <ActionCard key={item.id} shipment={item} userMode={userMode} type="active" onDelete={handleDelete} />
                                )) : renderEmptyState("active"))}

                                {activeTab === "history" && (historyItems.length > 0 ? historyItems.map(item => (
                                    <ActionCard key={item.id} shipment={item} userMode={userMode} type="history" onDelete={handleDelete} />
                                )) : renderEmptyState("history"))}
                            </div>
                        </div>

                        {/* ── My Favorites Section ── */}
                        <div className="space-y-4 bg-card border border-white/5 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                                <h2 className="text-xl font-bold">המועדפים שלי ({favListings.length})</h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : favListings.length === 0 ? (
                                <div className="text-center py-10 rounded-2xl border border-dashed border-border/50 bg-[#0a0a0a]/50">
                                    <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                    <p className="text-sm text-muted-foreground mb-4">עדיין לא סימנת מוצרים במועדפים.</p>
                                    <Button asChild size="sm" className="bg-rose-600 hover:bg-rose-700">
                                        <Link href="/">עבור למרקטפלייס</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {favListings.map((listing) => (
                                        <ListingCard key={listing.id} listing={listing} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div> {/* <--- Added missing closing div for Left Column */}

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        <ReferralCard />

                        {/* Help / Support Quick Links */}
                        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-foreground">הגדרות</h3>
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-right group" onClick={() => setShowProfileEditor(true)}>
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-foreground">פרטים אישיים</div>
                                    <div className="text-muted-foreground">ערוך כתובת וטלפון</div>
                                </div>
                            </button>

                            <h3 className="font-bold text-sm text-foreground pt-2">צריך עזרה?</h3>
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-right group">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">?</div>
                                <div className="text-xs">
                                    <div className="font-bold text-foreground">מרכז התמיכה</div>
                                    <div className="text-muted-foreground">שאלות ותשובות נפוצות</div>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-right group">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">💬</div>
                                <div className="text-xs">
                                    <div className="font-bold text-foreground">צור קשר</div>
                                    <div className="text-muted-foreground">דבר עם נציג אנושי</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function ActionCard({ shipment, userMode, type, onDelete, onView }: { shipment: any, userMode: string, type: string, onDelete?: (id: string, e: React.MouseEvent) => void, onView?: () => void }) {
    const router = useRouter();
    const details = shipment.details || {};
    const isInbox = type === "inbox";

    let isMatchSuggestion = false;
    let originalQuery = "";
    let messages: any[] = [];
    if (details.flexibleData) {
        try {
            const flex = JSON.parse(details.flexibleData);
            isMatchSuggestion = !!flex.isMatchSuggestion;
            originalQuery = flex.originalQuery || "";
            messages = flex.messages || [];
        } catch (e) {}
    }

    // Check if last message was sent by the counterparty (unread message indicator)
    let hasNewMessage = false;
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender !== (userMode === 'seller' ? 'seller' : 'buyer')) {
            hasNewMessage = true;
        }
    }

    // Status Logic
    let statusText = "ממתין";
    let statusColor = "bg-muted text-muted-foreground border-border";

    if (isMatchSuggestion) {
        statusText = "התאמת רדאר";
        statusColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    } else if (shipment.status === "SHARED") {
        statusText = userMode === "seller" ? "שלחת לינק" : "התקבל לינק";
        statusColor = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    } else if (shipment.status === "AGREED") {
        statusText = "אושר";
        statusColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    } else if (shipment.status === "CANCELLED") {
        statusText = "בוטל";
        statusColor = "bg-destructive/10 text-destructive border-destructive/20";
    }

    // NEON BORDER LOGIC based on type
    const cardBorderClass =
        isMatchSuggestion ? 'border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:shadow-[0_0_35px_rgba(6,182,212,0.4)]' :
        type === 'active' ? 'border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:shadow-[0_0_35px_rgba(59,130,246,0.4)]' :
            type === 'sent' ? 'border-primary/50 shadow-[0_0_25px_rgba(var(--primary),0.2)] hover:shadow-[0_0_35px_rgba(var(--primary),0.4)]' :
                isInbox ? 'border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)]' :
                    type === 'history' ? 'border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]' :
                        type === 'recycle' ? 'border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.2)] hover:shadow-[0_0_35px_rgba(249,115,22,0.4)]' :
                            'border-border hover:border-primary/30';

    return (
        <div className={`bg-card border transition-all duration-300 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 relative group ${cardBorderClass}`}>
            {/* Status Strip */}
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-lg ${isInbox ? (isMatchSuggestion ? 'bg-cyan-500' : 'bg-orange-500') : 'bg-muted'}`} />

            {/* Image Placeholder */}
            <div className="w-full sm:w-24 h-24 bg-muted/50 rounded-xl shrink-0 flex items-center justify-center">
                {details.images && JSON.parse(details.images).length > 0 ? (
                    <img
                        src={JSON.parse(details.images)[0]}
                        alt={details.itemName || "Product Image"}
                        className="w-full h-full object-cover rounded-xl"
                    />
                ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                )}
            </div>

            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-base text-foreground">{details.itemName || "פריט ללא שם"}</h4>
                    <div className="flex items-center gap-1.5">
                        {hasNewMessage && (
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                            {statusText}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-foreground tracking-tight">
                        ₪{details.value}
                    </p>
                    {hasNewMessage && (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold animate-pulse">
                            💬 הודעה חדשה
                        </span>
                    )}
                </div>

                {isMatchSuggestion && (
                    <div className="text-xs text-cyan-400 font-bold flex items-center gap-1 mt-1">
                        <span>🎯</span> {userMode === "seller" ? "נמצא קונה פוטנציאלי למוצר!" : "נמצאה התאמה לחיפוש שלך!"}
                    </div>
                )}
                {isMatchSuggestion && originalQuery && (
                    <div className="text-xs text-muted-foreground truncate max-w-[90%]" dir="rtl">
                        חיפוש מבוקש: "{originalQuery}"
                    </div>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(shipment.createdAt).toLocaleDateString('he-IL')}
                    </span>
                    <span>•</span>
                    <span>{shipment.shortId}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center sm:items-end gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-dashed">
                {isInbox ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                            size="sm" 
                            onClick={() => router.push(`/link/${shipment.shortId}`)}
                            className="flex-1 sm:flex-initial font-bold rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-shadow"
                        >
                            {isMatchSuggestion ? 'פתח זירת סחר' : (userMode === 'seller' ? 'צפה בפרטים' : 'אשר עסקה')}
                        </Button>
                        {onDelete && (
                            <Button size="sm" variant="ghost" onClick={(e) => onDelete(shipment.id, e)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ) : (
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => router.push(`/link/${shipment.shortId}`)}
                        className="w-full sm:w-auto text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        פרטים
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

