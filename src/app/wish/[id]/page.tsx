import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Radar, Target, Zap, MessageSquare, Plus, ArrowRight } from 'lucide-react';

const prisma = new PrismaClient();

const getCategoryBanner = (cat: string) => {
    switch(cat) {
        case "מחשבים ניידים": return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200";
        case "מחשבים שולחניים": return "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=1200";
        case "טלפונים סלולריים": return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1200";
        default: return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200";
    }
}

export default async function WishPage({ params }: { params: { id: string } }) {
    const request = await prisma.buyerRequest.findUnique({
        where: { id: params.id },
        include: { user: true }
    });

    if (!request) {
        notFound();
    }

    const userName = request.user?.firstName || "קונה רציני";
    
    let extraData: any = {};
    try {
        if (request.extraData) extraData = JSON.parse(request.extraData);
    } catch(e) {}

    const category = extraData.category || "כללי";
    const budgetRange = extraData.budgetRange || [0, extraData.budget || 0];
    const chips = extraData.chips || [];
    const bannerUrl = getCategoryBanner(category);

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden" dir="rtl">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/80 to-[#050505] z-10" />
                <img src={bannerUrl} alt="Category" className="w-full h-[60vh] object-cover opacity-30 blur-[2px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 py-12 md:py-20 flex flex-col items-center">
                
                {/* Logo / Badge */}
                <div className="flex items-center gap-2 mb-12">
                    <Radar className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="text-2xl font-black tracking-widest text-white drop-shadow-md">Qlik<span className="text-cyan-400">ndeal</span></span>
                </div>

                {/* Main Radar Card */}
                <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(34,211,238,0.1)] mb-12 relative group">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="px-4 py-1 rounded-full bg-cyan-950/50 border border-cyan-400/30 text-cyan-400 text-sm font-bold tracking-wide flex items-center gap-2">
                            <Target className="w-4 h-4" /> סוכן חיפוש פעיל
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-center leading-tight mb-6">
                        {userName} מחפש לקנות <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                            {request.query}
                        </span>
                    </h1>

                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {category !== "כללי" && (
                            <div className="bg-[#111] border border-gray-800 px-5 py-2.5 rounded-xl font-bold text-gray-300">
                                {category}
                            </div>
                        )}
                        {(budgetRange[0] > 0 || budgetRange[1] > 0) && (
                            <div className="bg-cyan-950/30 border border-cyan-500/30 px-5 py-2.5 rounded-xl font-mono text-xl font-black text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]">
                                תקציב: ₪{budgetRange[0].toLocaleString()} - ₪{budgetRange[1].toLocaleString()}
                            </div>
                        )}
                    </div>

                    {chips.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {chips.map((chip: string) => (
                                <span key={chip} className="px-4 py-1.5 rounded-full border border-gray-700 bg-black/50 text-gray-400 text-sm font-bold">
                                    {chip}
                                </span>
                            ))}
                        </div>
                    )}

                    {extraData.details && (
                        <div className="bg-[#050505] p-6 rounded-2xl border border-gray-800 mb-8 max-w-2xl mx-auto">
                            <p className="text-gray-300 text-center leading-relaxed">
                                "{extraData.details}"
                            </p>
                        </div>
                    )}

                    {/* Dual Conversion Hook */}
                    <div className="flex flex-col items-center gap-6 mt-10">
                        <Link href={`/dashboard/marketplace`} className="w-full max-w-sm group">
                            <button className="w-full relative h-16 bg-black border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-950 text-xl font-black rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_#22d3ee] transition-all active:scale-95 overflow-hidden flex items-center justify-center gap-3">
                                <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.3),transparent)] -translate-x-[150%] group-hover:translate-x-[150%] duration-1000 ease-in-out" />
                                <MessageSquare className="w-6 h-6 drop-shadow-[0_0_8px_#22d3ee]" /> יש לי כזה - צור קשר
                            </button>
                        </Link>
                        
                        <p className="text-gray-500 text-sm font-bold mt-2">
                            רוצה להגיע לעוד קונים? <Link href="/dashboard/marketplace/create" className="text-cyan-400 hover:underline">פרסם מודעה ב-30 שניות!</Link>
                        </p>
                    </div>
                </div>

                {/* Secondary CTA for New Users */}
                <div className="text-center bg-[#0a0a0a]/50 backdrop-blur-md p-8 rounded-3xl border border-gray-800/50 max-w-2xl w-full">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                    <h2 className="text-2xl font-bold text-white mb-2">מחפש משהו אחר?</h2>
                    <p className="text-gray-400 mb-6">צור לעצמך סוכן ראדאר חכם שייסרוק עבורך את הרשת.</p>
                    <Link href="/dashboard/marketplace/my-requests" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors">
                        <Plus className="w-5 h-5" /> הפעל סוכן אישי עכשיו
                    </Link>
                </div>

            </div>
        </main>
    );
}
