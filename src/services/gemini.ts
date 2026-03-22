import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeMealText(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this meal description and provide estimated nutritional values: "${text}". 
    Return a JSON object with: name, calories (number), protein (number in grams), carbs (number in grams), fat (number in grams).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "carbs", "fat"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeMealPhoto(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: "Identify the food in this photo and estimate its nutritional values. Return a JSON object with: name, calories (number), protein (number in grams), carbs (number in grams), fat (number in grams).",
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(",")[1] || base64Image,
        },
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "carbs", "fat"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
