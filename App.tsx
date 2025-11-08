
import React, { useState, useEffect, useCallback } from 'react';
import type { MoonData, ApodData } from './types';
import { getMoonData, getApodData } from './services/geminiService';
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
  const [isLoadingMoonData, setIsLoadingMoonData] = useState<boolean>(true);
  const [isLoadingApodData, setIsLoadingApodData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoonData = useCallback(async (loc: string, dt: Date) => {
    setIsLoadingMoonData(true);
    setError(null);
    try {
      const data = await getMoonData(loc, dt);
      setMoonData(data);
    } catch (err) {
      setError('Could not fetch moon data. Please try a different location or date.');
      console.error(err);
    } finally {
      setIsLoadingMoonData(false);
    }
  }, []);

  const fetchApodData = useCallback(async () => {
    setIsLoadingApodData(true);
    try {
      const data = await getApodData();
      setApodData(data);
    } catch (err) {
      setError('Could not fetch Space History data.');
      console.error(err);
    } finally {
      setIsLoadingApodData(false);
    }
  }, []);

  useEffect(() => {
    fetchMoonData(location, date);
  }, [location, date, fetchMoonData]);

  useEffect(() => {
    fetchApodData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      }, (error) => {
        console.error("Geolocation error:", error);
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
          {isLoadingMoonData ? <Loader /> : error ? <div className="text-center text-red-400 p-8 bg-gray-800 rounded-lg">{error}</div> : <MoonDisplay data={moonData} />}
          <div className="mt-8">
            {isLoadingApodData ? <Loader /> : apodData && <ApodCard data={apodData} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
