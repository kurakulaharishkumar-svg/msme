"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Zap, Star } from "lucide-react";
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
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "group relative flex flex-col h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-soft transition-all hover:shadow-premium hover:border-primary-100",
                featured && "border-primary-100 bg-primary-50/30"
            )}
        >
            {featured && (
                <div className="absolute top-0 right-0 p-4">
                    <Star className="h-5 w-5 fill-primary-400 text-primary-400" />
                </div>
            )}

            <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                    {scheme.category}
                </span>
            </div>

            <h3 className="mb-2 text-xl font-bold leading-tight text-gray-900 group-hover:text-primary-600 transition-colors">
                {scheme.name}
            </h3>

            <p className="mb-6 flex-grow text-sm leading-relaxed text-gray-600">
                {scheme.description}
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
                {scheme.tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border border-gray-100"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-medium uppercase text-gray-400">Max Benefit</p>
                    <p className="text-lg font-bold text-primary-700">{scheme.max_amount}</p>
                </div>

                <Link
                    href={`/scheme/${scheme.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-primary-600 group-hover:text-white"
                >
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </motion.div>
    );
}
