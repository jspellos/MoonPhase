import { GoogleGenAI, Type } from '@google/genai';
import type { MoonData, ApodData } from '../types';

// FIX: Per @google/genai guidelines, initialize directly with process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMoonData = async (location: string, date: Date): Promise<MoonData> => {
  const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Check if the location string is a lat/long pair to provide better context to the model.
  const isCoordinates = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.test(location);
  const locationDescription = isCoordinates
    ? `the geographic coordinates (latitude, longitude) "${location}"`
    : `the location "${location}"`;

  const prompt = `Using Google Search for accuracy, provide the moonrise, moonset, moon phase, and illumination percentage for ${locationDescription} on ${dateString}. Format the final answer as a single, clean JSON object with the following keys and value types:
- "moonrise": string (e.g., "8:30 PM" or "Not visible")
- "moonset": string (e.g., "7:15 AM" or "Not visible")
- "phase": string (e.g., "Waxing Crescent")
- "illumination": number (e.g., 15.3)`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Use Google Search for accurate, real-time data, which is required for this query.
        tools: [{googleSearch: {}}],
      },
    });

    let jsonString = response.text.trim();
    
    // The model might wrap the JSON in markdown backticks, so we need to extract it.
    const jsonMatch = jsonString.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[2]) {
      jsonString = jsonMatch[2];
    }

    const data = JSON.parse(jsonString) as MoonData;

    // Basic validation
    if (!data.phase || typeof data.illumination === 'undefined' || !data.moonrise || !data.moonset) {
        throw new Error("Invalid data structure received from API");
    }

    return data;
  } catch (error) {
    console.error("Error fetching moon data from Gemini with Search:", error);
    throw new Error("Failed to retrieve accurate moon data.");
  }
};

export const getApodData = async (): Promise<ApodData> => {
  const prompt = `Using Google Search, find a beautiful and awe-inspiring space photograph. Provide a title for the image, the direct URL for the media, the media type (which should be "image"), and a brief explanation. Format the final answer as a single, clean JSON object with the following keys:
- "title": string
- "url": string
- "media_type": string (should be "image")
- "explanation": string`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Use Google Search for robust image finding.
        tools: [{googleSearch: {}}],
      },
    });

    let jsonString = response.text.trim();
    
    // The model might wrap the JSON in markdown backticks, so we need to extract it.
    const jsonMatch = jsonString.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[2]) {
      jsonString = jsonMatch[2];
    }

    const data = JSON.parse(jsonString) as ApodData;

    if (!data.title || !data.url || !data.media_type) {
        throw new Error("Invalid APOD data structure received from API");
    }

    return data;
  } catch (error) {
    console.error("Error fetching space photo from Gemini with Search:", error);
    throw new Error("Failed to retrieve a space photograph.");
  }
};