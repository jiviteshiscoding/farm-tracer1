import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, X, Check, ExternalLink, Navigation } from "lucide-react";

interface GeotagMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onSelectCoordinates: (lat: number, lng: number) => void;
  locationName?: string;
}

export const GeotagMapModal: React.FC<GeotagMapModalProps> = ({
  isOpen,
  onClose,
  lat,
  lng,
  onSelectCoordinates,
  locationName = "Selected Farm / Facility Location",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLat, setSelectedLat] = React.useState<number>(lat || 18.5204);
  const [selectedLng, setSelectedLng] = React.useState<number>(lng || 73.8567);

  useEffect(() => {
    if (lat) setSelectedLat(lat);
    if (lng) setSelectedLng(lng);
  }, [lat, lng]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Fix leaflet marker icon default paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([selectedLat, selectedLng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `<div style="background-color: #059669; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([selectedLat, selectedLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`<b>${locationName}</b><br/>Lat: ${selectedLat.toFixed(5)}, Lng: ${selectedLng.toFixed(5)}`).openPopup();

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        setSelectedLat(position.lat);
        setSelectedLng(position.lng);
        marker.setPopupContent(`<b>Selected Location</b><br/>Lat: ${position.lat.toFixed(5)}, Lng: ${position.lng.toFixed(5)}`).openPopup();
      });

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        setSelectedLat(clickLat);
        setSelectedLng(clickLng);
        marker.setLatLng([clickLat, clickLng]);
        marker.setPopupContent(`<b>Selected Location</b><br/>Lat: ${clickLat.toFixed(5)}, Lng: ${clickLng.toFixed(5)}`).openPopup();
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([selectedLat, selectedLng], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([selectedLat, selectedLng]);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, selectedLat, selectedLng]);

  if (!isOpen) return null;

  const handleConfirmLocation = () => {
    onSelectCoordinates(selectedLat, selectedLng);
    onClose();
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedLat},${selectedLng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-serif text-white">
                Interactive Geotag Location Map
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Click or drag pin to adjust exact plot or facility coordinates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative h-[340px] w-full bg-slate-100">
          <div ref={mapContainerRef} className="h-full w-full z-10" />

          {/* Coordinate Badge Overlay */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-2 rounded-xl shadow-md text-xs font-mono font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>
              Lat: {selectedLat.toFixed(5)}°, Lng: {selectedLng.toFixed(5)}°
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 font-bold hover:text-slate-900 flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-emerald-600" />
            Open in Google Maps
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLocation}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" /> Confirm Geotag Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
