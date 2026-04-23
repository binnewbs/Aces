import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react"

export interface Note {
  id: string
  content: string
  lastModified: number
  pinned: boolean
}

interface NotesStore {
  notes: Note[]
  activeNoteId: string | null
  setActiveNoteId: (id: string | null) => void
  createNote: () => void
  updateNote: (id: string, content: string) => void
  setNotePinned: (id: string, pinned: boolean) => void
  deleteNote: (id: string) => void
  deleteNotes: (ids: string[]) => void
  moveNote: (draggedId: string, targetId: string) => void
}

const STORAGE_KEY = "aces-notes"

const NotesContext = createContext<NotesStore | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []

      return parsed
        .filter((note) => note && typeof note.id === "string")
        .map((note) => ({
          id: note.id,
          content: typeof note.content === "string" ? note.content : "",
          lastModified: typeof note.lastModified === "number" ? note.lastModified : Date.now(),
          pinned: typeof note.pinned === "boolean" ? note.pinned : false,
        }))
    } catch {
      return []
    }
  })
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [notes])

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: "",
      lastModified: Date.now(),
      pinned: false,
    }
    setNotes((prev) => [newNote, ...prev])
    setActiveNoteId(newNote.id)
  }, [])

  const updateNote = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content, lastModified: Date.now() } : note
      )
    )
  }, [])

  const moveNote = useCallback((draggedId: string, targetId: string) => {
    if (draggedId === targetId) return

    setNotes((prev) => {
      const draggedIndex = prev.findIndex((note) => note.id === draggedId)
      const targetIndex = prev.findIndex((note) => note.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev
      }

      const next = [...prev]
      const draggedNote = next[draggedIndex]
      next[draggedIndex] = next[targetIndex]
      next[targetIndex] = draggedNote

      return next
    })
  }, [])

  const setNotePinned = useCallback((id: string, pinned: boolean) => {
    setNotes((prev) => {
      const noteIndex = prev.findIndex((note) => note.id === id)
      if (noteIndex === -1) return prev

      const current = prev[noteIndex]
      if (current.pinned === pinned) return prev

      const nextNote: Note = { ...current, pinned }
      const withoutCurrent = prev.filter((note) => note.id !== id)

      if (pinned) {
        return [nextNote, ...withoutCurrent]
      }

      const firstUnpinnedIndex = withoutCurrent.findIndex((note) => !note.pinned)
      if (firstUnpinnedIndex === -1) {
        return [...withoutCurrent, nextNote]
      }

      const next = [...withoutCurrent]
      next.splice(firstUnpinnedIndex, 0, nextNote)
      return next
    })
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== id)
      if (activeNoteId === id) {
        setActiveNoteId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }, [activeNoteId])

  const deleteNotes = useCallback((ids: string[]) => {
    if (ids.length === 0) return

    const idsToDelete = new Set(ids)

    setNotes((prev) => {
      const filtered = prev.filter((note) => !idsToDelete.has(note.id))

      if (activeNoteId && idsToDelete.has(activeNoteId)) {
        setActiveNoteId(filtered.length > 0 ? filtered[0].id : null)
      }

      return filtered
    })
  }, [activeNoteId])

  const value = useMemo(() => ({ 
    notes, 
    activeNoteId, 
    setActiveNoteId, 
    createNote, 
    updateNote, 
    setNotePinned,
    deleteNote,
    deleteNotes,
    moveNote,
  }), [notes, activeNoteId, createNote, updateNote, setNotePinned, deleteNote, deleteNotes, moveNote])

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}
