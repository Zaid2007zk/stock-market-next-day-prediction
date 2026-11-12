"use client";

import React from "react";
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink } from "lucide-react";

interface NewsItem {
  id: string;
  source: string;
  title: string;
  timeAgo: string;
  sentiment: "BULLISH" | "NEUTRAL" | "BEARISH";
  score: number;
}

const SAMPLE_NEWS: NewsItem[] = [
  {
    id: "1",
    source: "Bloomberg Terminal Feed",
    title: "RBI MPC signals steady stance amidst resilient industrial output and fiscal discipline",
    timeAgo: "8m ago",
    sentiment: "BULLISH",
    score: 0.82,
  },
  {
    id: "2",
    source: "Reuters Financial Wire",
    title: "Global tech Capex projections revised upward following cloud AI enterprise infrastructure boom",
    timeAgo: "22m ago",
    sentiment: "BULLISH",
    score: 0.76,
  },
  {
    id: "3",
    source: "NSE Official Disclosures",
    title: "FII institutional cash market net inflows cross ₹2,840 Cr in the opening morning session",
    timeAgo: "45m ago",
    sentiment: "BULLISH",
    score: 0.89,
  },
  {
    id: "4",
    source: "Financial Times Market Brief",
    title: "Crude oil consolidates near $74/bbl as OPEC+ maintains supply compliance baseline",
    timeAgo: "1h ago",
    sentiment: "NEUTRAL",
    score: 0.05,
  },
];

export const MarketNewsSentiment: React.FC = () => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
            Market Intelligence & Sentiment
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          +0.78 Bullish Sentiment
        </span>
      </div>

      {/* News List */}
      <div className="space-y-2.5">
        {SAMPLE_NEWS.map((item) => {
          const isBullish = item.sentiment === "BULLISH";
          const isNeutral = item.sentiment === "NEUTRAL";

          return (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-sky-500/30 transition-all group"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="font-semibold text-sky-400">{item.source}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-2.5 h-2.5" /> {item.timeAgo}
                </span>
              </div>
              <p className="text-xs text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                {item.title}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] font-mono">
                <span
                  className={`font-bold flex items-center ${
                    isBullish ? "text-emerald-400" : isNeutral ? "text-slate-400" : "text-rose-400"
                  }`}
                >
                  {isBullish ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-1" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-1" />
                  )}
                  {item.sentiment} ({item.score > 0 ? `+${item.score}` : item.score})
                </span>
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors flex items-center gap-0.5">
                  Verified Wire <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
