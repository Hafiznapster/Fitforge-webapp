import { useUserStore } from '../store/userStore';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ActivePlan = () => {
  const { savedPlan } = useUserStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-4 pb-24 relative">
      <div className="header-badge mt-6">ACTIVE DIRECTIVE</div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-[2px]">
            MY PLAN
          </h1>
          <p className="font-share text-[12px] text-sl-text-dim tracking-[2px]">
            CURRENT TRAINING BLOCK
          </p>
        </div>
        <button 
          onClick={() => navigate('/plan')}
          className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-3 py-2 font-share tracking-widest text-xs hover:bg-sl-blue/20 transition-colors"
        >
          GENERATE NEW
        </button>
      </div>

      {savedPlan ? (
        <div className="space-y-10">
          {savedPlan.weeks.map((week, wIdx) => (
            <motion.div 
              key={week.weekNumber} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wIdx * 0.1 }}
              className="bg-sl-surface border border-sl-border p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
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
        </div>
      ) : (
        <div className="bg-sl-surface border border-dashed border-sl-border-strong p-8 text-center mt-8">
          <p className="text-sl-text-mid font-share tracking-widest mb-4">NO ACTIVE DIRECTIVE FOUND</p>
          <button 
            onClick={() => navigate('/plan')}
            className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-6 py-3 font-share tracking-widest text-xs hover:bg-sl-blue/20 transition-colors"
          >
            GENERATE NEW PLAN
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivePlan;
