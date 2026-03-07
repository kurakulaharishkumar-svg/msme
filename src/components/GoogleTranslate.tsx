"use client";

import Script from "next/script";

export default function GoogleTranslate() {
    return (
        <>
            <div id="google_translate_element" className="hidden"></div>
            <Script
                id="google-translate-init"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        function googleTranslateElementInit() {
                            new google.translate.TranslateElement({
                                pageLanguage: 'en',
                                includedLanguages: 'en,hi,te,bn,ta,kn,ml',
                                autoDisplay: false
                            }, 'google_translate_element');
                        }
                    `
                }}
            />
            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="lazyOnload"
            />
        </>
    );
}
