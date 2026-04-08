import { useState } from "react"
import { useSchedule } from "@/lib/schedule-store"
import { DayOfWeek } from "@/lib/schedule-data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

const TIME_24H_PATTERN = "^([01]\\d|2[0-3]):([0-5]\\d)$"
type ColorTheme = "green" | "red" | "blue" | "teal" | "purple" | "yellow" | "default"

export function AddScheduleDialog() {
  const { addClass } = useSchedule()
  const [open, setOpen] = useState(false)

  const [name, setName] = useState("")
  const [room, setRoom] = useState("")
  const [day, setDay] = useState<DayOfWeek>("Monday")
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("10:00")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // basic validation
    if (!name || !room) return

    addClass({
      name,
      room,
      day,
      startTime,
      endTime,
      colorTheme,
    })

    // Reset and close
    setName("")
    setRoom("")
    setDay("Monday")
    setStartTime("08:00")
    setEndTime("10:00")
    setColorTheme("default")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Add Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Add a new class to your weekly schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Mathematics"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">
                Room
              </Label>
              <Input
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Room 101"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Day
              </Label>
              <div className="col-span-3">
                <Select value={day} onValueChange={(v) => setDay(v as DayOfWeek)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input 
                  type="text"
                  inputMode="numeric"
                  pattern={TIME_24H_PATTERN}
                  placeholder="08:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex-1"
                  title="Use 24-hour format, for example 08:00 or 14:30"
                  required
                />
                <span className="text-muted-foreground">-</span>
                <Input 
                  type="text"
                  inputMode="numeric"
                  pattern={TIME_24H_PATTERN}
                  placeholder="10:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1"
                  title="Use 24-hour format, for example 10:00 or 16:45"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Theme
              </Label>
              <div className="col-span-3">
                <Select value={colorTheme} onValueChange={(v) => setColorTheme(v as ColorTheme)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="teal">Teal</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
