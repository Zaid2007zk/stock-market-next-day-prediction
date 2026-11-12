"""
Chronological Walk-Forward Backtesting Engine
Executes quantitative trading strategies strictly chronologically without lookahead bias.
Models real-world transaction frictions: STT, brokerage, turnover fees, GST, and slippage.
"""

import math
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field, model_validator

from app.models.market import OHLCVBar


def _safe_float(val: float, default: float = 0.0) -> float:
    """Sanitizes float values, converting None, NaN, and ±Inf to a documented default."""
    if val is None or not isinstance(val, (int, float, np.number)):
        return default
    if np.isnan(val) or np.isinf(val):
        return default
    return float(val)


class BacktestRequest(BaseModel):
    symbol: str
    strategy_type: str = Field("sma_crossover", description="Strategy: sma_crossover, rsi_momentum, or macd_cross")
    fast_period: int = Field(10, ge=2, le=100)
    slow_period: int = Field(30, ge=5, le=250)
    initial_capital: float = Field(100000.0, gt=0, description="Starting portfolio cash in currency units")
    stt_rate: float = Field(0.001, ge=0, description="Securities Transaction Tax (0.1% on delivery)")
    brokerage_rate: float = Field(0.0003, ge=0, description="Brokerage rate (0.03% or ₹20 flat cap)")
    brokerage_flat_cap: float = Field(20.0, ge=0)
    turnover_rate: float = Field(0.0000325, ge=0, description="Exchange turnover charge (~0.00325%)")
    gst_rate: float = Field(0.18, ge=0, description="GST (18% on brokerage and turnover fees)")
    slippage_rate: float = Field(0.0005, ge=0, description="Execution slippage (5 basis points = 0.05%)")
    risk_free_rate: float = Field(0.0675, ge=0, description="Annual risk-free hurdle rate (6.75% Indian G-Sec)")
    bars: Optional[List[OHLCVBar]] = None

    @model_validator(mode="after")
    def validate_periods(self):
        if self.fast_period >= self.slow_period:
            raise ValueError(f"fast_period ({self.fast_period}) must be strictly less than slow_period ({self.slow_period}).")
        return self


class TradeLogEntry(BaseModel):
    trade_id: int
    symbol: str
    entry_date: str
    entry_price: float
    exit_date: str
    exit_price: float
    quantity: int
    gross_pnl: float
    net_pnl: float
    total_frictions: float
    return_percent: float
    holding_period_days: int
    is_winner: bool


class BacktestResult(BaseModel):
    symbol: str
    strategy: str
    start_date: str
    end_date: str
    trading_days: int
    initial_capital: float
    ending_capital: float
    gross_profit: float
    total_frictions: float
    net_profit: float
    net_return_percent: float
    cagr_percent: float
    benchmark_return_percent: float
    benchmark_alpha: float
    annualized_volatility_percent: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown_percent: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_percent: float
    profit_factor: float
    trade_log: List[TradeLogEntry]
    lookahead_bias_free: bool = True
    frictions_breakdown: Dict[str, float]


def calculate_order_friction(
    price: float,
    quantity: int,
    is_exit: bool,
    stt_rate: float,
    brokerage_rate: float,
    brokerage_cap: float,
    turnover_rate: float,
    gst_rate: float,
    slippage_rate: float,
) -> Dict[str, float]:
    """
    Computes statutory Indian market transaction frictions for a single trade leg.
    """
    trade_val = price * quantity
    slippage = trade_val * slippage_rate

    # Brokerage: min(rate * val, cap)
    brokerage = min(trade_val * brokerage_rate, brokerage_cap)
    turnover = trade_val * turnover_rate
    gst = (brokerage + turnover) * gst_rate

    # STT applies primarily on delivery trades (0.1% on purchase and sale, modeled on exit leg)
    stt = (trade_val * stt_rate) if is_exit else 0.0

    total_friction = slippage + brokerage + turnover + gst + stt
    return {
        "slippage": slippage,
        "brokerage": brokerage,
        "turnover": turnover,
        "gst": gst,
        "stt": stt,
        "total": total_friction,
    }


def run_walk_forward_backtest(
    bars: List[OHLCVBar],
    req: BacktestRequest,
) -> BacktestResult:
    """
    Runs a strictly chronological walk-forward backtest across historical bars.
    Guarantees no lookahead bias: signals generated at bar T are executed at bar T+1.
    """
    if bars is None or len(bars) == 0:
        raise ValueError("Historical bars list cannot be empty.")

    min_required = max(req.slow_period + 5, 20)
    if len(bars) < min_required:
        raise ValueError(
            f"Insufficient historical bars ({len(bars)}) for strategy warm-up period ({req.slow_period}). Minimum required is {min_required} bars."
        )

    df = pd.DataFrame([b.model_dump() for b in bars])
    df["close"] = df["close"].astype(float)
    df["open"] = df["open"].astype(float)
    n = len(df)

    # 1. Precompute indicators chronologically
    if req.strategy_type == "sma_crossover":
        df["fast_ma"] = df["close"].rolling(window=req.fast_period, min_periods=req.fast_period).mean()
        df["slow_ma"] = df["close"].rolling(window=req.slow_period, min_periods=req.slow_period).mean()
        # Signal: 1 when fast crosses above slow, -1 when fast crosses below slow
        df["signal"] = 0
        df.loc[df["fast_ma"] > df["slow_ma"], "signal"] = 1
        df.loc[df["fast_ma"] < df["slow_ma"], "signal"] = -1
    elif req.strategy_type == "rsi_momentum":
        delta = df["close"].diff()
        gain = delta.clip(lower=0.0)
        loss = -delta.clip(upper=0.0)
        avg_gain = gain.ewm(com=13, min_periods=14).mean()
        avg_loss = loss.ewm(com=13, min_periods=14).mean()
        rs = avg_gain / avg_loss.replace(0.0, np.nan)
        df["rsi"] = 100.0 - (100.0 / (1.0 + rs)).fillna(50.0)
        df["signal"] = 0
        df.loc[df["rsi"] < 35.0, "signal"] = 1   # Oversold entry
        df.loc[df["rsi"] > 70.0, "signal"] = -1  # Overbought exit
    else:
        # Default MACD
        fast_ema = df["close"].ewm(span=12, adjust=False).mean()
        slow_ema = df["close"].ewm(span=26, adjust=False).mean()
        macd = fast_ema - slow_ema
        sig = macd.ewm(span=9, adjust=False).mean()
        df["signal"] = np.where(macd > sig, 1, -1)

    # 2. Chronological Walk-Forward Simulation
    capital = req.initial_capital
    position_qty = 0
    entry_price = 0.0
    entry_date = ""
    entry_idx = 0
    trade_id = 1
    trades: List[TradeLogEntry] = []
    daily_equity: List[float] = [capital]

    friction_totals = {
        "slippage": 0.0,
        "brokerage": 0.0,
        "turnover": 0.0,
        "gst": 0.0,
        "stt": 0.0,
        "total": 0.0,
    }

    # Start loop after slow_period warm-up
    start_idx = req.slow_period
    for i in range(start_idx, n):
        # Read signal from prior bar (T-1) to avoid lookahead bias
        prior_signal = df.loc[i - 1, "signal"]
        cur_open = df.loc[i, "open"]
        cur_date = df.loc[i, "timestamp"]

        # Long Entry Trigger
        if prior_signal == 1 and position_qty == 0:
            # Sizing: deploy 95% of available cash
            deployable = capital * 0.95
            if deployable > cur_open:
                position_qty = int(deployable // cur_open)
                entry_price = cur_open
                entry_date = cur_date
                entry_idx = i

                # Apply Entry Frictions
                frictions = calculate_order_friction(
                    price=entry_price,
                    quantity=position_qty,
                    is_exit=False,
                    stt_rate=req.stt_rate,
                    brokerage_rate=req.brokerage_rate,
                    brokerage_cap=req.brokerage_flat_cap,
                    turnover_rate=req.turnover_rate,
                    gst_rate=req.gst_rate,
                    slippage_rate=req.slippage_rate,
                )
                capital -= (entry_price * position_qty) + frictions["total"]
                for k in friction_totals:
                    friction_totals[k] += frictions[k]

        # Long Exit Trigger
        elif (prior_signal == -1 or i == n - 1) and position_qty > 0:
            exit_price = cur_open
            exit_date = cur_date

            # Apply Exit Frictions
            frictions = calculate_order_friction(
                price=exit_price,
                quantity=position_qty,
                is_exit=True,
                stt_rate=req.stt_rate,
                brokerage_rate=req.brokerage_rate,
                brokerage_cap=req.brokerage_flat_cap,
                turnover_rate=req.turnover_rate,
                gst_rate=req.gst_rate,
                slippage_rate=req.slippage_rate,
            )
            gross_revenue = exit_price * position_qty
            capital += gross_revenue - frictions["total"]

            for k in friction_totals:
                friction_totals[k] += frictions[k]

            gross_pnl = (exit_price - entry_price) * position_qty
            total_trade_frictions = (
                (entry_price * position_qty * req.slippage_rate)
                + (exit_price * position_qty * req.slippage_rate)
                + (frictions["total"] - (exit_price * position_qty * req.slippage_rate))
            )
            net_pnl = gross_pnl - total_trade_frictions
            ret_pct = (net_pnl / (entry_price * position_qty)) * 100.0 if entry_price > 0 else 0.0

            trades.append(
                TradeLogEntry(
                    trade_id=trade_id,
                    symbol=req.symbol,
                    entry_date=entry_date,
                    entry_price=round(entry_price, 2),
                    exit_date=exit_date,
                    exit_price=round(exit_price, 2),
                    quantity=position_qty,
                    gross_pnl=round(gross_pnl, 2),
                    net_pnl=round(net_pnl, 2),
                    total_frictions=round(total_trade_frictions, 2),
                    return_percent=round(ret_pct, 2),
                    holding_period_days=max(1, i - entry_idx),
                    is_winner=net_pnl > 0,
                )
            )
            trade_id += 1
            position_qty = 0

        # Mark-to-market daily equity curve
        cur_close = df.loc[i, "close"]
        equity = capital + (position_qty * cur_close)
        daily_equity.append(equity)

    ending_capital = daily_equity[-1]
    net_profit = ending_capital - req.initial_capital
    net_return_pct = (net_profit / req.initial_capital) * 100.0

    # 3. Benchmark (Buy & Hold) Performance
    start_close = df.loc[start_idx, "close"]
    end_close = df.loc[n - 1, "close"]
    if start_close <= 0.0:
        benchmark_return_pct = 0.0
    else:
        benchmark_return_pct = ((end_close - start_close) / start_close) * 100.0

    # 4. CAGR & Alpha
    total_days = max(1, n - start_idx)
    years = total_days / 252.0
    if ending_capital <= 0.0:
        cagr = -100.0
    elif years >= 0.1:
        cagr = ((ending_capital / req.initial_capital) ** (1.0 / years) - 1.0) * 100.0
    else:
        cagr = net_return_pct
    cagr = _safe_float(cagr, -100.0 if ending_capital <= 0 else 0.0)

    if start_close <= 0.0:
        bm_cagr = 0.0
    elif end_close <= 0.0:
        bm_cagr = -100.0
    elif years >= 0.1:
        bm_cagr = ((end_close / start_close) ** (1.0 / years) - 1.0) * 100.0
    else:
        bm_cagr = benchmark_return_pct
    bm_cagr = _safe_float(bm_cagr, 0.0)
    alpha = _safe_float(cagr - bm_cagr, 0.0)

    # 5. Volatility, Sharpe & Sortino Ratios
    equity_arr = np.array(daily_equity, dtype=float)
    if len(equity_arr) > 1:
        daily_returns = pd.Series(equity_arr).pct_change().dropna()
    else:
        daily_returns = pd.Series([], dtype=float)

    ann_vol = float(daily_returns.std() * np.sqrt(252)) if len(daily_returns) > 1 else 0.0
    ann_vol = _safe_float(ann_vol, 0.0)

    daily_rf = (1.0 + req.risk_free_rate) ** (1.0 / 252.0) - 1.0
    if len(daily_returns) > 1 and daily_returns.std() > 1e-6:
        excess_returns = daily_returns - daily_rf
        sharpe = float(np.sqrt(252) * excess_returns.mean() / daily_returns.std())
        sharpe = _safe_float(sharpe, 0.0)

        # Sortino: downside deviation (only returns below rf)
        downside = daily_returns[daily_returns < daily_rf] - daily_rf
        if len(downside) > 0:
            downside_dev = float(np.sqrt(np.mean(downside ** 2)))
            if downside_dev > 1e-6:
                sortino = float(np.sqrt(252) * excess_returns.mean() / downside_dev)
            else:
                sortino = 99.0 if excess_returns.mean() > 0 else 0.0
        else:
            # Documented edge case: no downside deviation (all returns >= rf)
            sortino = 99.0 if excess_returns.mean() > 0 else 0.0
        sortino = _safe_float(sortino, 0.0)
    else:
        # Documented edge case: zero volatility or flat equity curve
        sharpe = 0.0
        sortino = 0.0

    # 6. Maximum Drawdown
    running_max = np.maximum.accumulate(equity_arr)
    drawdowns = np.where(running_max > 0, (running_max - equity_arr) / running_max, 1.0)
    max_dd = float(np.max(drawdowns) * 100.0) if len(drawdowns) > 0 else 0.0
    max_dd = min(100.0, max(0.0, _safe_float(max_dd, 0.0)))

    # 7. Win Rate & Profit Factor
    total_trades = len(trades)
    winning_trades = sum(1 for t in trades if t.is_winner)
    losing_trades = total_trades - winning_trades
    win_rate = (winning_trades / total_trades * 100.0) if total_trades > 0 else 0.0
    win_rate = min(100.0, max(0.0, _safe_float(win_rate, 0.0)))

    gross_wins = sum(t.net_pnl for t in trades if t.net_pnl > 0)
    gross_losses = abs(sum(t.net_pnl for t in trades if t.net_pnl < 0))
    if total_trades == 0:
        # Documented edge case: zero trades taken -> profit factor is 0.0
        profit_factor = 0.0
    elif gross_losses > 0:
        profit_factor = gross_wins / gross_losses
    elif gross_wins > 0:
        # Documented edge case: 100% win rate (no losses) -> capped at finite ceiling of 99.0
        profit_factor = 99.0
    else:
        profit_factor = 0.0
    profit_factor = _safe_float(profit_factor, 0.0)

    gross_profit = net_profit + friction_totals["total"]

    return BacktestResult(
        symbol=req.symbol,
        strategy=f"{req.strategy_type} ({req.fast_period}/{req.slow_period})",
        start_date=str(df.loc[start_idx, "timestamp"]),
        end_date=str(df.loc[n - 1, "timestamp"]),
        trading_days=total_days,
        initial_capital=round(_safe_float(req.initial_capital), 2),
        ending_capital=round(_safe_float(ending_capital), 2),
        gross_profit=round(_safe_float(gross_profit), 2),
        total_frictions=round(_safe_float(friction_totals["total"]), 2),
        net_profit=round(_safe_float(net_profit), 2),
        net_return_percent=round(_safe_float(net_return_pct), 2),
        cagr_percent=round(_safe_float(cagr), 2),
        benchmark_return_percent=round(_safe_float(benchmark_return_pct), 2),
        benchmark_alpha=round(_safe_float(alpha), 2),
        annualized_volatility_percent=round(_safe_float(ann_vol * 100.0), 2),
        sharpe_ratio=round(_safe_float(sharpe), 2),
        sortino_ratio=round(_safe_float(sortino), 2),
        max_drawdown_percent=round(_safe_float(max_dd), 2),
        total_trades=total_trades,
        winning_trades=winning_trades,
        losing_trades=losing_trades,
        win_rate_percent=round(_safe_float(win_rate), 2),
        profit_factor=round(_safe_float(profit_factor), 2),
        trade_log=trades,
        lookahead_bias_free=True,
        frictions_breakdown={k: round(_safe_float(v), 2) for k, v in friction_totals.items()},
    )
