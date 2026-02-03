// Basic test runner for V2 Engine (run with tsx or node)
import { assessIntent } from "./engine";
import { UIContext } from "./types";

const mockContext: UIContext = {
    currentDensity: "STANDARD",
    history: [],
    userProfile: {
        interactionsThisSession: 5,
        successfulActions: 2,
        backspaceCount: 0,
        lastIntentChanged: false
    }
};

const testCases = [
    { input: "Add 500 dollars for food", desc: "Confident Action" },
    { input: "I think I spent around 50 maybe", desc: "Uncertainty" },
    { input: "Why am I broke", desc: "Reflective" },
    { input: "Delete it now!", desc: "Urgent Action" },
    { input: "Show my spending chart", desc: "Analytical" },
];

console.log("🚀 V2 Engine Verification Run\n");

testCases.forEach(test => {
    console.log(`Test: ${test.desc}`);
    console.log(`Input: "${test.input}"`);

    const result = assessIntent(test.input, mockContext);

    console.log(`-> Density: ${result.density}`);
    console.log(`-> Confidence: ${result.confidence.toFixed(2)}`);
    console.log(`-> Urgency: ${result.urgency}`);
    console.log(`-> Reason: ${result.reasoning}`);
    console.log("-".repeat(40));
});
