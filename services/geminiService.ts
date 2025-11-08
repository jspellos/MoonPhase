
import { GoogleGenAI } from '@google/genai';
import type { MoonData, ApodData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A robust JSON parser that handles markdown code blocks.
 * @param text The text response from the model.
 * @returns A parsed JSON object.
 */
const parseJsonResponse = (text: string) => {
  // The model may return JSON wrapped in ```json ... ```
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonText = match ? match[1] : text;
  try {
    return JSON.parse(jsonText);
  } catch(e) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("Invalid JSON format from model.");
  }
};

/**
 * Converts a location name (e.g., "Queens, NY") into precise coordinates.
 */
const getCoordinatesForLocation = async (location: string): Promise<{ lat: number; lng: number }> => {
  const prompt = `Your task is to act as a geocoding service. Convert the following location name into precise latitude and longitude coordinates.
Location: "${location}"
Your output must be ONLY a raw JSON object in the format: {"lat": ..., "lng": ...}.
Do not add any other text or explanation. If the location is invalid or cannot be found, return {"lat": null, "lng": null}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0 },
    });

    const coords = parseJsonResponse(response.text);
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      throw new Error(`Could not find valid coordinates for "${location}".`);
    }
    return coords;
  } catch (error) {
    console.error(`Error geocoding location "${location}":`, error);
    throw new Error(`Failed to find coordinates for "${location}". Please try a more specific location.`);
  }
};


/**
 * Fetches moon data for a precise set of coordinates.
 */
const fetchMoonDataForCoords = async (lat: number, lng: number, date: Date): Promise<MoonData> => {
    const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `Your task is to act as a precise astronomical data fetcher. You must use Google Search to query the website timeanddate.com for the geographic coordinates (latitude: ${lat}, longitude: ${lng}) on the date ${dateString}.
From the timeanddate.com search result, you MUST extract the following exact values:
1. Moonrise time (in HH:MM AM/PM format)
2. Moonset time (in HH:MM AM/PM format)
3. Moon phase name (e.g., "Waxing Gibbous")
4. Illumination percentage (as a number)

If a value does not exist for that day (for example, the moon does not set or rise), you must use the string "N/A".

Your final output must be ONLY the raw JSON object containing this data. Do not add any conversational text, explanations, or markdown formatting. The format MUST be:
{"moonrise": "...", "moonset": "...", "phase": "...", "illumination": ...}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0,
      },
    });

    const data = parseJsonResponse(response.text);

    if (
      typeof data.moonrise !== 'string' ||
      typeof data.moonset !== 'string' ||
      typeof data.phase !== 'string' ||
      typeof data.illumination !== 'number'
    ) {
        console.error('Validation failed for moon data:', data);
        throw new Error('Invalid or incomplete moon data structure received.');
    }

    return data as MoonData;
  } catch (error) {
    console.error("Error fetching moon data for coordinates:", error);
    throw new Error("Failed to retrieve accurate moon data from source.");
  }
}

/**
 * Gets accurate moon data. It first geocodes a location string to precise
 * coordinates, then fetches the moon data for those coordinates.
 */
export const getMoonData = async (location: string, date: Date): Promise<MoonData> => {
  let lat: number, lng: number;
  const isCoordinates = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/.test(location);

  if (isCoordinates) {
      const parts = location.split(',').map(Number);
      lat = parts[0];
      lng = parts[1];
  } else {
      const coords = await getCoordinatesForLocation(location);
      lat = coords.lat;
      lng = coords.lng;
  }

  return fetchMoonDataForCoords(lat, lng, date);
};


/**
 * Gets a space photograph and accompanying data.
 */
export const getSpacePhotograph = async (date: Date): Promise<Omit<ApodData, 'media_type'>> => {
  const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const prompt = `Find a beautiful, high-quality, public domain space photograph with a title and brief explanation, relevant for the date ${dateString}. Respond ONLY with a single, raw JSON object in the format: {"title": "...", "url": "...", "explanation": "..."}. The URL must be a direct link to an image file (e.g., .jpg, .png) and MUST start with "https://".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use faster model for better performance
      contents: prompt,
    });
    
    return parseJsonResponse(response.text);

  } catch (error) {
    console.error("Error fetching space photograph:", error);
    throw new Error("Failed to retrieve space photograph.");
  }
};
