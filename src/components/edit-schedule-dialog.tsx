import { useState, useEffect } from "react"
import { useSchedule } from "@/lib/schedule-store"
import { DayOfWeek, ScheduleClass } from "@/lib/schedule-data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Trash2 } from "lucide-react"

const TIME_24H_PATTERN = "^([01]\\d|2[0-3]):([0-5]\\d)$"
type ColorTheme = "green" | "red" | "blue" | "teal" | "purple" | "yellow" | "default"

interface EditScheduleDialogProps {
  classToEdit: ScheduleClass | null;
  onClose: () => void;
}

export function EditScheduleDialog({ classToEdit, onClose }: EditScheduleDialogProps) {
  const { updateClass, removeClass } = useSchedule()
  const open = !!classToEdit;

  const [name, setName] = useState("")
  const [room, setRoom] = useState("")
  const [day, setDay] = useState<DayOfWeek>("Monday")
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("10:00")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")

  useEffect(() => {
    if (classToEdit) {
      setName(classToEdit.name)
      setRoom(classToEdit.room)
      setDay(classToEdit.day)
      setStartTime(classToEdit.startTime)
      setEndTime(classToEdit.endTime)
      setColorTheme(classToEdit.colorTheme)
    }
  }, [classToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !room || !classToEdit) return

    updateClass(classToEdit.id, {
      name,
      room,
      day,
      startTime,
      endTime,
      colorTheme,
    })

    onClose()
  }
  
  const handleDelete = () => {
    if (!classToEdit) return;
    removeClass(classToEdit.id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Modify or remove this class from your schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-room" className="text-right">
                Room
              </Label>
              <Input
                id="edit-room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-day" className="text-right">
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
              <Label htmlFor="edit-time" className="text-right">
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
              <Label htmlFor="edit-color" className="text-right">
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
          <DialogFooter className="flex-row justify-between gap-2 px-4 pb-4 sm:justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete} className="px-3">
              <Trash2 className="mr-2 size-4"/>
               Delete
            </Button>
            <div className="flex gap-2 text-right">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
