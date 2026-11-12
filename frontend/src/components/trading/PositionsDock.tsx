"use client";

import React, { useState } from "react";
import {
  Layers,
  ListOrdered,
  CreditCard,
  XCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export interface ActivePosition {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  product: "MIS" | "CNC" | "MTF";
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface ExecutedOrder {
  id: string;
  time: string;
  symbol: string;
  side: "BUY" | "SELL";
  product: "MIS" | "CNC" | "MTF";
  quantity: number;
  price: number;
  status: "FILLED" | "CANCELLED" | "REJECTED";
}

export interface PositionsDockProps {
  positions: ActivePosition[];
  orders: ExecutedOrder[];
  availableMargin: number;
  utilizedMargin: number;
  totalAccountValue: number;
  currency?: string;
  onSquareOff: (positionId: string) => void;
  onSquareOffAll: () => void;
}

export const PositionsDock: React.FC<PositionsDockProps> = ({
  positions,
  orders,
  availableMargin,
  utilizedMargin,
  totalAccountValue,
  currency = "INR",
  onSquareOff,
  onSquareOffAll,
}) => {
  const [activeTab, setActiveTab] = useState<"positions" | "orders" | "funds">("positions");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const curr = currency === "INR" ? "₹" : "$";

  // Total Realized / Unrealized P&L
  const totalPnL = positions.reduce((acc, p) => acc + p.pnl, 0);
  const isPnLPositive = totalPnL >= 0;

  return (
    <div className="w-full bg-[#1E222D] border border-[#2A2E39] rounded-lg overflow-hidden select-none">
      {/* Dock Header & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#181C27] border-b border-[#2A2E39] gap-2">
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => {
              setActiveTab("positions");
              setIsCollapsed(false);
            }}
            className={`px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "positions" && !isCollapsed
                ? "bg-[#2A2E39] text-white"
                : "text-[#787B86] hover:text-[#D1D4DC]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Positions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#131722] text-[10px] text-[#787B86] font-tabular">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("orders");
              setIsCollapsed(false);
            }}
            className={`px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "orders" && !isCollapsed
                ? "bg-[#2A2E39] text-white"
                : "text-[#787B86] hover:text-[#D1D4DC]"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Order Book</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#131722] text-[10px] text-[#787B86] font-tabular">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("funds");
              setIsCollapsed(false);
            }}
            className={`px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "funds" && !isCollapsed
                ? "bg-[#2A2E39] text-white"
                : "text-[#787B86] hover:text-[#D1D4DC]"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Funds &amp; Margin</span>
          </button>
        </div>

        {/* Right: Net P&L Summary & Actions */}
        <div className="flex items-center space-x-3 text-xs font-tabular">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-[#787B86]">Total P&amp;L:</span>
            <span
              className={`font-bold ${
                isPnLPositive ? "text-[#089981]" : "text-[#F23645]"
              }`}
            >
              {isPnLPositive ? "+" : ""}
              {curr}
              {totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {positions.length > 0 && (
            <button
              onClick={onSquareOffAll}
              title="Close all open positions"
              className="px-2 py-0.5 rounded bg-[#F23645]/15 hover:bg-[#F23645]/25 text-[#F23645] border border-[#F23645]/30 text-[11px] font-semibold transition"
            >
              Close All
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-[#787B86] hover:text-white transition"
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      {!isCollapsed && (
        <div className="p-3 bg-[#1E222D] max-h-[260px] overflow-y-auto text-xs">
          {/* 1. POSITIONS TAB */}
          {activeTab === "positions" && (
            <div>
              {positions.length === 0 ? (
                <div className="py-8 text-center text-[#787B86] space-y-1">
                  <p className="text-white font-medium text-xs">No Open Positions</p>
                  <p className="text-[11px] text-[#787B86]">
                    Place an order using the order ticket on the right to open a position.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2A2E39] text-[11px] text-[#787B86] font-semibold">
                        <th className="pb-2">Instrument</th>
                        <th className="pb-2">Side</th>
                        <th className="pb-2">Product</th>
                        <th className="pb-2 text-right">Qty</th>
                        <th className="pb-2 text-right">Avg Price</th>
                        <th className="pb-2 text-right">LTP</th>
                        <th className="pb-2 text-right">P&amp;L</th>
                        <th className="pb-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2E39] font-tabular">
                      {positions.map((pos) => {
                        const isUp = pos.pnl >= 0;
                        return (
                          <tr key={pos.id} className="hover:bg-[#2A2E39]/40 transition-colors">
                            <td className="py-2 font-bold text-white">{pos.symbol}</td>
                            <td className="py-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  pos.side === "BUY"
                                    ? "bg-[#089981]/15 text-[#089981]"
                                    : "bg-[#F23645]/15 text-[#F23645]"
                                }`}
                              >
                                {pos.side}
                              </span>
                            </td>
                            <td className="py-2 text-[#787B86]">{pos.product}</td>
                            <td className="py-2 text-right font-semibold text-white">{pos.quantity}</td>
                            <td className="py-2 text-right text-[#D1D4DC]">
                              {curr}{pos.averagePrice.toFixed(2)}
                            </td>
                            <td className="py-2 text-right font-semibold text-white">
                              {curr}{pos.currentPrice.toFixed(2)}
                            </td>
                            <td className="py-2 text-right font-bold">
                              <span className={isUp ? "text-[#089981]" : "text-[#F23645]"}>
                                {isUp ? "+" : ""}
                                {curr}{pos.pnl.toFixed(2)} ({isUp ? "+" : ""}
                                {pos.pnlPercent.toFixed(2)}%)
                              </span>
                            </td>
                            <td className="py-2 text-center">
                              <button
                                onClick={() => onSquareOff(pos.id)}
                                className="px-2 py-0.5 rounded bg-[#2A2E39] hover:bg-[#F23645] text-[#D1D4DC] hover:text-white transition text-[10px] font-semibold"
                              >
                                Exit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. ORDER BOOK TAB */}
          {activeTab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <div className="py-8 text-center text-[#787B86] space-y-1">
                  <p className="text-white font-medium text-xs">No Orders Placed Today</p>
                  <p className="text-[11px] text-[#787B86]">
                    Executed and pending orders will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-tabular">
                    <thead>
                      <tr className="border-b border-[#2A2E39] text-[11px] text-[#787B86] font-semibold">
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Symbol</th>
                        <th className="pb-2">Side</th>
                        <th className="pb-2">Product</th>
                        <th className="pb-2 text-right">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2E39]">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#2A2E39]/40 transition-colors">
                          <td className="py-2 text-[#787B86] text-[11px]">{ord.time}</td>
                          <td className="py-2 font-semibold text-white">{ord.symbol}</td>
                          <td className="py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                ord.side === "BUY"
                                  ? "bg-[#089981]/15 text-[#089981]"
                                  : "bg-[#F23645]/15 text-[#F23645]"
                              }`}
                            >
                              {ord.side}
                            </span>
                          </td>
                          <td className="py-2 text-[#787B86]">{ord.product}</td>
                          <td className="py-2 text-right text-white font-medium">{ord.quantity}</td>
                          <td className="py-2 text-right text-[#D1D4DC]">
                            {curr}{ord.price.toFixed(2)}
                          </td>
                          <td className="py-2 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#089981]/15 text-[#089981]">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. FUNDS TAB */}
          {activeTab === "funds" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1 font-tabular">
              <div className="p-3 bg-[#131722] rounded border border-[#2A2E39]">
                <span className="text-[11px] text-[#787B86] block mb-1">
                  Total Equity
                </span>
                <span className="text-base font-bold text-white">
                  {curr}{totalAccountValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 bg-[#131722] rounded border border-[#2A2E39]">
                <span className="text-[11px] text-[#787B86] block mb-1">
                  Available Margin
                </span>
                <span className="text-base font-bold text-[#089981]">
                  {curr}{availableMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 bg-[#131722] rounded border border-[#2A2E39]">
                <span className="text-[11px] text-[#787B86] block mb-1">
                  Utilized Margin
                </span>
                <span className="text-base font-bold text-[#D1D4DC]">
                  {curr}{utilizedMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 bg-[#131722] rounded border border-[#2A2E39]">
                <span className="text-[11px] text-[#787B86] block mb-1">
                  Realized P&amp;L
                </span>
                <span
                  className={`text-base font-bold ${
                    isPnLPositive ? "text-[#089981]" : "text-[#F23645]"
                  }`}
                >
                  {isPnLPositive ? "+" : ""}
                  {curr}{totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
