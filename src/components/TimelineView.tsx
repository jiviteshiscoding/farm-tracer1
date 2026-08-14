import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Thermometer,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertOctagon,
  Image as ImageIcon,
} from "lucide-react";
import { SupplyChainEvent } from "../types";

interface TimelineViewProps {
  events: SupplyChainEvent[];
  isPublicView?: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  isPublicView = false,
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "HARVESTED":
      case "COLLECTED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "QUALITY_CHECK":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "PROCESSED":
      case "TRANSFORMED":
      case "PACKAGED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "IN_TRANSIT":
      case "DISTRIBUTED":
      case "PICKED_UP":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "RECEIVED_BY_RETAILER":
      case "SOLD":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "RECALLED":
      case "FLAGGED":
        return "bg-rose-100 text-rose-800 border-rose-300 animate-pulse";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          Verified Supply-Chain Event Timeline ({events.length})
        </h3>
        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Immutable-Style Event Log
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-slate-300">
        {events.map((evt, idx) => {
          const isExpanded = expandedEventId === evt.id;
          const isWarning = evt.eventType === "RECALLED" || evt.eventType === "FLAGGED";

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Marker Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs border-2 ${
                  isWarning
                    ? "bg-rose-600 text-white border-rose-300 animate-ping"
                    : "bg-white text-emerald-700 border-emerald-600"
                }`}
              >
                {isWarning ? "!" : idx + 1}
              </div>

              {/* Event Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${getEventBadgeColor(
                          evt.eventType
                        )}`}
                      >
                        {evt.eventType.replace(/_/g, " ")}
                      </span>
                      {evt.syncStatus === "SYNCED" && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> VERIFIED
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      {isPublicView && evt.eventType === "HARVESTED"
                        ? `${evt.district} District, ${evt.state} (Exact Farm Protected)`
                        : `${evt.locationName}, ${evt.district}`}
                    </p>

                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {evt.actorName} ({evt.actorRole})
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-700 font-semibold">
                      {new Date(evt.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Temperature / Humidity Indicators if applicable */}
                {evt.temperature !== undefined && (
                  <div className="mt-3 flex items-center gap-3 text-xs bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                    <span className="flex items-center gap-1 font-mono font-bold text-amber-800">
                      <Thermometer className="w-4 h-4 text-amber-600" /> Temp: {evt.temperature}°C
                    </span>
                    {evt.humidity !== undefined && (
                      <span className="text-amber-700 font-mono">
                        Humidity: {evt.humidity}%
                      </span>
                    )}
                  </div>
                )}

                {/* Event Notes */}
                {evt.notes && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl italic border border-slate-100">
                    "{evt.notes}"
                  </p>
                )}

                {/* Photos if attached */}
                {evt.photos && evt.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {evt.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt="Event evidence"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                      />
                    ))}
                  </div>
                )}

                {/* Expand cryptographic hash details */}
                <button
                  onClick={() => toggleExpand(evt.id)}
                  className="mt-3 text-[11px] text-emerald-700 hover:text-emerald-800 font-mono flex items-center gap-1 transition-colors font-medium"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isExpanded ? "Hide Tamper-Evident Security Hash" : "View Cryptographic Verification Signature"}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl text-[10px] font-mono text-slate-600 space-y-1 border border-slate-200 animate-fade-in">
                    <div>
                      <span className="text-slate-400">Event ID:</span> {evt.id}
                    </div>
                    <div>
                      <span className="text-slate-400">Event Hash:</span>{" "}
                      <span className="text-emerald-700 font-bold">{evt.eventHash}</span>
                    </div>
                    {evt.idempotencyKey && (
                      <div>
                        <span className="text-slate-400">Idempotency Key:</span> {evt.idempotencyKey}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
