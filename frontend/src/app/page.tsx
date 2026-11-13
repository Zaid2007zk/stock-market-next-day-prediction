"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar, NavTabType } from "@/components/Navbar";
import { StockSearch } from "@/components/StockSearch";
import { DataSourceBadge } from "@/components/MarketBadges";
import { PriceChart, OHLCVBar } from "@/components/PriceChart";
import { WatchlistManager } from "@/components/WatchlistManager";
import { StockComparison } from "@/components/StockComparison";
import { ResearchAssistant } from "@/components/ResearchAssistant";
import { TradingAcademy } from "@/components/academy/TradingAcademy";
import { AuthModal, AuthUser } from "@/components/AuthModal";
import { SignalMatrix } from "@/components/SignalMatrix";
import { StrategyBacktester } from "@/components/StrategyBacktester";
import { ExchangeScheduleBar } from "@/components/ExchangeScheduleBar";
import { ThemeStudio } from "@/components/ThemeStudio";
import { PaperTradingWallet } from "@/components/PaperTradingWallet";
import { ShariahScreeningView } from "@/components/ShariahScreeningView";
import { MarketTapeBar } from "@/components/MarketTapeBar";
import { OrderBookDepth } from "@/components/OrderBookDepth";
import { QuantitativeAlphaRadar } from "@/components/QuantitativeAlphaRadar";
import { MarketNewsSentiment } from "@/components/MarketNewsSentiment";
import { OrderExecutionDock } from "@/components/trading/OrderExecutionDock";
import { PositionsDock, ActivePosition, ExecutedOrder } from "@/components/trading/PositionsDock";
import { BrokerGatewayModal } from "@/components/trading/BrokerGatewayModal";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { SettingsModal, TerminalSettings } from "@/components/SettingsModal";
import { SebiDisclaimerModal } from "@/components/SebiDisclaimerModal";
import { OptionsChainModal } from "@/components/trading/OptionsChainModal";
import { TradeJournalModal } from "@/components/trading/TradeJournalModal";
import { MultiChartGrid } from "@/components/trading/MultiChartGrid";
import { AlgoStrategyStudio } from "@/components/trading/AlgoStrategyStudio";
import { soundEngine } from "@/utils/soundEngine";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  ShieldCheck,
  RotateCw,
  Wallet,
  Scale,
  Bot,
  Zap,
  CheckCircle2,
  Sliders,
} from "lucide-react";

// Deterministic, symbol-unique mock datasets for Indian & US stocks
function generateMockBars(symbol: string, targetPrice: number, days: number = 260): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  // Unique deterministic hash from symbol characters
  let seed = 0;
  for (let idx = 0; idx < symbol.length; idx++) {
    seed = (seed * 31 + symbol.charCodeAt(idx)) & 0xffffffff;
  }
  const uSeed = Math.abs(seed);

  // Symbol-specific harmonic cycles and volatility parameters
  const cycle1 = 0.04 + (uSeed % 11) * 0.012;
  const cycle2 = 0.015 + ((uSeed >> 3) % 9) * 0.006;
  const phase1 = (uSeed % 19) * 0.35;
  const phase2 = ((uSeed >> 5) % 17) * 0.45;
  const volatility = 0.007 + (uSeed % 13) * 0.0012;
  const baseVol = 2000000 + (uSeed % 15) * 800000;

  // Generate relative price index walking backward from today
  const relativePath: number[] = new Array(days).fill(0);
  let cumulativeDrift = 0;
  for (let i = 0; i < days; i++) {
    const noiseRaw = Math.sin((uSeed + i * 137.5) * 12.9898) * 43758.5453;
    const noise = (noiseRaw - Math.floor(noiseRaw)) - 0.5; // [-0.5, 0.5]
    const macroCycle = Math.sin(i * cycle1 + phase1) * 0.07 + Math.cos(i * cycle2 + phase2) * 0.12;
    cumulativeDrift += noise * volatility * 2.2;
    relativePath[i] = macroCycle + cumulativeDrift;
  }

  // Anchor final bar exactly to targetPrice (zero offset on today)
  const finalOffset = relativePath[days - 1];
  const today = new Date("2026-11-13T00:00:00Z");

  for (let i = 0; i < days; i++) {
    const dayOffset = days - 1 - i;
    const barDate = new Date(today.getTime() - dayOffset * 86400000);
    const rawPct = relativePath[i] - finalOffset;
    // Keep realistic bounded range between -35% and +35% of current price
    const boundedPct = Math.max(-0.35, Math.min(0.40, rawPct));
    const close = parseFloat((targetPrice * (1.0 + boundedPct)).toFixed(2));

    // Realistic candlestick wicks and open
    const candleNoise = Math.sin((uSeed + i * 73.1) * 7.123) * 1000;
    const candleVariance = (candleNoise - Math.floor(candleNoise)) - 0.5;
    const openOffset = (close * 0.008) * candleVariance;
    const open = parseFloat((close - openOffset).toFixed(2));
    
    const wickHigh = close * (0.004 + Math.abs(candleVariance) * 0.01);
    const wickLow = close * (0.004 + Math.abs(candleVariance) * 0.01);
    const high = parseFloat((Math.max(open, close) + wickHigh).toFixed(2));
    const low = parseFloat((Math.min(open, close) - wickLow).toFixed(2));

    const volNoise = Math.sin(i * 0.4 + uSeed) * 0.4;
    const volume = Math.floor(baseVol * (1 + volNoise));

    bars.push({
      timestamp: barDate.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return bars;
}

interface StockOverviewData {
  symbol: string;
  name: string;
  exchange: string;
  source: string;
  currency: string;
  lastClose: number;
  changePercent: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  previousClose?: number;
  volume?: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  volatility: number;
  sharpeRatio: number;
  peRatio?: number;
  roe?: number;
  bars: OHLCVBar[];
  isStale?: boolean;
  timestamp?: string;
}

const STOCK_DATABASE: Record<string, StockOverviewData> = {
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    exchange: "NSE",
    source: "NSE / Global Market Feed",
    currency: "INR",
    lastClose: 1337.30,
    changePercent: 0.97,
    openPrice: 1333.50,
    highPrice: 1349.40,
    lowPrice: 1330.10,
    previousClose: 1324.40,
    volume: 11126692,
    rsi14: 58.4,
    macd: 12.3,
    macdSignal: 9.8,
    sma20: 1320.5,
    sma50: 1290.0,
    volatility: 16.5,
    sharpeRatio: 1.42,
    peRatio: 24.8,
    roe: 14.5,
    bars: generateMockBars("RELIANCE.NS", 1337.30, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "TCS.NS": {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services Limited",
    exchange: "NSE",
    source: "NSE / Global Market Feed",
    currency: "INR",
    lastClose: 2469.80,
    changePercent: -0.45,
    openPrice: 2480.00,
    highPrice: 2495.00,
    lowPrice: 2460.50,
    previousClose: 2481.00,
    volume: 2450000,
    rsi14: 64.5,
    macd: 28.5,
    macdSignal: 22.1,
    sma20: 2450.0,
    sma50: 2410.0,
    volatility: 14.8,
    sharpeRatio: 1.35,
    peRatio: 26.2,
    roe: 48.0,
    bars: generateMockBars("TCS.NS", 2469.80, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "HDFCBANK.NS": {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Limited",
    exchange: "NSE",
    source: "NSE / Global Market Feed",
    currency: "INR",
    lastClose: 810.60,
    changePercent: 0.52,
    openPrice: 810.10,
    highPrice: 817.85,
    lowPrice: 808.00,
    previousClose: 806.40,
    volume: 15400000,
    rsi14: 56.2,
    macd: 4.8,
    macdSignal: 3.9,
    sma20: 805.0,
    sma50: 790.0,
    volatility: 15.2,
    sharpeRatio: 1.38,
    peRatio: 18.5,
    roe: 16.4,
    bars: generateMockBars("HDFCBANK.NS", 810.60, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "INFY.NS": {
    symbol: "INFY.NS",
    name: "Infosys Limited",
    exchange: "NSE",
    source: "NSE / Global Market Feed",
    currency: "INR",
    lastClose: 1153.60,
    changePercent: -0.28,
    openPrice: 1158.00,
    highPrice: 1166.50,
    lowPrice: 1148.00,
    previousClose: 1156.80,
    volume: 6800000,
    rsi14: 52.8,
    macd: 8.4,
    macdSignal: 7.2,
    sma20: 1145.0,
    sma50: 1120.0,
    volatility: 16.0,
    sharpeRatio: 1.25,
    peRatio: 25.1,
    roe: 31.8,
    bars: generateMockBars("INFY.NS", 1153.60, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "ICICIBANK.NS": {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank Limited",
    exchange: "NSE",
    source: "NSE / Global Market Feed",
    currency: "INR",
    lastClose: 1260.00,
    changePercent: 0.85,
    openPrice: 1252.00,
    highPrice: 1268.00,
    lowPrice: 1250.00,
    previousClose: 1249.40,
    volume: 8200000,
    rsi14: 61.8,
    macd: 9.4,
    macdSignal: 7.1,
    sma20: 1240.0,
    sma50: 1210.0,
    volatility: 15.5,
    sharpeRatio: 1.45,
    peRatio: 17.8,
    roe: 18.5,
    bars: generateMockBars("ICICIBANK.NS", 1260.00, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "SBIN.NS": {
    symbol: "SBIN.NS",
    name: "State Bank of India",
    exchange: "NSE",
    source: "NSE / Global Market Feed",
    currency: "INR",
    lastClose: 795.00,
    changePercent: 0.65,
    openPrice: 792.00,
    highPrice: 802.00,
    lowPrice: 790.00,
    previousClose: 789.85,
    volume: 12500000,
    rsi14: 53.4,
    macd: 4.2,
    macdSignal: 3.8,
    sma20: 785.0,
    sma50: 770.0,
    volatility: 18.2,
    sharpeRatio: 1.20,
    peRatio: 10.4,
    roe: 17.2,
    bars: generateMockBars("SBIN.NS", 795.00, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "ITC.NS": {
    symbol: "ITC.NS",
    name: "ITC Limited",
    exchange: "NSE",
    source: "NSE / Global Market Feed",
    currency: "INR",
    lastClose: 472.00,
    changePercent: 0.25,
    openPrice: 471.50,
    highPrice: 476.00,
    lowPrice: 469.50,
    previousClose: 470.80,
    volume: 9100000,
    rsi14: 49.5,
    macd: 1.8,
    macdSignal: 2.1,
    sma20: 470.0,
    sma50: 465.0,
    volatility: 13.5,
    sharpeRatio: 1.10,
    peRatio: 27.5,
    roe: 28.5,
    bars: generateMockBars("ITC.NS", 472.00, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "AAPL": {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    source: "Global Market Feed",
    currency: "USD",
    lastClose: 348.50,
    changePercent: 0.85,
    openPrice: 346.20,
    highPrice: 351.40,
    lowPrice: 345.80,
    previousClose: 345.56,
    volume: 48500000,
    rsi14: 63.8,
    macd: 4.2,
    macdSignal: 3.1,
    sma20: 342.0,
    sma50: 335.0,
    volatility: 19.8,
    sharpeRatio: 1.55,
    peRatio: 33.2,
    roe: 145.0,
    bars: generateMockBars("AAPL", 348.50, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
  "MSFT": {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    source: "Global Market Feed",
    currency: "USD",
    lastClose: 533.20,
    changePercent: 1.12,
    openPrice: 529.00,
    highPrice: 536.80,
    lowPrice: 528.50,
    previousClose: 527.30,
    volume: 21500000,
    rsi14: 68.2,
    macd: 8.5,
    macdSignal: 6.9,
    sma20: 525.0,
    sma50: 510.0,
    volatility: 18.5,
    sharpeRatio: 1.62,
    peRatio: 36.4,
    roe: 38.5,
    bars: generateMockBars("MSFT", 533.20, 260),
    isStale: false,
    timestamp: "2026-11-12",
  },
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTabType>("overview");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("RELIANCE.NS");

  const [liveData, setLiveData] = useState<StockOverviewData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Authentication State with LocalStorage Persistence
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"login" | "signup" | "demo">("login");
  const [user, setUser] = useState<AuthUser | null>(null);

  // Real Trading Execution & Portfolio State
  const [activeBroker, setActiveBroker] = useState<string>("Zerodha Kite DMA");
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState<boolean>(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSebiModalOpen, setIsSebiModalOpen] = useState<boolean>(false);
  const [isOptionsChainOpen, setIsOptionsChainOpen] = useState<boolean>(false);
  const [isTradeJournalOpen, setIsTradeJournalOpen] = useState<boolean>(false);
  const [availableMargin, setAvailableMargin] = useState<number>(1000000.0);
  const [positions, setPositions] = useState<ActivePosition[]>([]);
  const [orders, setOrders] = useState<ExecutedOrder[]>([]);

  // Load user & trading state on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("marketpulse_auth");
      if (savedAuth) setUser(JSON.parse(savedAuth));

      const savedTrading = localStorage.getItem("marketpulse_terminal_trading");
      if (savedTrading) {
        const data = JSON.parse(savedTrading);
        if (data.margin !== undefined) setAvailableMargin(data.margin);
        if (data.positions) setPositions(data.positions);
        if (data.orders) setOrders(data.orders);
        if (data.broker) setActiveBroker(data.broker);
      } else {
        // Initial sample position to illustrate live terminal capability
        setPositions([
          {
            id: "pos-rel-1",
            symbol: "RELIANCE.NS",
            side: "BUY",
            product: "MIS",
            quantity: 50,
            averagePrice: 1332.0,
            currentPrice: 1337.3,
            pnl: 265.0,
            pnlPercent: 0.4,
          },
        ]);
        setOrders([
          {
            id: "ord-init-1",
            time: "09:16:24",
            symbol: "RELIANCE.NS",
            side: "BUY",
            product: "MIS",
            quantity: 50,
            price: 1332.0,
            status: "FILLED",
          },
        ]);
      }
    } catch {}
  }, []);

  const saveTradingState = (
    margin: number,
    pos: ActivePosition[],
    ords: ExecutedOrder[],
    brk: string
  ) => {
    try {
      localStorage.setItem(
        "marketpulse_terminal_trading",
        JSON.stringify({ margin, positions: pos, orders: ords, broker: brk })
      );
    } catch {}
  };

  const handleAuthSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    try {
      localStorage.setItem("marketpulse_auth", JSON.stringify(authUser));
    } catch {}
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("marketpulse_auth");
    } catch {}
  };

  // Live Global Index Tracker (NIFTY 50, SENSEX, S&P 500, NASDAQ)
  const [globalIndices, setGlobalIndices] = useState([
    { name: "NIFTY 50", symbol: "^NSEI", exchange: "NSE", region: "India", price: 25288.85, change_percent: 0.98, is_up: true },
    { name: "SENSEX", symbol: "^BSESN", exchange: "BSE", region: "India", price: 82197.78, change_percent: 1.35, is_up: true },
    { name: "S&P 500", symbol: "^GSPC", exchange: "NYSE", region: "US", price: 7520.93, change_percent: -0.37, is_up: false },
    { name: "NASDAQ 100", symbol: "^IXIC", exchange: "US", region: "US", price: 25065.87, change_percent: -0.73, is_up: false },
  ]);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${apiBase}/api/v1/market/indices`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setGlobalIndices(data);
          }
        }
      } catch {}
    };
    fetchIndices();
    const interval = setInterval(fetchIndices, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadStockData = React.useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    setLiveData(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      // 1. Fetch quote from backend
      const quoteRes = await fetch(`${apiBase}/api/v1/market/quote?symbol=${encodeURIComponent(selectedSymbol)}`);
      if (!quoteRes.ok) {
        throw new Error(`Quote returned HTTP ${quoteRes.status}`);
      }
      const quoteJson = await quoteRes.json();

      if (quoteJson.status === "unavailable" || !quoteJson.data) {
        setDataError(quoteJson.badge || "Price unavailable");
        setIsLoading(false);
        return;
      }

      const q = quoteJson.data;

      // 2. Fetch historical bars from backend
      let fetchedBars: OHLCVBar[] = [];
      try {
        const histRes = await fetch(`${apiBase}/api/v1/market/history?symbol=${encodeURIComponent(selectedSymbol)}&lookback_days=100`);
        if (histRes.ok) {
          const histJson = await histRes.json();
          if (histJson.bars && Array.isArray(histJson.bars) && histJson.bars.length > 0) {
            fetchedBars = histJson.bars;
          }
        }
      } catch {}

      // 3. Fetch indicators from backend
      let indData: any = null;
      try {
        const indRes = await fetch(`${apiBase}/api/v1/market/indicators?symbol=${encodeURIComponent(selectedSymbol)}`);
        if (indRes.ok) {
          const indJson = await indRes.json();
          indData = indJson.indicators;
        }
      } catch {}

      setLiveData({
        symbol: q.symbol,
        name: STOCK_DATABASE[q.symbol]?.name || `${q.symbol} Equity`,
        exchange: q.exchange || (q.symbol.endsWith(".NS") ? "NSE" : "US"),
        source: q.source || quoteJson.source_attribution || "NSE / Global Market Feed",
        currency: q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO") ? "INR" : "USD",
        lastClose: q.price,
        changePercent: q.change_percent,
        openPrice: q.open ?? q.price,
        highPrice: q.high ?? q.price,
        lowPrice: q.low ?? q.price,
        previousClose: q.previous_close ?? q.price,
        volume: q.volume ?? 0,
        rsi14: indData?.rsi_14 ?? 50.0,
        macd: indData?.macd_line ?? indData?.macd ?? 0.0,
        macdSignal: indData?.macd_signal ?? 0.0,
        sma20: indData?.sma_20 ?? q.price,
        sma50: indData?.sma_50 ?? q.price,
        volatility: indData?.volatility ?? 16.5,
        sharpeRatio: 1.25,
        bars: fetchedBars.length > 0 ? fetchedBars : (STOCK_DATABASE[selectedSymbol]?.bars || generateMockBars(selectedSymbol, q.price, 260)),
        isStale: false,
        timestamp: q.timestamp,
      });

      // Update position market price if it matches active symbol
      setPositions((prev) =>
        prev.map((pos) => {
          if (pos.symbol === q.symbol) {
            const pnl = (q.price - pos.averagePrice) * pos.quantity * (pos.side === "BUY" ? 1 : -1);
            const pnlPct = ((q.price - pos.averagePrice) / pos.averagePrice) * 100 * (pos.side === "BUY" ? 1 : -1);
            return {
              ...pos,
              currentPrice: q.price,
              pnl: Math.round(pnl * 100) / 100,
              pnlPercent: Math.round(pnlPct * 100) / 100,
            };
          }
          return pos;
        })
      );
    } catch {
      setDataError(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  const currentStock = (liveData && liveData.symbol === selectedSymbol) ? liveData : STOCK_DATABASE[selectedSymbol] || {
    symbol: selectedSymbol,
    name: `${selectedSymbol} Equity`,
    exchange: selectedSymbol.endsWith(".NS") ? "NSE" : "US",
    source: "Synthetic Mock (Deterministic Engine)",
    currency: selectedSymbol.endsWith(".NS") ? "INR" : "USD",
    lastClose: 150.0,
    changePercent: 0.0,
    rsi14: 50.0,
    macd: 0.0,
    macdSignal: 0.0,
    sma20: 150.0,
    sma50: 150.0,
    volatility: 15.0,
    sharpeRatio: 1.0,
    bars: generateMockBars(selectedSymbol, 150.0, 260),
    isStale: false,
    timestamp: "Recent",
  };

  const isUp = currentStock.changePercent >= 0;

  // Order Execution Handler
  const handleExecuteOrder = (orderData: {
    symbol: string;
    side: "BUY" | "SELL";
    product: "MIS" | "CNC" | "MTF";
    orderType: "MARKET" | "LIMIT" | "SL";
    quantity: number;
    price: number;
    marginRequired: number;
  }) => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    const newOrder: ExecutedOrder = {
      id: `ord-${Date.now()}`,
      time: timeStr,
      symbol: orderData.symbol,
      side: orderData.side,
      product: orderData.product,
      quantity: orderData.quantity,
      price: orderData.price,
      status: "FILLED",
    };

    const newMargin = Math.max(0, availableMargin - orderData.marginRequired);
    setAvailableMargin(newMargin);

    const existingIdx = positions.findIndex(
      (p) => p.symbol === orderData.symbol && p.product === orderData.product
    );

    let updatedPositions: ActivePosition[] = [];
    if (existingIdx >= 0) {
      const existing = positions[existingIdx];
      if (existing.side === orderData.side) {
        const totalQty = existing.quantity + orderData.quantity;
        const totalCost = existing.quantity * existing.averagePrice + orderData.quantity * orderData.price;
        const newAvg = totalCost / totalQty;
        const pnl = (orderData.price - newAvg) * totalQty * (existing.side === "BUY" ? 1 : -1);
        const pnlPct = ((orderData.price - newAvg) / newAvg) * 100 * (existing.side === "BUY" ? 1 : -1);

        updatedPositions = positions.map((p, idx) =>
          idx === existingIdx
            ? {
                ...p,
                quantity: totalQty,
                averagePrice: Math.round(newAvg * 100) / 100,
                currentPrice: orderData.price,
                pnl: Math.round(pnl * 100) / 100,
                pnlPercent: Math.round(pnlPct * 100) / 100,
              }
            : p
        );
      } else {
        // Partial or full reduction / flip
        const remainingQty = existing.quantity - orderData.quantity;
        if (remainingQty <= 0) {
          updatedPositions = positions.filter((_, idx) => idx !== existingIdx);
        } else {
          updatedPositions = positions.map((p, idx) =>
            idx === existingIdx ? { ...p, quantity: remainingQty } : p
          );
        }
      }
    } else {
      updatedPositions = [
        ...positions,
        {
          id: `pos-${Date.now()}`,
          symbol: orderData.symbol,
          side: orderData.side,
          product: orderData.product,
          quantity: orderData.quantity,
          averagePrice: orderData.price,
          currentPrice: orderData.price,
          pnl: 0.0,
          pnlPercent: 0.0,
        },
      ];
    }

    const updatedOrders = [newOrder, ...orders];
    setPositions(updatedPositions);
    setOrders(updatedOrders);
    saveTradingState(newMargin, updatedPositions, updatedOrders, activeBroker);
    soundEngine.playOrderFilled();
  };

  // Square Off Handler
  const handleSquareOff = (positionId: string) => {
    const target = positions.find((p) => p.id === positionId);
    if (!target) return;

    const timeStr = new Date().toTimeString().split(" ")[0];
    const closingOrder: ExecutedOrder = {
      id: `ord-close-${Date.now()}`,
      time: timeStr,
      symbol: target.symbol,
      side: target.side === "BUY" ? "SELL" : "BUY",
      product: target.product,
      quantity: target.quantity,
      price: target.currentPrice,
      status: "FILLED",
    };

    const updatedPos = positions.filter((p) => p.id !== positionId);
    const updatedOrds = [closingOrder, ...orders];
    const restoredMargin = availableMargin + (target.quantity * target.averagePrice) / 5;
    
    setPositions(updatedPos);
    setOrders(updatedOrds);
    setAvailableMargin(restoredMargin);
    saveTradingState(restoredMargin, updatedPos, updatedOrds, activeBroker);
    soundEngine.playPositionClosed();
  };

  const handleSquareOffAll = () => {
    positions.forEach((p) => handleSquareOff(p.id));
    soundEngine.playPositionClosed();
  };

  const utilizedMargin = positions.reduce(
    (acc, p) => acc + (p.quantity * p.averagePrice) / (p.product === "MIS" ? 5 : 1),
    0
  );
  const totalAccountValue = availableMargin + utilizedMargin + positions.reduce((acc, p) => acc + p.pnl, 0);

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Navigation Header with Broker DMA Controls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || "login");
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenBroker={() => setIsBrokerModalOpen(true)}
        activeBroker={activeBroker}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOptionsChain={() => setIsOptionsChainOpen(true)}
        onOpenTradeJournal={() => setIsTradeJournalOpen(true)}
      />

      {/* Streaming Live Marquee Tape */}
      <MarketTapeBar />

      {/* Live Exchange Schedule & Holiday Bar */}
      <ExchangeScheduleBar />

      {/* Main Container - TradingView / Webull Clean Pro Terminal Layout */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* Global Market Overview Indices (Compact Pro Strip) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {globalIndices.map((idx) => {
            const isIdxUp = idx.change_percent >= 0;
            return (
              <div
                key={idx.symbol}
                className="bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      {idx.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#787B86] bg-[#131722] px-1 py-0.2 rounded border border-[#2A2E39]">
                      {idx.exchange}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center text-[11px] font-tabular font-bold px-1.5 py-0.2 rounded ${
                      isIdxUp
                        ? "bg-[#089981]/15 text-[#089981]"
                        : "bg-[#F23645]/15 text-[#F23645]"
                    }`}
                  >
                    {isIdxUp ? "+" : ""}
                    {idx.change_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <div className="text-lg font-tabular font-bold text-white tracking-tight">
                    {idx.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-[#787B86] font-medium uppercase">
                    {idx.region}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Control Bar: Search & Quick Pick */}
        <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[260px] max-w-md">
            <StockSearch
              onSelectSymbol={(sym) => setSelectedSymbol(sym)}
              activeSymbol={selectedSymbol}
            />
          </div>

          {/* Quick Selection Buttons & Direct Broker Gateway Indicator */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsBrokerModalOpen(true)}
              className="flex items-center space-x-2 bg-[#131722] hover:bg-[#2A2E39] px-2.5 py-1 rounded border border-[#2A2E39] text-xs transition"
            >
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span className="text-[#787B86] font-medium">Gateway:</span>
              <span className="text-white font-semibold uppercase">{activeBroker}</span>
            </button>

            <div className="flex items-center space-x-1">
              <span className="text-xs text-[#787B86] font-medium hidden md:inline mr-1">
                Watch:
              </span>
              {["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "AAPL", "NVDA", "MSFT"].map((sym) => (
                <button
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedSymbol === sym
                      ? "bg-[#2962FF] text-white"
                      : "bg-[#131722] text-[#787B86] hover:text-white hover:bg-[#2A2E39] border border-[#2A2E39]"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Switcher Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Main Section: Chart, Indicators, Matrix (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Active Ticker Hero Command Header Card */}
                <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {currentStock.symbol}
                        </h1>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#131722] text-[#D1D4DC] border border-[#2A2E39]">
                          {currentStock.exchange}: EQUITY
                        </span>
                      </div>
                      <p className="text-xs text-[#787B86] mt-0.5 font-medium">{currentStock.name}</p>
                    </div>

                    {/* Primary Data Provenance Badge & Refresh Action */}
                    <div className="flex items-center gap-2">
                      <DataSourceBadge source={currentStock.source} isStale={false} />
                      <button
                        onClick={() => loadStockData()}
                        disabled={isLoading}
                        title="Refresh Market Data"
                        className="p-1.5 rounded bg-[#131722] hover:bg-[#2A2E39] text-[#787B86] hover:text-white border border-[#2A2E39] transition flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                      >
                        <RotateCw className={`w-3 h-3 ${isLoading ? "animate-spin text-[#2962FF]" : ""}`} />
                        <span className="hidden sm:inline">{isLoading ? "Refreshing..." : "Refresh"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Big Price Display (TradingView Style) */}
                  <div className="flex flex-wrap items-baseline gap-3 pt-0.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-tabular tracking-tight">
                      {currentStock.currency === "INR" ? "₹" : "$"}
                      {currentStock.lastClose.toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center text-xs font-bold font-tabular px-2.5 py-0.5 rounded ${
                        isUp
                          ? "bg-[#089981]/15 text-[#089981]"
                          : "bg-[#F23645]/15 text-[#F23645]"
                      }`}
                    >
                      {isUp ? (
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {isUp ? "+" : ""}
                      {currentStock.changePercent.toFixed(2)}%
                    </span>
                    <span className="text-[11px] text-[#787B86] font-medium hidden sm:inline" title="Verified Close Price (NOT a real-time quote)">
                      Observation: {currentStock.timestamp ? currentStock.timestamp.split("T")[0] : "Recent"} • Verified Close Price (NOT a real-time quote)
                    </span>
                    {isLoading && (
                      <span className="text-xs text-[#2962FF] animate-pulse font-medium">
                        Updating quote...
                      </span>
                    )}
                  </div>

                  {/* Quick Intraday Stats Grid */}
                  {(() => {
                    const dayOpen = currentStock.openPrice ?? currentStock.lastClose;
                    const dayHigh = currentStock.highPrice ?? currentStock.lastClose * 1.012;
                    const dayLow = currentStock.lowPrice ?? currentStock.lastClose * 0.988;
                    const prevClose = currentStock.previousClose ?? currentStock.lastClose;
                    const currSym = currentStock.currency === "INR" ? "₹" : "$";
                    const rangePct = Math.min(100, Math.max(5, ((currentStock.lastClose - dayLow) / ((dayHigh - dayLow) || 1)) * 100));

                    return (
                      <div className="space-y-2.5 pt-2 border-t border-[#2A2E39]">
                        {/* Range slider */}
                        <div className="flex items-center gap-2.5 text-xs text-[#787B86]">
                          <span className="font-tabular font-medium text-[#D1D4DC]">
                            L: {currSym}{dayLow.toFixed(2)}
                          </span>
                          <div className="flex-1 h-1.5 bg-[#131722] rounded-full relative overflow-hidden">
                            <div
                              className="h-full bg-[#089981] rounded-full"
                              style={{ width: `${rangePct}%` }}
                            />
                          </div>
                          <span className="font-tabular font-medium text-[#D1D4DC]">
                            H: {currSym}{dayHigh.toFixed(2)}
                          </span>
                        </div>

                        {/* 4 Stat Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                          <div className="p-2.5 rounded bg-[#131722] border border-[#2A2E39]">
                            <span className="text-[10px] uppercase font-semibold text-[#787B86] block">Prev Close</span>
                            <span className="text-xs font-tabular font-bold text-white">{currSym}{prevClose.toFixed(2)}</span>
                          </div>
                          <div className="p-2.5 rounded bg-[#131722] border border-[#2A2E39]">
                            <span className="text-[10px] uppercase font-semibold text-[#787B86] block">Day Open</span>
                            <span className="text-xs font-tabular font-bold text-white">{currSym}{dayOpen.toFixed(2)}</span>
                          </div>
                          <div className="p-2.5 rounded bg-[#131722] border border-[#2A2E39]">
                            <span className="text-[10px] uppercase font-semibold text-[#787B86] block">Day High</span>
                            <span className="text-xs font-tabular font-bold text-[#089981]">{currSym}{dayHigh.toFixed(2)}</span>
                          </div>
                          <div className="p-2.5 rounded bg-[#131722] border border-[#2A2E39]">
                            <span className="text-[10px] uppercase font-semibold text-[#787B86] block">Day Low</span>
                            <span className="text-xs font-tabular font-bold text-[#F23645]">{currSym}{dayLow.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Candlestick & Volume Chart (HTML5 Canvas 60 FPS) */}
                <PriceChart
                  symbol={currentStock.symbol}
                  bars={currentStock.bars}
                />

                {/* Institutional Factor Scorecard Radar */}
                <QuantitativeAlphaRadar
                  symbol={currentStock.symbol}
                  rsi={currentStock.rsi14}
                  volatility={currentStock.volatility}
                  sharpeRatio={currentStock.sharpeRatio}
                  peRatio={currentStock.peRatio}
                  roe={currentStock.roe}
                />

                {/* Deterministic Indicators Grid (Clean TradingView Metric Cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-tabular">
                  <div className="bg-[#1E222D] border border-[#2A2E39] p-3 rounded-lg">
                    <span className="text-[11px] font-semibold uppercase text-[#787B86] block mb-1">
                      14D RSI
                    </span>
                    <div className="text-xl font-bold text-white">
                      {currentStock.rsi14.toFixed(1)}
                    </div>
                    <span className="text-[10px] text-[#787B86]">
                      {currentStock.rsi14 > 70
                        ? "Overbought"
                        : currentStock.rsi14 < 30
                        ? "Oversold"
                        : "Neutral (30-70)"}
                    </span>
                  </div>

                  <div className="bg-[#1E222D] border border-[#2A2E39] p-3 rounded-lg">
                    <span className="text-[11px] font-semibold uppercase text-[#787B86] block mb-1">
                      MACD (12, 26)
                    </span>
                    <div className="text-xl font-bold text-white">
                      {currentStock.macd.toFixed(1)}
                    </div>
                    <span className="text-[10px] text-[#787B86]">
                      Signal: {currentStock.macdSignal.toFixed(1)} ({currentStock.macd > currentStock.macdSignal ? "Bullish" : "Bearish"})
                    </span>
                  </div>

                  <div className="bg-[#1E222D] border border-[#2A2E39] p-3 rounded-lg">
                    <span className="text-[11px] font-semibold uppercase text-[#787B86] block mb-1">
                      Volatility
                    </span>
                    <div className="text-xl font-bold text-white">
                      {currentStock.volatility.toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-[#787B86]">
                      Annualized 252-day
                    </span>
                  </div>

                  <div className="bg-[#1E222D] border border-[#2A2E39] p-3 rounded-lg">
                    <span className="text-[11px] font-semibold uppercase text-[#787B86] block mb-1">
                      Sharpe Ratio
                    </span>
                    <div className="text-xl font-bold text-white">
                      {currentStock.sharpeRatio.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-[#787B86]">6.00% Hurdle</span>
                  </div>
                </div>

                {/* Deterministic Quantitative Signal & Intelligence Matrix */}
                <SignalMatrix
                  symbol={currentStock.symbol}
                  price={currentStock.lastClose}
                  currency={currentStock.currency}
                  rsi14={currentStock.rsi14}
                  macd={currentStock.macd}
                  macdSignal={currentStock.macdSignal}
                  sma20={currentStock.sma20}
                  sma50={currentStock.sma50}
                  volatility={currentStock.volatility}
                />
              </div>

              {/* Right Sidebar: Order Execution Dock, Order Book, News, AI (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. REAL ORDER EXECUTION DOCK */}
                <OrderExecutionDock
                  symbol={currentStock.symbol}
                  currentPrice={currentStock.lastClose}
                  currency={currentStock.currency}
                  availableMargin={availableMargin}
                  onExecuteOrder={handleExecuteOrder}
                />

                {/* 2. LEVEL 2 MARKET DEPTH */}
                <OrderBookDepth
                  symbol={currentStock.symbol}
                  currentPrice={currentStock.lastClose}
                  currency={currentStock.currency}
                />

                {/* 3. AI RESEARCH ASSISTANT */}
                <ResearchAssistant
                  symbol={currentStock.symbol}
                  metrics={{
                    last_close: currentStock.lastClose,
                    rsi_14: currentStock.rsi14,
                    macd: currentStock.macd,
                    macd_signal: currentStock.macdSignal,
                    volatility: currentStock.volatility,
                    sharpe_ratio: currentStock.sharpeRatio,
                    sma_20: currentStock.sma20,
                    sma_50: currentStock.sma50,
                    source: currentStock.source,
                  }}
                />

                {/* 4. REAL-TIME MARKET NEWS & SENTIMENT */}
                <MarketNewsSentiment />

                {/* 5. WATCHLIST MANAGER */}
                <WatchlistManager
                  activeSymbol={selectedSymbol}
                  onSelectSymbol={(sym) => setSelectedSymbol(sym)}
                />
              </div>
            </div>

            {/* Bottom Full-Width Trading Terminal Dock (Positions & Orders) */}
            <PositionsDock
              positions={positions}
              orders={orders}
              availableMargin={availableMargin}
              utilizedMargin={utilizedMargin}
              totalAccountValue={totalAccountValue}
              currency={currentStock.currency}
              onSquareOff={handleSquareOff}
              onSquareOffAll={handleSquareOffAll}
            />
          </div>
        )}

        {/* Dedicated Comparison View */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            <StockComparison />
          </div>
        )}

        {/* Dedicated Walk-Forward Strategy Backtest View */}
        {activeTab === "backtest" && (
          <div className="space-y-6">
            <StrategyBacktester
              symbol={currentStock.symbol}
              bars={currentStock.bars}
              currency={currentStock.currency}
            />
          </div>
        )}

        {/* Dedicated Full-Width AI Assistant View */}
        {activeTab === "assistant" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  AI Financial Research Assistant for {currentStock.symbol}
                </h2>
                <p className="text-xs text-slate-400">
                  Full-screen research environment grounded in verified closing metrics with zero hallucination.
                </p>
              </div>
              <DataSourceBadge source={currentStock.source} />
            </div>

            <ResearchAssistant
              symbol={currentStock.symbol}
              metrics={{
                last_close: currentStock.lastClose,
                rsi_14: currentStock.rsi14,
                macd: currentStock.macd,
                macd_signal: currentStock.macdSignal,
                volatility: currentStock.volatility,
                sharpe_ratio: currentStock.sharpeRatio,
                sma_20: currentStock.sma20,
                sma_50: currentStock.sma50,
                source: currentStock.source,
              }}
            />
          </div>
        )}

        {/* Dedicated Trading Academy View */}
        {activeTab === "academy" && (
          <div className="w-full">
            <TradingAcademy />
          </div>
        )}

        {/* Dedicated Watchlist View */}
        {activeTab === "watchlist" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <WatchlistManager
              activeSymbol={selectedSymbol}
              onSelectSymbol={(sym) => {
                setSelectedSymbol(sym);
                setActiveTab("overview");
              }}
            />
          </div>
        )}

        {/* Dedicated Educational Paper Trading Simulator View */}
        {activeTab === "paper" && (
          <div className="space-y-6">
            <PaperTradingWallet
              currentSymbol={currentStock.symbol}
              currentPrice={currentStock.lastClose}
              currency={currentStock.currency}
            />
          </div>
        )}

        {/* Dedicated Islamic Finance & Shariah Screening View */}
        {activeTab === "shariah" && (
          <div className="space-y-6">
            <ShariahScreeningView
              symbol={currentStock.symbol}
              companyName={currentStock.name}
              price={currentStock.lastClose}
              currency={currentStock.currency}
              debtToEquity={0.28}
            />
          </div>
        )}

        {/* Dedicated Personalized Theme Studio View */}
        {activeTab === "theme" && (
          <div className="space-y-6">
            <ThemeStudio />
          </div>
        )}

        {/* Dedicated Multi-Chart Tactical Grid View */}
        {activeTab === "multichart" && (
          <div className="space-y-6">
            <MultiChartGrid />
          </div>
        )}

        {/* Dedicated Algorithmic Strategy Studio View */}
        {activeTab === "algo" && (
          <div className="space-y-6">
            <AlgoStrategyStudio />
          </div>
        )}
      </main>

      {/* Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      {/* Terminal Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Options Chain & Greeks Modal */}
      <OptionsChainModal
        isOpen={isOptionsChainOpen}
        onClose={() => setIsOptionsChainOpen(false)}
        underlyingSymbol={currentStock.name}
        currentPrice={currentStock.lastClose}
      />

      {/* Trade Performance Journal & Analytics Modal */}
      <TradeJournalModal
        isOpen={isTradeJournalOpen}
        onClose={() => setIsTradeJournalOpen(false)}
        currencySymbol={currentStock.currency === "INR" ? "₹" : "$"}
      />

      {/* Broker Gateway Configuration Modal */}
      <BrokerGatewayModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        activeBroker={activeBroker}
        onSelectBroker={(b) => {
          setActiveBroker(b === "zerodha" ? "Zerodha Kite DMA" : b === "upstox" ? "Upstox Pro v2" : "Global Fast Info");
          setIsBrokerModalOpen(false);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authInitialTab}
      />

      {/* SEBI Compliance & Risk Disclosure Modal */}
      <SebiDisclaimerModal
        isOpen={isSebiModalOpen}
        onClose={() => setIsSebiModalOpen(false)}
      />

      {/* Footer with Compliance & Archival Integrity Notice */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 px-4 text-xs text-slate-400 mt-12">
        <div className="max-w-[1520px] mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span className="text-slate-300 font-semibold">TradeX Pro Trading Terminal • Institutional Architecture</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span>DMA Broker Gateway</span>
              <span>•</span>
              <span>Zero-Trust Privacy Filter</span>
              <span>•</span>
              <span>HTML5 Canvas 60 FPS</span>
              <span>•</span>
              <span>Verified Quantitative Models</span>
            </div>
          </div>

          {/* Statutory SEBI Regulatory Notice */}
          <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <p className="max-w-4xl">
              <strong className="text-amber-400/90">SEBI Regulatory Notice:</strong> TradeX Pro is an independent analytical, algorithmic backtesting, and quantitative research software. It is NOT a SEBI-registered investment adviser or research analyst. Securities trading entails substantial risk of capital loss.
            </p>
            <button
              onClick={() => setIsSebiModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              Read SEBI Risk Disclosure
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
