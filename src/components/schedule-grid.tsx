import React, { useState, useMemo } from 'react';
import { ScheduleClass, timeSlots, daysOfWeek } from '@/lib/schedule-data';
import { useSchedule } from '@/lib/schedule-store';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EditScheduleDialog } from './edit-schedule-dialog';

const colorThemes = {
  green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40",
  red: "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:border-rose-500/40",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-500/40",
  teal: "bg-teal-500/10 border-teal-500/20 text-teal-400 hover:border-teal-500/40",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:border-purple-500/40",
  yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:border-yellow-500/40",
  default: "bg-secondary border-border text-foreground hover:border-muted-foreground/30",
};

function timeToMinutes(timeStr: string) {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + (mins || 0);
}

const START_OF_DAY_MINS = 6 * 60; // 06:00
const TOTAL_DAY_MINS = 12 * 60; // 12 hours (06:00 to 18:00)

// Extracted block component mapped with React.memo so scrolling/interactions don't re-render 50 blocks.
const ScheduleCard = React.memo(({ cls, onRightClick }: { cls: ScheduleClass, onRightClick: (c: ScheduleClass) => void }) => {
  const startMins = timeToMinutes(cls.startTime) - START_OF_DAY_MINS;
  const endMins = timeToMinutes(cls.endTime) - START_OF_DAY_MINS;
  const duration = endMins - startMins;

  // We convert the minute offsets into exact CSS percentages.
  const topPercent = (startMins / TOTAL_DAY_MINS) * 100;
  const heightPercent = (duration / TOTAL_DAY_MINS) * 100;

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(cls);
      }}
      className={cn(
        "absolute left-1 right-1 rounded-xl border flex flex-col p-2 overflow-hidden transition-all hover:brightness-110 shadow-sm cursor-pointer hover:z-20",
        colorThemes[cls.colorTheme as keyof typeof colorThemes]
      )}
      style={{
        top: `${Math.max(0, topPercent)}%`,
        height: `${Math.max(2, heightPercent)}%`,
      }}
    >
      <span className="font-semibold text-xs sm:text-[13px] leading-tight mb-1 tracking-tight truncate">{cls.name}</span>
      <div className="flex items-center text-[10px] sm:text-[11px] opacity-80 mt-auto font-medium truncate">
        <MapPin className="mr-1 size-3 shrink-0" />
        <span className="truncate">{cls.room}</span>
      </div>
    </div>
  )
});

export function ScheduleGrid() {
  const { classes } = useSchedule();
  const [editingClass, setEditingClass] = useState<ScheduleClass | null>(null);

  // Group classes by day using useMemo so it isn't rebuilt constantly
  const classesByDay = useMemo(() => {
    const grouped = {} as Record<string, ScheduleClass[]>;
    daysOfWeek.forEach(day => grouped[day] = []);
    classes.forEach(c => {
      if (grouped[c.day]) grouped[c.day].push(c);
    });
    return grouped;
  }, [classes]);

  return (
    <>
      <ScrollArea orientation="horizontal" className="w-full rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="w-full min-w-[800px] flex flex-col">
          
          <div className="flex border-b border-border/60 bg-card/80 backdrop-blur sticky top-0 z-30 shadow-sm">
            <div className="w-20 p-3 flex items-center justify-end font-medium text-muted-foreground text-xs shrink-0 border-r border-border/50 sticky left-0 bg-card/80 backdrop-blur z-40">
              Time
            </div>
            <div className="flex-1 grid grid-cols-5">
              {daysOfWeek.map(day => (
                <div key={day} className="p-3 font-semibold text-foreground text-center border-r border-border/50 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable grid body minimum height to spread the 12 hours cleanly */}
          <div className="flex relative min-h-[800px]">
            
            {/* Y-Axis: Time markers */}
            <div className="w-20 shrink-0 border-r border-border/50 sticky left-0 bg-card/80 backdrop-blur z-20 flex flex-col relative">
              {timeSlots.map((time, idx) => {
                // Adjust translateY of times so they straddle the boundary lines
                const isLast = idx === timeSlots.length - 1;
                return (
                  <div 
                    key={time} 
                    className="absolute w-full pr-3 py-1 text-right text-xs text-muted-foreground font-medium pointer-events-none"
                    style={{ 
                      top: `${(idx / (timeSlots.length - 1)) * 100}%`,
                      transform: idx === 0 ? 'translateY(0)' : isLast ? 'translateY(-100%)' : 'translateY(-50%)' 
                    }}
                  >
                    {time}
                  </div>
                )
              })}
            </div>

            {/* Timetable main area */}
            <div className="flex-1 grid grid-cols-5 relative overflow-hidden bg-background/20">
              
              {/* Background horizontal hour lines */}
              <div className="absolute inset-0 flex flex-col z-0 pointer-events-none">
                {timeSlots.slice(0, -1).map((_, i) => (
                  <div key={i} className="flex-1 border-b border-border/40 w-full" />
                ))}
              </div>

              {/* Day vertical columns with absolute positioned classes */}
              {daysOfWeek.map(day => (
                <div key={day} className="relative border-r border-border/50 last:border-r-0 h-full z-10 transition-colors hover:bg-muted/10">
                  {classesByDay[day].map(cls => (
                    <ScheduleCard 
                      key={cls.id} 
                      cls={cls} 
                      onRightClick={setEditingClass} 
                    />
                  ))}
                </div>
              ))}
              
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Hidden Dialog triggered strictly by right-click */}
      <EditScheduleDialog 
        classToEdit={editingClass} 
        onClose={() => setEditingClass(null)} 
      />
    </>
  )
}
