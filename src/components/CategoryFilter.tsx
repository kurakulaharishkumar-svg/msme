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
                        "whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200",
                        activeCategory === category
                            ? "bg-primary-600 text-white shadow-premium"
                            : "bg-white text-gray-600 border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50"
                    )}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
