"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListingById, createShipmentFromListing } from "@/app/actions/marketplace";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ShoppingBag, ArrowRight, MapPin, Calendar, Truck, ShieldCheck, Share2, Heart, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingPage() {
    const params = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [creatingShipment, setCreatingShipment] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            if (!params.id) return;
            try {
                const res = await getListingById(params.id as string);
                if (res.success && res.listing) {
                    setListing(res.listing);
                    // Set initial selected image
                    if (res.listing.images) {
                        const images = JSON.parse(res.listing.images);
                        if (images.length > 0) setSelectedImage(images[0]);
                    }
                } else {
                    alert("המוצר לא נמצא");
                    router.push("/dashboard/marketplace");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [params.id, router]);

    const handleBuyNow = async () => {
        if (!listing) return;
        setCreatingShipment(true);
        try {
            const res = await createShipmentFromListing(listing.id);
            if (res.success) {
                router.push(`/link/${res.shortId}`);
            } else {
                alert("שגיאה ביצירת עסקה: " + res.error);
            }
        } catch (e) {
            alert("שגיאה לא צפויה");
        } finally {
            setCreatingShipment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white pb-20">
                <Navbar />
                <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
                    <div className="h-8 w-1/3 bg-gray-800 rounded"></div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-800 rounded-xl"></div>
                        <div className="space-y-4">
                            <div className="h-10 w-3/4 bg-gray-800 rounded"></div>
                            <div className="h-6 w-1/2 bg-gray-800 rounded"></div>
                            <div className="h-32 bg-gray-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) return null;

    const images = listing.images ? JSON.parse(listing.images) : [];
    const extraData = listing.extraData ? JSON.parse(listing.extraData) : {};
    const features = Object.entries(extraData).filter(([key]) => key !== "דגשים" && key !== "טלפון ליצירת קשר");
    const highlights = extraData["דגשים"] ? extraData["דגשים"].split(", ") : [];

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 text-gray-400 hover:text-white flex gap-2 p-0 hover:bg-transparent"
                >
                    <ArrowRight className="w-4 h-4" /> חזור למרקטפלייס
                </Button>

                <div className="grid md:grid-cols-12 gap-8">

                    {/* Left Column: Images (7 columns) */}
                    <div className="md:col-span-12 lg:col-span-7 space-y-4">
                        {/* Main Image */}
                        <div className="aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative group">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={listing.title}
                                    className="w-full h-full object-contain bg-black/50 backdrop-blur-sm"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <ShoppingBag className="w-20 h-20 opacity-20" />
                                </div>
                            )}

                            <div className="absolute top-4 right-4 flex gap-2">
                                <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-sm font-bold shadow-lg">
                                    {listing.condition === "New" ? "חדש באריזה" :
                                        listing.condition === "Like New" ? "כמו חדש" :
                                            listing.condition === "Used" ? "משומש" :
                                                listing.condition}
                                </Badge>
                                {listing.category && (
                                    <Badge variant="outline" className="bg-black/50 backdrop-blur border-gray-600 text-gray-200">
                                        {listing.category}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? "border-purple-500 ring-2 ring-purple-500/30" : "border-transparent opacity-70 hover:opacity-100"}`}
                                    >
                                        <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description Section */}
                        <Card className="bg-gray-900/50 border-gray-800 mt-8">
                            <CardHeader>
                                <CardTitle className="text-xl">תיאור המוצר</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {listing.description}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Details & Actions (5 columns) */}
                    <div className="md:col-span-12 lg:col-span-5 space-y-6">

                        {/* Summary Card */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl shadow-purple-900/10">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                                    {listing.title}
                                </h1>
                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                    <span>פורסם בתאריך {new Date(listing.createdAt).toLocaleDateString('he-IL')}</span>
                                    {listing.seller?.city && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.seller.city}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-baseline justify-between border-b border-gray-800 pb-6">
                                <div className="text-4xl font-bold text-green-400 font-mono">
                                    ₪{listing.price.toLocaleString()}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-800 text-gray-400 hover:text-red-500">
                                        <Heart className="w-6 h-6" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-800 text-gray-400 hover:text-blue-500">
                                        <Share2 className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={creatingShipment}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-purple-900/20"
                                >
                                    {creatingShipment ? "מעבד נתונים..." : "קנה בטוח עכשיו 🛡️"}
                                </Button>
                                <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800 h-12 text-gray-300">
                                    <MessageCircle className="w-4 h-4 ml-2" /> שלח הודעה למוכר
                                </Button>
                            </div>

                            <div className="flex gap-3 text-xs text-gray-500 justify-center">
                                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> הגנת רוכש מלאה</span>
                                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> משלוח זמין</span>
                            </div>
                        </div>

                        {/* Tech Specs / Extra Data */}
                        {(features.length > 0 || highlights.length > 0) && (
                            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                                <CardHeader className="bg-gray-800/50 py-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" /> מפרט מקצועי
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Highlights Chips */}
                                    {highlights.length > 0 && (
                                        <div className="p-4 flex flex-wrap gap-2 border-b border-gray-800">
                                            {highlights.map((h: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="bg-purple-900/30 text-purple-300 hover:bg-purple-900/50">
                                                    ✨ {h}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Specs List */}
                                    <div className="divide-y divide-gray-800">
                                        {features.map(([key, value]: any, i) => (
                                            <div key={i} className="flex justify-between p-4 hover:bg-gray-800/30 transition-colors">
                                                <span className="text-gray-400">{key}</span>
                                                <span className="font-medium text-white max-w-[60%] text-left">{value}</span>
                                            </div>
                                        ))}
                                        {/* Show phone if available */}
                                        {extraData["טלפון ליצירת קשר"] && (
                                            <div className="flex justify-between p-4 bg-gray-800/30">
                                                <span className="text-gray-400">טלפון</span>
                                                <span className="font-medium text-white text-left dir-ltr">{extraData["טלפון ליצירת קשר"]}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Seller Profile */}
                        {listing.seller && (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                                        {listing.seller.imageUrl ? (
                                            <img src={listing.seller.imageUrl} alt={listing.seller.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">
                                            {listing.seller.firstName} {listing.seller.lastName}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            חבר במערכת מאז {new Date(listing.seller.createdAt).getFullYear()}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="mr-auto text-blue-400 hover:text-blue-300">
                                        צפה בפרופיל
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
