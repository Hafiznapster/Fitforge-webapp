import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratedPlan } from '../services/aiService';

interface Quest {
  id: string;
  desc: string;
  completed: boolean;
}

interface UserState {
  isRegistered: boolean;
  name: string;
  age: number | null;
  playerClass: string;
  rank: string;
  level: number;
  xp: number;
  xpNeeded: number;
  fitnessScore: number;
  fatigueScore: number;
  stats: {
    str: string;
    agi: string;
    vit: string;
    int: string;
    luk: string;
  };
  streak: number;
  lastLoginDate: string;
  dailyQuests: Quest[];
  theme: 'default' | 's-rank';
  savedPlan: GeneratedPlan | null;
  registerUser: (name: string, age: number, playerClass: string) => void;
  gainXp: (amount: number) => void;
  updateReadiness: (fitness: number, fatigue: number) => void;
  checkDailyReset: () => void;
  toggleQuest: (id: string) => void;
  toggleTheme: () => void;
  savePlan: (plan: GeneratedPlan | null) => void;
  updateProfile: (name: string, age: number | null, playerClass: string) => void;
}

const generateDailyQuests = (): Quest[] => [
  { id: '1', desc: 'Hit 150g protein', completed: false },
  { id: '2', desc: 'Complete workout session', completed: false },
  { id: '3', desc: 'Log 3L of water', completed: false },
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isRegistered: false,
      name: 'Player',
      age: null,
      playerClass: 'Fighter',
      rank: 'E',
      level: 1,
      xp: 0,
      xpNeeded: 1000,
      fitnessScore: 12000,
      fatigueScore: 8500,
      stats: {
        str: '10',
        agi: '10',
        vit: '10',
        int: '10',
        luk: '10',
      },
      streak: 0,
      lastLoginDate: new Date().toISOString().split('T')[0],
      dailyQuests: generateDailyQuests(),
      theme: 'default',
      savedPlan: null,
      registerUser: (name, age, playerClass) => set({ isRegistered: true, name, age, playerClass }),
      updateProfile: (name, age, playerClass) => set({ name, age, playerClass }),
      savePlan: (plan) => set({ savedPlan: plan }),
      gainXp: (amount) =>
        set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          if (newXp >= state.xpNeeded) {
            newLevel += 1;
            newXp = newXp - state.xpNeeded;
          }
          return { xp: newXp, level: newLevel };
        }),
      updateReadiness: (fitness, fatigue) => set({ fitnessScore: fitness, fatigueScore: fatigue }),
      checkDailyReset: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        if (state.lastLoginDate !== today) {
          // If all quests were completed yesterday, increment streak. Otherwise, reset streak to 0.
          const allCompleted = state.dailyQuests.every(q => q.completed);
          
          // Check if it's been more than 1 day to break streak immediately
          const lastDate = new Date(state.lastLoginDate);
          const currentDate = new Date(today);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          
          let newStreak = state.streak;
          if (allCompleted && diffDays === 1) {
            newStreak += 1;
          } else if (!allCompleted || diffDays > 1) {
            newStreak = 0;
          }

          set({
            lastLoginDate: today,
            dailyQuests: generateDailyQuests(),
            streak: newStreak
          });
        }
      },
      toggleQuest: (id) => set((state) => ({
        dailyQuests: state.dailyQuests.map(q => 
          q.id === id ? { ...q, completed: !q.completed } : q
        )
      })),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'default' ? 's-rank' : 'default'
      })),
    }),
    {
      name: 'fitforge-system-storage',
    }
  )
);
