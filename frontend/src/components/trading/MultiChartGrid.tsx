"use client";

import React, { useState } from "react";
import {
  Grid,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronDown,
  Square,
  Columns,
  Rows,
} from "lucide-react";

type LayoutMode = "1x1" | "1x2" | "2x1" | "2x2";

interface ChartPaneConfig {
  id: string;
  symbol: string;
  timeframe: "1D" | "1W" | "1M" | "1Y";
  color: string;
}

const DEFAULT_PANES: ChartPaneConfig[] = [
  { id: "pane-1", symbol: "RELIANCE.NS", timeframe: "1D", color: "#2962FF" },
  { id: "pane-2", symbol: "NIFTY 50", timeframe: "1D", color: "#089981" },
  { id: "pane-3", symbol: "TCS.NS", timeframe: "1W", color: "#F23645" },
  { id: "pane-4", symbol: "HDFCBANK.NS", timeframe: "1M", color: "#FF9800" },
];

const MOCK_PANE_DATA: Record<string, { price: number; change: number; bars: number[] }> = {
  "RELIANCE.NS": { price: 1337.30, change: 0.97, bars: [1320, 1324, 1321, 1328, 1335, 1330, 1334, 1337] },
  "NIFTY 50": { price: 25302.40, change: 0.65, bars: [25180, 25200, 25230, 25210, 25270, 25290, 25302] },
  "TCS.NS": { price: 3845.50, change: -0.42, bars: [3865, 3860, 3855, 3850, 3848, 3845] },
  "HDFCBANK.NS": { price: 1688.20, change: 1.15, bars: [1670, 1672, 1675, 1680, 1682, 1688] },
  "INFY.NS": { price: 1860.00, change: 1.40, bars: [1830, 1835, 1845, 1850, 1855, 1860] },
  "AAPL": { price: 232.50, change: 0.82, bars: [229, 230, 231, 230.5, 232, 232.5] },
};

export const MultiChartGrid: React.FC = () => {
  const [layout, setLayout] = useState<LayoutMode>("2x2");
  const [panes, setPanes] = useState<ChartPaneConfig[]>(DEFAULT_PANES);
  const [activePaneId, setActivePaneId] = useState<string>("pane-1");

  const updatePaneSymbol = (paneId: string, newSymbol: string) => {
    setPanes((prev) =>
      prev.map((p) => (p.id === paneId ? { ...p, symbol: newSymbol } : p))
    );
  };

  const updatePaneTimeframe = (paneId: string, tf: "1D" | "1W" | "1M" | "1Y") => {
    setPanes((prev) =>
      prev.map((p) => (p.id === paneId ? { ...p, timeframe: tf } : p))
    );
  };

  // Determine which panes to show based on layout
  const visiblePanes =
    layout === "1x1"
      ? panes.slice(0, 1)
      : layout === "1x2" || layout === "2x1"
      ? panes.slice(0, 2)
      : panes.slice(0, 4);

  const getGridClasses = () => {
    switch (layout) {
      case "1x1":
        return "grid-cols-1 grid-rows-1";
      case "1x2":
        return "grid-cols-1 md:grid-cols-2 grid-rows-1";
      case "2x1":
        return "grid-cols-1 grid-rows-2";
      case "2x2":
      default:
        return "grid-cols-1 md:grid-cols-2 grid-rows-2";
    }
  };

  return (
    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 md:p-5 shadow-xl space-y-4 text-[#D1D4DC]">
      {/* Layout Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2A2E39]">
        <div className="flex items-center space-x-2">
          <Grid className="w-5 h-5 text-[#2962FF]" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Multi-Chart Tactical Grid
            </h3>
            <span className="text-[11px] text-[#787B86]">
              Simultaneous multi-asset monitoring with independent timeframes
            </span>
          </div>
        </div>

        {/* Layout Buttons */}
        <div className="flex items-center space-x-1.5 bg-[#131722] p-1 rounded-lg border border-[#2A2E39]">
          <button
            onClick={() => setLayout("1x1")}
            title="Single Chart (1x1)"
            className={`p-1.5 rounded transition ${
              layout === "1x1" ? "bg-[#2962FF] text-white" : "text-[#787B86] hover:text-white"
            }`}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout("1x2")}
            title="Dual Horizontal Split (1x2)"
            className={`p-1.5 rounded transition ${
              layout === "1x2" ? "bg-[#2962FF] text-white" : "text-[#787B86] hover:text-white"
            }`}
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout("2x1")}
            title="Dual Vertical Split (2x1)"
            className={`p-1.5 rounded transition ${
              layout === "2x1" ? "bg-[#2962FF] text-white" : "text-[#787B86] hover:text-white"
            }`}
          >
            <Rows className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout("2x2")}
            title="Quad Grid (2x2)"
            className={`p-1.5 rounded transition ${
              layout === "2x2" ? "bg-[#2962FF] text-white" : "text-[#787B86] hover:text-white"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Grid Container */}
      <div className={`grid gap-4 min-h-[560px] ${getGridClasses()}`}>
        {visiblePanes.map((pane) => {
          const data = MOCK_PANE_DATA[pane.symbol] || {
            price: 1000.0,
            change: 0.5,
            bars: [990, 995, 1000],
          };
          const isPositive = data.change >= 0;

          return (
            <div
              key={pane.id}
              onClick={() => setActivePaneId(pane.id)}
              className={`flex flex-col bg-[#131722] rounded-xl border transition ${
                activePaneId === pane.id
                  ? "border-[#2962FF] shadow-[0_0_15px_rgba(41,98,255,0.15)]"
                  : "border-[#2A2E39] hover:border-[#363C4E]"
              }`}
            >
              {/* Pane Control Header */}
              <div className="flex items-center justify-between p-3 border-b border-[#2A2E39] bg-[#181B24]/80 rounded-t-xl">
                <div className="flex items-center space-x-2">
                  <select
                    value={pane.symbol}
                    onChange={(e) => updatePaneSymbol(pane.id, e.target.value)}
                    className="bg-[#1E222D] border border-[#2A2E39] text-white text-xs font-bold rounded px-2 py-1 outline-none focus:border-[#2962FF]"
                  >
                    {Object.keys(MOCK_PANE_DATA).map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-1 text-[11px]">
                    {(["1D", "1W", "1M", "1Y"] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => updatePaneTimeframe(pane.id, tf)}
                        className={`px-1.5 py-0.5 rounded font-medium transition ${
                          pane.timeframe === tf
                            ? "bg-[#2962FF] text-white font-bold"
                            : "text-[#787B86] hover:text-white"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">
                    ₹{data.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      isPositive
                        ? "bg-[#089981]/20 text-[#089981]"
                        : "bg-[#F23645]/20 text-[#F23645]"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {data.change}%
                  </span>
                </div>
              </div>

              {/* Chart Canvas / SVG Visualization */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="h-44 w-full flex items-end justify-between px-2 pt-4 border-b border-[#2A2E39]/40 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                  </div>

                  {data.bars.map((b, idx) => {
                    const min = Math.min(...data.bars);
                    const max = Math.max(...data.bars);
                    const heightPct = Math.max(15, Math.min(90, ((b - min) / (max - min || 1)) * 100));

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center justify-end h-full z-10 mx-0.5"
                      >
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[14px] rounded-t transition-all ${
                            isPositive
                              ? "bg-[#089981] hover:brightness-125"
                              : "bg-[#F23645] hover:brightness-125"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 text-[10px] text-[#787B86]">
                  <span>Volume: {(Math.random() * 2 + 1).toFixed(1)}M</span>
                  <span>RSI(14): {(50 + Math.random() * 20).toFixed(1)}</span>
                  <span>SMA 20/50: Bullish Confluence</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
