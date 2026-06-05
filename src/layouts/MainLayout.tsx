import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, User, Calendar, Utensils, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const location = useLocation();
  const navItems = [
    { to: '/', icon: Home, label: 'HQ' },
    { to: '/active-plan', icon: Calendar, label: 'MY PLAN' },
    { to: '/workout', icon: Dumbbell, label: 'RAID' },
    { to: '/diet', icon: Utensils, label: 'DIET' },
    { to: '/coach', icon: MessageSquare, label: 'COACH' },
    { to: '/hunter', icon: User, label: 'PROFILE' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-sl-bg">
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 w-full bg-sl-surface border-t border-sl-border pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink 
              key={to} 
              to={to} 
              className={({ isActive }) => `flex flex-col items-center p-2 min-w-[64px] transition-colors ${isActive ? 'text-sl-blue' : 'text-sl-text-dim hover:text-sl-text-mid'}`}
            >
              <motion.div whileTap={{ scale: 0.8 }}>
                <Icon size={20} strokeWidth={1.5} />
              </motion.div>
              <span className="font-share text-[10px] tracking-widest mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
