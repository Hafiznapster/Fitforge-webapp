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
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = diet.meals.filter((m: any) => m.date === today);
  const totalCalories = todayMeals.reduce((s: any, m: any) => s + m.calories, 0);
  const totalProtein = todayMeals.reduce((s: any, m: any) => s + m.protein, 0);
  
  const bwHistory = diet.bodyweightHistory || [];
  const bwTrend = bwHistory.length >= 2
    ? `Trend: ${bwHistory[0].weight}kg → ${bwHistory[bwHistory.length-1].weight}kg (${bwHistory.length} entries)`
    : bwHistory.length === 1 ? `Current: ${bwHistory[0].weight}kg` : 'No bodyweight data logged';
  
  const recentWorkouts = (workout.workoutHistory || []).slice(-5).map((w: any) => 
    `${new Date(w.date).toLocaleDateString()}: ${w.type} (${w.exercises.length} exercises)`
  ).join(', ') || 'No workout history yet';
  
  const activeWorkoutProgress = workout.activeWorkout 
    ? workout.exercises.map((ex: any) => 
        `${ex.name}: ${ex.sets.filter((s: any) => s.completed).length}/${ex.sets.length} sets done`
      ).join(', ')
    : null;

  const calisthenicsContext = user.unlockedSkills 
    ? `Unlocked Skills: ${user.unlockedSkills.length}. Skills include: ${user.unlockedSkills.slice(-5).join(', ')}...`
    : 'No calisthenics skills unlocked.';

  return `You are the "Shadow Coach" — an elite AI fitness coach for FitForge, a Solo Leveling-themed fitness app.
Tone: Direct, intense, highly knowledgeable about hypertrophy, progressive overload, biomechanics, and calisthenics progressions. Refer to the user as "Hunter".

=== HUNTER STATUS ===
Name: ${user.name || 'Hunter'}
Rank: ${user.rank}-Class ${user.playerClass || 'Fighter'} | Level ${user.level}
Streak: ${user.streak} days | Total Raids: ${(workout.workoutHistory || []).length}

=== STATS & CALISTHENICS ===
STR: ${user.stats?.STR || 10} | AGI: ${user.stats?.AGI || 10}
${calisthenicsContext}

=== BODY COMPOSITION ===
Bodyweight: ${bwTrend}

=== TODAY'S NUTRITION ===
Calories: ${totalCalories}/${diet.targetCalories} kcal
Protein: ${totalProtein}g / ${diet.targetProtein}g
Hydration: ${diet.waterMl}ml

=== CURRENT RAID ===
${workout.activeWorkout ? `Active: ${workout.activeWorkout}\nProgress: ${activeWorkoutProgress}` : 'No active raid.'}

=== RECENT HISTORY ===
${recentWorkouts}

=== ACTIVE DIRECTIVE ===
${savedPlan ? '4-week training plan is active and saved.' : 'No training plan set. Recommend generating one in Command Center.'}

Answer concisely based on this data. Proactively suggest calisthenics progressions if they are close to unlocking a skill. Be direct, no fluff.`;
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
