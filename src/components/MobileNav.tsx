import React from "react";
import { Home, QrCode, RefreshCw, Layers, ShieldAlert, User } from "lucide-react";
import { UserRole, UserProfile } from "../types";

interface MobileNavProps {
  activeTab: "HOME" | "DASHBOARD" | "TRACE" | "SCANNER";
  onSelectTab: (tab: "HOME" | "DASHBOARD" | "TRACE" | "SCANNER") => void;
  onOpenScanner: () => void;
  pendingSyncCount: number;
  onOpenSyncModal: () => void;
  onOpenLoginModal?: () => void;
  currentRole: UserRole;
  currentUser?: UserProfile;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenScanner,
  pendingSyncCount,
  onOpenSyncModal,
  onOpenLoginModal,
  currentRole,
  currentUser,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-600 md:hidden px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onSelectTab("HOME")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
            activeTab === "HOME" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectTab("DASHBOARD")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
            activeTab === "DASHBOARD" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        {/* Floating Scanner Action Button */}
        <button
          onClick={onOpenScanner}
          className="flex flex-col items-center justify-center -mt-6 w-12 h-12 rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all ring-4 ring-slate-50"
        >
          <QrCode className="w-6 h-6" />
        </button>

        <button
          onClick={onOpenLoginModal}
          className="flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
        >
          <User className="w-5 h-5 mb-0.5 text-emerald-700" />
          <span className="font-bold truncate max-w-[50px]">{currentUser ? currentUser.role : currentRole}</span>
        </button>

        <button
          onClick={() => onSelectTab("TRACE")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
            activeTab === "TRACE" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-0.5" />
          <span>Trace</span>
        </button>
      </div>
    </nav>
  );
};

