"use client";

import React, { useState } from "react";
import { Award, Compass, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface PortfolioHealthProps {
  language?: "en" | "hinglish";
}

export const PortfolioHealthVisualizer: React.FC<PortfolioHealthProps> = ({ language = "en" }) => {
  const [regime, setRegime] = useState<"bull" | "bear" | "choppy" | "volatile">("bull");
  const [qualityScore, setQualityScore] = useState<number>(85);
  const [momentumScore, setMomentumScore] = useState<number>(75);
  const [valueScore, setValueScore] = useState<number>(68);

  // Behavioral checklist state
  const [fomoFree, setFomoFree] = useState<boolean>(true);
  const [cutLosses, setCutLosses] = useState<boolean>(true);
  const [noRevenge, setNoRevenge] = useState<boolean>(true);
  const [planAdherence, setPlanAdherence] = useState<boolean>(true);

  // Composite calculation
  const compositeScore = Math.round(qualityScore * 0.4 + momentumScore * 0.35 + valueScore * 0.25);
  const disciplineScore =
    (Number(fomoFree) + Number(cutLosses) + Number(noRevenge) + Number(planAdherence)) * 25;

  const regimeData = {
    bull: {
      name: "Low-Volatility Bull Trend",
      nameHinglish: "Low-Volatility Bull Market",
      desc: "Orderly upward trends with shallow pullbacks. Moving average crossovers and dip-buying thrive.",
      descHinglish: "Dheere-dheere lagatar upar jana. Moving average dip buying sabse zyada profit deti hai.",
      winRateTrend: "68%",
      winRateMeanRev: "38%",
      bestStrategy: "Trend-Following & Moving Average Cross",
    },
    bear: {
      name: "High-Volatility Panic (Bear)",
      nameHinglish: "High-Volatility Bear Panic",
      desc: "Violent gap-downs and sudden rallies. Cash preservation, trailing stops, and hedges are paramount.",
      descHinglish: "Tezi se crash aana aur panic selling. Cash me rehna aur stop-loss lagana sabse best hota hai.",
      winRateTrend: "42%",
      winRateMeanRev: "55%",
      bestStrategy: "Cash Preservation & Short Hedging",
    },
    choppy: {
      name: "Low-Volatility Range (Choppy)",
      nameHinglish: "Low-Volatility Sideways Market",
      desc: "Directionless consolidation. Breakouts fail repeatedly. Mean-reversion oscillators (RSI, Bollinger) excel.",
      descHinglish: "Sideways range. Yaha har breakout fail hota hai, RSI support par buy aur resistance par sell best hai.",
      winRateTrend: "28%",
      winRateMeanRev: "72%",
      bestStrategy: "Mean-Reversion Oscillators (RSI / Bands)",
    },
    volatile: {
      name: "High-Volatility Expansion",
      nameHinglish: "High-Volatility Expansion (Toofani)",
      desc: "Erratic swings in both directions. Wide stop-losses or staying in cash avoids whipsaws.",
      descHinglish: "Badi-badi candles aur dono taraf jhatke. Position size bohot chhota rakhna chahiye.",
      winRateTrend: "34%",
      winRateMeanRev: "45%",
      bestStrategy: "Reduced Position Sizing & ATR Stops",
    },
  };

  const activeRegime = regimeData[regime];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            {language === "hinglish"
              ? "Market Regimes & Behavioral Mastery"
              : "Market Regimes & Portfolio Health Scorecard"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Alag-alag market ke mausam me strategy chunein aur trader psychology ka test karein"
              : "Adapt strategies to prevailing macro regimes and audit psychological discipline"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Health Score:</span>
          <span className="font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded text-xs">
            {compositeScore} / 100
          </span>
          <span className="text-xs text-slate-400">Discipline:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
              disciplineScore >= 75
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-amber-950 text-amber-400 border-amber-800"
            }`}
          >
            {disciplineScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Regime Simulator */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3.5 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wide">
            {language === "hinglish" ? "1. Market Regime Selector" : "1. Market Regime Adaptation"}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["bull", "bear", "choppy", "volatile"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                className={`p-2 rounded text-left transition border ${
                  regime === r
                    ? "bg-sky-950 border-sky-500 text-sky-300 ring-1 ring-sky-500"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-bold text-[11px] capitalize">{r} Market</div>
                <div className="text-[10px] text-slate-400 truncate">{regimeData[r].name}</div>
              </button>
            ))}
          </div>

          {/* Regime Details Card */}
          <div className="p-3 bg-slate-900 rounded border border-slate-700/60 space-y-2">
            <div className="font-bold text-sky-300 text-xs">
              {language === "hinglish" ? activeRegime.nameHinglish : activeRegime.name}
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {language === "hinglish" ? activeRegime.descHinglish : activeRegime.desc}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block">Trend Strategy Win Rate:</span>
                <span className="font-mono font-bold text-amber-400">{activeRegime.winRateTrend}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mean-Reversion Win Rate:</span>
                <span className="font-mono font-bold text-emerald-400">{activeRegime.winRateMeanRev}</span>
              </div>
            </div>
            <div className="text-[10px] text-sky-400 font-semibold pt-1">
              Optimal Approach: {activeRegime.bestStrategy}
            </div>
          </div>
        </div>

        {/* Behavioral Psychology Self-Audit */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3.5 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wide flex justify-between">
            <span>{language === "hinglish" ? "2. Trader Psychology Audit" : "2. Behavioral Bias Self-Audit"}</span>
            <span className="text-emerald-400 font-bold">{disciplineScore}% Pass</span>
          </div>

          <div className="space-y-2.5">
            {/* Bias 1: FOMO */}
            <label className="flex items-start gap-2.5 p-2 bg-slate-900 rounded border border-slate-800 cursor-pointer hover:bg-slate-850">
              <input
                type="checkbox"
                checked={fomoFree}
                onChange={(e) => setFomoFree(e.target.checked)}
                className="mt-0.5 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-bold text-slate-200 block text-[11px]">
                  No FOMO Chasing (Patience Rule)
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === "hinglish"
                    ? "Mai 3 din se bhaag rahe stock ko top par lalach me nahi kharidunga"
                    : "I refuse to chase extended parabolic candles without a proper risk pullback setup"}
                </span>
              </div>
            </label>

            {/* Bias 2: Cutting Losses */}
            <label className="flex items-start gap-2.5 p-2 bg-slate-900 rounded border border-slate-800 cursor-pointer hover:bg-slate-850">
              <input
                type="checkbox"
                checked={cutLosses}
                onChange={(e) => setCutLosses(e.target.checked)}
                className="mt-0.5 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-bold text-slate-200 block text-[11px]">
                  Zero Hope-Holding (Disposition Defeated)
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === "hinglish"
                    ? "Stop-loss hit hote hi turant exit karunga, umeed me hold nahi karunga"
                    : "I cut losses ruthlessly at stop-loss without hoping it will magically bounce back"}
                </span>
              </div>
            </label>

            {/* Bias 3: Revenge Trading */}
            <label className="flex items-start gap-2.5 p-2 bg-slate-900 rounded border border-slate-800 cursor-pointer hover:bg-slate-850">
              <input
                type="checkbox"
                checked={noRevenge}
                onChange={(e) => setNoRevenge(e.target.checked)}
                className="mt-0.5 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-bold text-slate-200 block text-[11px]">
                  No Revenge Trading (Cool-Off Rule)
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === "hinglish"
                    ? "Loss ke baad gusse me over-leveraged trade nahi lunga; terminal band karunga"
                    : "After two consecutive losses, I step away from the terminal to prevent emotional tilt"}
                </span>
              </div>
            </label>

            {/* Bias 4: Pre-Planned Execution */}
            <label className="flex items-start gap-2.5 p-2 bg-slate-900 rounded border border-slate-800 cursor-pointer hover:bg-slate-850">
              <input
                type="checkbox"
                checked={planAdherence}
                onChange={(e) => setPlanAdherence(e.target.checked)}
                className="mt-0.5 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
              />
              <div>
                <span className="font-bold text-slate-200 block text-[11px]">
                  Written Trade Plan Adherence
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === "hinglish"
                    ? "Har trade me entry, stop-loss aur target pehle se tay hota hai"
                    : "Every trade has predetermined entry, stop-loss, and target with mathematical position sizing"}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
