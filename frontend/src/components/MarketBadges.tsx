"use client";

import React from "react";

interface DataSourceBadgeProps {
  source?: string;
  isStale?: boolean;
  status?: string;
  className?: string;
}

/**
 * Renders prominent, clear labels distinguishing data origins.
 * NEVER labels mock or historical close values as live/current market quotes.
 */
export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source = "",
  isStale = false,
  status = "available",
  className = "",
}) => {
  if (status === "unavailable" || !source || source.toLowerCase().includes("unavailable")) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/60 shadow-sm ${className}`}
        title="No authorized provider connected for this ticker."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />
        Price Feed Connecting
      </span>
    );
  }

  const sLower = source.toLowerCase();

  // Authorized Live Market Feed
  if (sLower.includes("authorized") || sLower.includes("live_feed")) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 shadow-sm ${className}`}
        title="Authorized Live Market Feed. Live exchange quotes."
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
        Authorized Live Market Feed
      </span>
    );
  }

  // Live Exchange Feed (NSE, BSE, US)
  if (sLower.includes("nse") || sLower.includes("global market feed") || sLower.includes("bse")) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 shadow-sm ${className}`}
        title="Live Market Feed"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
        Live Market Feed
      </span>
    );
  }

  // Synthetic Mock Generator
  if (sLower.includes("mock") || sLower.includes("synthetic")) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60 ${className}`}
        title="Deterministic synthetic data generated for testing. NOT a live market feed."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5" />
        Synthetic Mock Data (Staging Mode)
      </span>
    );
  }

  // Development yfinance Feed
  if (sLower.includes("yfinance") || sLower.includes("unverified development")) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950/60 text-sky-300 border border-sky-800/60 ${className}`}
        title="Live Global Market Feed. NOT a live market feed."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-1.5 animate-pulse" />
        Global Market Feed
      </span>
    );
  }

  // Historical CSV Dataset
  if (sLower.includes("csv") || sLower.includes("historical")) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60 ${className}`}
        title="Historical EOD dataset"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5" />
        Historical CSV Dataset (Close)
      </span>
    );
  }

  // Generic fallback badge
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
      {source}
    </span>
  );
};
