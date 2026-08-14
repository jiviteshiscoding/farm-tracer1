import React, { useEffect, useState } from "react";
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  Share2,
  Download,
  Building,
  Award,
  FileCheck,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Batch, SupplyChainEvent, BatchLineage } from "../types";
import { getBatchByBatchId, getEventsByBatchId, getAllBatches, getAllLineage } from "../lib/db";
import { TimelineView } from "../components/TimelineView";
import { SupplyChainMap } from "../components/SupplyChainMap";
import { LineageGraph } from "../components/LineageGraph";
import { BatchStatusBadge, VerificationBadge } from "../components/StatusBadge";
import { fetchAITraceSummary } from "../services/geminiService";
import { generateQRCodeDataUrl } from "../lib/qrGenerator";

interface PublicTracePageProps {
  batchId: string;
  onNavigateHome: () => void;
  onSelectBatch: (id: string) => void;
}

export const PublicTracePage: React.FC<PublicTracePageProps> = ({
  batchId,
  onNavigateHome,
  onSelectBatch,
}) => {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [lineage, setLineage] = useState<BatchLineage[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    async function loadTraceData() {
      setLoading(true);
      const b = await getBatchByBatchId(batchId);
      if (b) {
        setBatch(b);
        const evts = await getEventsByBatchId(b.batchId);
        setEvents(evts);

        const batches = await getAllBatches();
        setAllBatches(batches);

        const l = await getAllLineage();
        setLineage(l);

        // Generate QR Data URL
        const qr = await generateQRCodeDataUrl(b.batchId);
        setQrDataUrl(qr);

        // Fetch Gemini AI Summary
        setAiLoading(true);
        fetchAITraceSummary(b, evts)
          .then((sum) => setAiSummary(sum))
          .finally(() => setAiLoading(false));
      }
      setLoading(false);
    }

    loadTraceData();
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Retrieving Verifiable Batch Traceability Record...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-bold text-lg text-slate-900">Batch Record Not Found</h3>
        <p className="text-xs text-slate-500">
          No active traceability record matches ID: <span className="font-mono text-amber-700 font-bold">{batchId}</span>.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const isRecalled = batch.verificationStatus === "RECALLED" || batch.currentStatus === "RECALLED";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>

        <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
          Public Traceability Portal
        </span>
      </div>

      {/* Recall Warning Banner */}
      {isRecalled && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-900 shadow-sm space-y-2 animate-pulse">
          <div className="flex items-center gap-2 font-black text-lg text-rose-800">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            CRITICAL FOOD RECALL WARNING
          </div>
          <p className="text-xs leading-relaxed text-rose-800 font-semibold">
            THIS BATCH HAS BEEN RECALLED BY FOOD SAFETY AUTHORITIES. DO NOT CONSUME OR DISTRIBUTE THIS PRODUCT.
          </p>
        </div>
      )}

      {/* Main Product Overview Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge status={batch.verificationStatus} />
              <BatchStatusBadge status={batch.currentStatus} />
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-emerald-800 uppercase border border-slate-200">
                {batch.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              {batch.productName}
            </h1>

            <p className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-2">
              <span>Batch ID: {batch.batchId}</span>
            </p>
          </div>

          {/* QR Code Container */}
          {qrDataUrl && (
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0 flex flex-col items-center gap-1">
              <img src={qrDataUrl} alt="Batch QR Code" className="w-24 h-24" />
              <span className="text-[9px] font-mono text-slate-600 font-bold">Scan to Verify</span>
            </div>
          )}
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Origin Region
            </span>
            <span className="font-bold text-slate-900 block">
              {batch.district} District, {batch.state}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-600" /> Farmer / Origin
            </span>
            <span className="font-bold text-slate-900 block truncate">
              {batch.farmerName}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Harvest / Mfg Date
            </span>
            <span className="font-bold text-slate-900 block">
              {new Date(batch.harvestDate || batch.productionDate).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Quality Grade / FSSAI
            </span>
            <span className="font-bold text-emerald-700 block">
              {batch.qualityGrade || "Standard Grade"}
            </span>
            {batch.fssaiLicence && (
              <span className="text-[10px] text-slate-500 font-mono block">
                {batch.fssaiLicence}
              </span>
            )}
          </div>
        </div>

        {/* Gemini AI Trace Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600" />
            AI Verified Journey Summary (Gemini)
          </div>
          {aiLoading ? (
            <p className="text-xs text-slate-500 italic flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> Analyzing supply chain timeline...
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              "{aiSummary}"
            </p>
          )}
        </div>
      </div>

      {/* Geolocation Map */}
      <SupplyChainMap events={events} isPublicView={true} />

      {/* Event Timeline */}
      <TimelineView events={events} isPublicView={true} />

      {/* Graph Lineage */}
      <LineageGraph
        currentBatch={batch}
        allBatches={allBatches}
        lineageLinks={lineage}
        onSelectBatch={onSelectBatch}
      />
    </div>
  );
};
