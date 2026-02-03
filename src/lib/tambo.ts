/**
 * @file tambo.ts
 * @description IntentUI Component Registry
 * 
 * This registry enables the AI to render finance components based on user intent.
 * The AI chooses components based on:
 * - Intent Type: ACTION / ANALYTICAL / REFLECTIVE
 * - Clarity: CONFIDENT / UNCERTAIN / EMOTIONAL
 */

import { ExpenseInput, expenseInputSchema } from "@/components/tambo/expense-input";
import { ExpenseTable, expenseTableSchema } from "@/components/tambo/expense-table";
import { SpendingChart, spendingChartSchema } from "@/components/tambo/spending-chart";
import { SummaryCards, summaryCardsSchema } from "@/components/tambo/summary-cards";
import { InsightPanel, insightPanelSchema } from "@/components/tambo/insight-panel";
import { ActionPanel, actionPanelSchema } from "@/components/tambo/action-panel";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";

/**
 * IntentUI Components - The 6 Frozen Components
 * 
 * COMPONENT PRESENCE RULES (Strict):
 * - ExpenseInput    → Use for ALL action intents (add/log expense)
 * - ExpenseTable    → ONLY for "show history" / "recent expenses" queries
 * - SpendingChart   → Use for ANALYTICAL intents (breakdown, comparison)
 * - SummaryCards    → Use for ANALYTICAL/REFLECTIVE (quick overview)
 * - InsightPanel    → ONLY for UNCERTAIN/EMOTIONAL users (NEVER for confident)
 * - ActionPanel     → ONLY for explicit action verbs (export/delete/share)
 */
export const components: TamboComponent[] = [
  {
    name: "ExpenseInput",
    description: `Form to add expenses. CRITICAL RULES:
- Extract amount from user input and pass as prefillAmount (e.g. "Add 500 groceries" → prefillAmount=500)
- Extract category and map to: Food, Transport, Shopping, Bills, Entertainment, Health, Other
  Examples: groceries/food/coffee/lunch → "Food", uber/taxi/gas → "Transport", rent/electricity → "Bills"
- Use mode="minimal" when user gives specific values
- Use mode="expanded" + showGuidance=true when user is uncertain ("I think...", "maybe...")
EXAMPLE: "Add 300 for uber" → ExpenseInput with mode="minimal", prefillAmount=300, prefillCategory="Transport"`,
    component: ExpenseInput,
    propsSchema: expenseInputSchema,
  },
  {
    name: "ExpenseTable",
    description: `Transaction list. RULES:
- ONLY use for explicit "show history" / "recent expenses" / "list transactions" requests
- DO NOT use for action intents
- Generate realistic sample data with dates, merchants, amounts, categories`,
    component: ExpenseTable,
    propsSchema: expenseTableSchema,
  },
  {
    name: "SpendingChart",
    description: `Charts for spending visualization. RULES:
- Use type="pie" for category breakdowns (e.g. "Where does my money go?")
- Use type="bar" for comparisons (e.g. "Compare food vs transport")
- Generate realistic sample data for demo
- Combine with SummaryCards for ANALYTICAL queries`,
    component: SpendingChart,
    propsSchema: spendingChartSchema,
  },
  {
    name: "SummaryCards",
    description: `Quick financial metrics. RULES:
- Show totalSpent, transactionCount, topCategory, trend
- Use for ANY analytical or reflective query
- Combine with SpendingChart for complete overview
- Generate realistic demo data`,
    component: SummaryCards,
    propsSchema: summaryCardsSchema,
  },
  {
    name: "InsightPanel",
    description: `Personalized tips and emotional support. STRICT RULES:
- ONLY use for UNCERTAIN/EMOTIONAL users (e.g. "Why am I always broke?", "I think I'm overspending")
- NEVER use for confident ACTION intents
- Use mood="supportive" for emotional users
- Combine with SpendingChart to provide context for insights`,
    component: InsightPanel,
    propsSchema: insightPanelSchema,
  },
  {
    name: "ActionPanel",
    description: `Action buttons. STRICT RULES:
- ONLY use when user explicitly says: export, share, delete, download
- DO NOT use for add/log expenses (use ExpenseInput instead)
- Actions: export, share, delete`,
    component: ActionPanel,
    propsSchema: actionPanelSchema,
  },
];

/**
 * Tools - Leave empty for now (no external APIs needed)
 */
export const tools: TamboTool[] = [];

