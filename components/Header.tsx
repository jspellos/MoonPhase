
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar } from 'lucide-react';

interface HeaderProps {
  location: string;
  date: Date;
  onLocationUpdate: (newLocation: string) => void;
  onDateUpdate: (newDate: Date) => void;
}

export const Header: React.FC<HeaderProps> = ({ location, date, onLocationUpdate, onDateUpdate }) => {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(location);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentLocation(location);
  }, [location]);

  useEffect(() => {
    if (isEditingLocation && locationInputRef.current) {
      locationInputRef.current.focus();
    }
  }, [isEditingLocation]);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLocation.trim()) {
      onLocationUpdate(currentLocation.trim());
    }
    setIsEditingLocation(false);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value + 'T00:00:00'); // Adjust for timezone issues
    onDateUpdate(selectedDate);
  };
  
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dateForInput = date.toISOString().split('T')[0];

  return (
    <header className="w-full text-center mb-4">
      <div 
        className="flex items-center justify-center gap-2 cursor-pointer group mb-2" 
        onClick={() => setIsEditingLocation(true)}
      >
        <MapPin className="text-cyan-400 group-hover:text-cyan-300 transition-colors" size={20} />
        {isEditingLocation ? (
          <form onSubmit={handleLocationSubmit} className="w-full">
            <input
              ref={locationInputRef}
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              onBlur={handleLocationSubmit}
              className="bg-transparent text-xl font-semibold text-gray-100 border-b-2 border-cyan-500 focus:outline-none w-full text-center"
            />
          </form>
        ) : (
          <h1 className="text-xl font-semibold text-gray-100 group-hover:text-white transition-colors">{location}</h1>
        )}
      </div>

      <div 
        className="flex items-center justify-center gap-2 cursor-pointer group relative"
        onClick={() => dateInputRef.current?.showPicker()}
      >
        <Calendar className="text-gray-400 group-hover:text-gray-300 transition-colors" size={16} />
        <p className="text-md text-gray-300 group-hover:text-gray-200 transition-colors">{formattedDate}</p>
        <input 
          ref={dateInputRef}
          type="date" 
          value={dateForInput}
          onChange={handleDateChange}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        />
      </div>
    </header>
  );
};
