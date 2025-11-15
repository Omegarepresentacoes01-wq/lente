
import React from 'react';

interface MapDisplayProps {
  placeTitle: string;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ placeTitle }) => {
  if (!placeTitle) {
    return null;
  }

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    placeTitle
  )}&output=embed&z=15`;

  return (
    <div className="w-full h-80 md:h-full rounded-lg overflow-hidden shadow-lg border border-gray-300 dark:border-gray-700">
      <iframe
        src={mapSrc}
        className="w-full h-full"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Mapa de ${placeTitle}`}
      ></iframe>
    </div>
  );
};