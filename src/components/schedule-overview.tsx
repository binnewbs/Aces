import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSchedule } from "@/lib/schedule-store"
import { DayOfWeek } from "@/lib/schedule-data"
import { Calendar, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const colorThemes = {
  green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  red: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  default: "bg-secondary border-border text-foreground",
}

import { useMemo } from "react"

export function ScheduleOverview() {
  const { classes } = useSchedule()

  const date = new Date()
  const index = date.getDay() // 0 is Sunday, 1 is Monday
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDay = dayNames[index] as DayOfWeek | "Sunday" | "Saturday"

  const todaysClasses = useMemo(() => {
    return classes
      .filter(c => c.day === currentDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [classes, currentDay]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar />
            Today's Schedule
          </span>
          <span className="text-sm font-normal text-muted-foreground capitalize">
            {currentDay}
          </span>
        </CardTitle>
        <CardDescription>Your classes for today.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {todaysClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border border-dashed rounded-lg">
            <Calendar className="size-8 mb-2 opacity-20" />
            <p>No classes today! 🎉</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {todaysClasses.map(c => (
              <div 
                key={c.id} 
                className={cn("flex flex-col gap-2 rounded-lg border p-3", colorThemes[c.colorTheme as keyof typeof colorThemes])}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm leading-none">{c.name}</span>
                  <div className="flex items-center text-xs opacity-80 shrink-0 bg-background/40 px-1.5 py-0.5 rounded ml-2">
                    <Clock className="mr-1 size-3" />
                    {c.startTime} - {c.endTime}
                  </div>
                </div>
                <div className="flex items-center text-xs opacity-80 mt-1">
                  <MapPin className="mr-1 size-3" />
                  {c.room}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
