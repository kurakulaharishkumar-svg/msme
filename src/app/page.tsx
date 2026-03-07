"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import SchemeCard from "@/components/SchemeCard";
import CategoryFilter from "@/components/CategoryFilter";
import schemesData from "@/data/schemes.json";
import { ArrowRight, Sparkles, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  max_amount: string;
}

export default function Home() {
  const featuredSchemes: Scheme[] = schemesData.slice(0, 4);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedSchemes: Scheme[] = [...schemesData];

  const filteredSchemes: Scheme[] = sortedSchemes.filter((scheme: Scheme) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesName = scheme.name.toLowerCase().includes(query);
    const matchesTags = scheme.tags.some((tag: string) => tag.toLowerCase().includes(query));

    if (query !== "" && !matchesName && !matchesTags) {
      return false;
    }

    if (activeCategory === "All") {
      return !featuredSchemes.some(fs => fs.id === scheme.id);
    }

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
    <main className="min-h-screen bg-[#f8fafc] relative selection:bg-primary-200">
      <Navbar />

      <HeroSection />

      {/* Featured Schemes - Horizontal Scroll */}
      <section className="py-24 overflow-hidden relative border-y border-white/40">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl"></div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 h-64 w-[30%] bg-primary-200/20 blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-100 to-accent-200 text-accent-600 shadow-sm border border-white/50">
                <Sparkles size={28} />
              </div>
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600">
                  Featured Opportunities
                </h2>
                <p className="mt-2 text-gray-500 font-medium">Handpicked grants and subsidies just for you.</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-primary-600 font-bold text-sm hover:text-primary-800 transition-colors group px-4 py-2 rounded-full hover:bg-primary-50">
              View all featured
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </button>
          </motion.div>

          <div className="flex gap-8 overflow-x-auto pb-8 pt-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-4 snap-x snap-mandatory">
            {featuredSchemes.map((scheme: Scheme, index) => (
              <motion.div
                key={scheme.id}
                className="min-w-[340px] md:min-w-[420px] snap-center"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <SchemeCard scheme={scheme} featured />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Schemes Section - Grid */}
      <section id="explore-schemes" className="py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-16"
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-8">Explore All Schemes</h2>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 glass p-4 rounded-3xl">
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <div className="relative group w-full lg:min-w-[350px] lg:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search schemes by name or tag..."
                  className="w-full h-14 rounded-2xl border-2 border-transparent bg-gray-50/50 pl-14 pr-6 text-base font-medium focus:outline-none focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-primary-100/50 shadow-sm transition-all text-gray-800 placeholder:text-gray-400"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <Search size={22} />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSchemes.length > 0 ? (
              filteredSchemes.map((scheme: Scheme, index: number) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                >
                  <SchemeCard scheme={scheme} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass rounded-3xl">
                <p className="text-xl text-gray-500 font-medium">No schemes found matching your criteria.</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="mt-4 text-primary-600 font-bold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[2.5rem] bg-gray-950 overflow-hidden px-6 py-24 sm:px-16 text-center shadow-premium"
          >
            {/* Deep dark gradient with magical lighting */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-gray-950 to-accent-950 opacity-90"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-600/20 rounded-full blur-[120px]"></div>

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-200 text-sm font-bold tracking-wide mb-8">
                TAILORED FOR YOU
              </span>
              <h2 className="mb-6 text-4xl font-extrabold text-white sm:text-6xl tracking-tight max-w-3xl leading-tight">
                Ready to take your business to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-300">next level?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-300 font-medium leading-relaxed">
                Find the perfect scheme that matches your business needs.
                Our AI-powered eligibility engine will guide you through the process step-by-step.
              </p>
              <div className="mt-12 flex justify-center">
                <Link href="/eligibility">
                  <button className="group relative rounded-full bg-white px-12 py-5 text-lg font-black text-gray-900 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
                    <span className="relative z-10 flex items-center gap-2">
                      Check Eligibility Now
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    {/* Shimmer effect inside button */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 transform skew-x-[-20deg] group-hover:animate-shimmer"></div>
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
