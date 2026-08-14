import React, { useState } from "react";
import {
  PlusCircle,
  QrCode,
  MapPin,
  CheckCircle2,
  Sparkles,
  Camera,
  Layers,
  Sprout,
  Download,
  AlertCircle,
  Printer,
} from "lucide-react";
import { Batch, ProductCategory, UserProfile } from "../types";
import { generateQRCodeDataUrl } from "../lib/qrGenerator";
import { verifyProductImageWithAI } from "../services/geminiService";
import { saveBatch, saveEvent } from "../lib/db";
import { OfflineSyncManager } from "../lib/offlineSync";
import { BatchStatusBadge, VerificationBadge } from "../components/StatusBadge";
import { GeotagPicker } from "../components/GeotagPicker";

interface FarmerDashboardProps {
  user: UserProfile;
  batches: Batch[];
  onRefreshData: () => void;
  onSelectBatch: (id: string) => void;
  onOpenPrintModal?: (batch: Batch) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  user,
  batches,
  onRefreshData,
  onSelectBatch,
  onOpenPrintModal,
}) => {
  const [activeTab, setActiveTab] = useState<"CREATE" | "MY_BATCHES">("CREATE");

  // Create Batch Form States
  const [productName, setProductName] = useState("Fresh Red Organic Tomatoes");
  const [category, setCategory] = useState<ProductCategory>("VEGETABLES");
  const [variety, setVariety] = useState("Hybrid Sona");
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<"KG" | "TONS" | "LITERS" | "BOXES">("KG");
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [district, setDistrict] = useState(user.district || "Pune");
  const [state, setState] = useState(user.state || "Maharashtra");
  const [farmLocation, setFarmLocation] = useState(user.address || "Khed Agro Farm");
  const [lat, setLat] = useState<number>(18.8471);
  const [lng, setLng] = useState<number>(73.8962);
  const [qualityGrade, setQualityGrade] = useState<"ORGANIC" | "A+" | "A" | "STANDARD">("ORGANIC");
  const [notes, setNotes] = useState("Fresh harvest recorded under certified organic practices.");
  const [imagePreview, setImagePreview] = useState<string>(
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
  );

  // AI Visual Verification state
  const [aiCheckResult, setAiCheckResult] = useState<any | null>(null);
  const [aiChecking, setAiChecking] = useState(false);
  const [createdBatch, setCreatedBatch] = useState<Batch | null>(null);
  const [createdQr, setCreatedQr] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      // Run Gemini Image Visual Audit
      setAiChecking(true);
      verifyProductImageWithAI(base64, productName, category)
        .then((res) => setAiCheckResult(res))
        .finally(() => setAiChecking(false));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate unique Batch ID format: FT-IN-MH-PUN-YYYYMMDD-XXXXXX
    const dateStr = new Date().toISOString().replace(/-/g, "").substring(0, 8);
    const stateShort = state.substring(0, 2).toUpperCase();
    const distShort = district.substring(0, 3).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const batchId = `FT-IN-${stateShort}-${distShort}-${dateStr}-${randomHex}`;

    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      batchId,
      productName,
      category,
      variety,
      quantity,
      unit,
      harvestDate: new Date(harvestDate).toISOString(),
      productionDate: new Date().toISOString(),
      farmLocation,
      lat,
      lng,
      district,
      state,
      farmerName: user.name,
      farmerOrg: user.organization,
      createdBy: user.id,
      currentOwner: user.name,
      currentOwnerRole: "FARMER",
      currentStatus: "HARVESTED",
      verificationStatus: "VERIFIED",
      parentBatchIds: [],
      childBatchIds: [],
      qualityGrade,
      photos: imagePreview ? [imagePreview] : [],
      notes,
      fssaiLicence: user.fssaiNumber || "FSSAI-APPLIED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save batch locally in IndexedDB
    await saveBatch(newBatch);

    // Record initial Harvest Event in offline queue
    await OfflineSyncManager.recordEvent({
      id: `evt-harvest-${Date.now()}`,
      batchId,
      actorId: user.id,
      actorName: user.name,
      actorRole: "FARMER",
      eventType: "HARVESTED",
      timestamp: new Date().toISOString(),
      lat,
      lng,
      locationName: farmLocation,
      district,
      state,
      notes: `Harvest created: ${quantity} ${unit} of ${productName}. ${notes}`,
      photos: imagePreview ? [imagePreview] : [],
      eventHash: `hash-${Math.random().toString(36).substring(2, 12)}`,
      syncStatus: "PENDING",
    });

    const qr = await generateQRCodeDataUrl(batchId);
    setCreatedBatch(newBatch);
    setCreatedQr(qr);
    onRefreshData();
  };

  const farmerBatches = batches.filter((b) => b.createdBy === user.id || b.farmerName === user.name);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Sprout className="w-4 h-4 text-emerald-600" /> Farmer Module
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif">{user.organization}</h1>
          <p className="text-xs text-slate-500 font-medium">{user.name} • {user.district}, {user.state}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("CREATE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "CREATE"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            + Create Batch
          </button>
          <button
            onClick={() => setActiveTab("MY_BATCHES")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "MY_BATCHES"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            My Active Batches ({farmerBatches.length})
          </button>
        </div>
      </div>

      {activeTab === "CREATE" ? (
        <div className="space-y-6">
          {createdBatch ? (
            /* Created Success Screen & QR Printing Card */
            <div className="p-6 bg-white border-2 border-emerald-500 rounded-3xl text-slate-900 shadow-sm space-y-6 text-center animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div>
                <h3 className="text-xl font-extrabold font-serif text-slate-900">
                  Batch Created & Digitally Recorded!
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Offline event saved in IndexedDB and queued for synchronization.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-2xs mx-auto">
                {createdQr && <img src={createdQr} alt="QR Code" className="w-48 h-48 mx-auto" />}
                <p className="font-mono text-xs text-slate-900 font-bold mt-2">
                  {createdBatch.batchId}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {onOpenPrintModal && (
                  <button
                    onClick={() => onOpenPrintModal(createdBatch)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print & Format Label Sticker
                  </button>
                )}

                <a
                  href={createdQr}
                  download={`QR-${createdBatch.batchId}.png`}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-700" /> Download PNG
                </a>

                <button
                  onClick={() => {
                    setCreatedBatch(null);
                    setCreatedQr("");
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200"
                >
                  Create Another Batch
                </button>
              </div>
            </div>
          ) : (
            /* Create Batch Form */
            <form onSubmit={handleCreateBatch} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" /> Create Raw Crop Batch
                </h3>
                <span className="text-xs text-slate-500 font-mono">Dynamic Product Schema</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="VEGETABLES">Vegetables</option>
                    <option value="FRUITS">Fruits</option>
                    <option value="MILK">Milk / Dairy</option>
                    <option value="GRAINS">Grains / Cereals</option>
                    <option value="CROPS">Crops / Spices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Variety / Type</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantity & Unit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                      className="w-2/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-1/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="KG">KG</option>
                      <option value="TONS">TONS</option>
                      <option value="LITERS">LITERS</option>
                      <option value="BOXES">BOXES</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="ORGANIC">Certified Organic</option>
                    <option value="A+">Grade A+ Premium</option>
                    <option value="A">Grade A</option>
                    <option value="STANDARD">Standard Grade</option>
                  </select>
                </div>
              </div>

              {/* Enhanced GPS Geotag Component */}
              <GeotagPicker
                lat={lat}
                lng={lng}
                district={district}
                state={state}
                locationName={farmLocation}
                onChangeLocation={(newLat, newLng, newDistrict, newState) => {
                  setLat(newLat);
                  setLng(newLng);
                  if (newDistrict) setDistrict(newDistrict);
                  if (newState) setState(newState);
                }}
              />

              {/* Upload Photo & Gemini AI Visual Inspection */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Attach Photo & Run Gemini Visual Quality Audit
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Crop photo preview"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                    />
                  )}
                  <div className="space-y-2 text-xs flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white cursor-pointer"
                    />
                    {aiChecking && (
                      <p className="text-amber-700 text-xs font-medium animate-pulse flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Gemini AI analyzing photo...
                      </p>
                    )}
                    {aiCheckResult && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                        <p className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AI Visual Audit: {aiCheckResult.matchStatus} ({aiCheckResult.confidenceScore}% confidence)
                        </p>
                        <p className="text-[11px] text-slate-600">{aiCheckResult.observations}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all"
              >
                Issue Digital Batch ID & Generate QR Code
              </button>
            </form>
          )}
        </div>
      ) : (
        /* My Batches Tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {farmerBatches.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition-all shadow-2xs space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div
                  onClick={() => onSelectBatch(b.batchId)}
                  className="cursor-pointer"
                >
                  <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {b.productName}
                  </h4>
                  <p className="font-mono text-xs font-bold text-emerald-700">{b.batchId}</p>
                </div>
                <BatchStatusBadge status={b.currentStatus} />
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>Quantity: <span className="text-slate-900 font-bold">{b.quantity} {b.unit}</span></p>
                <p>Location: <span className="text-slate-800">{b.district}, {b.state}</span></p>
                <p>Created: <span className="text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</span></p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectBatch(b.batchId)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Inspect Trace
                </button>

                {onOpenPrintModal && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPrintModal(b);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-600" /> Print QR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

