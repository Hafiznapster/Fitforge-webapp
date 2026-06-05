import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CalendarView = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Mock data for completed workouts
  const completedDays = [3, 5, 8, 10, 12, 15, 17, 19, 22];

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
      <button onClick={() => navigate(-1)} className="text-sl-text-dim hover:text-white mb-6 flex items-center gap-2">
        <ArrowLeft size={16} /> <span className="font-share text-xs tracking-widest">BACK</span>
      </button>

      <div className="header-badge mt-2">HISTORY SYS</div>
      <h1 className="text-3xl font-bold text-white tracking-[4px] mb-8">RAID LOG</h1>

      <div className="bg-sl-surface border border-sl-border p-4">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="text-sl-blue p-2 hover:bg-sl-blue/10"><ChevronLeft size={20} /></button>
          <div className="text-center">
            <h2 className="font-rajdhani text-xl font-bold text-white tracking-widest">{monthNames[currentDate.getMonth()]}</h2>
            <p className="font-share text-xs text-sl-text-dim">{currentDate.getFullYear()}</p>
          </div>
          <button onClick={nextMonth} className="text-sl-blue p-2 hover:bg-sl-blue/10"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="font-share text-xs text-sl-text-dim">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isCompleted = completedDays.includes(day);
            return (
              <div 
                key={day} 
                className={`aspect-square flex flex-col items-center justify-center border font-share text-sm transition-colors cursor-pointer
                  ${isCompleted ? 'border-sl-blue bg-sl-blue/20 text-white shadow-[0_0_10px_rgba(74,158,255,0.2)]' : 'border-sl-border bg-sl-bg text-sl-text-mid hover:border-sl-text-dim'}
                `}
              >
                {day}
                {isCompleted && <div className="w-1 h-1 bg-sl-blue rounded-full mt-1"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
