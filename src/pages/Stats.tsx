import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockRadarData = [
  { subject: 'Chest', A: 120, fullMark: 150 },
  { subject: 'Back', A: 98, fullMark: 150 },
  { subject: 'Legs', A: 86, fullMark: 150 },
  { subject: 'Arms', A: 99, fullMark: 150 },
  { subject: 'Core', A: 85, fullMark: 150 },
  { subject: 'Shoulders', A: 65, fullMark: 150 },
];

const mock1RM = [
  { lift: 'Bench Press', weight: '105 kg' },
  { lift: 'Squat', weight: '140 kg' },
  { lift: 'Deadlift', weight: '165 kg' },
  { lift: 'Overhead Press', weight: '65 kg' },
];

const Stats = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-4 relative pb-24">
      <button onClick={() => navigate(-1)} className="text-sl-text-dim hover:text-white mb-6 flex items-center gap-2">
        <ArrowLeft size={16} /> <span className="font-share text-xs tracking-widest">BACK</span>
      </button>

      <div className="header-badge mt-2">ANALYTICS SYS</div>
      <h1 className="text-3xl font-bold text-white tracking-[4px] mb-8">STATISTICS</h1>

      <div className="section-title">
        <span className="num">001</span><h2>Muscle Development</h2><div className="line"></div>
      </div>

      <div className="bg-sl-surface border border-sl-border p-4 mb-8">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
              <PolarGrid stroke="rgba(74,158,255,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8a9ab8', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar name="Hunter" dataKey="A" stroke="#4a9eff" fill="#4a9eff" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-title">
        <span className="num">002</span><h2>Estimated 1RM</h2><div className="line"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mock1RM.map((item, i) => (
          <div key={i} className="bg-sl-surface border border-sl-border p-4 text-center">
            <p className="font-share text-[10px] text-sl-text-dim tracking-widest mb-2 uppercase">{item.lift}</p>
            <p className="font-rajdhani text-2xl font-bold text-white">{item.weight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
