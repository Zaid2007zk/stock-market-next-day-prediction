"use client";

import React from "react";
import { VisualType } from "@/data/academyCurriculum";
import { MarketFlowVisualizer } from "./visuals/MarketFlowVisualizer";
import { OrderBookVisualizer } from "./visuals/OrderBookVisualizer";
import { CandlestickAnatomist } from "./visuals/CandlestickAnatomist";
import { IndicatorExplorer } from "./visuals/IndicatorExplorer";
import { FundamentalWaterfall } from "./visuals/FundamentalWaterfall";
import { RiskCalculatorVisualizer } from "./visuals/RiskCalculatorVisualizer";
import { BacktestVisualizer } from "./visuals/BacktestVisualizer";
import { PortfolioHealthVisualizer } from "./visuals/PortfolioHealthVisualizer";

interface VisualTeachingCanvasProps {
  visualType: VisualType;
  language: "en" | "hinglish";
}

export const VisualTeachingCanvas: React.FC<VisualTeachingCanvasProps> = ({
  visualType,
  language,
}) => {
  switch (visualType) {
    case "market_flow":
      return <MarketFlowVisualizer language={language} />;
    case "order_book_depth":
      return <OrderBookVisualizer language={language} />;
    case "candlestick_anatomist":
      return <CandlestickAnatomist language={language} />;
    case "indicator_explorer":
      return <IndicatorExplorer language={language} />;
    case "fundamental_waterfall":
      return <FundamentalWaterfall language={language} />;
    case "risk_calculator":
      return <RiskCalculatorVisualizer language={language} />;
    case "backtest_visualizer":
      return <BacktestVisualizer language={language} />;
    case "portfolio_health_scorecard":
      return <PortfolioHealthVisualizer language={language} />;
    default:
      return <MarketFlowVisualizer language={language} />;
  }
};
