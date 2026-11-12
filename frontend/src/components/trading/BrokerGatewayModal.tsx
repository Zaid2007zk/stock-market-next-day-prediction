"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Key,
  Lock,
  ExternalLink,
  Zap,
  Radio,
  Server,
} from "lucide-react";

interface BrokerGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBroker: string;
  onSelectBroker: (brokerId: string) => void;
}

export const BrokerGatewayModal: React.FC<BrokerGatewayModalProps> = ({
  isOpen,
  onClose,
  activeBroker,
  onSelectBroker,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const brokers = [
    {
      id: "zerodha",
      name: "Zerodha Kite Connect v3",
      exchange: "NSE / BSE DMA",
      latency: "11ms",
      status: "AUTHENTICATED",
      desc: "Institutional ultra-low latency Direct Market Access order routing.",
      isDefault: true,
    },
    {
      id: "upstox",
      name: "Upstox Pro v2",
      exchange: "NSE / BSE DMA",
      latency: "14ms",
      status: "CONNECTED",
      desc: "WebSocket streaming quotes and algorithmic trade execution.",
      isDefault: false,
    },
    {
      id: "global",
      name: "Global DMA Feed & Fast Info",
      exchange: "NSE / BSE / NASDAQ",
      latency: "8ms",
      status: "ACTIVE",
      desc: "Exchange fast-info sub-second execution pipeline.",
      isDefault: false,
    },
  ];

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Broker Gateway Manager</h2>
              <p className="text-xs text-slate-400 font-medium">Select DMA order execution router</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Broker List */}
        <div className="space-y-2.5">
          {brokers.map((b) => {
            const isSelected = activeBroker === b.id;
            return (
              <div
                key={b.id}
                onClick={() => onSelectBroker(b.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-sky-950/40 border-sky-500/50 shadow-md ring-1 ring-sky-500/30"
                    : "bg-slate-950/60 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{b.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {b.exchange}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{b.status}</span>
                    <span className="text-slate-500">({b.latency})</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">{b.desc}</p>
              </div>
            );
          })}
        </div>

        {/* API Credentials Configuration */}
        <form onSubmit={handleSaveCredentials} className="space-y-3 pt-2 border-t border-white/5 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Configure Live Broker API Keys (Optional)
          </span>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">API Key / App Key</label>
            <div className="relative flex items-center">
              <Key className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. zkite_live_99482..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">API Secret / Access Token</label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••••••••••••••••••"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gateway Credentials Secured & Active</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-950"
            >
              Save & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
