import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useDietStore } from '../store/dietStore';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Calendar as CalendarIcon, Settings as SettingsIcon } from 'lucide-react';

const HunterProfile = () => {
  const { rank, level, xp, xpNeeded, name, playerClass, age, streak } = useUserStore();
  const { workoutHistory } = useWorkoutStore();
  const { waterMl } = useDietStore();
  const navigate = useNavigate();
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));

  // Dynamic Stat Calculations
  let totalVolume = 0;
  workoutHistory.forEach(w => {
    w.exercises.forEach(ex => {
      ex.sets.filter(s => s.completed).forEach(s => {
        const weight = Number(s.weight) || 0;
        const reps = Number(s.reps) || 0; // If it's a string like "8-10", parseInt handles "8". For simplicity, we just use Number.
        if (!isNaN(reps)) totalVolume += weight * reps;
      });
    });
  });

  const calculatedStats = {
    str: 10 + Math.floor(totalVolume / 1000) + (level * 2),
    agi: 10 + (streak * 3) + level,
    vit: 10 + Math.floor(waterMl / 500) + (level * 2),
    int: 10 + workoutHistory.length * 2 + level,
    luk: 10 + Math.floor(Math.random() * 5) + (rank === 'S' ? 20 : rank === 'A' ? 10 : 0)
  };

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
      <div className="header-badge mt-6">STATUS WINDOW</div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-[4px] mb-1">{name.toUpperCase()}</h1>
        <p className="font-share text-sl-blue tracking-[2px] text-sm">
          {playerClass.toUpperCase()} | AGE: {age}
        </p>
      </div>

      <div className="flex flex-col items-center mt-8 mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sl-blue-glow rounded-full blur-2xl"></div>
        <div className="w-24 h-24 rounded border border-sl-border bg-sl-surface flex flex-col items-center justify-center relative z-10 shadow-[0_0_20px_rgba(74,158,255,0.1)]">
          <span className="text-4xl font-bold font-rajdhani text-white">{rank}</span>
          <span className="text-[10px] font-share text-sl-blue tracking-widest mt-1">CLASS</span>
        </div>
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

      <div className="mb-8">
        <button 
          onClick={useUserStore.getState().toggleTheme}
          className={`w-full py-3 border font-share text-xs tracking-[3px] transition-colors ${rank === 'S' || true ? 'border-sl-blue text-sl-blue hover:bg-sl-blue/10' : 'border-sl-border text-sl-text-dim opacity-50 cursor-not-allowed'}`}
        >
          TOGGLE S-RANK THEME
        </button>
      </div>

      <div className="section-title">
        <span className="num">001</span><h2>Base Stats</h2><div className="line"></div>
      </div>

      <div className="bg-sl-surface border border-sl-border p-4">
        {[
          { label: 'STR (Power/Vol)', value: calculatedStats.str },
          { label: 'AGI (Consistency)', value: calculatedStats.agi },
          { label: 'VIT (Recovery)', value: calculatedStats.vit },
          { label: 'INT (System Mastery)', value: calculatedStats.int },
          { label: 'LUK (RNG)', value: calculatedStats.luk },
        ].map((stat, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-sl-border last:border-0">
            <span className="font-share text-sl-text-mid tracking-widest text-sm">{stat.label}</span>
            <span className="font-rajdhani text-lg font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HunterProfile;
