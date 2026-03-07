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
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Link
                href={`/scheme/${scheme.id}`}
                className={cn(
                    "group relative flex flex-col h-full overflow-hidden rounded-3xl glass p-7 transition-all duration-300 hover:shadow-premium hover:border-primary-200/50 block",
                    featured && "border-primary-200/50 bg-gradient-to-br from-white/80 to-primary-50/50"
                )}
            >
                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col h-full">
                    {featured && (
                        <div className="absolute top-0 right-0 p-1">
                            <Star className="h-6 w-6 fill-accent-400 text-accent-400 drop-shadow-sm" />
                        </div>
                    )}

                    <div className="mb-5">
                        <span className="inline-flex items-center rounded-full bg-primary-100/80 px-3 py-1 text-xs font-bold text-primary-700 shadow-sm border border-primary-200/30">
                            {scheme.category}
                        </span>
                    </div>

                    <h3 className="mb-3 text-2xl font-extrabold leading-tight text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-700 group-hover:to-accent-600 transition-all line-clamp-2">
                        {scheme.name}
                    </h3>

                    <p className="mb-6 flex-grow text-sm leading-relaxed text-gray-500 font-medium line-clamp-3">
                        {scheme.description}
                    </p>

                    <div className="mb-7 flex flex-wrap gap-2">
                        {scheme.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center rounded-lg bg-gray-100/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-600 border border-gray-200/50"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-1">Max Benefit</p>
                            <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">{scheme.max_amount}</p>
                        </div>

                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-primary-500 group-hover:text-white group-hover:shadow-md group-hover:scale-110">
                            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
