import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { SupplyChainEvent } from "../types";

interface SupplyChainMapProps {
  events: SupplyChainEvent[];
  isPublicView?: boolean;
}

export const SupplyChainMap: React.FC<SupplyChainMapProps> = ({
  events,
  isPublicView = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Filter events with valid Lat / Lng
    const validEvents = events.filter((e) => e.lat !== undefined && e.lng !== undefined);
    if (validEvents.length === 0) return;

    // Cleanup existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultLat = validEvents[0].lat || 18.5204;
    const defaultLng = validEvents[0].lng || 73.8567;

    const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 8);
    mapInstanceRef.current = map;

    // OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const latLngs: [number, number][] = [];

    validEvents.forEach((evt, idx) => {
      if (!evt.lat || !evt.lng) return;
      latLngs.push([evt.lat, evt.lng]);

      // Custom icon color based on event type
      let markerColor = "#10b981"; // Emerald
      if (evt.eventType === "HARVESTED" || evt.eventType === "COLLECTED") markerColor = "#16a34a";
      if (evt.eventType === "PROCESSED" || evt.eventType === "TRANSFORMED") markerColor = "#2563eb";
      if (evt.eventType === "IN_TRANSIT" || evt.eventType === "DISTRIBUTED") markerColor = "#d97706";
      if (evt.eventType === "RECEIVED_BY_RETAILER") markerColor = "#9333ea";
      if (evt.eventType === "RECALLED" || evt.eventType === "FLAGGED") markerColor = "#dc2626";

      const svgIcon = L.divIcon({
        className: "custom-map-pin",
        html: `<div style="background-color: ${markerColor}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">${
          idx + 1
        }</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const displayLocation = isPublicView && evt.eventType === "HARVESTED"
        ? `${evt.district} District, ${evt.state}`
        : `${evt.locationName}, ${evt.district}`;

      L.marker([evt.lat, evt.lng], { icon: svgIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 2px;">
            <strong style="color: #0f172a; font-size: 12px; font-weight: bold;">${evt.eventType}</strong><br/>
            <span style="font-size: 11px; color: #475569;">📍 ${displayLocation}</span><br/>
            <span style="font-size: 10px; color: #64748b;">👤 ${evt.actorName} (${evt.actorRole})</span><br/>
            <span style="font-size: 10px; color: #94a3b8;">📅 ${new Date(evt.timestamp).toLocaleString()}</span>
          </div>
        `);
    });

    // Draw route line
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: "#059669",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.8,
      }).addTo(map);

      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, isPublicView]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 font-medium">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          🗺️ Geolocation Supply Chain Map
        </span>
        <span className="text-[11px] text-emerald-700 font-mono font-bold">
          {events.filter((e) => e.lat && e.lng).length} Geocoded Checkpoints
        </span>
      </div>
      <div ref={mapContainerRef} className="w-full h-64 sm:h-80 z-0 bg-slate-100" />
    </div>
  );
};
