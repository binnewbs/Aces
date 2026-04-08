import { useEffect, useRef, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CloudSun,
  Thermometer,
  Sun,
  Moon,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  RefreshCw,
  type LucideIcon,
} from "lucide-react"

interface WeatherData {
  temp: number
  feelsLike: number
  code: number
  isDay: number
  uvi: number
}

interface WeatherCache {
  city: string
  resolvedCity: string
  timestamp: number
  weather: WeatherData
}

const WEATHER_CACHE_KEY = "aces-weather-cache"
const WEATHER_CACHE_TTL = 10 * 60 * 1000

function getUvLabel(uvi: number): { label: string; className: string } {
  if (uvi <= 2) return { label: "Low", className: "text-green-400" }
  if (uvi <= 5) return { label: "Moderate", className: "text-yellow-400" }
  if (uvi <= 7) return { label: "High", className: "text-orange-400" }
  if (uvi <= 10) return { label: "Very High", className: "text-red-400" }
  return { label: "Extreme", className: "text-purple-400" }
}

function getWeatherMeta(code: number, isDay: number): { desc: string; icon: LucideIcon } {
  const meta: Record<number, { desc: string; icon: LucideIcon }> = {
    0: { desc: "Clear sky", icon: isDay ? Sun : Moon },
    1: { desc: "Mainly clear", icon: isDay ? CloudSun : CloudMoon },
    2: { desc: "Partly cloudy", icon: isDay ? CloudSun : CloudMoon },
    3: { desc: "Overcast", icon: Cloud },
    45: { desc: "Fog", icon: CloudFog },
    48: { desc: "Depositing rime fog", icon: CloudFog },
    51: { desc: "Light drizzle", icon: CloudDrizzle },
    53: { desc: "Moderate drizzle", icon: CloudDrizzle },
    55: { desc: "Dense drizzle", icon: CloudDrizzle },
    56: { desc: "Light freezing drizzle", icon: CloudDrizzle },
    57: { desc: "Dense freezing drizzle", icon: CloudDrizzle },
    61: { desc: "Slight rain", icon: CloudRain },
    63: { desc: "Moderate rain", icon: CloudRain },
    65: { desc: "Heavy rain", icon: CloudRain },
    66: { desc: "Light freezing rain", icon: CloudRain },
    67: { desc: "Heavy freezing rain", icon: CloudRain },
    71: { desc: "Slight snow fall", icon: CloudSnow },
    73: { desc: "Moderate snow fall", icon: CloudSnow },
    75: { desc: "Heavy snow fall", icon: CloudSnow },
    77: { desc: "Snow grains", icon: CloudSnow },
    80: { desc: "Slight rain showers", icon: CloudRain },
    81: { desc: "Moderate rain showers", icon: CloudRain },
    82: { desc: "Violent rain showers", icon: CloudRain },
    85: { desc: "Slight snow showers", icon: CloudSnow },
    86: { desc: "Heavy snow showers", icon: CloudSnow },
    95: { desc: "Thunderstorm", icon: CloudLightning },
    96: { desc: "Thunderstorm with slight hail", icon: CloudLightning },
    99: { desc: "Thunderstorm with heavy hail", icon: CloudLightning }
  }
  return meta[code] || { desc: "Unknown", icon: Cloud }
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [city, setCity] = useState<string>("")
  const abortControllerRef = useRef<AbortController | null>(null)

  async function loadWeather(forceRefresh = false) {
    const storedCity = localStorage.getItem("aces-weather-city") || "Jakarta"
    setCity(storedCity)
    setError(null)

    if (!forceRefresh) {
      try {
        const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY)
        if (cachedWeather) {
          const parsedCache = JSON.parse(cachedWeather) as WeatherCache
          const isCacheFresh = Date.now() - parsedCache.timestamp < WEATHER_CACHE_TTL

          if (parsedCache.city === storedCity && isCacheFresh) {
            setCity(parsedCache.resolvedCity)
            setWeather(parsedCache.weather)
            setLoading(false)
            return
          }
        }
      } catch {
        // Ignore invalid cache data and fall back to fetching.
      }
    }

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    if (weather) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      // 1. Geocode City
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          storedCity
        )}&count=1&language=en&format=json`,
        { signal: abortController.signal }
      )
      if (!geoRes.ok) throw new Error("Failed to find city coordinates")
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found")
      }

      const loc = geoData.results[0]

      // Update display city name to match found location
      setCity(loc.name)

      // 2. Fetch Weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,apparent_temperature,weather_code,uv_index,is_day&timezone=auto`,
        { signal: abortController.signal }
      )
      if (!weatherRes.ok) throw new Error("Weather fetch failed")
      const weatherData = await weatherRes.json()

      const current = weatherData.current

      if (!abortController.signal.aborted) {
        const nextWeather = {
          temp: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          code: current.weather_code,
          isDay: current.is_day,
          uvi: current.uv_index || 0,
        }

        setWeather(nextWeather)
        localStorage.setItem(
          WEATHER_CACHE_KEY,
          JSON.stringify({
            city: storedCity,
            resolvedCity: loc.name,
            timestamp: Date.now(),
            weather: nextWeather,
          } satisfies WeatherCache)
        )
      }
    } catch (err: unknown) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
        setRefreshing(false)
      }

      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }

  useEffect(() => {
    void loadWeather()

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const title = (
    <CardTitle className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <CloudSun />
        <span>Weather</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => void loadWeather(true)}
          disabled={loading || refreshing}
          aria-label="Refresh weather"
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {city ? (
          <span className="text-sm font-normal text-muted-foreground capitalize">
            {city}
          </span>
        ) : null}
      </div>
    </CardTitle>
  )

  if (loading && !weather) {
    return (
      <Card>
        <CardHeader>
          {title}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 text-center items-center justify-center py-4 text-muted-foreground">
            <CloudSun className="size-8 animate-pulse text-muted" />
            <p className="text-sm">Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card>
        <CardHeader>
          {title}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "Unable to load weather"}</p>
        </CardContent>
      </Card>
    )
  }

  const uv = getUvLabel(weather.uvi)
  const meta = getWeatherMeta(weather.code, weather.isDay)
  const WeatherIcon = meta.icon

  return (
    <Card>
      <CardHeader className="pb-3">
        {title}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Temperature */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter">{weather.temp}°</span>
              <span className="text-lg text-muted-foreground">C</span>
            </div>
            <WeatherIcon className="size-16 text-primary -mr-2" strokeWidth={1.5} />
          </div>

          <p className="text-sm capitalize text-muted-foreground -mt-2">{meta.desc}</p>

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
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
