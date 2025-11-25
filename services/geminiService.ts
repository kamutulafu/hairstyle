import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip data URI scheme
const stripBase64 = (dataUri: string): string => {
  return dataUri.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const getMimeType = (dataUri: string): string => {
  const match = dataUri.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

const LANGUAGE_NAMES: Record<Language, string> = {
  zh: 'Chinese (Simplified)',
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean'
};

export const analyzeFaceAndHair = async (imageBase64: string, language: Language = 'zh'): Promise<AnalysisResult> => {
  const mimeType = getMimeType(imageBase64);
  const cleanBase64 = stripBase64(imageBase64);
  const targetLanguage = LANGUAGE_NAMES[language];

  const prompt = `
    Analyze the person's face shape, skin tone, and key facial features in this image.
    Based on this analysis, suggest 3 specific hairstyle types that would suit them best.
    
    IMPORTANT: Provide the response completely in ${targetLanguage} language.

    Provide the output in JSON format with the following schema:
    {
      "faceShape": "string (e.g., Oval, Square, Heart) - localized in ${targetLanguage}",
      "features": "string (brief description of key features) - localized in ${targetLanguage}",
      "advice": "string (general advice on what to avoid or highlight) - localized in ${targetLanguage}",
      "suggestions": [
        { "name": "string (hairstyle name in ${targetLanguage})", "description": "string (brief reasoning in ${targetLanguage})", "suitability": "High" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            faceShape: { type: Type.STRING },
            features: { type: Type.STRING },
            advice: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suitability: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateHairstylePreview = async (
  originalImageBase64: string,
  hairstylePrompt: string
): Promise<string> => {
  const mimeType = getMimeType(originalImageBase64);
  const cleanBase64 = stripBase64(originalImageBase64);

  const prompt = `
    Edit this image to change the person's hairstyle to: ${hairstylePrompt}.
    IMPORTANT:
    1. Keep the person's face, skin tone, and lighting EXACTLY the same. ONLY change the hair.
    2. Make it look photorealistic.
    3. Ensure the hair blends naturally with the forehead and ears.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    // Check for image parts in the response
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  }
};