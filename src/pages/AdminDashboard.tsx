import React from "react";
import { Settings, Server, Database, Activity, RefreshCw, Layers } from "lucide-react";
import { Batch, SupplyChainEvent } from "../types";

interface AdminDashboardProps {
  batches: Batch[];
  events: SupplyChainEvent[];
  pendingSyncCount: number;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  batches,
  events,
  pendingSyncCount,
  onRefreshData,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Settings className="w-4 h-4 text-emerald-600" /> System Control & Architecture
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">Platform Administrator Portal</h1>
        </div>

        <button
          onClick={onRefreshData}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Reload State
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Database className="w-6 h-6 text-emerald-600" />
          <h4 className="font-bold text-slate-500 text-xs uppercase">Total Batches Stored</h4>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">{batches.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h4 className="font-bold text-slate-500 text-xs uppercase">Immutable Log Events</h4>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">{events.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Server className="w-6 h-6 text-amber-600" />
          <h4 className="font-bold text-slate-500 text-xs uppercase">IndexedDB Offline Queue</h4>
          <p className="text-3xl font-extrabold text-amber-800 font-mono">{pendingSyncCount}</p>
        </div>
      </div>
    </div>
  );
};
