
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, AIInsight, UserProfile, AIPrediction } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getAIHabitInsights = async (habits: Habit[]): Promise<AIInsight> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const habitsSummary = habits.map(h => ({
    name: h.name,
    category: h.category,
    streak: h.streak,
    completionRate: (h.logs.filter(l => l.completed).length / Math.max(h.logs.length, 1)) * 100
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these habits and provide a single powerful coaching insight: ${JSON.stringify(habitsSummary)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          advice: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          tags: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "advice", "confidence", "tags"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const predictFutureResults = async (user: UserProfile, habits: Habit[]): Promise<AIPrediction> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const history = habits.map(h => ({
    name: h.name,
    streak: h.streak,
    totalLogs: h.logs.length,
    last7Days: h.logs.slice(-7).filter(l => l.completed).length
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this habit history, predict the user's progress in 30 days: ${JSON.stringify({user, history})}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectedLevel: { type: Type.INTEGER },
          successProbability: { type: Type.NUMBER },
          nextMilestoneEstimate: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["projectedLevel", "successProbability", "nextMilestoneEstimate", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getMentorMotivation = async (user: UserProfile, habits: Habit[], prediction?: AIPrediction): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const context = {
    userName: user.name,
    level: user.level,
    xp: user.xp,
    habits: habits.map(h => ({ name: h.name, streak: h.streak })),
    prediction: prediction || "No prediction yet"
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are Aura, a blunt, high-discipline AI mentor who gives "Harsh Reality Checks". 
               Do not be sweet. Be brief, abrasive, and honest. 
               If their streaks are low, tell them they are failing their future self. 
               If they are doing well, tell them not to get comfortable.
               Speak directly to: ${JSON.stringify(context)}.
               Max 2 short sentences. Make it sting.`,
    config: {
      temperature: 1.0,
    }
  });

  return response.text || "Your discipline is lacking. Fix it or stay average.";
};

export const suggestNewHabit = async (goals: string): Promise<Partial<Habit>> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a high-impact habit for someone with these goals: ${goals}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          color: { type: Type.STRING }
        },
        required: ["name", "description", "category", "color"]
      }
    }
  });

  return JSON.parse(response.text);
};
