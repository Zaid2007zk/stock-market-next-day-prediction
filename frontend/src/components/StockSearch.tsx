"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, AlertCircle } from "lucide-react";

export interface SymbolItem {
  symbol: string;
  name: string;
  exchange: string;
  country: string;
}

// Broad master catalogue covering top traded NSE / BSE Indian equities and major global US equities
const EXTENDED_CATALOGUE: SymbolItem[] = [
  // Heavyweight Large Caps & NIFTY 50
  { symbol: "RELIANCE.NS", name: "Reliance Industries Limited", exchange: "NSE", country: "IN" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services Limited", exchange: "NSE", country: "IN" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Limited", exchange: "NSE", country: "IN" },
  { symbol: "INFY.NS", name: "Infosys Limited", exchange: "NSE", country: "IN" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Limited", exchange: "NSE", country: "IN" },
  { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE", country: "IN" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Limited", exchange: "NSE", country: "IN" },
  { symbol: "ITC.NS", name: "ITC Limited", exchange: "NSE", country: "IN" },
  { symbol: "LT.NS", name: "Larsen & Toubro Limited", exchange: "NSE", country: "IN" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Limited", exchange: "NSE", country: "IN" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance Limited", exchange: "NSE", country: "IN" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors Limited", exchange: "NSE", country: "IN" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical Industries", exchange: "NSE", country: "IN" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki India Limited", exchange: "NSE", country: "IN" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Limited", exchange: "NSE", country: "IN" },
  { symbol: "AXISBANK.NS", name: "Axis Bank Limited", exchange: "NSE", country: "IN" },
  { symbol: "NTPC.NS", name: "NTPC Limited", exchange: "NSE", country: "IN" },
  { symbol: "ONGC.NS", name: "Oil & Natural Gas Corporation", exchange: "NSE", country: "IN" },
  { symbol: "POWERGRID.NS", name: "Power Grid Corporation of India", exchange: "NSE", country: "IN" },
  { symbol: "TITAN.NS", name: "Titan Company Limited", exchange: "NSE", country: "IN" },
  { symbol: "WIPRO.NS", name: "Wipro Limited", exchange: "NSE", country: "IN" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises Limited", exchange: "NSE", country: "IN" },
  { symbol: "ADANIPORTS.NS", name: "Adani Ports & SEZ", exchange: "NSE", country: "IN" },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints Limited", exchange: "NSE", country: "IN" },
  { symbol: "COALINDIA.NS", name: "Coal India Limited", exchange: "NSE", country: "IN" },
  { symbol: "JSWSTEEL.NS", name: "JSW Steel Limited", exchange: "NSE", country: "IN" },
  { symbol: "TATASTEEL.NS", name: "Tata Steel Limited", exchange: "NSE", country: "IN" },
  { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement Limited", exchange: "NSE", country: "IN" },
  { symbol: "HCLTECH.NS", name: "HCL Technologies Limited", exchange: "NSE", country: "IN" },
  { symbol: "DRREDDY.NS", name: "Dr. Reddy's Laboratories", exchange: "NSE", country: "IN" },
  { symbol: "CIPLA.NS", name: "Cipla Limited", exchange: "NSE", country: "IN" },
  { symbol: "GRASIM.NS", name: "Grasim Industries Limited", exchange: "NSE", country: "IN" },
  { symbol: "EICHERMOT.NS", name: "Eicher Motors Limited", exchange: "NSE", country: "IN" },
  { symbol: "NESTLEIND.NS", name: "Nestle India Limited", exchange: "NSE", country: "IN" },
  { symbol: "TECHM.NS", name: "Tech Mahindra Limited", exchange: "NSE", country: "IN" },
  { symbol: "INDUSINDBK.NS", name: "IndusInd Bank Limited", exchange: "NSE", country: "IN" },
  { symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv Limited", exchange: "NSE", country: "IN" },
  { symbol: "SHRIRAMFIN.NS", name: "Shriram Finance Limited", exchange: "NSE", country: "IN" },
  { symbol: "BEL.NS", name: "Bharat Electronics Limited", exchange: "NSE", country: "IN" },
  { symbol: "TRENT.NS", name: "Trent Limited", exchange: "NSE", country: "IN" },

  // High-Volume Defense, Railways, Renewable & PSU Stocks
  { symbol: "HAL.NS", name: "Hindustan Aeronautics Limited", exchange: "NSE", country: "IN" },
  { symbol: "SUZLON.NS", name: "Suzlon Energy Limited", exchange: "NSE", country: "IN" },
  { symbol: "IRFC.NS", name: "Indian Railway Finance Corp", exchange: "NSE", country: "IN" },
  { symbol: "RVNL.NS", name: "Rail Vikas Nigam Limited", exchange: "NSE", country: "IN" },
  { symbol: "BHEL.NS", name: "Bharat Heavy Electricals Limited", exchange: "NSE", country: "IN" },
  { symbol: "MAZDOCK.NS", name: "Mazagon Dock Shipbuilders", exchange: "NSE", country: "IN" },
  { symbol: "COCHINSHIP.NS", name: "Cochin Shipyard Limited", exchange: "NSE", country: "IN" },
  { symbol: "IREDA.NS", name: "Indian Renewable Energy Dev Agency", exchange: "NSE", country: "IN" },
  { symbol: "NHPC.NS", name: "NHPC Limited", exchange: "NSE", country: "IN" },
  { symbol: "SJVN.NS", name: "SJVN Limited", exchange: "NSE", country: "IN" },
  { symbol: "RECLTD.NS", name: "REC Limited", exchange: "NSE", country: "IN" },
  { symbol: "PFC.NS", name: "Power Finance Corporation", exchange: "NSE", country: "IN" },
  { symbol: "VEDL.NS", name: "Vedanta Limited", exchange: "NSE", country: "IN" },
  { symbol: "JIOFIN.NS", name: "Jio Financial Services Limited", exchange: "NSE", country: "IN" },
  { symbol: "ZOMATO.NS", name: "Zomato Limited", exchange: "NSE", country: "IN" },
  { symbol: "DMART.NS", name: "Avenue Supermarts Limited", exchange: "NSE", country: "IN" },
  { symbol: "POLYCAB.NS", name: "Polycab India Limited", exchange: "NSE", country: "IN" },
  { symbol: "HAVELLS.NS", name: "Havells India Limited", exchange: "NSE", country: "IN" },
  { symbol: "DLF.NS", name: "DLF Limited", exchange: "NSE", country: "IN" },
  { symbol: "IOC.NS", name: "Indian Oil Corporation", exchange: "NSE", country: "IN" },
  { symbol: "BPCL.NS", name: "Bharat Petroleum Corporation", exchange: "NSE", country: "IN" },
  { symbol: "GAIL.NS", name: "GAIL (India) Limited", exchange: "NSE", country: "IN" },
  { symbol: "BANKBARODA.NS", name: "Bank of Baroda", exchange: "NSE", country: "IN" },
  { symbol: "PNB.NS", name: "Punjab National Bank", exchange: "NSE", country: "IN" },
  { symbol: "CANBK.NS", name: "Canara Bank", exchange: "NSE", country: "IN" },
  { symbol: "MUTHOOTFIN.NS", name: "Muthoot Finance Limited", exchange: "NSE", country: "IN" },

  // US Global Equities
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", country: "US" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", country: "US" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Google)", exchange: "NASDAQ", country: "US" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "AMD", name: "Advanced Micro Devices", exchange: "NASDAQ", country: "US" },
  { symbol: "PLTR", name: "Palantir Technologies", exchange: "NYSE", country: "US" },
  { symbol: "COIN", name: "Coinbase Global", exchange: "NASDAQ", country: "US" },
  { symbol: "INTC", name: "Intel Corporation", exchange: "NASDAQ", country: "US" },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", country: "US" },
  { symbol: "UBER", name: "Uber Technologies", exchange: "NYSE", country: "US" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE", country: "US" },
];

interface StockSearchProps {
  onSelectSymbol: (symbol: string) => void;
  activeSymbol: string;
}

export const StockSearch: React.FC<StockSearchProps> = ({
  onSelectSymbol,
  activeSymbol,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results on debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 1) {
      setResults([]);
      setSelectedIndex(-1);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${apiBase}/api/v1/market/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setResults(data);
          } else {
            // Local fallback filter
            const filtered = EXTENDED_CATALOGUE.filter(
              (s) =>
                s.symbol.toLowerCase().includes(trimmed.toLowerCase()) ||
                s.name.toLowerCase().includes(trimmed.toLowerCase())
            );
            setResults(filtered);
          }
        } else {
          throw new Error("Search API non-200");
        }
      } catch {
        // High-availability client catalogue match
        const localMatches = EXTENDED_CATALOGUE.filter(
          (s) =>
            s.symbol.toLowerCase().includes(trimmed.toLowerCase()) ||
            s.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        setResults(localMatches);
      } finally {
        setLoading(false);
        setSelectedIndex(-1);
        setIsOpen(true);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].symbol);
      } else if (results.length > 0) {
        handleSelect(results[0].symbol);
      } else if (query.trim()) {
        const raw = query.trim().toUpperCase();
        const formatted = raw.endsWith(".NS") || raw.endsWith(".BO") || raw.length <= 4 ? raw : `${raw}.NS`;
        handleSelect(formatted);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (symbol: string) => {
    onSelectSymbol(symbol);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search any stock or enter ticker (e.g. RELIANCE, SUZLON, HAL, AAPL, NVDA)..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900 border border-slate-800 text-slate-100 rounded-xl placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-inner"
        />
        {loading ? (
          <Loader2 className="absolute right-3 w-4 h-4 text-slate-400 animate-spin" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-800/60"
        >
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = selectedIndex === idx || item.symbol === activeSymbol;
              return (
                <button
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-sky-950/80 text-white border-l-2 border-sky-400"
                      : "hover:bg-slate-800/70 text-slate-200"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-sky-400 text-xs block">
                      {item.symbol}
                    </span>
                    <span className="block text-[11px] text-slate-400 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.exchange}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      {item.country}
                    </span>
                  </div>
                </button>
              );
            })
          ) : !loading && query.trim() ? (
            <div className="p-3 text-center space-y-2">
              <p className="text-xs text-slate-300">
                Direct lookup for <strong className="text-sky-400 font-mono">"{query.trim().toUpperCase()}"</strong>
              </p>
              <button
                onClick={() => {
                  const raw = query.trim().toUpperCase();
                  const formatted = raw.endsWith(".NS") || raw.endsWith(".BO") || raw.length <= 4 ? raw : `${raw}.NS`;
                  handleSelect(formatted);
                }}
                className="w-full text-left px-3 py-2 bg-sky-950/60 hover:bg-sky-900 border border-sky-500/40 rounded-lg flex items-center justify-between text-xs text-sky-200 transition"
              >
                <div>
                  <span className="font-semibold block text-sky-300">Query Live Exchange</span>
                  <span className="text-[10px] text-slate-400">Search NSE India, BSE, & US Global Markets</span>
                </div>
                <span className="text-[10px] bg-sky-500 text-slate-950 font-bold px-2 py-0.5 rounded">Analyze ➔</span>
              </button>
            </div>
          ) : null}

          {/* Universe Footer Notice */}
          {results.length > 0 && (
            <div className="p-2 bg-slate-950 text-[10px] text-slate-500 text-center flex items-center justify-between px-3">
              <span>Use ↑ ↓ keys to navigate • Enter to select</span>
              <span className="text-slate-400">All NSE & US Stocks Supported</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
