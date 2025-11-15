import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Location } from '../types';

const getClient = () => {
  if (!process.env.API_KEY) {
      throw new Error("Variável de ambiente API_KEY não definida");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const searchWithMaps = async (
  prompt: string, 
  location: Location | null
): Promise<GenerateContentResponse> => {
  const ai = getClient();
  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao buscar dados da API Gemini.");
  }
};

export const getAdditionalDetails = async (topic: string): Promise<string> => {
  const ai = getClient();
  try {
    const prompt = `Me conte alguns fatos interessantes, história ou detalhes únicos sobre "${topic}". Apresente de forma concisa e envolvente como markdown.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (getAdditionalDetails):", error);
    throw new Error("Falha ao buscar detalhes adicionais da API Gemini.");
  }
};