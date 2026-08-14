import React from "react";
import { BatchStatus, VerificationStatus, UserRole } from "../types";

export const BatchStatusBadge: React.FC<{ status: BatchStatus }> = ({ status }) => {
  let colorClass = "bg-slate-100 text-slate-700 border-slate-300";

  switch (status) {
    case "HARVESTED":
    case "CREATED":
    case "COLLECTED":
      colorClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
      break;
    case "PROCESSING":
    case "PROCESSED":
    case "PACKAGED":
      colorClass = "bg-blue-50 text-blue-800 border-blue-200";
      break;
    case "IN_TRANSIT":
    case "DISTRIBUTED":
    case "COLD_STORAGE":
      colorClass = "bg-amber-50 text-amber-800 border-amber-200";
      break;
    case "RETAIL":
    case "SOLD":
      colorClass = "bg-purple-50 text-purple-800 border-purple-200";
      break;
    case "EXPIRED":
    case "RECALLED":
    case "FLAGGED":
    case "DISPOSED":
      colorClass = "bg-rose-50 text-rose-800 border-rose-300 font-bold animate-pulse";
      break;
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${colorClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  let colorClass = "bg-slate-100 text-slate-700 border-slate-300";

  switch (status) {
    case "VERIFIED":
      colorClass = "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
      break;
    case "WARNING":
      colorClass = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
      break;
    case "RECALLED":
    case "EXPIRED":
      colorClass = "bg-rose-50 text-rose-800 border-rose-300 font-bold animate-pulse";
      break;
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${colorClass}`}
    >
      <span>{status === "VERIFIED" ? "✓" : status === "WARNING" ? "⚠️" : "⛔"}</span>
      <span>{status}</span>
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
      {role}
    </span>
  );
};
