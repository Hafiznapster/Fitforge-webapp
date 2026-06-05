import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDietStore } from '../store/dietStore';

const Settings = () => {
  const navigate = useNavigate();
  const diet = useDietStore();
  
  const [cals, setCals] = useState(diet.targetCalories.toString());
  const [pro, setPro] = useState(diet.targetProtein.toString());
  const [carbs, setCarbs] = useState(diet.targetCarbs.toString());
  const [fat, setFat] = useState(diet.targetFat.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    useDietStore.setState({
      targetCalories: Number(cals) || 2000,
      targetProtein: Number(pro) || 150,
      targetCarbs: Number(carbs) || 200,
      targetFat: Number(fat) || 60
    });
    alert("SYSTEM UPDATED: Macro targets saved successfully.");
  };

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
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

      <div className="section-title">
        <span className="num">002</span><h2>Notifications</h2><div className="line"></div>
      </div>
      <div className="bg-sl-surface border border-sl-border p-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-rajdhani tracking-widest text-lg mb-1">SYSTEM ALERTS</h3>
          <p className="text-sl-text-dim font-share text-xs">Allow push notifications for daily quests and reports</p>
        </div>
        <div className="w-12 h-6 rounded-full bg-sl-blue/20 border border-sl-blue relative cursor-pointer">
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-sl-blue rounded-full shadow-[0_0_10px_rgba(74,158,255,0.8)]"></div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
