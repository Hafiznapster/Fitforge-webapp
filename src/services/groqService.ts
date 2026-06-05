import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // For personal app / demo purposes
});

const modelName = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const getCoachContext = (
  user: any, 
  diet: any, 
  workout: any, 
  savedPlan: any
) => {
  const workoutData = workout.exercises.map((ex: any) => 
    `${ex.name}: ${ex.sets.filter((s: any) => s.completed).length}/${ex.sets.length} sets done`
  ).join(', ');

  const dietData = `Calories: ${diet.meals.reduce((sum: any, m: any) => sum + m.calories, 0)}/${diet.targetCalories}, Protein: ${diet.meals.reduce((sum: any, m: any) => sum + m.protein, 0)}g/${diet.targetProtein}g`;

  return `
    You are the "Shadow Coach" - an elite AI fitness coach for a "Solo Leveling" themed fitness app called FitForge.
    Your tone is direct, motivational, slightly intense, and highly knowledgeable about hypertrophy, progressive overload, and biomechanics.
    Do not use overly flowery language. Speak to the user as a "Hunter".
    
    Current Hunter Context:
    - Name: ${user.name}
    - Level: ${user.level} (${user.rank}-Class ${user.playerClass})
    - Fitness Score (Chronic Load): ${user.fitnessScore}
    - Fatigue Score (Acute Load): ${user.fatigueScore}
    - Consistency Streak: ${user.streak} days
    
    Today's Diet:
    - ${dietData}
    - Hydration: ${diet.waterMl}ml
    
    Current Workout (Active Raid):
    - ${workout.activeWorkout || 'None currently active'}
    - Progress: ${workoutData || 'No exercises logged today'}
    
    Active Directive (AI Workout Plan):
    ${savedPlan ? 'The Hunter has an active 4-week training plan saved.' : 'No active plan saved yet.'}
    
    Respond concisely to their questions based on this exact data. If they ask about form, give specific cues. If they ask what they ate, tell them. If they ask about their workout, analyze their progress.
  `;
};

export const sendCoachMessage = async (messages: ChatMessage[]): Promise<string> => {
  if (!import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
    return "SYSTEM ERROR: API Key missing. Connection to Shadow Coach severed.";
  }

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.7,
      max_tokens: 512,
    });
    
    return completion.choices[0]?.message?.content || "No response generated.";
  } catch (error: any) {
    console.error("Groq chat error:", error);
    return "SYSTEM ERROR: Failed to connect to the Shadow Realm.";
  }
};
