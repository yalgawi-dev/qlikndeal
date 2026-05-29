"use client";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useUser, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Plus, Sparkles, ScanSearch, Settings, MapPin, LocateFixed, Loader2, User, Tag, ShieldCheck, Zap, Package, Map as MapIcon, X, BrainCircuit, Cpu, MonitorPlay, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import ComputerConsultantModal from "@/components/marketplace/ComputerConsultantModal";

const LocationMap = dynamic(() => import('@/components/marketplace/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-500">טוען מפה...</div>
});

const ISRAELI_CITIES: Record<string, { lat: number, lng: number }> = {
  "תל אביב": { lat: 32.0853, lng: 34.7818 },
  "ירושלים": { lat: 31.7683, lng: 35.2137 },
  "חיפה": { lat: 32.7940, lng: 34.9896 },
  "ראשון לציון": { lat: 31.9730, lng: 34.7925 },
  "פתח תקווה": { lat: 32.0840, lng: 34.8878 },
  "אשדוד": { lat: 31.8014, lng: 34.6435 },
  "נתניה": { lat: 32.3215, lng: 34.8532 },
  "באר שבע": { lat: 31.2518, lng: 34.7913 },
  "בני ברק": { lat: 32.0849, lng: 34.8352 },
  "חולון": { lat: 32.0158, lng: 34.7733 },
  "רמת גן": { lat: 32.0684, lng: 34.8248 },
  "הרצליה": { lat: 32.1624, lng: 34.8447 },
  "רעננה": { lat: 32.1848, lng: 34.8708 },
  "מודיעין": { lat: 31.8903, lng: 35.0104 },
};

const ADMIN_EMAILS = ["yalgawi@gmail.com", "darohadd@walla.com", "itay@qlikndeal.com", "dpccomp@gmail.com"];
const CATEGORIES = ["אוזניות ושמע","אופנועים וקטנועים","ביגוד ואופנה","טלוויזיות ומסכים","טאבלטים","מוצרי חשמל ביתיים","מחשבים ניידים","מחשבים שולחניים","מצלמות","נדל\"ן","קונסולות ומשחקים","ריהוט וצרכי בית","רכבים","טלפונים סלולריים"].sort();

function TopNav({ onPublish }: { onPublish?: () => void }) {
  const { user } = useUser();
  const isAdmin = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress || "");
  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white px-2 sm:px-3">
                <User className="w-4 h-4 sm:ml-1" />
                <span className="hidden sm:inline">האזור האישי</span>
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-3 sm:px-4 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">פרסם מודעה</span>
                <span className="sm:hidden">פרסם</span>
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <div className="cursor-pointer text-xs sm:text-sm px-3 py-2 bg-blue-600 hover:bg-blue-500 font-bold rounded-md text-white inline-flex items-center justify-center transition-colors">כניסה</div>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {isAdmin && (
              <Button asChild variant="ghost" size="sm" className="text-purple-400 px-2"><Link href="/admin"><Settings className="w-4 h-4"/></Link></Button>
            )}
            <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white px-2 sm:px-3"><Link href="/dashboard/marketplace/my-listings"><Package className="w-4 h-4 sm:ml-1"/><span className="hidden sm:inline">המודעות שלי</span></Link></Button>
            <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white px-2"><Link href="/dashboard?tab=favorites"><Heart className="w-4 h-4 text-rose-500 fill-rose-500"/></Link></Button>
            {/* ── Publish CTA in Navbar ── */}
            <Button
              size="sm"
              onClick={onPublish}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-3 sm:px-4 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">פרסם מודעה</span>
              <span className="sm:hidden">פרסם</span>
            </Button>
            <Button asChild variant="ghost" size="sm" className="border border-white/10 text-white hover:bg-white/10 px-2 sm:px-3"><Link href="/dashboard"><User className="w-4 h-4"/></Link></Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [publishStep, setPublishStep] = useState<"TYPE" | "SELLER_METHOD">("TYPE");
  const [isFallback, setIsFallback] = useState(false);
  const [hideFallbackBanner, setHideFallbackBanner] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [capabilityMatch, setCapabilityMatch] = useState<any>(null);
  const [adviceCard, setAdviceCard] = useState<any>(null);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [smartFallbackMessage, setSmartFallbackMessage] = useState<string | null>(null);
  const [catalogSuggestions, setCatalogSuggestions] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [locationMode, setLocationMode] = useState<"LIVE" | "HOME" | "">("");
  const [radiusKm, setRadiusKm] = useState(155);
  const [showMap, setShowMap] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("cat") || "all");
  const [listingType, setListingType] = useState<"SELL" | "BUY">("SELL");
  const [showFilters, setShowFilters] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [isNavigatingTo, setIsNavigatingTo] = useState<string | null>(null);
  const [showConsultantSheet, setShowConsultantSheet] = useState(false);

  useEffect(() => {
    if (!showCreateModal) {
      setPublishStep("TYPE");
    }
  }, [showCreateModal]);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);
  const cityDebounceRef = useRef<any>(null);

  // Consultant wizard states
  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [consultantFilter, setConsultantFilter] = useState<{
    categoryName: string;
    minRamGb: number;
    minStorageGb: number;
    minCpuTier: string;
    recommendedGpu: string;
    userBudget: number;
    preferredFormFactor: "laptop" | "desktop";
    selectedApps?: Array<{ id: number; appNameEn: string; appNameHe?: string | null }>;
    selectedCategoryId?: number;
  } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) setShowAutocomplete(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSearch = async (q = searchInput, latV = lat, lngV = lng, type = listingType, filterV = consultantFilter, catV = selectedCategory) => {
    setLoading(true); setShowAutocomplete(false);
    setHideFallbackBanner(false);
    setAdviceCard(null); setShowAdviceModal(false); setSmartFallbackMessage(null); setCatalogSuggestions([]);
    try {
      const res = await fetch("/api/marketplace/smart-search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: q, 
          lat: latV, 
          lng: lngV, 
          radiusKm: latV && lngV ? (radiusKm === 155 ? null : radiusKm) : null, 
          category: catV === "all" ? null : catV, 
          listingType: type,
          consultantFilter: filterV
        })
      });
      const data = await res.json();
      if (data.success) { 
        setListings(data.results || []); 
        setIsFallback(data.isFallback || false); 
        setAiInsight(data.aiInsight || null); 
        setCapabilityMatch(data.capabilityMatch || null);
        if (data.adviceCard) {
          setAdviceCard(data.adviceCard);
          setShowAdviceModal(true);
        }
        if (data.smartFallbackMessage) setSmartFallbackMessage(data.smartFallbackMessage);
        if (data.catalogSuggestions?.length > 0) setCatalogSuggestions(data.catalogSuggestions);
      }
    } catch { toast.error("שגיאה בחיפוש"); }
    setLoading(false);
  };

  const isRestored = useRef(false);

  // Sync states to sessionStorage when they change
  useEffect(() => {
    if (!isRestored.current) return;
    try {
      sessionStorage.setItem("qlik_searchInput", searchInput);
      sessionStorage.setItem("qlik_selectedCategory", selectedCategory);
      sessionStorage.setItem("qlik_listingType", listingType);
      sessionStorage.setItem("qlik_radiusKm", String(radiusKm));
      sessionStorage.setItem("qlik_locationMode", locationMode);
      sessionStorage.setItem("qlik_locationName", locationName);
      if (lat !== null) sessionStorage.setItem("qlik_lat", String(lat));
      else sessionStorage.removeItem("qlik_lat");
      if (lng !== null) sessionStorage.setItem("qlik_lng", String(lng));
      else sessionStorage.removeItem("qlik_lng");
      
      if (consultantFilter) {
        sessionStorage.setItem("qlik_consultantFilter", JSON.stringify(consultantFilter));
      } else {
        sessionStorage.removeItem("qlik_consultantFilter");
      }
    } catch (e) {
      console.error("Failed to save search filters to sessionStorage", e);
    }
  }, [searchInput, selectedCategory, listingType, consultantFilter, lat, lng, locationName, locationMode, radiusKm]);

  useEffect(() => { 
    let restored = false;
    try {
      const savedSearchInput = sessionStorage.getItem("qlik_searchInput");
      const savedCategory = sessionStorage.getItem("qlik_selectedCategory");
      const savedListingType = sessionStorage.getItem("qlik_listingType") as "SELL" | "BUY" | null;
      const savedConsultantFilter = sessionStorage.getItem("qlik_consultantFilter");
      const savedLat = sessionStorage.getItem("qlik_lat");
      const savedLng = sessionStorage.getItem("qlik_lng");
      const savedLocationName = sessionStorage.getItem("qlik_locationName");
      const savedLocationMode = sessionStorage.getItem("qlik_locationMode");
      const savedRadiusKm = sessionStorage.getItem("qlik_radiusKm");

      if (savedSearchInput !== null || savedCategory !== null || savedListingType !== null || savedConsultantFilter !== null) {
        const parsedConsultantFilter = savedConsultantFilter ? JSON.parse(savedConsultantFilter) : null;
        const finalSearchInput = savedSearchInput || "";
        const finalCategory = savedCategory || "all";
        const finalListingType = savedListingType || "SELL";
        const finalLat = savedLat ? parseFloat(savedLat) : null;
        const finalLng = savedLng ? parseFloat(savedLng) : null;
        const finalLocationName = savedLocationName || "";
        const finalLocationMode = (savedLocationMode as any) || "";
        const finalRadiusKm = savedRadiusKm ? parseInt(savedRadiusKm, 10) : 155;

        setSearchInput(finalSearchInput);
        setSelectedCategory(finalCategory);
        setListingType(finalListingType);
        setConsultantFilter(parsedConsultantFilter);
        setLat(finalLat);
        setLng(finalLng);
        setLocationName(finalLocationName);
        setLocationMode(finalLocationMode);
        setRadiusKm(finalRadiusKm);

        restored = true;
        fetchSearch(finalSearchInput, finalLat, finalLng, finalListingType, parsedConsultantFilter, finalCategory);
      }
    } catch (e) {
      console.error("Failed to restore search filters from sessionStorage", e);
    } finally {
      setTimeout(() => {
        isRestored.current = true;
      }, 100);
    }

    if (!restored) {
      fetchSearch(""); 
      
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (p) => { 
              const newLat = p.coords.latitude; const newLng = p.coords.longitude;
              setLat(newLat); setLng(newLng); setLocationMode("LIVE");
              try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=10&accept-language=he`);
                const data = await res.json();
                const city = data.address?.city || data.address?.town || data.address?.village || data.name;
                if (city) { setLocationName(`${city} 📍`); return; }
              } catch {}
              setLocationName("מיקום נוכחי 📍");
          },
          () => {}, 
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      router.prefetch("/dashboard/marketplace/create-ai");
      router.prefetch("/dashboard/marketplace/create");
    }
  }, [showCreateModal, router]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setSearchInput(val); setShowAutocomplete(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length > 1) {
      setIsAutocompleteLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/marketplace/smart-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: val, lat, lng, radiusKm: lat && lng ? (radiusKm === 155 ? null : radiusKm) : null, category: selectedCategory === "all" ? null : selectedCategory, listingType, isAutocomplete: true }) });
          const data = await res.json();
          if (data.success) setAutocompleteResults((data.results || []).slice(0, 5));
        } catch {}
        setIsAutocompleteLoading(false);
      }, 300);
    } else { setAutocompleteResults([]); setIsAutocompleteLoading(false); }
  };

  const geocodeCity = async (cityName: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&accept-language=he`);
      const data = await res.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {}
    return null;
  };

  const getDeviceLocation = () => {
    setLocationMode("LIVE");
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (p) => { 
            const newLat = p.coords.latitude; const newLng = p.coords.longitude;
            setLat(newLat); setLng(newLng); 
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=10&accept-language=he`);
              const data = await res.json();
              const city = data.address?.city || data.address?.town || data.address?.village || data.name;
              if (city) { setLocationName(`${city} 📍`); setGettingLocation(false); return; }
            } catch {}
            setLocationName("מיקום נוכחי 📍");
            setGettingLocation(false);
        },
        () => { toast.error("לא ניתן לקבל מיקום, בדוק הרשאות דפדפן"); setGettingLocation(false); setLocationMode(""); },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else { toast.error("הדפדפן לא תומך במיקום"); setGettingLocation(false); setLocationMode(""); }
  };

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <SignedIn>
        <TopNav onPublish={() => setShowCreateModal(true)} />
      </SignedIn>
      <SignedOut>
        <TopNav />
      </SignedOut>

      {/* ── Create Modal ── */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl p-0">
          {publishStep === "TYPE" ? (
            <>
              <div className="p-6 text-center border-b border-gray-800">
                <DialogTitle className="text-2xl font-bold">מה ברצונך לפרסם?</DialogTitle>
                <p className="text-gray-400 mt-2">בחר את סוג הפרסום המתאים לך</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 p-6">
                <button 
                  onClick={() => setPublishStep("SELLER_METHOD")} 
                  className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500 transition-all cursor-pointer text-right"
                >
                  <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">פרסם כמוכר</h3>
                  <p className="text-sm text-gray-400 text-center">אני רוצה להציע מוצר או מכשיר למכירה במרקטפלייס</p>
                </button>
                <button 
                  onClick={() => { setIsNavigatingTo("/dashboard/marketplace/my-requests"); router.push("/dashboard/marketplace/my-requests"); }} 
                  disabled={!!isNavigatingTo} 
                  className={`group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500 transition-all cursor-pointer text-right ${isNavigatingTo === "/dashboard/marketplace/my-requests" ? "opacity-80 cursor-wait" : ""}`}
                >
                  <div className="h-16 w-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {isNavigatingTo === "/dashboard/marketplace/my-requests" ? <Loader2 className="w-8 h-8 text-purple-400 animate-spin" /> : <Tag className="w-8 h-8 text-purple-400" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">פרסם כקונה</h3>
                  <p className="text-sm text-gray-400 text-center">אני מחפש מוצר ספציפי לקנייה ומעוניין לקבל הצעות ממוכרים</p>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 text-center border-b border-gray-800 relative">
                <button onClick={() => setPublishStep("TYPE")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm font-bold flex items-center gap-1">
                  <span>חזור ➔</span>
                </button>
                <DialogTitle className="text-2xl font-bold">איך תרצה ליצור את המודעה?</DialogTitle>
                <p className="text-gray-400 mt-2">בחר את הדרך הנוחה לך ביותר לפרסום כמוכר</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 p-6">
                <button onClick={() => { setIsNavigatingTo("/dashboard/marketplace/create-ai"); router.push("/dashboard/marketplace/create-ai"); }} disabled={!!isNavigatingTo} className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${isNavigatingTo === "/dashboard/marketplace/create-ai" ? "border-indigo-500 bg-indigo-500/20 opacity-80 cursor-wait" : "border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500"}`}>
                  <div className="absolute top-3 left-3 bg-indigo-500 text-xs px-2 py-1 rounded-full font-bold animate-pulse">מומלץ ✨</div>
                  <div className="h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{isNavigatingTo === "/dashboard/marketplace/create-ai" ? <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /> : <Sparkles className="w-8 h-8 text-indigo-400" />}</div>
                  <h3 className="text-xl font-bold mb-2">יצירה חכמה עם AI</h3>
                  <p className="text-sm text-gray-400 text-center">{isNavigatingTo === "/dashboard/marketplace/create-ai" ? "טוען..." : "ספר לנו במילים פשוטות — ה-AI יבנה מודעה מושלמת."}</p>
                </button>
                <button onClick={() => { setIsNavigatingTo("/dashboard/marketplace/create"); router.push("/dashboard/marketplace/create"); }} disabled={!!isNavigatingTo} className={`group flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${isNavigatingTo === "/dashboard/marketplace/create" ? "border-gray-500 bg-gray-800 opacity-80 cursor-wait" : "border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600"}`}>
                  <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{isNavigatingTo === "/dashboard/marketplace/create" ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin" /> : <Plus className="w-8 h-8 text-gray-400" />}</div>
                  <h3 className="text-xl font-bold mb-2">יצירה ידנית</h3>
                  <p className="text-sm text-gray-400 text-center">{isNavigatingTo === "/dashboard/marketplace/create" ? "פותח..." : "מילוי ידני מלא לכל הקטגוריות."}</p>
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── STICKY SEARCH BAR (fixed under TopNav: top-14) ── */}
      <div className="sticky top-14 z-40 bg-black/95 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="max-w-5xl mx-auto px-4">
          
          {/* Sell/Buy Tabs */}
          <div className="flex justify-center mb-3">
            <div className="bg-gray-900/80 p-1 rounded-xl border border-gray-800 flex gap-1">
              <button 
                onClick={() => { setListingType("SELL"); fetchSearch(searchInput, lat, lng, "SELL"); }} 
                className={`px-4 sm:px-6 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${listingType === "SELL" ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                📦 מוכרים
              </button>
              <button 
                onClick={() => { setListingType("BUY"); fetchSearch(searchInput, lat, lng, "BUY"); }} 
                className={`px-4 sm:px-6 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${listingType === "BUY" ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                🏷️ קונים
              </button>
            </div>
          </div>

          <div className="bg-gray-900/40 p-4 rounded-3xl border border-gray-800 backdrop-blur-sm space-y-4 relative z-30">
            <form onSubmit={(e) => { e.preventDefault(); fetchSearch(); }} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 w-full" ref={autocompleteRef}>
                <Sparkles className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5 z-10 pointer-events-none"/>
                <Input placeholder='לפטופ גיימינג...' className="pl-4 pr-10 sm:pr-12 h-12 sm:h-14 bg-gray-900/80 border-gray-700 rounded-2xl text-base sm:text-lg focus:ring-purple-500 focus:border-purple-500 z-10" value={searchInput} onChange={handleSearchInputChange} onFocus={() => { if (searchInput.trim().length > 0) setShowAutocomplete(true); }}/>
                {isAutocompleteLoading && <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5 animate-spin z-10 pointer-events-none"/>}
                {showAutocomplete && searchInput.trim().length > 0 && (
                  <div className="absolute top-[110%] left-0 right-0 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl z-[100] overflow-hidden max-h-[400px] overflow-y-auto">
                    {autocompleteResults.length > 0 ? autocompleteResults.map(res => {
                      const imgs = res.images ? (typeof res.images === "string" ? JSON.parse(res.images) : res.images) : [];
                      return (
                        <div key={res.id} onClick={() => { setShowAutocomplete(false); if (res.type === "external" && res.sourceUrl) window.open(res.sourceUrl, "_blank"); else if (res.type !== "catalog") router.push(`/dashboard/marketplace/${res.id}`); }} className="flex items-center gap-4 p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0">
                          {imgs.length > 0 ? <img src={imgs[0]} className="w-12 h-12 object-cover rounded-lg" alt={res.title}/> : <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center"><ScanSearch className="w-6 h-6 text-gray-500"/></div>}
                          <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold truncate text-white">{res.title}</div>
                            <div className="text-xs text-gray-400 truncate mt-1"><span className="text-green-400 font-bold">{res.price > 0 ? `₪${res.price.toLocaleString()}` : "צור קשר"}</span>{res.category && <span className="mr-2">• {res.category}</span>}</div>
                          </div>
                        </div>
                      );
                    }) : !isAutocompleteLoading && <div className="p-4 text-center text-gray-500 text-sm">לא נמצאו תוצאות</div>}
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className={`flex-1 sm:flex-none h-12 sm:h-14 px-4 rounded-2xl border-gray-700 hover:bg-gray-800 ${showFilters ? "bg-gray-800 text-purple-400 border-purple-500" : "bg-gray-900"}`}><Filter className="w-5 h-5"/></Button>
                
                <Button type="button" onClick={() => setShowConsultantModal(true)} className="h-12 sm:h-14 px-4 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 rounded-2xl font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-sm">צריך עזרה בבחירה?</span>
                </Button>

                <Button id="search-btn" type="submit" disabled={loading} className={`flex-[2] sm:flex-none h-12 sm:h-14 px-4 sm:px-8 rounded-2xl ${loading ? 'bg-indigo-600/80 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-purple-600 hover:bg-purple-700'} text-base sm:text-lg font-bold transition-all`}>
                  {loading ? <span className="flex items-center gap-2 animate-pulse"><Loader2 className="w-5 h-5 animate-spin text-indigo-300"/> <span className="text-sm sm:text-base text-indigo-100">מחפש...</span></span> : <span className="flex items-center"><Search className="w-4 h-4 sm:w-5 sm:h-5 ml-2"/>חפש</span>}
                </Button>
              </div>
            </form>

            {consultantFilter && (
              <div className="flex flex-wrap items-center gap-2 pt-2 text-right" dir="rtl">
                <span className="text-xs text-purple-300 font-bold">סינון יועץ רכישה פעיל:</span>
                <div className="inline-flex items-center gap-1.5 bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  <span 
                    onClick={() => setShowConsultantModal(true)} 
                    className="cursor-pointer hover:text-purple-300 transition-colors"
                    title="לחץ לעריכת הדרישות"
                  >
                    {consultantFilter.categoryName} • {consultantFilter.preferredFormFactor === "laptop" ? "נייד" : "נייח"} • מעבד {consultantFilter.minCpuTier}+ • {consultantFilter.minRamGb}GB RAM • {consultantFilter.minStorageGb >= 1024 ? `${consultantFilter.minStorageGb / 1024}TB` : `${consultantFilter.minStorageGb}GB`} SSD{consultantFilter.recommendedGpu && consultantFilter.recommendedGpu !== "Integrated" && consultantFilter.recommendedGpu !== "מובנה" ? ` • ${consultantFilter.recommendedGpu}` : ""} • עד {consultantFilter.userBudget > 0 ? `${consultantFilter.userBudget.toLocaleString()} ₪` : "ללא הגבלת תקציב"}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setConsultantFilter(null);
                      setSelectedCategory("all");
                      fetchSearch(searchInput, lat, lng, listingType, null, "all");
                    }} 
                    className="hover:text-red-400 hover:bg-white/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {showFilters && (
              <div className="p-5 bg-gray-800/30 rounded-2xl border border-gray-800/50 animate-in slide-in-from-top-2">
                <div className="max-w-xl mx-auto space-y-5 text-right" dir="rtl">
                  <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
                    <label className="text-base font-bold text-gray-200 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-400"/> רדיוס חיפוש מהמיקום שלך
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md text-sm font-bold">{radiusKm === 155 ? "כל הארץ" : `עד ${radiusKm} ק"מ`}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowMap(true)} disabled={!lat && !lng} className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 px-2 gap-1 rounded-md transition-all"><MapIcon className="w-3.5 h-3.5"/> הצג מפה</Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400 text-sm">מרכז חיפוש נוכחי:</span>
                        <div className="flex gap-3">
                           {locationMode === 'HOME' && (
                              <button type="button" onClick={getDeviceLocation} className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
                                 <LocateFixed className="w-3 h-3"/> חזור ל-GPS
                              </button>
                           )}
                           <button type="button" onClick={() => setShowCityDialog(true)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                              <MapPin className="w-3 h-3"/> בחר עיר אחרת
                           </button>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${locationMode === 'LIVE' || !locationMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                           {gettingLocation ? <Loader2 className="w-5 h-5 animate-spin"/> : locationMode === 'LIVE' || !locationMode ? <LocateFixed className="w-5 h-5"/> : <MapPin className="w-5 h-5"/>}
                        </div>
                        <span className="text-xl font-bold text-white">
                           {gettingLocation ? "מאתר מיקום..." : (locationName || "לא אותר מיקום")}
                        </span>
                     </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-700/50">
                    <input type="range" min="5" max="155" step="5" value={radiusKm} onChange={e => {
                      if (!lat && !lng) {
                        toast.error("יש לבחור מיקום תחילה", { position: 'bottom-center' });
                        return;
                      }
                      setRadiusKm(parseInt(e.target.value));
                    }} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" disabled={!lat && !lng} style={{ opacity: !lat && !lng ? 0.4 : 1 }}/>
                    <div className="w-full flex justify-between mt-2 px-1">
                      <span className="text-[10px] text-gray-500">5 ק"מ</span>
                      <span className="text-[11px] text-purple-400 font-bold tracking-wide">155 (כל הארץ)</span>
                    </div>
                  </div>
                  
                  {!lat && !lng && <p className="text-xs text-gray-500 text-center">יש לאתר מיקום נוכחי או בית כדי לחפש ברדיוס.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>{/* end sticky search */}

      {/* Spacer for sticky bar height */}

      {showMap && lat && lng && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl h-[80vh] sm:h-[70vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4" dir="rtl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-purple-400"/> תצוגת מפה ורדיוס</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMap(false)} className="text-gray-400 hover:text-white hover:bg-gray-800"><X className="w-5 h-5"/></Button>
            </div>
            <div className="flex-1 relative bg-gray-800">
              <LocationMap lat={lat} lng={lng} radiusKm={radiusKm} />
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[400] bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl" dir="rtl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-200">כוון רדיוס:</span>
                  <span className="text-purple-400 font-bold text-sm">{radiusKm === 155 ? 'כל הארץ' : `${radiusKm} ק"מ`}</span>
                </div>
                <input 
                  type="range" min="5" max="155" step="5" 
                  value={radiusKm} 
                  onChange={e => setRadiusKm(parseInt(e.target.value))} 
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showCityDialog} onOpenChange={setShowCityDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md p-6" dir="rtl">
          <DialogTitle className="text-xl font-bold mb-4 flex items-center gap-2">
             <MapPin className="w-5 h-5 text-purple-400"/>בחר מרכז חיפוש
          </DialogTitle>
          
          <div className="flex flex-col gap-4">
             {typeof window !== "undefined" && localStorage.getItem("home_city") && (
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                   <p className="text-xs text-gray-400 mb-2">חיפוש אחרון ששמרת:</p>
                   <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-gray-700 hover:bg-gray-600 text-white"
                      onClick={() => {
                         const savedCity = localStorage.getItem("home_city");
                         const savedLat = localStorage.getItem("home_lat");
                         const savedLng = localStorage.getItem("home_lng");
                         if (savedCity && savedLat && savedLng) {
                            setLat(parseFloat(savedLat)); setLng(parseFloat(savedLng));
                            setLocationMode("HOME");
                            setLocationName(savedCity + " 🏠");
                            setShowCityDialog(false);
                         }
                      }}
                   >
                      <MapPin className="w-4 h-4 ml-2 text-blue-400"/>
                      {localStorage.getItem("home_city")}
                   </Button>
                </div>
             )}

             <div className="relative">
                <Input 
                  placeholder="הקלד עיר חדשה לחיפוש..." 
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
                    if (e.target.value.trim().length > 1) {
                      cityDebounceRef.current = setTimeout(async () => {
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(e.target.value)}&countrycodes=il&format=json&limit=5&accept-language=he`);
                          const data = await res.json();
                          setCityResults(data || []);
                        } catch { setCityResults([]); }
                      }, 400);
                    } else { setCityResults([]); }
                  }}
                  className="bg-gray-800 border-gray-700 text-white h-12 text-lg focus:ring-purple-500"
                />
                
                {cityResults.length > 0 && (
                  <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden max-h-[250px] overflow-y-auto">
                    {cityResults.map(res => (
                      <div 
                        key={res.place_id} 
                        className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-0"
                        onClick={() => {
                           const cityName = res.name || res.display_name.split(",")[0];
                           localStorage.setItem("home_city", cityName);
                           localStorage.setItem("home_lat", res.lat);
                           localStorage.setItem("home_lng", res.lon);
                           setShowCityDialog(false);
                           setLat(parseFloat(res.lat));
                           setLng(parseFloat(res.lon));
                           setLocationMode("HOME");
                           setLocationName(cityName + " 🏠");
                        }}
                      >
                        <div className="font-bold text-white">{res.name}</div>
                        <div className="text-xs text-gray-400 truncate">{res.display_name}</div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Listings ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {consultantFilter && (
          <>
            {/* ── Desktop: inline panel (md+) ── */}
            <div className="hidden md:block bg-[#0f1422]/90 border border-purple-500/20 rounded-2xl p-5 mb-6 space-y-4 shadow-xl shadow-purple-900/5 animate-in fade-in duration-300" dir="rtl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="font-bold text-sm sm:text-base text-gray-100">דרישות יועץ הרכישה האוטומטי</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowConsultantModal(true)} className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs font-bold rounded-xl px-3 py-1.5 h-8">ערוך דרישות ⚙️</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setConsultantFilter(null); setSelectedCategory("all"); fetchSearch(searchInput, lat, lng, listingType, null, "all"); }} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold rounded-xl px-3 py-1.5 h-8">בטל ❌</Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {consultantFilter.selectedApps && consultantFilter.selectedApps.length > 0 && (
                  <div className="w-full flex flex-wrap gap-1.5 pb-2 border-b border-gray-800/60">
                    <span className="text-[11px] text-purple-400 font-bold w-full mb-0.5">תוכנות ומשחקים שנבחרו:</span>
                    {consultantFilter.selectedApps.map(app => (
                      <span key={app.id} className="inline-flex items-center gap-1 bg-indigo-900/40 border border-indigo-500/30 rounded-full px-2.5 py-1 text-[11px] text-indigo-200 font-semibold">✦ {app.appNameHe || app.appNameEn}</span>
                    ))}
                  </div>
                )}
                {[`${consultantFilter.preferredFormFactor === "laptop" ? "נייד 💻" : "נייח 🖥️"}`, `מעבד ${consultantFilter.minCpuTier}+`, `${consultantFilter.minRamGb}GB RAM`, `${consultantFilter.minStorageGb >= 1024 ? `${consultantFilter.minStorageGb/1024}TB` : `${consultantFilter.minStorageGb}GB`} SSD`, ...(consultantFilter.userBudget > 0 ? [`עד ₪${consultantFilter.userBudget.toLocaleString()}`] : [])].map(chip => (
                  <div key={chip} className="bg-purple-950/30 border border-purple-500/20 rounded-xl px-3 py-1.5 text-xs text-purple-300">{chip}</div>
                ))}
              </div>
            </div>

            {/* ── Mobile: compact banner + bottom sheet ── */}
            <div className="md:hidden mb-4" dir="rtl">
              <button
                onClick={() => setShowConsultantSheet(true)}
                className="w-full flex items-center justify-between gap-3 bg-purple-900/30 border border-purple-500/30 rounded-2xl px-4 py-3 text-right"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-purple-200">יועץ פעיל: {consultantFilter.preferredFormFactor === "laptop" ? "נייד" : "נייח"} · {consultantFilter.minRamGb}GB · עד {consultantFilter.userBudget > 0 ? `₪${consultantFilter.userBudget.toLocaleString()}` : "ללא הגבלה"}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-purple-400 font-bold">פרטים ↑</span>
                  <button onClick={(e) => { e.stopPropagation(); setConsultantFilter(null); setSelectedCategory("all"); fetchSearch(searchInput, lat, lng, listingType, null, "all"); }} className="p-1 rounded-full hover:bg-white/10"><X className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </button>
            </div>

            {/* Bottom Sheet for mobile consultant details */}
            {showConsultantSheet && (
              <div className="fixed inset-0 z-[300] flex items-end" onClick={() => setShowConsultantSheet(false)}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div
                  className="relative w-full bg-[#0d0d1f] border-t border-purple-500/30 rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                  dir="rtl"
                >
                  {/* Handle */}
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /><h3 className="font-bold text-white">יועץ רכישה פעיל</h3></div>
                    <button onClick={() => setShowConsultantSheet(false)} className="p-2 rounded-full bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[`${consultantFilter.preferredFormFactor === "laptop" ? "💻 מחשב נייד" : "🖥️ מחשב נייח"}`, `מעבד ${consultantFilter.minCpuTier}+`, `${consultantFilter.minRamGb}GB RAM`, `${consultantFilter.minStorageGb >= 1024 ? `${consultantFilter.minStorageGb/1024}TB` : `${consultantFilter.minStorageGb}GB`} SSD`, ...(consultantFilter.recommendedGpu && consultantFilter.recommendedGpu !== "Integrated" && consultantFilter.recommendedGpu !== "מובנה" ? [consultantFilter.recommendedGpu] : []), ...(consultantFilter.userBudget > 0 ? [`עד ₪${consultantFilter.userBudget.toLocaleString()}`] : ["ללא הגבלת תקציב"])].map(chip => (
                      <div key={chip} className="bg-purple-950/50 border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-purple-200 font-semibold">{chip}</div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => { setShowConsultantSheet(false); setShowConsultantModal(true); }} className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl">ערוך דרישות ⚙️</Button>
                    <Button variant="outline" onClick={() => { setShowConsultantSheet(false); setConsultantFilter(null); setSelectedCategory("all"); fetchSearch(searchInput, lat, lng, listingType, null, "all"); }} className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl">בטל סינון</Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-72 sm:h-96 bg-gray-900/30 rounded-3xl animate-pulse"/>)}</div>
        ) : listings.length > 0 ? (
          <div className="space-y-6">
            {/* Neon Advice Modal */}
            {showAdviceModal && adviceCard && (
              <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAdviceModal(false)}>
                <div
                  className="relative w-full max-w-lg bg-[#07071a] border-2 border-indigo-500 rounded-3xl p-6 shadow-[0_0_60px_rgba(99,102,241,0.4)] animate-in slide-in-from-bottom-4 duration-300"
                  onClick={e => e.stopPropagation()}
                  dir="rtl"
                >
                  {/* Glow background */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl" />
                  </div>

                  <button onClick={() => setShowAdviceModal(false)} className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-indigo-500/20">
                        <BrainCircuit className="w-7 h-7 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-widest">יועץ חכם פעיל</p>
                        <h3 className="text-xl font-black text-white">מומלץ עבור {adviceCard.keyword}</h3>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-5 leading-relaxed">
                      כדי להריץ את <strong className="text-white">{adviceCard.keyword}</strong> באופן חלק וללא בעיות, המכשיר צריך:
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 text-center">
                        <div className="text-2xl font-black text-indigo-300">{adviceCard.recRam}<span className="text-sm">GB</span></div>
                        <div className="text-[11px] text-gray-400 mt-1">RAM מומלץ</div>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 text-center">
                        <div className="text-sm font-black text-indigo-300 leading-tight">{adviceCard.cpuLabel}</div>
                        <div className="text-[11px] text-gray-400 mt-1">מעבד מומלץ</div>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 text-center">
                        <div className="text-xs font-black text-indigo-300 leading-tight">{adviceCard.gpuLabel || 'לא נדרש'}</div>
                        <div className="text-[11px] text-gray-400 mt-1">כרטיס מסך</div>
                      </div>
                    </div>

                    {adviceCard.consensusScore > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        מבוסס על {Math.round(adviceCard.consensusScore * 100)}% הסכמה בין מקורות
                      </div>
                    )}

                    <button
                      onClick={() => setShowAdviceModal(false)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-base transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95"
                    >
                      סנן תוצאות עבורי ↓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Fallback Banner */}
            {smartFallbackMessage && !hideFallbackBanner && (
              <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 relative" dir="rtl">
                <button
                  type="button"
                  onClick={() => setHideFallbackBanner(true)}
                  className="absolute top-3 left-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-200 transition-colors z-10"
                  title="סגור"
                >
                  <X className="w-4 h-4" />
                </button>
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-200 text-sm pr-1">{smartFallbackMessage}</p>
              </div>
            )}
            {capabilityMatch ? (
                <div className="bg-gradient-to-br from-indigo-900/80 to-[#0a0a1a] border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] rounded-3xl p-6 relative overflow-hidden animate-in slide-in-from-top-4 fade-in duration-500" dir="rtl">
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 z-10">
                        <div className="bg-indigo-500/20 p-4 rounded-2xl shrink-0 mt-1">
                            <BrainCircuit className="w-10 h-10 text-indigo-400"/>
                        </div>
                        <div className="flex-1 text-center md:text-right">
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                                סרקתי את התוצאות עבור <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-cyan-400">{capabilityMatch.keyword}</span>
                            </h3>
                            <p className="text-indigo-100/90 text-sm md:text-base leading-relaxed mb-4 max-w-3xl">
                                זיהיתי שאתה מחפש ציוד שיוכל להריץ את התוכנה. כדי שתוכל לעבוד בצורה חלקה וללא תקיעות, 
                                בחרתי עבורך רק תוצאות שעומדות בדרישות הבאות (או למעלה מכך):
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {capabilityMatch.minRam ? (
                                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-200 font-medium shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                                        <Cpu className="w-4 h-4 text-indigo-400"/> 
                                        לפחות {capabilityMatch.minRam}GB זיכרון (RAM)
                                    </div>
                                ) : null}
                                {capabilityMatch.minCpuTier ? (
                                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-200 font-medium shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                                        <Zap className="w-4 h-4 text-indigo-400"/> 
                                        מעבד: {{ 1: "i3 / Ryzen 3", 2: "i5 / Ryzen 5", 3: "i7 / Ryzen 7", 4: "i9 / Ryzen 9" }[capabilityMatch.minCpuTier as 1|2|3|4] || `רמה ${capabilityMatch.minCpuTier}`}
                                    </div>
                                ) : null}
                                {capabilityMatch.minGpuTier ? (
                                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-200 font-medium shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                                        <MonitorPlay className="w-4 h-4 text-indigo-400"/> 
                                        כרטיס מסך ייעודי למשחקים/עיבוד
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            ) : aiInsight && !isFallback ? (
                <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-2xl p-4 flex gap-4">
                    <div className="bg-indigo-500/20 p-2 rounded-full hidden sm:block"><Sparkles className="w-6 h-6 text-indigo-400"/></div>
                    <div><h4 className="text-indigo-300 font-bold mb-1">המלצת AI</h4><p className="text-indigo-100">{aiInsight}</p></div>
                </div>
            ) : null}
            {isFallback && searchInput.trim().length > 0 && !hideFallbackBanner && (
              <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-5 relative">
                <button
                  type="button"
                  onClick={() => setHideFallbackBanner(true)}
                  className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-200 transition-colors z-10"
                  title="סגור"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-4"><div className="bg-amber-500/20 p-2.5 rounded-xl shrink-0 hidden sm:block"><Sparkles className="w-5 h-5 text-amber-400"/></div>
                  <div className="flex-1 text-right" dir="rtl"><h3 className="text-base font-bold text-amber-200 mb-1">לא נמצא &quot;{searchInput}&quot; — מציג הצעות דומות</h3>{aiInsight && <p className="text-amber-100/80 text-sm">{aiInsight}</p>}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-800/30 flex gap-2 justify-end" dir="rtl">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => router.push(`/dashboard/marketplace/my-requests?query=${encodeURIComponent(searchInput)}`)}><Search className="w-3.5 h-3.5 ml-1.5"/>פתח מודעת &quot;דרוש מוצר&quot;</Button>
                </div>
              </div>
            )}


            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {listings.map(listing => (
                <div key={listing.id} className="relative">
                  {listing.distanceKm != null && <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1"><MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400"/>{listing.distanceKm < 1 ? "קרוב" : `${Math.round(listing.distanceKm)} ק״מ`}</div>}
                  <ListingCard listing={listing}/>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
            <div className="text-6xl mb-4">🏜️</div>
            <h3 className="text-2xl font-bold text-gray-400">לא מצאנו תוצאות מתאימות</h3>
            <p className="text-gray-500 mt-2 mb-6">נסה מילות חיפוש שונות</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-12" onClick={() => { setSearchInput(""); setLat(null); setLng(null); setLocationName(""); setSelectedCategory("all"); setConsultantFilter(null); fetchSearch("", null, null, listingType, null, "all"); }}>נקה סינונים</Button>
              <Button className="bg-purple-600 hover:bg-purple-700 h-12" onClick={() => router.push(`/dashboard/marketplace/my-requests?query=${encodeURIComponent(searchInput)}`)}><Search className="w-4 h-4 ml-2"/>פתח מודעת &quot;דרוש מוצר&quot;</Button>
            </div>
          </div>
        )}
      </div>

      <ComputerConsultantModal
        isOpen={showConsultantModal}
        onClose={() => setShowConsultantModal(false)}
        initialFilter={consultantFilter}
        onApplyFilter={(filter) => {
          setConsultantFilter(filter);
          const targetCat = filter.preferredFormFactor === "laptop" ? "מחשבים ניידים" : "מחשבים שולחניים";
          setSelectedCategory(targetCat);
          fetchSearch(searchInput, lat, lng, listingType, filter, targetCat);
        }}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white bg-black">טוען...</div>}>
      <MarketplaceContent/>
    </Suspense>
  );
}
