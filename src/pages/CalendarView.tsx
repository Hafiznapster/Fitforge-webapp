import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';

const CalendarView = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  
  const { workoutHistory } = useWorkoutStore();

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  // Get workouts for the current month
  const getWorkoutsForDay = (day: number) => {
    return workoutHistory.filter(workout => {
      const wDate = new Date(workout.date);
      return wDate.getDate() === day && 
             wDate.getMonth() === currentDate.getMonth() && 
             wDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const selectedWorkouts = selectedDay ? getWorkoutsForDay(selectedDay) : [];

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
      <button onClick={() => navigate(-1)} className="text-sl-text-dim hover:text-white mb-6 flex items-center gap-2">
        <ArrowLeft size={16} /> <span className="font-share text-xs tracking-widest">BACK</span>
      </button>

      <div className="header-badge mt-2">HISTORY SYS</div>
      <h1 className="text-3xl font-bold text-white tracking-[4px] mb-8 font-rajdhani">RAID LOG</h1>

      <div className="bg-sl-surface border border-sl-border p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-6 border-b border-sl-border pb-4">
          <button onClick={prevMonth} className="text-sl-blue p-2 hover:bg-sl-blue/10 transition-colors"><ChevronLeft size={20} /></button>
          <div className="text-center">
            <h2 className="font-rajdhani text-xl font-bold text-white tracking-widest">{monthNames[currentDate.getMonth()]}</h2>
            <p className="font-share text-xs text-sl-text-dim">{currentDate.getFullYear()}</p>
          </div>
          <button onClick={nextMonth} className="text-sl-blue p-2 hover:bg-sl-blue/10 transition-colors"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center border-b border-sl-border/30 pb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="font-share text-[10px] text-sl-text-dim tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayWorkouts = getWorkoutsForDay(day);
            const isCompleted = dayWorkouts.length > 0;
            const isSelected = selectedDay === day;
            const now = new Date();
            const isToday = day === now.getDate() &&
              currentDate.getMonth() === now.getMonth() &&
              currentDate.getFullYear() === now.getFullYear();
            
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDay(day)}
                className={`aspect-square flex flex-col items-center justify-center border font-share text-sm transition-colors cursor-pointer relative
                  ${isSelected ? 'border-sl-blue bg-sl-blue text-sl-bg' : 
                    isCompleted ? 'border-sl-blue bg-sl-blue/20 text-white hover:bg-sl-blue/40' : 
                    isToday ? 'border-sl-teal bg-sl-teal/10 text-sl-teal' :
                    'border-sl-border bg-sl-bg text-sl-text-mid hover:border-sl-text-dim'}
                `}
              >
                {day}
                {isCompleted && !isSelected && <div className="w-1.5 h-1.5 bg-sl-blue rounded-full absolute bottom-1"></div>}
                {isCompleted && isSelected && <div className="w-1.5 h-1.5 bg-sl-bg rounded-full absolute bottom-1"></div>}
                {isToday && !isCompleted && !isSelected && <div className="w-1.5 h-1.5 bg-sl-teal rounded-full absolute bottom-1"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="section-title">
            <span className="num">LOG</span>
            <h2>{monthNames[currentDate.getMonth()]} {selectedDay}</h2>
            <div className="line"></div>
          </div>
          
          {selectedWorkouts.length > 0 ? (
            <div className="space-y-4">
              {selectedWorkouts.map((workout) => (
                <div key={workout.id} className="bg-sl-surface border border-sl-border p-4">
                  <div className="flex justify-between items-center mb-4 border-b border-sl-border/50 pb-2">
                    <h3 className="font-rajdhani font-bold text-sl-blue tracking-[2px] uppercase">
                      {workout.type}
                    </h3>
                    <span className="font-share text-[10px] text-sl-text-dim tracking-widest">
                      {new Date(workout.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {workout.exercises.map(ex => (
                      <div key={ex.id} className="flex justify-between items-center">
                        <span className="font-share text-xs text-white truncate pr-4">{ex.name}</span>
                        <span className="font-share text-xs text-sl-teal shrink-0">
                          {ex.sets.filter(s => s.completed).length} SETS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-sl-surface border border-dashed border-sl-border-strong p-8 text-center text-sl-text-dim font-share text-xs tracking-widest">
              NO RAIDS RECORDED ON THIS DATE.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
