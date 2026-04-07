import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode, useMemo } from "react"

interface TimerStore {
  duration: number
  timeLeft: number
  isRunning: boolean
  hasStarted: boolean
  setDuration: (val: number) => void
  setTimeLeft: (val: number) => void
  setIsRunning: (val: boolean | ((prev: boolean) => boolean)) => void
  setHasStarted: (val: boolean) => void
  reset: () => void
  adjustDuration: (delta: number) => void
  toggleRunning: () => void
  playAlarm: () => void
}

const TimerContext = createContext<TimerStore | null>(null)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [duration, setDuration] = useState(25) // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = useCallback(() => {
    setIsRunning(false)
    setHasStarted(false)
    setTimeLeft(duration * 60)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [duration])

  const playAlarm = useCallback(() => {
    try {
      const audio = new Audio("/alarm.mp3")
      audio.volume = 0.5
      audio.play().catch(e => console.error("Audio playback failed:", e))
    } catch (error) {
      console.error("Failed to play alarm sound:", error)
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            if (intervalRef.current) clearInterval(intervalRef.current)
            playAlarm()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, playAlarm])

  const adjustDuration = (delta: number) => {
    if (hasStarted) return
    const newDuration = Math.max(5, Math.min(120, duration + delta))
    setDuration(newDuration)
    setTimeLeft(newDuration * 60)
  }

  const toggleRunning = () => {
    if (!hasStarted) setHasStarted(true)
    setIsRunning((prev) => !prev)
  }

  const value = useMemo(() => ({ 
    duration, 
    timeLeft, 
    isRunning, 
    hasStarted, 
    setDuration, 
    setTimeLeft, 
    setIsRunning, 
    setHasStarted,
    reset,
    adjustDuration,
    toggleRunning,
    playAlarm
  }), [duration, timeLeft, isRunning, hasStarted, reset, playAlarm])

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
