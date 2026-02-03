# ⚡ IntentUI

> **Generative UI that adapts to how you speak.**

An intent-adaptive UI engine built with **Tambo's React SDK** that morphs its density and complexity based on user confidence and emotional tone.

> [!NOTE]
> **Demo Domain: Personal Finance**  
> The finance components (expenses, charts, insights) are a demonstration layer. The real innovation is the **Intent-Adaptive UI Engine** which could power any domain—healthcare, productivity, e-commerce, etc.

---

## 🚀 Hackathon Submission: "The UI Strikes Back"

### ✅ Build Anything — We built an **Intent-Adaptive UI Engine**
### ✅ Generative UI — Powered entirely by **Tambo's React SDK**

---

## 🎯 The Problem

Traditional interfaces are static. Users must adapt to the software—clicking through the same complex forms whether they're confident or confused, in a rush or exploring.

**The result?** Friction everywhere.
- 🏃 Experts are slowed by hand-holding
- 😵 Beginners are overwhelmed by options
- 💔 Emotional context is ignored entirely

---

## 💡 Our Insight

**What if the UI could read the room?**

We noticed that how users *speak* reveals their mental state:

| User Says | Mental State | UI Response |
|-----------|--------------|-------------|
| `"Add 500 groceries"` | Confident, wants speed | Compact form, pre-filled |
| `"I think I spent something..."` | Uncertain, needs guidance | Spacious form with suggestions |
| `"Why am I always broke?"` | Emotional, needs support | Insights + supportive messaging |

---

## 🎨 The Three UI Densities

**IntentUI classifies user intent and maps to optimal UI density:**

| Density | When Used | Visual Feel |
|---------|-----------|-------------|
| 🟢 **MINIMAL** | Confident actions | Compact, fast, one CTA, green glow |
| 🔵 **STANDARD** | Analytical queries | Charts, tables, balanced, blue glow |
| 🟣 **EXPANDED** | Uncertain/emotional | Spacious, guided, supportive, purple glow |

> **The background color itself changes!** Watch the ambient glow shift as you interact.

---

## 🤖 Powered by Tambo Generative UI

This project uses **100% Tambo-driven component selection**:

```typescript
// We don't write if/else for components. Tambo decides!
const components: TamboComponent[] = [
  {
    name: "ExpenseInput",
    description: `Form to add expenses. CRITICAL RULES:
      - Extract amount from user input and pass as prefillAmount
      - Use mode="minimal" when user is CONFIDENT
      - Use mode="expanded" when user is UNCERTAIN`,
    component: ExpenseInput,
    propsSchema: expenseInputSchema,
  },
  // ... more components
];
```

**How Tambo is Used:**
1. **Component Registration** — 6 components with intent-aware descriptions
2. **AI Component Selection** — Tambo reads the descriptions and picks components
3. **Prop Streaming** — Props pre-filled from user's natural language
4. **Context Helpers** — Additional guidelines passed to AI for density rules

---

### 🔍 Responsibility Split

* **Intent Classifier** → *What is the user trying to do? How confident do they sound?*
* **Tambo** → *Which components should exist right now, and with what props?*

> **Note:**
> Intent classification and UI density mapping are deterministic and explainable. No opaque ML models are used for the core logic—every UI decision can be traced to intent type + confidence level.

---

## 🏗️ System Architecture

```
User Input: "Add 500 for groceries"
                ↓
┌──────────────────────────────┐
│     Intent Classifier        │  ← Detects: ACTION + CONFIDENT
│   (lib/intent-classifier.ts) │
└──────────────────────────────┘
                ↓
┌──────────────────────────────┐
│      Density Mapper          │  ← Maps to: MINIMAL
└──────────────────────────────┘
                ↓
┌──────────────────────────────┐
│    Tambo AI Engine           │  ← Selects: ExpenseInput(mode="minimal")
│   (via TamboProvider)        │     Prefills: amount=500, category="Food"
└──────────────────────────────┘
                ↓
         🎯 Dynamic UI
     Compact form, pre-filled
       🎉 Confetti on save!
```

---

## 🧩 Component Set (Frozen for Demo)

We intentionally limited to **6 components** with strict rules:

| Component | Purpose | Density Rules |
|-----------|---------|---------------|
| `ExpenseInput` | Add expenses | MINIMAL: compact • EXPANDED: guided with suggestions |
| `ExpenseTable` | Transaction list | ANALYTICAL mode only |
| `SpendingChart` | Pie/Bar charts | STANDARD + EXPANDED |
| `SummaryCards` | Key metrics | STANDARD + EXPANDED |
| `InsightPanel` | Emotional support | **EXPANDED only** (never for confident users) |
| `ActionPanel` | Export/Share | Explicit action verbs only |

> **Why freeze components?**  
> To prove the innovation is in *orchestration*, not *features*.

---

## 🎬 Demo Flow (Click-to-Run Prompts)

The app includes **5 core demo prompts** (click to auto-run):

| # | Prompt | Expected UI | Density |
|---|--------|-------------|---------|
| 1 | "Add 500 for groceries" | Compact form, pre-filled | 🟢 MINIMAL |
| 2 | "Show my spending breakdown" | Pie chart + summary cards | 🔵 STANDARD |
| 3 | "Compare food vs transport" | Bar chart comparison | 🔵 STANDARD |
| 4 | "I think I'm overspending" | Insights + guidance + chart | 🟣 EXPANDED |
| 5 | "Export this" | Quick action panel | 🟢 MINIMAL |

> **Watch the background glow change color with each prompt!**

---

## ✨ Polish Features

- 🎉 **Confetti celebration** when expense is saved
- ✨ **Floating particles** in background
- 🎨 **Color-coded demo hints** (green/blue/purple by density)
- ⚡ **Auto-submit hints** — click to run immediately
- 🔄 **Smooth transitions** — AnimatePresence for enter/exit
- 📱 **Smart prefilling** — extracts amount & category from natural language

---

## 🚀 Quick Start

```bash
git clone [repo-url]
cd zero-ui-workspace
npm install
npm run dev
```

Add your Tambo API key to `.env.local`:
```
NEXT_PUBLIC_TAMBO_API_KEY=your_key_here
```

---

## 🏆 What Makes This Different

| Traditional Generative UI | IntentUI |
|---------------------------|----------|
| Same UI for everyone | UI adapts to user emotional state |
| Static layouts | Components appear/disappear based on need |
| Feature-driven | **Emotion-aware** |
| More = better | Less = faster (when appropriate) |

**Our thesis:**  
> The best interface is one that exists only when useful—and at exactly the right density.

---

## 🔧 Tech Stack

- **Framework:** Next.js 15 + React 19
- **Generative UI:** Tambo React SDK (`@tambo-ai/react`)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **Celebration:** canvas-confetti 🎉

---

## 👤 Built by

**Ujjwal Jain**  
Solo submission for "The UI Strikes Back" Hackathon

---

## 📝 License

MIT
