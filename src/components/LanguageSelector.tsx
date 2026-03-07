"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", name: "മലയാളം (Malayalam)" },
];

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState("en");

    useEffect(() => {
        // Check for existing language preference
        const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
        if (match) {
            const langCode = match[1].split('/').pop();
            if (langCode) {
                setSelectedLang(langCode);
            }
        }
    }, []);

    const handleLanguageChange = (code: string) => {
        setSelectedLang(code);
        setIsOpen(false);

        // Set Google Translate cookie
        // The format is /en/target_language to firmly establish source language
        if (code === "en") {
            // Delete cookie to revert to original
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = `googtrans=; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `googtrans=; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
            document.cookie = `googtrans=/en/${code}; path=/; max-age=31536000`; // 1 year expiry
            document.cookie = `googtrans=/en/${code}; domain=${window.location.hostname}; path=/; max-age=31536000`;
            document.cookie = `googtrans=/en/${code}; domain=.${window.location.hostname}; path=/; max-age=31536000`;
        }

        // Reload the page to apply the translation
        window.location.reload();
    };

    const selectedLanguageName = languages.find(l => l.code === selectedLang)?.name || "English";

    return (
        <div className="relative z-50" translate="no">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <Globe size={16} className="text-primary-600" />
                <span className="hidden sm:inline-block max-w-[100px] truncate">{selectedLanguageName}</span>
                <span className="sm:hidden">Lang</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <div
                        className="absolute right-0 top-full z-50 mt-2 max-h-80 w-48 overflow-auto rounded-xl border border-gray-100 bg-white p-1 shadow-xl ring-1 ring-black/5"
                        role="listbox"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${selectedLang === lang.code
                                    ? "bg-primary-50 text-primary-700 font-semibold"
                                    : "text-gray-700 hover:bg-gray-50 flex"
                                    }`}
                                role="option"
                                aria-selected={selectedLang === lang.code}
                            >
                                <span className="flex-1 text-left">{lang.name}</span>
                                {selectedLang === lang.code && (
                                    <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
