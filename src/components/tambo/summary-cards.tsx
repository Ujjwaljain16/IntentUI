"use client";

import { useMemo } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Calendar } from "lucide-react";

export const summaryCardsSchema = z.object({
    totalSpent: z.number().describe("Total amount spent"),
    transactionCount: z.number().describe("Number of transactions"),
    topCategory: z.string().optional().describe("Most spent category"),
    avgPerDay: z.number().optional().describe("Average spending per day"),
    trend: z.enum(["up", "down", "stable"]).optional().describe("Spending trend"),
    trendPercent: z.number().optional().describe("Trend percentage change"),
});

export type SummaryCardsProps = z.infer<typeof summaryCardsSchema>;

export function SummaryCards({
    totalSpent = 0,
    transactionCount = 0,
    topCategory,
    avgPerDay,
    trend,
    trendPercent
}: SummaryCardsProps) {
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
        ...(avgPerDay !== undefined ? [{
            label: "Avg/Day",
            value: `$${avgPerDay.toFixed(0)}`,
            icon: trend === "up" ? TrendingUp : TrendingDown,
            color: trend === "up" ? "from-red-500/20 to-orange-500/10" : "from-green-500/20 to-teal-500/10",
            iconColor: trend === "up" ? "text-red-400" : "text-green-400",
            badge: trendPercent ? `${trend === "up" ? "+" : "-"}${trendPercent}%` : undefined,
        }] : []),
    ], [totalSpent, transactionCount, topCategory, avgPerDay, trend, trendPercent]);

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
                    {card.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${trend === "up" ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"
                            }`}>
                            {card.badge}
                        </span>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
}
