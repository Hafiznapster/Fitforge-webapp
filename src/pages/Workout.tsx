import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

const Workout = () => {
  const { activeWorkout, exercises, updateSet } = useWorkoutStore();
  const gainXp = useUserStore(state => state.gainXp);
  const [showClear, setShowClear] = useState(false);
  const navigate = useNavigate();

  const handleFinishWorkout = () => {
    setShowClear(true);
    gainXp(350); // Generous XP for completing a raid
    setTimeout(() => {
      navigate('/');
    }, 2500);
  };

  return (
    <div className="max-w-md mx-auto p-4">
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
      
      <h1 className="text-2xl font-bold text-white tracking-[2px] mb-6 uppercase">
        {activeWorkout || 'WORKOUT'}
      </h1>

      {exercises.map((exercise, index) => (
        <div key={exercise.id}>
          <div className="section-title">
            <span className="num">{(index + 1).toString().padStart(2, '0')}</span>
            <h2>{exercise.name}</h2>
            <div className="line"></div>
          </div>

          <div className="bg-sl-surface border border-sl-border p-4 mb-6">
            <div className="flex justify-between items-center border-b border-sl-border pb-2 mb-3">
              <span className="text-xs font-share text-sl-text-dim tracking-widest w-8">SET</span>
              <span className="text-xs font-share text-sl-text-dim tracking-widest text-center w-16">KG</span>
              <span className="text-xs font-share text-sl-text-dim tracking-widest text-center w-16">REPS</span>
              <span className="text-xs font-share text-sl-text-dim tracking-widest text-center w-16">RPE</span>
              <span className="w-8"></span>
            </div>

            {exercise.sets.map((set, setIndex) => (
              <div key={set.id} className="flex justify-between items-center py-2 mt-1">
                <span className={`font-share w-8 ${set.completed ? 'text-sl-text-dim' : 'text-sl-blue'}`}>
                  {setIndex + 1}
                </span>
                
                {set.completed ? (
                  <>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.weight}</span>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.reps}</span>
                    <span className="text-center w-16 font-share text-sl-text-dim">{set.rpe}</span>
                    <button className="w-8 text-center text-sl-teal">✓</button>
                  </>
                ) : (
                  <>
                    <input 
                      type="number" 
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none" 
                      defaultValue={set.weight} 
                      onChange={(e) => updateSet(exercise.id, set.id, { weight: Number(e.target.value) })}
                    />
                    <input 
                      type="number" 
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none" 
                      defaultValue={set.reps} 
                      onChange={(e) => updateSet(exercise.id, set.id, { reps: Number(e.target.value) })}
                    />
                    <input 
                      type="number" 
                      className="w-16 bg-sl-bg border border-sl-border text-center text-white py-1 font-share focus:border-sl-blue outline-none" 
                      defaultValue={set.rpe} 
                      onChange={(e) => updateSet(exercise.id, set.id, { rpe: Number(e.target.value) })}
                    />
                    <button 
                      onClick={() => updateSet(exercise.id, set.id, { completed: true })}
                      className="w-8 h-8 border border-sl-blue bg-sl-blue/10 flex items-center justify-center text-sl-blue text-xs hover:bg-sl-blue/20"
                    >
                      ✓
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <button className="w-full bg-sl-surface border border-dashed border-sl-border-strong text-sl-text-dim py-4 hover:border-sl-blue hover:text-sl-blue transition-colors font-share tracking-widest">
        + ADD EXERCISE
      </button>

      <button onClick={handleFinishWorkout} className="w-full mt-8 bg-sl-blue text-sl-bg font-bold py-4 tracking-widest hover:bg-white transition-colors">
        FINISH RAID
      </button>
    </div>
  );
};

export default Workout;
