"use client";

import { ZeroUIInterface } from "@/components/ZeroUIInterface";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, type ContextHelpers } from "@tambo-ai/react";
import { ExpenseProvider, useExpenses } from "@/context/ExpenseContext";
import { DensityProvider, useDensity } from "@/context/DensityContext";

/**
 * IntentUI Context Helper
 * 
 * Provides additional context to guide the AI's component selection.
 * This is how we communicate intent-awareness to Tambo.
 */
const AppContent = () => {
  const mcpServers = useMcpServers();
  const { expenses } = useExpenses();
  const { currentDensity, why } = useDensity();

  // Dynamic context that includes current expenses so AI can see them!
  const dynamicContextHelpers: ContextHelpers = {
    intentGuidance: () => ({
      name: "IntentUI Guidelines",
      content: `
## IntentUI Component Selection Rules (V2 Engine Active)

You are IntentUI, a finance assistant that adapts UI based on user intent.

### CURRENT SYSTEM STATE (Computed Deterministically):
- **UI Density Mode:** ${currentDensity}
- **Reasoning:** ${why}
- **User Expenses:** ${expenses.length} items, Total: $${expenses.reduce((sum, e) => sum + e.amount, 0)}

### CRITICAL: Respect the Density Mode
- If density is **MINIMAL**: Render ONLY the most essential component (usually ExpenseInput with minimal props).
- If density is **STANDARD**: Render standard components (Charts, Tables).
- If density is **EXPANDED**: Render InsightPanel and guided inputs.

### CURRENT USER DATA (In-Memory):
Recent expenses: ${JSON.stringify(expenses.slice(0, 5))}

### CRITICAL: Always Extract and Prefill Values
When user mentions an amount or category, you MUST pass them to ExpenseInput:
- "Add 500 groceries" → prefillAmount=500, prefillCategory="Food"
- "Log 50 uber" → prefillAmount=50, prefillCategory="Transport"
- "Save 1200 rent" → prefillAmount=1200, prefillCategory="Bills"

Category Mapping:
- groceries, food, coffee, lunch, dinner → "Food"
- uber, taxi, gas, metro, bus → "Transport"
- amazon, clothes, shoes → "Shopping"
- rent, electricity, wifi, insurance → "Bills"
- movies, netflix, games → "Entertainment"
- doctor, medicine, gym → "Health"

### Other Components:
- "Show spending" → SpendingChart (pie) + SummaryCards
- "Compare X vs Y" → SpendingChart (bar)
- "Why am I broke?" → InsightPanel + SpendingChart
- "Export" → ActionPanel
      `.trim(),
    }),
  };

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      contextHelpers={dynamicContextHelpers}
    >
      <ZeroUIInterface />
    </TamboProvider>
  );
};

export default function Home() {
  return (
    <ExpenseProvider>
      <DensityProvider>
        <AppContent />
      </DensityProvider>
    </ExpenseProvider>
  );
}
