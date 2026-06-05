import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

const Workout = () => {
  const { activeWorkout, exercises, updateSet, startWorkout, finishWorkout } = useWorkoutStore();
  const { gainXp, savedPlan } = useUserStore();
  const [showClear, setShowClear] = useState(false);
  const navigate = useNavigate();

  // Selection State
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const handleFinishWorkout = () => {
    setShowClear(true);
    gainXp(350); // Generous XP for completing a raid
    setTimeout(() => {
      finishWorkout();
      navigate('/');
    }, 2500);
  };

  const initiatePlanRaid = () => {
    if (!savedPlan) return;
    const weekData = savedPlan.weeks.find(w => w.weekNumber === selectedWeek);
    const dayData = weekData?.days.find(d => d.day === selectedDay);
    
    if (!dayData || !dayData.exercises) return;

    // Convert AI plan exercises to WorkoutStore exercises
    const initialExercises = dayData.exercises.map((ex, idx) => {
      const setsCount = Number(ex.sets) || 3;
      const generatedSets = Array.from({ length: setsCount }).map((_, sIdx) => ({
        id: `${idx}-${sIdx}`,
        reps: ex.reps, // e.g. "8-10" or "12"
        weight: 0,
        rpe: 8,
        completed: false
      }));

      return {
        id: `ex-${idx}`,
        name: ex.name,
        sets: generatedSets
      };
    });

    startWorkout(`W${selectedWeek}D${selectedDay}: ${dayData.type}`, initialExercises);
  };

  if (!activeWorkout) {
    return (
      <div className="max-w-md mx-auto p-4 pb-24">
        <div className="header-badge mt-6">RAID SELECTION</div>
        <h1 className="text-3xl font-bold text-white tracking-[4px] uppercase font-rajdhani mb-8">
          INITIALIZE RAID
        </h1>

        {savedPlan ? (
          <div className="bg-sl-surface border border-sl-border p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <h2 className="font-share tracking-widest text-sl-blue mb-4 text-sm">SELECT DIRECTIVE PROTOCOL</h2>
            
            <div className="mb-6">
              <label className="text-xs font-share text-sl-text-dim tracking-widest mb-2 block">WEEK</label>
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {savedPlan.weeks.map(w => (
                  <button 
                    key={w.weekNumber}
                    onClick={() => { setSelectedWeek(w.weekNumber); setSelectedDay(1); }}
                    className={`px-4 py-2 font-rajdhani font-bold tracking-[2px] transition-colors ${selectedWeek === w.weekNumber ? 'bg-sl-blue text-sl-bg' : 'bg-sl-bg border border-sl-border text-sl-text-mid hover:border-sl-blue'}`}
                  >
                    W{w.weekNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-xs font-share text-sl-text-dim tracking-widest mb-2 block">DAY</label>
              <div className="grid grid-cols-4 gap-2">
                {savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.map(d => (
                  <button 
                    key={d.day}
                    onClick={() => setSelectedDay(d.day)}
                    className={`px-2 py-3 text-center font-rajdhani font-bold tracking-[2px] transition-colors flex flex-col items-center justify-center ${selectedDay === d.day ? 'bg-sl-teal/20 border border-sl-teal text-sl-teal' : 'bg-sl-bg border border-sl-border text-sl-text-mid hover:border-sl-teal'}`}
                  >
                    <span className="text-xs">D{d.day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-8 bg-sl-bg p-4 border border-dashed border-sl-border-strong">
              <h3 className="font-rajdhani font-bold text-white tracking-[2px] mb-2 uppercase">
                {savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.find(d => d.day === selectedDay)?.type}
              </h3>
              <div className="space-y-1">
                {savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.find(d => d.day === selectedDay)?.exercises?.map((ex, i) => (
                  <div key={i} className="flex justify-between text-xs font-share">
                    <span className="text-sl-text-dim truncate pr-2">{ex.name}</span>
                    <span className="text-sl-teal shrink-0">{ex.sets}x{ex.reps}</span>
                  </div>
                )) || <p className="text-xs text-sl-text-dim font-share tracking-widest">Rest Day Protocol.</p>}
              </div>
            </div>

            <button 
              onClick={initiatePlanRaid}
              disabled={!savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.find(d => d.day === selectedDay)?.exercises}
              className="w-full bg-sl-blue/10 border border-sl-blue text-sl-blue font-share tracking-[4px] font-bold py-4 hover:bg-sl-blue hover:text-sl-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              INITIATE RAID
            </button>
          </div>
        ) : (
          <div className="bg-sl-surface border border-dashed border-sl-border-strong p-8 text-center mt-8">
            <p className="text-sl-text-mid font-share tracking-widest mb-4">NO ACTIVE DIRECTIVE</p>
            <button 
              onClick={() => startWorkout('Free Raid', [])}
              className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-6 py-3 font-share tracking-widest text-xs hover:bg-sl-blue/20 transition-colors"
            >
              START FREE RAID
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <AnimatePresence>
        {showClear && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sl-bg/95 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mb-8"
            >
              <h1 className="text-5xl font-rajdhani font-bold text-transparent bg-clip-text bg-gradient-to-r from-sl-blue to-white tracking-[8px] text-center filter drop-shadow-[0_0_10px_rgba(74,158,255,0.8)]">
                DUNGEON<br/>CLEARED
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-share text-sl-blue tracking-[5px]"
            >
              +350 XP EARNED
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="header-badge mt-6">ACTIVE RAID</div>
      
      <h1 className="text-2xl font-bold text-white tracking-[2px] mb-6 uppercase font-rajdhani">
        {activeWorkout}
      </h1>

      {exercises.map((exercise, index) => (
        <div key={exercise.id}>
          <div className="section-title">
            <span className="num">{(index + 1).toString().padStart(2, '0')}</span>
            <h2>{exercise.name}</h2>
            <div className="line"></div>
          </div>

          <div className="bg-sl-surface border border-sl-border p-4 mb-6 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center border-b border-sl-border pb-2 mb-3">
              <span className="text-[10px] font-share text-sl-text-dim tracking-widest w-8">SET</span>
              <span className="text-[10px] font-share text-sl-text-dim tracking-widest text-center w-16">KG</span>
              <span className="text-[10px] font-share text-sl-text-dim tracking-widest text-center w-16">REPS</span>
              <span className="text-[10px] font-share text-sl-text-dim tracking-widest text-center w-16">RPE</span>
              <span className="w-8"></span>
            </div>

            {exercise.sets.map((set, setIndex) => (
              <div key={set.id} className="flex justify-between items-center py-2 mt-1 border-b border-sl-border/30 last:border-0">
                <span className={`font-share w-8 text-sm ${set.completed ? 'text-sl-text-dim' : 'text-sl-blue'}`}>
                  {setIndex + 1}
                </span>
                
                {set.completed ? (
                  <>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.weight}</span>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.reps}</span>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.rpe}</span>
                    <button 
                      onClick={() => updateSet(exercise.id, set.id, { completed: false })}
                      className="w-8 text-center text-sl-teal"
                    >
                      ✓
                    </button>
                  </>
                ) : (
                  <>
                    <input 
                      type="number" 
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none text-sm placeholder:text-sl-text-dim/50" 
                      placeholder="0"
                      value={set.weight || ''} 
                      onChange={(e) => updateSet(exercise.id, set.id, { weight: Number(e.target.value) })}
                    />
                    <input 
                      type="text" 
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none text-sm placeholder:text-sl-text-dim/50" 
                      placeholder={String(set.reps)}
                      onChange={(e) => updateSet(exercise.id, set.id, { reps: e.target.value })}
                    />
                    <input 
                      type="number" 
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none text-sm placeholder:text-sl-text-dim/50" 
                      placeholder="8"
                      value={set.rpe || ''} 
                      onChange={(e) => updateSet(exercise.id, set.id, { rpe: Number(e.target.value) })}
                    />
                    <button 
                      onClick={() => updateSet(exercise.id, set.id, { completed: true })}
                      className="w-8 h-8 border border-sl-blue bg-sl-blue/10 flex items-center justify-center text-sl-blue text-xs hover:bg-sl-blue hover:text-sl-bg transition-colors"
                    >
                      ✓
                    </button>
                  </>
                )}
              </div>
            ))}
            
            <button className="w-full mt-4 border border-dashed border-sl-border text-sl-text-dim py-2 font-share text-xs tracking-widest hover:text-white hover:border-sl-text-dim transition-colors">
              + ADD SET
            </button>
          </div>
        </div>
      ))}
      
      <button className="w-full bg-sl-surface border border-dashed border-sl-border-strong text-sl-text-dim py-4 hover:border-sl-blue hover:text-sl-blue transition-colors font-share tracking-widest mt-4">
        + ADD EXERCISE
      </button>

      <div className="flex gap-4 mt-8">
        <button 
          onClick={() => finishWorkout()} 
          className="flex-1 bg-red-500/10 border border-red-500/50 text-red-500 font-bold py-4 tracking-widest hover:bg-red-500/20 transition-colors font-share"
        >
          ABANDON
        </button>
        <button 
          onClick={handleFinishWorkout} 
          className="flex-[2] bg-sl-blue border border-sl-blue text-sl-bg font-bold py-4 tracking-widest hover:bg-white hover:border-white transition-colors font-share shadow-[0_0_20px_rgba(74,158,255,0.3)]"
        >
          FINISH RAID
        </button>
      </div>
    </div>
  );
};

export default Workout;
