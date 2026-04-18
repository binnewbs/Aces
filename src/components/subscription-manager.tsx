import { useState } from "react"
import { useCashflow } from "@/lib/cashflow-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export function SubscriptionManager() {
  const { subscriptions, addSubscription, removeSubscription, currency } = useCashflow()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !category) return

    addSubscription({
      name,
      amount: parseFloat(amount),
      category,
      startDate: date.toISOString()
    })

    setName("")
    setAmount("")
    setCategory("")
    setDate(new Date())
    setIsDatePickerOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Repeat data-icon="inline-start" className="mr-2" />
          Manage Subscriptions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh] w-full">
          <div className="p-4 flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Subscriptions</DialogTitle>
              <DialogDescription>
                Manage recurring expenses that will be automatically added at the start of each month.
              </DialogDescription>
            </DialogHeader>
            
            {/* Active Subscriptions List */}
            <div className="space-y-4 py-2">
              <h4 className="font-medium text-sm">Active Subscriptions</h4>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active subscriptions found.</p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium text-sm">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.category} • Starts {format(new Date(sub.startDate), "MMM d, yyyy")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-red-500">
                          -{currency}{sub.amount.toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSubscription(sub.id)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Subscription Form */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-4">Add New Subscription</h4>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sub-name">Name</Label>
                  <Input
                    id="sub-name"
                    placeholder="e.g. Netflix, Spotify"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sub-amount">Amount ({currency})</Label>
                  <Input
                    id="sub-amount"
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
                  <Label htmlFor="sub-date">Start Date</Label>
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
                        <CalendarIcon data-icon="inline-start" className="mr-2" />
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

                <Button type="submit" className="mt-2 text-primary-foreground">
                  <Plus data-icon="inline-start" className="mr-2" />
                  Add Subscription
                </Button>
              </form>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
