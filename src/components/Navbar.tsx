"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Settings } from "lucide-react";

// Admin emails — users who see the Admin panel link
const ADMIN_EMAILS = ["yalgawi@gmail.com", "itay@qlikndeal.com"];

export function Navbar() {
    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
                <Link href="/" className="hover:opacity-90 transition-opacity">
                    <Logo />
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/trust-link">
                        <Button variant="glass" size="sm" className="hidden sm:inline-flex">
                            צור לינק בטוח
                        </Button>
                    </Link>
                    <Link href="/provider/register" className="hidden md:block">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            הצטרף כמקצוען
                        </Button>
                    </Link>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="default" size="sm">
                                כניסה
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <AdminLink />
                        <DashboardLink />
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}

function AdminLink() {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress || "";
    if (!ADMIN_EMAILS.includes(email)) return null;

    return (
        <Link href="/admin/parser-logs" title="Admin Panel">
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
            <Button variant="ghost" size="sm">
                לוח בקרה
            </Button>
        </Link>
    );
}
