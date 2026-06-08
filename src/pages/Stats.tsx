import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowLeft, Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { useDietStore } from '../store/dietStore';
import { useUserStore } from '../store/userStore';

// Keyword-based muscle group inference
const MUSCLE_KEYWORDS: Record<string, string> = {
  bench: 'Chest', push: 'Chest', fly: 'Chest', chest: 'Chest', pec: 'Chest',
  row: 'Back', pull: 'Back', lat: 'Back', deadlift: 'Back', back: 'Back',
  squat: 'Legs', leg: 'Legs', lunge: 'Legs', calf: 'Legs', rdl: 'Legs', hamstring: 'Legs',
  press: 'Shoulders', lateral: 'Shoulders', delt: 'Shoulders', shoulder: 'Shoulders', ohp: 'Shoulders',
  curl: 'Arms', tricep: 'Arms', bicep: 'Arms', extension: 'Arms', dip: 'Arms',
  plank: 'Core', crunch: 'Core', ab: 'Core', core: 'Core', situp: 'Core',
};

const getMuscleGroup = (name: string): string => {
  const lower = name.toLowerCase();
  for (const [kw, group] of Object.entries(MUSCLE_KEYWORDS)) {
    if (lower.includes(kw)) return group;
  }
  return 'Other';
};

// Epley 1RM formula
const epley1RM = (weight: number, reps: number) =>
  reps === 1 ? weight : Math.round(weight * (1 + reps / 30));

const Stats = () => {
  const navigate = useNavigate();
  const { workoutHistory } = useWorkoutStore();
  const { bodyweightHistory } = useDietStore();
  const { streak, level } = useUserStore();

  const hasHistory = workoutHistory.length > 0;

  // ── Muscle Volume Radar ──────────────────────────────────────────
  const radarData = useMemo(() => {
    const groups: Record<string, number> = {
      Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0,
    };
    workoutHistory.forEach(w => {
      w.exercises.forEach(ex => {
        const group = getMuscleGroup(ex.name);
        if (group in groups) {
          const completedSets = ex.sets.filter(s => s.completed);
          groups[group] += completedSets.length;
        }
      });
    });
    const max = Math.max(1, ...Object.values(groups));
    return Object.entries(groups).map(([subject, value]) => ({
      subject,
      A: Math.round((value / max) * 150),
      fullMark: 150,
    }));
  }, [workoutHistory]);

  // ── Estimated 1RM per exercise ───────────────────────────────────
  const estimated1RMs = useMemo(() => {
    const bests: Record<string, number> = {};
    workoutHistory.slice(-20).forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.filter(s => s.completed).forEach(s => {
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          if (w > 0 && r > 0) {
            const est = epley1RM(w, r);
            if (!bests[ex.name] || est > bests[ex.name]) {
              bests[ex.name] = est;
            }
          }
        });
      });
    });
    return Object.entries(bests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [workoutHistory]);

  // ── Summary Stats ────────────────────────────────────────────────
  const totalVolume = useMemo(() => {
    let vol = 0;
    workoutHistory.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.filter(s => s.completed).forEach(s => {
          vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        });
      });
    });
    return vol;
  }, [workoutHistory]);

  const formatVolume = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}t` : `${v}kg`;

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
      <button onClick={() => navigate(-1)} className="text-sl-text-dim hover:text-white mb-6 flex items-center gap-2">
        <ArrowLeft size={16} /> <span className="font-share text-xs tracking-widest">BACK</span>
      </button>

      <div className="header-badge mt-2">ANALYTICS SYS</div>
      <h1 className="text-3xl font-bold text-white tracking-[4px] mb-8 font-rajdhani">STATISTICS</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { icon: <Zap size={16} />, label: 'TOTAL RAIDS', value: workoutHistory.length.toString() },
          { icon: <TrendingUp size={16} />, label: 'TOTAL VOLUME', value: formatVolume(totalVolume) },
          { icon: <Target size={16} />, label: 'STREAK', value: `${streak}d` },
          { icon: <Trophy size={16} />, label: 'HUNTER LVL', value: level.toString() },
        ].map((card, i) => (
          <div key={i} className="bg-sl-surface border border-sl-border p-4 flex items-center gap-3">
            <span className="text-sl-blue">{card.icon}</span>
            <div>
              <p className="font-share text-[9px] text-sl-text-dim tracking-widest">{card.label}</p>
              <p className="font-rajdhani text-xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Muscle Development Radar */}
      <div className="section-title">
        <span className="num">001</span><h2>Muscle Development</h2><div className="line"></div>
      </div>
      <div className="bg-sl-surface border border-sl-border p-4 mb-8">
        {hasHistory ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(74,158,255,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8a9ab8', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Hunter" dataKey="A" stroke="#4a9eff" fill="#4a9eff" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="font-share text-xs text-sl-text-dim tracking-widest text-center">
              COMPLETE YOUR FIRST RAID<br/>TO POPULATE THIS CHART
            </p>
          </div>
        )}
      </div>

      {/* Estimated 1RM */}
      <div className="section-title">
        <span className="num">002</span><h2>Estimated 1RM</h2><div className="line"></div>
      </div>
      <div className="mb-8">
        {estimated1RMs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {estimated1RMs.map(([name, weight], i) => (
              <div key={i} className="bg-sl-surface border border-sl-border p-4 text-center">
                <p className="font-share text-[9px] text-sl-text-dim tracking-widest mb-2 uppercase truncate">{name}</p>
                <p className="font-rajdhani text-2xl font-bold text-white">{weight}<span className="text-sm text-sl-text-dim ml-1">kg</span></p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-sl-surface border border-dashed border-sl-border-strong p-6 text-center">
            <p className="font-share text-xs text-sl-text-dim tracking-widest">LOG SETS WITH WEIGHT &amp; REPS<br/>TO SEE 1RM ESTIMATES</p>
          </div>
        )}
      </div>

      {/* Bodyweight Trend */}
      {bodyweightHistory.length > 1 && (
        <>
          <div className="section-title">
            <span className="num">003</span><h2>Bodyweight Trend</h2><div className="line"></div>
          </div>
          <div className="bg-sl-surface border border-sl-border p-4 mb-8">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bodyweightHistory}>
                  <XAxis dataKey="date" stroke="#6a7a9a" fontSize={9} tickFormatter={(v) => v.substring(5)} />
                  <YAxis stroke="#6a7a9a" fontSize={9} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f1e', border: '1px solid rgba(74,158,255,0.4)' }}
                    itemStyle={{ color: '#4a9eff' }}
                    labelStyle={{ color: '#8a9ab8' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#4a9eff" strokeWidth={2} dot={{ r: 3, fill: '#0b0f1e', stroke: '#4a9eff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;
