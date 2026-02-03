"use client";

import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Trash2, ExternalLink, CheckCircle } from "lucide-react";
import { useState } from "react";

export const actionPanelSchema = z.object({
    title: z.string().optional(),
    actions: z.array(z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["primary", "danger", "neutral"]).default("neutral"),
        icon: z.enum(["download", "share", "delete", "link"]).optional(),
    })),
});

export type ActionPanelProps = z.infer<typeof actionPanelSchema>;

const iconMap = {
    download: Download,
    share: Share2,
    delete: Trash2,
    link: ExternalLink,
};

export function ActionPanel({ title, actions = [] }: ActionPanelProps) {
    const [completed, setCompleted] = useState<string | null>(null);

    const handleAction = (id: string) => {
        // Simulate action execution
        setCompleted(id);
        setTimeout(() => setCompleted(null), 2000);
    };

    // Guard against undefined actions
    if (!actions || actions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl min-w-[300px]"
            >
                <p className="text-gray-400 text-sm">No actions available</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl min-w-[300px]"
        >
            {title && <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">{title}</h4>}

            <div className="flex flex-col gap-2">
                {actions.map((action) => {
                    const Icon = action.icon ? iconMap[action.icon] : ExternalLink;
                    const isDone = completed === action.id;

                    let baseStyles = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ";

                    if (isDone) {
                        baseStyles += "bg-green-500/20 text-green-400 border-green-500/50 justify-center";
                    } else if (action.type === "primary") {
                        baseStyles += "bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20";
                    } else if (action.type === "danger") {
                        baseStyles += "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20";
                    } else {
                        baseStyles += "bg-white/5 hover:bg-white/10 text-gray-200 border-white/5";
                    }

                    return (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action.id)}
                            disabled={!!completed}
                            className={baseStyles}
                        >
                            <AnimatePresence mode="wait">
                                {isDone ? (
                                    <motion.div
                                        key="done"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Done
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="action"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 w-full"
                                    >
                                        <Icon className="w-4 h-4 opacity-70" />
                                        <span className="flex-1 text-left">{action.label}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}
