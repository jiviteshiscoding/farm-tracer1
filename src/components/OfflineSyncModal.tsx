import React, { useEffect, useState } from "react";
import { X, RefreshCw, CheckCircle2, Wifi, WifiOff, Clock, Server, AlertTriangle } from "lucide-react";
import { SyncQueueItem } from "../types";
import { getSyncQueue } from "../lib/db";
import { OfflineSyncManager } from "../lib/offlineSync";

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  isOffline,
  onToggleOffline,
}) => {
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ syncedCount: number; errorsCount: number } | null>(null);

  const refreshQueue = async () => {
    const items = await getSyncQueue();
    setQueue(items);
  };

  useEffect(() => {
    if (isOpen) {
      refreshQueue();
      setSyncResult(null);
    }
  }, [isOpen]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await OfflineSyncManager.triggerSync();
      setSyncResult(result);
      await refreshQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl text-slate-900 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 text-emerald-600 ${isSyncing ? "animate-spin" : ""}`} />
            <h3 className="font-bold text-lg text-slate-900">Offline Event Synchronization</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Connection Mode Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isOffline ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {isOffline ? "Offline Mode Active" : "Online & Connected"}
                </p>
                <p className="text-xs text-slate-500">
                  {isOffline
                    ? "Events created now will be saved in IndexedDB."
                    : "Events automatically synchronize with Edge DB."}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleOffline}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
            >
              {isOffline ? "Go Online" : "Go Offline"}
            </button>
          </div>

          {/* Sync Result Banner */}
          {syncResult && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Successfully synchronized {syncResult.syncedCount} queued event(s).
              </span>
            </div>
          )}

          {/* Pending Queue List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pending Events in Local IndexedDB ({queue.length})
              </span>
              <button
                onClick={handleManualSync}
                disabled={isOffline || queue.length === 0 || isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Force Sync Queue"}
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">All local events are fully synchronized!</p>
                <p className="text-xs">No pending offline actions in the IndexedDB queue.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                          {item.event.eventType}
                        </span>
                        <span className="font-mono text-slate-800 font-bold">
                          {item.event.batchId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Created: {new Date(item.event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                      QUEUED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
