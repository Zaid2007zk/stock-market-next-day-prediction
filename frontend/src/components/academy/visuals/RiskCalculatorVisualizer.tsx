"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, Calculator, Percent, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface RiskCalcProps {
  language?: "en" | "hinglish";
}

export const RiskCalculatorVisualizer: React.FC<RiskCalcProps> = ({ language = "en" }) => {
  const [capital, setCapital] = useState<number>(100000); // ₹1,00,000
  const [riskPct, setRiskPct] = useState<number>(1.0); // 1.0%
  const [entryPrice, setEntryPrice] = useState<number>(500); // ₹500
  const [stopLoss, setStopLoss] = useState<number>(480); // ₹480
  const [targetPrice, setTargetPrice] = useState<number>(540); // ₹540

  // Deterministic Risk Math
  const maxRupeesRisk = (capital * (riskPct / 100));
  const riskPerShare = Math.max(0.5, entryPrice - stopLoss);
  const rewardPerShare = Math.max(0.5, targetPrice - entryPrice);
  const recommendedShares = Math.floor(maxRupeesRisk / riskPerShare);
  const totalOutlay = recommendedShares * entryPrice;
  const portfolioAllocationPct = parseFloat(((totalOutlay / capital) * 100).toFixed(1));
  const rrRatio = parseFloat((rewardPerShare / riskPerShare).toFixed(2));
  const isConcentrated = portfolioAllocationPct > 25.0;

  // Expected value over 10 trades with 40% win rate
  const ev10Trades = (4 * (recommendedShares * rewardPerShare) - 6 * (recommendedShares * riskPerShare));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sky-400" />
            {language === "hinglish"
              ? "Position Sizing & Risk Management Calculator"
              : "Position Sizing & Mathematical Risk Engine"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Entry se pehle apna risk calculate karein — survival first, profits second"
              : "Calculate exact position size, risk-to-reward ratio, and enforce portfolio concentration limits"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Risk:Reward:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
              rrRatio >= 2.0
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : rrRatio >= 1.5
                ? "bg-amber-950 text-amber-400 border-amber-800"
                : "bg-rose-950 text-rose-400 border-rose-800"
            }`}
          >
            1 : {rrRatio}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3.5 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wide">
            {language === "hinglish" ? "Trading Account & Trade Levels" : "Account & Trade Parameters"}
          </div>

          {/* Account Capital */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Total Portfolio Capital:</span>
              <span className="font-mono font-bold text-sky-400">₹{capital.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="25000"
              max="1000000"
              step="25000"
              value={capital}
              onChange={(e) => setCapital(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Risk % per trade */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Risk % Per Trade (Max Loss):</span>
              <span
                className={`font-mono font-bold ${
                  riskPct <= 1.5 ? "text-emerald-400" : riskPct <= 2.5 ? "text-amber-400" : "text-rose-400"
                }`}
              >
                {riskPct.toFixed(1)}% (₹{maxRupeesRisk.toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={riskPct}
              onChange={(e) => setRiskPct(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="text-[10px] text-slate-400 mt-0.5">
              Professional standard: 1.0% to 2.0% maximum per setup.
            </div>
          </div>

          {/* Entry Price */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Entry Price:</span>
              <span className="font-mono font-bold text-slate-200">₹{entryPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="25"
              value={entryPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setEntryPrice(val);
                if (stopLoss >= val) setStopLoss(val - 15);
                if (targetPrice <= val) setTargetPrice(val + 30);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Stop Loss */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Stop-Loss Price:</span>
              <span className="font-mono font-bold text-rose-400">
                ₹{stopLoss} (-₹{riskPerShare} / sh)
              </span>
            </div>
            <input
              type="range"
              min={Math.max(50, entryPrice - 200)}
              max={entryPrice - 5}
              step="5"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Target Price */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Target Exit Price:</span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{targetPrice} (+₹{rewardPerShare} / sh)
              </span>
            </div>
            <input
              type="range"
              min={entryPrice + 10}
              max={entryPrice + 400}
              step="10"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Output Metrics & Safety Warnings */}
        <div className="lg:col-span-6 space-y-4">
          {/* Recommended Position Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Exact Recommended Sizing
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                Formula: ₹{maxRupeesRisk} / ₹{riskPerShare}
              </span>
            </div>

            <div className="text-center py-2 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-3xl font-extrabold text-sky-400 font-mono">
                {recommendedShares.toLocaleString()}{" "}
                <span className="text-sm font-sans font-normal text-slate-400">Shares</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Total Trade Capital: <span className="font-mono text-slate-200">₹{totalOutlay.toLocaleString()}</span> (
                {portfolioAllocationPct}% of Account)
              </div>
            </div>

            {/* Risk vs Reward breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50">
                <span className="text-slate-400 block text-[11px]">Maximum Loss if Stopped</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  -₹{(recommendedShares * riskPerShare).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Strictly {riskPct}% of capital</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/50">
                <span className="text-slate-400 block text-[11px]">Potential Profit at Target</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +₹{(recommendedShares * rewardPerShare).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Ratio: 1 : {rrRatio}</span>
              </div>
            </div>

            {/* Concentration Risk Alert */}
            {isConcentrated && (
              <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {language === "hinglish"
                      ? "High Portfolio Concentration Alert (>25%)"
                      : "Portfolio Concentration Warning (>25%)"}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {language === "hinglish"
                      ? `Aap is trade me apne account ka ${portfolioAllocationPct}% laga rahe hain. Stop-loss pass hone ke bawajood, kisi black-swan gap-down me bada loss ho sakta hai. Position size chhota karein.`
                      : `This single trade absorbs ${portfolioAllocationPct}% of your total portfolio capital. Overnight black-swan gap events can bypass stop-losses. Cap single positions below 25%.`}
                  </span>
                </div>
              </div>
            )}

            {/* Asymmetry Callout */}
            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
              <span>Over 10 trades with 40% win rate:</span>
              <span className={`font-mono font-bold ${ev10Trades >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {ev10Trades >= 0 ? `+₹${ev10Trades.toLocaleString()} net profit` : `-₹${Math.abs(ev10Trades).toLocaleString()} net loss`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
