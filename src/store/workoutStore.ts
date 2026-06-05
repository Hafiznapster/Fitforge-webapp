import { create } from 'zustand';

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

interface WorkoutState {
  activeWorkout: string | null;
  exercises: Exercise[];
  addSet: (exerciseId: string, set: WorkoutSet) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  startWorkout: (type: string, initialExercises?: Exercise[]) => void;
  finishWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeWorkout: null,
  exercises: [],
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
  startWorkout: (type, initialExercises = []) => set({ activeWorkout: type, exercises: initialExercises }),
  finishWorkout: () => set({ activeWorkout: null, exercises: [] }),
}));
