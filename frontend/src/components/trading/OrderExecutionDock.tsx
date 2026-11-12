"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export interface OrderExecutionProps {
  symbol: string;
  currentPrice: number;
  currency?: string;
  availableMargin: number;
  onExecuteOrder: (order: {
    symbol: string;
    side: "BUY" | "SELL";
    product: "MIS" | "CNC" | "MTF";
    orderType: "MARKET" | "LIMIT" | "SL";
    quantity: number;
    price: number;
    marginRequired: number;
  }) => void;
}

export const OrderExecutionDock: React.FC<OrderExecutionProps> = ({
  symbol,
  currentPrice,
  currency = "INR",
  availableMargin,
  onExecuteOrder,
}) => {
  const [activeSide, setActiveSide] = useState<"BUY" | "SELL">("BUY");
  const [productType, setProductType] = useState<"MIS" | "CNC" | "MTF">("MIS");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "SL">("MARKET");
  const [quantity, setQuantity] = useState<number>(25);
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice);
  const [triggerPrice, setTriggerPrice] = useState<number>(currentPrice * 0.98);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const curr = currency === "INR" ? "₹" : "$";
  const execPrice = orderType === "MARKET" ? currentPrice : limitPrice;

  // Margin calculation (Intraday MIS 5x leverage, CNC 1x, MTF 4x)
  const leverage = productType === "MIS" ? 5 : productType === "MTF" ? 4 : 1;
  const orderValue = quantity * execPrice;
  const marginRequired = Math.round((orderValue / leverage) * 100) / 100;

  // Statutory charges: Brokerage ₹0 for delivery, ₹20/order max for intraday + STT + GST
  const estimatedCharges = useMemo(() => {
    if (currency !== "INR") return 1.5;
    const brokerage = productType === "CNC" ? 0 : Math.min(20, orderValue * 0.0003);
    const stt = productType === "CNC" ? orderValue * 0.001 : (activeSide === "SELL" ? orderValue * 0.00025 : 0);
    const exchTxn = orderValue * 0.0000345;
    const gst = (brokerage + exchTxn) * 0.18;
    const sebi = orderValue * 0.000001;
    const stamp = activeSide === "BUY" ? orderValue * 0.00015 : 0;
    return Math.max(1, Math.round((brokerage + stt + exchTxn + gst + sebi + stamp) * 100) / 100);
  }, [orderValue, productType, activeSide, currency]);

  const hasSufficientMargin = availableMargin >= marginRequired;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || execPrice <= 0 || !hasSufficientMargin) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onExecuteOrder({
        symbol,
        side: activeSide,
        product: productType,
        orderType,
        quantity,
        price: execPrice,
        marginRequired,
      });

      setIsSubmitting(false);
      setOrderSuccess(
        `${activeSide} ${quantity} ${symbol} @ ${curr}${execPrice.toFixed(2)} Filled`
      );

      setTimeout(() => setOrderSuccess(null), 3000);
    }, 200);
  };

  return (
    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-lg p-4 space-y-3.5 select-none">
      {/* Header: Order Entry Title & Current Symbol */}
      <div className="flex items-center justify-between border-b border-[#2A2E39] pb-2.5">
        <div>
          <span className="text-xs font-bold text-white block">Order Ticket</span>
          <span className="text-[11px] text-[#787B86]">{symbol}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-white font-tabular block">
            {curr}{currentPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#089981] font-semibold">Live Quote</span>
        </div>
      </div>

      {/* Side Selector Tabs (Buy vs Sell) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#131722] rounded-md border border-[#2A2E39]">
        <button
          type="button"
          onClick={() => setActiveSide("BUY")}
          className={`py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
            activeSide === "BUY"
              ? "bg-[#089981] text-white"
              : "text-[#787B86] hover:text-[#D1D4DC]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>BUY</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSide("SELL")}
          className={`py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
            activeSide === "SELL"
              ? "bg-[#F23645] text-white"
              : "text-[#787B86] hover:text-[#D1D4DC]"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>SELL</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* Product Type (MIS / CNC / MTF) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#787B86]">Product</label>
          <div className="grid grid-cols-3 gap-1 bg-[#131722] p-1 rounded-md border border-[#2A2E39]">
            {[
              { id: "MIS", label: "Intraday (MIS)" },
              { id: "CNC", label: "Delivery (CNC)" },
              { id: "MTF", label: "Margin (MTF)" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProductType(p.id as any)}
                className={`py-1.5 px-1 rounded text-[11px] font-semibold text-center transition-colors ${
                  productType === p.id
                    ? "bg-[#2A2E39] text-white"
                    : "text-[#787B86] hover:text-[#D1D4DC]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order Type (Market / Limit / SL) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#787B86]">Order Type</label>
          <div className="grid grid-cols-3 gap-1 bg-[#131722] p-1 rounded-md border border-[#2A2E39]">
            {["MARKET", "LIMIT", "SL"].map((ot) => (
              <button
                key={ot}
                type="button"
                onClick={() => setOrderType(ot as any)}
                className={`py-1.5 rounded text-[11px] font-semibold text-center transition-colors ${
                  orderType === ot
                    ? "bg-[#2A2E39] text-white"
                    : "text-[#787B86] hover:text-[#D1D4DC]"
                }`}
              >
                {ot}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold text-[#787B86]">Quantity</label>
            <div className="flex items-center space-x-1">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuantity(amt)}
                  className="px-1.5 py-0.5 rounded bg-[#131722] hover:bg-[#2A2E39] text-[10px] font-tabular font-medium text-[#787B86] hover:text-[#D1D4DC] border border-[#2A2E39]"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            min="1"
            max="100000"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-1.5 bg-[#131722] border border-[#2A2E39] rounded text-white font-tabular font-semibold focus:outline-none focus:border-[#2962FF]"
          />
        </div>

        {/* Limit Price */}
        {orderType !== "MARKET" && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#787B86]">Limit Price ({curr})</label>
            <input
              type="number"
              step="0.05"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentPrice)}
              className="w-full px-3 py-1.5 bg-[#131722] border border-[#2A2E39] rounded text-white font-tabular font-semibold focus:outline-none focus:border-[#2962FF]"
            />
          </div>
        )}

        {/* Stop Loss Trigger */}
        {orderType === "SL" && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#F23645]">Trigger Price ({curr})</label>
            <input
              type="number"
              step="0.05"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || currentPrice)}
              className="w-full px-3 py-1.5 bg-[#131722] border border-[#2A2E39] rounded text-white font-tabular font-semibold focus:outline-none focus:border-[#F23645]"
            />
          </div>
        )}

        {/* Margin & Fee Breakdown */}
        <div className="p-2.5 bg-[#131722] rounded border border-[#2A2E39] space-y-1 font-tabular text-[11px]">
          <div className="flex justify-between text-[#787B86]">
            <span>Required Margin ({leverage}x):</span>
            <span className="text-[#D1D4DC] font-semibold">{curr}{marginRequired.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[#787B86]">
            <span>Estimated Charges:</span>
            <span className="text-[#D1D4DC]">{curr}{estimatedCharges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-[#2A2E39] pt-1 mt-1 text-[#787B86]">
            <span>Available Margin:</span>
            <span className={`font-semibold ${hasSufficientMargin ? "text-[#089981]" : "text-[#F23645]"}`}>
              {curr}{availableMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Success Feedback */}
        {orderSuccess && (
          <div className="p-2 rounded bg-[#089981]/15 border border-[#089981]/30 text-[#089981] text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{orderSuccess}</span>
          </div>
        )}

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={isSubmitting || !hasSufficientMargin || quantity <= 0}
          className={`w-full py-2.5 rounded font-bold text-sm transition-colors ${
            !hasSufficientMargin
              ? "bg-[#2A2E39] text-[#787B86] cursor-not-allowed"
              : activeSide === "BUY"
              ? "bg-[#089981] hover:bg-[#067A67] text-white"
              : "bg-[#F23645] hover:bg-[#C9202F] text-white"
          }`}
        >
          {isSubmitting ? (
            <span>Processing...</span>
          ) : !hasSufficientMargin ? (
            <span>Insufficient Margin</span>
          ) : (
            <span>
              {activeSide} {quantity} {symbol}
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
