"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Play, Users, Briefcase, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 800], [0, 200]);
    const y2 = useTransform(scrollY, [0, 800], [0, -200]);

    return (
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
            {/* Dynamic Background Orbs */}
            <motion.div style={{ y: y1 }} className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-300/30 blur-[100px] opacity-70 animate-pulse-slow"></motion.div>
            <motion.div style={{ y: y2 }} className="absolute top-40 right-1/4 -z-10 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-accent-300/20 blur-[120px] opacity-60"></motion.div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="inline-flex items-center rounded-full glass border-primary-200 px-4 py-1.5 text-sm font-bold text-primary-700 mb-8 shadow-sm">
                            <span className="mr-2.5 flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                            </span>
                            Democratizing government scheme access
                        </span>

                        <h1 className="mx-auto max-w-5xl text-6xl font-extrabold tracking-tight text-gray-900 sm:text-8xl leading-tight">
                            Discover the Best <br />
                            <span className="text-gradient">MSME Schemes</span>
                        </h1>

                        <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-600 font-medium">
                            We help Indian micro, small, and medium enterprises find the right funding,
                            subsidies, and grants to scale their business to new heights.
                        </p>

                        <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">
                            <button
                                onClick={() => {
                                    document.getElementById('explore-schemes')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-10 py-4 text-lg font-bold text-white shadow-glow transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-1 active:translate-y-0"
                            >
                                Explore Schemes
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <Link href="/eligibility">
                                <button className="flex items-center gap-2 rounded-full glass border-gray-200 px-10 py-4 text-lg font-bold text-gray-700 transition-all duration-300 hover:bg-gray-50/50 hover:border-gray-300 hover:-translate-y-1 active:translate-y-0 shadow-sm hover:shadow-md">
                                    Check Eligibility
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats / Trust items with stagger effect */}
                    <div className="mt-28 grid grid-cols-2 gap-8 md:grid-cols-4">
                        {[
                            { label: "Active Schemes", value: "100+", icon: Briefcase },
                            { label: "MSMEs Assisted", value: "50K+", icon: Users },
                            { label: "Total Funding Disbursed", value: "₹500Cr+", icon: TrendingUp },
                            { label: "Success Rate", value: "92%", icon: Play },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + (i * 0.1), duration: 0.5 }}
                                className="flex flex-col items-center glass rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-premium group"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon className="h-7 w-7" />
                                </div>
                                <p className="text-3xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{stat.value}</p>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
