import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';

interface LiveMapProps {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export function LiveMap({
  latitude,
  longitude,
  accuracy,
  address,
  interactive = true,
  onLocationSelect,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([latitude, longitude], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 30px; height: 30px;">
            <div style="position: absolute; inset: 0; background-color: #E91E63; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; background-color: #E91E63; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 14px rgba(233,30,99,0.7); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
              📍
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      const circle = L.circle([latitude, longitude], {
        radius: Math.max(15, accuracy || 25),
        color: '#E91E63',
        fillColor: '#FF5C8A',
        fillOpacity: 0.18,
        weight: 1.5,
      }).addTo(map);
      circleRef.current = circle;

      if (onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      map.setView([latitude, longitude], map.getZoom() || 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([latitude, longitude]);
        circleRef.current.setRadius(Math.max(15, accuracy || 25));
      }
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [latitude, longitude, accuracy]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapInstanceRef.current?.setView([latitude, longitude], 17);
  };

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-inner border border-pink-200">
      <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-pink-100">
        <button
          onClick={handleRecenter}
          title="Re-center on Live Location"
          className="p-1.5 hover:bg-pink-50 rounded-lg text-pink-600 transition-colors cursor-pointer"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 hover:bg-pink-50 rounded-lg text-gray-700 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 hover:bg-pink-50 rounded-lg text-gray-700 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Address banner on map */}
      {address && (
        <div className="absolute bottom-3 left-3 right-16 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-pink-100 text-xs text-gray-800 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-pulse shrink-0"></span>
          <span className="truncate font-semibold">{address}</span>
        </div>
      )}
    </div>
  );
}
