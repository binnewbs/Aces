import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "./profile-form"
import { Save, CloudSun, Wallet } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useCashflow } from "@/lib/cashflow-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const [city, setCity] = useState(localStorage.getItem("aces-weather-city") || "Jakarta")
  const [weatherSaved, setWeatherSaved] = useState(false)
  const { theme, setTheme } = useTheme()
  const { currency, setCurrency } = useCashflow()
  const [localCurrency, setLocalCurrency] = useState(currency || "$")
  const [cashflowSaved, setCashflowSaved] = useState(false)

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
        <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
