"use client";

import React, { useState } from "react";
import { Sliders, HelpCircle, Sparkles, TrendingUp, TrendingDown } from "lucide-react";

interface CandlestickAnatomistProps {
  language?: "en" | "hinglish";
}

export const CandlestickAnatomist: React.FC<CandlestickAnatomistProps> = ({ language = "en" }) => {
  const [open, setOpen] = useState<number>(100);
  const [close, setClose] = useState<number>(115);
  const [high, setHigh] = useState<number>(125);
  const [low, setLow] = useState<number>(90);

  // Maintain valid OHLC invariants
  const handleOpenChange = (val: number) => {
    setOpen(val);
    if (val > high) setHigh(val);
    if (val < low) setLow(val);
  };

  const handleCloseChange = (val: number) => {
    setClose(val);
    if (val > high) setHigh(val);
    if (val < low) setLow(val);
  };

  const handleHighChange = (val: number) => {
    const maxVal = Math.max(val, open, close);
    setHigh(maxVal);
  };

  const handleLowChange = (val: number) => {
    const minVal = Math.min(val, open, close);
    setLow(minVal);
  };

  const isBullish = close >= open;
  const bodyTop = Math.max(open, close);
  const bodyBottom = Math.min(open, close);
  const bodyHeight = bodyTop - bodyBottom;
  const upperWick = high - bodyTop;
  const lowerWick = bodyBottom - low;
  const totalRange = high - low || 1;

  // Pattern detection logic based on exact candlestick proportions
  let patternName = "Standard Candlestick";
  let patternDesc = "Balanced session with standard auction range.";
  let patternHinglish = "Normal trading session jisme buyer aur seller dono active the.";

  if (bodyHeight <= totalRange * 0.1) {
    patternName = "Doji (Indecision)";
    patternDesc = "Open and Close are virtually identical. Neither buyers nor sellers were able to gain directional control.";
    patternHinglish = "Open aur Close lagbhag barabar hain. Market me anischitata (indecision) hai.";
  } else if (lowerWick >= bodyHeight * 2 && upperWick <= bodyHeight * 0.3) {
    patternName = isBullish ? "Hammer (Bullish Rejection)" : "Hanging Man";
    patternDesc = "Long lower shadow shows sellers tried to crash price, but buyers violently stepped in and bought the dip.";
    patternHinglish = "Lambi lower wick dikhati hai ki buyers ne dip ko aggressively kharid liya hai.";
  } else if (upperWick >= bodyHeight * 2 && lowerWick <= bodyHeight * 0.3) {
    patternName = "Shooting Star (Bearish Rejection)";
    patternDesc = "Long upper shadow demonstrates that buyers surged to a high, but aggressive institutional sellers dumped into the rally.";
    patternHinglish = "Lambi upper wick batati hai ki rally me sellers ne dump kar diya aur price gira di.";
  } else if (bodyHeight >= totalRange * 0.85) {
    patternName = isBullish ? "Bullish Marubozu (Total Control)" : "Bearish Marubozu (Total Selloff)";
    patternDesc = isBullish
      ? "Buyers maintained relentless upside pressure from open to close with virtually zero pullbacks."
      : "Sellers dominated the market from open to close with zero buyer resistance.";
    patternHinglish = isBullish
      ? "Buyers shuru se aakhri tak poore control me the, koi selling nahi aayi."
      : "Sellers ne open se close tak market ko ek tarfa giraya.";
  }

  // Coordinate mapping for SVG (canvas height 280, range 80 to 140)
  const mapY = (val: number) => {
    const minP = 75;
    const maxP = 145;
    const padding = 20;
    const height = 240;
    return height + padding - ((val - minP) / (maxP - minP)) * height;
  };

  const svgHigh = mapY(high);
  const svgLow = mapY(low);
  const svgBodyTop = mapY(bodyTop);
  const svgBodyBottom = mapY(bodyBottom);
  const svgBodyHeight = Math.max(4, svgBodyBottom - svgBodyTop);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            {language === "hinglish" ? "Interactive Candlestick Anatomist" : "Interactive Candlestick Anatomist"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Open, High, Low, Close ko adjust karein aur dekhein body, wicks aur patterns kaise bante hain"
              : "Manipulate Open, High, Low, and Close sliders to inspect wick rejections and automated pattern detection"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
              isBullish
                ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                : "bg-rose-950 text-rose-300 border border-rose-700"
            }`}
          >
            {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isBullish ? "BULLISH GREEN CANDLE" : "BEARISH RED CANDLE"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Candlestick Graphic */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center relative min-h-[300px]">
          <svg className="w-48 h-64 overflow-visible" viewBox="0 0 160 280">
            {/* Background grid lines */}
            <line x1="10" y1="30" x2="150" y2="30" stroke="#1e293b" strokeDasharray="2 2" />
            <line x1="10" y1="140" x2="150" y2="140" stroke="#1e293b" strokeDasharray="2 2" />
            <line x1="10" y1="250" x2="150" y2="250" stroke="#1e293b" strokeDasharray="2 2" />

            {/* Upper Wick */}
            <line
              x1="80"
              y1={svgHigh}
              x2="80"
              y2={svgBodyTop}
              stroke={isBullish ? "#10B981" : "#F43F5E"}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Real Body */}
            <rect
              x="52"
              y={svgBodyTop}
              width="56"
              height={svgBodyHeight}
              fill={isBullish ? "#10B981" : "#F43F5E"}
              stroke={isBullish ? "#059669" : "#E11D48"}
              strokeWidth="2"
              rx="2"
            />

            {/* Lower Wick */}
            <line
              x1="80"
              y1={svgBodyBottom}
              x2="80"
              y2={svgLow}
              stroke={isBullish ? "#10B981" : "#F43F5E"}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Annotations */}
            <text x="115" y={svgHigh + 4} fill="#94a3b8" fontSize="10" fontFamily="monospace">
              High: {high}
            </text>
            <text x="115" y={svgBodyTop + 4} fill={isBullish ? "#10b981" : "#f43f5e"} fontSize="10" fontFamily="monospace">
              {isBullish ? `Close: ${close}` : `Open: ${open}`}
            </text>
            <text x="115" y={svgBodyBottom + 4} fill={isBullish ? "#10b981" : "#f43f5e"} fontSize="10" fontFamily="monospace">
              {isBullish ? `Open: ${open}` : `Close: ${close}`}
            </text>
            <text x="115" y={svgLow + 4} fill="#94a3b8" fontSize="10" fontFamily="monospace">
              Low: {low}
            </text>
          </svg>

          {/* Quick Metrics Badge */}
          <div className="w-full mt-2 pt-2 border-t border-slate-800 grid grid-cols-3 text-center text-[11px] text-slate-400">
            <div>
              <span className="block text-slate-400">Upper Wick</span>
              <span className="font-mono text-slate-200">₹{upperWick}</span>
            </div>
            <div>
              <span className="block text-slate-400">Real Body</span>
              <span className={`font-mono font-bold ${isBullish ? "text-emerald-400" : "text-rose-400"}`}>
                ₹{bodyHeight}
              </span>
            </div>
            <div>
              <span className="block text-slate-400">Lower Wick</span>
              <span className="font-mono text-slate-200">₹{lowerWick}</span>
            </div>
          </div>
        </div>

        {/* Sliders & Pattern Interpretation Panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* Pattern Classifier Box */}
          <div className="p-4 bg-slate-950/80 rounded-lg border border-sky-800/60 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Pattern Recognized:
              </span>
              <span className="text-sm font-bold text-slate-100">{patternName}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === "hinglish" ? patternHinglish : patternDesc}
            </p>
          </div>

          {/* Sliders */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-lg border border-slate-800 text-xs">
            {/* High Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">High Price (Extreme):</span>
                <span className="font-mono font-bold text-sky-400">₹{high}</span>
              </div>
              <input
                type="range"
                min="100"
                max="140"
                value={high}
                onChange={(e) => handleHighChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Close Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Close Price:</span>
                <span className={`font-mono font-bold ${isBullish ? "text-emerald-400" : "text-rose-400"}`}>
                  ₹{close}
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="135"
                value={close}
                onChange={(e) => handleCloseChange(parseInt(e.target.value))}
                className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${
                  isBullish ? "accent-emerald-500" : "accent-rose-500"
                }`}
              />
            </div>

            {/* Open Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Open Price:</span>
                <span className="font-mono font-bold text-amber-400">₹{open}</span>
              </div>
              <input
                type="range"
                min="80"
                max="135"
                value={open}
                onChange={(e) => handleOpenChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Low Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Low Price (Extreme):</span>
                <span className="font-mono font-bold text-sky-400">₹{low}</span>
              </div>
              <input
                type="range"
                min="75"
                max="110"
                value={low}
                onChange={(e) => handleLowChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 self-center text-[11px]">Quick Presets:</span>
            <button
              onClick={() => {
                setOpen(100);
                setClose(105);
                setHigh(107);
                setLow(80);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Hammer (Dip Rejection)
            </button>
            <button
              onClick={() => {
                setOpen(105);
                setClose(100);
                setHigh(130);
                setLow(98);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Shooting Star (Top Rejection)
            </button>
            <button
              onClick={() => {
                setOpen(105);
                setClose(105);
                setHigh(125);
                setLow(85);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Doji (Indecision)
            </button>
            <button
              onClick={() => {
                setOpen(90);
                setClose(130);
                setHigh(131);
                setLow(89);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Bullish Marubozu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
