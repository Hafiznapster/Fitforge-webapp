import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import { generateWeeklyReport } from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useDietStore } from '../store/dietStore';

const Dashboard = () => {
  const { rank, name, playerClass, level, xp, streak, dailyQuests, toggleQuest, gainXp } = useUserStore();
  const { bodyweightHistory } = useDietStore();
  const navigate = useNavigate();
  const [showQuestClear, setShowQuestClear] = useState(false);
  const [reportData, setReportData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const questTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCompleteQuest = (id: string) => {
    const quest = dailyQuests.find(q => q.id === id);
    // Only celebrate when going from incomplete → complete
    if (quest && !quest.completed) {
      gainXp(50);
      setShowQuestClear(true);
      if (questTimerRef.current) clearTimeout(questTimerRef.current);
      questTimerRef.current = setTimeout(() => {
        setShowQuestClear(false);
      }, 2000);
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

  return (
    <div className="max-w-md mx-auto p-4 pb-20 relative">
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
      <div className="header-badge mt-6">SYSTEM STATUS</div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-[4px]">
            {(name || 'Hunter').toUpperCase()}
          </h1>
          <p className="font-share text-[12px] text-sl-text-dim tracking-[2px]">
            RANK: {rank} | CLASS: {(playerClass || 'Fighter').toUpperCase()}
          </p>
        </div>
        <div className="w-12 h-12 rounded bg-sl-surface border border-sl-border flex items-center justify-center">
          <span className="font-rajdhani text-2xl font-bold text-sl-blue">{rank}</span>
        </div>
      </div>

      <div className="section-title">
        <span className="num">001</span><h2>Daily Quests</h2><div className="line"></div>
      </div>
      
      <div className="space-y-3 mb-8">
        {dailyQuests.map((quest) => (
          <div key={quest.id} className="bg-sl-surface border border-sl-border p-4 flex items-center justify-between cursor-pointer hover:bg-sl-surface2 transition-colors" onClick={() => handleCompleteQuest(quest.id)}>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 border flex items-center justify-center ${quest.completed ? 'border-sl-blue bg-sl-blue/20' : 'border-sl-text-dim'}`}>
                {quest.completed && <div className="w-2 h-2 bg-sl-blue"></div>}
              </div>
              <span className={`font-share text-sm ${quest.completed ? 'text-sl-text-dim line-through' : 'text-white'}`}>{quest.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span className="num">002</span><h2>Actions</h2><div className="line"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/workout')} className="bg-sl-blue/10 border border-sl-blue text-sl-blue py-6 font-share tracking-[3px] text-sm hover:bg-sl-blue/20 transition-colors shadow-[0_0_15px_rgba(43,92,230,0.2)]">
          ENTER GATE
        </button>
        <button onClick={handleSimulateWeekly} className="bg-sl-purple/10 border border-sl-purple text-sl-purple py-6 font-share tracking-[3px] text-sm hover:bg-sl-purple/20 transition-colors">
          WEEKLY REPORT
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
