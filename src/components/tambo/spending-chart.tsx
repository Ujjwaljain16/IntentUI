"use client";

import { z } from "zod";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export const spendingChartSchema = z.object({
    type: z.enum(["pie", "bar"]).default("pie").describe("Chart type"),
    data: z.string().describe("JSON stringified array: [{name: string, value: number, color?: string}]"),
    title: z.string().optional(),
});

export type SpendingChartProps = z.infer<typeof spendingChartSchema>;

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

export function SpendingChart({ type = "pie", data = "[]", title }: SpendingChartProps) {
    let parsedData: Array<{ name: string; value: number; color?: string }> = [];

    try {
        parsedData = JSON.parse(data);
    } catch {
        if (data && data.endsWith("]")) {
            console.error("Failed to parse chart data");
        }
    }

    if (parsedData.length === 0) {
        return (
            <div className="w-full max-w-md h-64 flex items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-white/10">
                Loading chart...
            </div>
        );
    }

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
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px"
                                }}
                            />
                        </PieChart>
                    ) : (
                        <BarChart data={parsedData} layout="vertical">
                            <XAxis type="number" stroke="#666" />
                            <YAxis type="category" dataKey="name" stroke="#666" width={80} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px"
                                }}
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

            {/* Legend */}
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
        </motion.div>
    );
}
