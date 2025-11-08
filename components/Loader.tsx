
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-8 h-8 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>
    </div>
  );
};
