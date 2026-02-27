"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles, ArrowRight, Tag } from "lucide-react";
import schemesData from "@/data/schemes.json";
import Link from "next/link";

interface Scheme {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    max_amount: string;
    details?: any;
    eligibility?: string[];
    benefits?: string[];
    target?: string;
}

interface Message {
    id: number;
    type: "user" | "bot";
    text?: string;
    schemes?: Scheme[];
}

const QUICK_ACTIONS = [
    { label: "📋 All Schemes", query: "show all schemes" },
    { label: "💰 Loans", query: "loan" },
    { label: "🏷️ Subsidies", query: "subsidy" },
    { label: "👩 Women", query: "women" },
    { label: "🚀 Startups", query: "startup" },
    { label: "🏭 Manufacturing", query: "manufacturing" },
];

function searchSchemes(query: string): Scheme[] {
    const q = query.toLowerCase().trim();

    if (!q) return [];

    // "show all" or "all schemes"
    if (q.includes("all scheme") || q.includes("show all") || q.includes("list all")) {
        return schemesData.slice(0, 8) as Scheme[];
    }

    const keywords = q.split(/\s+/).filter((w) => w.length > 2);

    const scored = (schemesData as Scheme[]).map((scheme) => {
        let score = 0;
        const haystack = [
            scheme.name,
            scheme.description,
            scheme.category,
            scheme.target || "",
            ...(scheme.tags || []),
            ...(scheme.eligibility || []),
            ...(scheme.benefits || []),
        ]
            .join(" ")
            .toLowerCase();

        for (const kw of keywords) {
            if (haystack.includes(kw)) score++;
            // Boost exact tag match
            if (scheme.tags?.some((t) => t.toLowerCase() === kw)) score += 2;
            // Boost category match
            if (scheme.category.toLowerCase().includes(kw)) score += 2;
        }

        return { scheme, score };
    });

    return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((s) => s.scheme);
}

function getBotResponse(query: string): Message {
    const q = query.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|hola|namaste|greetings)/i.test(q)) {
        return {
            id: Date.now(),
            type: "bot",
            text: "Hello! 👋 I'm your MSME Scheme Assistant. Ask me about government schemes, loans, subsidies, or grants for your business. You can also try the quick actions below!",
        };
    }

    // Help
    if (/^(help|what can you do|how to use)/i.test(q)) {
        return {
            id: Date.now(),
            type: "bot",
            text: "I can help you discover MSME schemes & subsidies! Try asking:\n• \"Show me loan schemes\"\n• \"Subsidies for women entrepreneurs\"\n• \"Startup funding options\"\n• \"Manufacturing grants\"\n• \"What is PMEGP?\"\n\nOr use the quick action buttons above the input!",
        };
    }

    // Thanks
    if (/^(thanks|thank you|thx)/i.test(q)) {
        return {
            id: Date.now(),
            type: "bot",
            text: "You're welcome! 😊 Feel free to ask anything else about MSME schemes.",
        };
    }

    // Search
    const results = searchSchemes(query);

    if (results.length > 0) {
        return {
            id: Date.now(),
            type: "bot",
            text: `Found ${results.length} matching scheme${results.length > 1 ? "s" : ""}:`,
            schemes: results,
        };
    }

    return {
        id: Date.now(),
        type: "bot",
        text: "I couldn't find matching schemes for that query. Try keywords like **loan**, **subsidy**, **women**, **startup**, **manufacturing**, **grant**, or **training**. You can also use the quick action buttons!",
    };
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: "bot",
            text: "Hi! 👋 I'm your **MSME Scheme Assistant**. Ask me about government schemes, subsidies, loans, or grants for your business!",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = (text?: string) => {
        const query = text || input.trim();
        if (!query) return;

        const userMsg: Message = { id: Date.now(), type: "user", text: query };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const botMsg = getBotResponse(query);
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 600);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const renderText = (text: string) => {
        // Simple bold markdown renderer
        return text.split("\n").map((line, i) => (
            <span key={i}>
                {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="font-semibold">
                            {part.slice(2, -2)}
                        </strong>
                    ) : (
                        <span key={j}>{part}</span>
                    )
                )}
                {i < text.split("\n").length - 1 && <br />}
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
                        {/* Pulse ring */}
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
                        className="fixed bottom-6 right-6 z-[9999] flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-2xl"
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
                            <button
                                onClick={() => setIsOpen(false)}
                                className="relative rounded-xl p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                aria-label="Close chatbot"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-gray-50/80 to-white">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.type === "bot"
                                                ? "bg-primary-100 text-primary-600"
                                                : "bg-gray-800 text-white"
                                            }`}
                                    >
                                        {msg.type === "bot" ? <Bot size={16} /> : <User size={16} />}
                                    </div>

                                    {/* Content */}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.type === "user"
                                                ? "bg-primary-600 text-white rounded-br-md"
                                                : "bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-md"
                                            }`}
                                    >
                                        {msg.text && <div>{renderText(msg.text)}</div>}

                                        {/* Scheme cards */}
                                        {msg.schemes && (
                                            <div className="mt-3 space-y-2.5">
                                                {msg.schemes.map((scheme) => (
                                                    <Link
                                                        key={scheme.id}
                                                        href={`/scheme/${scheme.id}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block group"
                                                    >
                                                        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3 transition-all hover:border-primary-200 hover:shadow-md">
                                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                <h4 className="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                                    {scheme.name}
                                                                </h4>
                                                                <ArrowRight
                                                                    size={14}
                                                                    className="shrink-0 mt-0.5 text-gray-300 group-hover:text-primary-500 transition-colors"
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
                                                                {scheme.description}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                                                                    <Tag size={10} />
                                                                    {scheme.category}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-900">
                                                                    {scheme.max_amount}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
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
                                        onClick={() => handleSend(action.query)}
                                        className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="border-t border-gray-100 bg-white px-4 py-3">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about schemes, subsidies..."
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Send message"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="mt-1.5 text-center text-[10px] text-gray-400">
                                Powered by MSME Navigator • Data from schemes.json
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
