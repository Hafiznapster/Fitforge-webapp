import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import { generateWeeklyReport } from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Dashboard = () => {
  const { rank, name, playerClass, level, xp, streak, dailyQuests, toggleQuest } = useUserStore();
  const navigate = useNavigate();
  const [showQuestClear, setShowQuestClear] = useState(false);

  const handleCompleteQuest = (id: string) => {
    toggleQuest(id);
    setShowQuestClear(true);
    setTimeout(() => {
      setShowQuestClear(false);
    }, 2000);
  };

  const handleSimulateWeekly = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        try {
          const report = await generateWeeklyReport({ rank, level, xp, streak });
          new Notification('SYSTEM ALERT', {
            body: report,
            icon: '/icon-192.png'
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Please enable notifications to receive the Shadow Coach report.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-20 relative">
      <AnimatePresence>
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
            {name.toUpperCase()}
          </h1>
          <p className="font-share text-[12px] text-sl-text-dim tracking-[2px]">
            RANK: {rank} | CLASS: {playerClass.toUpperCase()}
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
