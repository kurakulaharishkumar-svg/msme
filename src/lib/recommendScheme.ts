import schemesData from "@/data/schemes.json";

export interface EligibilityData {
    businessName: string;
    businessType: string;
    yearsInBusiness: number;
    stateLocation: string;
    area: string;
    isMsmeRegistered: boolean;
    isWomanEntrepreneur: boolean;
    isScStCategory: boolean;
    annualTurnover: number;
    monthlyRevenue: number;
    netProfit: number;
    existingLoan: number;
    monthlyEmi: number;
    creditScore: number;
    pastLoanDefault: boolean;
    planningExpansion: boolean;
    machineryUpgrade: boolean;
    estimatedInvestment: number;
    requestedLoan: number;
}

export interface RecommendationResult {
    schemeId: string;
    schemeName: string;
    matchScore: number;
    reason: string;
}

// ============================================================
// ORIGINAL recommendScheme - COMPLETELY UNCHANGED
// This is the function used for the Supabase insert.
// ============================================================
export function recommendScheme(data: EligibilityData): RecommendationResult {
    const scoredSchemes = schemesData.map((scheme) => {
        let score = 0;
        const reasons: string[] = [];

        // 1. Base Match: Loan Amount
        const maxAmountMatch = scheme.max_amount.replace(/[^0-9]/g, '');
        const maxAmount = maxAmountMatch ? parseInt(maxAmountMatch, 10) : Infinity;

        if (data.requestedLoan > 0 && data.requestedLoan <= maxAmount) {
            score += 15;
            reasons.push("Matches your requested loan amount");
        } else if (data.requestedLoan > maxAmount) {
            score -= 20; // Penalize if they want more money than the scheme allows
        }

        // 2. Category Match (Women & SC/ST)
        if (data.isWomanEntrepreneur || data.isScStCategory) {
            if (scheme.id === "stand-up-india") {
                score += 40;
                reasons.push("Highly aligned with initiatives for Women/SC/ST entrepreneurs");
            } else if (scheme.id === "credit-subsidy-women" && data.isWomanEntrepreneur) {
                score += 35;
                reasons.push("Exclusive support for women entrepreneurs");
            } else if (scheme.id === "sc-st-hub" && data.isScStCategory) {
                score += 35;
                reasons.push("Exclusive support for SC/ST entrepreneurs");
            }
        }

        // 3. Business Type Match
        if (data.businessType === "Manufacturing") {
            if (scheme.id === "zed-certification" || scheme.id === "clcss" || scheme.id === "tuf-textiles" || scheme.id === "lean-manufacturing") {
                score += 25;
                reasons.push("Perfect match for manufacturing businesses");
            }
        } else if (data.businessType === "Service") {
            if (scheme.id === "digital-msme") {
                score += 15;
                reasons.push("Suitable for service sector digitization");
            }
        }

        // 4. Credit Score & Defaults
        if (data.pastLoanDefault) {
            if (scheme.category === "Loans") {
                score -= 100; // Almost disqualify from standard loans if they have a default
            } else if (scheme.category === "Grants" || scheme.category === "Subsidies") {
                score += 5; // Slight bump to non-loan schemes
            }
        } else {
            if (data.creditScore > 750 && scheme.category === "Loans") {
                score += 15;
                reasons.push("Excellent credit score makes loan approval highly likely");
            } else if (data.creditScore < 550 && scheme.category === "Loans") {
                if (scheme.id === "cgtmse") {
                    score += 20;
                    reasons.push("CGTMSE provides guarantee cover which helps with lower credit scores");
                } else {
                    score -= 30; // Standard loans are hard with low credit
                }
            }
        }

        // 5. Expansion & Machinery
        if (data.planningExpansion) {
            if (scheme.id === "pmegp" || scheme.id === "pm-mudra") {
                score += 20;
                reasons.push("Great fit for funding business expansion");
            }
        }
        if (data.machineryUpgrade) {
            if (scheme.id === "clcss" || scheme.id === "tuf-textiles") {
                score += 30;
                reasons.push("Specifically provides capital subsidy for machinery/technology upgrade");
            }
        }

        // Base matching for MSME registration
        if (data.isMsmeRegistered) {
            score += 5;
            if (reasons.length === 0) reasons.push("Valid for Udyam registered MSMEs");
        }

        // Ensure score stays within 0-100 range logically for the UI
        let finalScore = Math.min(Math.max(score, 10), 99);

        // If it's a really good match, push it closer to 95-99
        if (score >= 40) finalScore = 90 + Math.floor(Math.random() * 8);
        else if (score >= 25) finalScore = 75 + Math.floor(Math.random() * 10);
        else if (score >= 10) finalScore = 60 + Math.floor(Math.random() * 10);
        else finalScore = 40 + Math.floor(Math.random() * 15);

        return {
            schemeId: scheme.id,
            schemeName: scheme.name,
            matchScore: finalScore,
            reason: reasons.length > 0 ? reasons[0] : "Good general fit based on your profile."
        };
    });

    // Sort by highest score
    const sortedSchemes = scoredSchemes.sort((a, b) => b.matchScore - a.matchScore);

    // Return the top recommendation
    return sortedSchemes[0];
}


// ============================================================
// STRICT REAL-WORLD MULTI-SCHEME RECOMMENDATION ENGINE
// Every scheme has hard eligibility gates (pass/fail criteria)
// plus scoring based on actual user financial data.
// ============================================================

export interface RecommendationResultMulti {
    schemeId: string;
    schemeName: string;
    matchScore: number;
    approvalProbability: number;
    reason: string;
    maxAmount: string;
    interestRate: string;
    category: string;
    eligible: boolean; // hard pass/fail
    disqualifyReasons: string[];
}


// --------------------------
// HARD ELIGIBILITY RULES per scheme (real-world criteria)
// Returns { eligible, reasons[] }
// --------------------------
function checkHardEligibility(schemeId: string, scheme: { id: string; name: string; category: string; max_amount: string; details?: { interestRate?: string } }, data: EligibilityData): { eligible: boolean; failReasons: string[]; passReasons: string[] } {
    const failReasons: string[] = [];
    const passReasons: string[] = [];

    // ---------- PM MUDRA (PMMY) ----------
    if (schemeId === "pm-mudra") {
        // Age: 18-65 (we don't have age, skip)
        // Must be in manufacturing, trading, or services
        if (!["Manufacturing", "Service", "Trading/Retail"].includes(data.businessType)) {
            failReasons.push("Business must be in manufacturing, trading, or services");
        } else {
            passReasons.push(`${data.businessType} sector is eligible`);
        }
        // Must not be a defaulter
        if (data.pastLoanDefault) {
            failReasons.push("Must not be a defaulter to any bank");
        } else {
            passReasons.push("No past loan defaults");
        }
        // Max loan ₹20,00,000
        if (data.requestedLoan > 2000000) {
            failReasons.push("Maximum loan under MUDRA is ₹20 Lakhs, your request exceeds this");
        } else {
            passReasons.push(`Requested ₹${(data.requestedLoan / 100000).toFixed(1)}L is within the ₹20L limit`);
        }
    }

    // ---------- CGTMSE ----------
    if (schemeId === "cgtmse") {
        // Must be Micro or Small Enterprise
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be a registered Micro or Small Enterprise");
        } else {
            passReasons.push("Registered MSME — eligible for guarantee cover");
        }
        if (data.pastLoanDefault) {
            failReasons.push("Must not be a bank defaulter");
        } else {
            passReasons.push("Clean repayment history");
        }
        // Max ₹10 Crore
        if (data.requestedLoan > 100000000) {
            failReasons.push("Maximum coverage is ₹10 Crore");
        }
        passReasons.push("Collateral-free credit guarantee available");
    }

    // ---------- Stand Up India ----------
    if (schemeId === "stand-up-india") {
        // EXCLUSIVELY for Women and SC/ST
        if (!data.isWomanEntrepreneur && !data.isScStCategory) {
            failReasons.push("Exclusively for Women and SC/ST entrepreneurs");
        } else {
            passReasons.push(data.isWomanEntrepreneur ? "Woman entrepreneur — eligible" : "SC/ST category — eligible");
        }
        // Loan range ₹10L to ₹1Cr
        if (data.requestedLoan < 1000000) {
            failReasons.push("Minimum loan amount is ₹10 Lakhs");
        }
        if (data.requestedLoan > 10000000) {
            failReasons.push("Maximum loan amount is ₹1 Crore");
        }
        if (data.requestedLoan >= 1000000 && data.requestedLoan <= 10000000) {
            passReasons.push("Loan amount within ₹10L–₹1Cr range");
        }
        // Must be greenfield (new) project — approximate with years < 2
        if (data.yearsInBusiness > 2) {
            failReasons.push("Must be a first-time greenfield project (new enterprise)");
        } else {
            passReasons.push("New/recent enterprise — qualifies as greenfield");
        }
    }

    // ---------- PMEGP ----------
    if (schemeId === "pmegp") {
        // Must be a NEW project
        if (data.yearsInBusiness > 1) {
            failReasons.push("Must be setting up a NEW project (not an existing enterprise)");
        } else {
            passReasons.push("New/recently started enterprise — eligible");
        }
        // 8th pass for Manufacturing > ₹10L or Service > ₹5L (we can't check education)
        // Max ₹50L for manufacturing, ₹20L for service
        if (data.businessType === "Manufacturing" && data.requestedLoan > 5000000) {
            failReasons.push("Maximum project cost for manufacturing is ₹50 Lakhs");
        } else if (data.businessType !== "Manufacturing" && data.requestedLoan > 2000000) {
            failReasons.push("Maximum project cost for service/business is ₹20 Lakhs");
        } else {
            passReasons.push("Project cost within PMEGP limits");
        }
        if (data.pastLoanDefault) {
            failReasons.push("Defaulters are not eligible");
        }
    }

    // ---------- ZED Certification ----------
    if (schemeId === "zed-certification") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be registered on the Udyam portal");
        } else {
            passReasons.push("Udyam registered MSME");
        }
        if (data.businessType !== "Manufacturing") {
            failReasons.push("Manufacturing activity must be operational");
        } else {
            passReasons.push("Manufacturing business — eligible for ZED certification");
        }
    }

    // ---------- Startup India Seed Fund ----------
    if (schemeId === "startup-india-seed-fund") {
        // Must be DPIIT-recognized startup <2 years
        if (data.yearsInBusiness > 2) {
            failReasons.push("Startup must be incorporated less than 2 years ago");
        } else {
            passReasons.push("Recently incorporated — eligible");
        }
        // Max ₹70L total
        if (data.requestedLoan > 7000000) {
            failReasons.push("Maximum funding is ₹70 Lakhs (Grant + Debt)");
        } else {
            passReasons.push("Funding request within ₹70L limit");
        }
    }

    // ---------- TReDS ----------
    if (schemeId === "treds") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must have valid Udyam Registration, GST, and PAN");
        } else {
            passReasons.push("MSME registered");
        }
        if (data.yearsInBusiness < 1) {
            failReasons.push("Must be operational for at least one year");
        } else {
            passReasons.push(`${data.yearsInBusiness} years in business — meets minimum requirement`);
        }
    }

    // ---------- SIDBI SMILE ----------
    if (schemeId === "sidbi-make-india") {
        if (data.businessType !== "Manufacturing" && !data.planningExpansion) {
            failReasons.push("Focuses on manufacturing and expansion/modernization projects");
        } else {
            passReasons.push("Eligible for SIDBI SMILE " + (data.businessType === "Manufacturing" ? "manufacturing" : "expansion") + " funding");
        }
        // Min ₹50L for new, max depends on project
        if (data.requestedLoan < 5000000 && data.yearsInBusiness < 1) {
            failReasons.push("Minimum ₹50 Lakhs for new manufacturing projects");
        }
    }

    // ---------- Digital MSME ----------
    if (schemeId === "digital-msme") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be registered with valid Udyam Registration");
        } else {
            passReasons.push("Udyam registered");
        }
        passReasons.push("Financial assistance up to ₹1 Lakh for cloud/IT adoption");
    }

    // ---------- CLCSS ----------
    if (schemeId === "clcss") {
        // Must be Micro or Small (not Medium)
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be a registered Micro or Small enterprise");
        }
        // Must be for machinery/tech upgrade
        if (!data.machineryUpgrade) {
            failReasons.push("Must avail a term loan for new/upgraded machinery");
        } else {
            passReasons.push("Machinery upgrade planned — eligible for 15% capital subsidy");
        }
        if (data.businessType !== "Manufacturing") {
            failReasons.push("Primarily for manufacturing units requiring machinery upgrades");
        }
    }

    // ---------- MSME Champions ----------
    if (schemeId === "msme-champions") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be registered on the Udyam portal");
        } else {
            passReasons.push("Udyam registered MSME — eligible for Champions scheme");
        }
    }

    // ---------- SC/ST Hub ----------
    if (schemeId === "sc-st-hub") {
        if (!data.isScStCategory) {
            failReasons.push("Must belong to a Scheduled Caste (SC) or Scheduled Tribe (ST)");
        } else {
            passReasons.push("SC/ST entrepreneur — eligible for 100% NSIC registration subsidy");
        }
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be a registered Micro or Small Enterprise on Udyam");
        }
    }

    // ---------- Lean Manufacturing ----------
    if (schemeId === "lean-manufacturing") {
        if (data.businessType !== "Manufacturing") {
            failReasons.push("Only for manufacturing MSMEs in clusters");
        } else {
            passReasons.push("Manufacturing unit — eligible for lean methodology support");
        }
    }

    // ---------- Cluster Development ----------
    if (schemeId === "cluster-development") {
        // For State govts or SPVs — individual MSMEs can't apply directly
        failReasons.push("Individual MSMEs cannot apply — must be through State Govt or SPV of 20+ MSEs");
    }

    // ---------- Mahila Coir Yojana ----------
    if (schemeId === "credit-subsidy-women") {
        if (!data.isWomanEntrepreneur) {
            failReasons.push("Exclusively for women artisans in the coir sector");
        } else {
            passReasons.push("Woman entrepreneur — eligible for 75% machinery subsidy");
        }
    }

    // ---------- ASPIRE ----------
    if (schemeId === "asire-scheme") {
        // For Trusts, non-profits, govt agencies — not individual MSMEs
        failReasons.push("Applicants must be Trusts, non-profits, or governmental agencies — not individual businesses");
    }

    // ---------- SFURTI ----------
    if (schemeId === "sfurti") {
        // For artisan clusters and NGOs
        if (data.businessType === "Manufacturing" || data.businessType === "Trading/Retail") {
            passReasons.push("Traditional industries sector may qualify");
        } else {
            failReasons.push("Primarily for traditional artisan clusters (bamboo, honey, khadi)");
        }
    }

    // ---------- Interest Subvention ----------
    if (schemeId === "credit-flow-support") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be Udyam and GST registered");
        } else {
            passReasons.push("Udyam registered — eligible for 2% interest subvention");
        }
    }

    // ---------- MSME Samadhaan ----------
    if (schemeId === "msme-samadhaan") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be Udyam registered Micro or Small Enterprise");
        } else {
            passReasons.push("Portal for filing delayed payment cases — available for registered MSEs");
        }
    }

    // ---------- International Cooperation ----------
    if (schemeId === "international-cooperation") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must possess Udyam Registration");
        } else {
            passReasons.push("Eligible for international exhibition subsidies");
        }
    }

    // ---------- ESDP ----------
    if (schemeId === "esdp") {
        // Open to most — very flexible
        passReasons.push("Open to aspiring and existing entrepreneurs for skill development");
        if (data.isWomanEntrepreneur || data.isScStCategory) {
            passReasons.push("No fee charged for SC/ST/Women candidates");
        }
    }

    // ---------- TEQUP ----------
    if (schemeId === "technology-upgradation") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must have Udyam Registration");
        }
        if (data.businessType !== "Manufacturing") {
            failReasons.push("Primarily for manufacturing MSMEs with high energy footprint");
        } else {
            passReasons.push("Manufacturing unit — eligible for 25% energy efficiency subsidy");
        }
    }

    // ---------- MSE-CDP ----------
    if (schemeId === "mse-cdp") {
        failReasons.push("Individual MSMEs cannot apply directly — must form an SPV of 20+ MSEs");
    }

    // ---------- PMS Scheme ----------
    if (schemeId === "procurement-marketing") {
        if (!data.isMsmeRegistered) {
            failReasons.push("Must be a registered Micro or Small Enterprise with Udyam Registration");
        } else {
            passReasons.push("Eligible for trade fair stall rent reimbursement and e-commerce support");
        }
    }

    const eligible = failReasons.length === 0;
    return { eligible, failReasons, passReasons };
}


// --------------------------
// FINANCIAL APPROVAL SCORING
// Strict calculation based on actual financial data
// --------------------------
function calculateApprovalProbability(data: EligibilityData, scheme: { category: string }): number {
    let score = 0;
    const isLoanScheme = scheme.category === "Loans";

    // 1. Credit Score (0-25 points)
    if (isLoanScheme) {
        if (data.creditScore >= 750) score += 25;
        else if (data.creditScore >= 700) score += 20;
        else if (data.creditScore >= 650) score += 14;
        else if (data.creditScore >= 550) score += 7;
        else if (data.creditScore >= 400) score += 3;
        else score += 0;
    } else {
        // Non-loan schemes: credit score matters less
        score += 15;
    }

    // 2. Past Default (0-20 points)
    if (!data.pastLoanDefault) {
        score += 20;
    } else {
        if (isLoanScheme) score += 0; // Severe penalty for loans
        else score += 10; // Moderate penalty for grants/subsidies
    }

    // 3. Debt-to-Income Ratio (0-15 points)
    if (data.monthlyRevenue > 0) {
        const dti = data.monthlyEmi / data.monthlyRevenue;
        if (dti === 0) score += 15;
        else if (dti <= 0.25) score += 12;
        else if (dti <= 0.4) score += 8;
        else if (dti <= 0.6) score += 4;
        else score += 0;
    } else {
        score += 5; // No revenue data — partial score
    }

    // 4. Profitability (0-15 points)
    if (data.annualTurnover > 0) {
        const profitMargin = data.netProfit / data.annualTurnover;
        if (profitMargin >= 0.20) score += 15;
        else if (profitMargin >= 0.10) score += 12;
        else if (profitMargin >= 0.05) score += 8;
        else if (profitMargin > 0) score += 4;
        else score += 0; // Loss-making
    } else {
        score += 3;
    }

    // 5. Existing Loan Burden vs Turnover (0-10 points)
    if (data.existingLoan === 0) {
        score += 10;
    } else if (data.annualTurnover > 0) {
        const ratio = data.existingLoan / data.annualTurnover;
        if (ratio <= 0.2) score += 9;
        else if (ratio <= 0.5) score += 6;
        else if (ratio <= 1.0) score += 3;
        else score += 0;
    } else {
        score += 2;
    }

    // 6. MSME Registration (0-10 points)
    if (data.isMsmeRegistered) score += 10;

    // 7. Business Maturity (0-5 points)
    if (data.yearsInBusiness >= 5) score += 5;
    else if (data.yearsInBusiness >= 3) score += 4;
    else if (data.yearsInBusiness >= 1) score += 3;
    else score += 1;

    // Total possible = 100
    return Math.min(Math.max(score, 8), 95);
}


// --------------------------
// MAIN MULTI-SCHEME FUNCTION
// --------------------------
export function recommendSchemes(data: EligibilityData): RecommendationResultMulti[] {
    const results = schemesData.map((scheme) => {
        // Step 1: Hard eligibility check
        const { eligible, failReasons, passReasons } = checkHardEligibility(scheme.id, scheme, data);

        // Step 2: Calculate eligibility match score
        let eligibilityScore: number;
        if (!eligible) {
            // Partially eligible schemes get lower score based on how many criteria failed
            const totalChecks = failReasons.length + passReasons.length;
            eligibilityScore = totalChecks > 0
                ? Math.round((passReasons.length / totalChecks) * 70) // max 70% for ineligible
                : 25;
        } else {
            // Fully eligible: 75-98% based on how many positive criteria matched
            eligibilityScore = Math.min(75 + passReasons.length * 5, 98);
        }

        // Step 3: Calculate approval probability based on financial data
        const approvalProbability = calculateApprovalProbability(data, scheme);

        // Step 4: Build reason string from actual criteria
        let reasonParts: string[] = [];
        if (passReasons.length > 0) {
            reasonParts = passReasons.slice(0, 3);
        }
        if (failReasons.length > 0 && failReasons.length <= 2) {
            reasonParts.push("Note: " + failReasons.join("; "));
        }
        const reason = reasonParts.length > 0
            ? reasonParts.join(". ") + "."
            : "General eligibility based on your business profile.";

        const interestRate = scheme.details?.interestRate || "N/A";

        return {
            schemeId: scheme.id,
            schemeName: scheme.name,
            matchScore: eligibilityScore,
            approvalProbability: eligible ? approvalProbability : Math.min(approvalProbability, 35),
            reason,
            maxAmount: scheme.max_amount,
            interestRate,
            category: scheme.category,
            eligible,
            disqualifyReasons: failReasons,
        };
    });

    // Sort: eligible schemes first, then by combined weighted score
    return results
        .sort((a, b) => {
            // Eligible schemes always rank above ineligible ones
            if (a.eligible && !b.eligible) return -1;
            if (!a.eligible && b.eligible) return 1;
            // Among same eligibility status, sort by weighted score
            const scoreA = a.matchScore * 0.55 + a.approvalProbability * 0.45;
            const scoreB = b.matchScore * 0.55 + b.approvalProbability * 0.45;
            return scoreB - scoreA;
        })
        .filter((s) => s.matchScore >= 20); // Show even partially-eligible schemes for transparency
}
