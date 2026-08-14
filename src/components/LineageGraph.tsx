import React from "react";
import { GitBranch, ArrowDown, ArrowRight, ShieldCheck, Factory, Sprout, ShoppingBag, AlertTriangle } from "lucide-react";
import { Batch, BatchLineage } from "../types";

interface LineageGraphProps {
  currentBatch: Batch;
  allBatches: Batch[];
  lineageLinks: BatchLineage[];
  onSelectBatch: (batchId: string) => void;
}

export const LineageGraph: React.FC<LineageGraphProps> = ({
  currentBatch,
  allBatches,
  lineageLinks,
  onSelectBatch,
}) => {
  // Find parent batches
  const parentIds = currentBatch.parentBatchIds || [];
  const parentBatches = allBatches.filter((b) => parentIds.includes(b.batchId) || parentIds.includes(b.id));

  // Find child batches
  const childIds = currentBatch.childBatchIds || [];
  const childBatches = allBatches.filter((b) => childIds.includes(b.batchId) || childIds.includes(b.id));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MILK":
      case "VEGETABLES":
      case "FRUITS":
      case "CROPS":
      case "GRAINS":
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case "PROCESSED_FOOD":
        return <Factory className="w-4 h-4 text-blue-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900">Graph-Based Batch Lineage (DAG)</h3>
        </div>
        <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
          Parent-Child Transformation Tree
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 py-2">
        {/* Step 1: Parent Raw Input Batches */}
        {parentBatches.length > 0 ? (
          <div className="w-full space-y-2 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Input / Parent Batches ({parentBatches.length})
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {parentBatches.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => onSelectBatch(parent.batchId)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all text-left shadow-2xs"
                >
                  {getCategoryIcon(parent.category)}
                  <div>
                    <p className="font-bold text-xs text-slate-900">{parent.productName}</p>
                    <p className="font-mono text-[10px] text-emerald-700 font-semibold">{parent.batchId}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-center pt-2">
              <ArrowDown className="w-5 h-5 text-emerald-600 animate-bounce" />
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-slate-500 italic">
            🌱 Primary Origin Batch (No parent inputs — created directly at farm)
          </div>
        )}

        {/* Step 2: Current Batch Center Node */}
        <div className="w-full max-w-md p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl shadow-xs ring-4 ring-emerald-500/10 text-center relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-600 text-white uppercase">
            Active Selected Node
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            {getCategoryIcon(currentBatch.category)}
            <h4 className="font-extrabold text-sm text-slate-900">{currentBatch.productName}</h4>
          </div>
          <p className="font-mono text-xs font-bold text-emerald-800 mb-2">
            {currentBatch.batchId}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-slate-700">
            <div>
              <span className="text-slate-500 block text-[10px]">Owner / Role</span>
              <span className="font-semibold text-slate-900">{currentBatch.currentOwner}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Quantity</span>
              <span className="font-semibold text-emerald-700 font-mono">
                {currentBatch.quantity} {currentBatch.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Child Processed Output Batches */}
        {childBatches.length > 0 && (
          <div className="w-full space-y-2 text-center pt-2">
            <div className="flex justify-center pb-2">
              <ArrowDown className="w-5 h-5 text-emerald-600 animate-bounce" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Output / Child Derived Batches ({childBatches.length})
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {childBatches.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onSelectBatch(child.batchId)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all text-left shadow-2xs"
                >
                  {getCategoryIcon(child.category)}
                  <div>
                    <p className="font-bold text-xs text-slate-900">{child.productName}</p>
                    <p className="font-mono text-[10px] text-emerald-700 font-semibold">{child.batchId}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
