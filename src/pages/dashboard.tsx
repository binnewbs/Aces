import { WeatherCard } from "@/components/weather-card"
import { FocusTimer } from "@/components/focus-timer"
import { AssignmentOverview } from "@/components/assignment-overview"
import { ScheduleOverview } from "@/components/schedule-overview"
import { CashflowOverview } from "@/components/cashflow-overview"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your personal overview at a glance.
        </p>
      </div>

      <CashflowOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Weather + Focus Timer */}
        <div className="flex flex-col gap-6">
          <WeatherCard />
          <FocusTimer />
        </div>

        {/* Right column: Assignment Overview + Schedule Overview */}
        <div className="flex flex-col gap-6">
          <AssignmentOverview />
          <ScheduleOverview />
        </div>
      </div>
    </div>
  )
}
