"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  DollarSign,
  TrendingUp,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  Key,
  Layers,
  LineChart,
} from "lucide-react";

export interface TerminalSettings {
  currency: "INR" | "USD";
  defaultProduct: "MIS" | "CNC" | "MTF";
  defaultOrderType: "MARKET" | "LIMIT" | "SL";
  confirmOrders: boolean;
  soundAlerts: boolean;
  defaultChartType: "candle" | "area" | "line";
  defaultTimeframe: "1D" | "5D" | "1M" | "6M" | "1Y";
  dailyLossLimit: number;
  maxPositionSize: number;
  traderName?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings?: (settings: TerminalSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<"trading" | "chart" | "risk" | "api">("trading");
  const [settings, setSettings] = useState<TerminalSettings>({
    currency: "INR",
    defaultProduct: "MIS",
    defaultOrderType: "MARKET",
    confirmOrders: false,
    soundAlerts: true,
    defaultChartType: "candle",
    defaultTimeframe: "1D",
    dailyLossLimit: 10000,
    maxPositionSize: 200000,
    traderName: "Pro Trader",
  });
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("marketpulse_terminal_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("marketpulse_terminal_settings", JSON.stringify(settings));
    if (onSaveSettings) {
      onSaveSettings(settings);
    }
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2E39] bg-[#181C27]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2962FF] flex items-center justify-center text-white font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">TradeX Terminal Settings</h2>
              <p className="text-xs text-[#787B86]">
                Configure trading rules, trader profile, chart defaults, risk limits, and broker connections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2A2E39] bg-[#131722] px-4 text-xs font-semibold">
          {[
            { id: "trading", label: "Trading & Orders" },
            { id: "chart", label: "Charts" },
            { id: "risk", label: "Risk Limits" },
            { id: "api", label: "API & Broker" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2.5 px-3 border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-[#2962FF] text-white"
                  : "border-transparent text-[#787B86] hover:text-[#D1D4DC]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Success Banner */}
        {savedFeedback && (
          <div className="p-2.5 bg-[#089981]/20 text-[#089981] text-xs font-semibold flex items-center justify-center gap-1.5 border-b border-[#089981]/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* 1. TRADING SETTINGS */}
          {activeTab === "trading" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Trader Display Name / Handle</label>
                <input
                  type="text"
                  value={settings.traderName || ""}
                  onChange={(e) => setSettings({ ...settings, traderName: e.target.value })}
                  placeholder="e.g. Pro Trader / Quant Lead"
                  className="w-full bg-[#131722] border border-[#2A2E39] focus:border-[#2962FF] rounded p-2 text-white font-medium outline-none"
                />
                <span className="text-[10px] text-[#787B86]">Custom name displayed in TradeX top bar &amp; order book</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Base Currency</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "INR", label: "Indian Rupee (₹ INR)" },
                    { id: "USD", label: "US Dollar ($ USD)" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, currency: c.id as any })}
                      className={`p-2.5 rounded border text-left transition ${
                        settings.currency === c.id
                          ? "bg-[#2962FF]/15 border-[#2962FF] text-white font-semibold"
                          : "bg-[#131722] border-[#2A2E39] text-[#787B86] hover:text-[#D1D4DC]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Default Order Product</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "MIS", label: "Intraday (MIS 5x)" },
                    { id: "CNC", label: "Delivery (CNC 1x)" },
                    { id: "MTF", label: "Margin (MTF 4x)" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, defaultProduct: p.id as any })}
                      className={`p-2 rounded border text-center transition ${
                        settings.defaultProduct === p.id
                          ? "bg-[#2962FF]/15 border-[#2962FF] text-white font-semibold"
                          : "bg-[#131722] border-[#2A2E39] text-[#787B86] hover:text-[#D1D4DC]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Default Order Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["MARKET", "LIMIT", "SL"].map((ot) => (
                    <button
                      key={ot}
                      type="button"
                      onClick={() => setSettings({ ...settings, defaultOrderType: ot as any })}
                      className={`p-2 rounded border text-center transition ${
                        settings.defaultOrderType === ot
                          ? "bg-[#2962FF]/15 border-[#2962FF] text-white font-semibold"
                          : "bg-[#131722] border-[#2A2E39] text-[#787B86] hover:text-[#D1D4DC]"
                      }`}
                    >
                      {ot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A2E39] space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-[#D1D4DC] block">Order Confirmation Dialog</span>
                    <span className="text-[11px] text-[#787B86]">Show popup confirmation before routing orders</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.confirmOrders}
                    onChange={(e) => setSettings({ ...settings, confirmOrders: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2962FF] focus:ring-0 bg-[#131722] border-[#2A2E39]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-[#D1D4DC] block">Sound Effects</span>
                    <span className="text-[11px] text-[#787B86]">Play audio cue on order fill and square off</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundAlerts}
                    onChange={(e) => setSettings({ ...settings, soundAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2962FF] focus:ring-0 bg-[#131722] border-[#2A2E39]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 2. CHART SETTINGS */}
          {activeTab === "chart" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Default Chart Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "candle", label: "Candlestick (OHLC)" },
                    { id: "area", label: "Area Mountain" },
                    { id: "line", label: "Line Chart" },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, defaultChartType: ct.id as any })}
                      className={`p-2.5 rounded border text-center transition ${
                        settings.defaultChartType === ct.id
                          ? "bg-[#2962FF]/15 border-[#2962FF] text-white font-semibold"
                          : "bg-[#131722] border-[#2A2E39] text-[#787B86] hover:text-[#D1D4DC]"
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Default Timeframe</label>
                <div className="grid grid-cols-5 gap-1.5 font-tabular">
                  {["1D", "5D", "1M", "6M", "1Y"].map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setSettings({ ...settings, defaultTimeframe: tf as any })}
                      className={`p-2 rounded border text-center transition ${
                        settings.defaultTimeframe === tf
                          ? "bg-[#2962FF]/15 border-[#2962FF] text-white font-semibold"
                          : "bg-[#131722] border-[#2A2E39] text-[#787B86] hover:text-[#D1D4DC]"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#131722] rounded border border-[#2A2E39] space-y-1 text-[#787B86]">
                <span className="font-bold text-white block">Engine Specifications</span>
                <p>Renderer: HTML5 Canvas 2D Context @ 60 FPS.</p>
                <p>Overlays: 20-Day SMA, 50-Day EMA, Bollinger Bands (20, 2).</p>
              </div>
            </div>
          )}

          {/* 3. RISK LIMITS */}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Daily Max Loss Alert (₹)</label>
                <input
                  type="number"
                  step="1000"
                  value={settings.dailyLossLimit}
                  onChange={(e) => setSettings({ ...settings, dailyLossLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#131722] border border-[#2A2E39] rounded text-white font-tabular font-semibold focus:outline-none focus:border-[#2962FF]"
                />
                <span className="text-[11px] text-[#787B86]">
                  A warning modal will alert you if session losses exceed this threshold.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#D1D4DC]">Max Order Value per Trade (₹)</label>
                <input
                  type="number"
                  step="10000"
                  value={settings.maxPositionSize}
                  onChange={(e) => setSettings({ ...settings, maxPositionSize: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#131722] border border-[#2A2E39] rounded text-white font-tabular font-semibold focus:outline-none focus:border-[#2962FF]"
                />
                <span className="text-[11px] text-[#787B86]">
                  Fat-finger protection prevents transmitting single orders above this value.
                </span>
              </div>
            </div>
          )}

          {/* 4. API & BROKER GATEWAY */}
          {activeTab === "api" && (
            <div className="space-y-3.5">
              <div className="p-3 bg-[#131722] rounded border border-[#2A2E39] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Zerodha Kite Connect v3</span>
                  <span className="text-[10px] font-semibold text-[#089981] bg-[#089981]/15 px-2 py-0.5 rounded">
                    Connected (11ms)
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#787B86]">API Key</label>
                  <input
                    type="password"
                    defaultValue="kite_live_98a72f019bce"
                    className="w-full px-2.5 py-1.5 bg-[#1E222D] border border-[#2A2E39] rounded text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#131722] rounded border border-[#2A2E39] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Upstox Pro API v2</span>
                  <span className="text-[10px] font-semibold text-[#787B86] bg-[#1E222D] px-2 py-0.5 rounded">
                    Ready to Connect
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#787B86]">Access Token</label>
                  <input
                    type="password"
                    placeholder="Enter Upstox OAuth Token..."
                    className="w-full px-2.5 py-1.5 bg-[#1E222D] border border-[#2A2E39] rounded text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2A2E39] bg-[#181C27] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded text-xs font-bold bg-[#2962FF] hover:bg-[#1E53E5] text-white transition flex items-center gap-1.5 shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
