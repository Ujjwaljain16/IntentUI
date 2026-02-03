"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { UIDensity, UserConfidenceProfile, IntentResult, UIContext } from "@/lib/v2/types";
import { assessIntent } from "@/lib/v2/engine";

interface DensityContextType {
    currentDensity: UIDensity;
    why: string;
    lastIntent: IntentResult | null;
    isOverrideActive: boolean;
    actions: {
        processInput: (text: string) => void;
        setManualOverride: (density: UIDensity) => void;
        recordSuccess: () => void;
    };
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

const INITIAL_PROFILE: UserConfidenceProfile = {
    interactionsThisSession: 0,
    successfulActions: 0,
    backspaceCount: 0,
    lastIntentChanged: false,
};

export function DensityProvider({ children }: { children: ReactNode }) {
    const [density, setDensity] = useState<UIDensity>("STANDARD");
    const [reasoning, setReasoning] = useState<string>("Initial state");
    const [lastIntent, setLastIntent] = useState<IntentResult | null>(null);
    const [userProfile, setUserProfile] = useState<UserConfidenceProfile>(INITIAL_PROFILE);

    // Manual override state
    const [manualOverride, setManualOverride] = useState<UIDensity | null>(null);

    const processInput = useCallback((text: string) => {
        // Update profile
        const newProfile = {
            ...userProfile,
            interactionsThisSession: userProfile.interactionsThisSession + 1,
            // Simple heuristic: if text length changed significantly vs last time, might be backspacing
            // (Skipped for now, keeping it simple)
        };
        setUserProfile(newProfile);

        // Build context for engine
        const context: UIContext = {
            currentDensity: density,
            userProfile: newProfile,
            history: lastIntent ? [lastIntent] : [], // Simplified history
        };

        // RUN THE BRAIN 🧠
        const result = assessIntent(text, context);

        // Handle Override Decay
        let activeOverride = manualOverride;
        if (manualOverride) {
            // Rule: Decay on intent change
            if (lastIntent && result.type !== lastIntent.type) {
                console.log("[Density] Intent changed, clearing manual override.");
                setManualOverride(null);
                activeOverride = null;
            }
        }

        // Apply Density (unless override is active)
        if (activeOverride) {
            setDensity(activeOverride);
            setReasoning(`Manual Override Active (User preferred ${activeOverride})`);
        } else {
            setDensity(result.density);
            setReasoning(result.reasoning);
        }

        setLastIntent(result);
    }, [density, userProfile, lastIntent, manualOverride]);

    const handleManualOverride = (newDensity: UIDensity) => {
        setManualOverride(newDensity);
        setDensity(newDensity);
        setReasoning("User manually overrode density");
    };

    const recordSuccess = () => {
        setUserProfile(prev => ({
            ...prev,
            successfulActions: prev.successfulActions + 1
        }));
        // Success also clears override?
        // Rule: "Lasts until next successful action"
        if (manualOverride) {
            setManualOverride(null);
        }
    };

    return (
        <DensityContext.Provider value={{
            currentDensity: density,
            why: reasoning,
            lastIntent,
            isOverrideActive: !!manualOverride,
            actions: {
                processInput,
                setManualOverride: handleManualOverride,
                recordSuccess
            }
        }}>
            {children}
        </DensityContext.Provider>
    );
}

export function useDensity() {
    const context = useContext(DensityContext);
    if (context === undefined) {
        throw new Error("useDensity must be used within a DensityProvider");
    }
    return context;
}
