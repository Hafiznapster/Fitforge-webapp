import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { Trash2 } from 'lucide-react';
import LevelUpVFX from '../components/LevelUpVFX';

const Workout = () => {
  const { activeWorkout, exercises, workoutHistory, startTime, updateSet, addSet, deleteSet, addExercise, startWorkout, finishWorkout, abandonWorkout } = useWorkoutStore();
  const { gainXp, savedPlan } = useUserStore();
  const [showClear, setShowClear] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [durationStr, setDurationStr] = useState('00:00:00');
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const isFinishing = useRef(false);
  const restInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Selection State
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [customDate, setCustomDate] = useState<string>('');

  // Cleanup rest timer on unmount and request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    return () => {
      if (restInterval.current) clearInterval(restInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setDurationStr(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const getLastPerformance = (exerciseName: string) => {
    for (let i = workoutHistory.length - 1; i >= 0; i--) {
      const workout = workoutHistory[i];
      const match = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (match) {
        const completedSets = match.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const maxWeightSet = completedSets.reduce((prev, current) => (Number(prev.weight) > Number(current.weight)) ? prev : current);
          const weight = Number(maxWeightSet.weight);
          if (weight > 0) {
            return `PREV: ${weight}KG × ${maxWeightSet.reps} | TARGET: ${weight + 2.5}KG`;
          }
          return `PREV: ${maxWeightSet.weight}KG × ${maxWeightSet.reps}`;
        }
      }
    }
    return 'NO PREVIOUS DATA';
  };

  const startRestTimer = (seconds = 90) => {
    if (restInterval.current) clearInterval(restInterval.current);
    setRestSeconds(seconds);
    restInterval.current = setInterval(() => {
      setRestSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(restInterval.current!);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest Complete', {
              body: 'Time to hit your next set, Hunter.',
              icon: '/vite.svg', // Fallback icon
              vibrate: [200, 100, 200, 100, 500]
            } as any);
          }
          if (navigator.vibrate) {
             navigator.vibrate([200, 100, 200, 100, 500]);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishWorkout = () => {
    if (isFinishing.current) return;
    isFinishing.current = true;
    const completedCount = exercises.filter(ex => ex.sets.some(s => s.completed)).length;
    const xpEarned = Math.max(50, completedCount * 50);
    setShowClear(true);
    gainXp(xpEarned);
    setTimeout(() => {
      finishWorkout();
      navigate('/');
    }, 2500);
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    addExercise({
      id: crypto.randomUUID().slice(0, 8),
      name: newExName.trim(),
      sets: [{
        id: crypto.randomUUID().slice(0, 8),
        reps: '',
        weight: 0,
        rpe: 8,
        completed: false
      }]
    });
    setNewExName('');
    setShowAddExercise(false);
  };

  const initiatePlanRaid = () => {
    if (!savedPlan) return;
    const weekData = savedPlan.weeks.find(w => w.weekNumber === selectedWeek);
    const dayData = weekData?.days.find(d => d.day === selectedDay);
    if (!dayData || !dayData.exercises) return;
    const initialExercises = dayData.exercises.map((ex, idx) => {
      const setsCount = Number(ex.sets) || 3;
      const generatedSets = Array.from({ length: setsCount }).map((_, sIdx) => ({
        id: `${idx}-${sIdx}`,
        reps: ex.reps,
        weight: 0,
        rpe: 8,
        completed: false
      }));
      return { id: `ex-${idx}`, name: ex.name, sets: generatedSets };
    });
    startWorkout(`W${selectedWeek}D${selectedDay}: ${dayData.type}`, initialExercises, customDate || undefined);
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
              <div className="flex gap-2 overflow-x-auto pb-2">
                {savedPlan.weeks.map(w => (
                  <button key={w.weekNumber} onClick={() => { setSelectedWeek(w.weekNumber); setSelectedDay(1); }}
                    className={`px-4 py-2 font-rajdhani font-bold tracking-[2px] transition-colors ${
                      selectedWeek === w.weekNumber ? 'bg-sl-blue text-sl-bg' : 'bg-sl-bg border border-sl-border text-sl-text-mid hover:border-sl-blue'
                    }`}>
                    W{w.weekNumber}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <label className="text-xs font-share text-sl-text-dim tracking-widest mb-2 block">DAY</label>
              <div className="grid grid-cols-4 gap-2">
                {savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.map(d => (
                  <button key={d.day} onClick={() => setSelectedDay(d.day)}
                    className={`px-2 py-3 text-center font-rajdhani font-bold tracking-[2px] transition-colors flex flex-col items-center justify-center ${
                      selectedDay === d.day ? 'bg-sl-teal/20 border border-sl-teal text-sl-teal' : 'bg-sl-bg border border-sl-border text-sl-text-mid hover:border-sl-teal'
                    }`}>
                    <span className="text-xs">D{d.day}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8 bg-sl-bg p-4 border border-dashed border-sl-border-strong">
              <h3 className="font-rajdhani font-bold text-white tracking-[2px] mb-2 uppercase">
                {savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.find(d => d.day === selectedDay)?.type}
              </h3>
              <div className="space-y-1">
                {savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.find(d => d.day === selectedDay)?.exercises?.map((ex, i) => (
                  <div key={i} className="flex justify-between text-xs font-share">
                    <span className="text-sl-text-dim truncate pr-2">{ex.name}</span>
                    <span className="text-sl-teal shrink-0">{ex.sets}×{ex.reps}</span>
                  </div>
                )) || <p className="text-xs text-sl-text-dim font-share tracking-widest">Rest Day Protocol.</p>}
              </div>
            </div>
            <div className="mb-6">
              <label className="text-xs font-share text-sl-text-dim tracking-widest mb-2 block">OVERRIDE DATE (OPTIONAL)</label>
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share text-sm outline-none focus:border-sl-blue" />
            </div>
            <button onClick={initiatePlanRaid}
              disabled={!savedPlan.weeks.find(w => w.weekNumber === selectedWeek)?.days.find(d => d.day === selectedDay)?.exercises?.length}
              className="w-full bg-sl-blue/10 border border-sl-blue text-sl-blue font-share tracking-[4px] font-bold py-4 hover:bg-sl-blue hover:text-sl-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              INITIATE RAID
            </button>
          </div>
        ) : (
          <div className="bg-sl-surface border border-dashed border-sl-border-strong p-8 mt-8 space-y-6">
            <p className="text-sl-text-mid font-share tracking-widest text-center">NO ACTIVE DIRECTIVE</p>
            <div>
              <label className="text-xs font-share text-sl-text-dim tracking-widest mb-2 block">OVERRIDE DATE (OPTIONAL)</label>
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share text-sm outline-none focus:border-sl-blue" />
            </div>
            <button onClick={() => startWorkout('FREE RAID', [], customDate || undefined)}
              className="w-full bg-sl-blue/10 border border-sl-blue text-sl-blue py-4 font-share tracking-[3px] text-lg hover:bg-sl-blue hover:text-sl-bg transition-colors shadow-[0_0_20px_rgba(74,158,255,0.2)]">
              INITIALIZE EMPTY RAID
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      {/* Rest Timer Badge */}
      {restSeconds !== null && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-sl-surface border border-sl-teal px-6 py-3 flex items-center gap-4 shadow-[0_0_20px_rgba(0,255,163,0.3)]">
          <span className="font-share text-[10px] text-sl-teal tracking-widest">REST TIMER</span>
          <span className="font-rajdhani text-2xl font-bold text-white">{restSeconds}s</span>
          <button onClick={() => { setRestSeconds(null); if (restInterval.current) clearInterval(restInterval.current); }}
            className="text-sl-text-dim text-xs font-share hover:text-white tracking-widest">SKIP</button>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-sl-surface border border-sl-border p-6 w-full max-w-sm">
            <h3 className="font-rajdhani text-white text-xl tracking-widest mb-4">ADD EXERCISE</h3>
            <div className="relative mb-4">
              <input autoFocus type="text" value={newExName} onChange={e => setNewExName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddExercise()}
                className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue"
                placeholder="e.g. Bench Press" />
              {newExName.length > 1 && (
                <div className="absolute top-full left-0 right-0 bg-sl-surface border border-sl-border mt-1 max-h-40 overflow-y-auto z-10 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                  {EXERCISE_DATABASE.filter(ex => ex.name.toLowerCase().includes(newExName.toLowerCase())).slice(0, 5).map((ex, i) => (
                    <div key={i} onClick={() => setNewExName(ex.name)} className="p-3 border-b border-sl-border/50 text-white font-share text-xs hover:bg-sl-blue/20 cursor-pointer">
                      {ex.name} <span className="text-sl-text-dim ml-2">({ex.category})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowAddExercise(false); setNewExName(''); }}
                className="flex-1 border border-sl-border text-sl-text-dim py-2 font-share text-xs tracking-widest hover:text-white">CANCEL</button>
              <button onClick={handleAddExercise}
                className="flex-[2] bg-sl-blue/10 border border-sl-blue text-sl-blue py-2 font-share text-xs tracking-widest hover:bg-sl-blue hover:text-white">ADD</button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Confirmation */}
      {showAbandon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-sl-surface border border-red-500/50 p-6 w-full max-w-sm">
            <h3 className="font-rajdhani text-red-500 text-xl tracking-widest mb-2">ABANDON RAID?</h3>
            <p className="font-share text-sl-text-dim text-xs tracking-widest mb-6">Progress will be lost. This session will NOT be saved to your raid log.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowAbandon(false)}
                className="flex-1 border border-sl-border text-sl-text-dim py-3 font-share text-xs tracking-widest">CONTINUE RAID</button>
              <button onClick={() => { abandonWorkout(); setShowAbandon(false); }}
                className="flex-[2] bg-red-500/10 border border-red-500 text-red-500 py-3 font-share text-xs tracking-widest hover:bg-red-500/20">ABANDON</button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        <LevelUpVFX isVisible={showClear} />
        {showClear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sl-bg/95 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring" }} className="mb-8">
              <h1 className="text-5xl font-rajdhani font-bold text-transparent bg-clip-text bg-gradient-to-r from-sl-blue to-white tracking-[8px] text-center filter drop-shadow-[0_0_10px_rgba(74,158,255,0.8)]">
                DUNGEON<br/>CLEARED
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="font-share text-sl-blue tracking-[5px]">
              +{Math.max(50, exercises.filter(ex => ex.sets.some(s => s.completed)).length * 50)} XP EARNED
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-end mt-6 mb-6">
        <div>
          <div className="header-badge mb-1">ACTIVE RAID</div>
          <h1 className="text-2xl font-bold text-white tracking-[2px] uppercase font-rajdhani">{activeWorkout}</h1>
        </div>
        <div className="text-right">
          <span className="font-share text-sl-text-dim tracking-widest text-[10px] block mb-1">ELAPSED TIME</span>
          <span className="font-rajdhani text-xl text-sl-teal font-bold">{durationStr}</span>
        </div>
      </div>

      {exercises.map((exercise, index) => (
        <div key={exercise.id}>
          <div className="section-title">
            <span className="num">{(index + 1).toString().padStart(2, '0')}</span>
            <div className="flex flex-col">
              <h2>{exercise.name}</h2>
              <span className="font-share text-[10px] text-sl-blue tracking-widest mt-1 uppercase">{getLastPerformance(exercise.name)}</span>
            </div>
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
                <span className={`font-share w-8 text-sm ${set.completed ? 'text-sl-text-dim' : 'text-sl-blue'}`}>{setIndex + 1}</span>
                {set.completed ? (
                  <>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.weight}</span>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.reps}</span>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.rpe}</span>
                    <button onClick={() => updateSet(exercise.id, set.id, { completed: false })} className="w-8 text-center text-sl-teal">✓</button>
                  </>
                ) : (
                  <>
                    <input type="number"
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none text-sm placeholder:text-sl-text-dim/50"
                      placeholder="0" value={set.weight || ''}
                      onChange={(e) => updateSet(exercise.id, set.id, { weight: Number(e.target.value) })} />
                    <input type="text"
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none text-sm placeholder:text-sl-text-dim/50"
                      placeholder={String(set.reps)} value={set.reps}
                      onChange={(e) => updateSet(exercise.id, set.id, { reps: e.target.value })} />
                    <input type="number"
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none text-sm placeholder:text-sl-text-dim/50"
                      placeholder="8" value={set.rpe || ''}
                      onChange={(e) => updateSet(exercise.id, set.id, { rpe: Number(e.target.value) })} />
                      <button
                        onClick={() => { updateSet(exercise.id, set.id, { completed: true }); startRestTimer(90); }}
                        className="w-8 h-8 border border-sl-blue bg-sl-blue/10 flex items-center justify-center text-sl-blue text-xs hover:bg-sl-blue hover:text-sl-bg transition-colors">✓</button>
                      <button onClick={() => deleteSet(exercise.id, set.id)} className="text-sl-text-dim hover:text-red-500 transition-colors ml-1">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
            ))}
            <button onClick={() => {
              addSet(exercise.id, { id: crypto.randomUUID().slice(0, 8), reps: '', weight: 0, rpe: 8, completed: false });
            }} className="w-full mt-4 border border-dashed border-sl-border text-sl-text-dim py-2 font-share text-xs tracking-widest hover:text-white hover:border-sl-text-dim transition-colors">
              + ADD SET
            </button>
          </div>
        </div>
      ))}

      <button onClick={() => setShowAddExercise(true)}
        className="w-full bg-sl-surface border border-dashed border-sl-border-strong text-sl-text-dim py-4 hover:border-sl-blue hover:text-sl-blue transition-colors font-share tracking-widest mt-4">
        + ADD EXERCISE
      </button>

      <div className="flex gap-4 mt-8">
        <button onClick={() => setShowAbandon(true)}
          className="flex-1 bg-red-500/10 border border-red-500/50 text-red-500 font-bold py-4 tracking-widest hover:bg-red-500/20 transition-colors font-share">
          ABANDON
        </button>
        <button onClick={handleFinishWorkout}
          className="flex-[2] bg-sl-blue border border-sl-blue text-sl-bg font-bold py-4 tracking-widest hover:bg-white hover:border-white transition-colors font-share shadow-[0_0_20px_rgba(74,158,255,0.3)]">
          FINISH RAID
        </button>
      </div>
    </div>
  );
};

export default Workout;
