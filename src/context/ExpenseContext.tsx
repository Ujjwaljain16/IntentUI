"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Expense = {
    id: string;
    amount: number;
    category: string;
    merchant: string;
    date: string;
};

interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, "id">) => void;
    clearExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Initial demo data so the app doesn't look empty at start
const INITIAL_DATA: Expense[] = [
    { id: "1", amount: 120, category: "Food", merchant: "Whole Foods", date: new Date().toISOString().split('T')[0] },
    { id: "2", amount: 45, category: "Transport", merchant: "Uber", date: new Date().toISOString().split('T')[0] },
    { id: "3", amount: 15.50, category: "Food", merchant: "Starbucks", date: new Date().toISOString().split('T')[0] },
];

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>(INITIAL_DATA);

    const addExpense = (expense: Omit<Expense, "id">) => {
        const newExpense = {
            ...expense,
            id: Math.random().toString(36).substr(2, 9),
        };
        setExpenses(prev => [newExpense, ...prev]);
    };

    const clearExpenses = () => setExpenses([]);

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense, clearExpenses }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpenses() {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error("useExpenses must be used within an ExpenseProvider");
    }
    return context;
}
