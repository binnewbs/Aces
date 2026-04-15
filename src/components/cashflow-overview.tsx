import { useState } from "react"
import { useCashflow } from "@/lib/cashflow-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Wallet, ChevronLeft, ChevronRight, ReceiptText, CalendarDays } from "lucide-react"
import { CurrencyPrompt } from "./currency-prompt"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { format, isToday, startOfWeek } from "date-fns"

export function CashflowOverview() {
  const { transactions, currency } = useCashflow()

  const now = new Date()
  const currentMonthStr = format(now, "yyyy-MM")
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)

  const uniqueMonths = Array.from(
    new Set([
      currentMonthStr,
      ...transactions.map((t) => format(new Date(t.date), "yyyy-MM"))
    ])
  ).sort((a, b) => b.localeCompare(a))

  const selectedIndex = uniqueMonths.indexOf(selectedMonth)
  
  const handlePrev = () => {
    if (selectedIndex < uniqueMonths.length - 1) {
      setSelectedMonth(uniqueMonths[selectedIndex + 1])
    }
  }

  const handleNext = () => {
    if (selectedIndex > 0) {
      setSelectedMonth(uniqueMonths[selectedIndex - 1])
    }
  }

  const monthlyTransactions = transactions.filter(
    (t) => format(new Date(t.date), "yyyy-MM") === selectedMonth
  )

  const income = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = monthlyTransactions
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0)

  const todaySpending = transactions
    .filter((t) => t.type === "expense" && isToday(new Date(t.date)))
    .reduce((sum, t) => sum + t.amount, 0)

  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 })
  const thisWeekTransactions = transactions.filter((t) => new Date(t.date) >= startOfThisWeek)

  const thisWeekNet = thisWeekTransactions
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0)

  const [year, monthNum] = selectedMonth.split("-")
  const displayMonth = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })

  return (
    <>
      <CurrencyPrompt />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-row items-center gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="size-4 text-primary" />
              Cashflow Overview
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground bg-muted/40 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground"
                onClick={handlePrev}
                disabled={selectedIndex >= uniqueMonths.length - 1}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <span className="w-[70px] text-center font-medium text-foreground">
                {displayMonth} {year}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground"
                onClick={handleNext}
                disabled={selectedIndex <= 0}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cashflow">Manage</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
              <div className="text-3xl font-bold tracking-tight">
                {currency}{balance.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-4 sm:ml-auto">
              <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-4 py-2 min-w-[120px]">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ArrowUpCircle className="size-3 text-green-500" />
                  Income
                </span>
                <span className="text-lg font-semibold text-green-500">
                  +{currency}{income.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-4 py-2 min-w-[120px]">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ReceiptText className="size-3" />
                  Today
                </span>
                <span className="text-lg font-semibold">
                  {todaySpending > 0 ? "-" : ""}{currency}{todaySpending.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-4 py-2 min-w-[120px]">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ArrowDownCircle className="size-3 text-red-500" />
                  Expense
                </span>
                <span className="text-lg font-semibold text-red-500">
                  -{currency}{expense.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-4 py-2 min-w-[120px]">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3 text-orange-500" />
                  This Week
                </span>
                <span className="text-lg font-semibold text-white">
                  {thisWeekNet > 0 ? "+" : thisWeekNet < 0 ? "-" : ""}{currency}{Math.abs(thisWeekNet).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
