import { Component, type ReactNode, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { useUserStore } from './store/userStore';
import { useDietStore } from './store/dietStore';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Plan from './pages/Plan';
import Diet from './pages/Diet';
import Coach from './pages/Coach';
import Registration from './pages/Registration';
import Onboarding from './pages/Onboarding';
import Stats from './pages/Stats';
import CalendarView from './pages/CalendarView';
import Settings from './pages/Settings';
import HunterProfile from './pages/HunterProfile';
import ActivePlan from './pages/ActivePlan';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sl-bg flex flex-col items-center justify-center p-8 text-center">
          <p className="font-share text-sl-red tracking-widest text-sm mb-2">SYSTEM ERROR</p>
          <h1 className="font-rajdhani text-3xl text-white font-bold mb-4">CRITICAL FAILURE</h1>
          <p className="text-sl-text-dim font-share text-xs mb-6">An unexpected error occurred. The system has been stabilized.</p>
          <button onClick={() => window.location.reload()} className="border border-sl-blue text-sl-blue px-6 py-3 font-share text-xs tracking-widest hover:bg-sl-blue hover:text-white transition-colors">
            REBOOT SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const hydrateProfile = async (userId: string | null, isGuest: boolean) => {
      try {
        let profile = null;
        if (isGuest) {
          const stored = localStorage.getItem('fitforge_guest_profile');
          if (stored) profile = JSON.parse(stored);
        } else if (userId) {
          const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
          profile = data;
        }

        if (profile) {
          useUserStore.getState().updateProfile(
            profile.hunter_name || 'Hunter', 
            null, 
            profile.player_class || 'Fighter'
          );
          if (profile.rank) {
            useUserStore.setState({ rank: profile.rank });
          }
          if (profile.weight_kg) {
            useDietStore.getState().setInitialWeight(profile.weight_kg);
          }
          if (profile.target_calories) {
            useDietStore.setState({
              targetCalories: profile.target_calories,
              targetProtein: Math.round(profile.weight_kg * 2.2),
              targetCarbs: Math.round((profile.target_calories * 0.4) / 4),
              targetFat: Math.round((profile.target_calories * 0.25) / 9)
            });
          }
        }
      } catch (err) {
        console.error("Failed to hydrate profile", err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const isGuest = localStorage.getItem('fitforge_guest') === 'true';
      hydrateProfile(session?.user?.id || null, isGuest).finally(() => {
        setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const isGuest = localStorage.getItem('fitforge_guest') === 'true';
      hydrateProfile(session?.user?.id || null, isGuest);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isGuest = localStorage.getItem('fitforge_guest') === 'true';

  if (loading) return <div className="min-h-[100dvh] bg-sl-bg flex items-center justify-center text-sl-blue font-share tracking-widest">SYSTEM LOADING...</div>;
  if (!session && !isGuest) return <Navigate to="/register" />;

  return children;
};

function App() {
  const checkDailyReset = useUserStore(state => state.checkDailyReset);
  const theme = useUserStore(state => state.theme);
  
  useEffect(() => {
    checkDailyReset();
    
    if (theme === 's-rank') {
      document.body.classList.add('theme-s-rank');
    } else {
      document.body.classList.remove('theme-s-rank');
    }
  }, [checkDailyReset, theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />
          
          <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="active-plan" element={<ActivePlan />} />
            <Route path="plan" element={<Plan />} />
            <Route path="workout" element={<Workout />} />
            <Route path="diet" element={<Diet />} />
            <Route path="coach" element={<Coach />} />
            <Route path="hunter" element={<HunterProfile />} />
            <Route path="stats" element={<Stats />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
