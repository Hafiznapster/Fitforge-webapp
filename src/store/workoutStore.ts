import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkoutSet {
  id: string;
  reps: string | number;
  weight: number;
  rpe: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string;
  type: string;
  exercises: Exercise[];
}

interface WorkoutState {
  activeWorkout: string | null;
  exercises: Exercise[];
  startTime: string | null;
  customDate: string | null;
  workoutHistory: WorkoutHistoryEntry[];
  addSet: (exerciseId: string, set: WorkoutSet) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  addExercise: (exercise: Exercise) => void;
  startWorkout: (type: string, initialExercises?: Exercise[], customDate?: string) => void;
  finishWorkout: () => void;
  abandonWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      activeWorkout: null,
      exercises: [],
      startTime: null,
      customDate: null,
      workoutHistory: [],
  addSet: (exerciseId, newSet) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
      ),
    })),
  deleteSet: (exerciseId, setId) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex
      ),
    })),
  updateSet: (exerciseId, setId, updates) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
            }
          : ex
      ),
    })),
  addExercise: (exercise) => set((state) => ({ exercises: [...state.exercises, exercise] })),
  startWorkout: (type, initialExercises = [], customDate) => set({ activeWorkout: type, exercises: initialExercises, startTime: new Date().toISOString(), customDate: customDate || null }),
  finishWorkout: () => set((state) => {
    if (!state.activeWorkout) return { activeWorkout: null, exercises: [], startTime: null, customDate: null };
    const completedExercises = state.exercises.filter(ex => ex.sets.some(s => s.completed));
    if (completedExercises.length === 0) return { activeWorkout: null, exercises: [], startTime: null, customDate: null };
    
    // Create an ISO string for the custom date at 12:00 PM to avoid timezone issues, or use current time
    let finalDate = new Date().toISOString();
    if (state.customDate) {
      finalDate = new Date(`${state.customDate}T12:00:00Z`).toISOString();
    }
    
    const historyEntry: WorkoutHistoryEntry = {
      id: crypto.randomUUID(),
      date: finalDate,
      type: state.activeWorkout,
      exercises: completedExercises,
    };
    return {
      activeWorkout: null,
      exercises: [],
      startTime: null,
      customDate: null,
      workoutHistory: [...state.workoutHistory, historyEntry],
    };
  }),
  abandonWorkout: () => set({ activeWorkout: null, exercises: [], startTime: null, customDate: null }),
}),
{
  name: 'fitforge-workout-storage',
}));
