export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface ScheduleClass {
  id: string;
  name: string;
  room: string;
  day: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  colorTheme: "green" | "red" | "blue" | "teal" | "purple" | "yellow" | "default";
}

// 1-hour slots from 06:00 to 18:00
export const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export const daysOfWeek: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Default seed data with rounded hours for the new grid layout
export const initialScheduleData: ScheduleClass[] = [];
