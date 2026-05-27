/* eslint-disable @next/next/no-img-element */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import Link from "next/link";
import { ShoppingBag, MapPin, ShieldCheck, Truck, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://qlikndeal.vercel.app";

// ─── Server-side Metadata (for Social Sharing) ───────────────────────────────
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const listing = await prismadb.marketplaceListing.findUnique({
        where: { id: params.id },
        select: { title: true, price: true, description: true, category: true, extraData: true }
    }).catch(() => null);

    if (!listing) return { title: "Qlikndeal" };

    // Build spec summary for description
    let specSummary = "";
    try {
        const extra = JSON.parse(listing.extraData || "{}");
        const specs: string[] = [];
        const getVal = (obj: any, keys: string[]) => keys.map(k => obj[k] || obj[k.toLowerCase()] || "").find(Boolean) || "";
        
        if (Array.isArray(extra)) {
            extra.forEach((item: any) => {
                const k = (item.key || "").toLowerCase();
                if (k.includes("ram") || k.includes("זיכרון")) specs.push(`${item.value} RAM`);
                if (k.includes("cpu") || k.includes("מעבד")) specs.push(`מעבד ${item.value}`);
                if (k.includes("storage") || k.includes("ssd")) specs.push(item.value);
            });
        } else {
            const ram = getVal(extra, ["ram", "RAM"]);
            const cpu = getVal(extra, ["cpu", "CPU"]);
            if (ram) specs.push(`${ram} RAM`);
            if (cpu) specs.push(`מעבד ${cpu}`);
        }
        
        if (specs.length > 0) specSummary = specs.join(" • ") + " | ";
    } catch {}

    const title = `${listing.title} — ₪${Number(listing.price).toLocaleString()} | Qlikndeal`;
    const description = `${specSummary}${listing.description?.substring(0, 120) || "מצא את הציוד הטכנולוגי שחיפשת במרקטפלייס Qlikndeal"}`;
    const ogImageUrl = `${BASE_URL}/api/og/listing/${params.id}`;
    const pageUrl = `${BASE_URL}/listing/${params.id}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: "Qlikndeal",
            type: "website",
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: listing.title }]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImageUrl]
        }
    };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function PublicListingPage({ params }: { params: { id: string } }) {
    const listing = await prismadb.marketplaceListing.findUnique({
        where: { id: params.id, status: "ACTIVE" },
        include: {
            seller: {
                select: { firstName: true, lastName: true, city: true, imageUrl: true, createdAt: true }
            }
        }
    }).catch(() => null);

    if (!listing) notFound();

    const images: string[] = JSON.parse(listing.images || "[]");
    const mainImage = images[0] || null;
    const extraData = listing.extraData ? JSON.parse(listing.extraData) : {};

    // Parse specs
    const specs: { key: string; value: string }[] = [];
    if (Array.isArray(extraData)) {
        extraData.forEach((item: any) => {
            if (item.key && item.value && item.key !== "דגשים" && item.key !== "טלפון ליצירת קשר") {
                specs.push({ key: item.key, value: item.value });
            }
        });
    } else {
        Object.entries(extraData).forEach(([k, v]) => {
            if (k !== "דגשים" && k !== "טלפון ליצירת קשר" && v) {
                specs.push({ key: k, value: String(v) });
            }
        });
    }

    const conditionLabel =
        listing.condition === "New" ? "חדש באריזה" :
        listing.condition === "Like New" ? "כמו חדש" :
        listing.condition === "Used" ? "משומש" : listing.condition;

    const fullListingUrl = `/dashboard/marketplace/${listing.id}`;

    return (
        <div className="min-h-screen bg-[#07071a] text-white pb-32" dir="rtl">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
            </div>

            {/* Minimal top bar */}
            <nav className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-black">Q</span>
                    </div>
                    <span className="font-black text-white text-base">Qlikndeal</span>
                </div>
                <Link
                    href={fullListingUrl}
                    className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    <span>כניסה לאתר</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
            </nav>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">

                {/* Product Hero Card */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl mb-6">
                    {/* Main Image */}
                    {mainImage && (
                        <div className="aspect-[16/9] w-full relative overflow-hidden">
                            <img
                                src={mainImage}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Condition badge overlay */}
                            <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                {conditionLabel}
                            </div>
                        </div>
                    )}

                    <div className="p-6 sm:p-8">
                        {/* Category */}
                        {listing.category && (
                            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">
                                {listing.category}
                            </span>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-4 leading-tight">
                            {listing.title}
                        </h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-black text-emerald-400 font-mono">
                                ₪{Number(listing.price).toLocaleString()}
                            </span>
                            {listing.seller?.city && (
                                <span className="flex items-center gap-1 text-sm text-gray-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {listing.seller.city}
                                </span>
                            )}
                        </div>

                        {/* CTA Button — Primary */}
                        <Link
                            href={fullListingUrl}
                            className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl text-center transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] active:scale-95 mb-3"
                        >
                            🤝 לזירת סחר ומשא ומתן
                        </Link>
                        <Link
                            href={fullListingUrl}
                            className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium text-base rounded-2xl text-center transition-all"
                        >
                            צפה בפרטים המלאים באתר
                        </Link>
                    </div>
                </div>

                {/* Tech Specs Card */}
                {specs.length > 0 && (
                    <div className="bg-gray-900/50 border border-white/10 rounded-3xl overflow-hidden mb-6">
                        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="font-bold text-white">מפרט טכני</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {specs.slice(0, 8).map(({ key, value }) => (
                                <div key={key} className="flex justify-between items-center px-6 py-3">
                                    <span className="text-gray-400 text-sm">{key}</span>
                                    <span className="text-white text-sm font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                {listing.description && (
                    <div className="bg-gray-900/40 border border-white/8 rounded-3xl p-6 mb-6">
                        <h2 className="font-bold text-white mb-3">תיאור המוצר</h2>
                        <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                            {listing.description}
                        </p>
                    </div>
                )}

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                            <div className="text-xs font-bold text-emerald-300">הגנת רוכש</div>
                            <div className="text-xs text-gray-500">עסקה מאובטחת</div>
                        </div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <Truck className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                            <div className="text-xs font-bold text-blue-300">משלוח זמין</div>
                            <div className="text-xs text-gray-500">לכל הארץ</div>
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                {listing.seller && (
                    <div className="bg-gray-900/40 border border-white/8 rounded-3xl p-5 mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-black text-lg shrink-0">
                            {listing.seller.firstName?.charAt(0) || "?"}
                        </div>
                        <div>
                            <div className="font-bold text-white">
                                {listing.seller.firstName} {listing.seller.lastName}
                            </div>
                            <div className="text-xs text-gray-400">
                                חבר מאז {new Date(listing.seller.createdAt).getFullYear()}
                                {listing.seller.city && ` • ${listing.seller.city}`}
                            </div>
                        </div>
                        <div className="mr-auto">
                            <div className="flex items-center gap-1 text-xs text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5" />
                                מאומת
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#07071a]/95 backdrop-blur-xl border-t border-white/10">
                    <Link
                        href={fullListingUrl}
                        className="block w-full max-w-3xl mx-auto py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl text-center transition-all shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95"
                    >
                        כניסה למודעה המלאה באתר ➔
                    </Link>
                </div>
            </div>
        </div>
    );
}
