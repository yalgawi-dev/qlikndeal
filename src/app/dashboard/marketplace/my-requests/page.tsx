"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BuyerRequestCard } from "@/components/marketplace/BuyerRequestCard";
import { Search, BellRing, Sparkles, Loader2, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function MyRequestsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("query") || "";

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [showForm, setShowForm] = useState(!!initialQuery);
    const [submitting, setSubmitting] = useState(false);
    const [query, setQuery] = useState(initialQuery);
    const [budget, setBudget] = useState("");
    const [category, setCategory] = useState("");
    const [details, setDetails] = useState("");

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/marketplace/my-requests");
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בטעינת הבקשות שלך");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            toast.error("חובה להזין מה אתה מחפש");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/marketplace/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    query,
                    extraData: JSON.stringify({
                        budget: budget ? parseFloat(budget) : null,
                        category: category || "General",
                        details: details
                    })
                })
            });

            if (res.ok) {
                toast.success("הבקשה נרשמה בהצלחה! נודיע לך כשיימצא המוצר");
                setShowForm(false);
                setQuery("");
                setBudget("");
                setCategory("");
                setDetails("");
                fetchRequests();
            } else {
                toast.error("חיבור נכשל, נסה שוב");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאה לא צפויה המערכת");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("בטוח שברצונך למחוק את חיפוש זה?")) return;
        
        try {
            const res = await fetch(`/api/marketplace/request/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("הבקשה נמחקה");
                fetchRequests();
            } else {
                toast.error("שגיאה במחיקת הבקשה");
            }
        } catch (error) {
            toast.error("שגיאה במחיקת הבקשה");
        }
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/dashboard/marketplace" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            חזרה למרקטפלייס
                        </Link>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 mb-2">
                            סוכן החיפושים שלי
                        </h1>
                        <p className="text-gray-400">
                            לא מצאת מה שחיפשת? המערכת תחפש בשבילך ותתריע ברגע שזה יעלה.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form (if active) */}
                    <div className="lg:col-span-2 space-y-6">
                        {showForm ? (
                            <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 shadow-xl shadow-purple-900/10 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-purple-500/20 p-2.5 rounded-xl text-purple-400">
                                        <BellRing className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">בקשה חדשה לראדאר</h2>
                                        <p className="text-sm text-gray-400">נשמח לכמה שיותר פרטים כדי לדייק את ההתראה.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-300">מה אתה מחפש? (חובה)</label>
                                        <Input 
                                            placeholder='למשל: מחשב נייד לנובו i7' 
                                            value={query} 
                                            onChange={e => setQuery(e.target.value)}
                                            className="bg-black/50 border-gray-700 h-12 focus:ring-purple-500 rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-300">תקציב מקסימלי (₪)</label>
                                            <Input 
                                                type="number"
                                                placeholder="לא חובה" 
                                                value={budget} 
                                                onChange={e => setBudget(e.target.value)}
                                                className="bg-black/50 border-gray-700 h-12 focus:ring-purple-500 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-300">קטגוריה</label>
                                            <Input 
                                                placeholder="למשל: סלולר, רכב, ריהוט" 
                                                value={category} 
                                                onChange={e => setCategory(e.target.value)}
                                                className="bg-black/50 border-gray-700 h-12 focus:ring-purple-500 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-300">דרישות ספציפיות / הערות</label>
                                        <Textarea 
                                            placeholder="אם יש דרישה לחלקים מיוחדים, מצב המוצר או חברה ספציפית..." 
                                            value={details} 
                                            onChange={e => setDetails(e.target.value)}
                                            className="bg-black/50 border-gray-700 min-h-[100px] focus:ring-purple-500 rounded-xl resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            onClick={() => setShowForm(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            ביטול
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={submitting}
                                            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
                                        >
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "הפעל ראדאר 🎯"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-gray-900/30 border border-dashed border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-900/50 transition-colors cursor-pointer" onClick={() => setShowForm(true)}>
                                <div className="bg-gray-800/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">צור בקשת חיפוש חדשה</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    תן לנו לעשות את העבודה. תגיד לנו מה אתה רוצה, ובוט האיתור שלנו ישלח לך התראה כשזה יעלה למרקט.
                                </p>
                            </div>
                        )}

                        {/* Recent Activity / Log of matching (Placeholder for future) */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 relative overflow-hidden hidden">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-amber-400" /> מנוע ההתאמות פעיל
                            </h3>
                            <div className="text-xs text-gray-500 font-mono space-y-2 opacity-60">
                                <div>[SYS] Scanning 14 new listings...</div>
                                <div>[SYS] Filtering by category...</div>
                                <div>[SYS] Awaiting matches for active requests</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Existing Requests List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-gray-800 pb-2 mb-4">הבקשות הפעילות שלי</h2>
                        
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center p-6 bg-gray-900/20 rounded-xl border border-gray-800/50">
                                <p className="text-gray-500 text-sm">אין לך כרגע בקשות חיפוש פעילות באוויר.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {requests.map(req => (
                                    <BuyerRequestCard 
                                        key={req.id} 
                                        request={req} 
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function MyRequestsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
            <MyRequestsContent />
        </Suspense>
    );
}
