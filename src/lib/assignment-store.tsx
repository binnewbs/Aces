import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

export type AssignmentPriority = "low" | "medium" | "high"
export type AssignmentStatus = "todo" | "in-progress" | "done"

export interface Assignment {
  id: string
  title: string
  course: string
  description: string
  dueDate: string
  priority: AssignmentPriority
  status: AssignmentStatus
  createdAt: string
}

interface AssignmentStore {
  assignments: Assignment[]
  addAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => void
  updateAssignment: (id: string, updates: Partial<Assignment>) => void
  deleteAssignment: (id: string) => void
  moveAssignment: (id: string, newStatus: AssignmentStatus) => void
}

const STORAGE_KEY = "aces-assignments"

function loadAssignments(): Assignment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveAssignments(assignments: Assignment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
}

const AssignmentContext = createContext<AssignmentStore | null>(null)

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(loadAssignments)

  useEffect(() => {
    saveAssignments(assignments)
  }, [assignments])

  const addAssignment = useCallback(
    (assignment: Omit<Assignment, "id" | "createdAt">) => {
      const newAssignment: Assignment = {
        ...assignment,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      setAssignments((prev) => [...prev, newAssignment])
    },
    []
  )

  const updateAssignment = useCallback(
    (id: string, updates: Partial<Assignment>) => {
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      )
    },
    []
  )

  const deleteAssignment = useCallback((id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const moveAssignment = useCallback(
    (id: string, newStatus: AssignmentStatus) => {
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      )
    },
    []
  )

  const value = useMemo(
    () => ({ assignments, addAssignment, updateAssignment, deleteAssignment, moveAssignment }),
    [assignments, addAssignment, updateAssignment, deleteAssignment, moveAssignment]
  )

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  )
}

export function useAssignments() {
  const context = useContext(AssignmentContext)
  if (!context) {
    throw new Error("useAssignments must be used within an AssignmentProvider")
  }
  return context
}
