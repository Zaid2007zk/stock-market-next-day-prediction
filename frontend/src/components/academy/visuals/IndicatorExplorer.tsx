"use client";

import React, { useState } from "react";
import { Activity, Sliders, TrendingUp, AlertTriangle, Info } from "lucide-react";

interface IndicatorProps {
  language?: "en" | "hinglish";
}

export const IndicatorExplorer: React.FC<IndicatorProps> = ({ language = "en" }) => {
  const [activeIndicator, setActiveIndicator] = useState<"ma" | "rsi" | "bb" | "macd">("ma");
  const [maPeriod, setMaPeriod] = useState<number>(20);
  const [rsiPeriod, setRsiPeriod] = useState<number>(14);
  const [bbStdDev, setBbStdDev] = useState<number>(2.0);

  // Deterministic 30-point price curve showing a trend followed by consolidation
  const basePrices = [
    100, 101, 102, 101.5, 103, 105, 104, 106, 108, 107.5,
    110, 112, 115, 114, 118, 122, 125, 124, 126, 128,
    127, 129, 131, 130, 128, 126, 125, 127, 128, 130,
  ];

  // Calculate SMA
  const smaValues = basePrices.map((_, i) => {
    if (i < maPeriod - 1) return null;
    const slice = basePrices.slice(i - maPeriod + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return parseFloat(avg.toFixed(2));
  });

  // Calculate EMA
  const k = 2 / (maPeriod + 1);
  let emaPrev = basePrices[0];
  const emaValues = basePrices.map((p, i) => {
    if (i === 0) return p;
    const cur = p * k + emaPrev * (1 - k);
    emaPrev = cur;
    return parseFloat(cur.toFixed(2));
  });

  // Calculate RSI approximation
  const rsiValues = basePrices.map((_, i) => {
    if (i < rsiPeriod) return 50.0;
    let gains = 0;
    let losses = 0;
    for (let j = i - rsiPeriod + 1; j <= i; j++) {
      const diff = basePrices[j] - basePrices[j - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / rsiPeriod;
    const avgLoss = losses / rsiPeriod || 0.001;
    const rs = avgGain / avgLoss;
    return parseFloat((100 - 100 / (1 + rs)).toFixed(1));
  });

  // SVG Chart Geometry
  const width = 480;
  const height = 180;
  const minP = 95;
  const maxP = 135;

  const getX = (idx: number) => (idx / (basePrices.length - 1)) * width;
  const getY = (price: number) => height - ((price - minP) / (maxP - minP)) * height;

  const pricePath = basePrices
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p).toFixed(1)}`)
    .join(" ");

  const smaPath = smaValues
    .map((p, i) => {
      if (p === null) return "";
      const prefix = i === maPeriod - 1 ? "M" : "L";
      return `${prefix} ${getX(i).toFixed(1)} ${getY(p).toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");

  const emaPath = emaValues
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p).toFixed(1)}`)
    .join(" ");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            {language === "hinglish" ? "Technical Indicator Explorer & Lag Checker" : "Technical Indicator Explorer"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Indicators ke mathematical formulas aur indicator lag ka asali asar samjhein"
              : "Visualize moving averages, momentum oscillators, and the critical danger of indicator lag"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveIndicator("ma")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeIndicator === "ma" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            SMA vs EMA
          </button>
          <button
            onClick={() => setActiveIndicator("rsi")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeIndicator === "rsi" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            RSI (Wilder)
          </button>
          <button
            onClick={() => setActiveIndicator("bb")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeIndicator === "bb" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Bollinger Bands
          </button>
          <button
            onClick={() => setActiveIndicator("macd")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeIndicator === "macd" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            MACD Histogram
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* SVG Indicator Chart */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl p-4 border border-slate-800 relative">
          <svg className="w-full h-48 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            {/* Background Grid */}
            <line x1="0" y1="45" x2={width} y2="45" stroke="#1e293b" strokeDasharray="2 2" />
            <line x1="0" y1="90" x2={width} y2="90" stroke="#1e293b" strokeDasharray="2 2" />
            <line x1="0" y1="135" x2={width} y2="135" stroke="#1e293b" strokeDasharray="2 2" />

            {/* Price Line (Sky Blue) */}
            <path d={pricePath} fill="none" stroke="#38BDF8" strokeWidth="2.5" />

            {/* SMA vs EMA Mode */}
            {activeIndicator === "ma" && (
              <>
                {smaPath && <path d={smaPath} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />}
                {emaPath && <path d={emaPath} fill="none" stroke="#10B981" strokeWidth="2" />}
              </>
            )}

            {/* Bollinger Bands Mode */}
            {activeIndicator === "bb" && (
              <>
                {smaPath && (
                  <>
                    <path d={smaPath} fill="none" stroke="#6366F1" strokeWidth="1.5" />
                    {/* Simulated upper band */}
                    <path
                      d={smaValues
                        .map((p, i) => {
                          if (p === null) return "";
                          const prefix = i === maPeriod - 1 ? "M" : "L";
                          return `${prefix} ${getX(i).toFixed(1)} ${getY(p + 6 * (bbStdDev / 2)).toFixed(1)}`;
                        })
                        .filter(Boolean)
                        .join(" ")}
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {/* Simulated lower band */}
                    <path
                      d={smaValues
                        .map((p, i) => {
                          if (p === null) return "";
                          const prefix = i === maPeriod - 1 ? "M" : "L";
                          return `${prefix} ${getX(i).toFixed(1)} ${getY(p - 6 * (bbStdDev / 2)).toFixed(1)}`;
                        })
                        .filter(Boolean)
                        .join(" ")}
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  </>
                )}
              </>
            )}
          </svg>

          {/* Sub-panel for RSI or MACD when active */}
          {activeIndicator === "rsi" && (
            <div className="mt-3 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>RSI (14 Wilder) Sub-Oscillator</span>
                <span className="font-mono text-purple-400 font-bold">
                  Current RSI: {rsiValues[rsiValues.length - 1]}
                </span>
              </div>
              <div className="h-10 bg-slate-900 rounded relative overflow-hidden flex items-center px-2">
                <div className="absolute top-2 left-0 right-0 border-b border-rose-500/30 border-dashed" />
                <div className="absolute bottom-2 left-0 right-0 border-b border-emerald-500/30 border-dashed" />
                <span className="text-[9px] text-rose-400 absolute right-2 top-0.5">70 (Overbought)</span>
                <span className="text-[9px] text-emerald-400 absolute right-2 bottom-0.5">30 (Oversold)</span>
                <div
                  className="h-1.5 bg-purple-500 rounded-full transition-all"
                  style={{ width: `${rsiValues[rsiValues.length - 1]}%` }}
                />
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-400 rounded" /> Stock Price (Close)
            </span>
            {activeIndicator === "ma" && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-500 rounded border-dashed" /> SMA ({maPeriod}) - Laggy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-emerald-500 rounded" /> EMA ({maPeriod}) - Faster
                </span>
              </>
            )}
            {activeIndicator === "bb" && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-indigo-400 rounded border-dashed" /> ±{bbStdDev}σ Bollinger Bands
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Controls & Educational Takeaway */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wide">
              {language === "hinglish" ? "Indicator Settings" : "Tweak Parameters"}
            </div>

            {/* Slider 1 */}
            {activeIndicator === "ma" && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Moving Average Period:</span>
                  <span className="font-bold text-sky-400">{maPeriod} Days</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maPeriod}
                  onChange={(e) => setMaPeriod(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Higher periods smooth out noise but create severe time lag.
                </p>
              </div>
            )}

            {activeIndicator === "rsi" && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">RSI Wilder Window:</span>
                  <span className="font-bold text-purple-400">{rsiPeriod} Periods</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="28"
                  value={rsiPeriod}
                  onChange={(e) => setRsiPeriod(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Standard is 14. 7 is hyperactive noise; 28 is extremely sluggish.
                </p>
              </div>
            )}

            {activeIndicator === "bb" && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Std Deviation Multiplier:</span>
                  <span className="font-bold text-indigo-400">{bbStdDev.toFixed(1)}σ</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="3.0"
                  step="0.1"
                  value={bbStdDev}
                  onChange={(e) => setBbStdDev(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  2.0 contains 95% of normal distribution returns.
                </p>
              </div>
            )}
          </div>

          {/* Critical Indicator Limitation Warning Card */}
          <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>{language === "hinglish" ? "Indicator Ki Asali Limit" : "The Limitation of Indicators"}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {language === "hinglish"
                ? "Saare indicators price aur volume ke derivative hote hain. Wo bhavishya nahi batate balki past ka smoothed mathematical calculation dikhate hain. Indicator se pehle support, resistance aur market context dekhein."
                : "Indicators are mathematical derivatives of past price and volume. They can never predict the future. Combining 5 indicators on one chart causes analysis paralysis and false signals."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
