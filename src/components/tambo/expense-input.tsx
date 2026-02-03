"use client";

import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Check, Calendar, Tag, Sparkles, HelpCircle } from "lucide-react";
import { useTamboThread } from "@tambo-ai/react";
import { useExpenses } from "@/context/ExpenseContext";

export const expenseInputSchema = z.object({
    mode: z.enum(["minimal", "expanded"]).default("minimal").describe("UI density mode: 'minimal' for confident users, 'expanded' for uncertain users"),
    prefillAmount: z.number().optional().describe("Pre-filled amount if detected from user input"),
    prefillCategory: z.string().optional().describe("Pre-filled category if detected (Food, Transport, Shopping, Bills, Entertainment, Health, Other)"),
    prefillMerchant: z.string().optional().describe("Pre-filled merchant name if mentioned"),
    prefillDate: z.string().optional().describe("Pre-filled date (ISO format) if mentioned"),
    showGuidance: z.boolean().optional().default(false).describe("Show helper text for uncertain users - set true when mode='expanded'"),
});

export type ExpenseInputProps = z.infer<typeof expenseInputSchema>;

const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];

// Category keyword mapping for auto-detection
const categoryKeywords: Record<string, string[]> = {
    "Food": ["food", "groceries", "grocery", "lunch", "dinner", "breakfast", "coffee", "restaurant", "eat", "meal"],
    "Transport": ["uber", "taxi", "gas", "fuel", "metro", "bus", "transport", "ride", "lyft", "train"],
    "Shopping": ["amazon", "shopping", "clothes", "shoes", "buy", "purchase", "store"],
    "Bills": ["rent", "electricity", "wifi", "internet", "insurance", "utility", "bill", "phone"],
    "Entertainment": ["movie", "netflix", "games", "concert", "spotify", "entertainment", "fun"],
    "Health": ["doctor", "medicine", "gym", "pharmacy", "health", "medical", "hospital"],
};

// Extract amount and category from text
function extractFromText(text: string): { amount?: number; category?: string } {
    const lowerText = text.toLowerCase();

    // Extract amount (look for numbers)
    const amountMatch = text.match(/\d+(\.\d+)?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : undefined;

    // Extract category from keywords
    let detectedCategory: string | undefined;
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            detectedCategory = cat;
            break;
        }
    }

    return { amount, category: detectedCategory };
}

// Suggestion chips for expanded mode
const quickSuggestions = [
    { label: "Coffee ☕", amount: 5, category: "Food" },
    { label: "Uber 🚗", amount: 15, category: "Transport" },
    { label: "Lunch 🍜", amount: 12, category: "Food" },
    { label: "Groceries 🛒", amount: 80, category: "Shopping" },
];

export function ExpenseInput({
    mode = "minimal",
    prefillAmount,
    prefillCategory,
    prefillMerchant,
    prefillDate,
    showGuidance = false
}: ExpenseInputProps) {
    const { thread } = useTamboThread();

    // Auto-extract from last user message
    const extracted = useMemo(() => {
        const userMessages = thread.messages.filter(m => m.role === "user");
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage?.content && typeof lastUserMessage.content === "string") {
            console.log("[ExpenseInput] Extracting from:", lastUserMessage.content);
            const result = extractFromText(lastUserMessage.content);
            console.log("[ExpenseInput] Extracted:", result);
            return result;
        }
        return { amount: undefined, category: undefined };
    }, [thread.messages]);

    // Use extracted values if AI didn't provide them
    const finalAmount = prefillAmount ?? extracted.amount;
    const finalCategory = prefillCategory ?? extracted.category;

    const [amount, setAmount] = useState(finalAmount?.toString() || "");
    const [category, setCategory] = useState(finalCategory || "");
    const [merchant, setMerchant] = useState(prefillMerchant || "");
    const [date, setDate] = useState(prefillDate || new Date().toISOString().split("T")[0]);
    const [submitted, setSubmitted] = useState(false);

    // Update state when extracted values change (handles timing issue)
    useEffect(() => {
        if (finalAmount !== undefined && !amount) {
            setAmount(finalAmount.toString());
        }
        if (finalCategory && !category) {
            setCategory(finalCategory);
        }
    }, [finalAmount, finalCategory, amount, category]);

    const { addExpense } = useExpenses();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addExpense({
            amount: parseFloat(amount),
            category,
            merchant,
            date
        });

        setSubmitted(true);

        // Trigger confetti effect on success
        import('canvas-confetti').then((confetti) => {
            confetti.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
            });
        });
    };

    const handleSuggestion = (suggestion: typeof quickSuggestions[0]) => {
        setAmount(suggestion.amount.toString());
        setCategory(suggestion.category);
    };

    const isExpanded = mode === "expanded";

    // ============================================
    // SUCCESS STATE - Shows after saving
    // ============================================
    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-2xl p-6 max-w-xs text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Expense Saved!</h3>
                <p className="text-green-300 text-lg font-medium">${amount} • {category || "Uncategorized"}</p>
                <p className="text-gray-500 text-sm mt-2">Added to your expenses</p>
            </motion.div>
        );
    }

    // ============================================
    // MINIMAL MODE: Sleek, Fast, Confident
    // ============================================
    if (!isExpanded) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 max-w-xs"
            >
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Compact Amount + Category Row */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2.5 text-white text-base placeholder-gray-500 focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50"
                                autoFocus
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-1 focus:ring-purple-500/50 appearance-none w-28"
                        >
                            <option value="" className="text-gray-900">Category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitted || !amount}
                        className={`w-full rounded-lg py-2.5 font-medium transition-all flex items-center justify-center gap-2 text-sm ${submitted
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : "bg-green-500 text-white hover:bg-green-400 shadow-md shadow-green-500/20"
                            }`}
                    >
                        {submitted ? <><Check className="w-4 h-4" /> Saved</> : "Add"}
                    </button>
                </form>
            </motion.div>
        );
    }

    // ============================================
    // EXPANDED MODE: Supportive, Guided, Calming
    // ============================================
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 backdrop-blur-xl border border-blue-500/20 rounded-3xl shadow-2xl p-8 max-w-md"
        >
            {/* Guidance Header */}
            <AnimatePresence>
                {showGuidance && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 flex items-start gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20"
                    >
                        <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-blue-300 font-medium text-sm">Let me help you track this</p>
                            <p className="text-blue-300/70 text-xs mt-1">Fill in what you remember. Tap a suggestion below if it matches.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Suggestions */}
            <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick add
                </p>
                <div className="flex flex-wrap gap-2">
                    {quickSuggestions.map((sug) => (
                        <button
                            key={sug.label}
                            type="button"
                            onClick={() => handleSuggestion(sug)}
                            className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-all hover:scale-105"
                        >
                            {sug.label} <span className="text-green-400">${sug.amount}</span>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Amount - Large and prominent */}
                <div className="relative">
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Amount</label>
                    <DollarSign className="absolute left-4 bottom-4 w-6 h-6 text-green-400" />
                    <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white text-2xl font-medium placeholder-gray-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                        autoFocus
                    />
                </div>

                {/* Category with visual chips */}
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-2 text-sm rounded-lg border transition-all ${category === cat
                                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Merchant */}
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Where (optional)</label>
                    <input
                        type="text"
                        placeholder="e.g., Starbucks, Amazon"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20"
                    />
                </div>

                {/* Date */}
                <div className="relative">
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">When</label>
                    <Calendar className="absolute left-4 bottom-3.5 w-4 h-4 text-blue-400" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitted || !amount}
                    className={`w-full rounded-xl py-4 font-semibold text-lg transition-all flex items-center justify-center gap-2 ${submitted
                        ? "bg-green-500/20 text-green-400 border border-green-500/40"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/25"
                        }`}
                >
                    {submitted ? <><Check className="w-5 h-5" /> Saved!</> : "Add Expense"}
                </button>
            </form>
        </motion.div>
    );
}
