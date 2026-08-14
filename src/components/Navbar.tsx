import React from "react";
import {
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  User,
  ShieldAlert,
  Sparkles,
  Download,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { UserRole, SupportedLanguage, UserProfile } from "../types";
import { TRANSLATIONS } from "../lib/translations";

interface NavbarProps {
  currentRole: UserRole;
  currentUser?: UserProfile;
  onOpenLoginModal?: () => void;
  onRoleChange: (role: UserRole) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onOpenSyncModal: () => void;
  onOpenScanner: () => void;
  onNavigateHome: () => void;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
}

const ROLES: { key: UserRole; labelKey: string; icon: string }[] = [
  { key: "FARMER", labelKey: "farmer", icon: "🌱" },
  { key: "PROCESSOR", labelKey: "processor", icon: "🏭" },
  { key: "DISTRIBUTOR", labelKey: "distributor", icon: "📦" },
  { key: "WAREHOUSE", labelKey: "warehouse", icon: "❄️" },
  { key: "TRANSPORTER", labelKey: "transporter", icon: "🚚" },
  { key: "RETAILER", labelKey: "retailer", icon: "🏪" },
  { key: "CONSUMER", labelKey: "consumer", icon: "🛒" },
  { key: "AUTHORITY", labelKey: "authority", icon: "🛡️" },
  { key: "ADMIN", labelKey: "admin", icon: "⚙️" },
];

const LANGUAGES: { code: SupportedLanguage; label: string; nativeName: string }[] = [
  { code: "EN", label: "English", nativeName: "English" },
  { code: "HI", label: "Hindi", nativeName: "हिंदी" },
  { code: "MR", label: "Marathi", nativeName: "मराठी" },
  { code: "GU", label: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "TA", label: "Tamil", nativeName: "தமிழ்" },
  { code: "TE", label: "Telugu", nativeName: "తెలుగు" },
  { code: "KN", label: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "BN", label: "Bengali", nativeName: "বাংলা" },
  { code: "PA", label: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onOpenLoginModal,
  onRoleChange,
  language,
  onLanguageChange,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onOpenSyncModal,
  onOpenScanner,
  onNavigateHome,
  canInstallPwa,
  onInstallPwa,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.EN;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-xs font-black text-lg group-hover:scale-105 transition-transform">
              FT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                  {t.app_title}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* QR Scan Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs"
              title={t.scan_qr}
            >
              <QrCode className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline">{t.scan_qr}</span>
            </button>

            {/* Offline Sync Status Badge */}
            <button
              onClick={onOpenSyncModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs border transition-colors ${
                isOffline
                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                  : pendingSyncCount > 0
                  ? "bg-amber-50 text-amber-900 border-amber-400 animate-pulse"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {isOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="hidden md:inline">
                {isOffline ? t.offline_mode : t.online_mode}
              </span>
              {pendingSyncCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingSyncCount}
                </span>
              )}
            </button>

            {/* Simulate Offline Toggle */}
            <button
              onClick={onToggleOffline}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
              title="Toggle Offline Simulation for Testing"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOffline ? "rotate-180" : ""}`} />
              <span className="hidden lg:inline">
                {isOffline ? "Simulate Online" : "Simulate Offline"}
              </span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer appearance-none shadow-2xs hover:bg-slate-100"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                    {lang.nativeName} ({lang.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Prominent Login & Role Selection Window Button */}
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all shadow-2xs"
            >
              <LogIn className="w-4 h-4 text-emerald-700" />
              <div className="text-left hidden sm:block">
                <p className="text-[10px] uppercase font-extrabold text-emerald-800 leading-none">
                  {currentUser ? currentUser.role : currentRole}
                </p>
                <p className="text-[11px] text-slate-700 font-semibold truncate max-w-[110px] leading-tight">
                  {currentUser ? currentUser.name : "Switch User"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {/* Install PWA Prompt Button */}
            {canInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                title="Install App on Device"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

