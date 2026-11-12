"use client";

import React, { useState } from "react";
import { DollarSign, PieChart, TrendingUp, AlertCircle, ArrowDown } from "lucide-react";

interface FundamentalProps {
  language?: "en" | "hinglish";
}

export const FundamentalWaterfall: React.FC<FundamentalProps> = ({ language = "en" }) => {
  const [revenue, setRevenue] = useState<number>(10000); // In ₹ Crores
  const [cogsPct, setCogsPct] = useState<number>(55); // 55% Cost of Goods Sold
  const [opexPct, setOpexPct] = useState<number>(20); // 20% SG&A / R&D
  const [interestDebt, setInterestDebt] = useState<number>(400); // ₹400 Cr Interest
  const [shareCount, setShareCount] = useState<number>(100); // 100 Cr Shares
  const [sharePrice, setSharePrice] = useState<number>(2450); // ₹2,450 per share

  // Exact Financial Waterfall Calculations
  const cogs = Math.round(revenue * (cogsPct / 100));
  const grossProfit = revenue - cogs;
  const opex = Math.round(revenue * (opexPct / 100));
  const ebitda = grossProfit - opex;
  const depreciation = Math.round(revenue * 0.04); // ~4% D&A
  const ebit = ebitda - depreciation;
  const ebt = Math.max(0, ebit - interestDebt);
  const taxes = Math.round(ebt * 0.25); // 25% Indian corporate tax
  const netIncome = Math.max(0, ebt - taxes); // PAT (Profit After Tax)

  // Per Share & Valuation Ratios
  const eps = parseFloat((netIncome / (shareCount || 1)).toFixed(2));
  const peRatio = eps > 0 ? parseFloat((sharePrice / eps).toFixed(1)) : 999.0;
  const netMarginPct = ((netIncome / revenue) * 100).toFixed(1);
  const debtEquity = (interestDebt / Math.max(1, netIncome * 0.5)).toFixed(2);
  const isValueTrap = peRatio < 8 && parseFloat(debtEquity) > 2.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-sky-400" />
            {language === "hinglish"
              ? "Financial Waterfall: Top-Line Se Bottom-Line Tak"
              : "Income Statement Waterfall & Valuation Engine"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Dekhein kaise Revenue me se kharche kat kar Net Profit aur P/E Ratio banta hai"
              : "Trace how revenue flows through deductions to calculate true Net Profit (PAT), EPS, and P/E ratio"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">P/E Ratio:</span>
          <span className="font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded text-xs">
            {peRatio}x
          </span>
          <span className="text-xs text-slate-400">Net Margin:</span>
          <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded text-xs">
            {netMarginPct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3.5 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wide">
            {language === "hinglish" ? "Company Numbers Setup" : "Income Statement Inputs"}
          </div>

          {/* Revenue */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Annual Gross Revenue:</span>
              <span className="font-mono font-bold text-sky-400">₹{revenue.toLocaleString()} Cr</span>
            </div>
            <input
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={revenue}
              onChange={(e) => setRevenue(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* COGS % */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Cost of Goods Sold (Raw Materials):</span>
              <span className="font-mono font-bold text-rose-400">{cogsPct}% of Sales</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={cogsPct}
              onChange={(e) => setCogsPct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Operating Costs % */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Operating Expenses (OPEX):</span>
              <span className="font-mono font-bold text-amber-400">{opexPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              value={opexPct}
              onChange={(e) => setOpexPct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Debt Interest */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Annual Debt Interest Paid:</span>
              <span className="font-mono font-bold text-rose-400">₹{interestDebt} Cr</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={interestDebt}
              onChange={(e) => setInterestDebt(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Share Price */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Current Share Price:</span>
              <span className="font-mono font-bold text-sky-400">₹{sharePrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="50"
              value={sharePrice}
              onChange={(e) => setSharePrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {isValueTrap && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-[11px] text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                {language === "hinglish"
                  ? "Value Trap Warning: Low P/E par debt bohot zyada hai! Ye stock sasta nahi balki financially kamzor ho sakta hai."
                  : "Value Trap Alert: Superficially cheap P/E accompanied by high debt load. Don't mistake distress for value."}
              </span>
            </div>
          )}
        </div>

        {/* Visual Waterfall Bars */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-2.5 text-xs font-mono">
          <div className="font-sans font-bold text-slate-300 text-xs uppercase tracking-wider mb-2 flex justify-between">
            <span>The Financial Waterfall</span>
            <span className="text-slate-400 text-[10px]">Values in ₹ Crores</span>
          </div>

          {/* 1. Revenue */}
          <div>
            <div className="flex justify-between text-slate-300 mb-0.5">
              <span>Top-Line Revenue:</span>
              <span className="font-bold text-sky-400">+₹{revenue.toLocaleString()} Cr</span>
            </div>
            <div className="h-5 bg-slate-900 rounded overflow-hidden">
              <div className="h-full bg-sky-500 rounded" style={{ width: "100%" }} />
            </div>
          </div>

          {/* 2. COGS Deduction */}
          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>- Raw Materials (COGS):</span>
              <span className="text-rose-400">-₹{cogs.toLocaleString()} Cr ({cogsPct}%)</span>
            </div>
            <div className="h-4 bg-slate-900 rounded overflow-hidden">
              <div
                className="h-full bg-rose-500/70 rounded"
                style={{ width: `${Math.min(100, (cogs / revenue) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. Gross Profit */}
          <div className="pl-3 border-l-2 border-emerald-500/60 py-0.5">
            <div className="flex justify-between text-emerald-400">
              <span className="font-sans font-semibold">= Gross Profit:</span>
              <span className="font-bold">+₹{grossProfit.toLocaleString()} Cr</span>
            </div>
          </div>

          {/* 4. OPEX Deduction */}
          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>- Operating Costs (OPEX):</span>
              <span className="text-amber-400">-₹{opex.toLocaleString()} Cr</span>
            </div>
            <div className="h-4 bg-slate-900 rounded overflow-hidden">
              <div
                className="h-full bg-amber-500/70 rounded"
                style={{ width: `${Math.min(100, (opex / revenue) * 100)}%` }}
              />
            </div>
          </div>

          {/* 5. EBITDA */}
          <div className="pl-3 border-l-2 border-emerald-500/60 py-0.5">
            <div className="flex justify-between text-emerald-300">
              <span className="font-sans font-semibold">= EBITDA:</span>
              <span className="font-bold">+₹{ebitda.toLocaleString()} Cr</span>
            </div>
          </div>

          {/* 6. Interest & Taxes */}
          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>- Interest & Taxes:</span>
              <span className="text-rose-400">-₹{(interestDebt + taxes).toLocaleString()} Cr</span>
            </div>
          </div>

          {/* 7. Bottom-Line Net Income */}
          <div className="p-3 bg-slate-900 rounded-lg border border-emerald-700/60 mt-3 font-sans">
            <div className="flex justify-between items-center text-sm font-bold text-emerald-400 mb-1">
              <span>Bottom-Line Net Income (PAT):</span>
              <span className="font-mono text-base">₹{netIncome.toLocaleString()} Cr</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] text-center">
              <div>
                <span className="text-slate-400 block">EPS (Per Share)</span>
                <span className="font-mono font-bold text-slate-200">₹{eps}</span>
              </div>
              <div>
                <span className="text-slate-400 block">P/E Multiple</span>
                <span className="font-mono font-bold text-amber-400">{peRatio}x</span>
              </div>
              <div>
                <span className="text-slate-400 block">Net Margin</span>
                <span className="font-mono font-bold text-emerald-400">{netMarginPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
