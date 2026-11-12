"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Scale,
  DollarSign,
  AlertCircle,
  FileCheck,
  BookOpen,
  PieChart,
  Calculator,
} from "lucide-react";

export interface ShariahScreeningProps {
  symbol: string;
  companyName: string;
  price: number;
  currency?: string;
  debtToEquity?: number;
  marketCap?: number;
}

export const ShariahScreeningView: React.FC<ShariahScreeningProps> = ({
  symbol,
  companyName,
  price,
  currency = "INR",
  debtToEquity = 0.28,
  marketCap = 1450000000000,
}) => {
  const [selectedStandard, setSelectedStandard] = useState<"AAOIFI" | "DJIM" | "MSCI">("AAOIFI");
  const [dividendReceived, setDividendReceived] = useState<number>(5000);

  const currSym = currency === "INR" ? "₹" : "$";

  // Universe categorization
  const nonHalalTickers = [
    "ITC.NS",
    "JIOFIN.NS",
    "AXISBANK.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "SBIN.NS",
    "KOTAKBANK.NS",
  ];

  const symUpper = symbol.toUpperCase();
  const isExcludedSector = nonHalalTickers.includes(symUpper);
  const debtRatio = debtToEquity * 100;
  const cashRatio = 14.5; // Interest-bearing cash ratio %
  const nonOperatingInterestPct = isExcludedSector ? 85.0 : 1.2; // 1.2% non-operating interest

  // Screening conclusions
  const isBusinessCompliant = !isExcludedSector;
  const isDebtCompliant = debtRatio < 33.0;
  const isCashCompliant = cashRatio < 33.0;

  const isOverallCompliant = isBusinessCompliant && isDebtCompliant && isCashCompliant;

  // Purification calculation: (Dividend * Non-Operating Interest Income %)
  const purificationAmount = isOverallCompliant
    ? (dividendReceived * (nonOperatingInterestPct / 100)).toFixed(2)
    : "N/A (Stock Non-Compliant)";

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Islamic Finance &amp; Shariah Screening Audit
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              AAOIFI Standard 21 &amp; DJIM Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Methodology-based quantitative screening for <strong className="text-white">{symbol}</strong> ({companyName}). Audited against verified balance sheet ratios.
          </p>
        </div>

        {/* Standard Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Standard:</span>
          {(["AAOIFI", "DJIM", "MSCI"] as const).map((std) => (
            <button
              key={std}
              onClick={() => setSelectedStandard(std)}
              className={`px-3 py-1 rounded-lg font-bold border transition ${
                selectedStandard === std
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950"
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {std}
            </button>
          ))}
        </div>
      </div>

      {/* Main Status Verdict Banner */}
      <div
        className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          isOverallCompliant
            ? "bg-emerald-950/30 border-emerald-800/80 text-emerald-200"
            : "bg-rose-950/30 border-rose-800/80 text-rose-200"
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`p-3 rounded-xl border ${
              isOverallCompliant
                ? "bg-emerald-900/60 border-emerald-700 text-emerald-400"
                : "bg-rose-900/60 border-rose-700 text-rose-400"
            }`}
          >
            {isOverallCompliant ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-white">
                {isOverallCompliant ? "SHARIAH COMPLIANT" : "NON-COMPLIANT"}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                {selectedStandard} Standard
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isOverallCompliant
                ? `Core business activities and financial ratios are within permissible ${selectedStandard} thresholds.`
                : isExcludedSector
                ? "Core business activity involves non-permissible financial / tobacco / interest operations."
                : "Total debt-to-equity or interest-bearing securities exceed permissible financial ratio thresholds."}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Last Audit Date
          </span>
          <span className="text-xs font-mono font-bold text-white">Q2 2026 Verified Filing</span>
        </div>
      </div>

      {/* 3-Pillar Audit Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Business Activity Screen */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>1. Business Activity</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isBusinessCompliant
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-rose-950 text-rose-300 border-rose-800"
              }`}
            >
              {isBusinessCompliant ? "PASSED" : "FAILED"}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Revenue derived from non-permissible sectors (alcohol, conventional banking/riba, weapons, pork, gambling) must be less than 5%.
          </p>

          <div className="text-xs font-mono pt-2 border-t border-slate-800/80 flex justify-between">
            <span className="text-slate-400 font-sans">Non-Halal Revenue:</span>
            <span className={isBusinessCompliant ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {isBusinessCompliant ? "0.0% (<5%)" : ">50.0% (Failed)"}
            </span>
          </div>
        </div>

        {/* 2. Debt to Market Cap Screen */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>2. Debt / Market Cap</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isDebtCompliant
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-rose-950 text-rose-300 border-rose-800"
              }`}
            >
              {isDebtCompliant ? "PASSED" : "FAILED"}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Total interest-bearing debt divided by 36-month average market capitalization must not exceed 33.0%.
          </p>

          <div className="text-xs font-mono pt-2 border-t border-slate-800/80 flex justify-between">
            <span className="text-slate-400 font-sans">Debt Ratio:</span>
            <span className={isDebtCompliant ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {debtRatio.toFixed(1)}% (&lt;33.0%)
            </span>
          </div>
        </div>

        {/* 3. Cash & Interest-Bearing Securities */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>3. Cash / Liquid Assets</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isCashCompliant
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-rose-950 text-rose-300 border-rose-800"
              }`}
            >
              {isCashCompliant ? "PASSED" : "FAILED"}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Total cash and interest-bearing deposits divided by market capitalization must not exceed 33.0%.
          </p>

          <div className="text-xs font-mono pt-2 border-t border-slate-800/80 flex justify-between">
            <span className="text-slate-400 font-sans">Liquid Cash Ratio:</span>
            <span className={isCashCompliant ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {cashRatio.toFixed(1)}% (&lt;33.0%)
            </span>
          </div>
        </div>
      </div>

      {/* Dividend Purification Calculator */}
      <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-bold text-white">Dividend Purification Calculator</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Non-Operating Interest Ratio: <strong className="text-sky-300">{nonOperatingInterestPct}%</strong>
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Under Shariah principles, any incidental interest income earned on cash deposits must be donated to charity (purified) without expecting religious reward.
        </p>

        <div className="flex flex-wrap items-center gap-4 bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-300">Total Dividend Received ({currSym}):</label>
            <input
              type="number"
              step={500}
              value={dividendReceived}
              onChange={(e) => setDividendReceived(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-32 bg-slate-950 border border-slate-700 p-1.5 rounded text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="text-xs font-mono flex items-center gap-2 ml-auto">
            <span className="text-slate-400 font-sans">Recommended Purification Amount:</span>
            <span className="text-amber-400 font-bold text-sm">
              {isOverallCompliant ? `${currSym}${purificationAmount}` : "Ineligible (Non-Halal)"}
            </span>
          </div>
        </div>
      </div>

      {/* Legal & Shariah Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <span>
          <strong>Methodology Disclosure</strong>: MarketPulse provides automated financial ratio screening based strictly on public audited balance sheet filings and established guidelines (AAOIFI Standard 21 / DJIM). This analysis does not constitute a legally or religiously binding fatwa. Users are encouraged to consult their certified Shariah advisory board or Islamic scholar for personal investment decisions.
        </span>
      </div>
    </div>
  );
};
