"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";


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
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="default" size="sm">
                                כניסה
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <DashboardLink />
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </nav>
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
