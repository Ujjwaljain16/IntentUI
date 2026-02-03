# Zero-UI V2: Context-Aware Adaptive Interface Platform

Zero-UI V2 upgrades the IntentUI experience from a static demo to a **Deterministic, Context-Aware Engine**. It introduces the concept of **UI Density** as a first-class primitive, allowing the interface to adapt its complexity based on User Confidence and Intent.

---

## 🧠 Core Architecture

The V2 Platform consists of three layers:

1.  **The Brain (Intent Engine)**: `src/lib/v2`
    - Analyzes user input for **Intent**, **Confidence**, and **Urgency**.
    - Deterministically calculates the optimal **UI Density**.
2.  **The Body (Density Context)**: `src/context/DensityContext.tsx`
    - Maintains global state (`currentDensity`, `userProfile`, `history`).
    - Decays manual overrides automatically.
    - Exposes "Explainability" (`why` this UI is shown).
3.  **The Limbs (Smart Components)**:
    - `ExpenseInput`, `SpendingChart`, etc.
    - Subscribe to `useDensity()` to adapt their layout **independently** of the AI.

---

## 🎛️ Key Concepts

### 1. UI Density
We support three distinct density modes:
- **MINIMAL 🟢**: For high-confidence, high-urgency, or expert users. Shows only the essential input/data. No friction.
- **STANDARD 🔵**: The default balanced state. Shows standard charts, tables, and labels.
- **EXPANDED 🟣**: For low-confidence, uncertain, or exploring users. Shows guidance, tips, suggestions, and verbose labels.

### 2. User Confidence
Confidence is calculated deterministically based on:
- **Linguistic Signals**: "I think", "maybe", "around" (Lowers confidence).
- **Behavioral Signals**: Backspaces, corrections (Lowers confidence).
- **History**: Successful actions (Increases confidence).

### 3. Urgency
- **HIGH**: "Now!", "Immediately" → Forces **MINIMAL** density (to reduce friction).
- **NORMAL**: Default.

---

## 🛠️ Developer Guide

### Using the Density Context

Wrap your application:
```tsx
import { DensityProvider } from "@/context/DensityContext";

export default function App() {
  return (
    <DensityProvider>
      <YourApp />
    </DensityProvider>
  );
}
```

### Making a Component "Density Aware"

Components should adapt automatically. Use the `useDensity` hook:

```tsx
import { useDensity } from "@/context/DensityContext";

export function SmartComponent() {
  const { currentDensity } = useDensity();
  const isMinimal = currentDensity === "MINIMAL";
  const isExpanded = currentDensity === "EXPANDED";

  if (isMinimal) {
    return <CompactView />;
  }

  return (
    <div>
       <StandardView />
       {isExpanded && <HelperText />}
    </div>
  );
}
```

### Processing User Input

To trigger the engine (e.g., from a chat input):

```tsx
const { actions } = useDensity();

const handleSubmit = (text: string) => {
  // This runs the engine, updates density, and logs history
  actions.processInput(text);
};
```

---

## ⚙️ Configuration

Tune the engine thresholds in `src/lib/v2/types.ts`:

```ts
export const CONFIDENCE_THRESHOLDS = {
    minimal: 0.8,   // Score >= 0.8 -> Minimal
    expanded: 0.75, // Score < 0.75 -> Expanded (Tuned for sensitivity)
};
```

---

## 🧪 Verification

Run the engine verification script:
```bash
npx tsx src/lib/v2/test-runner.ts
```

This verifies deterministic behavior for scenarios like:
- "Add 500" -> Minimal
- "I think I spent 50" -> Expanded
- "Delete it now!" -> Minimal (High Urgency)
