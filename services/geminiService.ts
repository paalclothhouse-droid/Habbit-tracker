
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, AIInsight, UserProfile, AIPrediction } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Utility for exponential backoff retries to handle 429 Rate Limits
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.error?.code === 429;
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getAIHabitInsights = async (habits: Habit[]): Promise<AIInsight> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const habitsSummary = habits.map(h => ({
      name: h.name,
      streak: h.streak,
      completionRate: (h.logs.filter(l => l.completed).length / Math.max(h.logs.length, 1)) * 100
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these habits and provide a ruthless, tactical military-style insight. Be concise. Data: ${JSON.stringify(habitsSummary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            advice: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "advice", "confidence", "tags"]
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const predictFutureResults = async (user: UserProfile, habits: Habit[]): Promise<AIPrediction> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const history = habits.map(h => ({
      name: h.name,
      streak: h.streak,
      last7Days: h.logs.slice(-7).filter(l => l.completed).length
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict user progress in 30 days based on data. Use futuristic terms like 'Sync Rate', 'Optimization'. Data: ${JSON.stringify({user, history})}`,
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
  });
};

export const getMentorMotivation = async (user: UserProfile, habits: Habit[], prediction?: AIPrediction): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const context = { userName: user.name, habits: habits.map(h => ({ name: h.name, streak: h.streak })) };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a futuristic AI commander. Speak in short, cryptic, motivating bursts. Max 15 words. Context: ${JSON.stringify(context)}.`,
      config: { temperature: 0.8 }
    });
    return response.text?.replace(/["']/g, "") || "SYSTEM OPTIMAL. CONTINUE.";
  });
};

export const suggestNewHabit = async (goals: string): Promise<Partial<Habit>> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Goal: "${goals}". 
      NAME RULE: Use the EXACT word provided (e.g. "Running"). NO FLUFF.
      Return JSON. Color should be a hex code for a neon/tech color.`,
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
  });
};

export const askOracle = async (query: string, userContext: any): Promise<string> => {
  // Keeping this for compatibility but switching tone
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are Aura, a futuristic AI assistant. Answer this query with logic and precision. Keep it concise. Query: "${query}". Context: ${JSON.stringify(userContext)}`,
    });
    return response.text;
  });
};
