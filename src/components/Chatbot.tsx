"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";
import { useChat } from "ai/react";

// Add TypeScript support for the Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const LANGUAGES = [
    { code: "en-IN", label: "EN" },
    { code: "hi-IN", label: "HI" },
    { code: "te-IN", label: "TE" },
];

const QUICK_ACTIONS = [
    { label: "📋 All Schemes", query: "Can you show me all available schemes?" },
    { label: "💰 Loans", query: "What loan schemes are available?" },
    { label: "🏷️ Subsidies", query: "Can you list subsidies offered to MSMEs?" },
    { label: "👩 Women", query: "What schemes are available for women entrepreneurs?" },
    { label: "🚀 Startups", query: "Are there any targeted schemes for startups?" },
    { label: "🏭 Manufacturing", query: "What schemes support the manufacturing sector?" },
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [listeningLang, setListeningLang] = useState<string | null>(null);
    const [isTTSMuted, setIsTTSMuted] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].code);

    const recognitionRef = useRef<any>(null);
    const lastSpokenMessageIdRef = useRef<string | null>(null);

    const { messages, input, handleInputChange, handleSubmit, append, isLoading, setInput } = useChat({
        body: { language: selectedLanguage },
        initialMessages: [
            {
                id: "1",
                role: "assistant",
                content: "Hi! 👋 I'm your **MSME Scheme Assistant**. Ask me about government schemes, subsidies, loans, or grants for your business!",
            },
        ],
    });

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fallback TTS Refs
    const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef(false);

    const cancelFallbackTTS = () => {
        if (fallbackAudioRef.current) {
            fallbackAudioRef.current.pause();
            fallbackAudioRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
    };

    const playFallbackTTS = (text: string, langPrefix: string) => {
        cancelFallbackTTS();

        const sentences = text.match(/[^.,!?\n]+[.,!?\n]*/g) || [text];
        const chunks: string[] = [];
        let currentChunk = "";

        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length < 180) {
                currentChunk += sentence;
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                let s = sentence;
                while (s.length > 180) {
                    chunks.push(s.substring(0, 180));
                    s = s.substring(180);
                }
                currentChunk = s;
            }
        }
        if (currentChunk) chunks.push(currentChunk.trim());

        audioQueueRef.current = chunks;

        const playNext = () => {
            if (isTTSMuted || audioQueueRef.current.length === 0) {
                isPlayingRef.current = false;
                return;
            }
            isPlayingRef.current = true;
            const chunk = audioQueueRef.current.shift();
            if (!chunk) return;

            const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${langPrefix}&q=${encodeURIComponent(chunk)}`;
            const audio = new Audio(url);
            fallbackAudioRef.current = audio;

            audio.onended = () => playNext();
            audio.onerror = () => playNext();
            audio.play().catch(e => {
                console.error("Fallback TTS audio error:", e);
                playNext();
            });
        };

        playNext();
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        } else {
            // Stop speaking if chatbot is closed
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
            cancelFallbackTTS();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setListeningLang(null);
        }
    }, [isOpen]);

    // Text-to-Speech (TTS) Logic
    useEffect(() => {
        if (!isLoading && messages.length > 0 && !isTTSMuted) {
            const lastMessage = messages[messages.length - 1];

            // Speak only if it's a new assistant message
            if (lastMessage.role === "assistant" && lastMessage.id !== lastSpokenMessageIdRef.current) {
                lastSpokenMessageIdRef.current = lastMessage.id;

                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel(); // Stop any ongoing speech
                    cancelFallbackTTS();

                    // Strip markdown characters for cleaner speech
                    const cleanText = lastMessage.content
                        .replace(/[*_~`#]/g, "")
                        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove link formatting but keep text
                        .replace(/\n-/g, ", ")
                        .trim();

                    const utterance = new SpeechSynthesisUtterance(cleanText);
                    utterance.lang = selectedLanguage;

                    // Try to find a voice that matches the selected language
                    const voices = window.speechSynthesis.getVoices();
                    const langPrefix = selectedLanguage.split("-")[0].toLowerCase();

                    // 1. Try to find a premium/Google voice for the specific language
                    let preferredVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) && (v.name.includes("Google") || v.name.includes("Female")));

                    // 2. Fallback to ANY voice matching the language code
                    if (!preferredVoice) {
                        preferredVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
                    }

                    // 3. Fallback to searching by voice name (some Operating Systems hide the standard language tag)
                    if (!preferredVoice) {
                        if (langPrefix === 'te') {
                            preferredVoice = voices.find(v => v.name.toLowerCase().includes('telugu') || v.name.includes('తెలుగు'));
                        } else if (langPrefix === 'hi') {
                            preferredVoice = voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी'));
                        }
                    }

                    // IMPORTANT: Do NOT fall back to an English voice for non-English queries!
                    // An English voice reading Telugu/Hindi unicode text will remain completely silent. 
                    if (preferredVoice) {
                        utterance.voice = preferredVoice;
                        window.speechSynthesis.speak(utterance);
                    } else if (langPrefix === 'te' || langPrefix === 'hi') {
                        // Fallback to Google Translate Unofficial TTS if no native voice exists
                        playFallbackTTS(cleanText, langPrefix);
                    } else {
                        // Let OS try to handle it naturally
                        window.speechSynthesis.speak(utterance);
                    }
                }
            }
        }
    }, [messages, isLoading, isTTSMuted, selectedLanguage]);

    const toggleMute = () => {
        setIsTTSMuted(prev => {
            if (!prev) {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                }
                cancelFallbackTTS();
            }
            return !prev;
        });
    };

    // Initialize Speech Recognition logic without wrapping it in a strict hook to avoid continuous re-renders when language buttons are tapped rapidly
    const initSpeechRecognition = (langCode: string) => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                if (recognitionRef.current) {
                    recognitionRef.current.onend = null; // Remove previous listeners
                    recognitionRef.current.onerror = null;
                    recognitionRef.current.onresult = null;
                    recognitionRef.current.stop();
                }

                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = langCode;

                recognition.onresult = (event: any) => {
                    let finalTranscript = "";
                    let interimTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        setInput("");
                        append({ role: "user", content: finalTranscript.trim() });
                        recognition.stop();
                    } else if (interimTranscript) {
                        setInput(interimTranscript);
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setListeningLang(null);
                };

                recognition.onend = () => {
                    setListeningLang(null);
                };

                recognitionRef.current = recognition;
                return recognition;
            }
        }
        return null;
    };


    // Ensure voices are loaded (Chrome sometimes needs this)
    useEffect(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    const toggleListening = (langCode: string) => {
        if (typeof window === "undefined" || !(window.SpeechRecognition || window.webkitSpeechRecognition)) {
            alert("Your browser does not support Speech Recognition. Please try Chrome or Edge.");
            return;
        }

        // If currently listening to the SAME language, stop it
        if (listeningLang === langCode) {
            recognitionRef.current?.stop();
            setListeningLang(null);
            return;
        }

        // Set the global language for the AI prompt
        setSelectedLanguage(langCode);

        // Cancel ongoing TTS
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        cancelFallbackTTS();

        setInput("");
        setListeningLang(langCode);

        // Safely recreate recognition object with the exact requested language
        const recognition = initSpeechRecognition(langCode);
        if (recognition) {
            try {
                recognition.start();
            } catch (error) {
                console.error("Could not start recognition:", error);
                setListeningLang(null);
            }
        }
    };

    const handleSendAction = (query: string) => {
        // Cancel TTS if user sends a new query
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        cancelFallbackTTS();

        append({ role: "user", content: query });
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        cancelFallbackTTS();

        if (listeningLang && recognitionRef.current) {
            recognitionRef.current.stop();
            setListeningLang(null);
        }

        handleSubmit(e);
    };

    const renderText = (text: string) => {
        return text.split("\n").map((line, i) => (
            <span key={i} className="block min-h-[1rem] my-1">
                {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="font-semibold text-gray-900">
                            {part.slice(2, -2)}
                        </strong>
                    ) : (
                        <span key={j}>{part}</span>
                    )
                )}
            </span>
        ));
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-2xl transition-shadow hover:shadow-primary-500/40"
                        aria-label="Open chatbot"
                    >
                        <MessageCircle size={28} />
                        <span className="absolute inset-0 rounded-full animate-ping bg-primary-400 opacity-20" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-[9999] flex w-[450px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-2xl"
                        style={{ height: "min(600px, calc(100vh - 100px))" }}
                    >
                        {/* Header */}
                        <div className="relative flex items-center justify-between bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 px-5 py-4">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Scheme Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                                        <span className="text-xs text-primary-100">Always online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 relative">
                                {/* Language Selector */}
                                <div className="relative group">
                                    <button
                                        className="relative flex items-center gap-1 rounded-xl p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                        aria-label="Change Language"
                                        title="Language Options"
                                    >
                                        <Globe size={18} />
                                    </button>

                                    <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-gray-100 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => setSelectedLanguage(lang.code)}
                                                className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${selectedLanguage === lang.code
                                                    ? "bg-primary-50 text-primary-700 font-bold"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                                                    }`}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={toggleMute}
                                    className="relative rounded-xl p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                    aria-label={isTTSMuted ? "Unmute Voice Responses" : "Mute Voice Responses"}
                                    title={isTTSMuted ? "Unmute Voice" : "Mute Voice"}
                                >
                                    {isTTSMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="relative rounded-xl p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                    aria-label="Close chatbot"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-gray-50/80 to-white">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role !== "user"
                                            ? "bg-primary-100 text-primary-600"
                                            : "bg-gray-800 text-white"
                                            }`}
                                    >
                                        {msg.role !== "user" ? <Bot size={16} /> : <User size={16} />}
                                    </div>

                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-primary-600 text-white rounded-br-md"
                                            : "bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-md"
                                            }`}
                                    >
                                        {msg.content && <div>{renderText(msg.content)}</div>}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                        <Bot size={16} />
                                    </div>
                                    <div className="rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-sm px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2.5">
                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                {QUICK_ACTIONS.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => handleSendAction(action.query)}
                                        className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleFormSubmit} className="border-t border-gray-100 bg-white px-3 py-3">
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Voice Input</span>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>

                            {/* Multilingual Mic Buttons */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                                {LANGUAGES.map((lang) => {
                                    const isThisMicActive = listeningLang === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            onClick={() => toggleListening(lang.code)}
                                            className={`relative flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${isThisMicActive
                                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                            aria-label={`Listen in ${lang.label}`}
                                        >
                                            {isThisMicActive ? (
                                                <>
                                                    <MicOff size={14} />
                                                    <span className="hidden sm:inline">Stop</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Mic size={14} />
                                                    <span>{lang.label}</span>
                                                </>
                                            )}

                                            {isThisMicActive && (
                                                <span className="absolute inset-0 rounded-xl animate-ping bg-red-400 opacity-40" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder={listeningLang ? "Listening..." : "Ask about schemes, subsidies..."}
                                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:ring-2 focus:ring-primary-100 ${listeningLang
                                        ? "border-red-300 bg-red-50/50"
                                        : "border-gray-200 bg-gray-50 focus:border-primary-300 focus:bg-white"
                                        }`}
                                />

                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Send message"
                                >
                                    <Send size={18} className="translate-x-[1px]" />
                                </button>
                            </div>
                            <p className="mt-2 text-center text-[10px] text-gray-400">
                                Powered by OpenAI • Data from schemes.json
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
