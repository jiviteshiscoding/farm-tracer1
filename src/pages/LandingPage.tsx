import React from "react";
import {
  QrCode,
  ShieldCheck,
  WifiOff,
  Sparkles,
  MapPin,
  ArrowRight,
  Sprout,
  Factory,
  Truck,
  Store,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Award,
} from "lucide-react";
import { SupportedLanguage } from "../types";
import { TRANSLATIONS } from "../lib/translations";

interface LandingPageProps {
  onOpenScanner: () => void;
  onExploreDemo: () => void;
  language: SupportedLanguage;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenScanner,
  onExploreDemo,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.EN;

  return (
    <div className="space-y-12 py-6 px-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 text-slate-900 p-8 sm:p-12 border border-slate-200 shadow-sm">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Digital Food Supply Chain System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif leading-tight text-slate-900">
            From Farm to Fork, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-green-700">
              Know the Journey.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
            Farm Tracer delivers an offline-first, QR-powered, AI-assisted supply chain platform.
            Trace raw harvests, processing transformations, cold storage, and retail distribution with absolute verification.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <QrCode className="w-5 h-5" />
              <span>{t.scan_qr}</span>
            </button>

            <button
              onClick={onExploreDemo}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
            >
              <span>Explore Demo Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Offline-First PWA</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tamper-Evident Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gemini AI Auditing</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>FSSAI Export Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Supply Chain Pipeline Visualizer */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            End-To-End Traceability
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            How Farm Tracer Works
          </h2>
          <p className="text-sm text-slate-600">
            Every movement or processing event is digitally signed, timestamped, and stored in a graph-based lineage database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">1. Farm Origin</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Farmers record raw harvest batch, quantity, and GPS location to issue a unique Batch ID & QR code.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Factory className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">2. Processing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Processors scan inputs and transform them into refined products while preserving parent-child DAG links.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">3. Logistics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transporters & cold storage facilities log temperature, humidity, vehicle ID, and custody handoffs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">4. Retail Shelf</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Retailers scan received shipments, monitor shelf life, and display verified product status.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">5. Consumer Trace</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consumers scan the product QR code with any smartphone to view complete farm-to-fork history.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-xs space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif">
            Built For Real-World Agricultural Supply Chains
          </h2>
          <p className="text-xs text-slate-500">
            Engineered for reliability across rural internet conditions, complex transformations, and food safety regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
            <WifiOff className="w-8 h-8 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">100% Offline-First PWA</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmers and field workers can log harvest events even without internet access. Data is stored safely in IndexedDB and synchronized via Workbox background sync when connectivity returns.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Gemini AI Image & Anomaly Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-modal Gemini models verify uploaded produce photos against declared product categories and flag spatial/temporal anomalies (such as impossible travel speeds between check-ins).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-300 transition-colors">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
            <h3 className="font-bold text-base text-slate-900">Targeted Batch Recall Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If contamination occurs, food safety authorities can trigger a batch recall. The graph database automatically traces all descendant processed items, notifying affected distributors and retailers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
