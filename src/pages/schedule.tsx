import { ScheduleGrid } from "@/components/schedule-grid"
import { AddScheduleDialog } from "@/components/add-schedule-dialog"

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            Manage your weekly classes.
          </p>
        </div>
        <AddScheduleDialog />
      </div>

      <div className="flex-1 w-full">
        <ScheduleGrid />
      </div>
    </div>
  )
}
