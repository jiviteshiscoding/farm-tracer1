import React, { useState } from "react";
import { Store, QrCode, CheckCircle2, AlertTriangle, ShoppingBag, Layers } from "lucide-react";
import { Batch, UserProfile } from "../types";
import { saveBatch } from "../lib/db";
import { OfflineSyncManager } from "../lib/offlineSync";
import { BatchStatusBadge, VerificationBadge } from "../components/StatusBadge";

interface RetailerDashboardProps {
  user: UserProfile;
  batches: Batch[];
  onRefreshData: () => void;
  onSelectBatch: (id: string) => void;
  onOpenScanner: () => void;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({
  user,
  batches,
  onRefreshData,
  onSelectBatch,
  onOpenScanner,
}) => {
  const [successMsg, setSuccessMsg] = useState("");

  const retailerBatches = batches.filter(
    (b) => b.currentOwner === user.organization || b.currentStatus === "RETAIL" || b.currentStatus === "DISTRIBUTED"
  );

  const handleReceiveAtRetail = async (batch: Batch) => {
    batch.currentOwner = user.organization;
    batch.currentOwnerRole = "RETAILER";
    batch.currentStatus = "RETAIL";
    batch.updatedAt = new Date().toISOString();
    await saveBatch(batch);

    await OfflineSyncManager.recordEvent({
      id: `evt-ret-${Date.now()}`,
      batchId: batch.batchId,
      actorId: user.id,
      actorName: user.name,
      actorRole: "RETAILER",
      eventType: "RECEIVED_BY_RETAILER",
      timestamp: new Date().toISOString(),
      lat: 19.1983,
      lng: 72.9631,
      locationName: `${user.organization}, ${user.address}`,
      district: user.district || "Thane",
      state: user.state || "Maharashtra",
      notes: `Stocked on retail store shelf. Available for consumer QR scanning.`,
      eventHash: `hash-${Math.random().toString(36).substring(2, 12)}`,
      syncStatus: "PENDING",
    });

    setSuccessMsg(`Batch ${batch.batchId} status updated to "Available at Retail"!`);
    setTimeout(() => setSuccessMsg(""), 4000);
    onRefreshData();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider">
            <Store className="w-4 h-4 text-purple-600" /> Retail & Shelf Inventory
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">{user.organization}</h1>
          <p className="text-xs text-slate-500 font-medium">{user.name} • {user.district}, {user.state}</p>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5"
        >
          <QrCode className="w-4 h-4" /> Scan Delivered Shipment
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Retail Batches Inventory */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-600" /> Store Shelf Batches ({retailerBatches.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {retailerBatches.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 transition-all shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4
                    onClick={() => onSelectBatch(b.batchId)}
                    className="font-bold text-base text-slate-900 hover:text-purple-700 transition-colors cursor-pointer"
                  >
                    {b.productName}
                  </h4>
                  <p className="font-mono text-xs font-bold text-purple-700">{b.batchId}</p>
                </div>
                <BatchStatusBadge status={b.currentStatus} />
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>Quantity: <span className="text-slate-900 font-bold">{b.quantity} {b.unit}</span></p>
                <p>Origin Farmer: <span className="text-slate-800">{b.farmerName} ({b.district})</span></p>
                {b.expiryDate && (
                  <p>Expiry: <span className="text-amber-800 font-semibold">{new Date(b.expiryDate).toLocaleDateString()}</span></p>
                )}
              </div>

              {b.currentStatus !== "RETAIL" && (
                <button
                  onClick={() => handleReceiveAtRetail(b)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                >
                  Mark Received & Available on Store Shelf
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
