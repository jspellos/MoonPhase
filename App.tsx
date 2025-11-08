
import React, { useState, useEffect } from 'react';
import type { MoonData, ApodData } from './types';
import { getMoonData, getSpacePhotograph } from './services/geminiService';
import { Header } from './components/Header';
import { MoonDisplay } from './components/MoonDisplay';
import { ApodCard } from './components/ApodCard';
import { Loader } from './components/Loader';
import { MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [location, setLocation] = useState<string>('Queens, NY');
  const [date, setDate] = useState<Date>(new Date());
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch core moon data first for a fast initial load.
  useEffect(() => {
    const fetchCoreData = async () => {
      setIsLoading(true);
      setError(null);
      setMoonData(null);
      setApodData(null); // Clear both on new request

      try {
        const moonResult = await getMoonData(location, date);
        setMoonData(moonResult);
      } catch (err) {
        setError('Could not fetch astronomical data. Please try a different location or date.');
        console.error(err);
        setMoonData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoreData();
  }, [location, date]);
  
  // Fetch the secondary data (APOD) after the core data has loaded successfully.
  useEffect(() => {
    if (moonData) { // Only fetch if core data loaded
        const fetchImageData = async () => {
            try {
                const apodResult = await getSpacePhotograph(date);
                setApodData({ ...apodResult, media_type: 'image' });
            } catch (err) {
                console.error("Failed to fetch space photograph:", err);
                setApodData(null); // Ensure it's null on failure
            }
        };
        fetchImageData();
    }
  }, [moonData, date]);


  const handleLocationUpdate = (newLocation: string) => {
    setLocation(newLocation);
  };

  const handleDateUpdate = (newDate: Date) => {
    setDate(newDate);
  };
  
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        // Gemini can understand coordinates
        setLocation(`${latitude}, ${longitude}`);
      }, (geoError) => {
        console.error("Geolocation error:", geoError);
        setError("Could not get current location. Please enable location services.");
      });
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-8 tracking-wide">
          MoonPhase
        </h1>
        <Header 
          location={location} 
          date={date} 
          onLocationUpdate={handleLocationUpdate} 
          onDateUpdate={handleDateUpdate} 
        />
        <button 
          onClick={handleUseCurrentLocation}
          className="w-full flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200 mt-2 mb-6"
        >
          <MapPin size={16} /> Use My Current Location
        </button>

        <main className="flex-grow w-full">
          {isLoading ? <Loader /> : error ? <div className="text-center text-red-400 p-8 bg-gray-800 rounded-lg">{error}</div> : (
            <>
              <MoonDisplay data={moonData} />
              <div className="mt-8">
                {/* APOD card will render once its data is fetched, or show nothing */}
                <ApodCard data={apodData} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
