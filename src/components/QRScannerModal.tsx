import React, { useEffect, useRef, useState } from "react";
import { X, Camera, Upload, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { extractBatchIdFromUrl } from "../lib/qrGenerator";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (batchId: string) => void;
}

const DEMO_QUICK_BATCHES = [
  { id: "FT-IN-MH-PUN-20260810-9843A1", label: "Fresh Tomatoes (Farmer Pune)" },
  { id: "FT-IN-MH-MUM-20260811-3312B2", label: "Organic Tomato Puree (Retailer Thane)" },
  { id: "FT-IN-MH-KOL-20260812-7711M9", label: "A2 Desi Cow Milk (Dairy Kolhapur)" },
  { id: "FT-IN-MH-KOL-20260812-9988P4", label: "A2 Fresh Paneer (Processor/Retailer)" },
  { id: "FT-IN-MH-NAG-20260813-9999X9", label: "Nagpur Mangoes (Suspicious Anomaly)" },
  { id: "FT-IN-PB-BHA-20260801-4455R0", label: "Contaminated Wheat Atta (Recalled Batch)" },
];

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [manualBatchId, setManualBatchId] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "qr-reader-element";

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    // Initialize scanner
    const startScanner = async () => {
      try {
        setCameraError(null);
        setIsScanning(true);
        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            const batchId = extractBatchIdFromUrl(decodedText);
            stopScanner();
            onScanResult(batchId);
          },
          () => {
            // ignore frame parse failures
          }
        );
      } catch (err: any) {
        console.warn("Camera access failed or unavailable:", err);
        setCameraError("Camera unavailable or permission denied. You can select a batch or upload a QR image below.");
        setIsScanning(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      } else {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBatchId.trim()) {
      onScanResult(manualBatchId.trim());
      setManualBatchId("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-file-reader-dummy");
      const result = await html5QrCode.scanFile(file, true);
      const batchId = extractBatchIdFromUrl(result);
      html5QrCode.clear();
      onScanResult(batchId);
    } catch (err) {
      setCameraError("Could not detect a valid Farm Tracer QR code in the uploaded image.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl text-slate-900 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-lg text-slate-900">Scan Product QR Code</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Camera View Area */}
          <div className="relative bg-slate-900 border-2 border-dashed border-emerald-500/80 rounded-xl overflow-hidden min-h-[220px] flex items-center justify-center">
            <div id={readerElementId} className="w-full h-full max-h-[280px]"></div>
            <div id="qr-file-reader-dummy" className="hidden"></div>

            {cameraError && (
              <div className="p-4 text-center max-w-xs space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs text-amber-200">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Upload Image Option */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-700 font-medium flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" /> Upload QR Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </div>

          {/* Manual Batch ID Form */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Enter Batch ID Manually</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. FT-IN-MH-PUN-20260810-9843A1"
                value={manualBatchId}
                onChange={(e) => setManualBatchId(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
              >
                Trace
              </button>
            </div>
          </form>

          {/* Hackathon Quick Demo Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Batches for Rapid Testing
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_QUICK_BATCHES.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => {
                    stopScanner();
                    onScanResult(demo.id);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all text-xs group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-emerald-900">
                    {demo.label}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                    {demo.id.split("-").slice(-2).join("-")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
