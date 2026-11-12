"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

interface Holding {
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currency: string;
}

interface PaperOrder {
  id: string;
  symbol: string;
  action: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  quantity: number;
  executionPrice: number;
  grossValue: number;
  frictions: number;
  netValue: number;
  timestamp: string;
}

interface PaperPortfolioState {
  cash: number;
  holdings: Record<string, Holding>;
  orders: PaperOrder[];
  totalFrictionsPaid: number;
  realizedPnL: number;
}

const DEFAULT_STARTING_CASH = 100000.0; // ₹1,00,000

const AVAILABLE_STOCKS: Record<string, { name: string; price: number; currency: string }> = {
  "RELIANCE.NS": { name: "Reliance Industries Ltd", price: 2450.0, currency: "INR" },
  "TCS.NS": { name: "Tata Consultancy Services", price: 3850.0, currency: "INR" },
  "INFY.NS": { name: "Infosys Limited", price: 1620.0, currency: "INR" },
  "HDFCBANK.NS": { name: "HDFC Bank Limited", price: 1480.0, currency: "INR" },
  "AAPL": { name: "Apple Inc.", price: 185.0, currency: "USD" },
  "MSFT": { name: "Microsoft Corporation", price: 420.0, currency: "USD" },
};

export const PaperTradingSandbox: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PaperPortfolioState>({
    cash: DEFAULT_STARTING_CASH,
    holdings: {},
    orders: [],
    totalFrictionsPaid: 0,
    realizedPnL: 0,
  });

  const [selectedSymbol, setSelectedSymbol] = useState<string>("RELIANCE.NS");
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [quantity, setQuantity] = useState<number>(10);
  const [customPrice, setCustomPrice] = useState<number>(2450.0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("marketpulse_paper_portfolio");
      if (saved) {
        setPortfolio(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save to localStorage on change
  const savePortfolio = (newState: PaperPortfolioState) => {
    setPortfolio(newState);
    try {
      localStorage.setItem("marketpulse_paper_portfolio", JSON.stringify(newState));
    } catch {
      // Ignore storage errors
    }
  };

  const handleReset = () => {
    if (confirm("Reset paper trading portfolio back to ₹1,00,000 virtual cash?")) {
      const resetState: PaperPortfolioState = {
        cash: DEFAULT_STARTING_CASH,
        holdings: {},
        orders: [],
        totalFrictionsPaid: 0,
        realizedPnL: 0,
      };
      savePortfolio(resetState);
      setMessage({ type: "success", text: "Portfolio reset to ₹1,00,000 virtual cash." });
    }
  };

  const currentStock = AVAILABLE_STOCKS[selectedSymbol] || {
    name: selectedSymbol,
    price: 2450.0,
    currency: "INR",
  };
  const execPrice = orderType === "MARKET" ? currentStock.price : customPrice;
  const grossTradeValue = Math.round(execPrice * quantity * 100) / 100;

  // Calculate Indian Frictions
  const isINR = currentStock.currency === "INR";
  const stt = isINR ? Math.round(grossTradeValue * 0.001 * 100) / 100 : 0.0;
  const brokerage = isINR ? Math.round(Math.min(grossTradeValue * 0.0003, 20.0) * 100) / 100 : 0.0;
  const turnover = isINR ? Math.round(grossTradeValue * 0.0000325 * 100) / 100 : 0.0;
  const gst = isINR ? Math.round((brokerage + turnover) * 0.18 * 100) / 100 : 0.0;
  const stampDuty = isINR && action === "BUY" ? Math.round(grossTradeValue * 0.00015 * 100) / 100 : 0.0;
  const slippage = Math.round(grossTradeValue * 0.0005 * 100) / 100;
  const totalFrictions = Math.round((stt + brokerage + turnover + gst + stampDuty + slippage) * 100) / 100;
  const totalNetTradeCost = action === "BUY" ? grossTradeValue + totalFrictions : grossTradeValue - totalFrictions;

  // Execute Order
  const executeOrder = () => {
    setMessage(null);
    if (quantity <= 0) {
      setMessage({ type: "error", text: "Quantity must be greater than 0." });
      return;
    }

    if (action === "BUY") {
      if (portfolio.cash < totalNetTradeCost) {
        setMessage({
          type: "error",
          text: `Insufficient virtual cash. Required: ₹${totalNetTradeCost.toLocaleString()}, Available: ₹${portfolio.cash.toLocaleString()}`,
        });
        return;
      }

      const existingHolding = portfolio.holdings[selectedSymbol];
      let newQty = quantity;
      let newAvg = execPrice;

      if (existingHolding) {
        const totalCostPrior = existingHolding.quantity * existingHolding.avgBuyPrice;
        const totalCostNew = quantity * execPrice;
        newQty = existingHolding.quantity + quantity;
        newAvg = Math.round(((totalCostPrior + totalCostNew) / newQty) * 100) / 100;
      }

      const updatedHoldings = {
        ...portfolio.holdings,
        [selectedSymbol]: {
          symbol: selectedSymbol,
          quantity: newQty,
          avgBuyPrice: newAvg,
          currentPrice: currentStock.price,
          currency: currentStock.currency,
        },
      };

      const newOrder: PaperOrder = {
        id: `ord-${Date.now()}`,
        symbol: selectedSymbol,
        action: "BUY",
        orderType,
        quantity,
        executionPrice: execPrice,
        grossValue: grossTradeValue,
        frictions: totalFrictions,
        netValue: totalNetTradeCost,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const newState: PaperPortfolioState = {
        ...portfolio,
        cash: Math.round((portfolio.cash - totalNetTradeCost) * 100) / 100,
        holdings: updatedHoldings,
        orders: [newOrder, ...portfolio.orders],
        totalFrictionsPaid: Math.round((portfolio.totalFrictionsPaid + totalFrictions) * 100) / 100,
      };

      savePortfolio(newState);
      setMessage({
        type: "success",
        text: `Simulated BUY of ${quantity} shares of ${selectedSymbol} at ₹${execPrice.toFixed(2)} executed. Frictions: ₹${totalFrictions.toFixed(2)}.`,
      });
    } else {
      // SELL
      const existingHolding = portfolio.holdings[selectedSymbol];
      if (!existingHolding || existingHolding.quantity < quantity) {
        setMessage({
          type: "error",
          text: `Cannot sell ${quantity} shares. You currently own ${existingHolding?.quantity || 0} shares. Short selling is disabled.`,
        });
        return;
      }

      const sellProceedsNet = totalNetTradeCost;
      const costBasisSold = quantity * existingHolding.avgBuyPrice;
      const tradeRealizedPnL = Math.round((grossTradeValue - costBasisSold - totalFrictions) * 100) / 100;

      const remainingQty = existingHolding.quantity - quantity;
      const updatedHoldings = { ...portfolio.holdings };
      if (remainingQty === 0) {
        delete updatedHoldings[selectedSymbol];
      } else {
        updatedHoldings[selectedSymbol] = {
          ...existingHolding,
          quantity: remainingQty,
        };
      }

      const newOrder: PaperOrder = {
        id: `ord-${Date.now()}`,
        symbol: selectedSymbol,
        action: "SELL",
        orderType,
        quantity,
        executionPrice: execPrice,
        grossValue: grossTradeValue,
        frictions: totalFrictions,
        netValue: sellProceedsNet,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const newState: PaperPortfolioState = {
        ...portfolio,
        cash: Math.round((portfolio.cash + sellProceedsNet) * 100) / 100,
        holdings: updatedHoldings,
        orders: [newOrder, ...portfolio.orders],
        totalFrictionsPaid: Math.round((portfolio.totalFrictionsPaid + totalFrictions) * 100) / 100,
        realizedPnL: Math.round((portfolio.realizedPnL + tradeRealizedPnL) * 100) / 100,
      };

      savePortfolio(newState);
      setMessage({
        type: "success",
        text: `Simulated SELL of ${quantity} shares of ${selectedSymbol} executed. Realized P&L: ₹${tradeRealizedPnL.toFixed(2)}. Frictions: ₹${totalFrictions.toFixed(2)}.`,
      });
    }
  };

  // Portfolio Totals
  const totalStockValue = Object.values(portfolio.holdings).reduce(
    (sum, h) => sum + h.quantity * h.currentPrice,
    0
  );
  const totalNetWorth = Math.round((portfolio.cash + totalStockValue) * 100) / 100;
  const totalUnrealizedPnL = Object.values(portfolio.holdings).reduce(
    (sum, h) => sum + (h.currentPrice - h.avgBuyPrice) * h.quantity,
    0
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600 rounded text-white">
              <Wallet className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-100">
              Paper Trading Practice Sandbox
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold uppercase tracking-wider">
              ₹1,00,000 Virtual Capital
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Risk-free practice execution modeling realistic statutory Indian transaction frictions (STT, Brokerage, GST, Slippage)
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Virtual Account
        </button>
      </div>

      {/* Prominent Simulated Disclaimer */}
      <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-semibold uppercase tracking-wide">
            SIMULATED PAPER TRADING — NO REAL CAPITAL OR BROKER EXECUTION
          </span>
        </div>
        <span className="text-[11px] text-amber-400/80 hidden sm:inline">
          Orders are settled purely in local virtual storage for educational mastery.
        </span>
      </div>

      {/* Account Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 block mb-0.5">Total Net Worth</span>
          <span className="text-lg font-extrabold text-sky-400 font-mono">
            ₹{totalNetWorth.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 block mb-0.5">Available Virtual Cash</span>
          <span className="text-lg font-extrabold text-slate-200 font-mono">
            ₹{portfolio.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 block mb-0.5">Unrealized P&L</span>
          <span
            className={`text-lg font-extrabold font-mono ${
              totalUnrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {totalUnrealizedPnL >= 0 ? "+" : ""}₹{totalUnrealizedPnL.toFixed(2)}
          </span>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 block mb-0.5">Frictions Deducted</span>
          <span className="text-lg font-extrabold text-rose-400 font-mono">
            -₹{portfolio.totalFrictionsPaid.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Order Entry Form & Frictions Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Entry Controls */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-4 text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wide">
            Place Simulated Order
          </div>

          {/* Stock Picker */}
          <div>
            <label className="text-slate-400 block mb-1">Select Instrument:</label>
            <select
              value={selectedSymbol}
              onChange={(e) => {
                const sym = e.target.value;
                setSelectedSymbol(sym);
                setCustomPrice(AVAILABLE_STOCKS[sym]?.price || 2450.0);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              {Object.entries(AVAILABLE_STOCKS).map(([sym, meta]) => (
                <option key={sym} value={sym}>
                  {sym} — {meta.name} ({meta.currency === "INR" ? "₹" : "$"}{meta.price})
                </option>
              ))}
            </select>
          </div>

          {/* Action & Order Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Action:</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAction("BUY")}
                  className={`py-1.5 rounded text-xs font-bold transition ${
                    action === "BUY" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setAction("SELL")}
                  className={`py-1.5 rounded text-xs font-bold transition ${
                    action === "SELL" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Order Type:</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderType("MARKET")}
                  className={`py-1.5 rounded text-xs font-bold transition ${
                    orderType === "MARKET" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  MARKET
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("LIMIT")}
                  className={`py-1.5 rounded text-xs font-bold transition ${
                    orderType === "LIMIT" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  LIMIT
                </button>
              </div>
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Quantity (Shares):</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                {orderType === "MARKET" ? "Market Price (Ref):" : "Limit Price:"}
              </label>
              <input
                type="number"
                disabled={orderType === "MARKET"}
                value={execPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono disabled:opacity-60 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Message feedback */}
          {message && (
            <div
              className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                  : "bg-rose-950/60 border border-rose-800 text-rose-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={executeOrder}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 ${
              action === "BUY"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            }`}
          >
            {action === "BUY" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            EXECUTE SIMULATED {action} ORDER
          </button>
        </div>

        {/* Real-time Frictions & Allocation Preview */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3 text-xs font-mono">
          <div className="font-sans font-bold text-slate-300 uppercase tracking-wide flex justify-between">
            <span>Transaction Friction Schedule</span>
            <span className="text-amber-400">Statutory Deductions</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-slate-400">
              <span>Gross Trade Value:</span>
              <span className="text-slate-200">₹{grossTradeValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Securities Transaction Tax (STT @ 0.1%):</span>
              <span className="text-slate-200">₹{stt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Brokerage (0.03% or ₹20 flat cap):</span>
              <span className="text-slate-200">₹{brokerage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST @ 18% on (Brokerage + Turnover):</span>
              <span className="text-slate-200">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Stamp Duty (0.015% on Buy):</span>
              <span className="text-slate-200">₹{stampDuty.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Exchange Turnover & Slippage:</span>
              <span className="text-slate-200">₹{(turnover + slippage).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-1.5 flex justify-between text-rose-400 font-bold">
              <span>Total Frictions:</span>
              <span>₹{totalFrictions.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-1.5 flex justify-between text-sky-400 font-bold text-sm">
              <span>Net Capital Required:</span>
              <span>₹{totalNetTradeCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Allocation warning */}
          {action === "BUY" && (
            <div className="pt-2 font-sans">
              {((totalNetTradeCost / totalNetWorth) * 100) > 25 && (
                <div className="p-2.5 bg-amber-950/40 border border-amber-800 rounded text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    Concentration Warning: This order represents{" "}
                    {((totalNetTradeCost / totalNetWorth) * 100).toFixed(1)}% of your portfolio! Keep single positions below 25%.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex justify-between items-center">
          <span>Current Virtual Portfolio Holdings</span>
          <span className="text-slate-400 text-[11px] font-normal">
            {Object.keys(portfolio.holdings).length} Positions Active
          </span>
        </div>

        {Object.keys(portfolio.holdings).length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No holdings currently owned. Place a simulated BUY order above to start practicing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2">Symbol</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Avg Buy Price</th>
                  <th className="py-2">Current Price</th>
                  <th className="py-2">Holding Value</th>
                  <th className="py-2">Unrealized P&L</th>
                  <th className="py-2">Portfolio %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.values(portfolio.holdings).map((h) => {
                  const val = h.quantity * h.currentPrice;
                  const pnl = (h.currentPrice - h.avgBuyPrice) * h.quantity;
                  const pnlPct = (((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100).toFixed(2);
                  const allocPct = ((val / totalNetWorth) * 100).toFixed(1);
                  const isOverConcentrated = parseFloat(allocPct) > 25.0;

                  return (
                    <tr key={h.symbol} className="hover:bg-slate-900/60 transition">
                      <td className="py-2 font-bold text-sky-400 font-sans">{h.symbol}</td>
                      <td className="py-2 text-slate-200">{h.quantity} sh</td>
                      <td className="py-2 text-slate-400">₹{h.avgBuyPrice.toFixed(2)}</td>
                      <td className="py-2 text-slate-200">₹{h.currentPrice.toFixed(2)}</td>
                      <td className="py-2 font-bold text-slate-200">₹{val.toLocaleString()}</td>
                      <td className={`py-2 font-bold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)} ({pnlPct}%)
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            isOverConcentrated
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "text-slate-400"
                          }`}
                        >
                          {allocPct}% {isOverConcentrated ? "⚠️ >25%" : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders Audit Trail */}
      {portfolio.orders.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Recent Executed Orders Audit Log
          </div>
          <div className="space-y-1.5 font-mono text-[11px] max-h-40 overflow-y-auto pr-1">
            {portfolio.orders.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ord.action === "BUY"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}
                  >
                    {ord.action}
                  </span>
                  <span className="font-bold text-slate-200">{ord.symbol}</span>
                  <span className="text-slate-400">{ord.quantity} sh @ ₹{ord.executionPrice}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>Frictions: ₹{ord.frictions.toFixed(2)}</span>
                  <span>Net: ₹{ord.netValue.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">{ord.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
