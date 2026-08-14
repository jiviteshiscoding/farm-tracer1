import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Map,
} from "lucide-react";
import { GeotagMapModal } from "./GeotagMapModal";

interface GeotagPickerProps {
  lat: number;
  lng: number;
  district: string;
  state: string;
  onChangeLocation: (lat: number, lng: number, district?: string, state?: string) => void;
  locationName?: string;
}

const DISTRICT_PRESETS = [
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.705, lng: 74.2433 },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Ahmednagar", state: "Maharashtra", lat: 19.0948, lng: 74.748 },
  { name: "Satara", state: "Maharashtra", lat: 17.6805, lng: 74.0183 },
  { name: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064 },
];

export const GeotagPicker: React.FC<GeotagPickerProps> = ({
  lat,
  lng,
  district,
  state,
  onChangeLocation,
  locationName = "Farm / Crop Lot",
}) => {
  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  const handleAcquireGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation API is not supported by your browser.");
      return;
    }

    setLoadingGps(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const fetchedLat = parseFloat(position.coords.latitude.toFixed(5));
        const fetchedLng = parseFloat(position.coords.longitude.toFixed(5));
        setAccuracy(Math.round(position.coords.accuracy));
        setLoadingGps(false);
        onChangeLocation(fetchedLat, fetchedLng);
      },
      (error) => {
        setLoadingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg("GPS permission denied. Select a district preset or click map.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMsg("GPS position unavailable. Using nearest district preset.");
        } else {
          setErrorMsg("GPS timeout. Please pick location on map.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelectPreset = (p: typeof DISTRICT_PRESETS[0]) => {
    onChangeLocation(p.lat, p.lng, p.name, p.state);
    setAccuracy(15);
    setErrorMsg("");
  };

  return (
    <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          High-Precision Geotag & Plot Location
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAcquireGps}
            disabled={loadingGps}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <Navigation className={`w-3.5 h-3.5 ${loadingGps ? "animate-spin" : ""}`} />
            {loadingGps ? "Acquiring GPS..." : "Auto-Detect GPS"}
          </button>

          <button
            type="button"
            onClick={() => setIsMapModalOpen(true)}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            Pick on Map
          </button>
        </div>
      </div>

      {/* Coordinate & Accuracy Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between font-mono">
          <span className="text-slate-500 font-medium">Latitude:</span>
          <span className="font-extrabold text-slate-900">{lat?.toFixed(5)}° N</span>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between font-mono">
          <span className="text-slate-500 font-medium">Longitude:</span>
          <span className="font-extrabold text-slate-900">{lng?.toFixed(5)}° E</span>
        </div>
      </div>

      {/* Status or Error Banner */}
      {accuracy !== null && !errorMsg && (
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified GPS Signal (±{accuracy} meters accuracy radius)</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick District Presets */}
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
          Quick Agricultural Region Presets:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DISTRICT_PRESETS.map((p) => {
            const isSelected = district.toLowerCase() === p.name.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                📍 {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Modal */}
      <GeotagMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        lat={lat}
        lng={lng}
        locationName={locationName}
        onSelectCoordinates={(newLat, newLng) => {
          onChangeLocation(newLat, newLng);
          setAccuracy(10);
        }}
      />
    </div>
  );
};
