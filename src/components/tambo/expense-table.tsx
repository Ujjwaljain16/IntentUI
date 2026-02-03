"use client";

import { useMemo } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowUpDown, DollarSign, Tag, Calendar } from "lucide-react";
import { useExpenses } from "@/context/ExpenseContext";

export const expenseTableSchema = z.object({
    expenses: z.string().optional().describe("Legacy prop, ignored in favor of live context"),
    title: z.string().optional(),
    showTotal: z.boolean().optional().default(true),
});

export type ExpenseTableProps = z.infer<typeof expenseTableSchema>;

export function ExpenseTable({ title, showTotal = true }: ExpenseTableProps) {
    const { expenses } = useExpenses();
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = useMemo(() =>
        sortedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
        [sortedExpenses]
    );

    if (sortedExpenses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-xl bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-500"
            >
                No expenses recorded yet. Try adding one!
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden"
        >
            {title && (
                <div className="px-5 py-4 border-b border-white/10">
                    <h3 className="font-semibold text-white">{title}</h3>
                </div>
            )}

            <div className="divide-y divide-white/5">
                {sortedExpenses.map((expense, idx) => (
                    <motion.div
                        key={expense.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">
                                    {expense.merchant || expense.category}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <Tag className="w-3 h-3" />
                                    <span>{expense.category}</span>
                                    <span>•</span>
                                    <Calendar className="w-3 h-3" />
                                    <span>{expense.date}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-lg font-semibold text-white">
                            ${expense.amount.toLocaleString()}
                        </p>
                    </motion.div>
                ))}
            </div>

            {showTotal && (
                <div className="px-5 py-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-xl font-bold text-green-400">${total.toLocaleString()}</span>
                </div>
            )}
        </motion.div>
    );
}
