import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { motion } from 'framer-motion';

const Registration = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // On success, they are logged in or prompted to check email depending on supabase settings.
        // Assuming auto-login for this prototype.
      }
      
      // Check if profile has onboarding data (e.g. weight_kg is set)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('weight_kg')
          .eq('id', user.id)
          .single();
          
        if (profile && profile.weight_kg) {
          navigate('/');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('fitforge_guest', 'true');
    // If they already have a guest profile, go to dashboard, else onboarding
    const hasProfile = localStorage.getItem('fitforge_guest_profile');
    if (hasProfile) {
      navigate('/');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-sl-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sl-blue-glow rounded-full blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-rajdhani font-bold text-white tracking-[6px] mb-2">SYSTEM LOGIN</h1>
          <p className="font-share text-sl-blue tracking-[3px] text-xs">PLAYER AUTHENTICATION</p>
        </div>

        {error && (
          <div className="bg-sl-red/10 border border-sl-red text-sl-red p-3 mb-6 font-share text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">EMAIL IDENTIFIER</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue transition-colors"
              required
            />
          </div>
          <div>
            <label className="font-share text-[10px] text-sl-text-dim tracking-widest block mb-1">SECURITY KEY</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-sl-surface border border-sl-border text-white p-3 font-share outline-none focus:border-sl-blue transition-colors"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-sl-blue/10 border border-sl-blue text-sl-blue py-4 font-share tracking-[4px] text-sm hover:bg-sl-blue/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : (isLogin ? 'ENTER SYSTEM' : 'INITIALIZE PLAYER')}
          </button>
        </form>

        <div className="mt-4">
          <button 
            type="button"
            onClick={handleGuestLogin}
            className="w-full border border-dashed border-sl-border-strong text-sl-text-dim py-4 font-share tracking-[4px] text-sm hover:text-white hover:border-sl-blue transition-colors"
          >
            CONTINUE AS GUEST
          </button>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-share text-sl-text-dim hover:text-white text-xs tracking-widest transition-colors"
          >
            {isLogin ? "NEW PLAYER? REGISTER HERE" : "RETURNING PLAYER? LOGIN HERE"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Registration;
