"use client";

import { useMemo } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingBag, Calendar } from "lucide-react";
import { useExpenses } from "@/context/ExpenseContext";

export const summaryCardsSchema = z.object({
    // Only used for schema definition now, data comes from context
    totalSpent: z.number().optional(),
    transactionCount: z.number().optional(),
    topCategory: z.string().optional(),
    avgPerDay: z.number().optional(),
});

export type SummaryCardsProps = z.infer<typeof summaryCardsSchema>;

export function SummaryCards({ }: SummaryCardsProps) {
    const { expenses } = useExpenses();

    const { totalSpent, transactionCount, topCategory, avgPerDay } = useMemo(() => {
        const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const count = expenses.length;

        // Count category totals
        const catTotals = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0);
            return acc;
        }, {} as Record<string, number>);

        let maxCat = "";
        let maxVal = 0;
        Object.entries(catTotals).forEach(([cat, val]) => {
            if (val > maxVal) {
                maxVal = val;
                maxCat = cat;
            }
        });

        const uniqueDates = new Set(expenses.map(e => e.date)).size || 1;
        const avg = count > 0 ? total / uniqueDates : 0;

        return {
            totalSpent: total,
            transactionCount: count,
            topCategory: maxCat,
            avgPerDay: avg
        };
    }, [expenses]);

    const cards = useMemo(() => [
        {
            label: "Total Spent",
            value: `$${totalSpent.toLocaleString()}`,
            icon: DollarSign,
            color: "from-green-500/20 to-emerald-500/10",
            iconColor: "text-green-400",
        },
        {
            label: "Transactions",
            value: transactionCount.toString(),
            icon: ShoppingBag,
            color: "from-blue-500/20 to-cyan-500/10",
            iconColor: "text-blue-400",
        },
        ...(topCategory ? [{
            label: "Top Category",
            value: topCategory,
            icon: Calendar,
            color: "from-purple-500/20 to-pink-500/10",
            iconColor: "text-purple-400",
        }] : []),
        {
            label: "Avg/Day",
            value: `$${avgPerDay.toFixed(0)}`,
            icon: TrendingUp,
            color: "from-orange-500/20 to-amber-500/10",
            iconColor: "text-orange-400",
        },
    ], [totalSpent, transactionCount, topCategory, avgPerDay]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl"
        >
            {cards.map((card, idx) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-gradient-to-br ${card.color} backdrop-blur-lg border border-white/10 rounded-xl p-4 relative overflow-hidden`}
                >
                    <card.icon className={`absolute top-3 right-3 w-8 h-8 ${card.iconColor} opacity-30`} />
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                </motion.div>
            ))}
        </motion.div>
    );
}
