import {
    CONFIDENCE_THRESHOLDS,
    IntentResult,
    UIContext,
    UIDensity,
    UrgencyLevel
} from "./types";

// ============================================
// SIGNALS (Linguistic Heuristics)
// ============================================

const UNCERTAINTY_SIGNALS = [
    "think", "maybe", "probably", "not sure", "guess", "ish",
    "forgot", "don't remember", "unsure", "might"
];

const REFLECTIVE_SIGNALS = [
    "why", "help", "understand", "insight", "tips", "suggest",
    "how to", "what should", "broke", "struggling"
];

const URGENCY_HIGH_SIGNALS = [
    "now", "asap", "immediately", "urgent", "emergency", "fast", "quick"
];

const ANALYTICAL_SIGNALS = [
    "show", "graph", "chart", "compare", "analyze", "list", "history", "trend"
];

// ============================================
// CORE ENGINE
// ============================================

/**
 * The V2 UI Decision Engine.
 * Evaluates input + context to determinstically decide UI Density.
 */
export function assessIntent(input: string, context: UIContext): IntentResult {
    const text = input.toLowerCase().trim();

    // 1. Detect Base Signals
    const intentType = detectIntentType(text);
    const urgency = detectUrgency(text);

    // 2. Compute Confidence Score (0.0 - 1.0)
    const confidence = computeConfidence(text, context);

    // 3. Resolve Density
    const { density, reasoning } = resolveDensity(intentType, confidence, urgency, context);

    return {
        type: intentType,
        description: input, // In real app, this would be an extracted summary
        confidence,
        urgency,
        density,
        reasoning
    };
}

// ============================================
// HELPERS
// ============================================

function detectIntentType(text: string): string {
    if (REFLECTIVE_SIGNALS.some(s => text.includes(s))) return "REFLECTIVE";
    if (ANALYTICAL_SIGNALS.some(s => text.includes(s))) return "ANALYTICAL";
    return "ACTION"; // Default
}

function detectUrgency(text: string): UrgencyLevel {
    if (text.includes("!")) return "HIGH";
    if (URGENCY_HIGH_SIGNALS.some(s => text.includes(s))) return "HIGH";
    return "NORMAL";
}

function computeConfidence(text: string, context: UIContext): number {
    let score = 1.0;

    // Linguistic Penalties
    if (UNCERTAINTY_SIGNALS.some(s => text.includes(s))) score -= 0.4;
    if (REFLECTIVE_SIGNALS.some(s => text.includes(s))) score -= 0.2;

    // Behavioral Penalties (from context)
    // If user has been backspacing/editing a lot, reduce confidence
    if (context.userProfile.backspaceCount > 5) score -= 0.1;
    if (context.userProfile.lastIntentChanged) score -= 0.1;

    // Boosts
    // Specific numbers usually imply confidence ("500", "$20")
    if (/\d+/.test(text)) score += 0.1;

    // Cap
    return Math.min(Math.max(score, 0), 1);
}

function resolveDensity(
    type: string,
    confidence: number,
    urgency: UrgencyLevel,
    context: UIContext
): { density: UIDensity; reasoning: string } {

    // Rule 1: Reflection always gets Expanded (unless expert? V3 idea)
    if (type === "REFLECTIVE") {
        return {
            density: "EXPANDED",
            reasoning: "User is seeking guidance (Reflective Intent)"
        };
    }

    // Rule 2: Low Confidence -> Expanded
    if (confidence < CONFIDENCE_THRESHOLDS.expanded) {
        return {
            density: "EXPANDED",
            reasoning: `Confidence (${confidence.toFixed(2)}) is below threshold (${CONFIDENCE_THRESHOLDS.expanded})`
        };
    }

    // Rule 3: High Urgency -> Minimal (Get out of the way)
    if (urgency === "HIGH") {
        return {
            density: "MINIMAL",
            reasoning: "High urgency detected - prioritizing speed"
        };
    }

    // Rule 4: High Confidence Actions -> Minimal
    if (type === "ACTION" && confidence >= CONFIDENCE_THRESHOLDS.minimal) {
        return {
            density: "MINIMAL",
            reasoning: `Confidence (${confidence.toFixed(2)}) is high for Action`
        };
    }

    // Default: Standard
    return {
        density: "STANDARD",
        reasoning: "Default density for balanced interaction"
    };
}
