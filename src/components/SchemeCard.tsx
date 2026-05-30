"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SchemeCardProps {
    scheme: {
        id: string;
        name: string;
        description: string;
        tags: string[];
        category: string;
        max_amount: string;
    };
    featured?: boolean;
}

export default function SchemeCard({ scheme, featured }: SchemeCardProps) {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-full"
        >
            <Link
                href={`/scheme/${scheme.id}`}
                className={cn(
                    "group relative flex flex-col h-full overflow-hidden rounded-[2rem] glass p-8 transition-all duration-300 hover:shadow-premium hover:border-primary-300/60 block",
                    featured && "border-primary-300/50 bg-gradient-to-br from-white to-primary-50/80 shadow-md"
                )}
            >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    {featured && (
                        <div className="absolute top-0 right-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-bl-[2rem] rounded-tr-[2rem] bg-accent-100/80 text-accent-600 shadow-sm border-b border-l border-accent-200/50 backdrop-blur-sm">
                                <Star className="h-4 w-4 fill-accent-500" />
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <span className="inline-flex items-center rounded-full bg-primary-100/80 px-4 py-1.5 text-xs font-bold text-primary-800 shadow-sm border border-primary-200/50">
                            {scheme.category}
                        </span>
                    </div>

                    <h3 className="mb-4 text-[1.35rem] leading-snug font-extrabold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-700 group-hover:to-accent-600 transition-all line-clamp-2">
                        {scheme.name}
                    </h3>

                    <p className="mb-8 flex-grow text-[0.95rem] leading-relaxed text-gray-500 font-medium line-clamp-3">
                        {scheme.description}
                    </p>

                    <div className="mb-8 flex flex-wrap gap-2">
                        {scheme.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center rounded-lg bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 border border-gray-200/60 shadow-sm transition-colors group-hover:border-primary-200/50"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100/80 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1.5">Max Benefit</p>
                            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">{scheme.max_amount}</p>
                        </div>

                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm border border-gray-100 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-primary-500 group-hover:text-white group-hover:shadow-glow group-hover:scale-110 group-hover:border-transparent">
                            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
