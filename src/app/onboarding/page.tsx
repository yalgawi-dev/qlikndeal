"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const ISRAELI_CITIES = [
    "ירושלים", "תל אביב-יפו", "חיפה", "ראשון לציון", "פתח תקווה",
    "אשדוד", "נתניה", "באר שבע", "בני ברק", "רמת גן",
    "הרצליה", "חולון", "מודיעין-מכבים-רעות", "בת ים", "אשקלון",
    "רחובות", "כפר סבא", "בית שמש", "הוד השרון", "לוד",
    "רמלה", "נהריה", "עפולה", "ראש העין", "אילת",
    "עכו", "כרמיאל", "אריאל", "אום אל-פחם", "נצרת עילית",
    "נצרת", "טבריה", "צפת", "קריית גת", "קריית שמונה",
    "דימונה", "אופקים", "קריית אתא", "קריית ביאליק", "קריית מוצקין",
    "קריית ים", "רעננה", "גבעתיים", "גבעת שמואל", "יבנה",
    "נס ציונה", "אלעד", "בית שאן", "מגדל העמק", "שדרות",
    "ביתר עילית", "ערד", "רהט", "ירוחם", "מצפה רמון",
    "טירת הכרמל", "פרדס חנה-כרכור", "זכרון יעקב", "עתלית",
    "חדרה", "כפר יונה", "פוריה", "מעלות-תרשיחא", "נוף הגליל",
    "אפרת", "אורנית", "בית אל", "מעלה אדומים", "שאר-ישוב",
    "גן יבנה", "קריית עקרון", "יהוד-מונוסון", "אור יהודה",
];

export default function OnboardingPage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState("");
    const [filtered, setFiltered] = useState<string[]>([]);
    const [showList, setShowList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!search.trim()) { setFiltered([]); return; }
        setFiltered(
            ISRAELI_CITIES.filter(c => c.includes(search) || c.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search]);

    const handleSelect = (city: string) => {
        setSelected(city);
        setSearch(city);
        setShowList(false);
    };

    const handleSubmit = async () => {
        if (!selected) { setError("אנא בחר עיר מהרשימה"); return; }
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/user/set-city", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ city: selected }),
            });
            if (!res.ok) throw new Error(await res.text());
            // Redirect to main page after onboarding
            router.push("/");
        } catch (e: any) {
            setError("שגיאה בשמירת המיקום, נסה שוב.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="animate-spin text-indigo-400 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden" dir="rtl">
            {/* Background blobs */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl shadow-black/40">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <MapPin className="w-8 h-8 text-indigo-400" />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">
                            היי {user?.firstName || "שם"} 👋
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            כדי שנוכל להציג לך מוצרים קרובים אליך <br />
                            ולסנן תוצאות לפי אזור — אנא בחר את עירך.
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-2">
                        <label className="block text-xs font-bold text-slate-400 mb-2">
                            עיר מגורים <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute top-3.5 right-3.5 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setSelected(""); setShowList(true); }}
                                onFocus={() => setShowList(true)}
                                placeholder="חפש עיר..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all text-right"
                            />
                        </div>

                        {/* Dropdown */}
                        {showList && filtered.length > 0 && (
                            <div className="absolute top-full z-50 mt-1 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                {filtered.map(city => (
                                    <button
                                        key={city}
                                        onClick={() => handleSelect(city)}
                                        className="w-full text-right px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/20 hover:text-white transition-colors"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

                    {/* CTA */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selected}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                        {loading ? "שומר..." : "כניסה למערכת"}
                    </button>

                    <p className="text-center text-xs text-slate-600 mt-4">
                        ניתן לשנות מיקום בהמשך מהגדרות הפרופיל
                    </p>
                </div>
            </div>
        </div>
    );
}
