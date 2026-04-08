import { useEffect, useState, type DragEvent } from "react"
import { useNotes } from "@/lib/notes-store"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, DownloadCloud, FileDown, FileText, GripVertical, Plus, Square, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function NotesPage() {
  const { notes, activeNoteId, setActiveNoteId, createNote, updateNote, deleteNote, deleteNotes, moveNote } = useNotes()
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
  const [contextDeleteNoteId, setContextDeleteNoteId] = useState<string | null>(null)

  const activeNote = notes.find((n) => n.id === activeNoteId)
  const contextDeleteNote = notes.find((note) => note.id === contextDeleteNoteId)
  const selectedNotes = notes.filter((note) => selectedNoteIds.includes(note.id))
  const allNotesSelected = notes.length > 0 && selectedNoteIds.length === notes.length

  // Derive a title safely from the first line
  const getNoteTitle = (content: string) => {
    if (!content.trim()) return "New Note"
    const firstLine = content.split("\n")[0]
    return firstLine.substring(0, 40) + (firstLine.length > 40 ? "..." : "")
  }
  
  // Quick format for the date
  const getFormattedDate = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}`
  }

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportSingleNote = () => {
    if (!activeNote) return
    const title = getNoteTitle(activeNote.content).replace(/[^a-z0-9]/gi, '_').toLowerCase() || "untitled"
    downloadTextFile(`${title}.txt`, activeNote.content)
  }

  const exportAllNotes = () => {
    if (notes.length === 0) return
    const content = notes.map(n => {
      return `--- ${getNoteTitle(n.content)} (${getFormattedDate(n.lastModified)}) ---\n\n${n.content}\n`
    }).join('\n\n')
    downloadTextFile("aces_notes_backup.txt", content)
  }

  const exportSelectedNotes = () => {
    if (selectedNotes.length === 0) return

    const content = selectedNotes.map((note) => {
      return `--- ${getNoteTitle(note.content)} (${getFormattedDate(note.lastModified)}) ---\n\n${note.content}\n`
    }).join("\n\n")

    downloadTextFile("aces_selected_notes.txt", content)
  }

  useEffect(() => {
    setSelectedNoteIds((prev) => prev.filter((id) => notes.some((note) => note.id === id)))
  }, [notes])

  const resetDragState = () => {
    setDraggedNoteId(null)
    setDropTargetId(null)
  }

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, noteId: string) => {
    setDraggedNoteId(noteId)
    setDropTargetId(noteId)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", noteId)
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>, noteId: string) => {
    if (!draggedNoteId || draggedNoteId === noteId) return

    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    setDropTargetId(noteId)
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>, noteId: string) => {
    event.preventDefault()

    const sourceNoteId = draggedNoteId ?? event.dataTransfer.getData("text/plain")
    if (!sourceNoteId || sourceNoteId === noteId) {
      resetDragState()
      return
    }

    moveNote(sourceNoteId, noteId)
    resetDragState()
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      if (prev) {
        setSelectedNoteIds([])
      }

      return !prev
    })
    resetDragState()
  }

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    )
  }

  const toggleSelectAllNotes = () => {
    setSelectedNoteIds(allNotesSelected ? [] : notes.map((note) => note.id))
  }

  const handleBulkDelete = () => {
    deleteNotes(selectedNoteIds)
    setSelectedNoteIds([])
    setIsSelectionMode(false)
  }

  return (
    <>
      <AlertDialog
        open={contextDeleteNoteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setContextDeleteNoteId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!contextDeleteNote) return
                deleteNote(contextDeleteNote.id)
                setContextDeleteNoteId(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid h-[calc(100dvh-6rem)] min-h-[28rem] gap-4 overflow-hidden lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1.9fr)]">
        {/* Sidebar / Note Index */}
        <div className="flex h-full min-h-0 w-full flex-col rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b p-3">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              My Notes
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportAllNotes} disabled={notes.length === 0} title="Export All Notes">
                <DownloadCloud className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleSelectionMode}
                disabled={notes.length === 0}
                title={isSelectionMode ? "Cancel Selection" : "Select Notes"}
              >
                {isSelectionMode ? <X className="size-4" /> : <Check className="size-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNote} title="New Note">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          {isSelectionMode && (
            <div className="flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={toggleSelectAllNotes}
              >
                {allNotesSelected ? "Clear" : "Select all"}
              </Button>
              <span className="ml-auto">{selectedNoteIds.length} selected</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                disabled={selectedNoteIds.length === 0}
                onClick={exportSelectedNotes}
                title="Download Selected Notes"
              >
                <FileDown className="size-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={selectedNoteIds.length === 0}
                    title="Delete Selected Notes"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Notes</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedNoteIds.length} selected {selectedNoteIds.length === 1 ? "note" : "notes"}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <ScrollArea className="min-h-0 flex-1">
            {notes.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground italic">
                No notes yet. Click the + button to create one!
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-2 pr-3">
                {notes.map((note) => (
                  <ContextMenu key={note.id}>
                    <ContextMenuTrigger asChild>
                      <button
                        type="button"
                        draggable={!isSelectionMode}
                        onClick={() => {
                          if (isSelectionMode) {
                            toggleNoteSelection(note.id)
                            return
                          }

                          setActiveNoteId(note.id)
                        }}
                        onDragStart={(event) => handleDragStart(event, note.id)}
                        onDragOver={(event) => handleDragOver(event, note.id)}
                        onDrop={(event) => handleDrop(event, note.id)}
                        onDragEnd={resetDragState}
                        aria-grabbed={draggedNoteId === note.id}
                        aria-pressed={isSelectionMode ? selectedNoteIds.includes(note.id) : undefined}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md p-3 text-left transition-colors hover:bg-accent",
                          !isSelectionMode && "cursor-grab active:cursor-grabbing",
                          activeNoteId === note.id ? "bg-accent/80" : "bg-transparent",
                          draggedNoteId === note.id && "opacity-60",
                          dropTargetId === note.id && draggedNoteId !== note.id && !isSelectionMode && "bg-accent ring-1 ring-primary/30",
                          isSelectionMode && selectedNoteIds.includes(note.id) && "bg-accent ring-1 ring-primary/30"
                        )}
                      >
                        {isSelectionMode && (
                          <span className="mt-0.5 text-muted-foreground">
                            {selectedNoteIds.includes(note.id) ? (
                              <Check className="size-4 text-primary" />
                            ) : (
                              <Square className="size-4" />
                            )}
                          </span>
                        )}
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="w-full truncate text-sm font-medium">
                            {getNoteTitle(note.content)}
                          </span>
                          <span className="flex w-full items-center justify-between text-xs text-muted-foreground">
                            {getFormattedDate(note.lastModified)}
                          </span>
                        </span>
                        {!isSelectionMode && (
                          <span
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-muted-foreground/70"
                          >
                            <GripVertical className="size-4" />
                          </span>
                        )}
                      </button>
                    </ContextMenuTrigger>
                    {!isSelectionMode && (
                      <ContextMenuContent>
                        <ContextMenuItem
                          variant="destructive"
                          onSelect={() => {
                            setActiveNoteId(note.id)
                            setContextDeleteNoteId(note.id)
                          }}
                        >
                          <Trash2 />
                          Delete Note
                        </ContextMenuItem>
                      </ContextMenuContent>
                    )}
                  </ContextMenu>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Text Editor Pane */}
        <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
        {activeNote ? (
          <>
            <div className="flex items-center justify-end border-b p-2 shrink-0 bg-muted/20">
              <span className="text-xs text-muted-foreground mr-auto ml-2 font-mono">
                {getNoteTitle(activeNote.content)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 mr-1"
                onClick={exportSingleNote}
                title="Export Note"
              >
                <FileDown className="size-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this note? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteNote(activeNote.id)} 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <textarea
              className="flex-1 w-full resize-none border-none bg-transparent p-6 text-[15px] leading-relaxed text-foreground outline-none shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
              placeholder="Start typing your thoughts..."
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, e.target.value)}
              autoFocus
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <FileText className="size-16 opacity-20 mb-4" />
            <p>Select a note or create a new one to start writing.</p>
            <Button className="mt-4" onClick={createNote}>Create First Note</Button>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
