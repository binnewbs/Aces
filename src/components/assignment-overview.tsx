import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAssignments, type AssignmentStatus } from "@/lib/assignment-store"
import { CalendarDays, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const statusConfig: Record<AssignmentStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  todo: { label: "To Do", variant: "outline" },
  "in-progress": { label: "In Progress", variant: "secondary" },
  done: { label: "Done", variant: "default" },
}


export function AssignmentOverview() {
  const { assignments } = useAssignments()

  const todoCount = assignments.filter((a) => a.status === "todo").length
  const inProgressCount = assignments.filter((a) => a.status === "in-progress").length
  const doneCount = assignments.filter((a) => a.status === "done").length

  const upcoming = assignments
    .filter((a) => a.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ClipboardList />
            Assignments
          </span>
          <Button variant="outline" size="sm" asChild>
            <a href="#/assignments">View Board</a>
          </Button>
        </CardTitle>
        <CardDescription>
          {assignments.length === 0
            ? "No assignments yet. Head to the board to create one."
            : `${assignments.length} total · ${todoCount} to do · ${inProgressCount} active · ${doneCount} done`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Status summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">{todoCount}</p>
            <p className="text-xs text-muted-foreground">To Do</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">{doneCount}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Upcoming assignments */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</h4>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              No upcoming assignments
            </p>
          ) : (
            upcoming.map((assignment) => {
              const dueDate = new Date(assignment.dueDate)
              const now = new Date()
              const daysUntil = Math.ceil(
                (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              )
              const isOverdue = daysUntil < 0
              const isDueSoon = daysUntil >= 0 && daysUntil <= 2

              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {assignment.title}
                      </span>
                      <Badge variant={statusConfig[assignment.status].variant} className="text-[10px] px-1.5 py-0">
                        {statusConfig[assignment.status].label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {assignment.course}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    <span
                      className={`text-xs font-medium ${
                        isOverdue
                          ? "text-destructive"
                          : isDueSoon
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue
                        ? `${Math.abs(daysUntil)}d overdue`
                        : daysUntil === 0
                          ? "Today"
                          : daysUntil === 1
                            ? "Tomorrow"
                            : `${daysUntil}d left`}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
