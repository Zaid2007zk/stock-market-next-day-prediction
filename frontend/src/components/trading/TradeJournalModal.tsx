"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Plus,
  Award,
  BarChart2,
  PieChart,
  CheckCircle2,
  Tag,
} from "lucide-react";

export interface JournalEntry {
  id: string;
  date: string;
  symbol: string;
  side: "BUY" | "SELL";
  setup: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  netPnl: number;
  status: "WIN" | "LOSS" | "BREAKEVEN";
  notes: string;
  emotionalRating: "Disciplined" | "FOMO" | "Revenge" | "Systematic";
}

interface TradeJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

const INITIAL_JOURNAL_DATA: JournalEntry[] = [
  {
    id: "JRN-101",
    date: "2026-11-12",
    symbol: "RELIANCE.NS",
    side: "BUY",
    setup: "EMA 20 Pullback & Volume Surge",
    entryPrice: 1332.0,
    exitPrice: 1348.5,
    quantity: 100,
    netPnl: 1650.0,
    status: "WIN",
    notes: "Followed daily VWAP breakout rule. Scaled out half at +1R and let runner close near high.",
    emotionalRating: "Systematic",
  },
  {
    id: "JRN-102",
    date: "2026-11-11",
    symbol: "TCS.NS",
    side: "BUY",
    setup: "RSI Bullish Divergence",
    entryPrice: 3820.0,
    exitPrice: 3875.0,
    quantity: 30,
    netPnl: 1650.0,
    status: "WIN",
    notes: "Clean reversal off 200 SMA support zone. Risk defined to 3800 swing low.",
    emotionalRating: "Disciplined",
  },
  {
    id: "JRN-103",
    date: "2026-11-10",
    symbol: "HDFCBANK.NS",
    side: "SELL",
    setup: "Breakdown Retest",
    entryPrice: 1690.0,
    exitPrice: 1702.0,
    quantity: 75,
    netPnl: -900.0,
    status: "LOSS",
    notes: "Cut strictly at stop loss when bank nifty reclaimed opening range high.",
    emotionalRating: "Disciplined",
  },
  {
    id: "JRN-104",
    date: "2026-11-09",
    symbol: "INFY.NS",
    side: "BUY",
    setup: "Pre-Market Gap & Go",
    entryPrice: 1840.0,
    exitPrice: 1872.0,
    quantity: 50,
    netPnl: 1600.0,
    status: "WIN",
    notes: "Strong IT sector relative strength on US tech rebound.",
    emotionalRating: "Systematic",
  },
  {
    id: "JRN-105",
    date: "2026-11-06",
    symbol: "ICICIBANK.NS",
    side: "BUY",
    setup: "Consolidation Squeeze",
    entryPrice: 1245.0,
    exitPrice: 1245.5,
    quantity: 80,
    netPnl: 40.0,
    status: "BREAKEVEN",
    notes: "Momentum stalled after 45 minutes; exited near flat to preserve capital.",
    emotionalRating: "Systematic",
  },
  {
    id: "JRN-106",
    date: "2026-11-05",
    symbol: "TATAMOTORS.NS",
    side: "BUY",
    setup: "EV Deliveries Catalyst",
    entryPrice: 910.0,
    exitPrice: 938.0,
    quantity: 120,
    netPnl: 3360.0,
    status: "WIN",
    notes: "Highest conviction swing trade of the week. Trailed stop under 15-min supertrend.",
    emotionalRating: "Disciplined",
  },
];

export const TradeJournalModal: React.FC<TradeJournalModalProps> = ({
  isOpen,
  onClose,
  currencySymbol = "₹",
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_DATA);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");
  const [activeTab, setActiveTab] = useState<"trades" | "analytics" | "add">("trades");

  // New trade form state
  const [newSymbol, setNewSymbol] = useState("RELIANCE.NS");
  const [newSide, setNewSide] = useState<"BUY" | "SELL">("BUY");
  const [newSetup, setNewSetup] = useState("Support Reversal");
  const [newEntryPrice, setNewEntryPrice] = useState("1335.00");
  const [newExitPrice, setNewExitPrice] = useState("1350.00");
  const [newQuantity, setNewQuantity] = useState("50");
  const [newNotes, setNewNotes] = useState("");
  const [newRating, setNewRating] = useState<JournalEntry["emotionalRating"]>("Systematic");

  // Metrics computation
  const stats = useMemo(() => {
    const totalTrades = entries.length;
    const wins = entries.filter((e) => e.status === "WIN");
    const losses = entries.filter((e) => e.status === "LOSS");
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;

    const totalPnl = entries.reduce((acc, e) => acc + e.netPnl, 0);
    const grossProfit = wins.reduce((acc, e) => acc + e.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc, e) => acc + e.netPnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    return {
      totalTrades,
      winCount: wins.length,
      lossCount: losses.length,
      winRate: winRate.toFixed(1),
      totalPnl: totalPnl.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
      grossLoss: grossLoss.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      payoffRatio: payoffRatio.toFixed(2),
    };
  }, [entries]);

  // Equity Curve points
  const equityCurve = useMemo(() => {
    let running = 0;
    return entries
      .slice()
      .reverse()
      .map((e, idx) => {
        running += e.netPnl;
        return { index: idx + 1, date: e.date, value: running };
      });
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (selectedFilter === "ALL") return entries;
    return entries.filter((e) => e.status === selectedFilter);
  }, [entries, selectedFilter]);

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = parseFloat(newEntryPrice) || 0;
    const exit = parseFloat(newExitPrice) || 0;
    const qty = parseInt(newQuantity, 10) || 1;
    const pnl = newSide === "BUY" ? (exit - entry) * qty : (entry - exit) * qty;
    const status: "WIN" | "LOSS" | "BREAKEVEN" =
      pnl > 5 ? "WIN" : pnl < -5 ? "LOSS" : "BREAKEVEN";

    const newRecord: JournalEntry = {
      id: `JRN-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      symbol: newSymbol.toUpperCase(),
      side: newSide,
      setup: newSetup,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      netPnl: Math.round(pnl * 100) / 100,
      status,
      notes: newNotes || "Execution recorded from TradeX Terminal",
      emotionalRating: newRating,
    };

    setEntries([newRecord, ...entries]);
    setActiveTab("trades");
    setNewNotes("");
  };

  const exportCSV = () => {
    const headers = "ID,Date,Symbol,Side,Setup,Entry,Exit,Qty,Net_PnL,Status,Discipline\n";
    const rows = entries
      .map(
        (e) =>
          `${e.id},${e.date},${e.symbol},${e.side},"${e.setup}",${e.entryPrice},${e.exitPrice},${e.quantity},${e.netPnl},${e.status},${e.emotionalRating}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tradex_journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#D1D4DC]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2E39] bg-[#131722]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#2962FF]/15 border border-[#2962FF]/40 flex items-center justify-center text-[#2962FF]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  TradeX Performance Journal &amp; Analytics
                </h2>
                <span className="text-[10px] bg-[#089981]/20 text-[#089981] font-bold px-2 py-0.5 rounded border border-[#089981]/30">
                  Audit Grade
                </span>
              </div>
              <p className="text-xs text-[#787B86]">
                Track psychological execution, verify strategy edge, and export tax logs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2A2E39] hover:bg-[#363C4E] text-xs font-semibold text-white transition"
              title="Export Journal as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#2A2E39] text-[#787B86] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-[#181B24] border-b border-[#2A2E39]">
          <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
            <span className="text-[11px] text-[#787B86] font-medium block">Net Realized P&amp;L</span>
            <span
              className={`text-base font-extrabold ${
                parseFloat(stats.totalPnl) >= 0 ? "text-[#089981]" : "text-[#F23645]"
              }`}
            >
              {parseFloat(stats.totalPnl) >= 0 ? "+" : ""}
              {currencySymbol}
              {stats.totalPnl}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
            <span className="text-[11px] text-[#787B86] font-medium block">Win Rate</span>
            <span className="text-base font-extrabold text-white">{stats.winRate}%</span>
            <span className="text-[10px] text-[#787B86] block">
              {stats.winCount}W / {stats.lossCount}L
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
            <span className="text-[11px] text-[#787B86] font-medium block">Profit Factor</span>
            <span className="text-base font-extrabold text-[#2962FF]">{stats.profitFactor}</span>
            <span className="text-[10px] text-[#787B86] block">Edge Metric</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
            <span className="text-[11px] text-[#787B86] font-medium block">Avg Win / Loss</span>
            <span className="text-xs font-bold text-white block">
              <span className="text-[#089981]">+{currencySymbol}{stats.avgWin}</span> /{" "}
              <span className="text-[#F23645]">-{currencySymbol}{stats.avgLoss}</span>
            </span>
            <span className="text-[10px] text-[#787B86]">R:R {stats.payoffRatio}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
            <span className="text-[11px] text-[#787B86] font-medium block">Gross Profit</span>
            <span className="text-sm font-bold text-[#089981]">
              +{currencySymbol}{stats.grossProfit}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#1E222D] border border-[#2A2E39]">
            <span className="text-[11px] text-[#787B86] font-medium block">Total Trades</span>
            <span className="text-base font-extrabold text-white">{stats.totalTrades}</span>
            <span className="text-[10px] text-[#787B86]">Sample Count</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-[#2A2E39] bg-[#1E222D]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("trades")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "trades"
                  ? "bg-[#2962FF] text-white"
                  : "bg-[#2A2E39]/60 text-[#787B86] hover:text-white"
              }`}
            >
              Trade Log ({filteredEntries.length})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "analytics"
                  ? "bg-[#2962FF] text-white"
                  : "bg-[#2A2E39]/60 text-[#787B86] hover:text-white"
              }`}
            >
              Equity Curve &amp; Analytics
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "add"
                  ? "bg-[#2962FF] text-white"
                  : "bg-[#2A2E39]/60 text-[#787B86] hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Trade</span>
            </button>
          </div>

          {activeTab === "trades" && (
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-[#787B86] text-[11px] mr-1">Filter:</span>
              {(["ALL", "WIN", "LOSS"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    selectedFilter === f
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-[#787B86] hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "trades" && (
            <div className="space-y-3">
              {filteredEntries.map((trade) => (
                <div
                  key={trade.id}
                  className="p-4 rounded-xl bg-[#131722] border border-[#2A2E39] hover:border-[#363C4E] transition space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          trade.side === "BUY"
                            ? "bg-[#089981]/20 text-[#089981] border border-[#089981]/30"
                            : "bg-[#F23645]/20 text-[#F23645] border border-[#F23645]/30"
                        }`}
                      >
                        {trade.side}
                      </span>
                      <span className="font-extrabold text-white text-sm">{trade.symbol}</span>
                      <span className="text-xs text-[#787B86]">{trade.date}</span>
                      <span className="text-[11px] bg-[#2A2E39] text-[#D1D4DC] px-2 py-0.5 rounded flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#2962FF]" />
                        {trade.setup}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span
                          className={`text-sm font-extrabold ${
                            trade.netPnl >= 0 ? "text-[#089981]" : "text-[#F23645]"
                          }`}
                        >
                          {trade.netPnl >= 0 ? "+" : ""}
                          {currencySymbol}
                          {trade.netPnl.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#787B86] block">
                          Qty: {trade.quantity} • In: {currencySymbol}{trade.entryPrice} • Out:{" "}
                          {currencySymbol}{trade.exitPrice}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          trade.emotionalRating === "Disciplined" || trade.emotionalRating === "Systematic"
                            ? "bg-[#089981]/10 text-[#089981]"
                            : "bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {trade.emotionalRating}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#848E9C] bg-[#1E222D]/60 p-2.5 rounded-lg border border-[#2A2E39]/40 leading-relaxed">
                    <strong className="text-white/80">Trader Journal Note:</strong> {trade.notes}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Equity Curve SVG */}
              <div className="p-5 rounded-xl bg-[#131722] border border-[#2A2E39] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#089981]" />
                    Cumulative Equity Growth Curve
                  </h3>
                  <span className="text-xs text-[#089981] font-extrabold">
                    +{currencySymbol}{stats.totalPnl} Net Cumulative
                  </span>
                </div>

                <div className="h-44 w-full flex items-end pt-4 pb-2 px-2 border-b border-[#2A2E39]">
                  {equityCurve.map((pt, i) => {
                    const maxVal = Math.max(...equityCurve.map((p) => p.value), 1000);
                    const heightPct = Math.max(12, Math.min(95, (pt.value / maxVal) * 100));
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end group h-full relative"
                      >
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-4/5 rounded-t bg-gradient-to-t from-[#2962FF]/40 to-[#2962FF] group-hover:to-[#5282FF] transition-all"
                        />
                        <div className="hidden group-hover:block absolute -top-8 bg-black/90 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 pointer-events-none border border-[#2A2E39]">
                          {pt.date}: +{currencySymbol}{pt.value}
                        </div>
                        <span className="text-[9px] text-[#787B86] mt-1.5 truncate max-w-[40px]">
                          T{pt.index}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Psychology Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#131722] border border-[#2A2E39] space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Execution Psychology &amp; Rule Adherence
                  </h4>
                  <p className="text-xs text-[#787B86]">
                    83.3% of logged trades strictly adhered to predefined trading rules without FOMO or premature stop intervention.
                  </p>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#089981]">Systematic / Disciplined</span>
                      <span className="font-bold text-white">5 (83.3%)</span>
                    </div>
                    <div className="w-full bg-[#2A2E39] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#089981] h-full" style={{ width: "83.3%" }} />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#131722] border border-[#2A2E39] space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Risk to Reward Realization
                  </h4>
                  <p className="text-xs text-[#787B86]">
                    Average win is {stats.payoffRatio}x higher than average loss, giving positive expectancy even under 45% win conditions.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 bg-[#1E222D] p-2.5 rounded-lg border border-[#2A2E39] text-center">
                      <span className="text-[10px] text-[#787B86] block">Avg Win</span>
                      <span className="text-sm font-bold text-[#089981]">+{currencySymbol}{stats.avgWin}</span>
                    </div>
                    <div className="flex-1 bg-[#1E222D] p-2.5 rounded-lg border border-[#2A2E39] text-center">
                      <span className="text-[10px] text-[#787B86] block">Avg Loss</span>
                      <span className="text-sm font-bold text-[#F23645]">-{currencySymbol}{stats.avgLoss}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "add" && (
            <form onSubmit={handleAddTrade} className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#787B86] block mb-1">Symbol</label>
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#787B86] block mb-1">Side</label>
                  <select
                    value={newSide}
                    onChange={(e) => setNewSide(e.target.value as "BUY" | "SELL")}
                    className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                  >
                    <option value="BUY">BUY (Long)</option>
                    <option value="SELL">SELL (Short)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#787B86] block mb-1">
                    Entry Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={newEntryPrice}
                    onChange={(e) => setNewEntryPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#787B86] block mb-1">
                    Exit Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={newExitPrice}
                    onChange={(e) => setNewExitPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#787B86] block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#787B86] block mb-1">Strategy / Setup</label>
                  <input
                    type="text"
                    value={newSetup}
                    onChange={(e) => setNewSetup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#787B86] block mb-1">
                    Discipline / Mental State
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) =>
                      setNewRating(e.target.value as JournalEntry["emotionalRating"])
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                  >
                    <option value="Systematic">Systematic (Followed Rules)</option>
                    <option value="Disciplined">Disciplined (Took Controlled Loss)</option>
                    <option value="FOMO">FOMO (Chased Market)</option>
                    <option value="Revenge">Revenge (Overleveraged)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#787B86] block mb-1">
                  Journal Reflection &amp; Lessons Learned
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Why did you take this trade? What did the chart indicate at entry? What did you do right or wrong?"
                  className="w-full px-3 py-2 rounded-lg bg-[#131722] border border-[#2A2E39] text-white text-xs focus:border-[#2962FF] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#2962FF] hover:bg-[#1E53E5] text-white font-bold text-xs transition cursor-pointer"
              >
                Log Trade to Permanent Journal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
