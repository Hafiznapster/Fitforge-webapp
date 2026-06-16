export type ExerciseType =
  | 'weighted'      // standard barbell/dumbbell — logs sets × reps × weight
  | 'bodyweight_rep'  // push-ups, pull-ups — logs sets × reps, weight optional (for weighted vest)
  | 'bodyweight_hold' // plank, L-sit, handstand — logs sets × reps × duration_seconds
  | 'skill_move';     // muscle-up, planche — logs attempts + success boolean

export type SkillTreePath = 'Push' | 'Pull' | 'Core' | 'Legs';
export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface UnlockRequirements {
  minSTR?: number;
  minAGI?: number;
  completionQuest?: {
    exerciseId: string;
    reps?: number;
    durationSeconds?: number;
    sets?: number;
  };
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: string; // legacy category for backward compatibility where muscleGroups isn't implemented
  muscleGroups: string[];
  exerciseType: ExerciseType;
  skillTreePath?: SkillTreePath | null;
  skillTreeTier?: HunterRank;
  prerequisites?: string[];
  unlockRequirements?: UnlockRequirements;
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // --- WEIGHTED EXERCISES ---
  { id: 'bench_press', name: 'Barbell Bench Press', category: 'Chest', muscleGroups: ['Chest', 'Triceps', 'Shoulders'], exerciseType: 'weighted' },
  { id: 'incline_dumbbell_press', name: 'Incline Dumbbell Press', category: 'Chest', muscleGroups: ['Chest', 'Shoulders'], exerciseType: 'weighted' },
  { id: 'chest_flyes', name: 'Chest Flyes', category: 'Chest', muscleGroups: ['Chest'], exerciseType: 'weighted' },
  { id: 'barbell_squat', name: 'Barbell Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'weighted' },
  { id: 'leg_press', name: 'Leg Press', category: 'Legs', muscleGroups: ['Quads'], exerciseType: 'weighted' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'weighted' },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', category: 'Legs', muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'], exerciseType: 'weighted' },
  { id: 'leg_extension', name: 'Leg Extension', category: 'Legs', muscleGroups: ['Quads'], exerciseType: 'weighted' },
  { id: 'leg_curl', name: 'Leg Curl', category: 'Legs', muscleGroups: ['Hamstrings'], exerciseType: 'weighted' },
  { id: 'calf_raises', name: 'Calf Raises', category: 'Legs', muscleGroups: ['Calves'], exerciseType: 'weighted' },
  { id: 'deadlift', name: 'Deadlift', category: 'Back', muscleGroups: ['Back', 'Glutes', 'Hamstrings'], exerciseType: 'weighted' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'weighted' },
  { id: 'barbell_row', name: 'Barbell Row', category: 'Back', muscleGroups: ['Back', 'Biceps'], exerciseType: 'weighted' },
  { id: 'seated_cable_row', name: 'Seated Cable Row', category: 'Back', muscleGroups: ['Back', 'Biceps'], exerciseType: 'weighted' },
  { id: 'overhead_press', name: 'Overhead Press', category: 'Shoulders', muscleGroups: ['Shoulders', 'Triceps'], exerciseType: 'weighted' },
  { id: 'lateral_raises', name: 'Lateral Raises', category: 'Shoulders', muscleGroups: ['Lateral Deltoids'], exerciseType: 'weighted' },
  { id: 'front_raises', name: 'Front Raises', category: 'Shoulders', muscleGroups: ['Front Deltoids'], exerciseType: 'weighted' },
  { id: 'face_pulls', name: 'Face Pulls', category: 'Shoulders', muscleGroups: ['Rear Deltoids', 'Upper Back'], exerciseType: 'weighted' },
  { id: 'barbell_curl', name: 'Barbell Curl', category: 'Arms', muscleGroups: ['Biceps'], exerciseType: 'weighted' },
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', category: 'Arms', muscleGroups: ['Biceps'], exerciseType: 'weighted' },
  { id: 'hammer_curl', name: 'Hammer Curl', category: 'Arms', muscleGroups: ['Biceps', 'Brachialis'], exerciseType: 'weighted' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', category: 'Arms', muscleGroups: ['Triceps'], exerciseType: 'weighted' },
  { id: 'overhead_tricep_extension', name: 'Overhead Tricep Extension', category: 'Arms', muscleGroups: ['Triceps'], exerciseType: 'weighted' },
  { id: 'skull_crushers', name: 'Skull Crushers', category: 'Arms', muscleGroups: ['Triceps'], exerciseType: 'weighted' },

  // --- CALISTHENICS: PUSH PATH ---
  { id: 'wall_push_up', name: 'Wall Push-up', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'E' },
  { id: 'incline_push_up', name: 'Incline Push-up', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'E', prerequisites: ['wall_push_up'], unlockRequirements: { completionQuest: { exerciseId: 'wall_push_up', reps: 20, sets: 1 } } },
  { id: 'knee_push_up', name: 'Knee Push-up', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'E', prerequisites: ['incline_push_up'], unlockRequirements: { completionQuest: { exerciseId: 'incline_push_up', reps: 20, sets: 1 } } },
  { id: 'push_up', name: 'Standard Push-up', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'D', prerequisites: ['knee_push_up'], unlockRequirements: { completionQuest: { exerciseId: 'knee_push_up', reps: 20, sets: 1 } } },
  { id: 'wide_push_up', name: 'Wide Push-up', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'D', prerequisites: ['push_up'], unlockRequirements: { completionQuest: { exerciseId: 'push_up', reps: 15, sets: 1 } } },
  { id: 'diamond_push_up', name: 'Diamond Push-up', category: 'Chest', muscleGroups: ['Triceps', 'Chest'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'D', prerequisites: ['push_up'], unlockRequirements: { completionQuest: { exerciseId: 'push_up', reps: 20, sets: 1 } } },
  { id: 'archer_push_up', name: 'Archer Push-up', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'C', prerequisites: ['diamond_push_up'], unlockRequirements: { minSTR: 15, completionQuest: { exerciseId: 'diamond_push_up', reps: 15, sets: 1 } } },
  { id: 'pike_push_up', name: 'Pike Push-up', category: 'Shoulders', muscleGroups: ['Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'C', prerequisites: ['push_up'], unlockRequirements: { completionQuest: { exerciseId: 'push_up', reps: 25, sets: 1 } } },
  { id: 'decline_push_up', name: 'Decline Push-up', category: 'Chest', muscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'C', prerequisites: ['diamond_push_up'], unlockRequirements: { completionQuest: { exerciseId: 'diamond_push_up', reps: 15, sets: 1 } } },
  { id: 'pseudo_planche_push_up', name: 'Pseudo Planche Push-up', category: 'Chest', muscleGroups: ['Shoulders', 'Chest', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'B', prerequisites: ['archer_push_up'], unlockRequirements: { minSTR: 25, completionQuest: { exerciseId: 'archer_push_up', reps: 10, sets: 1 } } },
  { id: 'one_arm_negative_push_up', name: 'One-Arm Negative', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'B', prerequisites: ['archer_push_up'], unlockRequirements: { minSTR: 25, completionQuest: { exerciseId: 'archer_push_up', reps: 10, sets: 1 } } },
  { id: 'wall_handstand_hold', name: 'Wall Handstand Hold', category: 'Shoulders', muscleGroups: ['Shoulders', 'Core'], exerciseType: 'bodyweight_hold', skillTreePath: 'Push', skillTreeTier: 'B', prerequisites: ['pike_push_up'], unlockRequirements: { minAGI: 20, completionQuest: { exerciseId: 'pike_push_up', reps: 15, sets: 1 } } },
  { id: 'one_arm_push_up', name: 'One-Arm Push-up', category: 'Chest', muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'], exerciseType: 'skill_move', skillTreePath: 'Push', skillTreeTier: 'A', prerequisites: ['one_arm_negative_push_up'], unlockRequirements: { minSTR: 35, completionQuest: { exerciseId: 'one_arm_negative_push_up', reps: 5, sets: 1 } } },
  { id: 'handstand_push_up_wall', name: 'Handstand Push-up (Wall)', category: 'Shoulders', muscleGroups: ['Shoulders', 'Triceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Push', skillTreeTier: 'A', prerequisites: ['wall_handstand_hold'], unlockRequirements: { minSTR: 30, completionQuest: { exerciseId: 'wall_handstand_hold', durationSeconds: 60, sets: 1 } } },
  { id: 'planche_lean', name: 'Planche Lean', category: 'Shoulders', muscleGroups: ['Shoulders', 'Core'], exerciseType: 'bodyweight_hold', skillTreePath: 'Push', skillTreeTier: 'A', prerequisites: ['pseudo_planche_push_up'], unlockRequirements: { minSTR: 30, completionQuest: { exerciseId: 'pseudo_planche_push_up', reps: 10, sets: 1 } } },
  { id: 'strict_hspu', name: 'Strict Handstand Push-up', category: 'Shoulders', muscleGroups: ['Shoulders', 'Triceps', 'Core'], exerciseType: 'skill_move', skillTreePath: 'Push', skillTreeTier: 'S', prerequisites: ['handstand_push_up_wall'], unlockRequirements: { minSTR: 50, minAGI: 40, completionQuest: { exerciseId: 'handstand_push_up_wall', reps: 10, sets: 1 } } },
  { id: 'full_planche', name: 'Full Planche', category: 'Shoulders', muscleGroups: ['Shoulders', 'Core', 'Biceps'], exerciseType: 'skill_move', skillTreePath: 'Push', skillTreeTier: 'S', prerequisites: ['planche_lean'], unlockRequirements: { minSTR: 60, minAGI: 30, completionQuest: { exerciseId: 'planche_lean', durationSeconds: 45, sets: 1 } } },
  { id: 'one_arm_handstand', name: 'One-Arm Handstand', category: 'Shoulders', muscleGroups: ['Shoulders', 'Core'], exerciseType: 'skill_move', skillTreePath: 'Push', skillTreeTier: 'S', prerequisites: ['wall_handstand_hold'], unlockRequirements: { minSTR: 40, minAGI: 60, completionQuest: { exerciseId: 'wall_handstand_hold', durationSeconds: 120, sets: 1 } } },

  // --- CALISTHENICS: PULL PATH ---
  { id: 'dead_hang', name: 'Dead Hang', category: 'Back', muscleGroups: ['Forearms', 'Back'], exerciseType: 'bodyweight_hold', skillTreePath: 'Pull', skillTreeTier: 'E' },
  { id: 'scapular_pull', name: 'Scapular Pull', category: 'Back', muscleGroups: ['Back'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'E', prerequisites: ['dead_hang'], unlockRequirements: { completionQuest: { exerciseId: 'dead_hang', durationSeconds: 30, sets: 1 } } },
  { id: 'negative_pull_up', name: 'Negative Pull-up', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'E', prerequisites: ['scapular_pull'], unlockRequirements: { completionQuest: { exerciseId: 'scapular_pull', reps: 10, sets: 1 } } },
  { id: 'ring_row', name: 'Ring Row', category: 'Back', muscleGroups: ['Back', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'D' },
  { id: 'band_assisted_pull_up', name: 'Band-Assisted Pull-up', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'D', prerequisites: ['negative_pull_up'], unlockRequirements: { completionQuest: { exerciseId: 'negative_pull_up', reps: 8, sets: 1 } } },
  { id: 'pull_up', name: 'Standard Pull-up', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'D', prerequisites: ['band_assisted_pull_up'], unlockRequirements: { minSTR: 12, completionQuest: { exerciseId: 'band_assisted_pull_up', reps: 10, sets: 1 } } },
  { id: 'chin_up', name: 'Chin-up', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'C', prerequisites: ['pull_up'], unlockRequirements: { completionQuest: { exerciseId: 'pull_up', reps: 5, sets: 1 } } },
  { id: 'wide_grip_pull_up', name: 'Wide-Grip Pull-up', category: 'Back', muscleGroups: ['Lats'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'C', prerequisites: ['pull_up'], unlockRequirements: { completionQuest: { exerciseId: 'pull_up', reps: 8, sets: 1 } } },
  { id: 'lsit_pull_up', name: 'L-Sit Pull-up', category: 'Back', muscleGroups: ['Lats', 'Core'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'C', prerequisites: ['pull_up', 'l_sit_parallel'], unlockRequirements: { minSTR: 20, minAGI: 15, completionQuest: { exerciseId: 'pull_up', reps: 10, sets: 1 } } },
  { id: 'chest_to_bar_pull_up', name: 'Chest-to-Bar Pull-up', category: 'Back', muscleGroups: ['Lats', 'Explosive Power'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'B', prerequisites: ['wide_grip_pull_up'], unlockRequirements: { minSTR: 25, completionQuest: { exerciseId: 'wide_grip_pull_up', reps: 10, sets: 1 } } },
  { id: 'archer_pull_up', name: 'Archer Pull-up', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'B', prerequisites: ['chest_to_bar_pull_up'], unlockRequirements: { minSTR: 30, completionQuest: { exerciseId: 'chest_to_bar_pull_up', reps: 8, sets: 1 } } },
  { id: 'typewriter_pull_up', name: 'Typewriter Pull-up', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'B', prerequisites: ['archer_pull_up'], unlockRequirements: { minSTR: 30, completionQuest: { exerciseId: 'archer_pull_up', reps: 6, sets: 1 } } },
  { id: 'muscle_up_kipping', name: 'Muscle-up (Kipping)', category: 'Back', muscleGroups: ['Lats', 'Chest', 'Triceps'], exerciseType: 'skill_move', skillTreePath: 'Pull', skillTreeTier: 'A', prerequisites: ['chest_to_bar_pull_up'], unlockRequirements: { minSTR: 35, minAGI: 25, completionQuest: { exerciseId: 'chest_to_bar_pull_up', reps: 12, sets: 1 } } },
  { id: 'strict_muscle_up', name: 'Strict Muscle-up', category: 'Back', muscleGroups: ['Lats', 'Chest', 'Triceps'], exerciseType: 'skill_move', skillTreePath: 'Pull', skillTreeTier: 'A', prerequisites: ['muscle_up_kipping'], unlockRequirements: { minSTR: 45, completionQuest: { exerciseId: 'chest_to_bar_pull_up', reps: 15, sets: 1 } } },
  { id: 'one_arm_negative_pull_up', name: 'One-Arm Negative', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'bodyweight_rep', skillTreePath: 'Pull', skillTreeTier: 'A', prerequisites: ['archer_pull_up'], unlockRequirements: { minSTR: 40, completionQuest: { exerciseId: 'archer_pull_up', reps: 10, sets: 1 } } },
  { id: 'one_arm_pull_up', name: 'One-Arm Pull-up', category: 'Back', muscleGroups: ['Lats', 'Biceps'], exerciseType: 'skill_move', skillTreePath: 'Pull', skillTreeTier: 'S', prerequisites: ['one_arm_negative_pull_up'], unlockRequirements: { minSTR: 60, completionQuest: { exerciseId: 'one_arm_negative_pull_up', reps: 5, sets: 1 } } },
  { id: 'front_lever', name: 'Front Lever', category: 'Back', muscleGroups: ['Lats', 'Core'], exerciseType: 'skill_move', skillTreePath: 'Pull', skillTreeTier: 'S', prerequisites: ['lsit_pull_up'], unlockRequirements: { minSTR: 50, minAGI: 40, completionQuest: { exerciseId: 'lsit_pull_up', reps: 15, sets: 1 } } },
  { id: 'iron_cross', name: 'Iron Cross', category: 'Back', muscleGroups: ['Lats', 'Chest', 'Shoulders'], exerciseType: 'skill_move', skillTreePath: 'Pull', skillTreeTier: 'S', prerequisites: ['strict_muscle_up'], unlockRequirements: { minSTR: 70, minAGI: 50, completionQuest: { exerciseId: 'strict_muscle_up', reps: 5, sets: 1 } } },

  // --- CALISTHENICS: CORE PATH ---
  { id: 'dead_bug', name: 'Dead Bug', category: 'Core', muscleGroups: ['Core'], exerciseType: 'bodyweight_rep', skillTreePath: 'Core', skillTreeTier: 'E' },
  { id: 'hollow_body_hold', name: 'Hollow Body Hold', category: 'Core', muscleGroups: ['Core'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'E', prerequisites: ['dead_bug'], unlockRequirements: { completionQuest: { exerciseId: 'dead_bug', reps: 20, sets: 1 } } },
  { id: 'plank', name: 'Plank', category: 'Core', muscleGroups: ['Core'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'E' },
  { id: 'ab_wheel_kneeling', name: 'Ab Wheel (Kneeling)', category: 'Core', muscleGroups: ['Core'], exerciseType: 'bodyweight_rep', skillTreePath: 'Core', skillTreeTier: 'D', prerequisites: ['plank'], unlockRequirements: { completionQuest: { exerciseId: 'plank', durationSeconds: 60, sets: 1 } } },
  { id: 'hanging_knee_raise', name: 'Hanging Knee Raise', category: 'Core', muscleGroups: ['Core', 'Hip Flexors'], exerciseType: 'bodyweight_rep', skillTreePath: 'Core', skillTreeTier: 'D', prerequisites: ['dead_hang'], unlockRequirements: { completionQuest: { exerciseId: 'dead_hang', durationSeconds: 30, sets: 1 } } },
  { id: 'l_sit_parallel', name: 'L-Sit (Parallel Bars)', category: 'Core', muscleGroups: ['Core', 'Hip Flexors'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'D', prerequisites: ['hollow_body_hold'], unlockRequirements: { completionQuest: { exerciseId: 'hollow_body_hold', durationSeconds: 45, sets: 1 } } },
  { id: 'dragon_flag_negative', name: 'Dragon Flag Negative', category: 'Core', muscleGroups: ['Core'], exerciseType: 'bodyweight_rep', skillTreePath: 'Core', skillTreeTier: 'C', prerequisites: ['hollow_body_hold'], unlockRequirements: { minSTR: 15, completionQuest: { exerciseId: 'hollow_body_hold', durationSeconds: 60, sets: 1 } } },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', category: 'Core', muscleGroups: ['Core', 'Hip Flexors'], exerciseType: 'bodyweight_rep', skillTreePath: 'Core', skillTreeTier: 'C', prerequisites: ['hanging_knee_raise'], unlockRequirements: { completionQuest: { exerciseId: 'hanging_knee_raise', reps: 15, sets: 1 } } },
  { id: 'l_sit_floor', name: 'L-Sit (Floor)', category: 'Core', muscleGroups: ['Core', 'Hip Flexors', 'Triceps'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'C', prerequisites: ['l_sit_parallel'], unlockRequirements: { completionQuest: { exerciseId: 'l_sit_parallel', durationSeconds: 30, sets: 1 } } },
  { id: 'ab_wheel_standing', name: 'Ab Wheel (Standing)', category: 'Core', muscleGroups: ['Core', 'Lats'], exerciseType: 'bodyweight_rep', skillTreePath: 'Core', skillTreeTier: 'B', prerequisites: ['ab_wheel_kneeling'], unlockRequirements: { minSTR: 30, completionQuest: { exerciseId: 'ab_wheel_kneeling', reps: 15, sets: 1 } } },
  { id: 'v_sit', name: 'V-Sit', category: 'Core', muscleGroups: ['Core', 'Hip Flexors', 'Triceps'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'B', prerequisites: ['l_sit_floor'], unlockRequirements: { minAGI: 25, completionQuest: { exerciseId: 'l_sit_floor', durationSeconds: 20, sets: 1 } } },
  { id: 'dragon_flag', name: 'Dragon Flag', category: 'Core', muscleGroups: ['Core', 'Lats'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'B', prerequisites: ['dragon_flag_negative'], unlockRequirements: { minSTR: 30, completionQuest: { exerciseId: 'dragon_flag_negative', reps: 10, sets: 1 } } },
  { id: 'toes_to_bar', name: 'Toes-to-Bar', category: 'Core', muscleGroups: ['Core', 'Lats'], exerciseType: 'bodyweight_rep', skillTreePath: 'Core', skillTreeTier: 'A', prerequisites: ['hanging_leg_raise'], unlockRequirements: { minSTR: 35, completionQuest: { exerciseId: 'hanging_leg_raise', reps: 15, sets: 1 } } },
  { id: 'human_flag_supported', name: 'Human Flag (Supported)', category: 'Core', muscleGroups: ['Core', 'Obliques', 'Shoulders'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'A', prerequisites: ['dragon_flag'], unlockRequirements: { minSTR: 40, completionQuest: { exerciseId: 'dragon_flag', durationSeconds: 20, sets: 1 } } },
  { id: 'manna_progression', name: 'Manna Progression', category: 'Core', muscleGroups: ['Core', 'Triceps', 'Shoulders'], exerciseType: 'bodyweight_hold', skillTreePath: 'Core', skillTreeTier: 'A', prerequisites: ['v_sit'], unlockRequirements: { minSTR: 40, minAGI: 35, completionQuest: { exerciseId: 'v_sit', durationSeconds: 20, sets: 1 } } },
  { id: 'full_dragon_flag', name: 'Full Dragon Flag', category: 'Core', muscleGroups: ['Core', 'Lats'], exerciseType: 'skill_move', skillTreePath: 'Core', skillTreeTier: 'S', prerequisites: ['dragon_flag'], unlockRequirements: { minSTR: 50, completionQuest: { exerciseId: 'dragon_flag', durationSeconds: 30, sets: 1 } } },
  { id: 'human_flag', name: 'Human Flag', category: 'Core', muscleGroups: ['Core', 'Obliques', 'Shoulders', 'Lats'], exerciseType: 'skill_move', skillTreePath: 'Core', skillTreeTier: 'S', prerequisites: ['human_flag_supported'], unlockRequirements: { minSTR: 55, minAGI: 40, completionQuest: { exerciseId: 'human_flag_supported', durationSeconds: 20, sets: 1 } } },
  { id: 'manna', name: 'Manna', category: 'Core', muscleGroups: ['Core', 'Triceps', 'Shoulders'], exerciseType: 'skill_move', skillTreePath: 'Core', skillTreeTier: 'S', prerequisites: ['manna_progression'], unlockRequirements: { minSTR: 60, minAGI: 50, completionQuest: { exerciseId: 'manna_progression', durationSeconds: 15, sets: 1 } } },

  // --- CALISTHENICS: LEGS PATH ---
  { id: 'wall_sit', name: 'Wall Sit', category: 'Legs', muscleGroups: ['Quads'], exerciseType: 'bodyweight_hold', skillTreePath: 'Legs', skillTreeTier: 'E' },
  { id: 'bodyweight_squat', name: 'Bodyweight Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'E', prerequisites: ['wall_sit'], unlockRequirements: { completionQuest: { exerciseId: 'wall_sit', durationSeconds: 45, sets: 1 } } },
  { id: 'lunge', name: 'Lunge', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'E', prerequisites: ['bodyweight_squat'], unlockRequirements: { completionQuest: { exerciseId: 'bodyweight_squat', reps: 20, sets: 1 } } },
  { id: 'b_split_squat_bw', name: 'Bulgarian Split Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'D', prerequisites: ['lunge'], unlockRequirements: { completionQuest: { exerciseId: 'lunge', reps: 15, sets: 1 } } },
  { id: 'step_up', name: 'Step-up', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'D', prerequisites: ['lunge'], unlockRequirements: { completionQuest: { exerciseId: 'lunge', reps: 15, sets: 1 } } },
  { id: 'glute_bridge', name: 'Glute Bridge', category: 'Legs', muscleGroups: ['Glutes', 'Hamstrings'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'D' },
  { id: 'shrimp_squat_assisted', name: 'Shrimp Squat (Assisted)', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'C', prerequisites: ['b_split_squat_bw'], unlockRequirements: { minAGI: 15, completionQuest: { exerciseId: 'b_split_squat_bw', reps: 15, sets: 1 } } },
  { id: 'nordic_curl_negative', name: 'Nordic Curl (Negative)', category: 'Legs', muscleGroups: ['Hamstrings'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'C', prerequisites: ['glute_bridge'], unlockRequirements: { completionQuest: { exerciseId: 'glute_bridge', reps: 25, sets: 1 } } },
  { id: 'pistol_box', name: 'Pistol Squat (Box)', category: 'Legs', muscleGroups: ['Quads', 'Glutes', 'Balance'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'C', prerequisites: ['b_split_squat_bw'], unlockRequirements: { minAGI: 15, completionQuest: { exerciseId: 'b_split_squat_bw', reps: 20, sets: 1 } } },
  { id: 'pistol_squat', name: 'Pistol Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes', 'Balance'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'B', prerequisites: ['pistol_box'], unlockRequirements: { minSTR: 25, minAGI: 25, completionQuest: { exerciseId: 'pistol_box', reps: 10, sets: 1 } } },
  { id: 'nordic_curl', name: 'Nordic Curl', category: 'Legs', muscleGroups: ['Hamstrings'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'B', prerequisites: ['nordic_curl_negative'], unlockRequirements: { minSTR: 25, completionQuest: { exerciseId: 'nordic_curl_negative', reps: 8, sets: 1 } } },
  { id: 'single_leg_glute_bridge', name: 'Single-Leg Glute Bridge', category: 'Legs', muscleGroups: ['Glutes', 'Hamstrings'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'B', prerequisites: ['glute_bridge'], unlockRequirements: { completionQuest: { exerciseId: 'glute_bridge', reps: 30, sets: 1 } } },
  { id: 'weighted_pistol', name: 'Weighted Pistol', category: 'Legs', muscleGroups: ['Quads', 'Glutes', 'Balance'], exerciseType: 'weighted', skillTreePath: 'Legs', skillTreeTier: 'A', prerequisites: ['pistol_squat'], unlockRequirements: { minSTR: 35, completionQuest: { exerciseId: 'pistol_squat', reps: 10, sets: 1 } } },
  { id: 'shrimp_squat', name: 'Shrimp Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'A', prerequisites: ['shrimp_squat_assisted'], unlockRequirements: { minSTR: 30, minAGI: 25, completionQuest: { exerciseId: 'shrimp_squat_assisted', reps: 10, sets: 1 } } },
  { id: 'sissy_squat', name: 'Sissy Squat', category: 'Legs', muscleGroups: ['Quads'], exerciseType: 'bodyweight_rep', skillTreePath: 'Legs', skillTreeTier: 'A', prerequisites: ['bodyweight_squat'], unlockRequirements: { minAGI: 30, completionQuest: { exerciseId: 'bodyweight_squat', reps: 40, sets: 1 } } },
  { id: 'dragon_squat', name: 'Dragon Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes', 'Balance'], exerciseType: 'skill_move', skillTreePath: 'Legs', skillTreeTier: 'S', prerequisites: ['pistol_squat'], unlockRequirements: { minSTR: 45, minAGI: 50, completionQuest: { exerciseId: 'pistol_squat', reps: 15, sets: 1 } } },
  { id: 'full_nordic_curl', name: 'Full Nordic Curl', category: 'Legs', muscleGroups: ['Hamstrings'], exerciseType: 'skill_move', skillTreePath: 'Legs', skillTreeTier: 'S', prerequisites: ['nordic_curl'], unlockRequirements: { minSTR: 50, completionQuest: { exerciseId: 'nordic_curl', reps: 5, sets: 1 } } },
  { id: 'plyometric_pistol', name: 'Plyometric Pistol', category: 'Legs', muscleGroups: ['Quads', 'Explosive Power'], exerciseType: 'skill_move', skillTreePath: 'Legs', skillTreeTier: 'S', prerequisites: ['pistol_squat'], unlockRequirements: { minSTR: 55, minAGI: 45, completionQuest: { exerciseId: 'pistol_squat', reps: 12, sets: 1 } } },
];
