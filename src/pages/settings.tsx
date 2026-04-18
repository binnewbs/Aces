import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProfileForm } from "./profile-form"
import { Save, CloudSun, Wallet, Download, Upload, HardDrive, CheckCircle2, XCircle } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useCashflow } from "@/lib/cashflow-store"
import { exportToFile, importFromFile, getLastSyncInfo } from "@/lib/data-sync"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SyncFeedback = {
  type: "success" | "error"
  message: string
} | null

export default function SettingsPage() {
  const [city, setCity] = useState(localStorage.getItem("aces-weather-city") || "Jakarta")
  const [weatherSaved, setWeatherSaved] = useState(false)
  const { theme, setTheme } = useTheme()
  const { currency, setCurrency } = useCashflow()
  const [localCurrency, setLocalCurrency] = useState(currency || "$")
  const [cashflowSaved, setCashflowSaved] = useState(false)

  const [syncFeedback, setSyncFeedback] = useState<SyncFeedback>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [lastSync, setLastSync] = useState(getLastSyncInfo())

  useEffect(() => {
    if (syncFeedback?.type === "success") {
      const timer = setTimeout(() => setSyncFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [syncFeedback])

  const handleSaveWeather = () => {
    localStorage.removeItem("aces-weather-api-key")
    localStorage.setItem("aces-weather-city", city)
    setWeatherSaved(true)
    setTimeout(() => setWeatherSaved(false), 2000)
  }

  const handleSaveCashflow = () => {
    setCurrency(localCurrency)
    setCashflowSaved(true)
    setTimeout(() => setCashflowSaved(false), 2000)
  }

  const handleExport = async () => {
    setIsExporting(true)
    setSyncFeedback(null)
    try {
      const result = await exportToFile()
      if (result.success) {
        setSyncFeedback({
          type: "success",
          message: `Data exported to ${result.filePath}`,
        })
        setLastSync(getLastSyncInfo())
      } else if (!result.canceled) {
        setSyncFeedback({
          type: "error",
          message: result.error || "Export failed.",
        })
      }
    } catch (err) {
      setSyncFeedback({ type: "error", message: String(err) })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    setSyncFeedback(null)
    try {
      const result = await importFromFile()
      if (result.success && result.summary) {
        const s = result.summary
        const parts: string[] = []
        if (s.assignments > 0) parts.push(`${s.assignments} assignments`)
        if (s.notes > 0) parts.push(`${s.notes} notes`)
        if (s.transactions > 0) parts.push(`${s.transactions} transactions`)
        if (s.cashflowSubscriptions > 0) parts.push(`${s.cashflowSubscriptions} subscriptions`)
        if (s.scheduleClasses > 0) parts.push(`${s.scheduleClasses} classes`)
        if (s.hasProfile) parts.push("profile")
        if (s.hasSettings) parts.push("settings")

        setSyncFeedback({
          type: "success",
          message: `Imported ${parts.join(", ")}. Reloading…`,
        })

        // Reload after a brief delay so the user sees the success message
        setTimeout(() => window.location.reload(), 1500)
      } else if (!result.canceled) {
        setSyncFeedback({
          type: "error",
          message: result.error || "Import failed.",
        })
      }
    } catch (err) {
      setSyncFeedback({ type: "error", message: String(err) })
    } finally {
      setIsImporting(false)
    }
  }

  const formatSyncDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-[600px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="size-5" />
                Weather Configuration
              </CardTitle>
              <CardDescription>
                Configure the location for your weather widget. Powered by{" "}
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  Open-Meteo
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Jakarta, London, New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    The city name for your weather data. No API key required.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveWeather}>
                    <Save data-icon="inline-start" />
                    Save Weather Settings
                  </Button>
                  {weatherSaved && (
                    <span className="text-sm text-primary font-medium animate-in fade-in">
                      ✓ Saved! Reload the dashboard to see changes.
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-5" />
                Cashflow Configuration
              </CardTitle>
              <CardDescription>
                Set up your default preferences for the cashflow tracker.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency Symbol</Label>
                  <Select value={localCurrency} onValueChange={setLocalCurrency}>
                    <SelectTrigger id="currency">
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
                  <p className="text-[0.8rem] text-muted-foreground">
                    The symbol used globally in your cashflow dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveCashflow}>
                    <Save data-icon="inline-start" />
                    Save Cashflow Settings
                  </Button>
                  {cashflowSaved && (
                    <span className="text-sm text-primary font-medium animate-in fade-in">
                      ✓ Saved!
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-lg">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light" as const, label: "Light" },
                    { value: "dark" as const, label: "Dark" },
                    { value: "system" as const, label: "System" },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      variant={theme === item.value ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setTheme(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Select the theme for the application interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <div className="flex flex-col gap-6">
            {/* Sync feedback */}
            {syncFeedback && (
              <div
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 ${
                  syncFeedback.type === "success"
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : "border-destructive/30 bg-destructive/5 text-destructive"
                }`}
              >
                {syncFeedback.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <XCircle className="size-4 shrink-0" />
                )}
                <span className="truncate">{syncFeedback.message}</span>
              </div>
            )}

            {/* Last sync info */}
            {lastSync && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Last {lastSync.type}: {formatSyncDate(lastSync.at)}
                </Badge>
              </div>
            )}

            {/* Export Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="size-5" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Save a snapshot of all your data as a JSON file. This includes
                  assignments, notes, cashflow transactions, subscriptions, schedule, profile,
                  and settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 max-w-lg">
                  <p className="text-[0.8rem] text-muted-foreground">
                    Use this file to transfer your data to another device or as a backup.
                  </p>
                  <div>
                    <Button onClick={handleExport} disabled={isExporting}>
                      <Download data-icon="inline-start" />
                      {isExporting ? "Exporting…" : "Export All Data"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Import Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="size-5" />
                  Import Data
                </CardTitle>
                <CardDescription>
                  Restore data from a previously exported JSON file. This will
                  replace all your current data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 max-w-lg">
                  <p className="text-[0.8rem] text-muted-foreground">
                    The app will reload after a successful import to apply the changes.
                  </p>
                  <div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isImporting}>
                          <Upload data-icon="inline-start" />
                          {isImporting ? "Importing…" : "Import Data"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Replace all data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Importing will overwrite all your current assignments,
                            notes, cashflow transactions, subscriptions, schedule, and profile
                            with the data from the backup file. This action cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleImport}>
                            Continue Import
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="size-5" />
                  Storage
                </CardTitle>
                <CardDescription>
                  Your data is stored locally on this device using browser storage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[0.8rem] text-muted-foreground">
                  To sync data across devices, export your data on one device and import it on another.
                  A cloud sync feature is planned for a future release.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

