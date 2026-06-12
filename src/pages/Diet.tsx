import { useState, useEffect } from 'react';
import { useDietStore } from '../store/dietStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MacroRing = ({ value, max, label, colorClass }: { value: number, max: number, label: string, colorClass: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="48" cy="48" r={radius} 
            className="stroke-sl-surface fill-transparent" 
            strokeWidth="8"
          />
          <circle 
            cx="48" cy="48" r={radius} 
            className={`fill-transparent transition-all duration-1000 ease-out ${colorClass}`} 
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-share text-[10px] text-sl-text-dim">{label}</span>
          <span className="font-rajdhani text-base text-white font-bold">{Math.round(value)}g</span>
        </div>
      </div>
    </div>
  );
};

const CalorieRing = ({ value, max }: { value: number, max: number }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r={radius} className="stroke-sl-surface fill-transparent" strokeWidth="12" />
          <circle cx="80" cy="80" r={radius} className="fill-transparent stroke-white transition-all duration-1000" strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" filter="drop-shadow(0 0 10px rgba(255,255,255,0.3))" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-rajdhani text-4xl text-white font-bold">{Math.round(value)}</span>
          <span className="font-share text-[10px] text-sl-text-dim tracking-widest">/ {max} KCAL</span>
        </div>
      </div>
    </div>
  );
};

const Diet = () => {
  const diet = useDietStore();
  const [mealName, setMealName] = useState('');
  const [p, setP] = useState('');
  const [c, setC] = useState('');
  const [f, setF] = useState('');
  const [bw, setBw] = useState('');

  useEffect(() => {
    diet.checkDailyReset();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = diet.meals.filter(m => m.date === today);

  const calories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const protein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const carbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  const fat = todayMeals.reduce((sum, meal) => sum + meal.fat, 0);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const proteinVal = Number(p) || 0;
    const carbsVal = Number(c) || 0;
    const fatVal = Number(f) || 0;
    const caloriesVal = (proteinVal * 4) + (carbsVal * 4) + (fatVal * 9);
    
    if (proteinVal || carbsVal || fatVal) {
      diet.addMeal({ name: mealName || 'Meal', protein: proteinVal, carbs: carbsVal, fat: fatVal, calories: caloriesVal });
      setMealName('');
      setP('');
      setC('');
      setF('');
    }
  };

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(bw);
    if (weight > 0) {
      diet.logBodyweight(weight);
      setBw('');
    }
  }

  const waterPercentage = Math.min((diet.waterMl / 3000) * 100, 100);

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
      <div className="header-badge mt-6">RECOVERY SYS</div>
      
      <h1 className="text-2xl font-bold text-white tracking-[2px] mb-6">NUTRITION & BODY</h1>

      <div className="bg-sl-surface border border-sl-border p-6 mb-6 flex flex-col items-center">
        <CalorieRing value={calories} max={diet.targetCalories} />

        <div className="flex justify-around w-full mt-4">
          <MacroRing value={protein} max={diet.targetProtein} label="PRO" colorClass="stroke-sl-blue" />
          <MacroRing value={carbs} max={diet.targetCarbs} label="CARB" colorClass="stroke-sl-gold" />
          <MacroRing value={fat} max={diet.targetFat} label="FAT" colorClass="stroke-sl-red" />
        </div>
      </div>

      <div className="section-title">
        <span className="num">001</span><h2>Log Meal</h2><div className="line"></div>
      </div>

      <form onSubmit={handleAddMeal} className="bg-sl-surface border border-sl-border p-4 mb-6">
        <input 
          type="text" 
          placeholder="Meal Name" 
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full bg-sl-bg border border-sl-border text-white p-2 font-share mb-3 focus:border-sl-blue outline-none"
        />
        <div className="flex gap-3 mb-4">
          <div>
            <label className="font-share text-[10px] text-sl-text-dim block mb-1">PRO (g)</label>
            <input type="number" value={p} onChange={(e) => setP(e.target.value)} className="w-full bg-sl-bg border border-sl-border text-white p-2 font-share text-center outline-none focus:border-sl-blue" />
          </div>
          <div>
            <label className="font-share text-[10px] text-sl-text-dim block mb-1">CARB (g)</label>
            <input type="number" value={c} onChange={(e) => setC(e.target.value)} className="w-full bg-sl-bg border border-sl-border text-white p-2 font-share text-center outline-none focus:border-sl-gold" />
          </div>
          <div>
            <label className="font-share text-[10px] text-sl-text-dim block mb-1">FAT (g)</label>
            <input type="number" value={f} onChange={(e) => setF(e.target.value)} className="w-full bg-sl-bg border border-sl-border text-white p-2 font-share text-center outline-none focus:border-sl-red" />
          </div>
        </div>
        <button type="submit" className="w-full border border-dashed border-sl-border-strong text-sl-text-dim py-3 hover:border-sl-blue hover:text-sl-blue transition-colors font-share tracking-widest text-sm mb-6">
          + ADD MACROS
        </button>
      </form>

      {diet.meals.length > 0 && (
        <div className="space-y-2 mb-8">
          {diet.meals.map(meal => (
            <div key={meal.id} className="bg-sl-surface border border-sl-border p-3 flex justify-between items-center">
              <div>
                <p className="font-rajdhani font-bold text-white tracking-[1px]">{meal.name}</p>
                <p className="font-share text-[10px] text-sl-text-dim tracking-widest">
                  {meal.protein}P | {meal.carbs}C | {meal.fat}F • {meal.calories} KCAL
                </p>
              </div>
              <button 
                onClick={() => diet.removeMeal(meal.id)}
                className="w-8 h-8 flex items-center justify-center text-sl-red/70 hover:text-sl-red hover:bg-sl-red/10 border border-transparent hover:border-sl-red/30 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="section-title">
        <span className="num">002</span><h2>Bodyweight Trend</h2><div className="line"></div>
      </div>
      
      <div className="bg-sl-surface border border-sl-border p-4 mb-6">
        <div className="h-48 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={diet.bodyweightHistory}>
              <XAxis dataKey="date" stroke="#6a7a9a" fontSize={10} tickFormatter={(val) => val.substring(5)} />
              <YAxis stroke="#6a7a9a" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0b0f1e', border: '1px solid rgba(74,158,255,0.4)' }}
                itemStyle={{ color: '#4a9eff' }}
                labelStyle={{ color: '#8a9ab8' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#4a9eff" strokeWidth={2} dot={{ r: 4, fill: '#0b0f1e', stroke: '#4a9eff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <form onSubmit={handleLogWeight} className="flex gap-2">
          <input 
            type="number" 
            step="0.1"
            placeholder="Today's Weight (kg)" 
            value={bw}
            onChange={(e) => setBw(e.target.value)}
            className="flex-1 bg-sl-bg border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue"
          />
          <button type="submit" className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-6 font-share tracking-widest text-sm hover:bg-sl-blue/20 transition-colors">
            LOG
          </button>
        </form>
      </div>

      <div className="section-title">
        <span className="num">003</span><h2>Hydration</h2><div className="line"></div>
      </div>

      <div className="bg-sl-surface border border-sl-border p-4 mb-6 flex flex-col items-center">
        <div className="w-full h-8 bg-sl-bg border border-sl-border relative overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 bottom-0 bg-sl-blue/40 border-r border-sl-blue transition-all duration-500 ease-out"
            style={{ width: `${waterPercentage}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center font-share text-xs text-white tracking-widest">
            {diet.waterMl} / 3000 ML
          </div>
        </div>
        <button 
          type="button"
          onClick={() => diet.addWater(250)}
          className="bg-sl-blue/10 border border-sl-blue text-sl-blue px-6 py-2 font-share tracking-widest text-xs hover:bg-sl-blue/20 transition-colors"
        >
          + 250 ML WATER
        </button>
      </div>
    </div>
  );
};

export default Diet;
