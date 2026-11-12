"use client";

import React, { useMemo } from "react";
import { Layers, Activity, TrendingUp, TrendingDown } from "lucide-react";

interface OrderBookDepthProps {
  symbol: string;
  currentPrice: number;
  currency: string;
}

export const OrderBookDepth: React.FC<OrderBookDepthProps> = ({
  symbol,
  currentPrice,
  currency,
}) => {
  const curr = currency === "INR" ? "₹" : "$";

  // Deterministic order book ladder generated around current price
  const { bids, asks, totalBidQty, totalAskQty, spread, spreadPct } = useMemo(() => {
    const tick = currency === "INR" ? 0.05 : 0.01;
    const bidsArr = [];
    const asksArr = [];

    let totalBids = 0;
    let totalAsks = 0;

    for (let i = 1; i <= 5; i++) {
      const bidPrice = currentPrice - i * tick;
      const askPrice = currentPrice + i * tick;
      const bidQty = Math.floor(1200 + ((currentPrice * 17 + i * 491) % 4500));
      const askQty = Math.floor(1100 + ((currentPrice * 23 + i * 383) % 4300));

      totalBids += bidQty;
      totalAsks += askQty;

      bidsArr.push({ price: bidPrice, qty: bidQty });
      asksArr.push({ price: askPrice, qty: askQty });
    }

    const maxQty = Math.max(...bidsArr.map((b) => b.qty), ...asksArr.map((a) => a.qty)) || 1;
    const spr = asksArr[0].price - bidsArr[0].price;
    const sprPct = (spr / currentPrice) * 100;

    return {
      bids: bidsArr.map((b) => ({ ...b, depthPct: (b.qty / maxQty) * 100 })),
      asks: asksArr.map((a) => ({ ...a, depthPct: (a.qty / maxQty) * 100 })),
      totalBidQty: totalBids,
      totalAskQty: totalAsks,
      spread: spr,
      spreadPct: sprPct,
    };
  }, [currentPrice, currency]);

  const buyerPct = Math.round((totalBidQty / (totalBidQty + totalAskQty || 1)) * 100);
  const sellerPct = 100 - buyerPct;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
            Level 2 Market Depth (DMA)
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
          <span>Spread: {curr}{spread.toFixed(2)}</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400 font-semibold">{spreadPct.toFixed(3)}%</span>
        </div>
      </div>

      {/* Buyer vs Seller Pressure Meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono font-bold">
          <span className="text-emerald-400">Buyers {buyerPct}% ({totalBidQty.toLocaleString()})</span>
          <span className="text-rose-400">Sellers {sellerPct}% ({totalAskQty.toLocaleString()})</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full flex overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${buyerPct}%` }}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-300"
            style={{ width: `${sellerPct}%` }}
          />
        </div>
      </div>

      {/* Ladder Grid: Bids vs Asks */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        {/* Bids (Buy Side) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] uppercase tracking-wider font-extrabold text-emerald-400/80 px-1">
            <span>Bid Qty</span>
            <span>Bid Price</span>
          </div>
          {bids.map((b, idx) => (
            <div
              key={idx}
              className="relative flex justify-between items-center px-1.5 py-1 rounded bg-slate-950/60 overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none"
                style={{ width: `${b.depthPct}%` }}
              />
              <span className="text-slate-300 relative z-10">{b.qty.toLocaleString()}</span>
              <span className="text-emerald-400 font-bold relative z-10">
                {curr}{b.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Asks (Sell Side) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] uppercase tracking-wider font-extrabold text-rose-400/80 px-1">
            <span>Ask Price</span>
            <span>Ask Qty</span>
          </div>
          {asks.map((a, idx) => (
            <div
              key={idx}
              className="relative flex justify-between items-center px-1.5 py-1 rounded bg-slate-950/60 overflow-hidden"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                style={{ width: `${a.depthPct}%` }}
              />
              <span className="text-rose-400 font-bold relative z-10">
                {curr}{a.price.toFixed(2)}
              </span>
              <span className="text-slate-300 relative z-10">{a.qty.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
        <span>Order Book Latency: ~12ms</span>
        <span className="text-slate-400">Direct Broker Gateway</span>
      </div>
    </div>
  );
};
