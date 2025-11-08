import { GoogleGenAI, Type } from '@google/genai';
import type { MoonData, ApodData } from '../types';

// FIX: Per @google/genai guidelines, initialize directly with process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const moonDataSchema = {
  type: Type.OBJECT,
  properties: {
    moonrise: {
      type: Type.STRING,
      description: 'The time of moonrise in a "HH:MM AM/PM" format. If it does not rise, return "Not visible".',
    },
    moonset: {
      type: Type.STRING,
      description: 'The time of moonset in a "HH:MM AM/PM" format. If it does not set, return "Not visible".',
    },
    phase: {
      type: Type.STRING,
      description: 'The name of the moon phase (e.g., "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent").',
    },
    illumination: {
      type: Type.NUMBER,
      description: 'The percentage of the moon that is illuminated, as a number from 0 to 100.',
    },
  },
  required: ['moonrise', 'moonset', 'phase', 'illumination'],
};

const apodDataSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'The title of the NASA Astronomy Picture of the Day (APOD).',
        },
        url: {
            type: Type.STRING,
            description: 'The URL of the image or video for the APOD. If it is an image, provide the standard or HD URL. If it is a video, provide the URL to the video source (e.g., a YouTube link).',
        },
        media_type: {
            type: Type.STRING,
            description: 'The type of media, either "image" or "video".',
        },
        explanation: {
            type: Type.STRING,
            description: 'A brief explanation of the Astronomy Picture of the Day.',
        }
    },
    required: ['title', 'url', 'media_type', 'explanation'],
};

export const getMoonData = async (location: string, date: Date): Promise<MoonData> => {
  const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const prompt = `Using Google Search for accuracy, provide the moonrise, moonset, moon phase, and illumination percentage for "${location}" on ${dateString}. Format the final answer as a single, clean JSON object with the following keys and value types:
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
  const prompt = `What is the NASA Astronomy Picture of the Day (APOD) for today? Provide the title, URL for the media, the media type (image or video), and a brief explanation.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: apodDataSchema,
      },
    });

    const jsonString = response.text.trim();
    const data = JSON.parse(jsonString) as ApodData;

    if (!data.title || !data.url || !data.media_type) {
        throw new Error("Invalid APOD data structure received from API");
    }

    return data;
  } catch (error) {
    console.error("Error fetching APOD data from Gemini:", error);
    throw new Error("Failed to retrieve Astronomy Picture of the Day.");
  }
};