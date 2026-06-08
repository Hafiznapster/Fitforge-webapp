import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabaseClient';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: import.meta.env.VITE_GEMINI_FLASH_MODEL || "gemini-3.5-flash",
  generationConfig: { 
    responseMimeType: "application/json",
    maxOutputTokens: 8192,
    temperature: 0.2
  }
});

const textModel = genAI.getGenerativeModel({ 
  model: import.meta.env.VITE_GEMINI_FLASH_MODEL || "gemini-3.5-flash"
});

export interface GeneratedPlan {
  weeks: {
    weekNumber: number;
    days: {
      day: number;
      type: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
      }[];
    }[];
  }[];
}

export const generateWorkoutPlan = async (userStats: any, currentWeight?: number): Promise<GeneratedPlan> => {
  try {
    let profile;
    const isGuest = localStorage.getItem('fitforge_guest') === 'true';

    if (!isGuest) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user.");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      profile = data;
    } else {
      const stored = localStorage.getItem('fitforge_guest_profile');
      if (stored) {
        profile = JSON.parse(stored);
      } else {
        throw new Error("No guest profile found. Please complete initialization.");
      }
    }

    const weightToUse = currentWeight || profile.weight_kg;
    const height = profile.height_cm;

    const prompt = `
    You are the FitForge Shadow Coach (an AI).
    User Stats: Rank ${userStats.rank}, Fitness ${userStats.fitnessScore}, Fatigue ${userStats.fatigueScore}.
    
    Hunter Profile Details:
    - Current Weight: ${weightToUse} kg
    - Height: ${height} cm
    - Goal: ${profile.fitness_goal}
    - Intensity: ${profile.workout_intensity}
    - Frequency: ${profile.workout_frequency}
    - Supplements: ${(profile.supplements || []).join(', ')}

    CRITICAL INSTRUCTION: You MUST generate a COMPLETE 4-week workout plan. 
    You MUST output exactly 4 weeks. Each week MUST contain exactly 7 days (Days 1 through 7).
    DO NOT use placeholders. DO NOT stop early. If a day is a rest day, provide "Rest" as the type and an empty exercises array.
    Provide realistic, detailed exercises (4-6 per workout day) with sets and reps.
    
    Output ONLY raw valid JSON matching this exact structure:
    {
      "weeks": [
        {
          "weekNumber": 1,
          "days": [
            {
              "day": 1,
              "type": "Push",
              "exercises": [
                { "name": "Barbell Bench Press", "sets": 4, "reps": "8-10" }
              ]
            }
            // ... MUST include days 1 through 7
          ]
        }
        // ... MUST include weeks 1 through 4
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean markdown blocks if any
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate plan");
  }
};

export const generateWeeklyReport = async (stats: any, bodyweightHistory?: any[]): Promise<string> => {
  try {
    const bwContext = bodyweightHistory && bodyweightHistory.length >= 2 
      ? `Bodyweight Trend: Went from ${bodyweightHistory[0].weight}kg to ${bodyweightHistory[bodyweightHistory.length - 1].weight}kg.` 
      : `Current Bodyweight: ${bodyweightHistory?.[bodyweightHistory.length - 1]?.weight || 'Unknown'}kg.`;

    const prompt = `
      Act as the FitForge Shadow Coach. Generate a highly motivational, short 2-3 sentence weekly report notification.
      User Stats: Rank ${stats.rank}, Level ${stats.level}, XP ${stats.xp}, Streak ${stats.streak} days.
      ${bwContext}
      Style: Solo Leveling system prompt, dark, demanding but encouraging.
    `;
    
    const result = await textModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating report:", error);
    return "SYSTEM NOTIFICATION: Another week survived. Prepare for the next gate.";
  }
};
