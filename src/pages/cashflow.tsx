import { useEffect, useMemo, useState } from "react"
import { useCashflow, type Transaction } from "@/lib/cashflow-store"
import { CurrencyPrompt } from "@/components/currency-prompt"
import { SubscriptionManager } from "@/components/subscription-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns"
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, CalendarIcon, Pencil, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

const CATEGORY_COLORS = [
  "hsl(12 76% 61%)",
  "hsl(173 58% 39%)",
  "hsl(197 37% 24%)",
  "hsl(43 74% 66%)",
  "hsl(27 87% 67%)",
  "hsl(221 83% 53%)",
  "hsl(142 71% 45%)",
  "hsl(262 83% 58%)",
]

const CATEGORIES = [
  "Food",
  "Transport",
  "Salary",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Others"
]

const TRANSACTIONS_PER_PAGE = 10

export default function CashflowPage() {
  const { transactions, currency, addTransaction, updateTransaction, removeTransaction } = useCashflow()

  const now = new Date()
  const currentMonthStr = format(now, "yyyy-MM")

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)

  // New Transaction Form State
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editType, setEditType] = useState<"income" | "expense">("expense")
  const [editAmount, setEditAmount] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDate, setEditDate] = useState<Date>(new Date())
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false)
  const [currentTransactionsPage, setCurrentTransactionsPage] = useState(1)
  const [spendingChartMode, setSpendingChartMode] = useState<"daily" | "weekly">("daily")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) return

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date.toISOString()
    })

    setOpen(false)
    setAmount("")
    setCategory("")
    setDescription("")
    setDate(new Date())
    setIsDatePickerOpen(false)
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditType(transaction.type)
    setEditAmount(transaction.amount.toString())
    setEditCategory(transaction.category)
    setEditDescription(transaction.description)
    setEditDate(new Date(transaction.date))
    setIsEditDatePickerOpen(false)
  }

  const closeEditDialog = () => {
    setEditingTransaction(null)
    setIsEditDatePickerOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction || !editAmount || !editCategory) return

    updateTransaction(editingTransaction.id, {
      type: editType,
      amount: parseFloat(editAmount),
      category: editCategory,
      description: editDescription,
      date: editDate.toISOString(),
    })

    closeEditDialog()
  }

  const uniqueMonths = useMemo(
    () =>
      Array.from(
        new Set([
          currentMonthStr,
          ...transactions.map((transaction) => format(new Date(transaction.date), "yyyy-MM")),
        ])
      ).sort((a, b) => b.localeCompare(a)),
    [currentMonthStr, transactions]
  )

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) => format(new Date(transaction.date), "yyyy-MM") === selectedMonth
      ),
    [transactions, selectedMonth]
  )

  const { totalIncome, totalExpense, balance } = useMemo(
    () =>
      filteredTransactions.reduce(
        (accumulator, transaction) => {
          if (transaction.type === "income") {
            accumulator.totalIncome += transaction.amount
            accumulator.balance += transaction.amount
          } else {
            accumulator.totalExpense += transaction.amount
            accumulator.balance -= transaction.amount
          }

          return accumulator
        },
        { totalIncome: 0, totalExpense: 0, balance: 0 }
      ),
    [filteredTransactions]
  )

  const sortedTransactions = useMemo(
    () =>
      [...filteredTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [filteredTransactions]
  )

  const totalTransactionPages = useMemo(
    () => Math.max(1, Math.ceil(sortedTransactions.length / TRANSACTIONS_PER_PAGE)),
    [sortedTransactions.length]
  )

  const transactionStartIndex = (currentTransactionsPage - 1) * TRANSACTIONS_PER_PAGE
  const transactionEndIndex = Math.min(
    transactionStartIndex + TRANSACTIONS_PER_PAGE,
    sortedTransactions.length
  )

  const paginatedTransactions = useMemo(
    () =>
      sortedTransactions.slice(
        transactionStartIndex,
        transactionStartIndex + TRANSACTIONS_PER_PAGE
      ),
    [sortedTransactions, transactionStartIndex]
  )

  useEffect(() => {
    setCurrentTransactionsPage(1)
  }, [selectedMonth])

  useEffect(() => {
    setCurrentTransactionsPage((prev) => Math.min(prev, totalTransactionPages))
  }, [totalTransactionPages])

  const dailySpendingData = useMemo(() => {
    const monthStart = new Date(`${selectedMonth}-01T00:00:00`)
    const expenseTotalsByDay = filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((accumulator, transaction) => {
        const dayKey = format(new Date(transaction.date), "yyyy-MM-dd")
        accumulator[dayKey] = (accumulator[dayKey] || 0) + transaction.amount
        return accumulator
      }, {} as Record<string, number>)

    return eachDayOfInterval({
      start: startOfMonth(monthStart),
      end: endOfMonth(monthStart),
    }).map((day) => {
      const dayKey = format(day, "yyyy-MM-dd")
      return {
        date: dayKey,
        label: format(day, "MMM d"),
        shortLabel: format(day, "d"),
        spending: expenseTotalsByDay[dayKey] || 0,
      }
    })
  }, [filteredTransactions, selectedMonth])

  const weeklySpendingData = useMemo(() => {
    const monthStart = startOfMonth(new Date(`${selectedMonth}-01T00:00:00`))
    const monthEnd = endOfMonth(monthStart)
    const expenseTotalsByDay = filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((accumulator, transaction) => {
        const dayKey = format(new Date(transaction.date), "yyyy-MM-dd")
        accumulator[dayKey] = (accumulator[dayKey] || 0) + transaction.amount
        return accumulator
      }, {} as Record<string, number>)

    return eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    ).map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      const intervalStart = weekStart < monthStart ? monthStart : weekStart
      const intervalEnd = weekEnd > monthEnd ? monthEnd : weekEnd

      const spending = eachDayOfInterval({ start: intervalStart, end: intervalEnd }).reduce(
        (sum, day) => sum + (expenseTotalsByDay[format(day, "yyyy-MM-dd")] || 0),
        0
      )

      return {
        date: format(intervalStart, "yyyy-MM-dd"),
        label: `${format(intervalStart, "MMM d")} - ${format(intervalEnd, "MMM d")}`,
        shortLabel: `W${index + 1}`,
        spending,
      }
    })
  }, [filteredTransactions, selectedMonth])

  const spendingChartData = spendingChartMode === "daily" ? dailySpendingData : weeklySpendingData

  const spendingChartConfig = useMemo(
    () =>
      ({
        spending: {
          label: spendingChartMode === "daily" ? "Daily spending" : "Weekly spending",
          color: "var(--color-destructive)",
        },
      }) satisfies ChartConfig,
    [spendingChartMode]
  )

  const averageDailySpending = useMemo(() => {
    const rollingWindowDays = 30
    const windowStart = startOfDay(subDays(new Date(), rollingWindowDays - 1))

    const rollingExpenseTotal = transactions
      .filter((transaction) => transaction.type === "expense")
      .filter((transaction) => new Date(transaction.date) >= windowStart)
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return rollingExpenseTotal / rollingWindowDays
  }, [transactions])

  const spendingByCategoryData = useMemo(() => {
    const totals = filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((accumulator, transaction) => {
        accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount
        return accumulator
      }, {} as Record<string, number>)

    return Object.entries(totals)
      .map(([categoryName, amount], index) => ({
        category: categoryName,
        amount,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredTransactions])

  const categoryChartConfig = useMemo(
    () =>
      spendingByCategoryData.reduce((config, item) => {
        config[item.category] = {
          label: item.category,
          color: item.fill,
        }
        return config
      }, {} as ChartConfig),
    [spendingByCategoryData]
  )


  return (
    <div className="flex flex-col gap-6">
      <CurrencyPrompt />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Cashflow</h1>
          <p className="text-muted-foreground">
            Track your income and expenses.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {uniqueMonths.map((m) => {
                const [year, month] = m.split("-")
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })
                return (
                  <SelectItem key={m} value={m}>
                    {monthName} {year}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <SubscriptionManager />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Add Transaction
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>
                Record a new income or expense manually.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={type === "expense" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setType("expense")}
                  >
                    <ArrowDownCircle className="text-red-400" data-icon="inline-start" />
                    Expense
                  </Button>
                  <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setType("income")}
                  >
                    <ArrowUpCircle className="text-green-400" data-icon="inline-start" />
                    Income
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon data-icon="inline-start" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        if (!d) return

                        setDate(d)
                        setIsDatePickerOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g. Groceries at Walmart"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button type="submit" className="mt-2">Save Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currency}{balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              +{currency}{totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -{currency}{totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Spending</CardTitle>
            <TrendingDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currency}{averageDailySpending.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Based on the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="h-full">
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{spendingChartMode === "daily" ? "Daily Spending" : "Weekly Spending"}</CardTitle>
                <CardDescription>
                  {spendingChartMode === "daily"
                    ? "See how much you spent each day in the selected month."
                    : "See how much you spent each week in the selected month."}
                </CardDescription>
              </div>
              <Select
                value={spendingChartMode}
                onValueChange={(value) => setSpendingChartMode(value as "daily" | "weekly")}
              >
                <SelectTrigger className="w-[170px] sm:ml-auto">
                  <SelectValue placeholder="Spending view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily spending</SelectItem>
                  <SelectItem value="weekly">Weekly spending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {totalExpense === 0 ? (
              <div className="flex min-h-72 flex-1 flex-col items-center justify-center rounded-xl border border-dashed text-center">
                <p className="font-medium">No expenses recorded for this month.</p>
                <p className="text-sm text-muted-foreground">
                  {spendingChartMode === "daily"
                    ? "Add an expense to start seeing your daily spending trend."
                    : "Add an expense to start seeing your weekly spending trend."}
                </p>
              </div>
            ) : (
              <ChartContainer config={spendingChartConfig} className="min-h-72 h-full w-full flex-1">
                <BarChart accessibilityLayer data={spendingChartData} margin={{ top: 8, right: 4, left: 12, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={88}
                    tickMargin={8}
                    tickFormatter={(value) => `${currency}${Number(value).toLocaleString()}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
                        formatter={(value) => (
                          <div className="flex min-w-0 items-center justify-between gap-2">
                            <span className="text-muted-foreground">Spent</span>
                            <span className="font-medium text-foreground">
                              {currency}{Number(value).toLocaleString()}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="spending"
                    fill="var(--color-spending)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Breakdown of this month&apos;s expenses by category.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {spendingByCategoryData.length === 0 ? (
              <div className="flex min-h-72 flex-1 flex-col items-center justify-center rounded-xl border border-dashed text-center">
                <p className="font-medium">No category data yet.</p>
                <p className="text-sm text-muted-foreground">
                  Add an expense to see how your spending is distributed.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-1 flex-col gap-6">
                <ChartContainer config={categoryChartConfig} className="mx-auto min-h-72 h-full w-full max-w-[320px] flex-1">
                  <PieChart accessibilityLayer>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value, name, item) => (
                            <div className="flex min-w-0 items-center justify-between gap-2">
                              <span className="text-muted-foreground">{String(name)}</span>
                              <span className="font-medium text-foreground">
                                {currency}{Number(value).toLocaleString()}
                              </span>
                              <span className="text-muted-foreground">
                                {item?.payload?.share}%
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={spendingByCategoryData.map((item) => ({
                        ...item,
                        share: ((item.amount / totalExpense) * 100).toFixed(1),
                      }))}
                      dataKey="amount"
                      nameKey="category"
                      innerRadius={60}
                      outerRadius={96}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {spendingByCategoryData.map((item) => (
                        <Cell key={item.category} fill={item.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="space-y-3">
                  {spendingByCategoryData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="truncate text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {currency}{item.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((item.amount / totalExpense) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest spending and earnings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <p>No transactions found.</p>
              <p className="text-sm">Click "Add Transaction" to start tracking.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[96px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {format(new Date(tx.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.description || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.category}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${tx.type === "income" ? "text-green-500" : ""}`}>
                        {tx.type === "income" ? "+" : "-"}{currency}{tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground"
                            onClick={() => openEditDialog(tx)}
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeTransaction(tx.id)}
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sortedTransactions.length > TRANSACTIONS_PER_PAGE && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {transactionStartIndex + 1}-{transactionEndIndex} of {sortedTransactions.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTransactionsPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentTransactionsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentTransactionsPage} of {totalTransactionPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTransactionsPage((prev) => Math.min(totalTransactionPages, prev + 1))}
                      disabled={currentTransactionsPage === totalTransactionPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editingTransaction !== null} onOpenChange={(isOpen) => !isOpen && closeEditDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the details for this transaction.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={editType === "expense" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setEditType("expense")}
                >
                  <ArrowDownCircle className="text-red-400" data-icon="inline-start" />
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={editType === "income" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setEditType("income")}
                >
                  <ArrowUpCircle className="text-green-400" data-icon="inline-start" />
                  Income
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Popover open={isEditDatePickerOpen} onOpenChange={setIsEditDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon data-icon="inline-start" />
                    {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  onOpenAutoFocus={(event) => event.preventDefault()}
                >
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(selectedDate) => {
                      if (!selectedDate) return

                      setEditDate(selectedDate)
                      setIsEditDatePickerOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount ({currency})</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Edit Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                placeholder="e.g. Groceries at Walmart"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
