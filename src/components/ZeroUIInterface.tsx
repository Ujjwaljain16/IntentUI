"use client";

import { useState, useRef, useEffect } from "react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, Command, Zap } from "lucide-react";
import { classifyIntent, debugClassify, type UIDensity } from "@/lib/intent-classifier";

// Locked 5 Canonical Demo Prompts
const DEMO_PROMPTS = [
    { text: "Add 500 for groceries", density: "MINIMAL" },
    { text: "Show my spending breakdown", density: "STANDARD" },
    { text: "Compare food vs transport", density: "STANDARD" },
    { text: "I think I'm overspending", density: "EXPANDED" },
    { text: "Export this", density: "MINIMAL" },
];

export function ZeroUIInterface() {
    const { thread } = useTamboThread();
    const { value, setValue, submit, isPending } = useTamboThreadInput();
    const [hasStarted, setHasStarted] = useState(false);
    const [currentDensity, setCurrentDensity] = useState<UIDensity>("STANDARD");
    const [showDensityBadge, setShowDensityBadge] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest component
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [thread.messages]);

    // Fade out density badge after 2 seconds (dev-only feature)
    useEffect(() => {
        if (showDensityBadge) {
            const timer = setTimeout(() => setShowDensityBadge(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showDensityBadge, currentDensity]);

    const handleDetailedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        // Classify intent and log for debugging
        const classification = classifyIntent(value);
        setCurrentDensity(classification.uiDensity);
        setShowDensityBadge(true); // Show badge temporarily
        debugClassify(value); // Console log for development

        submit();
        setHasStarted(true);

        // Clear input after submit has processed the value
        setTimeout(() => setValue(""), 100);
    };

    const handleReset = () => {
        setHasStarted(false);
        window.location.reload();
    };

    // Get only the LATEST rendered component (not stacking all)
    const allComponents = thread.messages
        .filter(msg => msg.renderedComponent)
        .map(msg => ({ id: msg.id, component: msg.renderedComponent }));

    // Only show the most recent component
    const latestComponent = allComponents.length > 0 ? allComponents[allComponents.length - 1] : null;

    // Auto-submit hint when clicked
    const handleHintClick = (text: string) => {
        setValue(text);
        // Trigger submit after a tiny delay to allow value to update
        setTimeout(() => {
            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
            const classification = classifyIntent(text);
            setCurrentDensity(classification.uiDensity);
            setShowDensityBadge(true);
            debugClassify(text);
            submit();
            setHasStarted(true);
            setTimeout(() => setValue(""), 100);
        }, 50);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
            {/* Background Ambient Glow - Changes with density */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{
                        backgroundColor: currentDensity === "MINIMAL" ? "rgba(34, 197, 94, 0.15)" :
                            currentDensity === "EXPANDED" ? "rgba(147, 51, 234, 0.15)" :
                                "rgba(59, 130, 246, 0.15)"
                    }}
                    transition={{ duration: 1 }}
                    className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]"
                />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />

                {/* Floating particles for extra magic - fixed positions to avoid hydration mismatch */}
                {[
                    { left: '10%', top: '20%' },
                    { left: '80%', top: '15%' },
                    { left: '25%', top: '70%' },
                    { left: '75%', top: '60%' },
                    { left: '50%', top: '40%' },
                    { left: '90%', top: '80%' },
                ].map((pos, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{ left: pos.left, top: pos.top }}
                        animate={{
                            y: [0, -15, 10, -8, 12, 0],
                            opacity: [0.15, 0.35, 0.15, 0.45, 0.2],
                        }}
                        transition={{
                            duration: 8 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col h-screen max-w-5xl mx-auto p-6">

                {/* Header (Only visible when active) */}
                <AnimatePresence>
                    {hasStarted && (
                        <motion.header
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-between items-center py-4 border-b border-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-white">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span>IntentUI</span>
                                </div>
                                {/* Density Indicator - Fades after 2s */}
                                <AnimatePresence>
                                    {showDensityBadge && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className={`text-[10px] px-2 py-0.5 rounded-full ${currentDensity === "MINIMAL" ? "bg-green-500/20 text-green-400" :
                                                currentDensity === "STANDARD" ? "bg-blue-500/20 text-blue-400" :
                                                    "bg-purple-500/20 text-purple-400"
                                                }`}
                                        >
                                            {currentDensity}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={handleReset}
                                className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" /> Clear
                            </button>
                        </motion.header>
                    )}
                </AnimatePresence>

                {/* Dynamic Component Area - Centered, with proper spacing */}
                <div className={`flex-1 overflow-y-auto py-12 no-scrollbar flex flex-col items-center ${latestComponent ? 'justify-start pt-20' : 'justify-center'}`}>
                    <div className="w-full max-w-2xl px-4">
                        <AnimatePresence mode="wait">
                            {latestComponent && (
                                <motion.div
                                    key={latestComponent.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-center"
                                >
                                    {latestComponent.component}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={scrollRef} />
                    </div>

                    <AnimatePresence>
                        {isPending && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-2 text-gray-500 text-sm"
                            >
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                <span>Materializing...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <motion.div
                    layout
                    initial={{ y: "40vh" }}
                    animate={{ y: hasStarted || value ? 0 : "35vh" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                    className="w-full"
                >
                    {/* Hero Text (Only on initial state) */}
                    {!hasStarted && !value && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                        >
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-300 uppercase tracking-wider">
                                    Generative UI • Tambo SDK
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                IntentUI
                            </h1>
                            <p className="text-gray-500 text-sm mb-1">
                                Interfaces that adapt to how you speak
                            </p>
                            <p className="text-gray-600 text-xs">
                                Demo: Personal Finance Layer
                            </p>
                        </motion.div>
                    )}

                    <form onSubmit={handleDetailedSubmit} className="relative group max-w-2xl mx-auto w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-full px-2 py-2 shadow-2xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
                            <div className="pl-4 pr-2 text-gray-500">
                                <Command className="w-5 h-5" />
                            </div>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-lg py-3 focus:outline-none"
                                placeholder={hasStarted ? "What's next?" : "What do you want to accomplish?"}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                autoFocus
                            />
                            <button
                                disabled={!value.trim() || isPending}
                                type="submit"
                                className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {/* Locked 5 Canonical Demo Prompts - Click to auto-submit */}
                    {!hasStarted && !value && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col items-center gap-3 mt-8"
                        >
                            <p className="text-xs text-gray-600 uppercase tracking-wider">Click to try:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {DEMO_PROMPTS.slice(0, 4).map((hint) => {
                                    // Color code by density
                                    const colorClass = hint.density === "MINIMAL"
                                        ? "border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
                                        : hint.density === "EXPANDED"
                                            ? "border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                                            : "border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50";

                                    return (
                                        <button
                                            key={hint.text}
                                            onClick={() => handleHintClick(hint.text)}
                                            className={`px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 rounded-full border transition-all ${colorClass}`}
                                        >
                                            {hint.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </motion.div>

            </div>
        </div>
    );
}
