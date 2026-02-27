"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Info, LayoutDashboard, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    const handleExplorerClick = () => {
        if (pathname === "/") {
            document.getElementById("explore-schemes")?.scrollIntoView({ behavior: "smooth" });
        } else {
            router.push("/#explore-schemes");
        }
        setIsOpen(false);
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-premium transition-transform group-hover:scale-105">
                            <LayoutDashboard size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            MSME<span className="text-primary-600">Navigator</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex md:items-center md:gap-8">
                    <button onClick={handleExplorerClick} className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600">
                        Explorer
                    </button>
                    <Link href="/eligibility" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600">
                        Check Eligibility
                    </Link>

                    <div className="h-4 w-[1px] bg-gray-200"></div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="flex items-center gap-2 group">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-200 transition-colors">
                                    <User size={18} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user.email?.split('@')[0]}</span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-accent-600 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-premium transition-all hover:bg-primary-700 hover:shadow-lg active:scale-95">
                                Log In
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="flex md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-2 pt-2 pb-3 space-y-1">
                    <button onClick={handleExplorerClick} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Explorer
                    </button>
                    <Link href="/eligibility" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Check Eligibility
                    </Link>

                    {user ? (
                        <>
                            <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                                Profile
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-accent-600 hover:bg-accent-50"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 font-bold">
                            Log In
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
