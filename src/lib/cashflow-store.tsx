import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date string
}

interface CashflowStore {
  transactions: Transaction[];
  currency: string | null;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  setCurrency: (currency: string) => void;
  isCurrencySet: boolean;
}

const STORAGE_KEY = "aces-cashflow-transactions"
const CURRENCY_KEY = "aces-cashflow-currency"

function loadTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Ignore error
  }
  return []
}

function loadCurrency(): string | null {
  return localStorage.getItem(CURRENCY_KEY)
}

const CashflowContext = createContext<CashflowStore | null>(null)

export function CashflowProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions)
  const [currency, setCurrencyState] = useState<string | null>(loadCurrency)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(CURRENCY_KEY, newCurrency)
  }, [])

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
    }
    setTransactions((prev) => [...prev, newTx])
  }, [])

  const updateTransaction = useCallback((id: string, tx: Omit<Transaction, "id">) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? {
              ...tx,
              id,
            }
          : transaction
      )
    )
  }, [])

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      transactions,
      currency,
      addTransaction,
      updateTransaction,
      removeTransaction,
      setCurrency,
      isCurrencySet: currency !== null && currency.trim() !== "",
    }),
    [transactions, currency, addTransaction, updateTransaction, removeTransaction, setCurrency]
  )

  return <CashflowContext.Provider value={value}>{children}</CashflowContext.Provider>
}

export function useCashflow() {
  const context = useContext(CashflowContext)
  if (!context) {
    throw new Error("useCashflow must be used within a CashflowProvider")
  }
  return context
}
