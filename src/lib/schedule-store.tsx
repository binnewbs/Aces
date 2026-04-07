import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { ScheduleClass, initialScheduleData } from "./schedule-data"

interface ScheduleStore {
  classes: ScheduleClass[]
  addClass: (cls: Omit<ScheduleClass, "id">) => void
  removeClass: (id: string) => void
  updateClass: (id: string, updates: Partial<ScheduleClass>) => void
}

const STORAGE_KEY = "aces-schedule"

function loadSchedule(): ScheduleClass[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore error
  }
  return initialScheduleData
}

function saveSchedule(classes: ScheduleClass[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes))
}

const ScheduleContext = createContext<ScheduleStore | null>(null)

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<ScheduleClass[]>(loadSchedule)

  useEffect(() => {
    saveSchedule(classes)
  }, [classes])

  const addClass = useCallback(
    (cls: Omit<ScheduleClass, "id">) => {
      const newClass: ScheduleClass = {
        ...cls,
        id: crypto.randomUUID(),
      }
      setClasses((prev) => [...prev, newClass])
    },
    []
  )

  const removeClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const updateClass = useCallback(
    (id: string, updates: Partial<ScheduleClass>) => {
      setClasses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      )
    },
    []
  )

  const value = useMemo(() => ({ classes, addClass, removeClass, updateClass }), [classes, addClass, removeClass, updateClass])

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const context = useContext(ScheduleContext)
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider")
  }
  return context
}
