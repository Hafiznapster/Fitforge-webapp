import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDietStore } from '../store/dietStore';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const navigate = useNavigate();
  const diet = useDietStore();
  
  const [cals, setCals] = useState(diet.targetCalories.toString());
  const [pro, setPro] = useState(diet.targetProtein.toString());
  const [carbs, setCarbs] = useState(diet.targetCarbs.toString());
  const [fat, setFat] = useState(diet.targetFat.toString());
  const [showToast, setShowToast] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCalories = Number(cals) || 2000;
    useDietStore.setState({
      targetCalories: newCalories,
      targetProtein: Number(pro) || 150,
      targetCarbs: Number(carbs) || 200,
      targetFat: Number(fat) || 60
    });
    
    // Sync to Supabase
    try {
      const isGuest = localStorage.getItem('fitforge_guest') === 'true';
      if (!isGuest) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await supabase.from('profiles').update({
            target_calories: newCalories
          }).eq('id', session.user.id);
        }
      } else {
        const stored = localStorage.getItem('fitforge_guest_profile');
        if (stored) {
          const profile = JSON.parse(stored);
          profile.target_calories = newCalories;
          localStorage.setItem('fitforge_guest_profile', JSON.stringify(profile));
        }
      }
    } catch (err) {
      console.error("Failed to sync targets:", err);
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 bg-sl-surface border border-sl-blue text-sl-blue px-6 py-3 font-share tracking-[3px] text-xs shadow-[0_0_20px_rgba(74,158,255,0.3)] backdrop-blur-md z-50 whitespace-nowrap"
          >
            MACRO TARGETS SYNCHRONIZED
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => navigate(-1)} className="text-sl-text-dim hover:text-white mb-6 flex items-center gap-2">
        <ArrowLeft size={16} /> <span className="font-share text-xs tracking-widest">BACK</span>
      </button>

      <div className="header-badge mt-2">CONFIG SYS</div>
      <h1 className="text-3xl font-bold text-white tracking-[4px] mb-8">SETTINGS</h1>

      <div className="section-title">
        <span className="num">001</span><h2>Macro Targets</h2><div className="line"></div>
      </div>

      <form onSubmit={handleSave} className="bg-sl-surface border border-sl-border p-4 mb-8">
        <div className="mb-4">
          <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-2">DAILY CALORIES</label>
          <input 
            type="number" 
            value={cals} 
            onChange={e => setCals(e.target.value)}
            className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div>
            <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-2">PROTEIN (g)</label>
            <input type="number" value={pro} onChange={e => setPro(e.target.value)} className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share text-center outline-none focus:border-sl-blue" />
          </div>
          <div>
            <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-2">CARBS (g)</label>
            <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share text-center outline-none focus:border-sl-gold" />
          </div>
          <div>
            <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-2">FAT (g)</label>
            <input type="number" value={fat} onChange={e => setFat(e.target.value)} className="w-full bg-sl-bg border border-sl-border text-white p-3 font-share text-center outline-none focus:border-sl-red" />
          </div>
        </div>
        <button type="submit" className="w-full border border-sl-blue bg-sl-blue/10 text-sl-blue py-3 hover:bg-sl-blue/20 transition-colors font-share tracking-[3px] text-sm">
          SAVE TARGETS
        </button>
      </form>

      {/* Removed fake Notifications section */}
    </div>
  );
};

export default Settings;
