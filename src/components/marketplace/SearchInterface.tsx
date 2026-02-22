"use client";

import { useState, useEffect } from "react";
import { Search, Bell, ExternalLink, Loader2, Sparkles, X, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { BuyerRequestCard } from "./BuyerRequestCard";

interface SearchResult {
    id: string;
    postText: string;
    sellerName: string;
    sellerLink: string;
    images: string; // JSON string
    createdAt: string;
    sourceUrl?: string; // Original Post Link

    // Valid for Internal Items
    itemName?: string;
    price?: number;
    condition?: string;
    packageSize?: string;
    sellerImage?: string;
    isFlexible?: boolean;
    type?: 'internal' | 'external';
}

interface BuyerRequest {
    id: string;
    query: string;
    status: string;
    createdAt: string;
}

export default function SearchInterface() {
    const router = useRouter(); // Initialize router
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [savingRequest, setSavingRequest] = useState(false);
    const [requestSaved, setRequestSaved] = useState(false);

    // New State for Marketplace Cards
    const [myRequests, setMyRequests] = useState<BuyerRequest[]>([]);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

    // Fetch My Requests on Mount
    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const res = await fetch("/api/marketplace/my-requests");
            if (res.ok) {
                const data = await res.json();
                setMyRequests(data);
            }
        } catch (e) {
            console.error("Failed to fetch requests", e);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        setRequestSaved(false);

        try {
            const res = await fetch(`/api/marketplace/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRequest = async () => {
        setSavingRequest(true);
        try {
            const res = await fetch("/api/marketplace/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            if (res.ok) {
                setRequestSaved(true);
                fetchMyRequests(); // Refresh the list
            }
        } catch (error) {
            console.error("Failed to save request", error);
        } finally {
            setSavingRequest(false);
        }
    };

    const handleDeleteRequest = async (id: string) => {
        // Optimistic update
        setMyRequests(prev => prev.filter(r => r.id !== id));
        // In real app: call API to delete
    };

    return (
        <div className="space-y-8">
            {/* Active Requests Section - "Buyer Cards" */}
            {myRequests.length > 0 && (
                <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        הבקשות הפעילות שלי
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myRequests.map(req => (
                            <BuyerRequestCard key={req.id} request={req} onDelete={handleDeleteRequest} />
                        ))}
                    </div>
                </div>
            )}

            {/* Search Section */}
            <div className="relative">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="מה אתה מחפש? (לדוגמה: אייפון 15, ספה...)"
                            className="w-full pl-10 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 outline-none transition-all text-right"
                            dir="rtl"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "חיפוש"}
                    </button>
                </form>
            </div>

            {/* Results Area - "Seller Cards" */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
                        <p className="text-gray-400 animate-pulse">סורק את הרשתות החברתיות...</p>
                    </div>
                </div>
            ) : searched && results.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">לא נמצאו תוצאות מדויקות</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            לא מצאנו בדיוק את מה שחיפשת כרגע ברשתות החברתיות.
                            <br />
                            אבל אל דאגה! אנחנו יכולים להמשיך לחפש בשבילך.
                        </p>

                        {!requestSaved ? (
                            <button
                                onClick={handleSaveRequest}
                                disabled={savingRequest}
                                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 mx-auto"
                            >
                                {savingRequest ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    <Bell className="h-4 w-4" />
                                )}
                                תודיעו לי כשזה עולה!
                            </button>
                        ) : (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 inline-flex items-center gap-2 font-medium">
                                <CheckCircle className="h-5 w-5" />
                                <span>הבקשה נשמרה! נודיע לך כשנמצא.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((result) => {
                        let images = [];
                        try {
                            images = JSON.parse(result.images || "[]");
                        } catch (e) { }

                        return (
                            <div
                                key={result.id}
                                onClick={() => setSelectedResult(result)}
                                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer group flex flex-col h-full"
                            >
                                {images.length > 0 ? (
                                    <div className="h-56 overflow-hidden bg-gray-800 relative">
                                        <img
                                            src={images[0]}
                                            alt="Item preview"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-white font-medium flex items-center gap-1">
                                            <ExternalLink className="w-3 h-3" />
                                            לפרטים
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-56 bg-gray-800 flex flex-col items-center justify-center text-gray-600">
                                        <div className="bg-gray-700/50 p-4 rounded-full mb-2">
                                            <Sparkles className="w-8 h-8 opacity-50" />
                                        </div>
                                        <span className="text-xs font-medium">אין תמונה</span>
                                    </div>
                                )}

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-white text-lg line-clamp-1">{result.sellerName || "מוכר אנונימי"}</h4>
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
                                            {new Date(result.createdAt).toLocaleDateString('he-IL')}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                                        {result.postText}
                                    </p>

                                    <button className="w-full py-2.5 mt-auto bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">
                                        צפה בכרטיס המלא
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detailed Seller Card Modal */}
            <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
                <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden rounded-3xl">

                    {selectedResult && (
                        <div className="flex flex-col h-full">
                            {/* Header Image Area */}
                            <div className="relative h-64 bg-gray-900">
                                {(() => {
                                    let images = [];
                                    try { images = JSON.parse(selectedResult.images || "[]"); } catch (e) { }
                                    return images.length > 0 ? (
                                        <div className="w-full h-full relative group">
                                            <img src={images[0]} alt="Item" className="w-full h-full object-cover" />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-90" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50">
                                            <Sparkles className="w-12 h-12 text-gray-700 opacity-50" />
                                            <span className="text-gray-600 text-sm mt-2 font-medium">אין תמונה זמינה</span>
                                        </div>
                                    );
                                })()}

                                <button
                                    onClick={() => setSelectedResult(null)}
                                    className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all z-20"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            {selectedResult.type === 'internal' && (
                                                <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 inline-block shadow-lg shadow-blue-900/40">
                                                    מאומת Qlikndeal
                                                </span>
                                            )}
                                            <h2 className="text-2xl font-black text-white drop-shadow-md leading-tight">
                                                {selectedResult.itemName || "פריט למכירה"}
                                            </h2>
                                        </div>
                                        {selectedResult.price && (
                                            <div className="text-right">
                                                <span className="block text-3xl font-black text-green-400 drop-shadow-sm leading-none">
                                                    ₪{selectedResult.price.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Details */}
                            <div className="p-6 space-y-6 bg-gray-950">

                                {/* Seller Info - Highlighted */}
                                <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800/50">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700 flex-shrink-0">
                                        {selectedResult.sellerImage ? (
                                            <img src={selectedResult.sellerImage} className="w-full h-full object-cover" alt={selectedResult.sellerName} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                                                {selectedResult.sellerName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base text-gray-200">{selectedResult.sellerName}</h3>
                                        <p className="text-xs text-gray-500">פורסם ב-{new Date(selectedResult.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button className="text-xs font-bold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-700">
                                        פרופיל מוכר
                                    </button>
                                </div>

                                {/* Key Attributes Grid (Condition, Size, etc) */}
                                {selectedResult.type === 'internal' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-900/30 p-3 rounded-xl border border-gray-800/50 flex flex-col items-center text-center gap-1">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">מצב המוצר</span>
                                            <span className="font-bold text-blue-400">
                                                {selectedResult.condition === 'new' ? 'חדש בניילון' :
                                                    selectedResult.condition === 'like-new' ? 'כמו חדש' :
                                                        selectedResult.condition === 'used' ? 'משומש במצב טוב' :
                                                            selectedResult.condition || 'לא צוין'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-900/30 p-3 rounded-xl border border-gray-800/50 flex flex-col items-center text-center gap-1">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">גודל חבילה</span>
                                            <span className="font-bold text-purple-400">
                                                {selectedResult.packageSize === 'small' ? 'קטנה' :
                                                    selectedResult.packageSize === 'medium' ? 'בינונית' :
                                                        selectedResult.packageSize === 'large' ? 'גדולה' :
                                                            selectedResult.packageSize || 'רגילה'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Full Description */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                        <span>📝 פרטים מלאים</span>
                                    </h4>
                                    <div className="bg-gray-900/30 p-4 rounded-2xl border border-gray-800/50 min-h-[100px] text-sm leading-relaxed text-gray-300 whitespace-pre-wrap" dir="rtl">
                                        {selectedResult.postText}
                                    </div>
                                </div>

                                {/* Action Buttons - Sticky Bottom */}
                                <div className="pt-4 mt-auto">
                                    <button
                                        onClick={() => {
                                            if (selectedResult.sellerLink?.startsWith('/')) {
                                                router.push(selectedResult.sellerLink);
                                            } else {
                                                window.open(selectedResult.sellerLink || selectedResult.sourceUrl, '_blank');
                                            }
                                        }}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        {selectedResult.sellerLink?.startsWith('/') ? 'עבור לעסקה מאובטחת' : 'צפה במקור (פייסבוק)'}
                                    </button>

                                    <p className="text-[10px] text-center text-gray-600 mt-3 flex items-center justify-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {selectedResult.type === 'internal' ? 'עסקה זו מוגנת באמצעות Qlikndeal Secure Pay' : 'עסקה חיצונית - באחריות המשתמשים'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
