"use client";

import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";

export const dynamicFormSchema = z.object({
    title: z.string().describe("The title of the form"),
    description: z.string().optional().describe("Helper text for the user"),
    fields: z.array(
        z.object({
            name: z.string().describe("The key for the data field"),
            label: z.string().describe("Human readable label"),
            type: z.enum(["text", "number", "date", "select", "email"]),
            placeholder: z.string().optional(),
            options: z.array(z.string()).optional().describe("Options for select inputs"),
        })
    ).describe("List of fields to render"),
    submitLabel: z.string().optional().default("Submit"),
});

export type DynamicFormProps = z.infer<typeof dynamicFormSchema>;

export function DynamicForm({ title, description, fields = [], submitLabel = "Submit" }: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        setSubmitted(true);
        // In a real app, this would call a tool or update generic state
        setTimeout(() => setSubmitted(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-2xl"
        >
            <div className="mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {title}
                </h3>
                {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field, idx) => (
                    <div key={field.name || idx} className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {field.label}
                        </label>
                        {field.type === "select" ? (
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData[field.name] || ""}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            >
                                <option value="" disabled>Select an option</option>
                                {field.options?.map((opt) => (
                                    <option key={opt} value={opt} className="text-black">{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                placeholder={field.placeholder}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData[field.name] || ""}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            />
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={submitted}
                    className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-all ${submitted
                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        }`}
                >
                    {submitted ? (
                        <>
                            <Check className="w-4 h-4" /> Sent
                        </>
                    ) : (
                        <>
                            {submitLabel} <Send className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
}
