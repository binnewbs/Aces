import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "./profile-form"
import { Save, CloudSun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("aces-weather-api-key") || "")
  const [city, setCity] = useState(localStorage.getItem("aces-weather-city") || "Jakarta")
  const [saved, setSaved] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleSaveWeather = () => {
    localStorage.setItem("aces-weather-api-key", apiKey)
    localStorage.setItem("aces-weather-city", city)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
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
                Configure your weather widget. Get a free API key from{" "}
                <a
                  href="https://openweathermap.org/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  openweathermap.org
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your OpenWeatherMap API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Your API key is stored locally and never shared.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Jakarta, London, New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    The city name for your weather data.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveWeather}>
                    <Save data-icon="inline-start" />
                    Save Weather Settings
                  </Button>
                  {saved && (
                    <span className="text-sm text-primary font-medium animate-in fade-in">
                      ✓ Saved! Reload the dashboard to see changes.
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
