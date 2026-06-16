import { EXERCISE_DATABASE } from '../data/exerciseDatabase';

// Type representing the required fields from UserState to avoid circular dependencies
export interface UserStateForUnlocks {
  stats: {
    STR: number;
    AGI: number;
  };
  unlockedSkills: string[];
  skillTreeProgress: {
    [exerciseId: string]: {
      bestReps?: number;
      bestDurationSeconds?: number;
      totalSessions?: number;
    }
  };
}

export function getExerciseById(exerciseId: string) {
  return EXERCISE_DATABASE.find(ex => ex.id === exerciseId);
}

/**
 * Check if an exercise can be unlocked given current user state
 */
export function canUnlock(exerciseId: string, userState: UserStateForUnlocks): boolean {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return false;
  if (!exercise.unlockRequirements && (!exercise.prerequisites || exercise.prerequisites.length === 0)) return true;

  const { unlockRequirements, prerequisites } = exercise;

  // Check stat thresholds
  if (unlockRequirements) {
    if (unlockRequirements.minSTR && userState.stats.STR < unlockRequirements.minSTR) return false;
    if (unlockRequirements.minAGI && userState.stats.AGI < unlockRequirements.minAGI) return false;

    // Check completion quest (performance gate)
    if (unlockRequirements.completionQuest) {
      const quest = unlockRequirements.completionQuest;
      const progress = userState.skillTreeProgress[quest.exerciseId];
      if (!progress) return false;

      if (quest.reps && (progress.bestReps ?? 0) < quest.reps) return false;
      if (quest.durationSeconds && (progress.bestDurationSeconds ?? 0) < quest.durationSeconds) return false;
      // We are not strictly checking 'sets' yet in the progress tracking, but bestReps/bestDuration applies to a single set.
    }
  }

  // Check prerequisites are already unlocked
  if (prerequisites && prerequisites.length > 0) {
    return prerequisites.every(id => userState.unlockedSkills.includes(id));
  }

  return true;
}

/**
 * Evaluate all locked exercises to see if any new ones can be unlocked.
 * Call after every completed workout session.
 */
export function evaluateUnlocksAfterSession(userState: UserStateForUnlocks): string[] {
  const newlyUnlocked: string[] = [];

  EXERCISE_DATABASE.forEach(exercise => {
    if (exercise.skillTreePath) {
      // If it's part of a skill tree and not already unlocked
      if (!userState.unlockedSkills.includes(exercise.id)) {
        if (canUnlock(exercise.id, userState)) {
          newlyUnlocked.push(exercise.id);
        }
      }
    }
  });

  return newlyUnlocked;
}
