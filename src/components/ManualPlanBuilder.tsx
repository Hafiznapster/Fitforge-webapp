import { useState } from 'react';
import type { GeneratedPlan } from '../services/aiService';
import { Plus, Trash2, Copy, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface PlanDay {
  day: number;
  type: string;
  exercises: Exercise[];
}

export interface PlanWeek {
  weekNumber: number;
  days: PlanDay[];
}

interface ManualPlanBuilderProps {
  onSave: (plan: GeneratedPlan) => void;
  onCancel: () => void;
}

const ManualPlanBuilder = ({ onSave, onCancel }: ManualPlanBuilderProps) => {
  const [weeks, setWeeks] = useState<PlanWeek[]>([{ weekNumber: 1, days: [] }]);

  const handleAddWeek = () => {
    setWeeks([...weeks, { weekNumber: weeks.length + 1, days: [] }]);
  };

  const handleDuplicateLastWeek = () => {
    if (weeks.length === 0) return;
    const lastWeek = weeks[weeks.length - 1];
    const newWeek = JSON.parse(JSON.stringify(lastWeek)); // Deep copy
    newWeek.weekNumber = weeks.length + 1;
    setWeeks([...weeks, newWeek]);
  };

  const handleRemoveWeek = (weekIndex: number) => {
    const newWeeks = weeks.filter((_, i) => i !== weekIndex)
      .map((w, i) => ({ ...w, weekNumber: i + 1 }));
    setWeeks(newWeeks);
  };

  const handleAddDay = (weekIndex: number) => {
    const newWeeks = [...weeks];
    const dayNumber = newWeeks[weekIndex].days.length + 1;
    if (dayNumber > 7) return; // Max 7 days
    newWeeks[weekIndex].days.push({ day: dayNumber, type: 'Workout', exercises: [] });
    setWeeks(newWeeks);
  };

  const handleUpdateDayType = (weekIndex: number, dayIndex: number, type: string) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex].days[dayIndex].type = type;
    setWeeks(newWeeks);
  };

  const handleAddExercise = (weekIndex: number, dayIndex: number) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex].days[dayIndex].exercises.push({ name: 'New Exercise', sets: 3, reps: '10' });
    setWeeks(newWeeks);
  };

  const handleUpdateExercise = (weekIndex: number, dayIndex: number, exIndex: number, field: keyof Exercise, value: string | number) => {
    const newWeeks = [...weeks];
    const newExercises = [...newWeeks[weekIndex].days[dayIndex].exercises];
    newExercises[exIndex] = { ...newExercises[exIndex], [field]: field === 'sets' ? Number(value) || 0 : value };
    newWeeks[weekIndex].days[dayIndex].exercises = newExercises;
    setWeeks(newWeeks);
  };

  const handleRemoveExercise = (weekIndex: number, dayIndex: number, exIndex: number) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex].days[dayIndex].exercises.splice(exIndex, 1);
    setWeeks(newWeeks);
  };

  const handleSave = () => {
    const plan: GeneratedPlan = { weeks };
    onSave(plan);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-sl-surface border border-sl-border p-4 sticky top-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <h2 className="font-rajdhani text-xl font-bold text-white tracking-[2px]">MANUAL BUILDER</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="text-sl-text-dim text-xs font-share tracking-widest px-3 py-1 border border-sl-border hover:text-white transition-colors">CANCEL</button>
          <button onClick={handleSave} className="bg-sl-blue/10 border border-sl-blue text-sl-blue text-xs font-share tracking-widest px-3 py-1 flex items-center gap-1 hover:bg-sl-blue hover:text-sl-bg transition-colors">
            <Save size={12} /> SAVE
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence>
          {weeks.map((week, wIdx) => (
            <motion.div 
              key={week.weekNumber}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-sl-surface border border-sl-border p-4"
            >
              <div className="flex justify-between items-center border-b border-sl-border/50 pb-2 mb-4">
                <h3 className="font-rajdhani text-lg font-bold text-white tracking-[2px]">WEEK {week.weekNumber}</h3>
                <button onClick={() => handleRemoveWeek(wIdx)} className="text-sl-red/50 hover:text-sl-red transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {week.days.map((day, dIdx) => (
                  <div key={day.day} className="bg-sl-bg border border-sl-border/50 p-3">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-rajdhani font-bold text-sl-blue tracking-widest">D{day.day}</span>
                        <input 
                          type="text" 
                          value={day.type} 
                          onChange={(e) => handleUpdateDayType(wIdx, dIdx, e.target.value)}
                          className="bg-transparent border-b border-sl-border text-white text-sm font-share tracking-widest outline-none focus:border-sl-blue px-1"
                        />
                      </div>
                      <button onClick={() => handleAddExercise(wIdx, dIdx)} className="text-sl-text-dim hover:text-sl-blue transition-colors flex items-center gap-1 text-[10px] font-share tracking-widest">
                        <Plus size={12} /> ADD EX
                      </button>
                    </div>

                    <div className="space-y-2">
                      {day.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={ex.name} 
                            onChange={(e) => handleUpdateExercise(wIdx, dIdx, eIdx, 'name', e.target.value)}
                            className="flex-1 bg-sl-surface border border-sl-border text-white text-xs p-1 font-share outline-none focus:border-sl-blue"
                            placeholder="Exercise Name"
                          />
                          <input 
                            type="text" 
                            value={ex.sets} 
                            onChange={(e) => handleUpdateExercise(wIdx, dIdx, eIdx, 'sets', e.target.value)}
                            className="w-10 text-center bg-sl-surface border border-sl-border text-white text-xs p-1 font-share outline-none focus:border-sl-blue"
                            placeholder="Sets"
                          />
                          <span className="text-sl-text-dim font-share text-xs">×</span>
                          <input 
                            type="text" 
                            value={ex.reps} 
                            onChange={(e) => handleUpdateExercise(wIdx, dIdx, eIdx, 'reps', e.target.value)}
                            className="w-12 text-center bg-sl-surface border border-sl-border text-white text-xs p-1 font-share outline-none focus:border-sl-blue"
                            placeholder="Reps"
                          />
                          <button onClick={() => handleRemoveExercise(wIdx, dIdx, eIdx)} className="text-sl-text-dim hover:text-sl-red p-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {day.exercises.length === 0 && (
                        <p className="text-[10px] text-sl-text-dim font-share tracking-widest text-center italic py-2">REST DAY / NO EXERCISES</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {week.days.length < 7 && (
                  <button onClick={() => handleAddDay(wIdx)} className="w-full border border-dashed border-sl-border text-sl-text-dim py-2 text-xs font-share tracking-widest hover:border-sl-blue hover:text-sl-blue transition-colors flex items-center justify-center gap-1">
                    <Plus size={12} /> ADD DAY {week.days.length + 1}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex gap-2">
          <button onClick={handleAddWeek} className="flex-1 border border-sl-blue text-sl-blue py-3 text-xs font-share tracking-widest hover:bg-sl-blue hover:text-sl-bg transition-colors flex items-center justify-center gap-2">
            <Plus size={14} /> NEW WEEK
          </button>
          <button onClick={handleDuplicateLastWeek} className="flex-1 border border-sl-gold text-sl-gold py-3 text-xs font-share tracking-widest hover:bg-sl-gold hover:text-sl-bg transition-colors flex items-center justify-center gap-2">
            <Copy size={14} /> DUPLICATE LAST
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualPlanBuilder;
