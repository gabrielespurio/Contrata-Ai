import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { formatLocationForDisplay, isGPSLocation, parseGPSCoordinates } from '@/lib/geocoding';

interface LocationDisplayProps {
  location: string;
  className?: string;
  showIcon?: boolean;
  showMapLink?: boolean;
}

export function LocationDisplay({ location, className = '', showIcon = true, showMapLink = false }: LocationDisplayProps) {
  const [formattedLocation, setFormattedLocation] = useState(location);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isGPSLocation(location)) {
      setIsLoading(true);
      formatLocationForDisplay(location)
        .then(formatted => {
          setFormattedLocation(formatted);
        })
        .catch(error => {
          console.error('Erro ao formatar localização:', error);
          setFormattedLocation(location);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setFormattedLocation(location);
    }
  }, [location]);

  const coordinates = parseGPSCoordinates(location);

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        {showIcon && <MapPin className="w-4 h-4 mr-2 text-gray-400" />}
        <span className="text-gray-500 animate-pulse">Carregando endereço...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <MapPin className="w-4 h-4 mr-2 text-gray-500" />}
      <div className="flex-1">
        <span className="text-gray-700">{formattedLocation}</span>
        {showMapLink && coordinates && (
          <div className="mt-1">
            <a
              href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              📍 Ver no Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}