import React, { useState } from "react";
import {
  Factory,
  QrCode,
  GitBranch,
  CheckCircle2,
  Download,
  PlusCircle,
  Package,
  Printer,
} from "lucide-react";
import { Batch, UserProfile, ProductCategory } from "../types";
import { generateQRCodeDataUrl } from "../lib/qrGenerator";
import { saveBatch, saveEvent, saveLineage } from "../lib/db";
import { OfflineSyncManager } from "../lib/offlineSync";
import { BatchStatusBadge } from "../components/StatusBadge";

interface ProcessorDashboardProps {
  user: UserProfile;
  batches: Batch[];
  onRefreshData: () => void;
  onSelectBatch: (id: string) => void;
  onOpenScanner: () => void;
  onOpenPrintModal?: (batch: Batch) => void;
}

export const ProcessorDashboard: React.FC<ProcessorDashboardProps> = ({
  user,
  batches,
  onRefreshData,
  onSelectBatch,
  onOpenScanner,
  onOpenPrintModal,
}) => {
  const [selectedParentBatchIds, setSelectedParentBatchIds] = useState<string[]>([]);
  const [outputName, setOutputName] = useState("Organic Pasteurized Tomato Puree 500g");
  const [outputCategory, setOutputCategory] = useState<ProductCategory>("PROCESSED_FOOD");
  const [outputQuantity, setOutputQuantity] = useState<number>(1000);
  const [outputUnit, setOutputUnit] = useState<"PACKETS" | "BOXES" | "LITERS" | "KG">("PACKETS");
  const [expiryDays, setExpiryDays] = useState<number>(180);
  const [facilityLocation, setFacilityLocation] = useState(user.address || "Sahyadri Processing Unit, MIDC Bhosari");
  const [processingNotes, setProcessingNotes] = useState("Thermal processing at 92°C for 30s. Hermetically vacuum sealed.");

  const [createdBatch, setCreatedBatch] = useState<Batch | null>(null);
  const [createdQr, setCreatedQr] = useState<string>("");

  const rawAvailableBatches = batches.filter(
    (b) => b.currentStatus !== "EXPIRED" && b.currentStatus !== "RECALLED"
  );

  const toggleParentSelect = (batchId: string) => {
    if (selectedParentBatchIds.includes(batchId)) {
      setSelectedParentBatchIds(selectedParentBatchIds.filter((id) => id !== batchId));
    } else {
      setSelectedParentBatchIds([...selectedParentBatchIds, batchId]);
    }
  };

  const handleTransform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParentBatchIds.length === 0) {
      alert("Please select at least one input raw batch to transform!");
      return;
    }

    const dateStr = new Date().toISOString().replace(/-/g, "").substring(0, 8);
    const distShort = (user.district || "MUM").substring(0, 3).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const childBatchId = `FT-IN-MH-${distShort}-${dateStr}-${randomHex}`;

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + expiryDays);

    const newChildBatch: Batch = {
      id: `batch-${Date.now()}`,
      batchId: childBatchId,
      productName: outputName,
      category: outputCategory,
      variety: "Processed Food Product",
      quantity: outputQuantity,
      unit: outputUnit,
      productionDate: new Date().toISOString(),
      expiryDate: expDate.toISOString(),
      farmLocation: facilityLocation,
      lat: 18.6298,
      lng: 73.8326,
      district: user.district || "Pune",
      state: user.state || "Maharashtra",
      farmerName: `${user.name} (${user.organization})`,
      createdBy: user.id,
      currentOwner: user.organization,
      currentOwnerRole: "PROCESSOR",
      currentStatus: "PACKAGED",
      verificationStatus: "VERIFIED",
      parentBatchIds: selectedParentBatchIds,
      childBatchIds: [],
      qualityGrade: "A+",
      photos: ["https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80"],
      notes: processingNotes,
      fssaiLicence: user.fssaiNumber || "FSSAI-10019022009812",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save batch
    await saveBatch(newChildBatch);

    // Save Lineage Links for each parent
    for (const parentId of selectedParentBatchIds) {
      const pBatch = batches.find((b) => b.batchId === parentId || b.id === parentId);
      if (pBatch) {
        // Update parent's childBatchIds
        pBatch.childBatchIds = [...(pBatch.childBatchIds || []), childBatchId];
        await saveBatch(pBatch);

        await saveLineage({
          id: `lin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          parentBatchId: pBatch.batchId,
          childBatchId: childBatchId,
          relationshipType: "TRANSFORM",
          quantityUsed: pBatch.quantity,
          unit: pBatch.unit,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Save Processing Event in offline queue
    await OfflineSyncManager.recordEvent({
      id: `evt-proc-${Date.now()}`,
      batchId: childBatchId,
      actorId: user.id,
      actorName: user.name,
      actorRole: "PROCESSOR",
      eventType: "PROCESSED",
      timestamp: new Date().toISOString(),
      lat: 18.6298,
      lng: 73.8326,
      locationName: facilityLocation,
      district: user.district || "Pune",
      state: user.state || "Maharashtra",
      notes: `Transformed ${selectedParentBatchIds.length} input raw batch(es) into ${outputQuantity} ${outputUnit} of ${outputName}. ${processingNotes}`,
      eventHash: `hash-${Math.random().toString(36).substring(2, 12)}`,
      syncStatus: "PENDING",
    });

    const qr = await generateQRCodeDataUrl(childBatchId);
    setCreatedBatch(newChildBatch);
    setCreatedQr(qr);
    onRefreshData();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
            <Factory className="w-4 h-4 text-blue-600" /> Processing & Transformation Hub
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">{user.organization}</h1>
          <p className="text-xs text-slate-500 font-medium">{user.name} • FSSAI: {user.fssaiNumber}</p>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5"
        >
          <QrCode className="w-4 h-4" /> Scan Incoming Raw Batch
        </button>
      </div>

      {createdBatch ? (
        /* Transformation Success Card */
        <div className="p-6 bg-white border-2 border-blue-500 rounded-3xl text-slate-900 shadow-sm space-y-6 text-center animate-fade-in">
          <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto" />
          <div>
            <h3 className="text-xl font-extrabold font-serif text-slate-900">
              Derived Processed Batch Issued & Linked!
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Parent-child graph lineage recorded for consumer traceability.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-2xs mx-auto">
            {createdQr && <img src={createdQr} alt="Derived QR Code" className="w-48 h-48 mx-auto" />}
            <p className="font-mono text-xs text-slate-900 font-bold mt-2">
              {createdBatch.batchId}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {onOpenPrintModal && (
              <button
                onClick={() => onOpenPrintModal(createdBatch)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Format & Print Product Label Sticker
              </button>
            )}

            <a
              href={createdQr}
              download={`QR-${createdBatch.batchId}.png`}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-700" /> Download PNG
            </a>

            <button
              onClick={() => {
                setCreatedBatch(null);
                setCreatedQr("");
                setSelectedParentBatchIds([]);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200"
            >
              Process Another Batch
            </button>
          </div>
        </div>
      ) : (
        /* Transformation Form */
        <form onSubmit={handleTransform} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" /> Link Input Batches & Create Derived Product
            </h3>
            <span className="text-xs text-slate-500 font-mono">DAG Graph Transformation</span>
          </div>

          {/* Select Input Parent Batches */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Input Parent Raw Batches ({selectedParentBatchIds.length} Selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {rawAvailableBatches.map((b) => {
                const isSelected = selectedParentBatchIds.includes(b.batchId);
                return (
                  <div
                    key={b.id}
                    onClick={() => toggleParentSelect(b.batchId)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50 border-blue-400 text-blue-900 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{b.productName}</p>
                      <p className="font-mono text-[10px] text-blue-700 font-bold">{b.batchId}</p>
                      <p className="text-[10px] text-slate-500">Qty: {b.quantity} {b.unit}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] ${
                      isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected ? "✓" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Derived Output Product Details */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. New Processed Output Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Output Product Name</label>
                <input
                  type="text"
                  required
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantity & Packaging Unit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min={1}
                    value={outputQuantity}
                    onChange={(e) => setOutputQuantity(parseFloat(e.target.value) || 0)}
                    className="w-2/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <select
                    value={outputUnit}
                    onChange={(e) => setOutputUnit(e.target.value as any)}
                    className="w-1/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="PACKETS">PACKETS</option>
                    <option value="BOXES">BOXES</option>
                    <option value="LITERS">LITERS</option>
                    <option value="KG">KG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expected Shelf Life (Days)</label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Processing Facility Address</label>
                <input
                  type="text"
                  value={facilityLocation}
                  onChange={(e) => setFacilityLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Processing Notes / Quality Standards</label>
              <textarea
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all"
          >
            Create Derived Processed Batch & Store DAG Lineage
          </button>
        </form>
      )}
    </div>
  );
};

