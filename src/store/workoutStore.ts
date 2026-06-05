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
  workoutHistory: WorkoutHistoryEntry[];
  addSet: (exerciseId: string, set: WorkoutSet) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  addExercise: (exercise: Exercise) => void;
  startWorkout: (type: string, initialExercises?: Exercise[]) => void;
  finishWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      activeWorkout: null,
      exercises: [],
      workoutHistory: [],
  addSet: (exerciseId, newSet) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
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
  startWorkout: (type, initialExercises = []) => set({ activeWorkout: type, exercises: initialExercises }),
  finishWorkout: () => set((state) => {
    if (!state.activeWorkout) return { activeWorkout: null, exercises: [] };
    
    const historyEntry: WorkoutHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      type: state.activeWorkout,
      exercises: state.exercises,
    };
    
    return {
      activeWorkout: null,
      exercises: [],
      workoutHistory: [...state.workoutHistory, historyEntry],
    };
  }),
}),
{
  name: 'fitforge-workout-storage',
}));
