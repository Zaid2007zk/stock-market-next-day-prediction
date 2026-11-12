"use client";

import React, { useState } from "react";
import { Sliders, Layers, AlertCircle, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";

interface OrderBookProps {
  language?: "en" | "hinglish";
}

interface OrderLevel {
  price: number;
  qty: number;
  orders: number;
}

export const OrderBookVisualizer: React.FC<OrderBookProps> = ({ language = "en" }) => {
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [orderQty, setOrderQty] = useState<number>(50);
  const [limitPrice, setLimitPrice] = useState<number>(2450.0);

  // Realistic synthetic order book ladder for RELIANCE
  const asks: OrderLevel[] = [
    { price: 2451.5, qty: 150, orders: 12 },
    { price: 2451.0, qty: 110, orders: 9 },
    { price: 2450.5, qty: 80, orders: 6 },
    { price: 2450.25, qty: 45, orders: 4 },
    { price: 2450.0, qty: 30, orders: 3 }, // Lowest Ask
  ];

  const bids: OrderLevel[] = [
    { price: 2449.5, qty: 35, orders: 4 }, // Highest Bid
    { price: 2449.25, qty: 60, orders: 7 },
    { price: 2449.0, qty: 95, orders: 11 },
    { price: 2448.5, qty: 140, orders: 14 },
    { price: 2448.0, qty: 200, orders: 18 },
  ];

  const bestAsk = asks[asks.length - 1].price;
  const bestBid = bids[0].price;
  const spread = (bestAsk - bestBid).toFixed(2);
  const spreadPct = (((bestAsk - bestBid) / bestAsk) * 100).toFixed(3);

  // Calculate execution simulation
  let simulatedAvgFillPrice = 0;
  let simulatedCost = 0;
  let remaining = orderQty;
  let slippageCost = 0;

  if (action === "buy") {
    if (orderType === "market") {
      let costSum = 0;
      let filled = 0;
      // Consume asks from bottom (lowest ask) to top
      for (let i = asks.length - 1; i >= 0 && remaining > 0; i--) {
        const take = Math.min(remaining, asks[i].qty);
        costSum += take * asks[i].price;
        filled += take;
        remaining -= take;
      }
      simulatedAvgFillPrice = filled > 0 ? costSum / filled : bestAsk;
      simulatedCost = costSum;
      slippageCost = (simulatedAvgFillPrice - bestAsk) * filled;
    } else {
      // Limit order buy
      if (limitPrice >= bestAsk) {
        simulatedAvgFillPrice = bestAsk;
        simulatedCost = orderQty * bestAsk;
      } else {
        // Rests in the book
        simulatedAvgFillPrice = limitPrice;
        simulatedCost = orderQty * limitPrice;
      }
    }
  } else {
    // Sell
    if (orderType === "market") {
      let costSum = 0;
      let filled = 0;
      for (let i = 0; i < bids.length && remaining > 0; i++) {
        const take = Math.min(remaining, bids[i].qty);
        costSum += take * bids[i].price;
        filled += take;
        remaining -= take;
      }
      simulatedAvgFillPrice = filled > 0 ? costSum / filled : bestBid;
      simulatedCost = costSum;
      slippageCost = (bestBid - simulatedAvgFillPrice) * filled;
    } else {
      simulatedAvgFillPrice = limitPrice;
      simulatedCost = orderQty * limitPrice;
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            {language === "hinglish" ? "Order Book Depth & Spread Simulator" : "Order Book Depth & Spread Simulator"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Dekhein bids aur asks aapas me kaise match hote hain aur order size badhne par slippage kaise aati hai"
              : "Visualize how bids & asks match and observe the real cost of urgency & size slippage"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Spread:</span>
          <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
            ₹{spread} ({spreadPct}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Controls Panel */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {language === "hinglish" ? "Order Settings Setup" : "Simulate Your Order"}
          </div>

          {/* Action: Buy or Sell */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAction("buy")}
              className={`py-2 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                action === "buy"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> BUY ORDER
            </button>
            <button
              onClick={() => setAction("sell")}
              className={`py-2 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                action === "sell"
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> SELL ORDER
            </button>
          </div>

          {/* Order Type: Market vs Limit */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderType("market")}
              className={`py-1.5 rounded text-xs font-semibold transition ${
                orderType === "market"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Market Order
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`py-1.5 rounded text-xs font-semibold transition ${
                orderType === "limit"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Limit Order
            </button>
          </div>

          {/* Order Quantity Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Order Quantity:</span>
              <span className="font-bold text-sky-400">{orderQty} Shares</span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={orderQty}
              onChange={(e) => setOrderQty(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>10 sh (Retail)</span>
              <span>100 sh</span>
              <span>250 sh (Depth Impact)</span>
            </div>
          </div>

          {/* Limit Price Slider (if limit order) */}
          {orderType === "limit" && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Your Limit Price:</span>
                <span className="font-bold text-amber-400">₹{limitPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="2447.0"
                max="2453.0"
                step="0.25"
                value={limitPrice}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="text-[10px] text-slate-400 mt-1">
                {limitPrice < bestBid
                  ? "Below best bid: Order will sit passively in bid queue"
                  : limitPrice >= bestAsk
                  ? "Crosses the spread: Immediate fill against lowest ask"
                  : "Inside spread: Becomes new best bid"}
              </div>
            </div>
          )}

          {/* Simulated Execution Outcome Card */}
          <div className="p-3 bg-slate-900 rounded border border-slate-700/60 text-xs space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center justify-between">
              <span>Estimated Execution:</span>
              <span className="text-emerald-400 font-mono">₹{simulatedAvgFillPrice.toFixed(2)} / sh</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Trade Outlay:</span>
              <span className="font-mono text-slate-200">₹{simulatedCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            {slippageCost > 0 && orderType === "market" && (
              <div className="flex justify-between text-rose-400 font-medium">
                <span>Depth Slippage Drag:</span>
                <span>+₹{slippageCost.toFixed(2)} paid over best price</span>
              </div>
            )}
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              {language === "hinglish"
                ? orderType === "market"
                  ? "Market order turant bharta hai lekin badi quantity hone par upar ke sellers se kharidna padta hai (Slippage)."
                  : "Limit order me price fix rehti hai lekin tabhi execute hoga jab koi us rate par bechne aayega."
                : orderType === "market"
                ? "Market orders prioritize speed over price. Notice how large size sweeps up the order book ladder."
                : "Limit orders protect your execution price but will sit unfilled if market prices move away."}
            </div>
          </div>
        </div>

        {/* Visual Order Book Depth Ladder */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Market Depth Ladder (RELIANCE.NS)</span>
            <span className="text-[10px] text-slate-400 font-normal">Live 5-Level Depth</span>
          </div>

          <div className="space-y-1 font-mono text-xs">
            {/* Header */}
            <div className="grid grid-cols-3 text-slate-400 text-[11px] pb-1 border-b border-slate-800">
              <span>Orders / Side</span>
              <span className="text-center">Price (₹)</span>
              <span className="text-right">Available Qty</span>
            </div>

            {/* Asks (Sell Orders) - Red */}
            {asks.map((lvl, idx) => {
              const widthPct = Math.min(100, (lvl.qty / 200) * 100);
              const isBest = idx === asks.length - 1;
              return (
                <div
                  key={`ask-${idx}`}
                  className={`relative grid grid-cols-3 py-1 px-1.5 rounded transition ${
                    isBest ? "bg-rose-950/40 border border-rose-800/40" : "hover:bg-slate-900"
                  }`}
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/15 rounded pointer-events-none"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="text-slate-400 text-[11px] relative z-10">{lvl.orders} asks</span>
                  <span className="text-center font-bold text-rose-400 relative z-10">
                    ₹{lvl.price.toFixed(2)}
                  </span>
                  <span className="text-right text-slate-300 relative z-10">{lvl.qty}</span>
                </div>
              );
            })}

            {/* The Spread Divider */}
            <div className="my-2 py-1.5 px-3 bg-slate-900 border-y border-dashed border-slate-700 rounded flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans font-semibold">Spread Gap (Ask - Bid)</span>
              <span className="font-bold text-amber-400 font-mono">₹{spread}</span>
            </div>

            {/* Bids (Buy Orders) - Green */}
            {bids.map((lvl, idx) => {
              const widthPct = Math.min(100, (lvl.qty / 200) * 100);
              const isBest = idx === 0;
              return (
                <div
                  key={`bid-${idx}`}
                  className={`relative grid grid-cols-3 py-1 px-1.5 rounded transition ${
                    isBest ? "bg-emerald-950/40 border border-emerald-800/40" : "hover:bg-slate-900"
                  }`}
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 rounded pointer-events-none"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="text-slate-400 text-[11px] relative z-10">{lvl.orders} bids</span>
                  <span className="text-center font-bold text-emerald-400 relative z-10">
                    ₹{lvl.price.toFixed(2)}
                  </span>
                  <span className="text-right text-slate-300 relative z-10">{lvl.qty}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
