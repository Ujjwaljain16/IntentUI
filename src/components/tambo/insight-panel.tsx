"use client";

import { z } from "zod";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles } from "lucide-react";

export const insightPanelSchema = z.object({
    insights: z.string().describe("JSON stringified array of insights: [{type: 'tip'|'warning'|'goal'|'insight', title: string, message: string}]"),
    mood: z.enum(["supportive", "analytical", "neutral"]).default("supportive").describe("Tone of the insights"),
});

export type InsightPanelProps = z.infer<typeof insightPanelSchema>;

const iconMap = {
    tip: Lightbulb,
    warning: AlertTriangle,
    goal: Target,
    insight: Sparkles,
    trend: TrendingUp,
};

const colorMap = {
    tip: { bg: "from-yellow-500/20 to-amber-500/10", icon: "text-yellow-400", border: "border-yellow-500/20" },
    warning: { bg: "from-red-500/20 to-orange-500/10", icon: "text-red-400", border: "border-red-500/20" },
    goal: { bg: "from-blue-500/20 to-cyan-500/10", icon: "text-blue-400", border: "border-blue-500/20" },
    insight: { bg: "from-purple-500/20 to-pink-500/10", icon: "text-purple-400", border: "border-purple-500/20" },
    trend: { bg: "from-green-500/20 to-emerald-500/10", icon: "text-green-400", border: "border-green-500/20" },
};

export function InsightPanel({ insights = "[]", mood = "supportive" }: InsightPanelProps) {
    let parsedInsights: Array<{ type: keyof typeof iconMap; title: string; message: string }> = [];

    try {
        parsedInsights = JSON.parse(insights);
    } catch {
        if (insights && insights.endsWith("]")) {
            console.error("Failed to parse insights");
        }
    }

    if (parsedInsights.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-3"
        >
            {mood === "supportive" && (
                <p className="text-sm text-gray-400 mb-4">
                    Here's what I noticed about your spending...
                </p>
            )}

            {parsedInsights.map((insight, idx) => {
                const Icon = iconMap[insight.type] || Sparkles;
                const colors = colorMap[insight.type] || colorMap.insight;

                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className={`bg-gradient-to-br ${colors.bg} backdrop-blur-lg border ${colors.border} rounded-xl p-4 flex gap-4`}
                    >
                        <div className={`shrink-0 w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div>
                            <h4 className="font-medium text-white">{insight.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">{insight.message}</p>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
