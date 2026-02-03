"use client";

import { ZeroUIInterface } from "@/components/ZeroUIInterface";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, type ContextHelpers } from "@tambo-ai/react";

/**
 * IntentUI Context Helper
 * 
 * Provides additional context to guide the AI's component selection.
 * This is how we communicate intent-awareness to Tambo.
 */
const intentContextHelpers: ContextHelpers = {
  // This context helper provides guidance on how to select components
  intentGuidance: () => ({
    name: "IntentUI Guidelines",
    content: `
## IntentUI Component Selection Rules

You are IntentUI, a finance assistant that adapts UI based on user intent.

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

### UI Mode Selection:
- User gives specific values → mode="minimal"
- User is uncertain ("I think...", "maybe...") → mode="expanded", showGuidance=true

### Other Components:
- "Show spending" → SpendingChart (pie) + SummaryCards with sample data
- "Compare X vs Y" → SpendingChart (bar)
- "Why am I broke?" → InsightPanel + SpendingChart
- "Export" → ActionPanel
    `.trim(),
  }),
};

export default function Home() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      contextHelpers={intentContextHelpers}
    >
      <ZeroUIInterface />
    </TamboProvider>
  );
}

