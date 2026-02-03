"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowUpDown, Search } from "lucide-react";

export const smartTableSchema = z.object({
    title: z.string().optional(),
    columns: z.array(z.object({
        key: z.string(),
        header: z.string(),
    })).describe("Column definitions"),
    data: z.string().describe("JSON stringified array of data objects. Example: '[{\"name\":\"A\", \"val\":1}]'"),
});

export type SmartTableProps = z.infer<typeof smartTableSchema>;

export function SmartTable({ title, columns = [], data = "[]" }: SmartTableProps) {
    const [filter, setFilter] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const parsedData = useMemo(() => {
        try {
            return JSON.parse(data) as Record<string, any>[];
        } catch {
            // Silent fail during streaming - only log if data looks complete but still fails
            if (data && data.endsWith("]")) {
                console.error("Failed to parse complete table data:", data);
            }
            return [];
        }
    }, [data]);

    const filteredData = useMemo(() => {
        return parsedData
            .filter((row) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(filter.toLowerCase())
                )
            )
            .sort((a, b) => {
                if (!sortKey) return 0;
                const valA = a[sortKey];
                const valB = b[sortKey];
                if (valA < valB) return sortDir === "asc" ? -1 : 1;
                if (valA > valB) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
    }, [parsedData, filter, sortKey, sortDir]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
                {title && <h3 className="font-semibold text-white truncate">{title}</h3>}
                <div className="relative flex-1 max-w-xs ml-auto">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Filter..."
                        className="w-full bg-black/20 border-none rounded-md py-1.5 pl-8 pr-3 text-sm text-white focus:ring-1 focus:ring-blue-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-black/20">
                        <tr>
                            {columns.map((col, colIdx) => (
                                <th
                                    key={col.key || colIdx}
                                    className="px-6 py-3 cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                {columns.map((col, colIdx) => (
                                    <td key={col.key || colIdx} className="px-6 py-4 text-gray-300">
                                        {String(row[col.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    No match found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-2 border-t border-white/10 text-xs text-gray-500 text-right bg-black/20">
                {filteredData.length} records
            </div>
        </motion.div>
    );
}
