import { create } from 'zustand';

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  rpe: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

interface WorkoutState {
  activeWorkout: string | null;
  exercises: Exercise[];
  addSet: (exerciseId: string, set: WorkoutSet) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  startWorkout: (type: string) => void;
  finishWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeWorkout: 'Push Day',
  exercises: [
    {
      id: 'bench-press',
      name: 'Bench Press',
      sets: [
        { id: '1', weight: 80, reps: 8, rpe: 7, completed: true },
        { id: '2', weight: 80, reps: 8, rpe: 8, completed: false },
      ]
    }
  ],
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
  startWorkout: (type) => set({ activeWorkout: type, exercises: [] }),
  finishWorkout: () => set({ activeWorkout: null, exercises: [] }),
}));
