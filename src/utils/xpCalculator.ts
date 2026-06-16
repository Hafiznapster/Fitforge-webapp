import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import type { WorkoutSet } from '../store/workoutStore';

export function calculateSetXP(set: WorkoutSet, exerciseName: string): number {
  if (!set.completed) return 0;

  // Look up exercise definition to find its type
  const exerciseDef = EXERCISE_DATABASE.find(ex => ex.name === exerciseName);
  const exerciseType = exerciseDef?.exerciseType || 'weighted'; // Default to weighted if unknown

  const reps = typeof set.reps === 'string' ? parseInt(set.reps) || 0 : set.reps || 0;

  if (exerciseType === 'weighted') {
    return Math.floor(reps * (set.weight || 0) * 0.1);
  }
  if (exerciseType === 'bodyweight_rep') {
    return Math.floor(reps * 2.5); // flat 2.5 XP per rep
  }
  if (exerciseType === 'bodyweight_hold') {
    return Math.floor((set.durationSeconds || 0) * 0.5); // 0.5 XP per second held
  }
  if (exerciseType === 'skill_move') {
    return set.isSuccess ? 50 : 10; // 50 XP for success, 10 for attempt
  }
  return 0;
}

export function calculateWorkoutXP(exercises: { name: string, sets: WorkoutSet[] }[]): number {
  let totalXP = 0;
  exercises.forEach(ex => {
    ex.sets.forEach(set => {
      totalXP += calculateSetXP(set, ex.name);
    });
  });
  // Ensure at least 50 XP if they completed any sets, to match old behavior partially
  const hasCompletedSets = exercises.some(ex => ex.sets.some(s => s.completed));
  return hasCompletedSets ? Math.max(50, totalXP) : 0;
}
