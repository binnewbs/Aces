import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react"

export interface Note {
  id: string
  content: string
  lastModified: number
}

interface NotesStore {
  notes: Note[]
  activeNoteId: string | null
  setActiveNoteId: (id: string | null) => void
  createNote: () => void
  updateNote: (id: string, content: string) => void
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
      return stored ? JSON.parse(stored) : []
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
    deleteNote,
    deleteNotes,
    moveNote,
  }), [notes, activeNoteId, createNote, updateNote, deleteNote, deleteNotes, moveNote])

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
