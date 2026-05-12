"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Settings, Menu, X, Store, LayoutDashboard, UserPlus } from "lucide-react";
import { useState } from "react";

// Admin emails — users who see the Admin panel link
const ADMIN_EMAILS = ["yalgawi@gmail.com", "darohadd@walla.com", "itay@qlikndeal.com", "dpccomp@gmail.com", "soferfamily41@gmail.com"];

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="hover:opacity-90 transition-opacity shrink-0" onClick={() => setMobileOpen(false)}>
                    <Logo />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white font-bold text-base">
                            מרקטפלייס
                        </Button>
                    </Link>
                    <Link href="/provider/register">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            הצטרף כמקצוען
                        </Button>
                    </Link>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="default" size="sm" className="font-bold">
                                כניסה לאזור האישי
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <AdminLink />
                        <DashboardLink />
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>

                {/* Mobile Right: UserButton + Hamburger */}
                <div className="flex md:hidden items-center gap-3">
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="default" size="sm" className="font-bold text-xs px-3">
                                כניסה
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <button
                        onClick={() => setMobileOpen(prev => !prev)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                        aria-label="תפריט"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Slide-down Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    <MobileNavLink href="/" icon={<Store className="w-4 h-4" />} label="מרקטפלייס" onClick={() => setMobileOpen(false)} />
                    <SignedIn>
                        <MobileNavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="אזור אישי" onClick={() => setMobileOpen(false)} />
                        <MobileAdminLink onClose={() => setMobileOpen(false)} />
                    </SignedIn>
                    <MobileNavLink href="/provider/register" icon={<UserPlus className="w-4 h-4" />} label="הצטרף כמקצוען" onClick={() => setMobileOpen(false)} />
                </div>
            )}
        </nav>
    );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all font-medium text-base"
        >
            <span className="text-gray-500">{icon}</span>
            {label}
        </Link>
    );
}

function MobileAdminLink({ onClose }: { onClose: () => void }) {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress || "";
    if (!ADMIN_EMAILS.includes(email)) return null;
    return (
        <MobileNavLink href="/admin" icon={<Settings className="w-4 h-4" />} label="Admin" onClick={onClose} />
    );
}

function AdminLink() {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress || "";
    if (!ADMIN_EMAILS.includes(email)) return null;

    return (
        <Link href="/admin" title="Admin Panel">
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Admin
            </Button>
        </Link>
    );
}

function DashboardLink() {
    const pathname = usePathname();
    if (pathname === "/dashboard") return null;

    return (
        <Link href="/dashboard" className="mr-2">
            <Button variant="ghost" size="sm" className="font-semibold">
                לאזור האישי
            </Button>
        </Link>
    );
}
