import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { addMonths } from "date-fns"

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date string
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  startDate: string; // ISO date string
  lastProcessed: string; // ISO date string
}

interface CashflowStore {
  transactions: Transaction[];
  subscriptions: Subscription[];
  currency: string | null;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, "id" | "lastProcessed">) => void;
  removeSubscription: (id: string) => void;
  setCurrency: (currency: string) => void;
  isCurrencySet: boolean;
}

const STORAGE_KEY = "aces-cashflow-transactions"
const SUBSCRIPTION_STORAGE_KEY = "aces-cashflow-subscriptions"
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

function loadSubscriptions(): Subscription[] {
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(loadSubscriptions)
  const [currency, setCurrencyState] = useState<string | null>(loadCurrency)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptions))
  }, [subscriptions])

  // Automatically process recurring subscriptions
  useEffect(() => {
    if (subscriptions.length === 0) return;

    let hasUpdates = false;
    const now = new Date();
    const newTransactions: Transaction[] = [];

    const updatedSubs = subscriptions.map((sub) => {
      let processDate = new Date(sub.lastProcessed);
      let nextDate = addMonths(processDate, 1);
      let subTouched = false;

      while (nextDate <= now) {
        newTransactions.push({
          id: crypto.randomUUID(),
          type: "expense",
          amount: sub.amount,
          category: sub.category,
          description: sub.name,
          date: nextDate.toISOString(),
        });
        processDate = nextDate;
        nextDate = addMonths(nextDate, 1);
        subTouched = true;
      }

      if (subTouched) {
        hasUpdates = true;
        return { ...sub, lastProcessed: processDate.toISOString() };
      }
      return sub;
    });

    if (hasUpdates) {
      // Adding new transactions generated from subscriptions
      setTransactions((prev) => [...prev, ...newTransactions]);
      setSubscriptions(updatedSubs);
    }
  }, [subscriptions]);


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

  const addSubscription = useCallback((sub: Omit<Subscription, "id" | "lastProcessed">) => {
    const startDate = new Date(sub.startDate);
    // Initial lastprocessed is one month prior to the start date
    // so it naturally fires on its registered day of month.
    const initialLastProcessed = addMonths(startDate, -1).toISOString();

    const newSub: Subscription = {
      ...sub,
      id: crypto.randomUUID(),
      lastProcessed: initialLastProcessed,
    }
    setSubscriptions((prev) => [...prev, newSub])
  }, [])

  const removeSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      transactions,
      subscriptions,
      currency,
      addTransaction,
      updateTransaction,
      removeTransaction,
      addSubscription,
      removeSubscription,
      setCurrency,
      isCurrencySet: currency !== null && currency.trim() !== "",
    }),
    [transactions, subscriptions, currency, addTransaction, updateTransaction, removeTransaction, addSubscription, removeSubscription, setCurrency]
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
