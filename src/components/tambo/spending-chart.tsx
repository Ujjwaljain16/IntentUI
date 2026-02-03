"use client";

import { z } from "zod";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useExpenses } from "@/context/ExpenseContext";
import { useDensity } from "@/context/DensityContext";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";

export const spendingChartSchema = z.object({
    type: z.enum(["pie", "bar"]).default("pie").describe("Chart type"),
    title: z.string().optional(),
});

export type SpendingChartProps = z.infer<typeof spendingChartSchema>;

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

export function SpendingChart({ type = "pie", title }: SpendingChartProps) {
    const { expenses } = useExpenses();
    const { currentDensity } = useDensity();

    const parsedData = useMemo(() => {
        const categoryData = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + (curr.amount || 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryData)
            .map(([name, value], index) => ({
                name,
                value,
                color: COLORS[index % COLORS.length]
            }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const total = parsedData.reduce((sum, item) => sum + item.value, 0);

    const isMinimal = currentDensity === "MINIMAL";
    const isExpanded = currentDensity === "EXPANDED";

    if (parsedData.length === 0) {
        return (
            <div className="w-full max-w-md h-32 flex items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-white/10 text-sm">
                No spending data yet
            </div>
        );
    }

    // ============================================
    // MINIMAL MODE: Top Insight Only (No heavy charts)
    // ============================================
    if (isMinimal) {
        const topItem = parsedData[0];
        const percent = total > 0 ? ((topItem.value / total) * 100).toFixed(0) : 0;

        return (
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 w-full max-w-xs flex items-center justify-between"
            >
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Top Spending</p>
                    <p className="text-white text-lg font-semibold mt-1">{topItem.name}</p>
                    <p className="text-green-400 text-sm">{percent}% of total</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                    <div
                        className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent -rotate-45"
                        style={{ opacity: Number(percent) / 100 }}
                    />
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
            </motion.div>
        );
    }

    // ============================================
    // STANDARD / EXPANDED: Full Visualization
    // ============================================
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 w-full max-w-md"
        >
            {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    {type === "pie" ? (
                        <PieChart>
                            <Pie
                                data={parsedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {parsedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#000",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff"
                                }}
                                itemStyle={{ color: "#fff" }}
                            />
                        </PieChart>
                    ) : (
                        <BarChart data={parsedData} layout="vertical">
                            <XAxis type="number" stroke="#666" tick={false} />
                            <YAxis type="category" dataKey="name" stroke="#666" width={80} tick={{ fill: '#888', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#000",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "#fff"
                                }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {parsedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Legend - Only in STANDARD (explicit) or EXPANDED */}
            {/* V2 Rule: Minimal = No Legend. Standard = Legend. Expanded = Legend + More? */}
            {/* Let's show legend in both Standard and Expanded for now as charts need legends */}
            {(type === "pie" || isExpanded) && (
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {parsedData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-400">{entry.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
