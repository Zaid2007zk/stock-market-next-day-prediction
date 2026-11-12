"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertCircle, TrendingUp, Sliders, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface BacktestProps {
  language?: "en" | "hinglish";
}

export const BacktestVisualizer: React.FC<BacktestProps> = ({ language = "en" }) => {
  const [mode, setMode] = useState<"clean" | "lookahead">("clean");
  const [tradeValue, setTradeValue] = useState<number>(50000); // ₹50,000 per trade
  const [numTrades, setNumTrades] = useState<number>(40); // 40 trades
  const [grossProfit, setGrossProfit] = useState<number>(35000); // ₹35,000 gross gain

  // Statutory Indian Transaction Friction Schedule
  const sttPerTrade = tradeValue * 0.001; // 0.1% STT
  const brokeragePerTrade = Math.min(tradeValue * 0.0003, 20.0); // Flat ₹20 cap
  const turnoverPerTrade = tradeValue * 0.0000325; // 0.00325% NSE
  const gstPerTrade = (brokeragePerTrade + turnoverPerTrade) * 0.18; // 18% GST
  const stampDutyPerTrade = tradeValue * 0.00015; // 0.015% Stamp duty buy
  const slippagePerTrade = tradeValue * 0.0005; // 5 bps slippage

  const totalFrictionsPerTrade =
    sttPerTrade + brokeragePerTrade + turnoverPerTrade + gstPerTrade + stampDutyPerTrade + slippagePerTrade;
  const totalFrictionsAllTrades = Math.round(totalFrictionsPerTrade * numTrades);
  const netProfit = grossProfit - totalFrictionsAllTrades;
  const frictionDragPct = ((totalFrictionsAllTrades / (grossProfit || 1)) * 100).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            {language === "hinglish"
              ? "Walk-Forward Validation & Statutory Frictions"
              : "Walk-Forward Testing & Indian Transaction Frictions"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Lookahead bias ka dhoka aur statutory taxes (STT, GST, brokerage) ka asali impact dekhein"
              : "Understand chronological execution purity, eliminate lookahead bias, and calculate exact friction drag"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("clean")}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              mode === "clean"
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Walk-Forward (Pristine)
          </button>
          <button
            onClick={() => setMode("lookahead")}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              mode === "lookahead"
                ? "bg-rose-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Lookahead Bias (Flawed)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Timeline Visualizer */}
        <div className="lg:col-span-6 bg-slate-950/90 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between">
            <span>Execution Timeline Simulation</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-bold ${
                mode === "clean"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-rose-950 text-rose-400 border border-rose-800"
              }`}
            >
              {mode === "clean" ? "CHRONOLOGICAL (BAR T-1)" : "LEAKED FUTURE (BAR T+1)"}
            </span>
          </div>

          {/* Timeline Nodes */}
          <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 absolute -left-[21px] top-1" />
              <div className="text-xs font-bold text-slate-300">Bar T-1 (Yesterday Close)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Moving average and RSI computed strictly on completed historical bars.
              </div>
            </div>

            <div className="relative">
              <span
                className={`w-2.5 h-2.5 rounded-full absolute -left-[21px] top-1 ${
                  mode === "clean" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-ping"
                }`}
              />
              <div className="text-xs font-bold text-sky-400">Bar T (Today Open / Execution)</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {mode === "clean"
                  ? "Order placed at market open without knowing whether today will close higher or lower."
                  : "LOOKAHEAD CHEAT: Algorithm peeks at today's high before deciding whether to enter!"}
              </div>
            </div>

            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 absolute -left-[21px] top-1" />
              <div className="text-xs font-bold text-slate-400">Bar T+1 (Tomorrow - Future)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Future price action is completely unknown and protected from mutation.
              </div>
            </div>
          </div>

          {/* Mode Explanation Box */}
          <div
            className={`p-3 rounded-lg border text-xs leading-relaxed ${
              mode === "clean"
                ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                : "bg-rose-950/30 border-rose-800/60 text-rose-300"
            }`}
          >
            {mode === "clean" ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "hinglish"
                    ? "MarketPulse Walk-Forward Guarantee: Humne proof kiya hai ki time T ke baad ke data ko 5x mutate karne par bhi time T tak ke trades me 0% badlaav aata hai. Real testing 100% honest hoti hai."
                    : "Strict Walk-Forward Guarantee: In our test suite, mutating bars after time T by 500% leaves historical backtest trades up to time T 100% bit-for-bit identical. No future data leaks."}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === "hinglish"
                    ? "Lookahead Bias Dhoka: Agar backtest future price dekh leta hai, to paper par 95% win rate dikhega lekin real paise lagate hi strategy collapse ho jayegi."
                    : "Fatal Flaw: Incorporating future bars creates illusory 90%+ win rates that instantly blow up when executed with real capital."}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Real-World Indian Frictions Calculator */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3.5 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wide flex justify-between">
            <span>{language === "hinglish" ? "Indian Transaction Frictions" : "Statutory Indian Frictions"}</span>
            <span className="font-mono text-amber-400">Total Drag: {frictionDragPct}%</span>
          </div>

          {/* Trade Value Slider */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Average Trade Value:</span>
              <span className="font-mono font-bold text-sky-400">₹{tradeValue.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="10000"
              value={tradeValue}
              onChange={(e) => setTradeValue(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Number of Trades Slider */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Completed Trades Count:</span>
              <span className="font-mono font-bold text-amber-400">{numTrades} Trades</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={numTrades}
              onChange={(e) => setNumTrades(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Statutory Fees Breakdown Table */}
          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>STT @ 0.1% (Delivery):</span>
              <span className="text-slate-200">₹{(sttPerTrade * numTrades).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Brokerage (₹20 flat cap):</span>
              <span className="text-slate-200">₹{(brokeragePerTrade * numTrades).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST @ 18% (Brokerage + Turnover):</span>
              <span className="text-slate-200">₹{(gstPerTrade * numTrades).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Stamp Duty & Exchange Fees:</span>
              <span className="text-slate-200">₹{((turnoverPerTrade + stampDutyPerTrade) * numTrades).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Execution Slippage (~5 bps):</span>
              <span className="text-slate-200">₹{(slippagePerTrade * numTrades).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-1 flex justify-between text-rose-400 font-bold">
              <span>Total Frictional Drain:</span>
              <span>-₹{totalFrictionsAllTrades.toLocaleString()}</span>
            </div>
          </div>

          {/* Gross vs Net Profit Summary */}
          <div className="p-3 bg-slate-900 rounded border border-slate-700 font-sans flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">Gross Profit</span>
              <span className="font-mono font-bold text-slate-300">₹{grossProfit.toLocaleString()}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Total Taxes & Frictions</span>
              <span className="font-mono font-bold text-rose-400">-₹{totalFrictionsAllTrades.toLocaleString()}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Real Net In-Pocket</span>
              <span
                className={`font-mono font-bold text-sm ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                ₹{netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
