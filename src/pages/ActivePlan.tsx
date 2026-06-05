import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ActivePlan = () => {
  const { savedPlan, savePlan } = useUserStore();
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(1);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to abandon this directive? All progress will be lost.')) {
      savePlan(null);
    }
  };

  const currentWeekData = savedPlan?.weeks.find(w => w.weekNumber === selectedWeek);

  return (
    <div className="max-w-md mx-auto p-4 pb-24 relative min-h-screen">
      <div className="header-badge mt-6">ACTIVE DIRECTIVE</div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-[4px] uppercase font-rajdhani">
            MY PLAN
          </h1>
          <p className="font-share text-[11px] text-sl-text-dim tracking-[3px] mt-1">
            CURRENT TRAINING BLOCK
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => navigate('/plan')}
            className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-3 py-1.5 font-share tracking-widest text-[10px] hover:bg-sl-blue/20 transition-colors"
          >
            GENERATE NEW
          </button>
          {savedPlan && (
            <button 
              onClick={handleDelete}
              className="bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-1.5 font-share tracking-widest text-[10px] hover:bg-red-500/20 transition-colors"
            >
              ABANDON DIRECTIVE
            </button>
          )}
        </div>
      </div>

      {savedPlan ? (
        <div className="flex flex-col h-full">
          {/* Week Selector Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
            {savedPlan.weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`flex-1 min-w-[80px] py-3 text-center font-rajdhani text-sm font-bold tracking-[2px] transition-all duration-300 relative ${
                  selectedWeek === week.weekNumber 
                    ? 'text-sl-blue' 
                    : 'text-sl-text-dim hover:text-white bg-sl-surface border border-sl-border/50'
                }`}
              >
                {selectedWeek === week.weekNumber && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-sl-blue/10 border border-sl-blue z-0 shadow-[0_0_15px_rgba(74,158,255,0.15)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">WEEK {week.weekNumber}</span>
              </button>
            ))}
          </div>

          {/* Days List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedWeek}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentWeekData?.days.map((day, idx) => (
                <motion.div 
                  key={day.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-sl-surface/60 border border-sl-border/40 backdrop-blur-sm p-4 relative group hover:border-sl-blue/40 transition-colors"
                >
                  {/* Decorative corner bracket */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-sl-blue/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-sl-blue/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 bg-sl-bg border border-sl-border flex items-center justify-center font-rajdhani text-lg font-bold text-sl-text-mid group-hover:text-sl-blue transition-colors">
                      D{day.day}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-rajdhani font-bold tracking-[3px] uppercase mb-3 truncate ${day.type?.includes('Recovery') ? 'text-sl-teal' : 'text-white'}`}>
                        {day.type}
                      </h3>
                      
                      {day.exercises?.length > 0 ? (
                        <div className="space-y-2">
                          {day.exercises.map((ex, i) => (
                            <div key={i} className="flex justify-between items-center text-[12px] font-share">
                              <span className="text-sl-text-mid truncate pr-2">{ex.name}</span>
                              <span className="text-sl-blue shrink-0 opacity-80">{ex.sets} x {ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] font-share text-sl-text-dim tracking-widest uppercase mt-2">
                          Rest & Recovery Protocols Active
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-dashed border-sl-border-strong bg-sl-surface/30 p-8">
          <div className="w-16 h-16 rounded-full bg-sl-surface border border-sl-border flex items-center justify-center mb-4 text-2xl text-sl-text-dim">
            ∅
          </div>
          <p className="text-sl-text-mid font-rajdhani text-xl font-bold tracking-[4px] uppercase mb-2">No Active Directive</p>
          <p className="text-sl-text-dim font-share text-xs tracking-widest mb-6">System requires input to generate plan.</p>
          <button 
            onClick={() => navigate('/plan')}
            className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-6 py-3 font-share tracking-[3px] font-bold text-xs hover:bg-sl-blue hover:text-sl-bg transition-colors shadow-[0_0_15px_rgba(74,158,255,0.2)]"
          >
            INITIALIZE NEW PLAN
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivePlan;
