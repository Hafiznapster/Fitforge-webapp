import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useDietStore } from '../store/dietStore';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Calendar as CalendarIcon, Settings as SettingsIcon, LogOut, Edit3, X, ChevronDown } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const HunterProfile = () => {
  const { rank, level, xp, xpNeeded, name, playerClass, age, streak, updateProfile, stats, statPoints, allocateStat, titles, activeTitle, streakFreezes, buyStreakFreeze, setActiveTitle } = useUserStore();
  const { workoutHistory } = useWorkoutStore();
  const { waterMl } = useDietStore();
  const navigate = useNavigate();
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAge, setEditAge] = useState(age?.toString() || '');
  const [editClass, setEditClass] = useState(playerClass);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Dynamic Stat Calculations
  let totalVolume = 0;
  workoutHistory.forEach(w => {
    w.exercises.forEach(ex => {
      ex.sets.filter(s => s.completed).forEach(s => {
        const weight = Number(s.weight) || 0;
        const reps = Number(s.reps) || 0; 
        if (!isNaN(reps)) totalVolume += weight * reps;
      });
    });
  });

  // Use date-based seed so LUK is stable for the day, not random on each render
  const dailySeed = new Date().getDate() + new Date().getMonth();
  const bonusStats = {
    STR: Math.floor(totalVolume / 1000) + (level * 2),
    AGI: (streak * 3) + level,
    VIT: Math.floor(waterMl / 500) + (level * 2),
    INT: workoutHistory.length * 2 + level,
    LUK: (dailySeed % 5) + (rank === 'S' ? 20 : rank === 'A' ? 10 : rank === 'B' ? 5 : 0)
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear FitForge-specific localStorage keys
    ['fitforge-system-storage', 'fitforge-diet-storage', 'fitforge-workout-storage', 'fitforge_guest', 'fitforge_guest_profile'].forEach(k => localStorage.removeItem(k));
    navigate('/register');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const isGuest = localStorage.getItem('fitforge_guest') === 'true';
      if (!isGuest) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({
            hunter_name: editName,
            player_class: editClass,
          }).eq('id', user.id);
        }
      } else {
        const stored = localStorage.getItem('fitforge_guest_profile');
        if (stored) {
          const profile = JSON.parse(stored);
          profile.hunter_name = editName;
          profile.player_class = editClass;
          localStorage.setItem('fitforge_guest_profile', JSON.stringify(profile));
        }
      }
      updateProfile(editName, Number(editAge) || null, editClass);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setToastMsg("SYSTEM ERROR: FAILED TO SAVE");
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24 overflow-hidden">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 bg-sl-surface border border-red-500 text-red-500 px-6 py-3 font-share tracking-[3px] text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md z-50 whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="header-badge mt-6">STATUS WINDOW</div>
      
      <div className="text-center mb-8 relative">
        <h1 className="text-3xl font-bold text-white tracking-[4px] mb-1">{name.toUpperCase()}</h1>
        <p className="font-share text-sl-gold tracking-[3px] text-xs mb-2">
          {activeTitle ? `"${activeTitle.toUpperCase()}"` : ''}
        </p>
        <p className="font-share text-sl-blue tracking-[2px] text-sm">
          {playerClass.toUpperCase()} | AGE: {age || '?'}
        </p>
      </div>

      <div className="flex flex-col items-center mt-8 mb-10 relative">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl rank-${rank} opacity-20`}
        ></motion.div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
          className={`w-28 h-28 rounded-lg border flex flex-col items-center justify-center relative z-10 rank-${rank}`}
        >
          <span className="text-5xl font-bold font-rajdhani">{rank}</span>
          <span className="text-[10px] font-share tracking-widest mt-1 opacity-80">RANK</span>
        </motion.div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between font-share text-xs tracking-widest mb-2">
          <span className="text-sl-text-dim">LV. {level}</span>
          <span className="text-sl-blue">{xp} / {xpNeeded} XP</span>
        </div>
        <div className="h-1 bg-sl-surface">
          <div className="h-full bg-sl-blue transition-all duration-1000" style={{ width: `${xpPercent}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        <button onClick={() => navigate('/stats')} className="flex flex-col items-center justify-center bg-sl-surface border border-sl-border p-3 hover:border-sl-blue transition-colors group">
          <BarChart2 size={20} className="text-sl-text-dim group-hover:text-sl-blue mb-2" />
          <span className="font-share text-[10px] tracking-widest text-white">STATS</span>
        </button>
        <button onClick={() => navigate('/calendar')} className="flex flex-col items-center justify-center bg-sl-surface border border-sl-border p-3 hover:border-sl-blue transition-colors group">
          <CalendarIcon size={20} className="text-sl-text-dim group-hover:text-sl-blue mb-2" />
          <span className="font-share text-[10px] tracking-widest text-white">HISTORY</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center justify-center bg-sl-surface border border-sl-border p-3 hover:border-sl-blue transition-colors group">
          <SettingsIcon size={20} className="text-sl-text-dim group-hover:text-sl-blue mb-2" />
          <span className="font-share text-[10px] tracking-widest text-white">CONFIG</span>
        </button>
      </div>

      <div className="section-title flex justify-between items-end">
        <div>
          <span className="num">001</span><h2>Attributes</h2>
        </div>
        {statPoints > 0 && (
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="font-share text-xs tracking-widest text-sl-gold border border-sl-gold px-2 py-1 mb-1">
            {statPoints} POINTS AVAILABLE
          </motion.div>
        )}
      </div>

      <div className="bg-sl-surface border border-sl-border p-4 mb-8">
        {[
          { key: 'STR', label: 'STR (Power)', base: stats?.STR ?? 10, bonus: bonusStats.STR },
          { key: 'AGI', label: 'AGI (Consistency)', base: stats?.AGI ?? 10, bonus: bonusStats.AGI },
          { key: 'VIT', label: 'VIT (Recovery)', base: stats?.VIT ?? 10, bonus: bonusStats.VIT },
          { key: 'INT', label: 'INT (Mastery)', base: stats?.INT ?? 10, bonus: bonusStats.INT },
          { key: 'LUK', label: 'LUK (RNG)', base: 10, bonus: bonusStats.LUK }, // LUK cannot be allocated
        ].map((stat, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-sl-border/50 last:border-0 group">
            <div className="flex flex-col">
              <span className="font-share text-sl-text-mid tracking-widest text-xs uppercase">{stat.label}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-rajdhani text-xl font-bold text-white">{stat.base + stat.bonus}</span>
                <span className="font-share text-[10px] text-sl-blue tracking-widest">(BASE: {stat.base} + {stat.bonus})</span>
              </div>
            </div>
            {statPoints > 0 && stat.key !== 'LUK' && (
              <button 
                onClick={() => allocateStat(stat.key as keyof typeof stats)}
                className="w-8 h-8 flex items-center justify-center border border-sl-gold text-sl-gold hover:bg-sl-gold hover:text-sl-bg transition-colors font-bold pb-1"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="section-title">
        <span className="num">002</span><h2>Inventory & Titles</h2><div className="line"></div>
      </div>
      
      <div className="bg-sl-surface border border-sl-border p-4 mb-8">
        <div className="flex justify-between items-center border-b border-sl-border/50 pb-4 mb-4">
          <div>
            <h3 className="font-rajdhani text-lg font-bold text-white tracking-[2px]">STREAK FREEZE</h3>
            <p className="font-share text-[10px] text-sl-text-dim tracking-widest mt-1">Prevents streak loss on missed days.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-rajdhani text-2xl font-bold text-sl-teal">x{streakFreezes}</span>
            <button 
              onClick={buyStreakFreeze}
              disabled={xp < 500}
              className="px-3 py-1 bg-sl-blue/10 border border-sl-blue text-sl-blue font-share text-[10px] tracking-widest hover:bg-sl-blue hover:text-sl-bg transition-colors disabled:opacity-50 disabled:border-sl-border disabled:text-sl-text-dim disabled:bg-transparent"
            >
              BUY (-500 XP)
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-rajdhani text-lg font-bold text-white tracking-[2px] mb-3">EQUIPPED TITLE</h3>
          <div className="relative">
            <select 
              value={activeTitle || ''} 
              onChange={(e) => setActiveTitle(e.target.value || null)}
              className="w-full bg-sl-bg border border-sl-border text-sl-gold p-3 font-share text-sm outline-none focus:border-sl-gold appearance-none"
            >
              <option value="">No Title</option>
              {titles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-sl-text-dim pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="section-title">
        <span className="num">003</span><h2>System Commands</h2><div className="line"></div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-sl-border text-white bg-sl-surface hover:border-sl-blue transition-colors font-share tracking-[3px] text-xs"
        >
          <Edit3 size={14} /> EDIT PROFILE
        </button>

        <button 
          onClick={useUserStore.getState().toggleTheme}
          className={`w-full flex items-center justify-center gap-2 py-3 border font-share text-xs tracking-[3px] transition-colors border-sl-blue text-sl-blue bg-sl-blue/10 hover:bg-sl-blue/20`}>
          TOGGLE S-RANK THEME
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/50 text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors font-share tracking-[3px] text-xs mt-4"
        >
          <LogOut size={14} /> LOGOUT
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-sl-surface border border-sl-border p-6 w-full max-w-sm relative">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-sl-text-dim hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-rajdhani font-bold text-white tracking-[2px] mb-6 border-b border-sl-border pb-2">
              EDIT IDENTITY
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">HUNTER ALIAS</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue" 
                />
              </div>
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">AGE</label>
                <input 
                  type="number" 
                  value={editAge} 
                  onChange={(e) => setEditAge(e.target.value)} 
                  className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue" 
                />
              </div>
              <div>
                <span className="font-share text-[10px] text-sl-text-dim tracking-widest mt-1">CLASS</span>
                <div className="relative">
                  <select 
                    value={editClass} 
                    onChange={(e) => setEditClass(e.target.value)} 
                    className="w-full bg-sl-bg border border-sl-border text-white p-3 pr-10 font-share outline-none focus:border-sl-blue appearance-none"
                  >
                    <option>Fighter</option>
                    <option>Assassin</option>
                    <option>Tank</option>
                    <option>Mage</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-sl-text-dim pointer-events-none" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-sl-blue/10 border border-sl-blue text-sl-blue py-3 font-share tracking-[3px] hover:bg-sl-blue hover:text-white transition-colors"
            >
              {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HunterProfile;
