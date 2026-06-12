import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import { generateWeeklyReport } from '../services/aiService';
import { useState, useRef, useEffect } from 'react';
import { useDietStore } from '../store/dietStore';
import { Check } from 'lucide-react';
import LevelUpVFX from '../components/LevelUpVFX';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { rank, name, playerClass, level, xp, streak, dailyQuests, toggleQuest, gainXp } = useUserStore();
  const navigate = useNavigate();
  const { bodyweightHistory } = useDietStore();
  const [showQuestClear, setShowQuestClear] = useState(false);
  const [showLevelUpVFX, setShowLevelUpVFX] = useState(false);
  const [reportData, setReportData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const questTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLevel = useRef(level);

  useEffect(() => {
    if (level > prevLevel.current) {
      setShowLevelUpVFX(true);
      setTimeout(() => setShowLevelUpVFX(false), 2000);
      prevLevel.current = level;
    }
  }, [level]);

  const handleCompleteQuest = (id: string) => {
    const quest = dailyQuests.find(q => q.id === id);
    if (!quest) return;

    if (!quest.completed) {
      gainXp(50);
      setShowQuestClear(true);
      if (questTimerRef.current) clearTimeout(questTimerRef.current);
      questTimerRef.current = setTimeout(() => {
        setShowQuestClear(false);
      }, 2000);
    } else {
      gainXp(-50);
    }
    
    toggleQuest(id);
  };

  const handleSimulateWeekly = async () => {
    setIsGenerating(true);
    try {
      const report = await generateWeeklyReport({ rank, level, xp, streak }, bodyweightHistory);
      setReportData(report);
    } catch (e) {
      setReportData("ERROR: FAILED TO CONNECT TO SHADOW COACH SERVER. CHECK API KEY.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <div className="max-w-md mx-auto p-4 pb-28 relative">
      <LevelUpVFX isVisible={showLevelUpVFX} />
      <AnimatePresence>
        {(isGenerating || reportData) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sl-bg/95 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-sl-surface border border-sl-blue w-full max-w-sm flex flex-col max-h-[80vh] shadow-[0_0_30px_rgba(74,158,255,0.2)]"
            >
              <div className="border-b border-sl-blue bg-sl-blue/10 p-4">
                <h2 className="font-rajdhani font-bold text-sl-blue tracking-[4px]">SHADOW COACH REPORT</h2>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar font-share text-sm text-white leading-relaxed whitespace-pre-wrap flex-1">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-70">
                    <div className="w-8 h-8 border-2 border-sl-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="tracking-widest text-sl-blue text-xs animate-pulse">ANALYZING WEEKLY DATA...</p>
                  </div>
                ) : (
                  reportData
                )}
              </div>
              <div className="p-4 border-t border-sl-blue/30">
                <button 
                  onClick={() => setReportData(null)}
                  disabled={isGenerating}
                  className="w-full py-3 bg-sl-blue text-sl-bg font-rajdhani font-bold tracking-[2px] disabled:opacity-50"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showQuestClear && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sl-bg/80 backdrop-blur-sm pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-center"
            >
              <h1 className="text-4xl font-rajdhani font-bold text-sl-gold tracking-[6px] drop-shadow-[0_0_15px_rgba(240,192,64,0.6)]">
                QUEST CLEARED
              </h1>
              <p className="font-share text-white tracking-[4px] mt-2">+50 XP</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <div className="flex justify-between items-center mt-6">
            <div className="header-badge">{greeting}</div>
            <div className="flex items-center gap-1 bg-sl-surface border border-sl-border px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,100,0,0.2)]">
              <span className="text-orange-500 text-lg">🔥</span>
              <span className="font-rajdhani font-bold text-white text-lg">{streak}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6 mt-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-[4px] mb-1">
                {(name || 'Hunter').toUpperCase()}
              </h1>
              <p className="font-share text-[12px] text-sl-text-dim tracking-[2px]">
                LEVEL {level} | {(playerClass || 'Fighter').toUpperCase()}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-lg border flex items-center justify-center rank-${rank}`}>
              <span className="font-rajdhani text-3xl font-bold">{rank}</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-8">
            <div className="flex justify-between font-share text-[10px] tracking-widest text-sl-text-dim mb-2">
              <span>EXPERIENCE</span>
              <span>{xp} / {useUserStore.getState().xpNeeded} XP</span>
            </div>
            <div className="h-1 bg-sl-surface rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-sl-blue shadow-[0_0_8px_rgba(74,158,255,0.8)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min((xp / useUserStore.getState().xpNeeded) * 100, 100))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <div className="section-title">
            <span className="num">001</span><h2>Daily Quests</h2><div className="line"></div>
            <div className="font-share text-[10px] text-sl-text-dim tracking-widest">
              {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}
            </div>
          </div>
          
          <div className="space-y-3 mb-8">
            {dailyQuests.map((quest, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                key={quest.id} 
                className="bg-sl-surface border border-sl-border p-4 flex items-center justify-between cursor-pointer hover:bg-sl-surface2 transition-colors group" 
                onClick={() => handleCompleteQuest(quest.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${quest.completed ? 'border-sl-blue bg-sl-blue/20' : 'border-sl-text-dim group-hover:border-sl-blue'}`}>
                    {quest.completed && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={14} className="text-sl-blue" /></motion.div>}
                  </div>
                  <span className={`font-share tracking-wider text-sm transition-colors ${quest.completed ? 'text-sl-text-dim line-through' : 'text-white'}`}>{quest.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
          <div className="section-title">
            <span className="num">002</span><h2>Actions</h2><div className="line"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/workout')} className="feat-workout bg-sl-blue/5 py-6 font-share tracking-[3px] text-sm hover:bg-sl-blue/20 transition-colors flex flex-col items-center gap-2">
              <span>ENTER GATE</span>
            </button>
            <button onClick={handleSimulateWeekly} className="feat-stats bg-sl-purple/5 py-6 font-share tracking-[3px] text-sm hover:bg-sl-purple/20 transition-colors flex flex-col items-center gap-2">
              <span>WEEKLY REPORT</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
