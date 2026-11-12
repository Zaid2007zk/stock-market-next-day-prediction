"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export interface PaperTradeOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  frictions: number;
  totalCost: number;
  timestamp: string;
}

export interface PaperHolding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PaperTradingWalletProps {
  currentSymbol: string;
  currentPrice: number;
  currency?: string;
}

export const PaperTradingWallet: React.FC<PaperTradingWalletProps> = ({
  currentSymbol,
  currentPrice,
  currency = "INR",
}) => {
  const INITIAL_CASH = currency === "INR" ? 1000000.0 : 50000.0;
  const [cashBalance, setCashBalance] = useState<number>(INITIAL_CASH);
  const [orders, setOrders] = useState<PaperTradeOrder[]>([]);
  const [holdings, setHoldings] = useState<Record<string, { quantity: number; avgPrice: number }>>({});
  const [orderQty, setOrderQty] = useState<number>(10);
  const [notification, setNotification] = useState<string | null>(null);

  const currSym = currency === "INR" ? "₹" : "$";

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("marketpulse_paper_wallet");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.cash !== undefined) setCashBalance(data.cash);
        if (data.orders) setOrders(data.orders);
        if (data.holdings) setHoldings(data.holdings);
      }
    } catch {}
  }, []);

  const saveWallet = (cash: number, ords: PaperTradeOrder[], hlds: Record<string, { quantity: number; avgPrice: number }>) => {
    try {
      localStorage.setItem(
        "marketpulse_paper_wallet",
        JSON.stringify({ cash, orders: ords, holdings: hlds })
      );
    } catch {}
  };

  const handleOrder = (side: "BUY" | "SELL") => {
    if (orderQty <= 0 || currentPrice <= 0) return;

    const grossValue = orderQty * currentPrice;
    // Statutory Indian market frictions: 0.1% STT on delivery + 0.03% brokerage + turnover & GST
    const frictions = grossValue * (currency === "INR" ? 0.0013 : 0.0005);
    const totalOutlay = side === "BUY" ? grossValue + frictions : grossValue - frictions;

    if (side === "BUY") {
      if (totalOutlay > cashBalance) {
        setNotification("Insufficient virtual cash balance for this trade.");
        return;
      }

      const newCash = cashBalance - totalOutlay;
      const prev = holdings[currentSymbol] || { quantity: 0, avgPrice: 0 };
      const newQty = prev.quantity + orderQty;
      const newAvg = (prev.quantity * prev.avgPrice + grossValue) / newQty;

      const newHoldings = { ...holdings, [currentSymbol]: { quantity: newQty, avgPrice: newAvg } };
      const newOrder: PaperTradeOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        symbol: currentSymbol,
        side: "BUY",
        quantity: orderQty,
        price: currentPrice,
        frictions: parseFloat(frictions.toFixed(2)),
        totalCost: parseFloat(totalOutlay.toFixed(2)),
        timestamp: new Date().toLocaleTimeString(),
      };

      const newOrders = [newOrder, ...orders];
      setCashBalance(newCash);
      setHoldings(newHoldings);
      setOrders(newOrders);
      saveWallet(newCash, newOrders, newHoldings);
      setNotification(`Successfully executed simulated BUY of ${orderQty} ${currentSymbol} at ${currSym}${currentPrice.toFixed(2)}.`);
    } else {
      // SELL
      const prev = holdings[currentSymbol];
      if (!prev || prev.quantity < orderQty) {
        setNotification(`You do not hold enough shares of ${currentSymbol} to SELL.`);
        return;
      }

      const newCash = cashBalance + totalOutlay;
      const remainingQty = prev.quantity - orderQty;
      const newHoldings = { ...holdings };
      if (remainingQty === 0) {
        delete newHoldings[currentSymbol];
      } else {
        newHoldings[currentSymbol] = { quantity: remainingQty, avgPrice: prev.avgPrice };
      }

      const newOrder: PaperTradeOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        symbol: currentSymbol,
        side: "SELL",
        quantity: orderQty,
        price: currentPrice,
        frictions: parseFloat(frictions.toFixed(2)),
        totalCost: parseFloat(totalOutlay.toFixed(2)),
        timestamp: new Date().toLocaleTimeString(),
      };

      const newOrders = [newOrder, ...orders];
      setCashBalance(newCash);
      setHoldings(newHoldings);
      setOrders(newOrders);
      saveWallet(newCash, newOrders, newHoldings);
      setNotification(`Successfully executed simulated SELL of ${orderQty} ${currentSymbol} at ${currSym}${currentPrice.toFixed(2)}.`);
    }

    setTimeout(() => setNotification(null), 4000);
  };

  const resetWallet = () => {
    setCashBalance(INITIAL_CASH);
    setOrders([]);
    setHoldings({});
    saveWallet(INITIAL_CASH, [], {});
    setNotification("Virtual paper trading wallet reset to default balance.");
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate Portfolio Holdings Valuation
  let totalHoldingsValue = 0;
  let totalInvestedValue = 0;

  const holdingList: PaperHolding[] = Object.entries(holdings).map(([sym, item]) => {
    const isCurrent = sym === currentSymbol;
    const price = isCurrent ? currentPrice : item.avgPrice; // Proxy for other symbols
    const invested = item.quantity * item.avgPrice;
    const current = item.quantity * price;
    const pnl = current - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

    totalHoldingsValue += current;
    totalInvestedValue += invested;

    return {
      symbol: sym,
      quantity: item.quantity,
      averagePrice: item.avgPrice,
      currentPrice: price,
      investedValue: invested,
      currentValue: current,
      unrealizedPnL: pnl,
      unrealizedPnLPercent: pnlPct,
    };
  });

  const netWorth = cashBalance + totalHoldingsValue;
  const totalPnL = netWorth - INITIAL_CASH;
  const totalPnLPct = (totalPnL / INITIAL_CASH) * 100;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Educational Paper Trading Simulator
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Virtual Capital • ₹0 Real Money Risk
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test real-world order execution and portfolio sizing with realistic statutory fee deductions. Zero real-money exposure.
          </p>
        </div>

        <button
          onClick={resetWallet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
          title="Reset to initial capital"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Wallet</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-sky-950/60 border border-sky-800 text-xs text-sky-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Wallet Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Virtual Cash Balance</span>
          <div className="text-xl font-mono font-bold text-white">
            {currSym}
            {cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Available margin</span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Holdings Market Value</span>
          <div className="text-xl font-mono font-bold text-sky-300">
            {currSym}
            {totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">{holdingList.length} Active Positions</span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Account Net Worth</span>
          <div className="text-xl font-mono font-bold text-white">
            {currSym}
            {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Cash + Equities</span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Simulation P&amp;L</span>
          <div
            className={`text-xl font-mono font-bold ${
              totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {totalPnL >= 0 ? "+" : ""}
            {currSym}
            {totalPnL.toFixed(2)} ({totalPnLPct.toFixed(2)}%)
          </div>
          <span className="text-[10px] text-slate-400">Since inception</span>
        </div>
      </div>

      {/* Simulated Order Execution Desk */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase">Active Instrument:</span>
            <span className="font-mono text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
              {currentSymbol}
            </span>
            <span className="text-slate-400">
              Last Verified: <strong className="text-white">{currSym}{currentPrice.toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400">Quantity:</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={orderQty}
              onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 bg-slate-900 border border-slate-700 p-1.5 rounded text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Order Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleOrder("BUY")}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Simulate BUY ({orderQty} Shares • {currSym}{(orderQty * currentPrice).toFixed(2)})</span>
          </button>

          <button
            onClick={() => handleOrder("SELL")}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 transition"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Simulate SELL ({orderQty} Shares)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Deducts 0.1% STT, 0.03% brokerage, exchange turnover charges, and GST automatically.</span>
        </div>
      </div>

      {/* Holdings & Order History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Holdings */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Simulated Positions
          </h3>
          <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 font-sans">
                <tr>
                  <th className="p-2.5">Symbol</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Avg Buy</th>
                  <th className="p-2.5">Current Value</th>
                  <th className="p-2.5">P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {holdingList.length > 0 ? (
                  holdingList.map((h) => (
                    <tr key={h.symbol} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">{h.symbol}</td>
                      <td className="p-2.5 text-slate-300">{h.quantity}</td>
                      <td className="p-2.5 text-slate-300">
                        {currSym}
                        {h.averagePrice.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-white">
                        {currSym}
                        {h.currentValue.toFixed(2)}
                      </td>
                      <td
                        className={`p-2.5 font-bold ${
                          h.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {h.unrealizedPnL >= 0 ? "+" : ""}
                        {currSym}
                        {h.unrealizedPnL.toFixed(2)} ({h.unrealizedPnLPercent.toFixed(1)}%)
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 font-sans text-xs">
                      No active holdings. Place a simulated BUY order above to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Simulated Execution Audit Log
          </h3>
          <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 font-sans">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Side</th>
                  <th className="p-2.5">Symbol</th>
                  <th className="p-2.5">Qty @ Price</th>
                  <th className="p-2.5">Frictions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-400">{o.timestamp}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            o.side === "BUY"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {o.side}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-white">{o.symbol}</td>
                      <td className="p-2.5 text-slate-300">
                        {o.quantity} @ {currSym}
                        {o.price.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-amber-400">
                        -{currSym}
                        {o.frictions.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 font-sans text-xs">
                      No order history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
