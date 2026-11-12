"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  LineChart,
  Grid3X3,
  FlaskConical,
  Wallet,
  Scale,
  GraduationCap,
  Sparkles,
  Bookmark,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Settings,
  Crown,
  CreditCard,
  User,
  Sliders,
  Layers,
  BookOpen,
  Cpu,
  Grid,
} from "lucide-react";
import { AuthUser } from "./AuthModal";

export type NavTabType =
  | "overview"
  | "compare"
  | "assistant"
  | "watchlist"
  | "academy"
  | "backtest"
  | "paper"
  | "shariah"
  | "theme"
  | "multichart"
  | "algo";

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  user: AuthUser | null;
  onOpenAuth: (tab?: "login" | "signup" | "demo") => void;
  onLogout: () => void;
  onOpenBroker?: () => void;
  activeBroker?: string;
  onOpenSubscription?: () => void;
  onOpenSettings?: () => void;
  onOpenOptionsChain?: () => void;
  onOpenTradeJournal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenBroker,
  activeBroker = "Zerodha Kite",
  onOpenSubscription,
  onOpenSettings,
  onOpenOptionsChain,
  onOpenTradeJournal,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#131722] border-b border-[#2A2E39] select-none">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-5">
        <div className="flex justify-between items-center h-13 py-2">
          {/* Left: Brand & Main Navigation */}
          <div className="flex items-center space-x-6">
            {/* Brand Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => setActiveTab("overview")}
            >
              <div className="w-8 h-8 rounded-lg bg-[#2962FF] flex items-center justify-center text-white font-bold shadow-sm">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">
                  TradeX
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2962FF] bg-[#2962FF]/10 px-1.5 py-0.5 rounded border border-[#2962FF]/30">
                  PRO
                </span>
              </div>
            </div>

            {/* Navigation Tabs (TradingView-style clean buttons) */}
            <nav className="hidden xl:flex items-center space-x-0.5 text-[13px] font-medium text-[#787B86]">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "overview"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                Chart &amp; Terminal
              </button>
              <button
                onClick={() => setActiveTab("compare")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "compare"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                Stock Matrix
              </button>
              <button
                onClick={() => setActiveTab("backtest")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "backtest"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                Strategy Backtest
              </button>
              <button
                onClick={() => setActiveTab("paper")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "paper"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>Paper Trading</span>
              </button>
              <button
                onClick={() => setActiveTab("shariah")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "shariah"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#089981]" />
                <span>Shariah</span>
              </button>
              <button
                onClick={() => setActiveTab("academy")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "academy"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#2962FF]" />
                <span>Academy</span>
              </button>
              <button
                onClick={() => setActiveTab("assistant")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "assistant"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Copilot</span>
              </button>
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "watchlist"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist</span>
              </button>
              <button
                onClick={() => setActiveTab("multichart")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "multichart"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-Chart</span>
              </button>
              <button
                onClick={() => setActiveTab("algo")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "algo"
                    ? "text-white bg-[#1E222D] font-semibold"
                    : "hover:text-[#D1D4DC] hover:bg-[#1E222D]/60"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Algo Studio</span>
              </button>
            </nav>
          </div>

          {/* Right: Actions, Subscription, Settings & User Account */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Options Chain Quick Action */}
            {onOpenOptionsChain && (
              <button
                onClick={onOpenOptionsChain}
                title="Open F&O Options Chain & Greeks"
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] hover:text-white text-xs transition text-[#D1D4DC] cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#089981]" />
                <span className="text-[12px] font-medium">Options</span>
              </button>
            )}

            {/* Trade Journal Quick Action */}
            {onOpenTradeJournal && (
              <button
                onClick={onOpenTradeJournal}
                title="Performance Journal & Execution Log"
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] hover:text-white text-xs transition text-[#D1D4DC] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[12px] font-medium">Journal</span>
              </button>
            )}
            {/* Subscription / Pricing Button */}
            <button
              onClick={onOpenSubscription}
              title="Pricing & Subscription Plans"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2962FF]/10 hover:bg-[#2962FF]/20 border border-[#2962FF]/40 text-xs font-semibold text-[#2962FF] hover:text-[#5282FF] transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pricing &amp; Plans</span>
              <span className="text-[10px] bg-[#2962FF] text-white px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                Pro
              </span>
            </button>

            {/* Terminal Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Terminal Settings & Risk Controls"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] hover:text-white text-xs transition text-[#D1D4DC] flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#787B86]" />
              <span className="hidden md:inline text-[12px] font-medium">Settings</span>
            </button>

            {/* Broker DMA Indicator */}
            <button
              onClick={onOpenBroker}
              title="Broker Gateway (Zerodha / Upstox / DMA)"
              className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#1E222D] border border-[#2A2E39] hover:border-[#363C4E] text-xs transition text-[#D1D4DC] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span className="text-[12px] font-medium text-[#787B86]">Broker:</span>
              <span className="text-[12px] font-semibold text-[#D1D4DC]">{activeBroker}</span>
              <ChevronDown className="w-3 h-3 text-[#787B86]" />
            </button>

            {/* User Account / Profile / Auth */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-xs text-[#D1D4DC] bg-[#1E222D] hover:bg-[#2A2E39] px-2.5 py-1 rounded border border-[#2A2E39] transition cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#2962FF] text-white flex items-center justify-center font-bold text-[10px]">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="truncate max-w-[100px] sm:max-w-[130px] font-medium">
                    {user.email}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#787B86]" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-[#1E222D] border border-[#2A2E39] rounded-lg shadow-2xl py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-[#2A2E39] bg-[#131722]/50">
                      <div className="font-semibold text-white truncate">{user.email}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] bg-[#089981]/20 text-[#089981] px-1.5 py-0.5 rounded font-bold border border-[#089981]/30">
                          PRO SUBSCRIBER
                        </span>
                        <span className="text-[10px] text-[#787B86]">ID: MP-98421</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenSubscription) onOpenSubscription();
                        }}
                        className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-medium">Subscription &amp; Plans</div>
                          <div className="text-[10px] text-[#787B86]">Manage billing &amp; tier upgrades</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <Settings className="w-4 h-4 text-[#2962FF]" />
                        <div>
                          <div className="font-medium">Terminal Settings</div>
                          <div className="text-[10px] text-[#787B86]">Risk limits, defaults &amp; layout</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenBroker) onOpenBroker();
                        }}
                        className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <Sliders className="w-4 h-4 text-[#089981]" />
                        <div>
                          <div className="font-medium">Broker Gateway (DMA)</div>
                          <div className="text-[10px] text-[#787B86]">{activeBroker}</div>
                        </div>
                      </button>

                      {onOpenOptionsChain && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenOptionsChain();
                          }}
                          className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                        >
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <div>
                            <div className="font-medium">Options Chain &amp; Greeks</div>
                            <div className="text-[10px] text-[#787B86]">Open Interest &amp; PCR Matrix</div>
                          </div>
                        </button>
                      )}

                      {onOpenTradeJournal && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenTradeJournal();
                          }}
                          className="w-full text-left px-3 py-2 text-[#D1D4DC] hover:text-white hover:bg-[#2A2E39] flex items-center gap-2 transition"
                        >
                          <BookOpen className="w-4 h-4 text-purple-400" />
                          <div>
                            <div className="font-medium">Performance Journal</div>
                            <div className="text-[10px] text-[#787B86]">Review trades &amp; equity curve</div>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-[#2A2E39] py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuth("login");
                        }}
                        className="w-full text-left px-3 py-1.5 text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Switch Account</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuth("signup");
                        }}
                        className="w-full text-left px-3 py-1.5 text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create New Account</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-1.5 text-[#F23645] hover:bg-[#2A2E39] flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="px-3 py-1 rounded text-xs font-semibold text-[#D1D4DC] hover:text-white hover:bg-[#1E222D] border border-[#2A2E39] transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth("signup")}
                  className="px-3 py-1 rounded text-xs font-semibold bg-[#2962FF] hover:bg-[#1E53E5] text-white transition shadow-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
