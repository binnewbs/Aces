import { useNotes } from "@/lib/notes-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Plus, Trash2, DownloadCloud, FileDown } from "lucide-react"
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
  const { notes, activeNoteId, setActiveNoteId, createNote, updateNote, deleteNote } = useNotes()

  const activeNote = notes.find((n) => n.id === activeNoteId)

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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      {/* Sidebar / Note Index */}
      <div className="flex w-64 flex-col rounded-xl border bg-card/50 backdrop-blur-sm shrink-0 shadow-sm">
        <div className="flex items-center justify-between border-b p-3">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            My Notes
          </h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportAllNotes} disabled={notes.length === 0} title="Export All Notes">
              <DownloadCloud className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNote} title="New Note">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {notes.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground italic">
              No notes yet. Click the + button to create one!
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`flex flex-col items-start gap-1 rounded-md p-3 text-left transition-colors hover:bg-accent ${
                    activeNoteId === note.id ? "bg-accent/80" : "bg-transparent"
                  }`}
                >
                  <span className="w-full truncate text-sm font-medium">
                    {getNoteTitle(note.content)}
                  </span>
                  <span className="text-xs text-muted-foreground w-full flex justify-between items-center">
                    {getFormattedDate(note.lastModified)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Text Editor Pane */}
      <div className="relative flex flex-1 flex-col rounded-xl border bg-background shadow-sm overflow-hidden">
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
              className="flex-1 resize-none bg-transparent p-6 text-[15px] leading-relaxed outline-none focus-visible:ring-0 placeholder:text-muted-foreground/50 border-none rounded-none shadow-none text-foreground"
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
  )
}
