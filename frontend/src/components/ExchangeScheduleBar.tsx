"use client";

import React, { useState, useEffect } from "react";
import { Clock, Globe, Calendar, ChevronDown, ChevronUp } from "lucide-react";

export interface ExchangeSchedule {
  exchange: string;
  region: string;
  timezone: string;
  exchange_local_time: string;
  status: string;
  status_label: string;
  is_open: boolean;
  is_weekend: boolean;
  is_holiday: boolean;
  closure_reason?: string | null;
  pre_open_time: string;
  regular_open_time: string;
  regular_close_time: string;
  remaining_time_to_close?: string | null;
  next_trading_date: string;
  next_market_open: string;
  countdown_seconds: number;
  calendar_source: string;
}

export const ExchangeScheduleBar: React.FC = () => {
  const [schedules, setSchedules] = useState<ExchangeSchedule[]>([
    {
      exchange: "NSE",
      region: "India",
      timezone: "Asia/Kolkata",
      exchange_local_time: new Date().toISOString(),
      status: "OPEN",
      status_label: "Open",
      is_open: true,
      is_weekend: false,
      is_holiday: false,
      pre_open_time: "09:00",
      regular_open_time: "09:15",
      regular_close_time: "15:30",
      next_trading_date: "2026-11-12",
      next_market_open: "2026-11-12T09:15:00+05:30",
      countdown_seconds: 14000,
      calendar_source: "Official NSE 2026 Master Trading Calendar",
    },
    {
      exchange: "BSE",
      region: "India",
      timezone: "Asia/Kolkata",
      exchange_local_time: new Date().toISOString(),
      status: "OPEN",
      status_label: "Open",
      is_open: true,
      is_weekend: false,
      is_holiday: false,
      pre_open_time: "09:00",
      regular_open_time: "09:15",
      regular_close_time: "15:30",
      next_trading_date: "2026-11-12",
      next_market_open: "2026-11-12T09:15:00+05:30",
      countdown_seconds: 14000,
      calendar_source: "Official BSE 2026 Master Trading Calendar",
    },
    {
      exchange: "NYSE",
      region: "United States",
      timezone: "America/New_York",
      exchange_local_time: new Date().toISOString(),
      status: "OPEN",
      status_label: "Open",
      is_open: true,
      is_weekend: false,
      is_holiday: false,
      pre_open_time: "04:00",
      regular_open_time: "09:30",
      regular_close_time: "16:00",
      next_trading_date: "2026-11-12",
      next_market_open: "2026-11-12T09:30:00-05:00",
      countdown_seconds: 22000,
      calendar_source: "Official NYSE 2026 Master Trading Calendar",
    },
    {
      exchange: "NASDAQ",
      region: "United States",
      timezone: "America/New_York",
      exchange_local_time: new Date().toISOString(),
      status: "OPEN",
      status_label: "Open",
      is_open: true,
      is_weekend: false,
      is_holiday: false,
      pre_open_time: "04:00",
      regular_open_time: "09:30",
      regular_close_time: "16:00",
      next_trading_date: "2026-11-12",
      next_market_open: "2026-11-12T09:30:00-05:00",
      countdown_seconds: 22000,
      calendar_source: "Official NASDAQ Master Trading Calendar",
    },
  ]);

  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${apiBase}/api/v1/market/schedules`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSchedules(data);
          }
        }
      } catch {
        // Fallback to initial state
      }
    };

    fetchSchedules();
    const interval = setInterval(fetchSchedules, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#131722] border-b border-[#2A2E39] text-xs px-4 py-1.5 select-none">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Exchange Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#787B86] text-[11px] font-semibold uppercase tracking-wider mr-1">
            <Globe className="w-3.5 h-3.5 text-[#787B86]" />
            <span className="hidden sm:inline">Exchanges:</span>
          </div>

          {schedules.map((sch) => {
            const isOpen = sch.status === "OPEN";
            const isPre = sch.status === "PRE_OPEN";

            const badgeBg = isOpen
              ? "bg-[#089981]/10 text-[#089981] border-[#089981]/30"
              : isPre
              ? "bg-[#2962FF]/10 text-[#2962FF] border-[#2962FF]/30"
              : "bg-[#1E222D] text-[#787B86] border-[#2A2E39]";

            const dotBg = isOpen
              ? "bg-[#089981]"
              : isPre
              ? "bg-[#2962FF]"
              : "bg-[#50535E]";

            return (
              <div
                key={sch.exchange}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] border font-medium ${badgeBg}`}
                title={`${sch.region} (${sch.timezone}) • ${sch.calendar_source}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`} />
                <span className="font-bold">{sch.exchange}</span>
                <span className="text-[10px] opacity-80">
                  {isOpen
                    ? `Open (closes ${sch.regular_close_time})`
                    : isPre
                    ? `Pre-Market`
                    : sch.is_holiday
                    ? `Holiday`
                    : sch.is_weekend
                    ? `Weekend`
                    : `Closed`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Trading Hours Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-[#787B86] hover:text-[#D1D4DC] transition-colors"
          >
            <Calendar className="w-3 h-3" />
            <span>Market Hours &amp; Holidays</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Holiday & Session Details */}
      {expanded && (
        <div className="max-w-[1720px] mx-auto mt-2 pt-2 border-t border-[#2A2E39] grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-[#D1D4DC]">
          <div className="bg-[#1E222D] p-3 rounded-lg border border-[#2A2E39]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2962FF]" /> NSE / BSE (India)
              </span>
              <span className="text-[10px] text-[#787B86]">Asia/Kolkata (IST)</span>
            </div>
            <div className="space-y-1 text-[#787B86] font-tabular">
              <div className="flex justify-between">
                <span>Pre-Open:</span>
                <span className="text-white">09:00 - 09:15</span>
              </div>
              <div className="flex justify-between">
                <span>Regular Trading:</span>
                <span className="text-[#089981] font-semibold">09:15 - 15:30</span>
              </div>
              <div className="flex justify-between">
                <span>Closing Auction:</span>
                <span className="text-white">15:30 - 15:40</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1E222D] p-3 rounded-lg border border-[#2A2E39]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2962FF]" /> NYSE / NASDAQ (US)
              </span>
              <span className="text-[10px] text-[#787B86]">America/New_York (EST)</span>
            </div>
            <div className="space-y-1 text-[#787B86] font-tabular">
              <div className="flex justify-between">
                <span>Pre-Market:</span>
                <span className="text-white">04:00 - 09:30</span>
              </div>
              <div className="flex justify-between">
                <span>Regular Trading:</span>
                <span className="text-[#089981] font-semibold">09:30 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span>After-Hours:</span>
                <span className="text-white">16:00 - 20:00</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
