"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Loader2, Sparkles, ArrowRight, ChevronDown, Download, RefreshCw, Info, TrendingUp, FileText, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { recommendSchemes, RecommendationResultMulti } from "@/lib/recommendScheme";

export default function EligibilityPage() {
    const router = useRouter();
    const supabase = createClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [recommendation, setRecommendation] = useState<RecommendationResultMulti | null>(null);
    const [multiRecommendations, setMultiRecommendations] = useState<RecommendationResultMulti[]>([]);
    const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

    // Form State
    // Step 1
    const [businessName, setBusinessName] = useState("");
    const [businessType, setBusinessType] = useState("Service");
    const [yearsInBusiness, setYearsInBusiness] = useState("3");
    const [stateLocation, setStateLocation] = useState("Maharashtra");
    const [area, setArea] = useState("Urban");
    const [isMsmeRegistered, setIsMsmeRegistered] = useState(true);
    const [isWomanEntrepreneur, setIsWomanEntrepreneur] = useState(false);
    const [isScStCategory, setIsScStCategory] = useState(false);

    // Step 2
    const [annualTurnover, setAnnualTurnover] = useState("1200000");
    const [monthlyRevenue, setMonthlyRevenue] = useState("100000");
    const [netProfit, setNetProfit] = useState("180000");
    const [existingLoan, setExistingLoan] = useState("0");
    const [monthlyEmi, setMonthlyEmi] = useState("0");

    // Step 3
    const [creditScore, setCreditScore] = useState(695);
    const [pastLoanDefault, setPastLoanDefault] = useState(false);

    // Step 4
    const [planningExpansion, setPlanningExpansion] = useState(true);
    const [machineryUpgrade, setMachineryUpgrade] = useState(false);
    const [estimatedInvestment, setEstimatedInvestment] = useState("500000");
    const [requestedLoan, setRequestedLoan] = useState("500000");

    const steps = [
        { id: 0, title: "Business Profile", emoji: "🏢" },
        { id: 1, title: "Financial Details", emoji: "💰" },
        { id: 2, title: "Credit Profile", emoji: "📊" },
        { id: 3, title: "Expansion Plan", emoji: "🚀" }
    ];

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 0, 0));

    // Helper for formatting the requested loan into a readable string (e.g. ₹5.0L)
    const formatLoanAmount = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "₹0";
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
        return `₹${num}`;
    };

    const submitEligibility = async () => {
        setIsSubmitting(true);
        setSubmitError("");
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session?.user) {
                setSubmitError("You must be logged in to submit an eligibility request.");
                setIsSubmitting(false);
                return;
            }

            const user = session.user;

            const multiResults = recommendSchemes({
                businessName,
                businessType,
                yearsInBusiness: parseInt(yearsInBusiness) || 0,
                stateLocation,
                area,
                isMsmeRegistered,
                isWomanEntrepreneur,
                isScStCategory,
                annualTurnover: parseFloat(annualTurnover) || 0,
                monthlyRevenue: parseFloat(monthlyRevenue) || 0,
                netProfit: parseFloat(netProfit) || 0,
                existingLoan: parseFloat(existingLoan) || 0,
                monthlyEmi: parseFloat(monthlyEmi) || 0,
                creditScore,
                pastLoanDefault,
                planningExpansion,
                machineryUpgrade,
                estimatedInvestment: parseFloat(estimatedInvestment) || 0,
                requestedLoan: parseFloat(requestedLoan) || 0
            });

            // Set for UI rendering
            setMultiRecommendations(multiResults);

            // Store top result as the primary recommendation
            const topResult = multiResults[0];
            setRecommendation(topResult || null);

            // Storing the request in Supabase using the rigorous top recommendation
            const { error } = await supabase.from('eligibility_requests').insert({
                user_id: user.id,
                business_name: businessName,
                business_type: businessType,
                years_in_business: parseInt(yearsInBusiness) || 0,
                state_location: stateLocation,
                area: area,
                is_msme_registered: isMsmeRegistered,
                is_woman_entrepreneur: isWomanEntrepreneur,
                is_sc_st_category: isScStCategory,
                annual_turnover: parseFloat(annualTurnover) || 0,
                monthly_revenue: parseFloat(monthlyRevenue) || 0,
                net_profit: parseFloat(netProfit) || 0,
                existing_loan_amount: parseFloat(existingLoan) || 0,
                monthly_emi: parseFloat(monthlyEmi) || 0,
                credit_score: creditScore,
                past_loan_default: pastLoanDefault,
                planning_expansion: planningExpansion,
                machinery_upgrade: machineryUpgrade,
                estimated_investment: parseFloat(estimatedInvestment) || 0,
                requested_loan: parseFloat(requestedLoan) || 0,
                recommended_scheme_id: topResult?.schemeId || "none",
                match_score: topResult?.matchScore || 0,
                recommendation_reason: topResult?.reason || "No valid schemes found."
            });

            if (error) {
                console.error("Error inserting data:", error);
                setSubmitError(error.message || "Failed to submit request.");
            } else {
                setSubmitSuccess(true);
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Unexpected error:", error);
            setSubmitError(error.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle Switch Component
    const Toggle = ({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) => {
        const toggleBg = currentStep === 0 ? "bg-blue-500" : currentStep === 1 ? "bg-emerald-500" : currentStep === 2 ? "bg-indigo-500" : "bg-amber-500";
        const focusRing = currentStep === 0 ? "focus:ring-blue-500/30" : currentStep === 1 ? "focus:ring-emerald-500/30" : currentStep === 2 ? "focus:ring-indigo-500/30" : "focus:ring-amber-500/30";
        return (
            <button
                type="button"
                onClick={() => onChange(!active)}
                className={cn(
                    "relative inline-flex h-[32px] w-[56px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-[4px] focus:ring-offset-1 hover:scale-105 active:scale-95 shadow-sm",
                    active ? toggleBg : "bg-gray-200 hover:bg-gray-300",
                    focusRing
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-[28px] w-[28px] transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out",
                        active ? "translate-x-[24px]" : "translate-x-0"
                    )}
                />
            </button>
        );
    };

    const inputClasses = `w-full rounded-2xl border-2 border-transparent bg-slate-50/70 backdrop-blur-sm px-5 py-4 text-[15px] font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-300 ease-out shadow-sm hover:-translate-y-1 hover:bg-white ` +
        (currentStep === 0 ? `hover:border-blue-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20` :
            currentStep === 1 ? `hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20` :
                currentStep === 2 ? `hover:border-indigo-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20` :
                    `hover:border-amber-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20`);

    const labelClasses = `block text-[13px] font-extrabold tracking-wide uppercase mb-3 ml-1 transition-colors duration-300 ` +
        (currentStep === 0 ? `text-blue-800/80` :
            currentStep === 1 ? `text-emerald-800/80` :
                currentStep === 2 ? `text-indigo-800/80` :
                    `text-amber-800/80`);

    const toggleRowClasses = `flex items-center justify-between group rounded-2xl p-4 border-2 border-transparent transition-all duration-300 -mx-3 ` +
        (currentStep === 0 ? `hover:border-blue-200 hover:bg-white hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]` :
            currentStep === 1 ? `hover:border-emerald-200 hover:bg-white hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]` :
                currentStep === 2 ? `hover:border-indigo-200 hover:bg-white hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)]` :
                    `hover:border-amber-200 hover:bg-white hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]`);

    return (
        <main className="min-h-screen bg-[#f8fafc] pb-24 relative selection:bg-primary-200">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-200/20 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply hidden lg:block"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-200/20 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply hidden lg:block"></div>

            <Navbar />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16 relative z-10">
                {/* Form Container */}
                <div className="glass rounded-[2rem] p-6 md:p-12 min-h-[600px] flex flex-col relative overflow-hidden backdrop-blur-2xl">
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary-400/20 to-accent-400/20 blur-[80px] pointer-events-none hidden md:block" />

                    {/* Redesigned Progress Stepper */}
                    <div className="relative mb-12 px-2 md:px-8">
                        <div className="absolute left-0 top-6 -translate-y-1/2 w-full h-1 bg-slate-100 hidden md:block" />
                        <div className="flex relative z-10 overflow-x-auto no-scrollbar pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                            {steps.map((step, index) => {
                                const isCompleted = currentStep > step.id;
                                const isActive = currentStep === step.id;
                                const isPending = currentStep < step.id;

                                return (
                                    <div key={step.id} className="flex-1 flex flex-col items-center gap-3 relative min-w-[70px] md:min-w-[100px]">
                                        {/* Connector Line (Mobile & Desktop overrides) */}
                                        {index > 0 && (
                                            <div className={cn(
                                                "absolute right-[50%] top-6 -translate-y-1/2 w-full h-1 hidden md:block transition-all duration-500",
                                                isCompleted || isActive ? "bg-primary-500" : "bg-transparent"
                                            )} style={{ zIndex: -1 }} />
                                        )}

                                        <div
                                            className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 relative z-10 border-2",
                                                isCompleted ? "bg-primary-500 border-primary-500 text-white" : "",
                                                isActive ? "bg-white border-primary-500 ring-4 ring-primary-500/20 scale-110" : "",
                                                isPending ? "bg-white border-slate-200 text-slate-400" : ""
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check size={20} strokeWidth={3} />
                                            ) : (
                                                <span className={cn(
                                                    "text-xl transition-all duration-300",
                                                    isPending ? "opacity-50 grayscale" : ""
                                                )}>
                                                    {step.emoji}
                                                </span>
                                            )}
                                        </div>

                                        <span className={cn(
                                            "text-[11px] md:text-[13px] font-bold tracking-wide text-center uppercase transition-colors duration-300",
                                            isActive ? "text-primary-700" : isCompleted ? "text-slate-700" : "text-slate-400"
                                        )}>
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-grow">
                        {submitSuccess && recommendation && multiRecommendations.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-2 space-y-6"
                            >
                                {/* Overall Approval Probability Hero Card */}
                                {(() => {
                                    const eligibleCount = multiRecommendations.filter(s => s.eligible).length;
                                    const topEligible = multiRecommendations.find(s => s.eligible);
                                    const topApproval = topEligible?.approvalProbability || multiRecommendations[0]?.approvalProbability || 0;
                                    const topMatch = topEligible?.matchScore || multiRecommendations[0]?.matchScore || 0;
                                    return (
                                        <div className={`w-full rounded-[2rem] glass p-8 text-center text-gray-900 border-2 ${eligibleCount > 0
                                            ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/40 to-teal-50/20'
                                            : 'border-amber-200/50 bg-gradient-to-br from-amber-50/40 to-orange-50/20'
                                            }`}>
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", damping: 15, delay: 0.2 }}
                                                className={`text-6xl sm:text-7xl font-black mb-2 ${eligibleCount > 0 ? 'text-emerald-600' : 'text-amber-600'
                                                    }`}
                                            >
                                                {topApproval}%
                                            </motion.div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Overall Approval Probability</h2>
                                            <p className="text-sm text-gray-500 mb-6">
                                                Based on your credit score ({creditScore}), financial health, and business profile
                                            </p>

                                            {/* Stats Row */}
                                            <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck size={16} className="text-emerald-500" />
                                                    <span className="font-medium">{eligibleCount} Schemes Eligible</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <AlertTriangle size={16} className="text-amber-500" />
                                                    <span className="font-medium">{multiRecommendations.length - eligibleCount} Not Eligible</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp size={16} className="text-emerald-500" />
                                                    <span className="font-medium">{topMatch}% Best Match</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-center gap-3 mt-8">
                                                <button
                                                    onClick={() => {
                                                        setSubmitSuccess(false);
                                                        setCurrentStep(0);
                                                        setRecommendation(null);
                                                        setMultiRecommendations([]);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md px-6 py-3 text-sm font-bold text-gray-700 hover:bg-white hover:shadow-sm transition-all active:scale-95 shadow-sm"
                                                >
                                                    Rerun Analysis <RefreshCw size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* How to Use Results Info Box */}
                                <div className="w-full rounded-3xl border border-blue-200/50 bg-blue-50/30 backdrop-blur-md p-6 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100/80 text-blue-700 shadow-inner">
                                            <Info size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 mb-1">How to Use These Results</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                Schemes marked <strong className="text-emerald-700">✓ Eligible</strong> meet all hard criteria based on your profile.
                                                Schemes marked <strong className="text-red-600">✗ Not Eligible</strong> have specific disqualification reasons shown when expanded.
                                                The approval probability is calculated from your credit score, debt-to-income ratio, profit margin, and loan history.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ranked Scheme Cards */}
                                <div className="w-full space-y-3">
                                    {multiRecommendations.map((scheme, index) => {
                                        const isExpanded = expandedScheme === scheme.schemeId;
                                        const probLabel = scheme.approvalProbability >= 75 ? "High" :
                                            scheme.approvalProbability >= 50 ? "Medium" : "Low";
                                        const probColor = scheme.approvalProbability >= 75 ? "text-emerald-600" :
                                            scheme.approvalProbability >= 50 ? "text-amber-600" : "text-red-500";
                                        const badgeColor = scheme.eligible
                                            ? (index === 0 ? "bg-emerald-500" : index === 1 ? "bg-blue-500" : index === 2 ? "bg-indigo-500" : "bg-gray-500")
                                            : "bg-gray-300";
                                        const cardBorder = scheme.eligible
                                            ? "border-gray-200 hover:border-primary-200 hover:shadow-lg"
                                            : "border-gray-100 opacity-75 hover:opacity-100";

                                        return (
                                            <motion.div
                                                key={scheme.schemeId}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 * index }}
                                                className={`w-full rounded-[2rem] glass transition-all duration-300 ${cardBorder} hover:-translate-y-1 shadow-sm`}
                                            >
                                                <div className="p-5 sm:p-6">
                                                    <div className="flex items-start gap-4">
                                                        {/* Rank Badge */}
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${badgeColor} text-white font-bold text-sm shadow-sm`}>
                                                            {index + 1}
                                                        </div>

                                                        {/* Scheme Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="text-base font-bold text-gray-900 truncate">{scheme.schemeName}</h3>
                                                                {scheme.eligible ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                                                                        <CheckCircle2 size={10} /> Eligible
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 shrink-0">
                                                                        <XCircle size={10} /> Not Eligible
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                                <span>Max Amount: <strong className="text-gray-800">{scheme.maxAmount}</strong></span>
                                                                {scheme.interestRate !== "N/A" && (
                                                                    <span>Interest Rate: <strong className="text-gray-800">{scheme.interestRate}</strong></span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Scores */}
                                                        <div className="hidden sm:flex items-center gap-6 shrink-0">
                                                            {/* Eligibility Match */}
                                                            <div className="text-center">
                                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Eligibility Match</p>
                                                                <p className="text-2xl font-black text-gray-900">{scheme.matchScore}%</p>
                                                                <div className="mt-1.5 h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${scheme.matchScore}%` }}
                                                                        transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: "easeOut" }}
                                                                        className="h-full rounded-full bg-primary-500"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Approval Probability */}
                                                            <div className="text-center">
                                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Approval Probability</p>
                                                                <p className={`text-2xl font-black ${probColor}`}>{scheme.approvalProbability}%</p>
                                                                <p className={`text-[10px] font-semibold ${probColor} mt-0.5`}>{probLabel}</p>
                                                            </div>
                                                        </div>

                                                        {/* Expand button */}
                                                        <button
                                                            onClick={() => setExpandedScheme(isExpanded ? null : scheme.schemeId)}
                                                            className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                        >
                                                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                                                <ChevronDown size={20} className="text-gray-400" />
                                                            </motion.div>
                                                        </button>
                                                    </div>

                                                    {/* Mobile scores (visible on small screens) */}
                                                    <div className="flex sm:hidden items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                                                        <div className="flex-1">
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">Eligibility</p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-lg font-black text-gray-900">{scheme.matchScore}%</p>
                                                                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${scheme.matchScore}%` }}
                                                                        transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: "easeOut" }}
                                                                        className="h-full rounded-full bg-primary-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">Approval</p>
                                                            <p className={`text-lg font-black ${probColor}`}>{scheme.approvalProbability}%</p>
                                                            <p className={`text-[9px] font-semibold ${probColor}`}>{probLabel}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Details */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-gray-100">
                                                                {/* Analysis Reason */}
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">🧠</span>
                                                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Analysis</h4>
                                                                </div>
                                                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                                                                    {scheme.reason}
                                                                </p>

                                                                {/* Disqualification Reasons for ineligible schemes */}
                                                                {!scheme.eligible && scheme.disqualifyReasons && scheme.disqualifyReasons.length > 0 && (
                                                                    <div className="mb-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <XCircle size={14} className="text-red-500" />
                                                                            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide">Why Not Eligible</h4>
                                                                        </div>
                                                                        <ul className="space-y-1.5">
                                                                            {scheme.disqualifyReasons.map((reason: string, i: number) => (
                                                                                <li key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                                                                                    <span className="mt-0.5 shrink-0">✗</span>
                                                                                    <span>{reason}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-700">
                                                                        {scheme.category}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => window.open(`/scheme/${scheme.schemeId}`, '_blank')}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-950 px-5 py-2.5 text-xs font-bold text-white hover:from-gray-900 hover:to-black hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all"
                                                                    >
                                                                        View Details <ArrowRight size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Actions */}
                                <div className="flex items-center justify-center gap-4 pt-4">
                                    <button
                                        onClick={() => router.push('/profile')}
                                        className="text-sm font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-all"
                                    >
                                        Return to Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {/* STEP 1: BUSINESS PROFILE */}
                                {currentStep === 0 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col border-b border-gray-200/50 pb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-3xl shadow-sm border border-white">
                                                    🏢
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
                                                        Business Profile
                                                    </h2>
                                                    <p className="text-base font-medium text-gray-500">Tell us about your enterprise</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className={labelClasses}>Business Name</label>
                                                <input
                                                    type="text"
                                                    value={businessName}
                                                    onChange={(e) => setBusinessName(e.target.value)}
                                                    placeholder="e.g. Sharma Enterprises"
                                                    className={inputClasses}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClasses}>Business Type</label>
                                                <select
                                                    value={businessType}
                                                    onChange={(e) => setBusinessType(e.target.value)}
                                                    className={inputClasses + " appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center] bg-no-repeat pr-10"}
                                                >
                                                    <option>Service</option>
                                                    <option>Manufacturing</option>
                                                    <option>Trading/Retail</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClasses}>Years in Business</label>
                                                <input
                                                    type="number"
                                                    value={yearsInBusiness}
                                                    onChange={(e) => setYearsInBusiness(e.target.value)}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <label className={labelClasses}>State</label>
                                                    <select
                                                        value={stateLocation}
                                                        onChange={(e) => setStateLocation(e.target.value)}
                                                        className={inputClasses + " appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center] bg-no-repeat pr-10"}
                                                    >
                                                        <option>Andhra Pradesh</option>
                                                        <option>Arunachal Pradesh</option>
                                                        <option>Assam</option>
                                                        <option>Bihar</option>
                                                        <option>Chhattisgarh</option>
                                                        <option>Goa</option>
                                                        <option>Gujarat</option>
                                                        <option>Haryana</option>
                                                        <option>Himachal Pradesh</option>
                                                        <option>Jharkhand</option>
                                                        <option>Karnataka</option>
                                                        <option>Kerala</option>
                                                        <option>Madhya Pradesh</option>
                                                        <option>Maharashtra</option>
                                                        <option>Manipur</option>
                                                        <option>Meghalaya</option>
                                                        <option>Mizoram</option>
                                                        <option>Nagaland</option>
                                                        <option>Odisha</option>
                                                        <option>Punjab</option>
                                                        <option>Rajasthan</option>
                                                        <option>Sikkim</option>
                                                        <option>Tamil Nadu</option>
                                                        <option>Telangana</option>
                                                        <option>Tripura</option>
                                                        <option>Uttar Pradesh</option>
                                                        <option>Uttarakhand</option>
                                                        <option>West Bengal</option>
                                                        <option>Andaman and Nicobar Islands</option>
                                                        <option>Chandigarh</option>
                                                        <option>Dadra and Nagar Haveli and Daman and Diu</option>
                                                        <option>Delhi</option>
                                                        <option>Jammu and Kashmir</option>
                                                        <option>Ladakh</option>
                                                        <option>Lakshadweep</option>
                                                        <option>Puducherry</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Area</label>
                                                    <select
                                                        value={area}
                                                        onChange={(e) => setArea(e.target.value)}
                                                        className={inputClasses + " appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center] bg-no-repeat pr-10"}
                                                    >
                                                        <option>Urban</option>
                                                        <option>Rural</option>
                                                        <option>Semi-Urban</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="pt-8 space-y-3">
                                                <div className={toggleRowClasses}>
                                                    <label className="text-sm font-bold text-gray-700 cursor-pointer select-none" onClick={() => setIsMsmeRegistered(!isMsmeRegistered)}>
                                                        MSME Registered (Udyam)?
                                                    </label>
                                                    <Toggle active={isMsmeRegistered} onChange={setIsMsmeRegistered} />
                                                </div>
                                                <div className={toggleRowClasses}>
                                                    <label className="text-sm font-bold text-gray-700 cursor-pointer select-none" onClick={() => setIsWomanEntrepreneur(!isWomanEntrepreneur)}>
                                                        Woman Entrepreneur?
                                                    </label>
                                                    <Toggle active={isWomanEntrepreneur} onChange={setIsWomanEntrepreneur} />
                                                </div>
                                                <div className={toggleRowClasses}>
                                                    <label className="text-sm font-bold text-gray-700 cursor-pointer select-none" onClick={() => setIsScStCategory(!isScStCategory)}>
                                                        SC/ST Category?
                                                    </label>
                                                    <Toggle active={isScStCategory} onChange={setIsScStCategory} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: FINANCIAL DETAILS */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col border-b border-gray-200/50 pb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-3xl shadow-sm border border-white">
                                                    💰
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
                                                        Financial Details
                                                    </h2>
                                                    <p className="text-base font-medium text-gray-500">Revenue and existing debt figures</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className={labelClasses}>Annual Turnover (₹)</label>
                                                <input
                                                    type="number"
                                                    value={annualTurnover}
                                                    onChange={(e) => setAnnualTurnover(e.target.value)}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Monthly Revenue (₹)</label>
                                                <input
                                                    type="number"
                                                    value={monthlyRevenue}
                                                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Net Profit (₹)</label>
                                                <input
                                                    type="number"
                                                    value={netProfit}
                                                    onChange={(e) => setNetProfit(e.target.value)}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Existing Loan Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    value={existingLoan}
                                                    onChange={(e) => setExistingLoan(e.target.value)}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Monthly EMI (₹)</label>
                                                <input
                                                    type="number"
                                                    value={monthlyEmi}
                                                    onChange={(e) => setMonthlyEmi(e.target.value)}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: CREDIT PROFILE */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col border-b border-gray-200/50 pb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-3xl shadow-sm border border-white">
                                                    📊
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
                                                        Credit Profile
                                                    </h2>
                                                    <p className="text-base font-medium text-gray-500">Your credit score and loan history</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            <div>
                                                <div className="mb-8 flex items-center gap-2 font-semibold text-gray-600">
                                                    Credit Score: <span className="font-bold text-gray-900 text-lg">{creditScore}</span>
                                                </div>

                                                <div className="relative mb-10 px-1">
                                                    {/* Slider Track */}
                                                    <div className="h-2.5 w-full rounded-full bg-gray-100 shadow-inner absolute top-1/2 -translate-y-1/2 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-indigo-500 transition-all duration-150 ease-out"
                                                            style={{ width: `${((creditScore - 300) / 600) * 100}%` }}
                                                        ></div>
                                                    </div>

                                                    {/* Range Input */}
                                                    <input
                                                        type="range"
                                                        min="300"
                                                        max="900"
                                                        value={creditScore}
                                                        onChange={(e) => setCreditScore(parseInt(e.target.value))}
                                                        className="absolute top-1/2 -translate-y-1/2 w-full h-4 appearance-none bg-transparent outline-none cursor-grab active:cursor-grabbing [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_0_0_8px_rgba(255,255,255,1),0_2px_4px_8px_rgba(0,0,0,0.1)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 z-10"
                                                    />
                                                </div>

                                                {/* Slider labels */}
                                                <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-gray-400 mt-6 relative uppercase">
                                                    <span>300</span>
                                                    <span
                                                        className="absolute top-1/2 -translate-y-1/2 text-indigo-600 font-bold -translate-x-1/2 bg-indigo-50 px-3 py-1 rounded-full text-[11px]"
                                                        style={{ left: `${((creditScore - 300) / 600) * 100}%` }}
                                                    >
                                                        {creditScore}
                                                    </span>
                                                    <span>900</span>
                                                </div>

                                                {/* Colored Boxes */}
                                                <div className="mt-12 grid grid-cols-3 gap-4">
                                                    <div className="rounded-2xl bg-red-50/80 border border-red-100/50 py-4 text-center transition-transform hover:-translate-y-1 hover:shadow-sm">
                                                        <p className="font-bold text-red-600 mb-1 text-sm tracking-wide">Poor</p>
                                                        <p className="text-xs font-semibold text-red-400">300–549</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-amber-50/80 border border-amber-100/50 py-4 text-center transition-transform hover:-translate-y-1 hover:shadow-sm">
                                                        <p className="font-bold text-amber-500 mb-1 text-sm tracking-wide">Fair</p>
                                                        <p className="text-xs font-semibold text-amber-400">550–699</p>
                                                    </div>
                                                    <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100/50 py-4 text-center transition-transform hover:-translate-y-1 hover:shadow-sm">
                                                        <p className="font-bold text-emerald-600 mb-1 text-sm tracking-wide">Good</p>
                                                        <p className="text-xs font-semibold text-emerald-400">700–900</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-100">
                                                <div className={toggleRowClasses}>
                                                    <label className="text-sm font-bold text-gray-700 cursor-pointer select-none" onClick={() => setPastLoanDefault(!pastLoanDefault)}>
                                                        Past Loan Default?
                                                    </label>
                                                    <Toggle active={pastLoanDefault} onChange={setPastLoanDefault} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 4: EXPANSION PLAN */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col border-b border-gray-200/50 pb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-3xl shadow-sm border border-white">
                                                    🚀
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
                                                        Expansion Plan
                                                    </h2>
                                                    <p className="text-base font-medium text-gray-500">How you plan to use the funds</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <div className={toggleRowClasses}>
                                                    <label className="text-sm font-bold text-gray-700 cursor-pointer select-none" onClick={() => setPlanningExpansion(!planningExpansion)}>
                                                        Planning Business Expansion?
                                                    </label>
                                                    <Toggle active={planningExpansion} onChange={setPlanningExpansion} />
                                                </div>
                                                <div className={toggleRowClasses}>
                                                    <label className="text-sm font-bold text-gray-700 cursor-pointer select-none" onClick={() => setMachineryUpgrade(!machineryUpgrade)}>
                                                        Machinery Upgrade Required?
                                                    </label>
                                                    <Toggle active={machineryUpgrade} onChange={setMachineryUpgrade} />
                                                </div>
                                            </div>

                                            <div className="pt-4 space-y-6">
                                                <div>
                                                    <label className={labelClasses}>Estimated Investment Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={estimatedInvestment}
                                                        onChange={(e) => setEstimatedInvestment(e.target.value)}
                                                        className={inputClasses}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Requested Loan Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={requestedLoan}
                                                        onChange={(e) => setRequestedLoan(e.target.value)}
                                                        className={inputClasses}
                                                    />
                                                </div>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm"
                                            >
                                                <div className="p-5 flex gap-4 items-start sm:items-center">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-xl border border-amber-100/80">
                                                        💡
                                                    </div>
                                                    <p className="text-[15px] text-amber-900 font-medium leading-relaxed">
                                                        Requesting <span className="font-bold text-amber-700 mx-1 border-b-2 border-amber-300">{formatLoanAmount(requestedLoan)}</span> — ensure this aligns with your business plan and repayment capacity.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                                {submitError && (
                                    <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
                                        <span>⚠️</span> {submitError}
                                    </div>
                                )}

                            </AnimatePresence>
                        )}
                    </div>

                    {/* Nav Buttons */}
                    {!submitSuccess && (
                        <div className="mt-8 flex items-center justify-between gap-4 pt-8 border-t border-slate-100 mt-auto">
                            {currentStep > 0 ? (
                                <button
                                    onClick={prevStep}
                                    disabled={isSubmitting}
                                    className="rounded-2xl border-2 border-slate-200 bg-white px-8 py-3.5 text-[15px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-4 focus:ring-slate-100 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                                >
                                    <span className="text-lg leading-none">&larr;</span> Back
                                </button>
                            ) : (
                                <button
                                    onClick={() => router.push('/')}
                                    disabled={isSubmitting}
                                    className="rounded-2xl border-2 border-slate-200 bg-white px-8 py-3.5 text-[15px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-4 focus:ring-slate-100 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                                >
                                    <span className="text-lg leading-none">&larr;</span> Cancel
                                </button>
                            )}

                            {currentStep < steps.length - 1 ? (
                                <button
                                    onClick={nextStep}
                                    className="rounded-2xl bg-primary-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 focus:ring-[4px] focus:ring-primary-500/20 active:scale-95 transition-all outline-none flex items-center gap-2"
                                >
                                    Continue <span className="text-lg leading-none">&rarr;</span>
                                </button>
                            ) : (
                                <button
                                    onClick={submitEligibility}
                                    disabled={isSubmitting}
                                    className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:-translate-y-0.5 focus:ring-[4px] focus:ring-emerald-500/20 active:scale-95 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} className="transition-transform group-hover:rotate-12 group-hover:scale-110" /> Analyze My Eligibility
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
