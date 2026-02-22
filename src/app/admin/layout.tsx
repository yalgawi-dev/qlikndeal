"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Users, Menu, X, ArrowLeft, Bot } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const routes = [
        { name: "סקירה כללית", href: "/admin", icon: LayoutDashboard },
        { name: "ניהול מודעות", href: "/admin/listings", icon: ShoppingBag },
        { name: "ניהול משתמשים", href: "/admin/users", icon: Users },
        { name: "למידת AI", href: "/admin/parser-logs", icon: Bot },
    ];

    return (
        <div className="min-h-screen bg-[#080812] text-white flex" dir="rtl">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-black/40 border-l border-white/5 h-screen sticky top-0">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        Admin Qlikndeal
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {routes.map((route) => {
                        const Icon = route.icon;
                        const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== "/admin");

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{route.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm px-4 py-2">
                        <ArrowLeft className="w-4 h-4" />
                        חזרה לחשבון שלי
                    </Link>
                </div>
            </aside>

            {/* Mobile Header & Overlay */}
            <div className={`md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileOpen(false)} />

            <aside className={`md:hidden fixed top-0 right-0 z-50 h-screen w-64 bg-[#0a0a14] border-l border-white/10 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h1 className="text-xl font-bold text-white">תפריט ניהול</h1>
                    <button onClick={() => setIsMobileOpen(false)}>
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {routes.map((route) => {
                        const Icon = route.icon;
                        const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== "/admin");

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{route.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Areas */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Bar */}
                <header className="md:hidden flex items-center justify-between p-4 bg-black/20 border-b border-white/5 sticky top-0 z-30 backdrop-blur-md">
                    <div className="font-bold text-indigo-400">Admin</div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10">
                            יציאה
                            <ArrowLeft className="w-3 h-3" />
                        </Link>
                        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Desktop Top Bar */}
                <header className="hidden md:flex items-center justify-end p-4 bg-black/20 border-b border-white/5 sticky top-0 z-30 backdrop-blur-md">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition-colors border border-indigo-500/20 text-sm font-medium">
                        חזרה לאפליקציה (יציאה מניהול)
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
