import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabaseClient';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

export const generateWorkoutPlan = async (userStats: any): Promise<GeneratedPlan> => {
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

    const prompt = `
    You are the FitForge Shadow Coach (an AI).
    User Stats: Rank ${userStats.rank}, Fitness ${userStats.fitnessScore}, Fatigue ${userStats.fatigueScore}.
    
    Hunter Profile Details:
    - Weight: ${profile.weight_kg} kg
    - Height: ${profile.height_cm} cm
    - BMI: ${profile.bmi}
    - Goal: ${profile.fitness_goal}
    - Intensity: ${profile.workout_intensity}
    - Frequency: ${profile.workout_frequency}
    - Supplements: ${(profile.supplements || []).join(', ')}
    - Previous Plan: ${profile.current_plan || 'None'}

    Based heavily on their Goal (${profile.fitness_goal}) and Frequency (${profile.workout_frequency}), generate a 4-week workout plan for this user.
    If Fatigue is > 10000, Week 1 should be a deload week.
    
    Output ONLY raw valid JSON matching this structure:
    {
      "weeks": [
        {
          "weekNumber": 1,
          "days": [
            {
              "day": 1,
              "type": "Push",
              "exercises": [
                { "name": "Bench Press", "sets": 3, "reps": "8-10" }
              ]
            }
          ]
        }
      ]
    }
    Generate exactly 4 weeks. Each week should have 7 days. Use reasonable rest days based on their frequency (${profile.workout_frequency}).
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

export const generateWeeklyReport = async (stats: any): Promise<string> => {
  try {
    const prompt = `
      Act as the FitForge Shadow Coach. Generate a highly motivational, short 2-3 sentence weekly report notification.
      User Stats: Rank ${stats.rank}, Level ${stats.level}, XP ${stats.xp}, Streak ${stats.streak} days.
      Style: Solo Leveling system prompt, dark, demanding but encouraging.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating report:", error);
    return "SYSTEM NOTIFICATION: Another week survived. Prepare for the next gate.";
  }
};
