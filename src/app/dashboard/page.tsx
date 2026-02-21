"use client";

import { Navbar } from "@/components/Navbar";
import { ShipmentForm } from "@/components/ShipmentForm";
import { ReferralCard } from "@/components/ReferralCard";
import { Button } from "@/components/ui/button";
import { Package, Plus, Search, Filter, Inbox, Send, CheckCircle, Clock, Trash2, User, Store } from "lucide-react";
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

const DEMO_SHIPMENTS = [
    {
        id: 'demo-inbox',
        shortId: 'DEMO-IN',
        status: 'NEEDS_REVISION',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה: בקשה נכנסת (דחוף)', value: 1200, images: '[]', description: 'דוגמה לפריט שממתין לאישור שלך' }
    },
    {
        id: 'demo-sent',
        shortId: 'DEMO-OUT',
        status: 'SHARED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה: בקשה שנשלחה', value: 350, images: '[]', description: 'דוגמה לפריט ששלחת לאחרים' }
    },
    {
        id: 'demo-active',
        shortId: 'DEMO-ACT',
        status: 'AGREED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה: משלוח פעיל', value: 890, images: '[]', description: 'משלוח בדרך ליעד' }
    },
    {
        id: 'demo-history',
        shortId: 'DEMO-HIS',
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה: היסטוריה', value: 150, images: '[]', description: 'משלוח שהושלם בהצלחה' }
    },
    {
        id: 'demo-recycle',
        shortId: 'DEMO-DEL',
        status: 'CANCELLED',
        createdAt: new Date().toISOString(),
        details: { itemName: 'הדגמה: בוטל/מוחזר', value: 0, images: '[]', description: 'פריט שנמחק או בוטל' }
    }
];

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams(); // Added searchParams
    const [userMode, setUserMode] = useState<"seller" | "buyer">("seller");
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "active" | "history" | "recycle">("sent");
    const [shipments, setShipments] = useState<any[]>([]);
    const [dbImage, setDbImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedShipment, setSelectedShipment] = useState<any>(null); // For Details Modal
    const [showPhoneOnboarding, setShowPhoneOnboarding] = useState(false);
    const [showProfileEditor, setShowProfileEditor] = useState(false); // New State
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
                const res = await getUserShipments(userMode);
                if (mounted && res.success) {
                    // MERGE REAL DATA WITH DEMO DATA
                    setShipments([...(res.shipments || []), ...DEMO_SHIPMENTS]);
                    if (res.userImage) setDbImage(res.userImage);
                    if (!res.userPhone) setShowPhoneOnboarding(true);
                    setUserData({
                        imageUrl: res.userImage,
                        phone: res.userPhone,
                        ...res.userData // Spread full user data including address
                    });
                }
            } catch (err) {
                console.error("Failed to load shipments", err);
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
                {/* HERO SECTION: Profile & Actions */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-center md:items-start">
                    {/* Compact Profile Card */}
                    <div className="bg-card border rounded-3xl p-6 shadow-sm flex items-center gap-5 w-full md:w-auto min-w-[300px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                        <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-full bg-muted border-2 border-background shadow-md overflow-hidden">
                                {dbImage || user?.imageUrl ? (
                                    <img src={dbImage || user?.imageUrl} alt="Profile" className="w-full h-full object-cover" />
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
                        </div>
                    </div>

                    {/* Quick Stats / Switcher */}
                    <div className="flex-1 w-full bg-card border rounded-3xl p-1.5 shadow-sm flex items-center justify-between">
                        <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl w-full">
                            <button
                                onClick={() => setUserMode("seller")}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${userMode === "seller" ? "bg-background text-primary shadow-sm ring-1 ring-border/5" : "text-muted-foreground hover:bg-background/50"}`}
                            >
                                <span>🏷️</span> אני מוכר
                            </button>
                            <button
                                onClick={() => setUserMode("buyer")}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${userMode === "buyer" ? "bg-background text-primary shadow-sm ring-1 ring-border/5" : "text-muted-foreground hover:bg-background/50"}`}
                            >
                                <span>📦</span> אני קונה
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN DASHBOARD CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

                    {/* Left Column: Smart Inbox */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold px-2">המרכז שלך</h2>
                            <Button onClick={() => setShowForm(true)} className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform" size="sm">
                                <Plus className="h-4 w-4 ml-2" />
                                {userMode === 'seller' ? 'יצירת לינק' : 'בקשת משלוח'}
                            </Button>
                            <Button onClick={() => router.push('/dashboard/marketplace')} variant="outline" className="rounded-full mr-2 hover:bg-primary/10 transition-colors" size="sm">
                                <Store className="h-4 w-4 ml-2" />
                                מרקטפלייס
                            </Button>
                        </div>

                        {/* Tabs */}
                        {/* Tabs */}
                        <div className="flex border-b border-border/60 gap-6 px-2 overflow-x-auto pb-4">
                            <button onClick={() => setActiveTab("inbox")} className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'inbox' ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                בקשות שנכנסו
                                {inboxCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] border border-red-400">{inboxCount}</span>}
                            </button>
                            <button onClick={() => setActiveTab("sent")} className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'sent' ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                בקשות שנשלחו
                                {sentItems.length > 0 && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">{sentItems.length}</span>}
                            </button>
                            <button onClick={() => setActiveTab("active")} className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'active' ? 'border-blue-400 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                פעילים
                                {activeItems.length > 0 && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]">{activeItems.length}</span>}
                            </button>
                            <button onClick={() => setActiveTab("history")} className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'border-purple-500 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                היסטוריה
                            </button>
                            <button onClick={() => setActiveTab("recycle")} className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'recycle' ? 'border-orange-500 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                סל מחזור
                            </button>
                        </div>

                        {/* Cards List */}
                        <div className="space-y-4 min-h-[300px]">
                            {loading ? (
                                [1, 2].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)
                            ) : (
                                <>
                                    {activeTab === "inbox" && (
                                        inboxItems.length > 0 ? inboxItems.map(shipment => (
                                            <ActionCard key={shipment.id} shipment={shipment} userMode={userMode} type="inbox" onDelete={handleDelete} onView={() => setSelectedShipment(shipment)} />
                                        )) : renderEmptyState("inbox")
                                    )}
                                    {activeTab === "sent" && (
                                        sentItems.length > 0 ? sentItems.map(shipment => (
                                            <ActionCard key={shipment.id} shipment={shipment} userMode={userMode} type="sent" onDelete={handleDelete} onView={() => setSelectedShipment(shipment)} />
                                        )) : renderEmptyState("sent")
                                    )}
                                    {activeTab === "active" && (
                                        activeItems.length > 0 ? activeItems.map(shipment => (
                                            <ActionCard key={shipment.id} shipment={shipment} userMode={userMode} type="active" onView={() => setSelectedShipment(shipment)} />
                                        )) : renderEmptyState("active")
                                    )}
                                    {activeTab === "history" && (
                                        historyItems.length > 0 ? historyItems.map(shipment => (
                                            <ActionCard key={shipment.id} shipment={shipment} userMode={userMode} type="history" onView={() => setSelectedShipment(shipment)} />
                                        )) : renderEmptyState("history")
                                    )}
                                    {activeTab === "recycle" && (
                                        recycledItems.length > 0 ? recycledItems.map(shipment => (
                                            <ActionCard key={shipment.id} shipment={shipment} userMode={userMode} type="recycle" onView={() => setSelectedShipment(shipment)} />
                                        )) : renderEmptyState("recycle")
                                    )}
                                </>
                            )}
                        </div>
                    </div>

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

// Sub-component for individual Action Cards
function ActionCard({ shipment, userMode, type, onDelete, onView }: { shipment: any, userMode: string, type: string, onDelete?: (id: string, e: React.MouseEvent) => void, onView?: () => void }) {
    const details = shipment.details || {};
    const isInbox = type === "inbox";

    // Status Logic
    let statusText = "ממתין";
    let statusColor = "bg-muted text-muted-foreground border-border";

    if (shipment.status === "SHARED") {
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
        type === 'active' ? 'border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:shadow-[0_0_35px_rgba(59,130,246,0.4)]' :
            type === 'sent' ? 'border-primary/50 shadow-[0_0_25px_rgba(var(--primary),0.2)] hover:shadow-[0_0_35px_rgba(var(--primary),0.4)]' :
                isInbox ? 'border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)]' :
                    type === 'history' ? 'border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]' :
                        type === 'recycle' ? 'border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.2)] hover:shadow-[0_0_35px_rgba(249,115,22,0.4)]' :
                            'border-border hover:border-primary/30';

    return (
        <div className={`bg-card border transition-all duration-300 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 relative group ${cardBorderClass}`}>
            {/* Status Strip */}
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-lg ${isInbox ? 'bg-orange-500' : 'bg-muted'}`} />

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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                        {statusText}
                    </span>
                </div>

                <p className="text-2xl font-black text-foreground tracking-tight">
                    ₪{details.value}
                </p>

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
                        <Button size="sm" className="flex-1 sm:flex-initial font-bold rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-shadow">
                            {userMode === 'seller' ? 'צפה בפרטים' : 'אשר עסקה'}
                        </Button>
                        {onDelete && (
                            <Button size="sm" variant="ghost" onClick={(e) => onDelete(shipment.id, e)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ) : (
                    <Button size="sm" variant="outline" onClick={onView} className="w-full sm:w-auto text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                        פרטים
                    </Button>
                )}
            </div>
        </div>
    );
}
