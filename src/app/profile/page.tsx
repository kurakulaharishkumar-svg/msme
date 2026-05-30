"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Briefcase, Mail, Shield, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [businessProfile, setBusinessProfile] = useState<any>(null);
    const [latestRequest, setLatestRequest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchProfileData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // Fetch business profile
                const { data: profile } = await supabase
                    .from('business_profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                
                setBusinessProfile(profile);

                // Fetch latest eligibility request
                const { data: request } = await supabase
                    .from('eligibility_requests')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                setLatestRequest(request);
            }
            setIsLoading(false);
        };
        fetchProfileData();
    }, [supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <Navbar />
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-center animate-pulse text-gray-400 font-bold text-lg">Loading your profile...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <Navbar />
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-center text-gray-500 font-medium">Please log in to view your profile.</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8fafc]">
            <Navbar />
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-premium p-10 overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="h-32 w-32 rounded-3xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-soft">
                            <User size={64} />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {businessProfile?.business_name || user.email?.split('@')[0]}
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">
                                {businessProfile?.business_type ? `${businessProfile.business_type} • MSME Entrepreneur` : "MSME Entrepreneur"}
                            </p>
                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                                {businessProfile?.is_msme_registered && (
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-100 uppercase tracking-wider">
                                        MSME Registered
                                    </span>
                                )}
                                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 border border-primary-100 uppercase tracking-wider">
                                    Active User
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Mail size={20} className="text-gray-400" />
                                Contact & Account
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                                <div>
                                    <p className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-1">Email Address</p>
                                    <p className="text-gray-900 font-medium">{user.email}</p>
                                </div>
                                {businessProfile && (
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-1">Location</p>
                                        <p className="text-gray-900 font-medium">{businessProfile.area}, {businessProfile.state_location}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Activity size={20} className="text-gray-400" />
                                Eligibility Status
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                                {latestRequest ? (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-1">Last Checked</p>
                                            <p className="text-gray-900 font-medium">
                                                {new Date(latestRequest.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-1">Top Recommendation</p>
                                            <p className="text-primary-700 font-bold">
                                                {latestRequest.recommended_scheme_id.toUpperCase()} 
                                                <span className="text-gray-500 font-normal text-sm ml-2">({latestRequest.match_score}% Match)</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-1">Last Eligibility Check</p>
                                        <p className="text-gray-900 font-medium">Never (Check now!)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-gray-50 flex flex-wrap gap-4 justify-between">
                        <button 
                            className="flex items-center gap-2 rounded-2xl bg-white border border-gray-200 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50 transition-all"
                            onClick={() => window.location.href = '/eligibility'}
                        >
                            <Briefcase size={18} />
                            {latestRequest ? 'Re-check Eligibility' : 'Check Eligibility'}
                        </button>
                        <button className="flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 font-bold text-white shadow-premium hover:bg-primary-700 transition-all">
                            <Settings size={18} />
                            Account Settings
                        </button>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}
