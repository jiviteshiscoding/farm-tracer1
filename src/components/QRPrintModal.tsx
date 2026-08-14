import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  X,
  MapPin,
  Calendar,
  ShieldCheck,
  Tag,
  Share2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Batch } from "../types";
import { generateQRCodeDataUrl } from "../lib/qrGenerator";

interface QRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
}

type LabelFormat = "THERMAL_STICKER" | "SHIPPING_TAG" | "RETAIL_BADGE";

export const QRPrintModal: React.FC<QRPrintModalProps> = ({
  isOpen,
  onClose,
  batch,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [labelFormat, setLabelFormat] = useState<LabelFormat>("THERMAL_STICKER");
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (batch?.batchId) {
      generateQRCodeDataUrl(batch.batchId).then((dataUrl) => {
        setQrDataUrl(dataUrl);
      });
    }
  }, [batch?.batchId]);

  if (!isOpen || !batch) return null;

  const traceUrl = `${window.location.origin}/trace/${batch.batchId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(traceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-${batch.batchId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 print:border-0 print:shadow-none print:max-w-none print:rounded-none">
        {/* Modal Header - Hidden during print */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-serif text-white flex items-center gap-2">
                Digital Traceability QR Code & Label Printer
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                {batch.batchId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar - Hidden during print */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold print:hidden">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Label Format:</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setLabelFormat("THERMAL_STICKER")}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                labelFormat === "THERMAL_STICKER"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Thermal Sticker (3" x 2")
            </button>

            <button
              onClick={() => setLabelFormat("RETAIL_BADGE")}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                labelFormat === "RETAIL_BADGE"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              FSSAI Retail Label
            </button>

            <button
              onClick={() => setLabelFormat("SHIPPING_TAG")}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                labelFormat === "SHIPPING_TAG"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Crate / Transit Shipping Tag
            </button>
          </div>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 bg-slate-100/60 flex items-center justify-center print:bg-white print:p-0">
          <div
            ref={labelRef}
            className={`bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-md w-full max-w-md space-y-4 print:border-2 print:border-black print:shadow-none print:w-[3.5in] print:rounded-none print:p-2 ${
              labelFormat === "SHIPPING_TAG" ? "max-w-lg" : ""
            }`}
          >
            {/* Header / Brand Badge */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs">
                  FT
                </div>
                <div>
                  <p className="font-extrabold text-xs tracking-tight uppercase text-slate-900">
                    Farm Tracer • Verified Origin
                  </p>
                  <p className="text-[9px] font-mono font-bold text-emerald-800">
                    FSSAI SAFE & TRANSPARENT CROP
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md">
                {batch.category}
              </span>
            </div>

            {/* Main Content & QR Grid */}
            <div className="grid grid-cols-12 gap-3 items-center">
              {/* QR Image Column */}
              <div className="col-span-5 text-center border-r border-slate-200 pr-3">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR ${batch.batchId}`}
                    className="w-32 h-32 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                    Generating...
                  </div>
                )}
                <p className="font-mono text-[10px] font-bold text-slate-900 mt-1 break-all">
                  {batch.batchId}
                </p>
                <p className="text-[8px] text-slate-500 uppercase font-semibold">
                  Scan to Trace Origin
                </p>
              </div>

              {/* Product Metadata Column */}
              <div className="col-span-7 space-y-1.5 text-xs text-slate-900">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">
                    Product Name
                  </p>
                  <p className="font-extrabold text-sm text-slate-900 leading-tight">
                    {batch.productName}
                  </p>
                  {batch.variety && (
                    <p className="text-[11px] font-semibold text-emerald-800">
                      Variety: {batch.variety}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Quantity
                    </span>
                    <span className="font-bold">
                      {batch.quantity} {batch.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Quality
                    </span>
                    <span className="font-bold text-emerald-800">
                      {batch.qualityGrade}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-1 text-[10px]">
                  <p className="text-slate-600">
                    <strong>Producer:</strong> {batch.farmerName}
                  </p>
                  <p className="text-slate-600 truncate">
                    <strong>Location:</strong> {batch.district}, {batch.state}
                  </p>
                  {batch.fssaiLicense && (
                    <p className="text-slate-800 font-bold">
                      FSSAI Lic: {batch.fssaiLicense}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Geotag & Verification Footer Bar */}
            <div className="border-t-2 border-slate-900 pt-2 flex items-center justify-between text-[9px] text-slate-700 font-medium">
              <div className="flex items-center gap-1 font-mono">
                <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>
                  GPS: {batch.lat?.toFixed(4)}, {batch.lng?.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                <span>
                  Date: {new Date(batch.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Footer - Hidden during print */}
        <div className="p-5 bg-white border-t border-slate-200 space-y-3 print:hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrintLabel}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Label
              </button>

              <button
                onClick={handleDownloadQrImage}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-700" /> Download QR
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" /> Copied Link!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" /> Copy Trace URL
                  </>
                )}
              </button>

              <a
                href={traceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open Trace Page
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center font-medium">
            💡 <strong>Printer Tip:</strong> Standard 3"x2" adhesive thermal stickers supported. Select "Background graphics" in standard print settings for full border fidelity.
          </p>
        </div>
      </div>
    </div>
  );
};
