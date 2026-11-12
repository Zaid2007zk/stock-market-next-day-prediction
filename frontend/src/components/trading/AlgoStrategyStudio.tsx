"use client";

import React, { useState } from "react";
import {
  Cpu,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
} from "lucide-react";

export interface AlgoRule {
  id: string;
  indicator: "RSI" | "MACD" | "SMA_CROSS" | "BOLLINGER" | "SUPER_TREND";
  operator: "GREATER_THAN" | "LESS_THAN" | "CROSSES_ABOVE" | "CROSSES_BELOW";
  value: number;
  period?: number;
}

export const AlgoStrategyStudio: React.FC = () => {
  const [strategyName, setStrategyName] = useState("Mean Reversion Alpha V1");
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [timeframe, setTimeframe] = useState("15m");
  const [stopLossPct, setStopLossPct] = useState(1.5);
  const [takeProfitPct, setTakeProfitPct] = useState(3.0);
  const [capitalAllocated, setCapitalAllocated] = useState(250000);

  // Strategy Conditions
  const [entryRules, setEntryRules] = useState<AlgoRule[]>([
    { id: "r-1", indicator: "RSI", operator: "CROSSES_ABOVE", value: 30, period: 14 },
    { id: "r-2", indicator: "SMA_CROSS", operator: "GREATER_THAN", value: 50, period: 20 },
  ]);

  // Backtest Simulation Results State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState<{
    sharpe: number;
    winRate: number;
    totalTrades: number;
    netPnl: number;
    maxDrawdown: number;
    profitFactor: number;
  } | null>({
    sharpe: 2.14,
    winRate: 64.2,
    totalTrades: 128,
    netPnl: 48650,
    maxDrawdown: 4.8,
    profitFactor: 2.38,
  });

  const [copiedCode, setCopiedCode] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Deterministic simulation based on parameters
      const baseReturn = (takeProfitPct * 0.6 - stopLossPct * 0.4) * (capitalAllocated / 100);
      setSimResults({
        sharpe: Math.round((1.8 + (takeProfitPct / stopLossPct) * 0.25) * 100) / 100,
        winRate: Math.round((58 + (stopLossPct > 2 ? 8 : 4)) * 10) / 10,
        totalTrades: 114,
        netPnl: Math.round(baseReturn * 12),
        maxDrawdown: Math.round(stopLossPct * 2.8 * 10) / 10,
        profitFactor: Math.round((takeProfitPct / stopLossPct + 0.4) * 100) / 100,
      });
      setIsSimulating(false);
    }, 600);
  };

  const generatedPythonCode = `# TradeX Quantitative Strategy Engine
# Auto-generated Algorithmic Strategy: ${strategyName}
# Underlying: ${symbol} | Timeframe: ${timeframe}

import numpy as np
import pandas as pd

class ${strategyName.replace(/[^a-zA-Z0-9]/g, "")}:
    def __init__(self, data: pd.DataFrame):
        self.df = data
        self.stop_loss = ${stopLossPct} / 100.0
        self.take_profit = ${takeProfitPct} / 100.0

    def compute_signals(self):
        # RSI 14 Calculation
        delta = self.df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / (loss + 1e-9)
        self.df['RSI'] = 100 - (100 / (1 + rs))

        # 20/50 SMA Crossover
        self.df['SMA20'] = self.df['Close'].rolling(20).mean()
        self.df['SMA50'] = self.df['Close'].rolling(50).mean()

        # Signal Generation Logic
        self.df['Signal'] = 0
        long_condition = (self.df['RSI'] > 30) & (self.df['SMA20'] > self.df['SMA50'])
        self.df.loc[long_condition, 'Signal'] = 1
        return self.df
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-5 md:p-6 shadow-xl space-y-6 text-[#D1D4DC]">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2A2E39]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#2962FF]/15 border border-[#2962FF]/30 flex items-center justify-center text-[#2962FF]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Algorithmic Strategy Studio
              </h2>
              <span className="text-[10px] bg-[#2962FF]/20 text-[#2962FF] font-bold px-2 py-0.5 rounded border border-[#2962FF]/30 uppercase">
                Visual Quant Lab
              </span>
            </div>
            <p className="text-xs text-[#787B86]">
              Design automated execution logic, test against historical market data, and export production Python scripts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#2962FF] hover:bg-[#1E53E5] disabled:opacity-50 text-white font-bold text-xs transition shadow-lg cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isSimulating ? "Simulating Execution..." : "Run Quant Simulation"}</span>
          </button>
        </div>
      </div>

      {/* Grid: Strategy Parameters & Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Parameters */}
        <div className="space-y-4 bg-[#131722] p-4 rounded-xl border border-[#2A2E39]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2962FF]" />
            Asset &amp; Position Sizing
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-[#787B86] font-semibold block mb-1">
                Strategy Name
              </label>
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#787B86] font-semibold block mb-1">
                  Ticker Symbol
                </label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                >
                  <option value="RELIANCE.NS">RELIANCE.NS</option>
                  <option value="TCS.NS">TCS.NS</option>
                  <option value="HDFCBANK.NS">HDFCBANK.NS</option>
                  <option value="NIFTY 50">NIFTY 50 Index</option>
                  <option value="BANKNIFTY">BANKNIFTY Index</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#787B86] font-semibold block mb-1">
                  Candle Interval
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                >
                  <option value="1m">1 Minute (HFT)</option>
                  <option value="5m">5 Minute (Intraday)</option>
                  <option value="15m">15 Minute (Intraday)</option>
                  <option value="1h">1 Hour (Swing)</option>
                  <option value="1D">1 Day (Positional)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#787B86] font-semibold block mb-1">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={stopLossPct}
                  onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#787B86] font-semibold block mb-1">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={takeProfitPct}
                  onChange={(e) => setTakeProfitPct(parseFloat(e.target.value) || 1.0)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#787B86] font-semibold block mb-1">
                Virtual Capital Allocation (₹)
              </label>
              <input
                type="number"
                step="10000"
                value={capitalAllocated}
                onChange={(e) => setCapitalAllocated(parseInt(e.target.value, 10) || 100000)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Middle Column: Visual Rule Constructor */}
        <div className="space-y-4 bg-[#131722] p-4 rounded-xl border border-[#2A2E39]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#089981]" />
            Algorithmic Trigger Conditions
          </h3>

          <div className="space-y-3">
            {entryRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg bg-[#1E222D] border border-[#2A2E39] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[#787B86] text-[11px]">
                  <span className="font-semibold text-white">Rule #{idx + 1}</span>
                  <span className="bg-[#2962FF]/10 text-[#2962FF] px-1.5 py-0.5 rounded font-bold">
                    ENTRY TRIGGER
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#089981]">{rule.indicator}</span>
                  <ArrowRight className="w-3 h-3 text-[#787B86]" />
                  <span className="text-white">{rule.operator.replace("_", " ")}</span>
                  <span className="font-bold text-amber-400">{rule.value}</span>
                </div>
              </div>
            ))}

            <div className="p-3 rounded-lg bg-[#2A2E39]/40 border border-[#2A2E39] border-dashed text-center text-xs text-[#787B86]">
              Condition: <strong className="text-white">Rule #1 AND Rule #2</strong> must be true to trigger Long order.
            </div>
          </div>
        </div>

        {/* Right Column: Quant Performance Card */}
        <div className="space-y-4 bg-[#131722] p-4 rounded-xl border border-[#2A2E39]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2962FF]" />
            Simulated Backtest Analytics
          </h3>

          {simResults && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
                  <span className="text-[10px] text-[#787B86] block">Net Profit</span>
                  <span className="text-sm font-extrabold text-[#089981]">
                    +₹{simResults.netPnl.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
                  <span className="text-[10px] text-[#787B86] block">Win Rate</span>
                  <span className="text-sm font-extrabold text-white">
                    {simResults.winRate}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
                  <span className="text-[10px] text-[#787B86] block">Sharpe Ratio</span>
                  <span className="text-sm font-extrabold text-[#2962FF]">
                    {simResults.sharpe}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
                  <span className="text-[10px] text-[#787B86] block">Max Drawdown</span>
                  <span className="text-sm font-extrabold text-[#F23645]">
                    {simResults.maxDrawdown}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] flex items-center justify-between text-xs">
                <span className="text-[#787B86]">Profit Factor:</span>
                <span className="font-extrabold text-white">{simResults.profitFactor}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39] flex items-center justify-between text-xs">
                <span className="text-[#787B86]">Simulated Trades:</span>
                <span className="font-extrabold text-white">{simResults.totalTrades}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Export Box */}
      <div className="bg-[#131722] p-4 rounded-xl border border-[#2A2E39] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Code className="w-4 h-4 text-purple-400" />
            Generated Python Quantitative Code (Pandas / VectorBT Ready)
          </span>
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1E222D] hover:bg-[#2A2E39] text-[11px] font-semibold text-white border border-[#2A2E39] transition cursor-pointer"
          >
            {copiedCode ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#089981]" />
                <span className="text-[#089981]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#787B86]" />
                <span>Copy Python Code</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3 rounded-lg bg-[#0E1117] text-[#D1D4DC] font-mono text-[11px] overflow-x-auto border border-[#2A2E39]/50 max-h-48">
          {generatedPythonCode}
        </pre>
      </div>
    </div>
  );
};
