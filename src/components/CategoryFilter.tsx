"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
    "All",
    "Loans",
    "Subsidies",
    "Grants",
    "Women Entrepreneurs",
    "Manufacturing",
    "Startups"
];

export default function CategoryFilter({
    activeCategory,
    onCategoryChange
}: {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}) {
    return (
        <div className="flex w-full items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={cn(
                        "whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300",
                        activeCategory === category
                            ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-premium ring-4 ring-primary-500/20 scale-105"
                            : "bg-white/60 backdrop-blur-md text-gray-600 hover:text-primary-600 border border-white/40 hover:border-primary-200 hover:bg-white hover:shadow-sm"
                    )}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}

