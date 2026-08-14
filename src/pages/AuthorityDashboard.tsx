import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Download,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  BarChart2,
} from "lucide-react";
import { Batch, RecallNotice, RiskAlert, SupplyChainEvent } from "../types";
import { saveBatch, saveRecall, saveEvent } from "../lib/db";
import { OfflineSyncManager } from "../lib/offlineSync";
import { BatchStatusBadge, VerificationBadge } from "../components/StatusBadge";

interface AuthorityDashboardProps {
  batches: Batch[];
  recalls: RecallNotice[];
  risks: RiskAlert[];
  events: SupplyChainEvent[];
  onRefreshData: () => void;
  onSelectBatch: (id: string) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  batches,
  recalls,
  risks,
  events,
  onRefreshData,
  onSelectBatch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [selectedRecallBatchId, setSelectedRecallBatchId] = useState("");
  const [recallReason, setRecallReason] = useState(
    "FSSAI Regional Quality Inspection: Microbial count exceeded permitted safety threshold."
  );
  const [recallSuccess, setRecallSuccess] = useState("");

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === "ALL" || b.state === filterState;
    const matchesCategory = filterCategory === "ALL" || b.category === filterCategory;
    return matchesSearch && matchesState && matchesCategory;
  });

  // Recursive function to find all descendant child batches for a recall
  const findAllDescendants = (startBatchId: string, visited = new Set<string>()): string[] => {
    if (visited.has(startBatchId)) return [];
    visited.add(startBatchId);

    const b = batches.find((x) => x.batchId === startBatchId || x.id === startBatchId);
    if (!b || !b.childBatchIds || b.childBatchIds.length === 0) return Array.from(visited);

    for (const childId of b.childBatchIds) {
      findAllDescendants(childId, visited);
    }
    return Array.from(visited);
  };

  const handleIssueRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecallBatchId) {
      alert("Please select a batch to recall!");
      return;
    }

    const affectedBatchIds = findAllDescendants(selectedRecallBatchId);

    // Save recall notice
    const newRecall: RecallNotice = {
      id: `recall-${Date.now()}`,
      batchId: selectedRecallBatchId,
      reason: recallReason,
      severity: "CRITICAL",
      authorityId: "auth-fssai-01",
      authorityName: "FSSAI Western Region Inspection Division",
      issuedAt: new Date().toISOString(),
      affectedDescendantBatchIds: affectedBatchIds,
      active: true,
    };
    await saveRecall(newRecall);

    // Mark root and all descendant batches as RECALLED
    for (const bId of affectedBatchIds) {
      const b = batches.find((x) => x.batchId === bId || x.id === bId);
      if (b) {
        b.verificationStatus = "RECALLED";
        b.currentStatus = "RECALLED";
        b.updatedAt = new Date().toISOString();
        await saveBatch(b);

        await OfflineSyncManager.recordEvent({
          id: `evt-recall-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          batchId: b.batchId,
          actorId: "auth-fssai-01",
          actorName: "FSSAI Inspector",
          actorRole: "AUTHORITY",
          eventType: "RECALLED",
          timestamp: new Date().toISOString(),
          lat: 19.076,
          lng: 72.8777,
          locationName: "FSSAI Quarantine Registry",
          district: b.district,
          state: b.state,
          notes: `OFFICIAL FOOD SAFETY RECALL: ${recallReason}`,
          eventHash: `hash-${Math.random().toString(36).substring(2, 12)}`,
          syncStatus: "PENDING",
        });
      }
    }

    setRecallSuccess(
      `RECALL ISSUED: Identified and quarantined ${affectedBatchIds.length} batch(es) across supply chain graph!`
    );
    setTimeout(() => setRecallSuccess(""), 5000);
    onRefreshData();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["Batch ID", "Product Name", "Category", "Quantity", "Unit", "Farmer", "District", "State", "Status", "Verification"],
      ...filteredBatches.map((b) => [
        b.batchId,
        `"${b.productName}"`,
        b.category,
        b.quantity,
        b.unit,
        `"${b.farmerName}"`,
        b.district,
        b.state,
        b.currentStatus,
        b.verificationStatus,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FSSAI_Audit_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Food Safety Authority & Inspection Portal
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
            FSSAI Regulatory Oversight Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Regional Monitoring • Recalls • Anomaly Detection • FSSAI Audit Readiness
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4" /> Export FSSAI Audit Report (CSV)
        </button>
      </div>

      {recallSuccess && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {recallSuccess}
        </div>
      )}

      {/* Anomaly & Suspicious Activity Risk Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            AI & Rule-Based Suspicious Activity Risk Alerts ({risks.length})
          </h3>
          <span className="text-xs text-amber-800 font-mono bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
            Automatic Anomaly Detection Engine
          </span>
        </div>

        <div className="space-y-3">
          {risks.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectBatch(r.batchId)}
              className="p-4 rounded-2xl bg-slate-50 border border-amber-200 hover:border-amber-400 text-xs text-slate-800 space-y-2 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-800 font-mono">{r.batchId}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                  {r.riskLevel} RISK
                </span>
              </div>
              <p className="text-slate-700 font-medium">{r.flagReason}</p>
              <p className="text-[10px] text-slate-500">Detected: {new Date(r.detectedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Recall Modal Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" /> Issue Official Batch Recall & Recursive DAG Quarantine
          </h3>
          <span className="text-xs text-rose-700 font-mono font-bold">FSSAI Protocol</span>
        </div>

        <form onSubmit={handleIssueRecall} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Contaminated Batch</label>
              <select
                value={selectedRecallBatchId}
                onChange={(e) => setSelectedRecallBatchId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
              >
                <option value="">-- Choose Batch to Recall --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.batchId}>
                    {b.productName} ({b.batchId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Reason for Recall</label>
              <input
                type="text"
                required
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/20 transition-all"
          >
            Issue Emergency Recall & Flag All Downstream Derived Products
          </button>
        </form>
      </div>

      {/* Regional Batches Audit Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" /> Regional Supply Chain Audit Inventory ({filteredBatches.length})
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Batch ID, Product, District..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Batch ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Farmer / Org</th>
                <th className="p-3">Region</th>
                <th className="p-3">Status</th>
                <th className="p-3">Verification</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono text-emerald-700 font-bold">{b.batchId}</td>
                  <td className="p-3 font-semibold text-slate-900">{b.productName}</td>
                  <td className="p-3">{b.farmerName}</td>
                  <td className="p-3">{b.district}, {b.state}</td>
                  <td className="p-3"><BatchStatusBadge status={b.currentStatus} /></td>
                  <td className="p-3"><VerificationBadge status={b.verificationStatus} /></td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectBatch(b.batchId)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                    >
                      Inspect Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
