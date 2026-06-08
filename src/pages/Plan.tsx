import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useDietStore } from '../store/dietStore';
import { generateWorkoutPlan } from '../services/aiService';
import type { GeneratedPlan } from '../services/aiService';
import { motion } from 'framer-motion';

const Plan = () => {
  const { rank, fitnessScore, fatigueScore, savePlan } = useUserStore();
  const { bodyweightHistory } = useDietStore();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const currentWeight = bodyweightHistory.length > 0 ? bodyweightHistory[bodyweightHistory.length - 1].weight : undefined;
      const result = await generateWorkoutPlan({ fitnessScore, fatigueScore, rank }, currentWeight);
      setPlan(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto p-4 relative">
      <div className="header-badge mt-6">COMMAND CENTER</div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-[2px]">
            ACTIVE DIRECTIVE
          </h1>
          <p className="font-share text-[12px] text-sl-text-dim tracking-[2px]">
            4-WEEK TRAINING BLOCK
          </p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-3 py-2 font-share tracking-widest text-xs hover:bg-sl-blue/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'GENERATING...' : 'GENERATE PLAN'}
        </button>
      </div>

      {error && (
        <div className="bg-sl-red/10 border-l-2 border-l-sl-red border border-sl-border p-4 mb-6">
          <p className="text-sm text-sl-red">{error}</p>
        </div>
      )}

      {plan ? (
        <div className="space-y-10">
          {plan.weeks.map((week, wIdx) => (
            <motion.div 
              key={week.weekNumber} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wIdx * 0.1 }}
              className="bg-sl-surface border border-sl-border p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              {/* Decorative side border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-sl-blue/50" />
              
              <div className="flex items-center justify-between border-b border-sl-border/50 pb-4 mb-6">
                <h3 className="font-rajdhani text-2xl font-bold text-white uppercase tracking-[4px]">
                  WEEK {week.weekNumber}
                </h3>
              </div>
              
              <div className="space-y-4">
                {week.days.map((day, dIdx) => (
                  <motion.div 
                    key={day.day} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (wIdx * 0.1) + (dIdx * 0.05) }}
                    className="flex flex-col sm:flex-row gap-4 bg-sl-bg/50 border border-sl-border/30 p-4 hover:border-sl-blue/50 transition-colors group"
                  >
                    <div className="w-16 flex-shrink-0 flex items-start pt-1">
                      <div className="w-12 h-12 bg-sl-blue/10 border border-sl-blue flex items-center justify-center font-rajdhani text-xl font-bold text-sl-blue group-hover:bg-sl-blue group-hover:text-sl-bg transition-colors shadow-[0_0_10px_rgba(74,158,255,0.2)]">
                        D{day.day}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-lg font-rajdhani font-bold tracking-[4px] uppercase mb-3 ${day.type?.includes('Recovery') ? 'text-sl-teal' : 'text-white'}`}>
                        {day.type}
                      </p>
                      
                      {day.exercises?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {day.exercises.map((ex, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-sl-border/20 last:border-0 hover:bg-sl-surface/50 px-2 -mx-2 transition-colors">
                              <span className="text-[13px] font-share text-sl-text-mid uppercase tracking-wide">{ex.name}</span>
                              <span className="text-[13px] font-share text-sl-blue tracking-widest bg-sl-blue/10 border border-sl-blue/20 px-2 py-0.5">{ex.sets}x{ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sl-text-dim font-share text-sm tracking-widest py-2 border border-dashed border-sl-border/50 text-center bg-sl-surface/20">
                          REST & RECOVER
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          
          <div className="pt-4 pb-8 flex justify-center">
            <button 
              onClick={() => {
                savePlan(plan);
                navigate('/active-plan');
              }}
              className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-8 py-4 font-share tracking-[4px] font-bold text-sm hover:bg-sl-blue hover:text-sl-bg transition-colors shadow-[0_0_20px_rgba(74,158,255,0.2)]"
            >
              SAVE DIRECTIVE
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-sl-surface border border-dashed border-sl-border-strong p-8 text-center mt-8">
          <p className="text-sl-text-mid font-share tracking-widest mb-4">NO ACTIVE DIRECTIVE</p>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-6 py-3 font-share tracking-widest text-xs hover:bg-sl-blue/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'ANALYZING METRICS...' : 'INITIALIZE GENERATION'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Plan;
