
import React from 'react';
import type { ApodData } from '../types';
import { Video, ExternalLink } from 'lucide-react';

interface ApodCardProps {
  data: ApodData | null;
}

export const ApodCard: React.FC<ApodCardProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <a 
      href={data.url} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={`View details for ${data.title}`}
      className="block bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/50 overflow-hidden group hover:border-cyan-400/50 transition-colors duration-300"
    >
      <div className="relative w-full aspect-video bg-gray-700 flex items-center justify-center">
        {data.media_type === 'image' ? (
          <img src={data.url} alt={data.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <Video className="w-16 h-16 text-gray-400" />
        )}
        <div className="absolute top-2 right-2 p-2 bg-gray-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
            <ExternalLink size={16} className="text-white"/>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-cyan-400 uppercase tracking-wider font-semibold">Space History</p>
        <h3 className="text-md font-medium text-gray-100 leading-tight mt-1">{data.title}</h3>
        {data.explanation && (
            <p className="text-sm text-gray-300 mt-2 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {data.explanation}
            </p>
        )}
      </div>
    </a>
  );
};
