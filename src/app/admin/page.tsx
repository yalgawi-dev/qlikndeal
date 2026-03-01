import prismadb from "@/lib/prismadb";
import { Users, ShoppingBag, Truck, CheckCircle, CheckSquare, StickyNote, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    // Note: Add auth check for Admin here when ready.

    // Fetch Stats
    const totalUsers = await prismadb.user.count();
    const totalListings = await prismadb.marketplaceListing.count();
    const totalShipments = await prismadb.shipment.count();
    const activeListings = await prismadb.marketplaceListing.count({ where: { status: 'ACTIVE' } });

    // Recent logs
    const recentLogs = await prismadb.parserLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    const stats = [
        { title: "סה״כ משתמשים", value: totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
        { title: "סה״כ מודעות", value: totalListings, icon: ShoppingBag, color: "text-purple-400", bg: "bg-purple-500/10" },
        { title: "מודעות פעילות", value: activeListings, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "משלוחים/עסקאות", value: totalShipments, icon: Truck, color: "text-orange-400", bg: "bg-orange-500/10" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8" dir="rtl">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl font-bold mb-2">סקירה כללית</h1>
                    <p className="text-gray-400">ברוך הבא למערכת הניהול של Qlikndeal.</p>
                </div>
                <Link href="/admin/export" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20">
                    <FileSpreadsheet size={20} />
                    ייצוא נתונים (אקסל)
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                                <div className={`p-2 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions & Recent Activity grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* AI Logs Quick View */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold inline-flex items-center gap-2">
                            <span className="text-purple-400">🧠</span> למידת ה-AI האחרונה
                        </h2>
                        <Link href="/admin/parser-logs" className="text-sm text-indigo-400 hover:text-indigo-300">
                            צפה בהכל
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentLogs.map(log => (
                            <div key={log.id} className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col gap-1">
                                <div className="text-sm line-clamp-1">{log.originalText}</div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>{new Date(log.createdAt).toLocaleDateString("he-IL")}</span>
                                    {log.quality ? (
                                        <span className={log.quality === 'good' ? 'text-emerald-400' : 'text-red-400'}>
                                            {log.quality}
                                        </span>
                                    ) : <span>טרם נבדק</span>}
                                </div>
                            </div>
                        ))}
                        {recentLogs.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">אין נתונים</p>
                        )}
                    </div>
                </div>

                {/* System Tasks & Collaboration */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-6">ניהול ושיתוף פעולה</h2>

                    <div className="space-y-3">
                        <Link href="/admin/tasks" className="flex items-center justify-between p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                    <CheckSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">יומן משימות צוות</p>
                                    <p className="text-xs text-gray-400">נהל משימות פתוחות ועדכונים</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/notes" className="flex items-center justify-between p-4 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 rounded-2xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                    <StickyNote className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">הערות וסיכומי צוות</p>
                                    <p className="text-xs text-gray-400">מרחב משותף לתיעוד ורעיונות</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/export" className="flex items-center justify-between p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">ייצוא מאגרי נתונים</p>
                                    <p className="text-xs text-gray-400">הורד את רשימות המחשבים והטלפונים לאקסל</p>
                                </div>
                            </div>
                        </Link>

                        <div className="pt-2 border-t border-white/5 mt-2">
                            <Link href="/admin/listings" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 text-gray-400 rounded-lg">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">ניהול מודעות</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/users" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 text-gray-400 rounded-lg">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">ניהול משתמשים</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
