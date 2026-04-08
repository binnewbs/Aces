import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Plus, Minus, Volume2 } from "lucide-react"
import { useTimer } from "@/lib/timer-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PRESETS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
]

const MIN_CUSTOM_DURATION = 1
const MAX_CUSTOM_DURATION = 300

export function FocusTimer() {
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [customMinutes, setCustomMinutes] = useState("")
  const {
    duration,
    timeLeft,
    isRunning,
    hasStarted,
    setDuration,
    setTimeLeft,
    reset,
    adjustDuration,
    toggleRunning,
    playAlarm
  } = useTimer()

  const hasPresetMatch = PRESETS.some((preset) => preset.value === duration)
  const parsedCustomMinutes = Number.parseInt(customMinutes, 10)
  const isCustomDurationValid =
    Number.isInteger(parsedCustomMinutes) &&
    parsedCustomMinutes >= MIN_CUSTOM_DURATION &&
    parsedCustomMinutes <= MAX_CUSTOM_DURATION

  const openCustomDialog = () => {
    setCustomMinutes(String(duration))
    setCustomDialogOpen(true)
  }

  const handleCustomDurationSubmit = () => {
    if (!isCustomDurationValid) return

    setDuration(parsedCustomMinutes)
    setTimeLeft(parsedCustomMinutes * 60)
    setCustomDialogOpen(false)
  }

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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Focus Timer
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={playAlarm}
          >
            <Volume2 className="size-3.5" />
            <span className="text-xs">Test Sound</span>
          </Button>
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
              <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant={!hasPresetMatch ? "default" : "outline"}
                    size="sm"
                    onClick={openCustomDialog}
                  >
                    Custom
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Custom Timer</DialogTitle>
                    <DialogDescription>
                      Set a focus duration in minutes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-2">
                    <Label htmlFor="custom-timer-minutes">Minutes</Label>
                    <Input
                      id="custom-timer-minutes"
                      type="number"
                      min={MIN_CUSTOM_DURATION}
                      max={MAX_CUSTOM_DURATION}
                      step="1"
                      placeholder="90"
                      value={customMinutes}
                      onChange={(event) => setCustomMinutes(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose any value from {MIN_CUSTOM_DURATION} to {MAX_CUSTOM_DURATION} minutes.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCustomDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCustomDurationSubmit}
                      disabled={!isCustomDurationValid}
                    >
                      Apply Timer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
