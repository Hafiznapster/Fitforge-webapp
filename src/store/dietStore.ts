import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
}

interface BodyweightEntry {
  date: string;
  weight: number;
}

interface DietState {
  waterMl: number;
  meals: Meal[];
  bodyweightHistory: BodyweightEntry[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  lastLogDate: string;
  addWater: (amount: number) => void;
  addMeal: (meal: Omit<Meal, 'id' | 'date'>) => void;
  removeMeal: (id: string) => void;
  logBodyweight: (weight: number) => void;
  setInitialWeight: (weight: number) => void;
  checkDailyReset: () => void;
}

export const useDietStore = create<DietState>()(
  persist(
    (set) => ({
      waterMl: 0,
      meals: [],
      bodyweightHistory: [],
      targetCalories: 2500,
      targetProtein: 160,
      targetCarbs: 250,
      targetFat: 65,
      lastLogDate: new Date().toISOString().split('T')[0],
      addWater: (amount) => set((state) => ({ waterMl: state.waterMl + amount })),
      addMeal: (meal) =>
        set((state) => ({
          meals: [...state.meals, { ...meal, id: crypto.randomUUID().slice(0, 8), date: new Date().toISOString().split('T')[0] }],
        })),
      removeMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter(m => m.id !== id),
        })),
      logBodyweight: (weight) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newHistory = state.bodyweightHistory.filter(e => e.date !== today); // Overwrite today if exists
        newHistory.push({ date: today, weight });
        return { bodyweightHistory: newHistory.sort((a, b) => a.date.localeCompare(b.date)) };
      }),
      setInitialWeight: (weight) => set({
        bodyweightHistory: [{ date: new Date().toISOString().split('T')[0], weight }]
      }),
      checkDailyReset: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastLogDate !== today) {
          return { meals: [], waterMl: 0, lastLogDate: today };
        }
        return {};
      }),
    }),
    {
      name: 'fitforge-diet-storage',
    }
  )
);
