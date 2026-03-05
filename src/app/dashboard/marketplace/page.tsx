"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Plus, Sparkles, ScanSearch, Settings, MapPin, LocateFixed, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Search State
    const [searchInput, setSearchInput] = useState("");
    const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [locationName, setLocationName] = useState("");
    const [radiusKm, setRadiusKm] = useState<number>(20);
    const [showFilters, setShowFilters] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const { user } = useUser();
    const isAdmin = ["yalgawi@gmail.com", "darohadd@walla.com"].includes(
        user?.primaryEmailAddress?.emailAddress || ""
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchInput(val);
        setShowAutocomplete(true);
        
        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        if (val.trim().length > 1) {
            setIsAutocompleteLoading(true);
            debounceRef.current = setTimeout(async () => {
                try {
                    const res = await fetch("/api/marketplace/smart-search", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            query: val,
                            lat: lat,
                            lng: lng,
                            radiusKm: (lat && lng) ? (radiusKm === 155 ? null : radiusKm) : null
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        setAutocompleteResults((data.results || []).slice(0, 5));
                    }
                } catch (error) {
                    console.error("Autocomplete failed:", error);
                } finally {
                    setIsAutocompleteLoading(false);
                }
            }, 300);
        } else {
            setAutocompleteResults([]);
            setIsAutocompleteLoading(false);
        }
    };

    const fetchSmartSearch = async () => {
        setLoading(true);
        setShowAutocomplete(false);
        try {
            // Geocode manual location input if it's set but we don't have coords
            let currentLat = lat;
            let currentLng = lng;
            if (locationName && !lat && !lng) {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&countrycodes=IL&format=json&limit=1`);
                const data = await res.json();
                if (data && data.length > 0) {
                    currentLat = parseFloat(data[0].lat);
                    currentLng = parseFloat(data[0].lon);
                    setLat(currentLat);
                    setLng(currentLng);
                } else {
                    toast.error("לא הצלחנו למצוא את המיקום הזה. נסה עיר אחרת.");
                }
            }

            const res = await fetch("/api/marketplace/smart-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: searchInput,
                    lat: currentLat,
                    lng: currentLng,
                    radiusKm: currentLat && currentLng ? (radiusKm === 155 ? null : radiusKm) : null
                })
            });
            const data = await res.json();
            if (data.success) {
                setListings(data.results || []);
            }
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("שגיאה בחיפוש");
        }
        setLoading(false);
    };

    // Initial load
    useEffect(() => {
        let isMounted = true;
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/marketplace/smart-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: "", lat: null, lng: null, radiusKm: null })
                });
                const data = await res.json();
                if (data.success && isMounted) {
                    setListings(data.results || []);
                }
            } catch (error) {
                console.error("Initial search failed:", error);
            }
            if (isMounted) setLoading(false);
        };

        fetchInitial();
        return () => { isMounted = false; };
    }, []);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        fetchSmartSearch();
    };

    const getDeviceLocation = () => {
        setGettingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLat(position.coords.latitude);
                    setLng(position.coords.longitude);
                    setLocationName("המיקום שלי 📍");
                    setGettingLocation(false);
                    // Optionally auto-search upon getting location
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("לא ניתן היה להשיג את המיקום שלך. בדוק הרשאות דפדפן.");
                    setGettingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            toast.error("הדפדפן שלך אינו תומך בשירותי מיקום");
            setGettingLocation(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col bg-black text-white">
            <Navbar />

            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                            המרקטפלייס
                        </h1>
                        <p className="text-gray-400">
                            מנוע חיפוש חכם – כתוב מה אתה מחפש בשפה שלך!
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

                {/* Search Bar & Filters */}
                <div className="bg-gray-900/40 p-4 rounded-3xl border border-gray-800 backdrop-blur-sm space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1" ref={autocompleteRef}>
                            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5 z-10 pointer-events-none" />
                            <Input
                                placeholder='נסה "לפטופ גיימינג מתחת ל-4000 שקל באיזור תל אביב"...'
                                className="pl-4 pr-12 h-14 bg-gray-900/80 border-gray-700 rounded-2xl text-lg focus:ring-purple-500 focus:border-purple-500 transition-all relative z-10"
                                value={searchInput}
                                onChange={handleSearchInputChange}
                                onFocus={() => { if (searchInput.trim().length > 0) setShowAutocomplete(true) }}
                            />
                            {isAutocompleteLoading && (
                                <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5 animate-spin z-10 pointer-events-none" />
                            )}
                            
                            {/* Autocomplete Dropdown */}
                            {showAutocomplete && searchInput.trim().length > 0 && (
                                <div className="absolute top-[110%] left-0 right-0 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl shadow-purple-900/20 z-[100] overflow-hidden max-h-[400px] overflow-y-auto">
                                    {autocompleteResults.length > 0 ? (
                                        <div className="flex flex-col">
                                            {autocompleteResults.map(res => {
                                                const imgs = res.images ? (typeof res.images === 'string' ? JSON.parse(res.images) : res.images) : [];
                                                return (
                                                    <div 
                                                        key={res.id}
                                                        onClick={() => {
                                                            setShowAutocomplete(false);
                                                            if (res.type === "external" && res.sourceUrl) {
                                                                window.open(res.sourceUrl, "_blank");
                                                            } else if (res.type !== "catalog") {
                                                                router.push(`/dashboard/marketplace/${res.id}`);
                                                            }
                                                        }}
                                                        className="flex items-center gap-4 p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                                                    >
                                                        {imgs.length > 0 ? (
                                                            <img src={imgs[0]} className="w-12 h-12 object-cover rounded-lg" alt={res.title} />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                                                                <ScanSearch className="w-6 h-6 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="text-sm font-bold truncate text-white">{res.title}</div>
                                                            <div className="text-xs text-gray-400 truncate mt-1 text-right">
                                                                <span className="text-green-400 font-bold">{res.price > 0 ? `₪${res.price.toLocaleString()}` : 'צור קשר'}</span>
                                                                {res.category && <span className="mr-2"> • {res.category}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        !isAutocompleteLoading && (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                לא נמצאו תוצאות לחיפוש זה
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                        <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className={`h-14 px-4 rounded-2xl border-gray-700 hover:bg-gray-800 ${showFilters ? 'bg-gray-800 text-purple-400 border-purple-500' : 'bg-gray-900'}`}>
                            <Filter className="w-5 h-5" />
                        </Button>
                        <Button type="submit" disabled={loading} className="h-14 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 text-lg font-bold">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 ml-2" />}
                            חפש
                        </Button>
                    </form>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800/30 rounded-2xl border border-gray-800/50 animate-in slide-in-from-top-2">
                            {/* Location Input */}
                            <div className="space-y-2 text-right" dir="rtl">
                                <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-400" />
                                    המיקום שלי לחיפוש
                                </label>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="הזן עיר או לחץ על הכפתור..." 
                                        value={locationName}
                                        list="cities"
                                        onChange={e => {
                                            setLocationName(e.target.value);
                                            // Reset coords when manual typing
                                            setLat(null);
                                            setLng(null);
                                        }}
                                        className="bg-gray-900 border-gray-700 rounded-xl"
                                    />
                                    <datalist id="cities">
                                        {/* רשימה חלקית של ערים מרכזיות בישראל להשלמה אוטומטית */}
                                        <option value="תל אביב" />
                                        <option value="ירושלים" />
                                        <option value="חיפה" />
                                        <option value="ראשון לציון" />
                                        <option value="פתח תקווה" />
                                        <option value="אשדוד" />
                                        <option value="נתניה" />
                                        <option value="באר שבע" />
                                        <option value="בני ברק" />
                                        <option value="חולון" />
                                        <option value="רמת גן" />
                                        <option value="אשקלון" />
                                        <option value="רחובות" />
                                        <option value="בת ים" />
                                        <option value="כפר סבא" />
                                        <option value="הרצליה" />
                                        <option value="חדרה" />
                                        <option value="מודיעין" />
                                        <option value="רעננה" />
                                        <option value="לוד" />
                                        <option value="רמלה" />
                                        <option value="מודיעין עילית" />
                                        <option value="רמת השרון" />
                                        <option value="בית שמש" />
                                        <option value="קרית אתא" />
                                        <option value="קרית גת" />
                                        <option value="אילת" />
                                        <option value="עפולה" />
                                        <option value="נהריה" />
                                        <option value="טבריה" />
                                        <option value="אריאל" />
                                        <option value="כרמיאל" />
                                    </datalist>

                                    <Button 
                                        type="button"
                                        variant="secondary" 
                                        onClick={getDeviceLocation} 
                                        disabled={gettingLocation}
                                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30 rounded-xl"
                                        title="השתמש ב-GPS"
                                    >
                                        {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Radius Slider */}
                            <div className="space-y-4 text-right" dir="rtl">
                                <label className="text-sm font-semibold text-gray-300 flex justify-between items-center">
                                    <span>מרחק חיפוש מקסימלי</span>
                                    <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md">
                                        {radiusKm === 155 ? "ללא הגבלה" : `${radiusKm} ק"מ`}
                                    </span>
                                </label>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="155" 
                                    step="5"
                                    value={radiusKm} 
                                    onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    disabled={!lat && !lng && !locationName}
                                    style={{ opacity: (!lat && !lng && !locationName) ? 0.3 : 1 }}
                                />
                                {(!lat && !lng && !locationName) && (
                                    <p className="text-xs text-gray-500 text-center">הזן מיקום כדי לסנן לפי מרחק</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-96 bg-gray-900/30 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(listing => (
                            <div key={listing.id} className="relative">
                                {/* Distance Badge if available */}
                                {listing.distanceKm !== undefined && listing.distanceKm !== null && (
                                    <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                                        <MapPin className="w-3 h-3 text-purple-400" />
                                        {listing.distanceKm < 1 ? "קרוב אליך (<1 ק״מ)" : `${Math.round(listing.distanceKm)} ק״מ ממך`}
                                    </div>
                                )}
                                <ListingCard listing={listing} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                        <div className="text-6xl mb-4">🏜️</div>
                        <h3 className="text-2xl font-bold text-gray-400">לא מצאנו תוצאות מתאימות</h3>
                        <p className="text-gray-500 mt-2">נסה לחפש במילים אחרות או לשנות את מרחק החיפוש.</p>
                        <Button 
                            variant="outline" 
                            className="mt-6 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                            onClick={() => {
                                setSearchInput("");
                                setLat(null);
                                setLng(null);
                                setLocationName("");
                                fetchSmartSearch();
                            }}
                        >
                            נקה את כל הסינונים
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
