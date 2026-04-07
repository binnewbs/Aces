import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react"
import { useTimer } from "@/lib/timer-store"

const PRESETS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
]

export function FocusTimer() {
  const {
    duration,
    timeLeft,
    isRunning,
    hasStarted,
    setDuration,
    setTimeLeft,
    reset,
    adjustDuration,
    toggleRunning
  } = useTimer()

  const totalSeconds = duration * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  // SVG circle parameters
  const size = 180
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Focus Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Timer ring */}
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth={strokeWidth}
              />
              {/* Progress ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-bold tabular-nums tracking-tight">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              {timeLeft === 0 && (
                <span className="text-sm font-medium text-primary animate-pulse">Done!</span>
              )}
            </div>
          </div>

          {/* Duration adjuster (only when not started) */}
          {!hasStarted && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => adjustDuration(-5)}
                disabled={duration <= 5}
              >
                <Minus />
              </Button>
              <span className="min-w-[60px] text-center text-sm font-medium">
                {duration} min
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => adjustDuration(5)}
                disabled={duration >= 120}
              >
                <Plus />
              </Button>
            </div>
          )}

          {/* Preset buttons (only when not started) */}
          {!hasStarted && (
            <div className="flex gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={duration === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setDuration(preset.value)
                    setTimeLeft(preset.value * 60)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              onClick={toggleRunning}
              disabled={timeLeft === 0}
              className="min-w-[120px]"
            >
              {isRunning ? (
                <>
                  <Pause data-icon="inline-start" />
                  Pause
                </>
              ) : (
                <>
                  <Play data-icon="inline-start" />
                  {hasStarted ? "Resume" : "Start"}
                </>
              )}
            </Button>
            {hasStarted && (
              <Button variant="outline" size="lg" onClick={reset}>
                <RotateCcw data-icon="inline-start" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
