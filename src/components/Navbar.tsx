"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Info, LayoutDashboard, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import LanguageSelector from "./LanguageSelector";
import { motion } from "framer-motion";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled ? "glass border-b border-white/40 shadow-soft py-2" : "bg-transparent py-4"
            )}
        >
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-glow transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                            <LayoutDashboard size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                            MSME<span className="text-primary-600">Navigator</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex md:items-center md:gap-8 bg-white/50 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/60 shadow-sm">
                    <LanguageSelector />
                    <button onClick={handleExplorerClick} className="text-sm font-semibold text-gray-600 transition-all hover:text-primary-600 hover:scale-105 active:scale-95">
                        Explorer
                    </button>
                    <Link href="/eligibility" className="text-sm font-semibold text-gray-600 transition-all hover:text-primary-600 hover:scale-105 active:scale-95">
                        Check Eligibility
                    </Link>
                </div>

                <div className="hidden md:flex md:items-center">
                    {user ? (
                        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md pl-2 pr-4 py-2 rounded-full border border-white/60 shadow-sm">
                            <Link href="/profile" className="flex items-center gap-3 group">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 group-hover:scale-105 group-hover:shadow-md transition-all">
                                    <User size={18} />
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors">{user.email?.split('@')[0]}</span>
                            </Link>
                            <div className="h-5 w-[1px] bg-gray-300/50"></div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 p-2 text-sm font-medium text-gray-500 hover:text-accent-600 hover:bg-red-50 rounded-full transition-all"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button className="rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-7 py-2.5 text-sm font-bold text-white shadow-glow transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                                Log In
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="flex md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-500 bg-white/50 backdrop-blur-md border border-white/60 shadow-sm hover:bg-white hover:text-primary-600 transition-all"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden glass border-t border-white/40 px-4 pt-4 pb-6 mt-2 rounded-b-3xl shadow-premium absolute w-full"
                >
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="w-full pb-2">
                            <LanguageSelector />
                        </div>
                        <button onClick={handleExplorerClick} className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all">
                            Explorer
                        </button>
                        <Link href="/eligibility" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all">
                            Check Eligibility
                        </Link>

                        {user ? (
                            <div className="w-full pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2">
                                <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50/50 hover:bg-primary-50 text-gray-800 transition-all">
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                        <User size={16} />
                                    </div>
                                    <span className="font-bold">{user.email?.split('@')[0]}</span>
                                </Link>
                                <button
                                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-bold text-accent-600 hover:bg-accent-50 transition-all"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center mt-4">
                                <button className="w-full rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-base font-bold text-white shadow-glow hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all">
                                    Log In
                                </button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
}
