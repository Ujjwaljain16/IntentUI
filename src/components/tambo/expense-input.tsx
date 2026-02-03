"use client";

import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Check, Calendar, Sparkles, HelpCircle } from "lucide-react";
import { useTamboThread } from "@tambo-ai/react";
import { useExpenses } from "@/context/ExpenseContext";
import { useDensity } from "@/context/DensityContext";

export const expenseInputSchema = z.object({
    mode: z.enum(["minimal", "expanded"]).optional().describe("Hint for UI density (overridden by global Density Context)"),
    prefillAmount: z.number().optional().describe("Pre-filled amount if detected from user input"),
    prefillCategory: z.string().optional().describe("Pre-filled category if detected"),
    prefillMerchant: z.string().optional().describe("Pre-filled merchant name if mentioned"),
    prefillDate: z.string().optional().describe("Pre-filled date (ISO format) if mentioned"),
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
    const amountMatch = text.match(/\d+(\.\d+)?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : undefined;
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
    prefillAmount,
    prefillCategory,
    prefillMerchant,
    prefillDate,
}: ExpenseInputProps) {
    const { thread } = useTamboThread();

    // Connect to V2 Brain 🧠
    const { currentDensity, actions } = useDensity();

    // Auto-extract from last user message
    const extracted = useMemo(() => {
        const userMessages = thread.messages.filter(m => m.role === "user");
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage?.content && typeof lastUserMessage.content === "string") {
            return extractFromText(lastUserMessage.content);
        }
        return { amount: undefined, category: undefined };
    }, [thread.messages]);

    const finalAmount = prefillAmount ?? extracted.amount;
    const finalCategory = prefillCategory ?? extracted.category;

    const [amount, setAmount] = useState(finalAmount?.toString() || "");
    const [category, setCategory] = useState(finalCategory || "");
    const [merchant, setMerchant] = useState(prefillMerchant || "");
    const [date, setDate] = useState(prefillDate || new Date().toISOString().split("T")[0]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (finalAmount !== undefined && !amount) setAmount(finalAmount.toString());
        if (finalCategory && !category) setCategory(finalCategory);
    }, [finalAmount, finalCategory]);

    const { addExpense } = useExpenses();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addExpense({ amount: parseFloat(amount), category, merchant, date });
        setSubmitted(true);
        actions.recordSuccess(); // Notify V2 Engine of success (improves confidence)

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

    // Determine Logic based on Global Density
    const isExpanded = currentDensity === "EXPANDED";
    const isMinimal = currentDensity === "MINIMAL";

    // ============================================
    // SUCCESS STATE
    // ============================================
    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-2xl p-6 max-w-xs text-center"
            >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Saved!</h3>
                <p className="text-green-300 font-medium">${amount} • {category || "Uncategorized"}</p>
            </motion.div>
        );
    }

    // ============================================
    // MINIMAL MODE: Confident/Fast
    //Or STANDARD MODE (if not expanded)
    // ============================================
    if (!isExpanded) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 max-w-xs"
            >
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2.5 text-white text-base focus:ring-1 focus:ring-green-500/50"
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
                        className="w-full bg-green-500 text-white rounded-lg py-2.5 font-medium hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        Add Expense
                    </button>
                </form>
            </motion.div>
        );
    }

    // ============================================
    // EXPANDED MODE: Uncertain/Supportive
    // ============================================
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 backdrop-blur-xl border border-blue-500/20 rounded-3xl shadow-2xl p-8 max-w-md w-full"
        >
            {/* Guidance Header for Expanded Mode */}
            <div className="mb-6 flex items-start gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-blue-300 font-medium text-sm">Let's figure this out</p>
                    <p className="text-blue-300/70 text-xs mt-1">I noticed you were uncertain. Fill in what you can.</p>
                </div>
            </div>

            {/* Suggestions */}
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
                            className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 hover:scale-105 transition-all"
                        >
                            {sug.label} <span className="text-green-400">${sug.amount}</span>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Amount</label>
                    <DollarSign className="absolute left-4 bottom-4 w-6 h-6 text-green-400" />
                    <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white text-2xl font-medium focus:ring-2 focus:ring-green-500/50"
                        autoFocus
                    />
                </div>

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

                <div className="relative">
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">When</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitted || !amount}
                    className="w-full rounded-xl py-4 font-semibold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/25 transition-all"
                >
                    Add Expense
                </button>
            </form>
        </motion.div>
    );
}
