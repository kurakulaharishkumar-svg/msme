import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, Info, Building2, Banknote, Clock, ShieldCheck, Target, Check } from "lucide-react";
import schemesData from "@/data/schemes.json";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

export default async function SchemeDetailPage({ params }: Params) {
    const resolvedParams = await params;
    const scheme = schemesData.find((s) => s.id === resolvedParams.id);

    if (!scheme) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Header / Hero Section */}
            <div className="bg-white border-b border-gray-200 pt-8 pb-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Schemes
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="max-w-3xl">

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 mb-6">
                                {scheme.name}
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {scheme.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 max-w-6xl mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details & Information */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Purpose */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Scheme Purpose</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {scheme.details?.purpose || "This scheme aims to support and empower the MSME sector in India through targeted financial and developmental assistance."}
                            </p>
                        </section>

                        {/* Quick Facts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-2 text-gray-500">
                                    <Banknote className="w-5 h-5" />
                                    <span className="font-medium text-sm uppercase tracking-wider">Interest Rate</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {scheme.details?.interestRate || "N/A"}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-2 text-gray-500">
                                    <Building2 className="w-5 h-5" />
                                    <span className="font-medium text-sm uppercase tracking-wider">Max Amount</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {scheme.details?.maxAmount || scheme.max_amount}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-2 text-gray-500">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium text-sm uppercase tracking-wider">Repayment Tenure</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {scheme.details?.repaymentTenure || "N/A"}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-2 text-gray-500">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="font-medium text-sm uppercase tracking-wider">Collateral</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {scheme.details?.collateralRequired || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Scheme Categories/Limits */}
                        {scheme.details?.categories && scheme.details.categories.length > 0 && (
                            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Scheme Categories & Limits</h2>
                                <div className="space-y-4">
                                    {scheme.details.categories.map((cat: { name: string; limit: string }, idx: number) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <span className="font-medium text-gray-800">{cat.name}</span>
                                            <span className="text-gray-600 text-sm mt-1 sm:mt-0 font-medium bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">{cat.limit}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Eligibility */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Eligibility Criteria</h2>
                            <ul className="space-y-4 text-gray-600">
                                {scheme.eligibility.map((criterion: string, i: number) => (
                                    <li key={i} className="flex gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                                        <span className="leading-relaxed">{criterion}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Main CTA Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 shadow-lg shadow-blue-900/20 text-white">
                                <h3 className="text-xl font-bold mb-3">Ready to Apply?</h3>
                                <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                                    Check your eligibility instantly using our smart recommendation engine before starting your application.
                                </p>
                                <Link
                                    href="/eligibility"
                                    className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    Check Eligibility
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                                <div className="mt-4 pt-4 border-t border-blue-500/30 flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-200 leading-relaxed">
                                        Official applications must be submitted through the respective ministry portals or authorized banking partners.
                                    </p>
                                </div>
                            </div>

                            {/* Key Benefits Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Key Benefits</h3>
                                <ul className="space-y-3">
                                    {scheme.benefits.map((benefit: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-600">
                                            <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Target Audience */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Audience</h3>
                                <p className="text-gray-800 font-medium">{scheme.target}</p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
