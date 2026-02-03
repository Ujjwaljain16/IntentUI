/**
 * @file intent-classifier.ts
 * @description IntentUI Core Intelligence
 * 
 * This file contains the UI Decision Engine:
 * - Intent classification (what does the user want?)
 * - Confidence detection (how sure are they?)
 * - UI Density mapping (how much interface to show?)
 * 
 * This is the BRAIN of IntentUI.
 */

// ============================================
// TYPES (The Contract)
// ============================================

/**
 * UI Density determines how much interface to render.
 * - MINIMAL: Fast, confident actions (few fields, one button)
 * - STANDARD: Analytical queries (charts, tables, balanced layout)
 * - EXPANDED: Uncertain/emotional users (guidance, tips, more space)
 */
export type UIDensity = "MINIMAL" | "STANDARD" | "EXPANDED";

/**
 * Intent Type captures WHAT the user wants to do.
 * - ACTION: Add, delete, export, save (transactional)
 * - ANALYTICAL: Show, compare, analyze, list (viewing data)
 * - REFLECTIVE: Why, help, understand, insight (seeking guidance)
 */
export type IntentType = "ACTION" | "ANALYTICAL" | "REFLECTIVE";

/**
 * Confidence Level captures HOW SURE the user sounds.
 * - CONFIDENT: Direct commands, specific values ("Add 300 food")
 * - UNCERTAIN: Hedging, vague ("I think I spent something...")
 * - EMOTIONAL: Frustration, seeking help ("Why am I always broke?")
 */
export type ConfidenceLevel = "CONFIDENT" | "UNCERTAIN" | "EMOTIONAL";

/**
 * The complete intent classification result.
 */
export interface IntentClassification {
    intentType: IntentType;
    confidenceLevel: ConfidenceLevel;
    uiDensity: UIDensity;
}

// ============================================
// CLASSIFICATION SIGNALS (Pattern Matching)
// ============================================

const ACTION_SIGNALS = [
    "add", "create", "save", "delete", "remove", "export", "share", "log", "record"
];

const ANALYTICAL_SIGNALS = [
    "show", "display", "list", "compare", "analyze", "breakdown", "chart",
    "graph", "visualize", "trend", "history", "recent", "spending"
];

const REFLECTIVE_SIGNALS = [
    "why", "help", "understand", "insight", "advice", "tips", "suggest",
    "how do i", "what should", "improve", "better", "broke", "too much"
];

const UNCERTAINTY_SIGNALS = [
    "i think", "maybe", "probably", "not sure", "i guess", "something like",
    "around", "approximately", "ish", "don't remember", "forgot"
];

const EMOTIONAL_SIGNALS = [
    "always", "never", "hate", "love", "stressed", "worried", "anxious",
    "broke", "struggling", "frustrated", "confused", "overwhelmed", "bad"
];

// ============================================
// CLASSIFICATION LOGIC
// ============================================

/**
 * Classifies user input into intent type, confidence, and UI density.
 * This is the core decision function that drives the entire UI.
 * 
 * @param userInput - The raw user message
 * @returns IntentClassification with type, confidence, and density
 */
export function classifyIntent(userInput: string): IntentClassification {
    const input = userInput.toLowerCase().trim();

    // Detect intent type
    const intentType = detectIntentType(input);

    // Detect confidence level
    const confidenceLevel = detectConfidenceLevel(input);

    // Map to UI density
    const uiDensity = mapToUIDensity(intentType, confidenceLevel);

    return { intentType, confidenceLevel, uiDensity };
}

/**
 * Detects the primary intent type from user input.
 */
function detectIntentType(input: string): IntentType {
    // Check for reflective first (usually takes priority for emotional users)
    if (REFLECTIVE_SIGNALS.some(signal => input.includes(signal))) {
        return "REFLECTIVE";
    }

    // Check for action intent
    if (ACTION_SIGNALS.some(signal => input.includes(signal))) {
        return "ACTION";
    }

    // Check for analytical intent
    if (ANALYTICAL_SIGNALS.some(signal => input.includes(signal))) {
        return "ANALYTICAL";
    }

    // Default to action (most common)
    return "ACTION";
}

/**
 * Detects how confident the user sounds.
 */
function detectConfidenceLevel(input: string): ConfidenceLevel {
    // Emotional signals take priority
    if (EMOTIONAL_SIGNALS.some(signal => input.includes(signal))) {
        return "EMOTIONAL";
    }

    // Check for uncertainty
    if (UNCERTAINTY_SIGNALS.some(signal => input.includes(signal))) {
        return "UNCERTAIN";
    }

    // Check for specific numbers (sign of confidence)
    const hasSpecificNumber = /\$?\d+(\.\d{1,2})?/.test(input);
    if (hasSpecificNumber) {
        return "CONFIDENT";
    }

    // Default to confident for short, direct messages
    if (input.length < 30) {
        return "CONFIDENT";
    }

    return "UNCERTAIN";
}

/**
 * Maps intent + confidence to UI density.
 * This is the core decision matrix.
 */
function mapToUIDensity(intentType: IntentType, confidenceLevel: ConfidenceLevel): UIDensity {
    // EXPANDED: Always for uncertain or emotional users
    if (confidenceLevel === "UNCERTAIN" || confidenceLevel === "EMOTIONAL") {
        return "EXPANDED";
    }

    // MINIMAL: Confident actions
    if (intentType === "ACTION" && confidenceLevel === "CONFIDENT") {
        return "MINIMAL";
    }

    // STANDARD: Analytical queries (confident)
    if (intentType === "ANALYTICAL") {
        return "STANDARD";
    }

    // EXPANDED: Reflective always gets more support
    if (intentType === "REFLECTIVE") {
        return "EXPANDED";
    }

    // Default to standard
    return "STANDARD";
}

// ============================================
// DEBUG HELPER (For development)
// ============================================

/**
 * Logs the classification result for debugging.
 * Call this during development to verify intent detection.
 */
export function debugClassify(userInput: string): void {
    const result = classifyIntent(userInput);
    console.log(`
[IntentUI Classification]
Input: "${userInput}"
Intent Type: ${result.intentType}
Confidence: ${result.confidenceLevel}
UI Density: ${result.uiDensity}
  `.trim());
}
