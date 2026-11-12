"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Bookmark } from "lucide-react";

interface WatchlistItemData {
  symbol: string;
  exchange: string;
  price?: number;
  change_percent?: number;
}

interface WatchlistManagerProps {
  onSelectSymbol: (symbol: string) => void;
  activeSymbol: string;
}

const DEFAULT_WATCHLIST: WatchlistItemData[] = [
  { symbol: "RELIANCE.NS", exchange: "NSE", price: 1190.0, change_percent: 1.25 },
  { symbol: "TCS.NS", exchange: "NSE", price: 2512.4, change_percent: -0.71 },
  { symbol: "HDFCBANK.NS", exchange: "NSE", price: 1745.0, change_percent: 0.85 },
  { symbol: "AAPL", exchange: "NASDAQ", price: 347.73, change_percent: 1.15 },
  { symbol: "MSFT", exchange: "NASDAQ", price: 420.0, change_percent: -0.20 },
];

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  onSelectSymbol,
  activeSymbol,
}) => {
  const [items, setItems] = useState<WatchlistItemData[]>(DEFAULT_WATCHLIST);
  const [newSymbol, setNewSymbol] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbol.trim().toUpperCase();
    if (!sym) return;
    if (items.some((i) => i.symbol === sym)) return;

    setItems([
      ...items,
      {
        symbol: sym,
        exchange: sym.endsWith(".NS") ? "NSE" : "NASDAQ",
        price: undefined,
        change_percent: undefined,
      },
    ]);
    setNewSymbol("");
  };

  const handleRemove = (symbol: string) => {
    setItems(items.filter((i) => i.symbol !== symbol));
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">Active Watchlist</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">{items.length} Tickers</span>
      </div>

      {/* Add Symbol Input */}
      <form onSubmit={handleAdd} className="mt-3 flex space-x-2">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Add ticker (e.g. INFY.NS)"
          className="flex-1 px-3 py-1.5 text-xs border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Watchlist Table */}
      <div className="mt-3 divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
        {items.map((item) => {
          const isSelected = item.symbol === activeSymbol;
          const isUp = (item.change_percent || 0) >= 0;

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`flex items-center justify-between py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-sky-950/60 border border-sky-500/40 text-white" : "hover:bg-slate-800/60 text-slate-200"
              }`}
            >
              <div>
                <span className="font-bold text-slate-100 text-sm block">
                  {item.symbol}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {item.exchange}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-100 block">
                    {item.price ? item.price.toFixed(2) : "--"}
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    )}
                    {item.change_percent ? `${item.change_percent > 0 ? "+" : ""}${item.change_percent.toFixed(2)}%` : "0.00%"}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.symbol);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
