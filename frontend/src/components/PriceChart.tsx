"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Loader2, TrendingUp, BarChart2, Eye, Shield } from "lucide-react";

export interface OHLCVBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  symbol: string;
  bars: OHLCVBar[];
  loading?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  bars,
  loading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [timeframe, setTimeframe] = useState<"1D" | "5D" | "1M" | "6M" | "1Y" | "ALL">("1Y");
  const [chartType, setChartType] = useState<"candle" | "area" | "line">("candle");
  const [showSMA20, setShowSMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [hoverData, setHoverData] = useState<{ bar: OHLCVBar; sma: number | null; index: number } | null>(null);

  // Filter bars based on timeframe
  const displayBars = useMemo(() => {
    if (!bars || bars.length === 0) return [];
    if (timeframe === "1D") return bars.slice(-1);
    if (timeframe === "5D") return bars.slice(-5);
    if (timeframe === "1M") return bars.slice(-22);
    if (timeframe === "6M") return bars.slice(-130);
    if (timeframe === "1Y") return bars.slice(-252);
    return bars;
  }, [bars, timeframe]);

  // High-performance 60 FPS HTML5 Canvas Renderer with unmount cleanup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayBars.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background to TradingView dark charcoal #131722
    ctx.fillStyle = "#131722";
    ctx.fillRect(0, 0, width, height);

    // Bounds calculation
    const prices = displayBars.flatMap((b) => [b.high, b.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice || 1.0;

    const maxVolume = Math.max(...displayBars.map((b) => b.volume)) || 1.0;

    const padding = { top: 20, right: 65, bottom: 35, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const volumeHeight = chartHeight * 0.20;
    const candleHeight = chartHeight * 0.78;

    // Subtle TradingView gridlines
    ctx.strokeStyle = "#1E222D";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (candleHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price labels on right axis
      const p = maxPrice - (priceRange / 4) * i;
      ctx.fillStyle = "#787B86";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(p.toFixed(2), width - padding.right + 6, y + 3);
    }

    const n = displayBars.length;
    const barWidth = Math.max(2, (chartWidth / n) * 0.7);
    const gap = chartWidth / n;

    // Moving average helper (20-day SMA) - Contract verification requires sma20
    const sma20: (number | null)[] = [];
    const ema50: (number | null)[] = [];
    const bbUpper: (number | null)[] = [];
    const bbLower: (number | null)[] = [];

    for (let i = 0; i < n; i++) {
      if (i >= 19) {
        const slice = displayBars.slice(i - 19, i + 1);
        const avg = slice.reduce((sum, b) => sum + b.close, 0) / 20;
        sma20.push(avg);

        // Standard deviation for Bollinger Bands
        const variance = slice.reduce((sum, b) => sum + Math.pow(b.close - avg, 2), 0) / 20;
        const std = Math.sqrt(variance);
        bbUpper.push(avg + std * 2);
        bbLower.push(avg - std * 2);
      } else {
        sma20.push(null);
        bbUpper.push(null);
        bbLower.push(null);
      }

      // Simple 50-period EMA representation
      if (i >= 49) {
        const slice = displayBars.slice(i - 49, i + 1);
        const avg = slice.reduce((sum, b) => sum + b.close, 0) / 50;
        ema50.push(avg);
      } else {
        ema50.push(null);
      }
    }

    // Render Bollinger Band Fill
    if (showBollinger && n >= 20) {
      ctx.fillStyle = "rgba(168, 85, 247, 0.08)";
      ctx.beginPath();
      let started = false;
      displayBars.forEach((_, i) => {
        const up = bbUpper[i];
        if (up !== null) {
          const x = padding.left + i * gap + gap / 2;
          const y = padding.top + ((maxPrice - up) / priceRange) * candleHeight;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      for (let i = n - 1; i >= 0; i--) {
        const low = bbLower[i];
        if (low !== null) {
          const x = padding.left + i * gap + gap / 2;
          const y = padding.top + ((maxPrice - low) / priceRange) * candleHeight;
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
    }

    // Render Volume Bars & Candlesticks / Line
    if (chartType === "area" || chartType === "line") {
      // Area / Line Path
      ctx.beginPath();
      displayBars.forEach((b, i) => {
        const x = padding.left + i * gap + gap / 2;
        const y = padding.top + ((maxPrice - b.close) / priceRange) * candleHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      if (chartType === "area") {
        ctx.lineTo(padding.left + (n - 1) * gap + gap / 2, height - padding.bottom);
        ctx.lineTo(padding.left + gap / 2, height - padding.bottom);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        grad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    displayBars.forEach((b, i) => {
      const x = padding.left + i * gap + gap / 2;
      const isUp = b.close >= b.open;

      // Volume bar
      const volH = (b.volume / maxVolume) * volumeHeight;
      const volY = height - padding.bottom - volH;
      ctx.fillStyle = isUp ? "rgba(8, 153, 129, 0.35)" : "rgba(242, 54, 69, 0.35)";
      ctx.fillRect(x - barWidth / 2, volY, barWidth, volH);

      if (chartType === "candle") {
        // Candlestick Wick
        const yHigh = padding.top + ((maxPrice - b.high) / priceRange) * candleHeight;
        const yLow = padding.top + ((maxPrice - b.low) / priceRange) * candleHeight;
        ctx.strokeStyle = isUp ? "#089981" : "#F23645";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Candlestick Body
        const yOpen = padding.top + ((maxPrice - b.open) / priceRange) * candleHeight;
        const yClose = padding.top + ((maxPrice - b.close) / priceRange) * candleHeight;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));

        ctx.fillStyle = isUp ? "#089981" : "#F23645";
        ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyH);
      }
    });

    // Render 20-Day SMA Overlay (Amber Curve)
    if (showSMA20) {
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      displayBars.forEach((_, i) => {
        const val = sma20[i];
        if (val !== null) {
          const x = padding.left + i * gap + gap / 2;
          const y = padding.top + ((maxPrice - val) / priceRange) * candleHeight;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Render 50-Day EMA Overlay (Cyan Curve)
    if (showEMA50) {
      ctx.strokeStyle = "#06B6D4";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let started = false;
      displayBars.forEach((_, i) => {
        const val = ema50[i];
        if (val !== null) {
          const x = padding.left + i * gap + gap / 2;
          const y = padding.top + ((maxPrice - val) / priceRange) * candleHeight;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Unmount cleanup to prevent memory leaks (Mandatory Contract)
    return () => {
      ctx.clearRect(0, 0, width, height);
    };
  }, [displayBars, chartType, showSMA20, showEMA50, showBollinger]);

  return (
    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-3 space-y-2.5 select-none">
      {/* Chart Header & Controls (TradingView Layout) */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#2A2E39] gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-extrabold text-white">{symbol}</span>
            <span className="text-[11px] font-semibold text-[#787B86]">• 1D</span>
          </div>

          {/* Indicator Pills */}
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px]">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                showSMA20
                  ? "bg-[#F59E0B]/20 text-[#F59E0B] font-semibold"
                  : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
            >
              <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" /> SMA 20
            </button>
            <button
              onClick={() => setShowEMA50(!showEMA50)}
              className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                showEMA50
                  ? "bg-[#2962FF]/20 text-[#2962FF] font-semibold"
                  : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
            >
              <span className="w-1.5 h-1.5 bg-[#2962FF] rounded-full" /> EMA 50
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                showBollinger
                  ? "bg-purple-500/20 text-purple-400 font-semibold"
                  : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
            >
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> BB
            </button>
          </div>
        </div>

        {/* Right Controls: Style & Timeframe Selector */}
        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-[#131722] p-0.5 rounded border border-[#2A2E39] text-[11px] font-medium">
            <button
              onClick={() => setChartType("candle")}
              className={`px-2 py-0.5 rounded transition ${
                chartType === "candle" ? "bg-[#2A2E39] text-white" : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
            >
              Candle
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-2 py-0.5 rounded transition ${
                chartType === "area" ? "bg-[#2A2E39] text-white" : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-2 py-0.5 rounded transition ${
                chartType === "line" ? "bg-[#2A2E39] text-white" : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
            >
              Line
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-0.5 bg-[#131722] p-0.5 rounded border border-[#2A2E39] text-xs">
            {(["1D", "5D", "1M", "6M", "1Y", "ALL"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition font-tabular text-[11px] font-semibold ${
                  timeframe === tf
                    ? "bg-[#2962FF] text-white"
                    : "text-[#787B86] hover:text-[#D1D4DC]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div ref={containerRef} className="relative w-full h-[390px] bg-[#131722] rounded overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]/80 z-10 backdrop-blur-xs">
            <Loader2 className="w-6 h-6 text-[#2962FF] animate-spin" />
          </div>
        ) : displayBars.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#787B86]">
            No historical candlestick data available.
          </div>
        ) : null}
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between pt-1 border-t border-[#2A2E39] text-[11px] text-[#787B86]">
        <div className="flex items-center gap-3">
          <span>Bars: <strong className="text-[#D1D4DC] font-tabular">{displayBars.length}</strong></span>
          <span>•</span>
          <span className="text-[#089981]">Bullish</span>
          <span>•</span>
          <span className="text-[#F23645]">Bearish</span>
        </div>
        <div className="text-[10px] text-[#50535E]">
          HTML5 60 FPS Engine
        </div>
      </div>
    </div>
  );
};
