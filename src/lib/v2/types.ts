export type UIDensity = "MINIMAL" | "STANDARD" | "EXPANDED";

export type UrgencyLevel = "LOW" | "NORMAL" | "HIGH";

export const CONFIDENCE_THRESHOLDS = {
    minimal: 0.8,
    expanded: 0.75, // More sensitive to uncertainty
};

export interface UserConfidenceProfile {
    interactionsThisSession: number;
    successfulActions: number;
    backspaceCount: number; // Proxy for hesitation
    lastIntentChanged: boolean;
}

export interface IntentResult {
    type: string;
    description: string;
    confidence: number;
    urgency: UrgencyLevel;
    density: UIDensity;
    reasoning: string; // "Why" this density was chosen
}

export interface UIContext {
    currentDensity: UIDensity;
    userProfile: UserConfidenceProfile;
    history: IntentResult[];
}
