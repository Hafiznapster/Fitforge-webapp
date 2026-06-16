import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratedPlan } from '../services/aiService';

import { supabase } from '../services/supabaseClient';
import { playSound } from '../utils/audioContext';

interface Quest {
  id: string;
  desc: string;
  completed: boolean;
}

interface UserState {
  name: string;
  age: number | null;
  playerClass: string;
  rank: string;
  level: number;
  xp: number;
  xpNeeded: number;
  streak: number;
  lastLoginDate: string;
  dailyQuests: Quest[];
  theme: 'default' | 's-rank';
  statPoints: number;
  stats: {
    STR: number;
    AGI: number;
    VIT: number;
    INT: number;
  };
  savedPlan: GeneratedPlan | null;
  streakFreezes: number;
  titles: string[];
  activeTitle: string | null;
  gainXp: (amount: number) => void;
  checkDailyReset: () => void;
  toggleQuest: (id: string) => void;
  toggleTheme: () => void;
  allocateStat: (statName: keyof UserState['stats']) => void;
  buyStreakFreeze: () => void;
  setActiveTitle: (title: string | null) => void;
  checkAchievements: () => void;
  savePlan: (plan: GeneratedPlan | null) => void;
  updateProfile: (name: string, age: number | null, playerClass: string) => void;
  syncToSupabase: () => void;
  unlockedSkills: string[];
  skillTreeProgress: {
    [exerciseId: string]: {
      bestReps?: number;
      bestDurationSeconds?: number;
      totalSessions?: number;
    }
  };
  updateSkillProgress: (exerciseId: string, reps?: number, duration?: number) => void;
  unlockSkill: (exerciseId: string) => void;
}

const callisthenicsQuestTemplates = [
  { text: 'Hold an L-Sit for 3×10 seconds', requires: 'l_sit_parallel' },
  { text: 'Complete 5×10 Pull-ups', requires: 'pull_up' },
  { text: 'Practice Handstand wall hold for 60 total seconds', requires: 'wall_handstand_hold' },
  { text: 'Log 3 sets of Muscle-up attempts', requires: 'muscle_up_kipping' },
  { text: 'Hold a Plank for 60 seconds', requires: 'plank' },
  { text: 'Do 30 Standard Push-ups', requires: 'push_up' }
];

export const generateDailyQuests = (unlockedSkills: string[] = []): Quest[] => {
  const baseQuests: Quest[] = [
    { id: '1', desc: 'Hit daily protein target', completed: false },
    { id: '2', desc: 'Complete workout session', completed: false },
    { id: '3', desc: 'Hit daily water goal', completed: false },
  ];

  const eligibleCalisthenics = callisthenicsQuestTemplates.filter(q => unlockedSkills.includes(q.requires));
  
  if (eligibleCalisthenics.length > 0) {
    // Pick a random eligible calisthenics quest
    const randomQuest = eligibleCalisthenics[Math.floor(Math.random() * eligibleCalisthenics.length)];
    baseQuests.push({ id: '4', desc: randomQuest.text, completed: false });
  }

  return baseQuests;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: 'Player',
      age: null,
      playerClass: 'Fighter',
      rank: 'E',
      level: 1,
      xp: 0,
      xpNeeded: 1000,
      streak: 0,
      lastLoginDate: new Date().toISOString().split('T')[0],
      dailyQuests: generateDailyQuests(['wall_push_up', 'dead_hang', 'dead_bug', 'wall_sit']),
      theme: 'default',
      statPoints: 0,
      stats: {
        STR: 10,
        AGI: 10,
        VIT: 10,
        INT: 10,
      },
      savedPlan: null,
      streakFreezes: 0,
      titles: ['Awakened Hunter'],
      activeTitle: 'Awakened Hunter',
      unlockedSkills: ['wall_push_up', 'dead_hang', 'dead_bug', 'wall_sit'], // E-rank basics unlocked by default
      skillTreeProgress: {},
      updateSkillProgress: (exerciseId, reps, duration) => set((state) => {
        const currentProgress = state.skillTreeProgress[exerciseId] || { totalSessions: 0 };
        return {
          skillTreeProgress: {
            ...state.skillTreeProgress,
            [exerciseId]: {
              bestReps: Math.max(currentProgress.bestReps || 0, reps || 0),
              bestDurationSeconds: Math.max(currentProgress.bestDurationSeconds || 0, duration || 0),
              totalSessions: (currentProgress.totalSessions || 0) + 1,
            }
          }
        };
      }),
      unlockSkill: (exerciseId) => set((state) => {
        if (!state.unlockedSkills.includes(exerciseId)) {
          return { unlockedSkills: [...state.unlockedSkills, exerciseId] };
        }
        return state;
      }),
      updateProfile: (name, age, playerClass) => set({ name, age, playerClass }),
      savePlan: (plan) => set({ savedPlan: plan }),
      syncToSupabase: async () => {
        const state = get();
        const isGuest = localStorage.getItem('fitforge_guest') === 'true';
        if (isGuest) return;
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await supabase.from('profiles').update({
              rank: state.rank,
              level: state.level,
              xp: state.xp,
              streak: state.streak,
              unlocked_skills: state.unlockedSkills,
              skill_tree_progress: state.skillTreeProgress
            }).eq('id', session.user.id);
          }
        } catch (e) {
          console.error("Failed to sync to Supabase", e);
        }
      },
      gainXp: (amount) =>
        set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          let newXpNeeded = state.xpNeeded;
          let leveledUp = false;
          let newStatPoints = state.statPoints;
          while (newXp >= newXpNeeded) {
            newXp -= newXpNeeded;
            newLevel += 1;
            newXpNeeded = Math.round(newXpNeeded * 1.25);
            leveledUp = true;
            newStatPoints += 3;
          }
          const rankThresholds: Array<[number, string]> = [[50,'S'],[30,'A'],[20,'B'],[10,'C'],[5,'D']];
          const newRank = rankThresholds.find(([lvl]) => newLevel >= lvl)?.[1] ?? state.rank;
          setTimeout(() => get().syncToSupabase(), 0);

          if (leveledUp) playSound('levelUp');
          else if (amount > 0) playSound('xpGain');

          return { xp: newXp, level: newLevel, xpNeeded: newXpNeeded, rank: newRank, statPoints: newStatPoints };
        }),
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
          let newFreezes = state.streakFreezes;

          if (allCompleted && diffDays === 1) {
            newStreak += 1;
          } else if (!allCompleted || diffDays > 1) {
            // Streak broken. Check if we have freezes
            const missedDays = diffDays > 0 ? diffDays - 1 : 1; // Number of un-logged days
            const totalFreezesNeeded = (!allCompleted ? 1 : 0) + missedDays;

            if (newFreezes >= totalFreezesNeeded) {
              newFreezes -= totalFreezesNeeded;
              // Streak preserved!
            } else {
              newStreak = 0;
            }
          }

          set({
            lastLoginDate: today,
            dailyQuests: generateDailyQuests(state.unlockedSkills),
            streak: newStreak,
            streakFreezes: newFreezes
          });
          get().checkAchievements();
          setTimeout(() => get().syncToSupabase(), 0);
        }
      },
      buyStreakFreeze: () => set((state) => {
        if (state.xp >= 500) {
          return { xp: state.xp - 500, streakFreezes: state.streakFreezes + 1 };
        }
        return {};
      }),
      setActiveTitle: (title) => set({ activeTitle: title }),
      checkAchievements: () => set((state) => {
        const newTitles = new Set(state.titles);
        if (state.streak >= 7) newTitles.add('Consistent Crawler');
        if (state.streak >= 30) newTitles.add('Iron Monarch');
        if (state.level >= 10) newTitles.add('Elite Hunter');
        if (state.level >= 50) newTitles.add('National Level Hunter');
        
        return { titles: Array.from(newTitles) };
      }),
      toggleQuest: (id) => set((state) => {
        const newQuests = state.dailyQuests.map(q => {
          if (q.id === id) {
             const newlyCompleted = !q.completed;
             if (newlyCompleted) playSound('questComplete');
             return { ...q, completed: newlyCompleted };
          }
          return q;
        });
        return { dailyQuests: newQuests };
      }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'default' ? 's-rank' : 'default'
      })),
      allocateStat: (statName) => set((state) => {
        if (state.statPoints > 0) {
          return {
            statPoints: state.statPoints - 1,
            stats: {
              ...state.stats,
              [statName]: state.stats[statName] + 1
            }
          };
        }
        return state;
      }),
    }),
    {
      name: 'fitforge-system-storage',
    }
  )
);
