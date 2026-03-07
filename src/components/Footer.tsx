"use client";

import { motion } from "framer-motion";
import { ChevronRight, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-gray-100 bg-white pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
                    <div className="md:col-span-1 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-premium">
                                <span className="text-sm font-bold">MN</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-gray-900">
                                MSME<span className="text-primary-600">Navigator</span>
                            </span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-gray-500 mb-6">
                            Empowering India&apos;s MSMEs with direct access to government schemes, funding, and growth opportunities.
                            Modern fintech solutions for the backbone of our economy.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Facebook, Github].map((Icon, i) => (
                                <Link key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-400 transition-colors hover:border-primary-100 hover:text-primary-600">
                                    <Icon className="h-5 w-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">Platforms</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">Scheme Explorer</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">Eligibility Engine</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">Grant Management</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">API for Startups</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">Contact</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900">Contact</h4>
                        <div className="space-y-4 text-sm text-gray-500">
                            <p>support@msmenavigator.in</p>
                            <p>+91 (800) 123-4567</p>
                            <p>Mumbai, Maharashtra, India</p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-gray-50 pt-8 text-center text-xs text-gray-400">
                    <p>© {new Date().getFullYear()} MSME Navigator Private Limited. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
