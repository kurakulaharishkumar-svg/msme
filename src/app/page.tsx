"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import SchemeCard from "@/components/SchemeCard";
import CategoryFilter from "@/components/CategoryFilter";
import schemesData from "@/data/schemes.json";
import { ArrowRight, Sparkles, Search, Filter, Building2, Banknote, HelpCircle, Users, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Define a type for the scheme data for better type safety
interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  max_amount: string;
  // Add other properties if they exist in schemes.json
}

export default function Home() {
  const featuredSchemes: Scheme[] = schemesData.slice(0, 4);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort schemesData if needed, otherwise just use it directly
  const sortedSchemes: Scheme[] = [...schemesData].sort((a, b) => {
    // Example: Sort alphabetically by name
    // return a.name.localeCompare(b.name);
    // For now, no specific sorting, maintain original order
    return 0;
  });

  const filteredSchemes: Scheme[] = sortedSchemes.filter((scheme: Scheme) => {
    // 1. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    const matchesName = scheme.name.toLowerCase().includes(query);
    const matchesTags = scheme.tags.some((tag: string) => tag.toLowerCase().includes(query));

    if (query !== "" && !matchesName && !matchesTags) {
      return false; // If there's a search query and it doesn't match, filter it out
    }

    // 2. Category Filter
    // If we're on "All", exclude the featured schemes to avoid duplication
    if (activeCategory === "All") {
      return !featuredSchemes.some(fs => fs.id === scheme.id);
    }

    // For specific categories, filter the entire schemes list
    // The original logic had specific checks for tags for some categories.
    // Let's generalize this based on the category property first, and then tags if needed.
    const matchesCategory = scheme.category === activeCategory ||
      (activeCategory === "Subsidies" && scheme.tags.includes("subsidy")) ||
      (activeCategory === "Grants" && scheme.tags.includes("grant")) ||
      (activeCategory === "Women Entrepreneurs" && scheme.tags.includes("women")) ||
      (activeCategory === "Manufacturing" && scheme.tags.includes("manufacturing")) ||
      (activeCategory === "Startups" && scheme.tags.includes("startup"));

    return matchesCategory;
  });

  useEffect(() => {
    if (window.location.hash === "#explore-schemes") {
      setTimeout(() => {
        document.getElementById("explore-schemes")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <HeroSection />

      {/* Featured Schemes - Horizontal Scroll */}
      <section className="py-20 overflow-hidden bg-white/50 backdrop-blur-sm border-y border-gray-100/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <Sparkles size={20} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Featured Opportunities</h2>
            </div>
            <button className="flex items-center gap-2 text-primary-600 font-semibold text-sm hover:underline group">
              View all featured
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredSchemes.map((scheme: Scheme) => (
              <div key={scheme.id} className="min-w-[320px] md:min-w-[400px]">
                <SchemeCard scheme={scheme} featured />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Schemes Section - Grid */}
      <section id="explore-schemes" className="py-24 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Explore All Schemes</h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <div className="relative group min-w-[300px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search schemes by name or tag..."
                  className="w-full h-12 rounded-full border border-gray-100 bg-white pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-soft transition-all group-focus-within:border-primary-100"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSchemes.length > 0 ? (
              filteredSchemes.map((scheme: Scheme, index: number) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/scheme/${scheme.id}`} className="group block h-full">
                    <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col h-full border border-gray-100 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden">
                      {/* Hover Gradient Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                            {scheme.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {scheme.name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-3">
                          {scheme.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {scheme.tags.slice(0, 3).map((tag: any) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Up to</span>
                            <span className="font-bold text-gray-900">
                              {scheme.max_amount}
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-500">No schemes found for this category.</p>
              </div>
            )}
          </div>

          {/* "Load More" mockup - Currently statically mapped but conditionally rendered */}
          {filteredSchemes.length > 6 && (
            <div className="mt-20 text-center">
              <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-10 py-4 text-sm font-bold text-gray-700 shadow-soft transition-all hover:bg-gray-50 active:scale-95">
                Load More Schemes
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-primary-900 overflow-hidden px-12 py-20 text-center shadow-premium">
            <div className="absolute inset-0 bg-primary-600 opacity-20 pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary-500/30 blur-3xl"></div>
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"></div>

            <h2 className="relative mb-6 text-4xl font-bold text-white md:text-5xl">Ready to take your business to the next level?</h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-lg text-primary-100 leading-relaxed">
              Find the perfect scheme that matches your business needs.
              Our eligibility engine will guide you through the process step-by-step.
            </p>
            <div className="relative mt-12">
              <button className="rounded-full bg-white px-10 py-4 text-base font-bold text-primary-900 shadow-lg transition-all hover:bg-primary-50 hover:scale-105 active:scale-95">
                Check Eligibility Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
