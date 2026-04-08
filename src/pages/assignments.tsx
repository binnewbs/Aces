import { useState } from "react"
import {
  useAssignments,
  type Assignment,
  type AssignmentStatus,
  type AssignmentPriority,
} from "@/lib/assignment-store"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Plus,
  CalendarIcon,
  CalendarDays,
  GripVertical,
  Trash2,
  Pencil,
} from "lucide-react"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"

const columns: { id: AssignmentStatus; title: string; description: string }[] = [
  { id: "todo", title: "To Do", description: "Tasks waiting to be started" },
  { id: "in-progress", title: "In Progress", description: "Currently working on" },
  { id: "done", title: "Done", description: "Completed tasks" },
]

const priorityConfig: Record<AssignmentPriority, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "outline" },
  high: { label: "High", variant: "destructive" },
}

interface AssignmentFormData {
  title: string
  course: string
  description: string
  dueDate: string
  priority: AssignmentPriority
  status: AssignmentStatus
}

const defaultFormData: AssignmentFormData = {
  title: "",
  course: "",
  description: "",
  dueDate: new Date().toISOString().split("T")[0],
  priority: "medium",
  status: "todo",
}

export default function AssignmentsPage() {
  const { assignments, addAssignment, updateAssignment, deleteAssignment, moveAssignment } = useAssignments()
  const [formData, setFormData] = useState<AssignmentFormData>(defaultFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [isDueDatePickerOpen, setIsDueDatePickerOpen] = useState(false)

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.course.trim()) return

    if (editingId) {
      updateAssignment(editingId, formData)
    } else {
      addAssignment(formData)
    }

    setFormData(defaultFormData)
    setEditingId(null)
    setDialogOpen(false)
    setIsDueDatePickerOpen(false)
  }

  const startEdit = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      course: assignment.course,
      description: assignment.description,
      dueDate: assignment.dueDate,
      priority: assignment.priority,
      status: assignment.status,
    })
    setEditingId(assignment.id)
    setDialogOpen(true)
    setIsDueDatePickerOpen(false)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, status: AssignmentStatus) => {
    e.preventDefault()
    if (draggedId) {
      moveAssignment(draggedId, status)
      setDraggedId(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Manage your college assignments with a Kanban board.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setFormData(defaultFormData)
            setEditingId(null)
            setIsDueDatePickerOpen(false)
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Assignment" : "New Assignment"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the assignment details." : "Add a new assignment to your board."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Linear Algebra Problem Set 3"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course">Course / Subject</Label>
                <Input
                  id="course"
                  placeholder="e.g. Mathematics, Computer Science"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Additional notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover open={isDueDatePickerOpen} onOpenChange={setIsDueDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon data-icon="inline-start" />
                        {formData.dueDate ? (
                          format(parse(formData.dueDate, "yyyy-MM-dd", new Date()), "PPP")
                        ) : (
                          <span>Pick a due date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                      <Calendar
                        mode="single"
                        selected={parse(formData.dueDate, "yyyy-MM-dd", new Date())}
                        onSelect={(selectedDate) => {
                          if (!selectedDate) return

                          setFormData({
                            ...formData,
                            dueDate: format(selectedDate, "yyyy-MM-dd"),
                          })
                          setIsDueDatePickerOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: AssignmentPriority) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingId && (
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: AssignmentStatus) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.title.trim() || !formData.course.trim()}>
                {editingId ? "Save Changes" : "Create Assignment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Kanban columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {columns.map((column) => {
          const columnAssignments = assignments
            .filter((a) => a.status === column.id)
            .sort((a, b) => {
              // Sort by priority (high first), then due date
              const priorityOrder = { high: 0, medium: 1, low: 2 }
              const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
              if (pDiff !== 0) return pDiff
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            })

          return (
            <div
              key={column.id}
              className="flex flex-col gap-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnAssignments.length}
                  </Badge>
                </div>
              </div>

              <div className="flex min-h-[200px] flex-col gap-3 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-3">
                {columnAssignments.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-xs text-muted-foreground italic">
                      Drag assignments here
                    </p>
                  </div>
                ) : (
                  columnAssignments.map((assignment) => {
                    const dueDate = new Date(assignment.dueDate)
                    const now = new Date()
                    const daysUntil = Math.ceil(
                      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    )
                    const isOverdue = daysUntil < 0 && assignment.status !== "done"

                    return (
                      <Card
                        key={assignment.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, assignment.id)}
                        onDragEnd={handleDragEnd}
                        className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                          draggedId === assignment.id ? "opacity-50" : ""
                        } ${isOverdue ? "border-destructive/50" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <GripVertical className="size-4 shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight truncate">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {assignment.course}
                              </p>
                              {assignment.description && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic border-l-2 border-primary/20 pl-2">
                                  {assignment.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => startEdit(assignment)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-destructive hover:text-destructive"
                                onClick={() => deleteAssignment(assignment.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge variant={priorityConfig[assignment.priority].variant} className="text-[10px]">
                              {priorityConfig[assignment.priority].label}
                            </Badge>
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="size-3 text-muted-foreground" />
                              <span
                                className={`text-[11px] font-medium ${
                                  isOverdue
                                    ? "text-destructive"
                                    : daysUntil <= 2 && assignment.status !== "done"
                                      ? "text-yellow-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
