import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCashflow } from "@/lib/cashflow-store"

export function CurrencyPrompt() {
  const { isCurrencySet, setCurrency } = useCashflow()
  const [localCurrency, setLocalCurrency] = useState("")

  // Only show the prompt if the currency is not set
  if (isCurrencySet) return null

  const handleSave = () => {
    if (localCurrency) {
      setCurrency(localCurrency)
    }
  }

  return (
    <Dialog open={true}>
      {/* Remove onClose behavior by not binding onOpenChange or preventing default */}
      <DialogContent className="sm:max-w-md [&>button.absolute.right-4.top-4]:hidden">
        <DialogHeader>
          <DialogTitle>Welcome to Cashflow Tracking</DialogTitle>
          <DialogDescription>
            Before we begin, please select your primary currency for managing expenses.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Select value={localCurrency} onValueChange={setLocalCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$">$ - USD</SelectItem>
              <SelectItem value="€">€ - EUR</SelectItem>
              <SelectItem value="£">£ - GBP</SelectItem>
              <SelectItem value="Rp">Rp - IDR</SelectItem>
              <SelectItem value="¥">¥ - JPY</SelectItem>
              <SelectItem value="A$">A$ - AUD</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={!localCurrency} className="w-full">
            Save Currency
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
