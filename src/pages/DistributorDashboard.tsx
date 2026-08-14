import React, { useState } from "react";
import {
  Truck,
  QrCode,
  CheckCircle2,
  Send,
  MapPin,
  Thermometer,
  Layers,
} from "lucide-react";
import { Batch, UserProfile, EventType } from "../types";
import { saveBatch } from "../lib/db";
import { OfflineSyncManager } from "../lib/offlineSync";
import { BatchStatusBadge } from "../components/StatusBadge";

interface DistributorDashboardProps {
  user: UserProfile;
  batches: Batch[];
  onRefreshData: () => void;
  onSelectBatch: (id: string) => void;
  onOpenScanner: () => void;
}

export const DistributorDashboard: React.FC<DistributorDashboardProps> = ({
  user,
  batches,
  onRefreshData,
  onSelectBatch,
  onOpenScanner,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [transferType, setTransferType] = useState<EventType>("DISTRIBUTED");
  const [receiverOrg, setReceiverOrg] = useState("NatureFresh Retail Supermarket");
  const [vehicleNo, setVehicleNo] = useState("MH-12-VT-9821 (Reefer Vehicle)");
  const [temperature, setTemperature] = useState<number>(4.2);
  const [humidity, setHumidity] = useState<number>(82);
  const [locationName, setLocationName] = useState(user.address || "Bhiwandi Central Logistics Hub");
  const [transferNotes, setTransferNotes] = useState("Refrigerated transit verified at 4.2°C. Cold chain unbroken.");
  const [successMsg, setSuccessMsg] = useState("");

  const activeBatches = batches.filter((b) => b.currentStatus !== "SOLD" && b.currentStatus !== "RECALLED");

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert("Please select a batch to update custody/location!");
      return;
    }

    const targetBatch = batches.find((b) => b.batchId === selectedBatchId || b.id === selectedBatchId);
    if (!targetBatch) return;

    // Update batch status and owner
    targetBatch.currentOwner = receiverOrg;
    targetBatch.currentOwnerRole = user.role;
    targetBatch.currentStatus = transferType === "DISTRIBUTED" ? "DISTRIBUTED" : "IN_TRANSIT";
    targetBatch.updatedAt = new Date().toISOString();
    await saveBatch(targetBatch);

    // Save Transfer Event in offline queue
    await OfflineSyncManager.recordEvent({
      id: `evt-tr-${Date.now()}`,
      batchId: targetBatch.batchId,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      eventType: transferType,
      timestamp: new Date().toISOString(),
      lat: 19.076,
      lng: 72.8777,
      locationName: locationName,
      district: user.district || "Thane",
      state: user.state || "Maharashtra",
      notes: `Custody update: ${transferType}. Vehicle: ${vehicleNo}. Notes: ${transferNotes}`,
      temperature,
      humidity,
      eventHash: `hash-${Math.random().toString(36).substring(2, 12)}`,
      syncStatus: "PENDING",
    });

    setSuccessMsg(`Custody event "${transferType}" logged successfully for batch ${targetBatch.batchId}!`);
    setTimeout(() => setSuccessMsg(""), 4000);
    onRefreshData();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-amber-600" /> Distribution & Cold Chain Logistics
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">{user.organization}</h1>
          <p className="text-xs text-slate-500 font-medium">{user.name} • {user.district}, {user.state}</p>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5"
        >
          <QrCode className="w-4 h-4" /> Scan Batch QR Code
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Custody Transfer Form */}
      <form onSubmit={handleTransferSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-600" /> Log Custody Event / Transit Dispatch
          </h3>
          <span className="text-xs text-slate-500 font-mono">Immutable Movement Record</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Active Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="">-- Choose Batch --</option>
              {activeBatches.map((b) => (
                <option key={b.id} value={b.batchId}>
                  {b.productName} ({b.batchId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Event Action Type</label>
            <select
              value={transferType}
              onChange={(e) => setTransferType(e.target.value as EventType)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="DISTRIBUTED">DISTRIBUTED (Handed to Retailer/Client)</option>
              <option value="IN_TRANSIT">IN TRANSIT (On Truck/Reefer)</option>
              <option value="WAREHOUSE_RECEIVED">WAREHOUSE RECEIVED</option>
              <option value="COLD_STORAGE">COLD STORAGE CHECK-IN</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Receiver Organization</label>
            <input
              type="text"
              required
              value={receiverOrg}
              onChange={(e) => setReceiverOrg(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Vehicle / Transit Ref</label>
            <input
              type="text"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Cold Storage Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Location / Hub Address</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Transit Notes</label>
          <textarea
            value={transferNotes}
            onChange={(e) => setTransferNotes(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-600/20 transition-all"
        >
          Record Custody Event & Sign Audit Log
        </button>
      </form>
    </div>
  );
};
