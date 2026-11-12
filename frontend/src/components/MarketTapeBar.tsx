"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TapeItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

const DEFAULT_TAPE_ITEMS: TapeItem[] = [
  { symbol: "NIFTY 50", name: "NSE Index", price: "25,302.40", change: "+0.42%", isUp: true },
  { symbol: "SENSEX", name: "BSE Index", price: "82,248.12", change: "+0.38%", isUp: true },
  { symbol: "S&P 500", name: "US Large Cap", price: "5,983.99", change: "+0.74%", isUp: true },
  { symbol: "NASDAQ", name: "US Tech", price: "19,281.40", change: "+0.92%", isUp: true },
  { symbol: "RELIANCE", name: "Energy & Retail", price: "₹1,337.30", change: "+0.97%", isUp: true },
  { symbol: "TCS", name: "IT Services", price: "₹2,469.80", change: "-0.45%", isUp: false },
  { symbol: "HDFCBANK", name: "Banking", price: "₹810.60", change: "+0.52%", isUp: true },
  { symbol: "NVDA", name: "Semiconductors", price: "$168.89", change: "+2.14%", isUp: true },
  { symbol: "AAPL", name: "Consumer Tech", price: "$348.50", change: "+0.85%", isUp: true },
  { symbol: "USD/INR", name: "Forex", price: "₹84.42", change: "+0.04%", isUp: true },
  { symbol: "BRENT CRUDE", name: "Commodity", price: "$74.20", change: "-0.62%", isUp: false },
  { symbol: "GOLD 24K", name: "Bullion (10g)", price: "₹77,450", change: "+0.31%", isUp: true },
];

export const MarketTapeBar: React.FC = () => {
  return (
    <div className="w-full bg-[#181C27] border-b border-[#2A2E39] py-1 px-4 overflow-hidden select-none">
      <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center space-x-1.5 shrink-0 pr-3 border-r border-[#2A2E39]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
          <span className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider">
            Markets
          </span>
        </div>

        <div className="flex items-center space-x-5 shrink-0 text-xs">
          {DEFAULT_TAPE_ITEMS.map((item, idx) => (
            <div
              key={`${item.symbol}-${idx}`}
              className="flex items-center space-x-2 shrink-0 py-0.5 px-2 rounded hover:bg-[#1E222D] transition-colors cursor-pointer"
            >
              <span className="font-semibold text-[#D1D4DC] text-[12px]">
                {item.symbol}
              </span>
              <span className="font-tabular text-white text-[12px] font-bold">
                {item.price}
              </span>
              <span
                className={`font-tabular text-[11px] font-semibold flex items-center ${
                  item.isUp ? "text-[#089981]" : "text-[#F23645]"
                }`}
              >
                {item.isUp ? "+" : ""}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
