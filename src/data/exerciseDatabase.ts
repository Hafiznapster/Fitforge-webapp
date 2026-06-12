export interface ExerciseDefinition {
  name: string;
  category: string;
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  { name: 'Barbell Bench Press', category: 'Chest' },
  { name: 'Incline Dumbbell Press', category: 'Chest' },
  { name: 'Chest Flyes', category: 'Chest' },
  { name: 'Push-ups', category: 'Chest' },
  { name: 'Barbell Squat', category: 'Legs' },
  { name: 'Leg Press', category: 'Legs' },
  { name: 'Bulgarian Split Squat', category: 'Legs' },
  { name: 'Romanian Deadlift', category: 'Legs' },
  { name: 'Leg Extension', category: 'Legs' },
  { name: 'Leg Curl', category: 'Legs' },
  { name: 'Calf Raises', category: 'Legs' },
  { name: 'Deadlift', category: 'Back' },
  { name: 'Pull-ups', category: 'Back' },
  { name: 'Lat Pulldown', category: 'Back' },
  { name: 'Barbell Row', category: 'Back' },
  { name: 'Seated Cable Row', category: 'Back' },
  { name: 'Overhead Press', category: 'Shoulders' },
  { name: 'Lateral Raises', category: 'Shoulders' },
  { name: 'Front Raises', category: 'Shoulders' },
  { name: 'Face Pulls', category: 'Shoulders' },
  { name: 'Barbell Curl', category: 'Arms' },
  { name: 'Dumbbell Curl', category: 'Arms' },
  { name: 'Hammer Curl', category: 'Arms' },
  { name: 'Tricep Pushdown', category: 'Arms' },
  { name: 'Overhead Tricep Extension', category: 'Arms' },
  { name: 'Skull Crushers', category: 'Arms' },
  { name: 'Crunch', category: 'Core' },
  { name: 'Plank', category: 'Core' },
  { name: 'Leg Raises', category: 'Core' },
  { name: 'Russian Twists', category: 'Core' },
];
