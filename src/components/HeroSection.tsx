"use client";

import { motion } from "framer-motion";
import { ChevronRight, Search, Play, Users, Briefcase, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32">
            {/* Background patterns */}
            <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary-50/50 blur-3xl opacity-60"></div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 mb-6">
                            <span className="mr-2 flex h-2 w-2 rounded-full bg-primary-500"></span>
                            Democratizing government scheme access
                        </span>

                        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
                            Discover the Best <span className="text-primary-600">MSME Schemes</span> in India
                        </h1>

                        <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-600">
                            We help Indian micro, small, and medium enterprises find the right funding,
                            subsidies, and grants to scale their business to new heights.
                        </p>

                        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button
                                onClick={() => {
                                    document.getElementById('explore-schemes')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex items-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-lg font-bold text-white shadow-premium transition-all hover:bg-primary-700 hover:scale-105 active:scale-95"
                            >
                                Explore Schemes
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <Link href="/eligibility">
                                <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95">
                                    Check Eligibility
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats / Trust items */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4"
                    >
                        {[
                            { label: "Active Schemes", value: "100+", icon: Briefcase },
                            { label: "MSMEs Assisted", value: "50K+", icon: Users },
                            { label: "Total Funding Disbursed", value: "₹500Cr+", icon: TrendingUp },
                            { label: "Success Rate", value: "92%", icon: Play },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft mb-4">
                                    <stat.icon className="h-6 w-6 text-primary-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 uppercase tracking-wide">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
