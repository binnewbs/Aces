import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CloudSun, Thermometer, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  uvi: number
}

function getUvLabel(uvi: number): { label: string; className: string } {
  if (uvi <= 2) return { label: "Low", className: "text-green-400" }
  if (uvi <= 5) return { label: "Moderate", className: "text-yellow-400" }
  if (uvi <= 7) return { label: "High", className: "text-orange-400" }
  if (uvi <= 10) return { label: "Very High", className: "text-red-400" }
  return { label: "Extreme", className: "text-purple-400" }
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [city, setCity] = useState<string>("")

  useEffect(() => {
    const apiKey = localStorage.getItem("aces-weather-api-key")
    const storedCity = localStorage.getItem("aces-weather-city") || "Jakarta"
    setCity(storedCity)

    if (!apiKey) {
      setError("no-key")
      setLoading(false)
      return
    }

    async function fetchWeather() {
      try {
        setLoading(true)
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${storedCity}&units=metric&appid=${apiKey}`
        )
        if (!weatherRes.ok) throw new Error("Weather fetch failed")
        const weatherData = await weatherRes.json()

        // Get UV index
        const { coord } = weatherData
        let uvi = 0
        try {
          const uvRes = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`
          )
          if (uvRes.ok) {
            const uvData = await uvRes.json()
            uvi = uvData.value
          }
        } catch {
          // UV index may fail on free tier, fallback to 0
        }

        // OpenWeatherMap's /uvi endpoint often returns the daily peak.
        // If it's night (icon suffix 'n'), force it to 0 for accuracy.
        const isNight = weatherData.weather[0].icon.endsWith('n')
        const finalUvi = isNight ? 0 : uvi

        setWeather({
          temp: Math.round(weatherData.main.temp),
          feelsLike: Math.round(weatherData.main.feels_like),
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          uvi: finalUvi,
        })
        setError(null)
      } catch {
        setError("Failed to fetch weather data")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (error === "no-key") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudSun />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CloudSun className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Add your OpenWeatherMap API key and city in{" "}
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <a href="#/settings">Settings</a>
              </Button>{" "}
              to see weather data.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudSun />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudSun />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "Unable to load weather"}</p>
        </CardContent>
      </Card>
    )
  }

  const uv = getUvLabel(weather.uvi)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CloudSun />
            Weather
          </span>
          <span className="text-sm font-normal text-muted-foreground capitalize">
            {city}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Temperature */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter">{weather.temp}°</span>
              <span className="text-lg text-muted-foreground">C</span>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="size-16 -mr-2"
            />
          </div>

          <p className="text-sm capitalize text-muted-foreground -mt-2">{weather.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Thermometer className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Feels Like</p>
                <p className="text-sm font-semibold">{weather.feelsLike}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Sun className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">UV Index</p>
                <p className={`text-sm font-semibold ${uv.className}`}>
                  {weather.uvi} · {uv.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
