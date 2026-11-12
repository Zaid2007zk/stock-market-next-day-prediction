"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Building2, User, Wallet, CheckCircle2, RefreshCw } from "lucide-react";

interface MarketFlowProps {
  language?: "en" | "hinglish";
}

export const MarketFlowVisualizer: React.FC<MarketFlowProps> = ({ language = "en" }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [model, setModel] = useState<"india" | "us">("india");

  const stepsIndia = [
    {
      title: "1. Investor Places Order",
      titleHinglish: "1. Investor Order Lagata Hai",
      desc: "You place a Buy order for 10 shares of RELIANCE on your broker app (e.g. Zerodha/Groww) linked to your bank account.",
      descHinglish: "Aap apne broker app par Reliance ke 10 shares ka Buy order lagate hain jo bank account se linked hai.",
      entity: "Investor / Retail Trader",
      highlight: "Bank Account Funds Verified",
    },
    {
      title: "2. Broker Routes to Exchange",
      titleHinglish: "2. Broker Order Exchange Bhejta Hai",
      desc: "Your SEBI-registered broker checks margin and routes your encrypted order packet directly to the National Stock Exchange (NSE).",
      descHinglish: "Broker margin verify karke aapka order National Stock Exchange (NSE) ke matching engine ko bhejta hai.",
      entity: "SEBI Registered Broker",
      highlight: "Risk Check & Order Gateway",
    },
    {
      title: "3. Exchange Matches Buyer & Seller",
      titleHinglish: "3. Exchange Par Order Match Hota Hai",
      desc: "The NSE electronic matching engine pairs your Buy order with an existing seller's Ask order in microseconds.",
      descHinglish: "NSE ka electronic engine aapke buy order ko kisi doosre seller ke ask order se milliseconds me match karta hai.",
      entity: "NSE / BSE Exchange",
      highlight: "Continuous Order Book Matching",
    },
    {
      title: "4. Clearing & Depository Settlement (T+1)",
      titleHinglish: "4. Clearing Corp & Demat Settlement",
      desc: "NSE Clearing Corporation (NSCCL) guarantees settlement. Funds transfer to the seller, and shares are credited to your Demat account with CDSL/NSDL on T+1 day.",
      descHinglish: "Clearing corporation guarantee deta hai. Seller ko paisa milta hai aur shares aapki CDSL/NSDL Demat tijori me safe credit ho jaate hain.",
      entity: "NSCCL & CDSL/NSDL Depository",
      highlight: "100% Guaranteed Ownership in Demat",
    },
  ];

  const stepsUS = [
    {
      title: "1. US Investor Order",
      titleHinglish: "1. US Investor Order",
      desc: "You submit an order for Apple (AAPL) via a FINRA/SIPC broker.",
      descHinglish: "FINRA-regulated broker app ke through AAPL ka order lagate hain.",
      entity: "Retail Investor",
      highlight: "Instant Buying Power Verification",
    },
    {
      title: "2. Broker & Market Maker Routing",
      titleHinglish: "2. Broker Order Route Karta Hai",
      desc: "Order is routed to internalizers/wholesalers or directly to NASDAQ/NYSE.",
      descHinglish: "Order NASDAQ ya electronic market makers ko execute hone ke liye jata hai.",
      entity: "US Broker-Dealer",
      highlight: "Best Execution Protocol (Reg NMS)",
    },
    {
      title: "3. NASDAQ / NYSE Execution",
      titleHinglish: "3. NASDAQ / NYSE Execution",
      desc: "Order executed at national best bid and offer (NBBO).",
      descHinglish: "National Best Bid & Offer (NBBO) rate par order turant fill hota hai.",
      entity: "Stock Exchange",
      highlight: "Automated Microsecond Auction",
    },
    {
      title: "4. DTC & DTCC Custody (T+1)",
      titleHinglish: "4. DTCC Custody Settlement",
      desc: "DTCC facilitates clearing; beneficial ownership registered electronically in street name.",
      descHinglish: "Depository Trust Company (DTC) electronic book-entry settlement karta hai.",
      entity: "DTCC Depository",
      highlight: "T+1 Federal Rolling Settlement",
    },
  ];

  const steps = model === "india" ? stepsIndia : stepsUS;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-base text-sky-400 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            {language === "hinglish" ? "Stock Market Ka Ecosystem & Order Flow" : "Stock Market Ecosystem & Order Flow"}
          </h4>
          <p className="text-xs text-slate-400">
            {language === "hinglish"
              ? "Dekhein kaise aapka order bank se shuru hokar Demat account tak safely pahunchta hai"
              : "Interactive walkthrough of how a trade executes and settles in your Demat account"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModel("india")}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              model === "india"
                ? "bg-sky-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Indian Market (NSE/CDSL)
          </button>
          <button
            onClick={() => setModel("us")}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              model === "us"
                ? "bg-sky-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            US Market (NASDAQ/DTC)
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {steps.map((st, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`p-3 rounded-lg text-left transition border ${
              activeStep === idx
                ? "bg-sky-950/60 border-sky-500 text-sky-300 shadow-md ring-1 ring-sky-500"
                : activeStep > idx
                ? "bg-slate-800/80 border-emerald-600/50 text-slate-300"
                : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step {idx + 1}
              </span>
              {activeStep > idx ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-600" />
              )}
            </div>
            <div className="text-xs font-semibold truncate">
              {language === "hinglish" ? st.titleHinglish : st.title}
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Flow Visual Diagram */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-5 mb-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Node 1 */}
          <div
            className={`flex-1 w-full p-4 rounded-lg border text-center transition ${
              activeStep === 0
                ? "bg-sky-900/40 border-sky-400 shadow-lg ring-1 ring-sky-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <User className="w-8 h-8 mx-auto mb-2 text-sky-400" />
            <div className="text-sm font-bold text-slate-200">You (Investor)</div>
            <div className="text-xs text-slate-400 mt-1">Bank Account Funds</div>
          </div>

          <ArrowRight className="hidden md:block w-6 h-6 text-slate-600" />

          {/* Node 2 */}
          <div
            className={`flex-1 w-full p-4 rounded-lg border text-center transition ${
              activeStep === 1
                ? "bg-sky-900/40 border-sky-400 shadow-lg ring-1 ring-sky-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <Wallet className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <div className="text-sm font-bold text-slate-200">
              {model === "india" ? "Broker (Zerodha/Groww)" : "Broker (Robinhood/IBKR)"}
            </div>
            <div className="text-xs text-slate-400 mt-1">Trading Account & Margin</div>
          </div>

          <ArrowRight className="hidden md:block w-6 h-6 text-slate-600" />

          {/* Node 3 */}
          <div
            className={`flex-1 w-full p-4 rounded-lg border text-center transition ${
              activeStep === 2
                ? "bg-sky-900/40 border-sky-400 shadow-lg ring-1 ring-sky-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <Building2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <div className="text-sm font-bold text-slate-200">
              {model === "india" ? "Stock Exchange (NSE/BSE)" : "Stock Exchange (NASDAQ/NYSE)"}
            </div>
            <div className="text-xs text-slate-400 mt-1">Electronic Order Matching</div>
          </div>

          <ArrowRight className="hidden md:block w-6 h-6 text-slate-600" />

          {/* Node 4 */}
          <div
            className={`flex-1 w-full p-4 rounded-lg border text-center transition ${
              activeStep === 3
                ? "bg-sky-900/40 border-sky-400 shadow-lg ring-1 ring-sky-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-sm font-bold text-slate-200">
              {model === "india" ? "Depository (CDSL/NSDL)" : "Depository (DTCC / DTC)"}
            </div>
            <div className="text-xs text-slate-400 mt-1">Demat Vault (T+1 Custody)</div>
          </div>
        </div>

        {/* Active Step Details Banner */}
        <div className="mt-5 p-4 bg-slate-900/90 rounded-lg border border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
              {steps[activeStep].entity}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {steps[activeStep].highlight}
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed mt-1">
            {language === "hinglish" ? steps[activeStep].descHinglish : steps[activeStep].desc}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center text-xs">
        <button
          onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
          disabled={activeStep === 0}
          className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
        >
          Previous Step
        </button>
        <span className="text-slate-400 font-medium">
          Step {activeStep + 1} of {steps.length}
        </span>
        <button
          onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
          className="px-3 py-1.5 rounded bg-sky-600 text-white font-semibold hover:bg-sky-500 transition flex items-center gap-1"
        >
          {activeStep === steps.length - 1 ? "Replay Flow" : "Next Step"}
          {activeStep === steps.length - 1 ? <RefreshCw className="w-3.5 h-3.5 ml-1" /> : <ArrowRight className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>
    </div>
  );
};
