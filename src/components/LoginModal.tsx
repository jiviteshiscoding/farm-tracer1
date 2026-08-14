import React, { useState } from "react";
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  ArrowRight,
  Lock,
  LogOut,
} from "lucide-react";
import { UserRole, UserProfile } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentUser: UserProfile;
  onSelectRoleAndUser: (role: UserRole, userProfile: UserProfile) => void;
  demoUsers: Record<UserRole, UserProfile>;
}

const ROLE_OPTIONS: {
  key: UserRole;
  title: string;
  category: string;
  icon: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    key: "FARMER",
    title: "Farmer / Producer",
    category: "Upstream Production",
    icon: "🌱",
    description: "Create crop batches, log harvest, geotag farm location & issue initial QR labels.",
    color: "emerald",
    borderColor: "border-emerald-300",
    bgColor: "bg-emerald-50 hover:bg-emerald-100",
    textColor: "text-emerald-800",
  },
  {
    key: "PROCESSOR",
    title: "Agro Processor / Factory",
    category: "Transformation Hub",
    icon: "🏭",
    description: "Scan incoming raw crops, process/package output products & link DAG parent-child batch graph.",
    color: "blue",
    borderColor: "border-blue-300",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    textColor: "text-blue-800",
  },
  {
    key: "DISTRIBUTOR",
    title: "Distributor & Logistics",
    category: "Cold Chain Transport",
    icon: "📦",
    description: "Log custody transfers, record vehicle & reefer temperatures, track transit custody.",
    color: "amber",
    borderColor: "border-amber-300",
    bgColor: "bg-amber-50 hover:bg-amber-100",
    textColor: "text-amber-800",
  },
  {
    key: "COLD_STORAGE",
    title: "Cold Storage Warehouse",
    category: "Temperature Control",
    icon: "❄️",
    description: "Monitor humidity/temp sensors, maintain cold chain integrity for perishable batches.",
    color: "cyan",
    borderColor: "border-cyan-300",
    bgColor: "bg-cyan-50 hover:bg-cyan-100",
    textColor: "text-cyan-800",
  },
  {
    key: "TRANSPORTER",
    title: "Reefer Transporter",
    category: "Transit Fleet",
    icon: "🚚",
    description: "Manage reefer truck fleet, log real-time transit telemetry and location checkpoints.",
    color: "indigo",
    borderColor: "border-indigo-300",
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    textColor: "text-indigo-800",
  },
  {
    key: "RETAILER",
    title: "Retailer / Supermarket",
    category: "Consumer Point of Sale",
    icon: "🏪",
    description: "Scan delivered shipments, verify quality & shelf-life, mark available for store sale.",
    color: "purple",
    borderColor: "border-purple-300",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    textColor: "text-purple-800",
  },
  {
    key: "AUTHORITY",
    title: "FSSAI Food Inspector",
    category: "Regulatory Supervision",
    icon: "🛡️",
    description: "Inspect compliance, monitor automated risk flags, issue batch recalls & audit logs.",
    color: "rose",
    borderColor: "border-rose-300",
    bgColor: "bg-rose-50 hover:bg-rose-100",
    textColor: "text-rose-800",
  },
  {
    key: "ADMIN",
    title: "Platform Administrator",
    category: "System Control",
    icon: "⚙️",
    description: "Manage system state, offline IndexedDB sync queues, and node security parameters.",
    color: "slate",
    borderColor: "border-slate-300",
    bgColor: "bg-slate-100 hover:bg-slate-200",
    textColor: "text-slate-800",
  },
  {
    key: "CONSUMER",
    title: "Consumer / Public Citizen",
    category: "Public Transparency",
    icon: "🛒",
    description: "Scan product QR codes on packaging to verify farm-to-fork origin and safety history.",
    color: "teal",
    borderColor: "border-teal-300",
    bgColor: "bg-teal-50 hover:bg-teal-100",
    textColor: "text-teal-800",
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentUser,
  onSelectRoleAndUser,
  demoUsers,
}) => {
  const [activeTab, setActiveTab] = useState<"DEMO" | "CUSTOM">("DEMO");

  // Custom User Login Form State
  const [customName, setCustomName] = useState(currentUser?.name || "");
  const [customOrg, setCustomOrg] = useState(currentUser?.organization || "");
  const [customRole, setCustomRole] = useState<UserRole>(currentRole || "FARMER");
  const [customDistrict, setCustomDistrict] = useState(currentUser?.district || "Pune");
  const [customState, setCustomState] = useState(currentUser?.state || "Maharashtra");
  const [customFssai, setCustomFssai] = useState(currentUser?.fssaiNumber || "FSSAI-100200330044");

  if (!isOpen) return null;

  const handleCustomLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUserProfile: UserProfile = {
      id: `custom-usr-${Date.now()}`,
      name: customName || "Custom User",
      organization: customOrg || "Independent Organization",
      role: customRole,
      district: customDistrict,
      state: customState,
      address: `${customDistrict}, ${customState}`,
      fssaiNumber: customFssai,
      verified: true,
    };

    onSelectRoleAndUser(customRole, newUserProfile);
    onClose();
  };

  const handleQuickDemoLogin = (roleKey: UserRole) => {
    const demoProfile = demoUsers[roleKey] || demoUsers.FARMER;
    onSelectRoleAndUser(roleKey, demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              FT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-serif tracking-tight text-white">
                  Supply Chain Login & Role Window
                </h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  Multi-Stakeholder
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Select your position in the agricultural supply chain or log in with custom credentials.
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

        {/* Current Session Bar */}
        {currentUser && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center justify-between text-xs text-emerald-900 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Currently logged in as: <strong>{currentUser.name}</strong> ({currentUser.organization})
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold uppercase text-[10px]">
              {currentUser.role}
            </span>
          </div>
        )}

        {/* Login Type Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("DEMO")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-t border-x transition-colors flex items-center gap-1.5 ${
                activeTab === "DEMO"
                  ? "bg-white border-slate-200 text-emerald-700 shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              1-Click Stakeholder Roles ({ROLE_OPTIONS.length})
            </button>

            <button
              onClick={() => setActiveTab("CUSTOM")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-t border-x transition-colors flex items-center gap-1.5 ${
                activeTab === "CUSTOM"
                  ? "bg-white border-slate-200 text-emerald-700 shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              Custom Business Credentials Login
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === "DEMO" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">
                  Select a supply chain stakeholder role to instantly switch dashboard access & write permission context:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ROLE_OPTIONS.map((r) => {
                  const isSelected = currentRole === r.key;
                  return (
                    <div
                      key={r.key}
                      onClick={() => handleQuickDemoLogin(r.key)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? `bg-emerald-50 ${r.borderColor} ring-2 ring-emerald-500 shadow-sm`
                          : `${r.bgColor} ${r.borderColor} border-slate-200 hover:shadow-xs`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-2xl">{r.icon}</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            {r.category}
                          </span>
                        </div>
                        <h4 className={`font-extrabold text-sm ${r.textColor}`}>
                          {r.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500">
                          {demoUsers[r.key]?.name || "Demo Persona"}
                        </span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Login <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Login Form */
            <form onSubmit={handleCustomLoginSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" /> Enter Official Enterprise / Farmer Identity
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your identity details will be attached to digital signature audit events and QR code labels.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Supply Chain Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.icon} {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Full Name / Officer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Organization / Farm / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customOrg}
                    onChange={(e) => setCustomOrg(e.target.value)}
                    placeholder="e.g. Green Harvest Farms Co-op"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    FSSAI License / Registration No.
                  </label>
                  <input
                    type="text"
                    value={customFssai}
                    onChange={(e) => setCustomFssai(e.target.value)}
                    placeholder="e.g. FSSAI-100200110099"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Save & Launch Dashboard
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted offline session stored locally in IndexedDB</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-600 font-bold hover:underline"
          >
            Continue as Guest / Close
          </button>
        </div>
      </div>
    </div>
  );
};
