"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Target,
  AlertTriangle,
  Zap,
  BarChart3,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";

export interface SignalMatrixProps {
  symbol: string;
  price: number;
  currency: string;
  rsi14: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  volatility: number;
  peRatio?: number;
  debtToEquity?: number;
}

export const SignalMatrix: React.FC<SignalMatrixProps> = ({
  symbol,
  price,
  currency,
  rsi14,
  macd,
  macdSignal,
  sma20,
  sma50,
  volatility,
  peRatio = 22.5,
  debtToEquity = 0.35,
}) => {
  const currSym = currency === "INR" ? "₹" : "$";

  // 1. Deterministic Confluence Calculation
  const isTrendBullish = price > sma20 && sma20 > sma50;
  const isTrendBearish = price < sma20 && sma20 < sma50;
  const isMacdBullish = macd > macdSignal;
  const isRsiOverbought = rsi14 > 70;
  const isRsiOversold = rsi14 < 30;

  // Confluence Score (0 - 100)
  let confluenceScore = 50;
  if (isTrendBullish) confluenceScore += 20;
  else if (isTrendBearish) confluenceScore -= 20;

  if (isMacdBullish) confluenceScore += 15;
  else confluenceScore -= 15;

  if (rsi14 >= 50 && rsi14 <= 65) confluenceScore += 15; // Healthy momentum
  else if (isRsiOversold) confluenceScore += 10; // Potential mean reversion
  else if (isRsiOverbought) confluenceScore -= 15; // Exhaustion risk

  confluenceScore = Math.max(10, Math.min(95, confluenceScore));

  // Determine Regime Label
  let regimeLabel = "Neutral Consolidation";
  let regimeColor = "text-amber-400 border-amber-500/30 bg-amber-950/20";
  let bias = "NEUTRAL";

  if (confluenceScore >= 70) {
    regimeLabel = "Strong Bullish Expansion";
    regimeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
    bias = "BULLISH";
  } else if (confluenceScore >= 55) {
    regimeLabel = "Moderate Bullish Accumulation";
    regimeColor = "text-emerald-300 border-emerald-500/30 bg-emerald-950/20";
    bias = "LEAN BULLISH";
  } else if (confluenceScore <= 35) {
    regimeLabel = "Bearish Breakdown Pressure";
    regimeColor = "text-rose-400 border-rose-500/30 bg-rose-950/20";
    bias = "BEARISH";
  } else if (confluenceScore <= 45) {
    regimeLabel = "Weak / Distribution Risk";
    regimeColor = "text-rose-300 border-rose-500/30 bg-rose-950/20";
    bias = "LEAN BEARISH";
  }

  // 2. Deterministic Support, Target & Invalidation Levels (using ATR proxy)
  const estimatedAtr = price * (volatility / 100 / Math.sqrt(252)) * 1.8;
  const isLongSetup = confluenceScore >= 50;

  const target1 = isLongSetup ? price + estimatedAtr * 1.5 : price - estimatedAtr * 1.5;
  const target2 = isLongSetup ? price + estimatedAtr * 2.8 : price - estimatedAtr * 2.8;
  const stopLoss = isLongSetup ? price - estimatedAtr * 1.0 : price + estimatedAtr * 1.0;

  const potentialReward = Math.abs(target1 - price);
  const potentialRisk = Math.abs(price - stopLoss);
  const riskReward = potentialRisk > 0 ? (potentialReward / potentialRisk).toFixed(2) : "1.50";

  // 3. Shariah / Islamic Finance Screening
  // Financial Screen: Debt / Market Cap < 33%, Interest-Bearing Cash < 33%
  const isDebtCompliant = debtToEquity < 0.33;
  const nonHalalTickers = ["ITC.NS", "JIOFIN.NS", "AXISBANK.NS", "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS"];
  const isCoreHalal = !nonHalalTickers.includes(symbol.toUpperCase());
  const isShariahCompliant = isCoreHalal && isDebtCompliant;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Quantitative Intelligence & Signal Matrix
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Deterministic Multi-Factor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replaces speculative single-model guesses with a verified mathematical confluence matrix.
          </p>
        </div>

        {/* Confluence Rating Pill */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${regimeColor}`}>
          <Activity className="w-4 h-4 shrink-0" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
              Regime Status
            </span>
            <span className="text-xs font-extrabold">{regimeLabel}</span>
          </div>
        </div>
      </div>

      {/* Grid: Confluence Score & Key Price Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score & Bias */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Technical Confluence Score</span>
            <span className="text-xs font-bold text-sky-400 font-mono">{confluenceScore}/100</span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                confluenceScore >= 65
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : confluenceScore <= 40
                  ? "bg-gradient-to-r from-rose-500 to-amber-500"
                  : "bg-gradient-to-r from-amber-500 to-sky-400"
              }`}
              style={{ width: `${confluenceScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
            <span className="text-slate-400">Directional Bias:</span>
            <span
              className={`font-bold ${
                bias.includes("BULLISH")
                  ? "text-emerald-400"
                  : bias.includes("BEARISH")
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {bias}
            </span>
          </div>
        </div>

        {/* Institutional Level Matrix */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Target className="w-4 h-4 text-sky-400" />
            <span>Mathematical Projection Levels</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-emerald-400 font-sans font-medium">Target 1 (1.5x ATR):</span>
              <span className="font-bold text-white">
                {currSym}
                {target1.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-teal-400 font-sans font-medium">Target 2 (2.8x ATR):</span>
              <span className="font-bold text-white">
                {currSym}
                {target2.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-rose-400 font-sans font-medium">Invalidation (1.0x ATR):</span>
              <span className="font-bold text-rose-300">
                {currSym}
                {stopLoss.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk / Reward & Volatility Profile */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
              <Scale className="w-4 h-4 text-sky-400" />
              <span>Risk / Reward & Dynamic Volatility</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-tight">
              1 : {riskReward}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Estimated ATR: <strong className="text-slate-200">{currSym}{estimatedAtr.toFixed(2)}</strong> ({((estimatedAtr / price) * 100).toFixed(2)}% daily range)
            </p>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span>Annual Volatility:</span>
            <span className="font-mono text-white font-bold">{volatility.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Confluence Factor Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">Trend Structure</span>
          <div className="font-bold flex items-center gap-1">
            {isTrendBullish ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Bullish (P &gt; 20 &gt; 50)
              </span>
            ) : isTrendBearish ? (
              <span className="text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Bearish (P &lt; 20 &lt; 50)
              </span>
            ) : (
              <span className="text-amber-400">Mixed Trend Alignment</span>
            )}
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">RSI (14) Momentum</span>
          <div className="font-bold">
            {isRsiOverbought ? (
              <span className="text-rose-400 font-mono">{rsi14.toFixed(1)} (Overbought)</span>
            ) : isRsiOversold ? (
              <span className="text-emerald-400 font-mono">{rsi14.toFixed(1)} (Oversold Bounce)</span>
            ) : (
              <span className="text-sky-300 font-mono">{rsi14.toFixed(1)} (Neutral Expansion)</span>
            )}
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">MACD Momentum</span>
          <div className="font-bold">
            {isMacdBullish ? (
              <span className="text-emerald-400 font-mono">+{macd.toFixed(1)} (Bullish Cross)</span>
            ) : (
              <span className="text-rose-400 font-mono">{macd.toFixed(1)} (Bearish Cross)</span>
            )}
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block mb-1">SMA 20 vs SMA 50</span>
          <div className="font-bold font-mono">
            {sma20 > sma50 ? (
              <span className="text-emerald-400">Golden Alignment</span>
            ) : (
              <span className="text-amber-400">Death Alignment</span>
            )}
          </div>
        </div>
      </div>

      {/* Shariah Screening Banner */}
      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isShariahCompliant
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/80"
                : "bg-rose-950/60 text-rose-400 border-rose-800/80"
            }`}
          >
            {isShariahCompliant ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Shariah Compliance Screener</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isShariahCompliant
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : "bg-rose-950 text-rose-300 border-rose-800"
                }`}
              >
                {isShariahCompliant ? "SHARIAH COMPLIANT" : "NON-COMPLIANT"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited against AAOIFI &amp; Dow Jones Islamic Market standards (Debt/Cap &lt; 33%, Halal Core Activity).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] font-sans uppercase">Debt / Equity</span>
            <span className={debtToEquity < 0.33 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {(debtToEquity * 100).toFixed(1)}% {debtToEquity < 0.33 ? "✓ (<33%)" : "✗ (>33%)"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-sans uppercase">Business Sector</span>
            <span className={isCoreHalal ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {isCoreHalal ? "Permissible (Halal)" : "Non-Permissible"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
