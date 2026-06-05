import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useDietStore } from '../store/dietStore';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAwakening, setShowAwakening] = useState(false);
  
  // Form State
  const [hunterName, setHunterName] = useState('');
  const [playerClass, setPlayerClass] = useState('Fighter');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('Muscle Building');
  const [frequency, setFrequency] = useState('4x a week');
  const [intensity, setIntensity] = useState('Heavy');
  const [supplements, setSupplements] = useState('');
  const [currentPlan, setCurrentPlan] = useState('');

  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const isGuest = localStorage.getItem('fitforge_guest') === 'true';
      let userId = 'guest';
      
      if (!isGuest) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        userId = user.id;
      }

      const w = Number(weight) || 75;
      const h = Number(height) || 180;
      const bmi = Number((w / ((h / 100) * (h / 100))).toFixed(1));
      
      // Basic BMR / TDEE estimation
      let cals = 2500;
      if (goal === 'Muscle Building') cals = 2800;
      if (goal === 'Fat Loss') cals = 2000;

      const profileData = {
        hunter_name: hunterName || 'Hunter',
        player_class: playerClass,
        weight_kg: w,
        height_cm: h,
        bmi: bmi,
        target_calories: cals,
        supplements: supplements.split(',').map(s => s.trim()).filter(s => s),
        fitness_goal: goal,
        workout_frequency: frequency,
        workout_intensity: intensity,
        current_plan: currentPlan
      };

      if (!isGuest) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);
        if (error) throw error;
      } else {
        localStorage.setItem('fitforge_guest_profile', JSON.stringify(profileData));
      }

      // Also update local diet store targets
      useDietStore.setState({
        targetCalories: cals,
        targetProtein: Math.round(w * 2.2), // 2.2g per kg
        targetCarbs: Math.round((cals * 0.4) / 4),
        targetFat: Math.round((cals * 0.25) / 9)
      });
      useDietStore.getState().setInitialWeight(w);

      // Trigger Awakening Animation
      setShowAwakening(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (e: any) {
      console.error(e);
      alert(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sl-bg p-4 flex flex-col justify-center">
      <div className="header-badge mb-8">SYSTEM INITIALIZATION</div>
      
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-rajdhani text-white font-bold tracking-[4px] mb-6">HUNTER IDENTITY</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">HUNTER ALIAS</label>
                <input type="text" value={hunterName} onChange={(e) => setHunterName(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue" placeholder="Sung Jin-Woo" />
              </div>
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">CHOOSE CLASS</label>
                <select value={playerClass} onChange={(e) => setPlayerClass(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue appearance-none">
                  <option>Fighter</option>
                  <option>Assassin</option>
                  <option>Tank</option>
                  <option>Mage</option>
                </select>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full mt-8 bg-sl-blue/10 border border-sl-blue text-sl-blue py-3 font-share tracking-[3px] hover:bg-sl-blue/20">NEXT: METRICS</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-rajdhani text-white font-bold tracking-[4px] mb-6">PHYSICAL METRICS</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">WEIGHT (KG)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue" />
              </div>
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">HEIGHT (CM)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue" />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="w-1/3 border border-sl-border text-sl-text-dim py-3 font-share tracking-[3px]">BACK</button>
              <button onClick={() => setStep(3)} className="w-2/3 bg-sl-blue/10 border border-sl-blue text-sl-blue py-3 font-share tracking-[3px]">NEXT: GOALS</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-rajdhani text-white font-bold tracking-[4px] mb-6">COMBAT OBJECTIVES</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">PRIMARY GOAL</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue appearance-none">
                  <option>Muscle Building</option>
                  <option>Fat Loss</option>
                  <option>Maintenance & Strength</option>
                </select>
              </div>
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">RAID FREQUENCY</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue appearance-none">
                  <option>3x a week</option>
                  <option>4x a week</option>
                  <option>5x a week</option>
                  <option>6x a week</option>
                </select>
              </div>
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">INTENSITY PREFERENCE</label>
                <select value={intensity} onChange={(e) => setIntensity(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue appearance-none">
                  <option>Heavy (Low Reps, Max Strength)</option>
                  <option>Moderate (Hypertrophy)</option>
                  <option>Light (High Reps, Endurance)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(2)} className="w-1/3 border border-sl-border text-sl-text-dim py-3 font-share tracking-[3px]">BACK</button>
              <button onClick={() => setStep(4)} className="w-2/3 bg-sl-blue/10 border border-sl-blue text-sl-blue py-3 font-share tracking-[3px]">NEXT: ARSENAL</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-rajdhani text-white font-bold tracking-[4px] mb-6">ARSENAL & HISTORY</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">SUPPLEMENTS (COMMA SEPARATED)</label>
                <input type="text" value={supplements} onChange={(e) => setSupplements(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue" placeholder="e.g. Whey Protein, Creatine" />
              </div>
              <div>
                <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">CURRENT WORKOUT PLAN (IF ANY)</label>
                <textarea value={currentPlan} onChange={(e) => setCurrentPlan(e.target.value)} className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue h-24 resize-none" placeholder="e.g. Bro Split, PPL, or None"></textarea>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(3)} className="w-1/3 border border-sl-border text-sl-text-dim py-3 font-share tracking-[3px]" disabled={loading}>BACK</button>
              <button onClick={handleComplete} disabled={loading} className="w-2/3 bg-sl-gold/10 border border-sl-gold text-sl-gold py-3 font-share tracking-[3px] disabled:opacity-50">
                {loading ? 'SAVING...' : 'AWAKEN SYSTEM'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAwakening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sl-bg/95 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-32 h-32 border-4 border-sl-blue bg-sl-surface rotate-45 flex items-center justify-center relative mb-12 shadow-[0_0_40px_rgba(74,158,255,0.4)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-sl-blue/20 animate-pulse"></div>
              <span className="font-rajdhani text-2xl text-sl-blue font-bold -rotate-45 tracking-widest text-center">AWAKEN</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-rajdhani font-bold text-white tracking-[6px] mb-2 text-center"
            >
              SYSTEM<br/>INITIALIZED
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="font-share text-sl-blue tracking-[4px]"
            >
              WELCOME HUNTER
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
