"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to center map when coords change
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface LocationMapProps {
  lat: number;
  lng: number;
  radiusKm: number; // Max distance. 155 means "all over the country" but we can just hide circle
}

export default function LocationMap({ lat, lng, radiusKm }: LocationMapProps) {
  const position: [number, number] = [lat, lng];
  
  // Calculate zoom based on radius (rough estimate)
  // 5km ~ zoom 12, 20km ~ zoom 10, 50km ~ zoom 8
  const zoom = radiusKm <= 5 ? 12 : radiusKm <= 20 ? 10 : radiusKm <= 50 ? 9 : 7;

  return (
    <MapContainer 
      center={position} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      zoomControl={false} // We can hide default controls if we want a cleaner look
    >
      <ChangeView center={position} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>נקודת החיפוש שלך</Popup>
      </Marker>
      
      {radiusKm < 155 && (
        <Circle 
          center={position} 
          radius={radiusKm * 1000} // Leaflet takes radius in meters
          pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.15 }} // Purple theme
        />
      )}
    </MapContainer>
  );
}
