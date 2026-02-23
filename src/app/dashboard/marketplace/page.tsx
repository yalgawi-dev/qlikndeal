"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getListings } from "@/app/actions/marketplace";
import { Search, Filter, Plus, Sparkles, ScanSearch, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useUser();
    const isAdmin = ["yalgawi@gmail.com", "darohadd@walla.com"].includes(
        user?.primaryEmailAddress?.emailAddress || ""
    );

    const fetchListings = async () => {
        setLoading(true);
        const res = await getListings();
        if (res.success) {
            setListings(res.listings || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen flex flex-col bg-black text-white">
            <Navbar />

            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                            המרקטפלייס
                        </h1>
                        <p className="text-gray-400">
                            קנה בטוח ממוכרים מאומתים ברשתות החברתיות
                        </p>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {/* Admin shortcut — only for admin user */}
                        {isAdmin && (
                            <Link href="/admin/parser-logs">
                                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 gap-1.5">
                                    <Settings className="w-4 h-4" />
                                    Admin
                                </Button>
                            </Link>
                        )}
                        <Link href="/dashboard/marketplace/my-listings">
                            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-full px-6">
                                המודעות שלי
                            </Button>
                        </Link>

                        {/* Browse / Buyer button */}
                        <Link href="/dashboard/marketplace/browse">
                            <Button className="bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2">
                                <ScanSearch className="h-5 w-5" />
                                אני מחפש
                            </Button>
                        </Link>
                        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 rounded-2xl shadow-lg transition-all transform hover:scale-105">
                                    <Plus className="ml-2 h-6 w-6" />
                                    מכור מוצר
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl p-0 overflow-hidden">
                                <div className="p-6 text-center border-b border-gray-800">
                                    <DialogTitle className="text-2xl font-bold">איך תרצה לפרסם?</DialogTitle>
                                    <p className="text-gray-400 mt-2">בחר את הדרך הנוחה לך ביותר</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 p-6">
                                    {/* Option 1: Smart AI */}
                                    <Link
                                        href="/dashboard/marketplace/create-ai"
                                        className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500 transition-all cursor-pointer"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        <div className="absolute top-3 left-3 bg-indigo-500 text-xs px-2 py-1 rounded-full font-bold animate-pulse">מומלץ ✨</div>
                                        <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">יצירה חכמה עם AI</h3>
                                        <p className="text-sm text-gray-400 text-center">
                                            הדרך הקלה והמהירה! ספר לנו במילים פשוטות, וה-AI יבנה לך מודעה מושלמת תוך שניות.
                                        </p>
                                    </Link>

                                    {/* Option 2: Manual */}
                                    <Link
                                        href="/dashboard/marketplace/create"
                                        className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600 transition-all cursor-pointer"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Plus className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">יצירה ידנית מתקדמת</h3>
                                        <p className="text-sm text-gray-400 text-center">
                                            מילוי יעיל כולל מנועי חיפוש לקטגוריות מתקדמות (כמו מחשבים) או מוצרים כלליים.
                                        </p>
                                    </Link>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="חפש מוצרים..."
                        className="pl-4 pr-12 h-14 bg-gray-900/50 border-gray-800 rounded-2xl text-lg focus:ring-purple-500 focus:border-purple-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-gray-900/30 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                        <div className="text-6xl mb-4">🏜️</div>
                        <h3 className="text-2xl font-bold text-gray-500">אין תוצאות</h3>
                        <p className="text-gray-600 mt-2">הייה הראשון לפרסם כאן מודעה!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
