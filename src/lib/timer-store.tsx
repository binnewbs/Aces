import type { ReactNode } from "react"
import { useMemo, useSyncExternalStore } from "react"

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

type TimerSnapshot = Pick<
  TimerStore,
  "duration" | "timeLeft" | "isRunning" | "hasStarted"
>

type Listener = () => void

const listeners = new Set<Listener>()

let snapshot: TimerSnapshot = {
  duration: 25,
  timeLeft: 25 * 60,
  isRunning: false,
  hasStarted: false,
}

let intervalId: ReturnType<typeof setInterval> | null = null
let alarmAudio: HTMLAudioElement | null = null
let hasScheduledAlarmWarmup = false

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback) => number
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getSnapshot() {
  return snapshot
}

function subscribe(listener: Listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function stopTimerInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function getAlarmAudioSrc() {
  if (typeof window === "undefined") {
    return "alarm.mp3"
  }

  return new URL("alarm.mp3", window.location.href).toString()
}

function getAlarmAudio() {
  if (!alarmAudio) {
    alarmAudio = new Audio(getAlarmAudioSrc())
    alarmAudio.volume = 0.5
    alarmAudio.preload = "auto"
  }

  return alarmAudio
}

function warmAlarmAudio() {
  const audio = getAlarmAudio()

  // Hint the browser/electron renderer to fetch and decode early.
  audio.load()
}

function scheduleAlarmWarmup() {
  if (hasScheduledAlarmWarmup || typeof window === "undefined") return

  hasScheduledAlarmWarmup = true
  const browserWindow = window as WindowWithIdleCallback

  const warmup = () => {
    warmAlarmAudio()
  }

  if (browserWindow.requestIdleCallback) {
    browserWindow.requestIdleCallback(() => warmup())
    return
  }

  globalThis.setTimeout(warmup, 0)
}

function playAlarm() {
  try {
    const audio = getAlarmAudio()
    audio.currentTime = 0
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error)
    })
  } catch (error) {
    console.error("Failed to play alarm sound:", error)
  }
}

function applySnapshot(
  updater: Partial<TimerSnapshot> | ((prev: TimerSnapshot) => Partial<TimerSnapshot>)
) {
  const prevSnapshot = snapshot
  const patch = typeof updater === "function" ? updater(prevSnapshot) : updater
  const nextSnapshot = { ...prevSnapshot, ...patch }

  if (
    nextSnapshot.duration === prevSnapshot.duration &&
    nextSnapshot.timeLeft === prevSnapshot.timeLeft &&
    nextSnapshot.isRunning === prevSnapshot.isRunning &&
    nextSnapshot.hasStarted === prevSnapshot.hasStarted
  ) {
    return
  }

  snapshot = nextSnapshot

  if (prevSnapshot.isRunning !== nextSnapshot.isRunning) {
    if (nextSnapshot.isRunning) {
      startTimerInterval()
    } else {
      stopTimerInterval()
    }
  }

  emitChange()
}

function startTimerInterval() {
  if (intervalId !== null) return

  intervalId = setInterval(() => {
    const currentSnapshot = snapshot

    if (!currentSnapshot.isRunning) {
      stopTimerInterval()
      return
    }

    if (currentSnapshot.timeLeft <= 1) {
      stopTimerInterval()
      snapshot = {
        ...currentSnapshot,
        timeLeft: 0,
        isRunning: false,
      }
      emitChange()
      playAlarm()
      return
    }

    snapshot = {
      ...currentSnapshot,
      timeLeft: currentSnapshot.timeLeft - 1,
    }
    emitChange()
  }, 1000)
}

function setDuration(value: number) {
  applySnapshot({ duration: value })
}

function setTimeLeft(value: number) {
  applySnapshot({ timeLeft: value })
}

function setIsRunning(value: boolean | ((prev: boolean) => boolean)) {
  applySnapshot((prevSnapshot) => ({
    isRunning:
      typeof value === "function" ? value(prevSnapshot.isRunning) : value,
  }))
}

function setHasStarted(value: boolean) {
  applySnapshot({ hasStarted: value })
}

function reset() {
  applySnapshot((prevSnapshot) => ({
    isRunning: false,
    hasStarted: false,
    timeLeft: prevSnapshot.duration * 60,
  }))
}

function adjustDuration(delta: number) {
  if (snapshot.hasStarted) return

  const nextDuration = Math.max(5, Math.min(120, snapshot.duration + delta))
  applySnapshot({
    duration: nextDuration,
    timeLeft: nextDuration * 60,
  })
}

function toggleRunning() {
  applySnapshot((prevSnapshot) => ({
    hasStarted: true,
    isRunning: !prevSnapshot.isRunning,
  }))
}

const timerActions = {
  setDuration,
  setTimeLeft,
  setIsRunning,
  setHasStarted,
  reset,
  adjustDuration,
  toggleRunning,
  playAlarm,
}

export function TimerProvider({ children }: { children: ReactNode }) {
  scheduleAlarmWarmup()
  return children
}

export function useTimer(): TimerStore {
  scheduleAlarmWarmup()
  const currentSnapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return useMemo(
    () => ({
      ...currentSnapshot,
      ...timerActions,
    }),
    [currentSnapshot]
  )
}
