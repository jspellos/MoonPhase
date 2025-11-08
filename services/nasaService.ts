import type { ApodData } from '../types';

const NASA_API_KEY = 'DEMO_KEY'; // Use NASA's demo key
const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

export const getApodData = async (): Promise<ApodData> => {
  try {
    const response = await fetch(NASA_APOD_URL);
    if (!response.ok) {
      throw new Error(`NASA APOD API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return {
      title: data.title,
      url: data.thumbnail_url || data.url, // Prefer thumbnail if available
      media_type: data.media_type,
      // FIX: Add missing 'explanation' property to satisfy the ApodData type.
      explanation: data.explanation,
    };
  } catch (error) {
    console.error("Error fetching APOD data:", error);
    throw new Error("Failed to retrieve Astronomy Picture of the Day.");
  }
};
