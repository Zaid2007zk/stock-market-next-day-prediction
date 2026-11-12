"""
AI Trading Academy & Pedagogical Engine
Provides curriculum structure, interactive educational guidance, bilingual AI tutoring (English & Hinglish),
and deterministic calculation of real-world Indian statutory market transaction frictions for paper trading.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.rate_limiter import rate_limit_dependency
from app.providers.ai.privacy_filter import (
    assert_privacy_compliance,
    PrivacyViolationError,
)

router = APIRouter(prefix="/academy", tags=["AI Trading Academy"])


# ==============================================================================
# Models: Curriculum & Lesson Metadata
# ==============================================================================

class LessonSummary(BaseModel):
    id: str
    title: str
    title_hinglish: str
    summary: str
    summary_hinglish: str
    visual_type: str


class LevelOverview(BaseModel):
    level: int
    id: str
    title: str
    title_hinglish: str
    tagline: str
    description: str
    lessons: List[LessonSummary]


class CurriculumOverviewResponse(BaseModel):
    total_levels: int
    total_lessons: int
    levels: List[LevelOverview]
    frictional_rates: Dict[str, Any]
    disclaimer: str


# ==============================================================================
# Models: AI Tutor Chat
# ==============================================================================

class TutorChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000, description="Learner's question")
    level: Optional[int] = Field(1, ge=1, le=8, description="Current academy level (1-8)")
    lesson_id: Optional[str] = Field(None, description="Optional active lesson ID")
    language: Optional[str] = Field("en", description="'en' for English, 'hinglish' for simple Hinglish")
    symbol_context: Optional[str] = Field(None, description="Optional stock symbol context")


class TutorChatResponse(BaseModel):
    answer: str
    language: str
    level: int
    follow_up_suggestions: List[str]
    grounded_concepts: List[str]
    disclaimer: str


# ==============================================================================
# Models: Paper Trading Frictions Calculation
# ==============================================================================

class CalculateFrictionsRequest(BaseModel):
    symbol: str = Field(..., description="Ticker symbol (e.g. RELIANCE.NS, TCS.NS, AAPL)")
    action: str = Field(..., description="'BUY' or 'SELL'")
    price: float = Field(..., gt=0, description="Order execution price")
    quantity: int = Field(..., gt=0, description="Number of shares")
    order_type: str = Field("MARKET", description="'MARKET' or 'LIMIT'")
    delivery_type: str = Field("DELIVERY", description="'DELIVERY' (equity delivery) or 'INTRADAY'")


class CalculateFrictionsResponse(BaseModel):
    symbol: str
    action: str
    quantity: int
    price: float
    gross_trade_value: float
    stt: float
    brokerage: float
    exchange_turnover: float
    gst: float
    stamp_duty: float
    estimated_slippage: float
    total_frictions: float
    net_trade_value: float
    currency: str
    breakdown_notes: List[str]


# ==============================================================================
# Static Curriculum Registry
# ==============================================================================

CURRICULUM_DATA: List[LevelOverview] = [
    LevelOverview(
        level=1,
        id="level-1-absolute-beginner",
        title="Level 1: Absolute Beginner",
        title_hinglish="Level 1: Share Market Ki Shuruat",
        tagline="From Zero to Understanding the Financial Ecosystem",
        description="Understand what shares and stock exchanges actually are, how Demat & Trading accounts operate, and how orders flow.",
        lessons=[
            LessonSummary(
                id="lvl1-lesson1",
                title="What is a Share & Why Do Companies Issue Them?",
                title_hinglish="Share Kya Hota Hai Aur Companies Kyu Bechte Hain?",
                summary="Understanding fractional business ownership, IPOs, and equity financing.",
                summary_hinglish="Company me hissedari, IPO aur capital raising ka basic logic.",
                visual_type="market_flow",
            ),
            LessonSummary(
                id="lvl1-lesson2",
                title="Exchanges, Brokers & Demat Accounts",
                title_hinglish="Exchanges (NSE/BSE), Brokers Aur Demat Account Ka Role",
                summary="The lifecycle of a share: from Exchange (NSE/BSE) to Depository (CDSL/NSDL) via Registered Brokers.",
                summary_hinglish="NSE/BSE exchanges, CDSL/NSDL digital tijori aur broker ka rasta.",
                visual_type="market_flow",
            ),
            LessonSummary(
                id="lvl1-lesson3",
                title="Market Indices: NIFTY 50 & SENSEX",
                title_hinglish="Market Index Kya Hai? NIFTY 50 Aur SENSEX",
                summary="How benchmark indices represent overall market sentiment and economic health.",
                summary_hinglish="Index poore market ki tabiyat batane wala thermometer kaise banta hai.",
                visual_type="market_flow",
            ),
        ],
    ),
    LevelOverview(
        level=2,
        id="level-2-market-fundamentals",
        title="Level 2: Market Fundamentals & Order Mechanics",
        title_hinglish="Level 2: Market Ke Niyam Aur Orders",
        tagline="How Orders Get Filled, Spreads & Corporate Actions",
        description="Master bid/ask spreads, market depth, limit vs market orders, volume, and corporate actions like splits & dividends.",
        lessons=[
            LessonSummary(
                id="lvl2-lesson1",
                title="Bid, Ask & The Spread",
                title_hinglish="Bid, Ask Aur Spread: Khariddar Aur Bechnewale Ka Antar",
                summary="How the two-way auction works, why spreads widen during low liquidity, and the true cost of urgency.",
                summary_hinglish="Kharidne aur bechne ki prices me antar kyu hota hai aur liquidity ka kya asar hai.",
                visual_type="order_book_depth",
            ),
            LessonSummary(
                id="lvl2-lesson2",
                title="Order Types: Market, Limit & Stop-Loss",
                title_hinglish="Order Ke Types: Market, Limit Aur Stop-Loss",
                summary="Comparing execution certainty (Market Orders) with price certainty (Limit Orders) and downside protection (Stop-Loss).",
                summary_hinglish="Kab Market order lagana chahiye aur kab Limit/SL order se apna paisa bachana chahiye.",
                visual_type="order_book_depth",
            ),
            LessonSummary(
                id="lvl2-lesson3",
                title="Dividends, Stock Splits & Bonus Shares",
                title_hinglish="Dividends, Stock Splits Aur Corporate Actions",
                summary="Why stock prices adjust after ex-dividend and split dates without altering the underlying company value.",
                summary_hinglish="Jab share split hota hai ya dividend milta hai to stock price adjust kyu hoti hai.",
                visual_type="order_book_depth",
            ),
        ],
    ),
    LevelOverview(
        level=3,
        id="level-3-reading-charts",
        title="Level 3: Reading Candlesticks & Price Action",
        title_hinglish="Level 3: Candlestick Charts Aur Price Action Samajhna",
        tagline="Decoding the Battle Between Buyers and Sellers",
        description="Learn Japanese candlesticks anatomy, timeframes, trends, support and resistance zones, and false breakouts.",
        lessons=[
            LessonSummary(
                id="lvl3-lesson1",
                title="Anatomy of a Candlestick (OHLC)",
                title_hinglish="Candlestick Ki Body Aur Wicks (OHLC)",
                summary="Open, High, Low, Close, upper/lower shadows, and what body height tells you about market dominance.",
                summary_hinglish="Candle ka open, high, low, close aur wicks buyer-seller ka mukabla kaise dikhate hain.",
                visual_type="candlestick_anatomist",
            ),
            LessonSummary(
                id="lvl3-lesson2",
                title="Support, Resistance & Trendlines",
                title_hinglish="Support Aur Resistance Zones: Price Kaha Rukti Hai",
                summary="How historical price memory creates psychological demand floors (support) and supply ceilings (resistance).",
                summary_hinglish="Support jaha buyers aate hain aur Resistance jaha sellers dump karte hain.",
                visual_type="candlestick_anatomist",
            ),
            LessonSummary(
                id="lvl3-lesson3",
                title="Volume & False Breakouts (Traps)",
                title_hinglish="Volume Ka Sach Aur False Breakouts Se Kaise Bachein",
                summary="Why breakout moves without institutional volume frequently trap retail traders into quick reversals.",
                summary_hinglish="Bina volume ke breakout par entry lene se trap kyu lagta hai.",
                visual_type="candlestick_anatomist",
            ),
        ],
    ),
    LevelOverview(
        level=4,
        id="level-4-technical-analysis",
        title="Level 4: Technical Analysis & Indicators",
        title_hinglish="Level 4: Technical Indicators Aur Unki Limitations",
        tagline="Moving Averages, Momentum & Volatility Bands",
        description="Master SMA, EMA, RSI (Wilder), MACD, Bollinger Bands, ATR, and understand the dangers of indicator lag and overfitting.",
        lessons=[
            LessonSummary(
                id="lvl4-lesson1",
                title="Moving Averages: SMA vs EMA",
                title_hinglish="Moving Averages: SMA Aur EMA Me Kya Antar Hai?",
                summary="Smoothing out price noise, moving average lags, and golden/death cross signals.",
                summary_hinglish="Average price se trend pehchanna aur lag ka dhyan rakhna.",
                visual_type="indicator_explorer",
            ),
            LessonSummary(
                id="lvl4-lesson2",
                title="Momentum: RSI (Wilder's Formula) & MACD",
                title_hinglish="RSI Aur MACD Se Momentum Samajhna",
                summary="14-day Wilder smoothing formula, overbought (>70) vs oversold (<30) myths, and MACD divergence.",
                summary_hinglish="RSI 70 ke upar matlab hamesha bechna nahi hota! Trend me RSI lamba stay kar sakta hai.",
                visual_type="indicator_explorer",
            ),
            LessonSummary(
                id="lvl4-lesson3",
                title="Volatility: Bollinger Bands & ATR",
                title_hinglish="Bollinger Bands Aur ATR Se Volatility Measure Karna",
                summary="Standard deviation bands around 20-SMA, volatility squeeze breakouts, and true range stop-losses.",
                summary_hinglish="Volatility squeeze kab blast hota hai aur stop-loss set karne ke liye ATR ka use.",
                visual_type="indicator_explorer",
            ),
        ],
    ),
    LevelOverview(
        level=5,
        id="level-5-fundamental-analysis",
        title="Level 5: Fundamental Analysis & Financial Statements",
        title_hinglish="Level 5: Company Ki Financial Sehat Aur Valuation",
        tagline="Reading the Numbers Behind the Ticker",
        description="Break down the Income Statement, Balance Sheet, Cash Flow, P/E, P/B, ROE, Debt/Equity, and valuation principles.",
        lessons=[
            LessonSummary(
                id="lvl5-lesson1",
                title="The Financial Waterfall: Revenue to Net Income",
                title_hinglish="Top-line Se Bottom-line: Revenue Se Net Profit Ka Safar",
                summary="Revenue, COGS, Gross Profit, Operating Expenses (OPEX), EBITDA, Depreciation, Interest, Tax, and Net Income.",
                summary_hinglish="Kamayi se lekar aakhri munafa (PAT) tak har kharche ka hisaab.",
                visual_type="fundamental_waterfall",
            ),
            LessonSummary(
                id="lvl5-lesson2",
                title="Valuation Ratios: P/E, P/B & EV/EBITDA",
                title_hinglish="P/E Ratio Aur Valuation: Stock Mehnga Hai Ya Sasta?",
                summary="Price-to-Earnings, Price-to-Book, sector benchmarking, and avoiding value traps.",
                summary_hinglish="P/E ratio dekh kar sasta vs mehnga samajhna aur value trap se bachna.",
                visual_type="fundamental_waterfall",
            ),
            LessonSummary(
                id="lvl5-lesson3",
                title="Balance Sheet Health: Debt/Equity & Free Cash Flow",
                title_hinglish="Balance Sheet: Karza (Debt) Aur Free Cash Flow",
                summary="Why profit is an opinion but cash flow is a fact. Working capital cycles and solvency ratios.",
                summary_hinglish="Profit paper par ho sakta hai par Free Cash Flow bank account ka sach hota hai.",
                visual_type="fundamental_waterfall",
            ),
        ],
    ),
    LevelOverview(
        level=6,
        id="level-6-risk-management",
        title="Level 6: Risk Management & Position Sizing",
        title_hinglish="Level 6: Risk Management Aur Capital Bachana",
        tagline="Survival First: The Only Real Holy Grail in Trading",
        description="Position sizing formulas, 1% risk rule, Risk/Reward ratios, portfolio concentration limits, drawdown math, and psychology.",
        lessons=[
            LessonSummary(
                id="lvl6-lesson1",
                title="The 1% Rule & Mathematical Position Sizing",
                title_hinglish="1% Risk Rule Aur Position Sizing Ka Formula",
                summary="Shares = (Account Risk ₹) / (Entry - StopLoss). Why sizing matters infinitely more than entry accuracy.",
                summary_hinglish="Kitne shares lene chahiye taaki ek trade galat hone par account khali na ho.",
                visual_type="risk_calculator",
            ),
            LessonSummary(
                id="lvl6-lesson2",
                title="Risk-to-Reward Ratio (R:R) & Expectancy",
                title_hinglish="Risk:Reward Ratio: 40% Win Rate Par Bhi Profit Kaise Bane",
                summary="Mathematical expectancy: Win Rate × Avg Win - Loss Rate × Avg Loss. Why 1:2 R:R beats high win rates with fat tails.",
                summary_hinglish="Chhota loss lena aur bada profit ride karna trading ka asali raaz hai.",
                visual_type="risk_calculator",
            ),
            LessonSummary(
                id="lvl6-lesson3",
                title="Drawdown Recovery Math & Concentration Risk",
                title_hinglish="Drawdown Math: 50% Loss Ke Baad 100% Gain Chahiye Hota Hai",
                summary="Asymmetry of loss recovery, why a 25% single-stock concentration cap protects portfolios from ruin.",
                summary_hinglish="Loss recover karne ka ganit asan nahi hota; diversification kyu zaroori hai.",
                visual_type="risk_calculator",
            ),
        ],
    ),
    LevelOverview(
        level=7,
        id="level-7-strategies-backtesting",
        title="Level 7: Strategies, Backtesting & Indian Frictions",
        title_hinglish="Level 7: Quantitative Strategies, Backtesting Aur Frictions",
        tagline="Testing Without Bias & Accounting for Real Costs",
        description="Moving average crossover rules, RSI momentum systems, chronological walk-forward testing, lookahead bias, and Indian friction breakdown.",
        lessons=[
            LessonSummary(
                id="lvl7-lesson1",
                title="Walk-Forward Testing vs Lookahead Bias",
                title_hinglish="Walk-Forward Testing Aur Lookahead Bias Ka Dhoka",
                summary="The lethal mistake of leaking future data into past signals, and testing strictly bar-by-bar.",
                summary_hinglish="Bhavishya ka data dekhkar past me trade lene ki galti aur uska asali asar.",
                visual_type="backtest_visualizer",
            ),
            LessonSummary(
                id="lvl7-lesson2",
                title="Real-World Indian Transaction Frictions",
                title_hinglish="Indian Market Frictions: STT, Brokerage, GST Aur Slippage",
                summary="Exact breakdown of STT (0.1%), Brokerage (₹20 cap), GST (18%), Stamp Duty (0.015%), Exchange Turnover, and Slippage.",
                summary_hinglish="Har trade par kitna tax aur kharcha lagta hai aur ye profit ko kaise ghatata hai.",
                visual_type="backtest_visualizer",
            ),
            LessonSummary(
                id="lvl7-lesson3",
                title="Overfitting & Curve Fitting Traps",
                title_hinglish="Overfitting: Past Data Par Perfect Strategy Live Me Kyu Fail Hoti Hai?",
                summary="Why hyper-optimizing 15 parameters creates an illusion of certainty that collapses on out-of-sample data.",
                summary_hinglish="Past me zabardast dikhne wali strategy real market me aate hi flop kyu ho jati hai.",
                visual_type="backtest_visualizer",
            ),
        ],
    ),
    LevelOverview(
        level=8,
        id="level-8-advanced-practice",
        title="Level 8: Advanced Practice & Behavioral Mastery",
        title_hinglish="Level 8: Advanced Portfolio Health Aur Trader Psychology",
        tagline="Mastering Regimes, Behavioral Biases & Capital Allocation",
        description="Market regimes (bull/bear/choppy), portfolio health scorecards, cognitive biases (FOMO, disposition effect), and systematic execution.",
        lessons=[
            LessonSummary(
                id="lvl8-lesson1",
                title="Market Regimes & Strategy Adaptation",
                title_hinglish="Market Regimes: Trending vs Choppy Markets Me Adaptation",
                summary="Trend-following in regimes 1 & 2 vs mean-reversion in regime 3, and detecting volatility spikes.",
                summary_hinglish="Har strategy har mausam me kaam nahi karti; market regime pehchanna seekhein.",
                visual_type="portfolio_health_scorecard",
            ),
            LessonSummary(
                id="lvl8-lesson2",
                title="Portfolio Health Scorecard & Stress Testing",
                title_hinglish="Portfolio Health Scorecard: Diversification Aur Sharpe Check",
                summary="Evaluating composite scores across Value, Momentum, Quality, Sharpe Ratio, and maximum historical drawdown.",
                summary_hinglish="Apne portfolio ka health checkup kaise karein taaki crash me bacha ja sake.",
                visual_type="portfolio_health_scorecard",
            ),
            LessonSummary(
                id="lvl8-lesson3",
                title="Behavioral Biases: FOMO, Loss Aversion & Revenge Trading",
                title_hinglish="Trader Psychology: FOMO Aur Revenge Trading Se Bachna",
                summary="Cognitive biases that ruin 90% of retail traders: chasing green candles, refusing small losses, and doubling down on losers.",
                summary_hinglish="Market se badla lene ki koshish (revenge trading) me account khali hone se kaise bachein.",
                visual_type="portfolio_health_scorecard",
            ),
        ],
    ),
]


# ==============================================================================
# Endpoints
# ==============================================================================

@router.get("/curriculum", response_model=CurriculumOverviewResponse)
async def get_curriculum():
    """
    Returns the comprehensive 8-level AI Trading Academy syllabus with bilingual lesson summaries,
    interactive visualizer specs, and Indian statutory transaction friction schedules.
    """
    total_lessons = sum(len(lvl.lessons) for lvl in CURRICULUM_DATA)
    return CurriculumOverviewResponse(
        total_levels=len(CURRICULUM_DATA),
        total_lessons=total_lessons,
        levels=CURRICULUM_DATA,
        frictional_rates={
            "stt_delivery_rate": 0.001,  # 0.1% on delivery (both buy & sell)
            "brokerage_flat_cap_inr": 20.0,
            "brokerage_rate": 0.0003,
            "exchange_turnover_rate": 0.0000325,
            "gst_rate": 0.18,  # 18% on brokerage and turnover
            "stamp_duty_buy_rate": 0.00015,  # 0.015% on buy side
            "estimated_slippage_rate": 0.0005,  # 5 bps
        },
        disclaimer=(
            "Educational Simulation Only. MarketPulse Trading Academy does not provide SEBI or FINRA "
            "registered investment advice, guarantees of return, or direct broker order routing. All paper "
            "trading activities are strictly virtual and simulated."
        ),
    )


@router.post("/paper-trade/calculate-frictions", response_model=CalculateFrictionsResponse)
async def calculate_paper_trade_frictions(request: CalculateFrictionsRequest):
    """
    Calculates exact deterministic Indian transaction frictions for simulated paper orders:
    - Securities Transaction Tax (STT)
    - Brokerage (0.03% capped at ₹20)
    - Exchange Turnover Charges (NSE: ~0.00325%)
    - GST (18% on brokerage & turnover)
    - Stamp Duty (0.015% on Buy)
    - Realistic Execution Slippage (0.05%)
    """
    sym = request.symbol.strip().upper()
    action = request.action.strip().upper()
    if action not in {"BUY", "SELL"}:
        raise HTTPException(status_code=400, detail="Action must be 'BUY' or 'SELL'")

    gross_val = round(request.price * request.quantity, 2)
    is_inr = sym.endswith(".NS") or sym.endswith(".BO") or not ("." in sym)

    if is_inr:
        currency = "INR"
        # 1. STT: 0.1% for equity delivery (applies to both buy and sell in paper model for simplicity, or 0.1% delivery)
        stt = round(gross_val * 0.001, 2)
        # 2. Brokerage: min(0.03%, ₹20)
        brokerage = round(min(gross_val * 0.0003, 20.0), 2)
        # 3. Exchange turnover charge: 0.00325%
        exchange_turnover = round(gross_val * 0.0000325, 2)
        # 4. GST: 18% on (brokerage + turnover)
        gst = round((brokerage + exchange_turnover) * 0.18, 2)
        # 5. Stamp duty: 0.015% on buy only
        stamp_duty = round(gross_val * 0.00015, 2) if action == "BUY" else 0.0
        # 6. Slippage: 0.05%
        slippage = round(gross_val * 0.0005, 2)
        total_frictions = round(stt + brokerage + exchange_turnover + gst + stamp_duty + slippage, 2)
    else:
        currency = "USD"
        stt = 0.0
        brokerage = 0.0  # Zero-commission US broker model
        exchange_turnover = round(gross_val * 0.0000278, 2) if action == "SELL" else 0.0  # SEC fee approx
        gst = 0.0
        stamp_duty = 0.0
        slippage = round(gross_val * 0.0005, 2)
        total_frictions = round(brokerage + exchange_turnover + slippage, 2)

    net_trade_value = round(gross_val + total_frictions if action == "BUY" else gross_val - total_frictions, 2)

    breakdown_notes = [
        f"Gross Trade Value: {currency} {gross_val:,.2f}",
        f"STT: {currency} {stt:,.2f}",
        f"Brokerage (capped at ₹20): {currency} {brokerage:,.2f}",
        f"Exchange Turnover & Regulatory: {currency} {exchange_turnover:,.2f}",
        f"GST (18%): {currency} {gst:,.2f}",
        f"Stamp Duty (Buy): {currency} {stamp_duty:,.2f}",
        f"Simulated Execution Slippage (5 bps): {currency} {slippage:,.2f}",
        f"Total Deductions: {currency} {total_frictions:,.2f}",
    ]

    return CalculateFrictionsResponse(
        symbol=sym,
        action=action,
        quantity=request.quantity,
        price=request.price,
        gross_trade_value=gross_val,
        stt=stt,
        brokerage=brokerage,
        exchange_turnover=exchange_turnover,
        gst=gst,
        stamp_duty=stamp_duty,
        estimated_slippage=slippage,
        total_frictions=total_frictions,
        net_trade_value=net_trade_value,
        currency=currency,
        breakdown_notes=breakdown_notes,
    )


@router.post("/tutor", response_model=TutorChatResponse, dependencies=[Depends(rate_limit_dependency)])
async def chat_with_academy_tutor(request: TutorChatRequest):
    """
    Interactive bilingual AI Trading Tutor ("Prof. Pulse").
    Provides patient, pedagogical guidance in English or simple Hinglish.
    Guaranteed zero hallucinated live market prices, zero PII leaks, and grounded in deterministic mathematical concepts.
    """
    # 1. Enforce privacy compliance - reject PII or credentials
    try:
        assert_privacy_compliance(request.question)
    except PrivacyViolationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    q = request.question.strip().lower()
    lang = request.language.strip().lower() if request.language else "en"
    level = request.level or 1

    # 1. Determine learner profile (default to beginner)
    learner_tier = "Level 1 • Absolute Beginner"
    if level in [3, 4]:
        learner_tier = f"Level {level} • Intermediate (Charts & Technicals)"
    elif level in [5, 6, 7, 8]:
        learner_tier = f"Level {level} • Advanced (Fundamentals, Quantitative Risk & Systems)"

    answer = ""
    follow_ups = []
    grounded_concepts = []

    if lang == "hinglish":
        # 1. How to invest / Stock market basics
        if any(w in q for w in ["invest", "how i invest", "how to invest", "shuru", "start", "share market", "kya hota hai", "beginner", "karein"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Namaste! Share market me invest karna koi gambling ya lottery nahi hai, balki achhe businesses me hissedari (fractional ownership) lena hai.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "Share ka matlab hota hai company ki ownership ka chhota hissa. Jab aap Reliance ya TCS ka share kharidte hain, to aap us company ke assets aur munafay me hissa paate hain.\n\n"
                "2. INVESTING SHURU KARNE KE 5 ACTIONABLE STEPS:\n"
                "• Step 1: Teen Zaroori Accounts Set Karein:\n"
                "  - Bank Account: Jaha aapka paisa rehta hai.\n"
                "  - Trading Account: Broker ka interface jaha se aap buy/sell order bhejte hain.\n"
                "  - Demat Account: CDSL/NSDL ki electronic tijori jaha aapke shares digitally safe rehte hain.\n"
                "• Step 2: Index Fund ya NIFTY 50 ETF Se Shuru Karein:\n"
                "  - Shuruat me kisi ek company ke share me risk lene ki jagah NIFTY 50 ETF (jaise NIFTYBEES) kharidna best hota hai. Isse ek sath top 50 companies me investment ho jata hai.\n"
                "• Step 3: Order Types Samajhein:\n"
                "  - Market Order: Turant jo price chal raha ho us par kharidna.\n"
                "  - Limit Order: Apni marzi ka price set karke wait karna.\n"
                "• Step 4: Statutory Charges & Frictions:\n"
                "  - Har trade par chhote sarkari kharche lagte hain: Brokerage (₹20 cap), STT (0.1%), GST (18%) aur Stamp Duty. Roz-roz faltu trade karne se capital khatam hota hai.\n"
                "• Step 5: Capital Protection (1% Rule):\n"
                "  - Wahi paisa market me layein jiski zaroorat agle 3-5 saal tak na ho. Kabhi karz lekar trade na karein.\n\n"
                "3. TECHNICAL TERMS IN PLAIN HINGLISH:\n"
                "• Demat Account: Electronic tijori. Agar broker band bhi ho jaye, to bhi shares CDSL/NSDL ke paas 100% safe rehte hain.\n"
                "• Broker: SEBI-registered platform (Zerodha, Groww) jo aapka order exchange tak pahunchata hai.\n"
                "• Exchange: NSE aur BSE — wo bazar jaha kharidne aur bechne wale milte hain.\n\n"
                "4. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values for Teaching Only]\n"
                "Maan lijiye aapke paas ₹10,000 ka virtual capital hai. Aapne ₹250 ke price par NIFTY ETF ke 20 units kharide (₹5,000). "
                "Taxes aur charges lage lagbhag ₹7.55 (Brokerage ₹1.50 + STT ₹5.00 + GST ₹0.30 + Stamp Duty ₹0.75). "
                "Aapka net invested amount hua ₹5,007.55 aur baaki ₹4,992.45 cash reserve me safe raha.\n\n"
                "5. VISUAL EXPLANATION:\n"
                "👉 Right side par 'Market Flow Visualizer' dekhein: waha animated diagram me clear dikhaya gaya hai ki Bank ➔ Broker ➔ Exchange ➔ Demat Vault tak order kaise move karta hai.\n\n"
                "6. QUICK KNOWLEDGE CHECK:\n"
                "• Sawal: Agar broker achanak band ho jaye, to kya aapke shares chale jayenge?\n"
                "• Sahi Jawab: NAHI! Kyunki shares broker ke paas nahi, CDSL/NSDL depository me aapke naam par Demat account me secure rehte hain.\n\n"
                "7. AGLA STEP:\n"
                "Level 1 • Lesson 2: 'Exchanges, Brokers & Demat Accounts' explore karein ya niche Paper Trading Sandbox me test order lagayein!"
            )
            grounded_concepts = ["Fractional Ownership", "Demat & Trading Account", "NIFTY 50 ETF", "Statutory Frictions", "CDSL / NSDL"]
            follow_ups = [
                "Demat aur Trading account me kya farak hai?",
                "Market order aur Limit order me kya antar hai?",
                "1% risk rule se position size kaise calculate karein?",
            ]

        # 2. Demat / accounts / broker
        elif any(w in q for w in ["demat", "account", "broker", "exchange", "cdsl", "nsdl"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Demat aur Trading accounts ko lekar bohot confusion hoti hai, aasan shabdo me samajhte hain:\n\n"
                "1. SIMPLE DEFINITION:\n"
                "Demat account aapki digital tijori hai jisme aapke shares electronic form me jama rehte hain. Trading account aapka buy/sell karne ka digital platform hai.\n\n"
                "2. KAISE KAAM KARTA HAI (STEP-BY-STEP):\n"
                "• Step 1: Aap apne Trading App (Broker) par Buy order lagate hain.\n"
                "• Step 2: Broker ye order Exchange (NSE/BSE) ko forward karta hai.\n"
                "• Step 3: Exchange par jab seller milta hai, order execute ho jata hai.\n"
                "• Step 4: Bank se paisa kat-kar broker exchange ko deta hai.\n"
                "• Step 5: T+1 din ke andar shares aapke Demat account (CDSL/NSDL) me credit ho jate hain.\n\n"
                "3. KEY TERMS EXPLAINED:\n"
                "• CDSL / NSDL: Bharat sarkar dwara approved depositories jo aapke shares ka digital record rakhte hain.\n"
                "• T+1 Settlement: Trade ke agle din shares Demat me aana.\n\n"
                "4. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "Aapne Monday ko ₹3,000 ka share kharida. Tuesday shaam tak ye share aapke CDSL Demat me show hone lagega.\n\n"
                "5. VISUAL EXPLANATION:\n"
                "👉 Right side par 'Market Flow Visualizer' dekhein jisme Bank, Broker, Exchange aur Depository ka live connection dikhaya gaya hai.\n\n"
                "6. QUICK KNOWLEDGE CHECK:\n"
                "• Sawal: Kya broker aapke shares chura sakta hai?\n"
                "• Jawab: Nahi! Shares Demat account me rehte hain jiske liye CDSL OTP aur TPIN verification zaroori hota hai.\n\n"
                "7. AGLA STEP:\n"
                "Level 2 • Lesson 1: 'Bid/Ask Spread and Order Book Depth' check karein!"
            )
            grounded_concepts = ["Demat Account", "Trading Account", "CDSL / NSDL", "T+1 Settlement"]
            follow_ups = [
                "NSE aur BSE me kya farak hai?",
                "Market order aur limit order me kya antar hai?",
                "Bid-Ask spread kya hota hai?",
            ]

        # 3. Candlesticks / Charts
        elif any(w in q for w in ["candle", "chart", "wick", "green", "red", "timeframe"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Candlestick chart market ke price action ko samajhne ka sabse powerful visual tool hai.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "Har ek candle ek specific timeframe (jaise 5 minute, 1 din) me price ki ladai (Buyers vs Sellers) ko dikhati hai.\n\n"
                "2. CANDLE KE 4 MAIN POINTS (OHLC):\n"
                "• Open (O): Time period shuru hone par pehla price.\n"
                "• High (H): Us period ka sabse uncha price.\n"
                "• Low (L): Us period ka sabse nichla price.\n"
                "• Close (C): Period khatam hone par aakhri price.\n\n"
                "3. RANG KA MATLAB:\n"
                "• Green (Bullish): Close > Open (Buyers jeet gaye, price upar gaya).\n"
                "• Red (Bearish): Close < Open (Sellers jeet gaye, price niche gira).\n"
                "• Wicks (Shadows): Jo patli lines upar aur niche hoti hain, wo price rejection dikhati hain.\n\n"
                "4. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "Ek share subah ₹100 par open hua (Open), din me ₹105 tak gaya (High), girkar ₹98 par aaya (Low), aur ₹104 par band hua (Close). "
                "Ye ek Green Candle banegi jisme body ₹100 se ₹104 tak hogi aur upar ₹105 tak wick hogi.\n\n"
                "5. VISUAL EXPLANATION:\n"
                "👉 Right side par 'Candlestick Anatomist' dekhein: aap Open, High, Low, Close ke sliders move karke realtime me candle shape bante dekh sakte hain!\n\n"
                "6. QUICK KNOWLEDGE CHECK:\n"
                "• Sawal: Agar candle ke niche bohot lambi wick ho aur body upar choti ho, to iska kya matlab hai?\n"
                "• Jawab: Iska matlab hai sellers ne price niche girane ki koshish ki, lekin buyers ne neeche se strong buying karke price wapas upar bhej diya (Hammer / Bullish Rejection).\n\n"
                "7. AGLA STEP:\n"
                "Level 3 • Lesson 2: 'Support & Resistance Levels' par move karein!"
            )
            grounded_concepts = ["Candlestick OHLC", "Bullish / Bearish Body", "Wick Price Rejection", "Candlestick Anatomist"]
            follow_ups = [
                "Hammer aur Shooting Star pattern me kya farak hai?",
                "Support aur Resistance level kaise draw karte hain?",
                "Volume ka candle ke sath kya relation hai?",
            ]

        # 4. Indicators / RSI / MACD / Moving Averages
        elif any(w in q for w in ["rsi", "indicator", "macd", "sma", "ema", "moving average", "bollinger"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Technical indicators mathematical formulas hote hain jo past price aur volume ko process karke momentum aur trend batate hain.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "RSI (Relative Strength Index) ek momentum oscillator hai jo 0 se 100 ke beech oscillate karta hai. Ye batata hai ki stock me buying momentum kitna strong ya weak hai.\n\n"
                "2. INDICATOR USE KARNE KE 4 GOLDEN RULES:\n"
                "• Rule 1: RSI > 70 par andha sell mat karein! Strong bull run me RSI hafte bhar 70 ke upar reh sakta hai.\n"
                "• Rule 2: RSI < 30 par andha buy mat karein! Downtrend me price aur niche gir sakta hai.\n"
                "• Rule 3: Moving Average (SMA 20/50): Trend pehchane ke liye use karein.\n"
                "• Rule 4: Indicators hamesha 'Lagging' hote hain; unhe support aur resistance ke confirmation ke sath use karein.\n\n"
                "3. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "Agar kisi stock ka 20-day SMA ₹1,200 hai aur current price ₹1,250 hai aur 20-SMA ke upar sustain kar raha hai, to short-term trend bullish mana jata hai.\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Right side par 'Indicator Explorer' canvas dekhein jisme SMA 20, SMA 50, Bollinger Bands aur RSI graph interactively toggle kiye ja sakte hain.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Sawal: Kya ek sath 10 indicators lagane se accuracy badhti hai?\n"
                "• Jawab: NAHI! Isko 'Analysis Paralysis' kehte hain. 2 se zyada correlated indicators lagane se confusion badhti hai aur signals delay ho jate hain.\n\n"
                "6. AGLA STEP:\n"
                "Level 4 • Lesson 2: 'MACD Trend & Momentum Divergence' seekhein!"
            )
            grounded_concepts = ["Wilder 14-RSI", "SMA & EMA Lag", "Indicator Confluence", "Analysis Paralysis"]
            follow_ups = [
                "SMA aur EMA me se koun sa moving average better hai?",
                "MACD signal line crossover kaise kaam karta hai?",
                "Bollinger Bands volatility squeeze kya hota hai?",
            ]

        # 5. Risk management / stop loss / position size / 1% rule
        elif any(w in q for w in ["risk", "stop loss", "stoploss", "position", "size", "capital", "loss"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Professional traders ka pehla niyam hai: Profit banana secondary hai, Capital bachana (capital preservation) sabse pehla farz hai!\n\n"
                "1. SIMPLE DEFINITION:\n"
                "Position sizing ka matlab hai ye pehle se tay karna ki kisi trade me kitne rupaye ke shares kharidne hain, taaki agar trade galat ho jaye to bhi bada nuksan na ho.\n\n"
                "2. THE 1% RISK RULE FORMULA:\n"
                "Kisi bhi single trade par apne total capital ka 1% se zyada risk kabhi mat lijiye.\n"
                "Formula:\n"
                "Shares to Buy = (Total Capital × 1%) / (Entry Price - Stop Loss Price)\n\n"
                "3. WORKED EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "• Total Capital = ₹1,00,000\n"
                "• 1% Risk Amount = ₹1,000 (Maximum loss allowed)\n"
                "• Entry Price = ₹500\n"
                "• Stop-Loss Price = ₹480 (Risk per share = ₹20)\n"
                "• Shares to Buy = ₹1,000 / ₹20 = 50 shares\n"
                "Agar stop-loss hit bhi ho gaya, to sirf ₹1,000 jayega, aur aapka ₹99,000 bilkul surakshit rahega!\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Right side par 'Risk Management & Position Sizing Calculator' open karein. Apne capital aur stop-loss ko slide karke dekhein ki exact quantity kaise calculate hoti hai.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Sawal: Agar aapka account 50% gir jaye, to wapas barabar aane ke liye kitna gain chahiye?\n"
                "• Jawab: 100%! ₹1,00,000 se ₹50,000 hone par 50% loss hua, lekin ₹50,000 se wapas ₹1,00,000 aane ke liye 100% gain chahiye hota hai (Drawdown Asymmetry).\n\n"
                "6. AGLA STEP:\n"
                "Level 6 • Lesson 2: 'Risk:Reward Ratio (R:R) & Expectancy' explore karein!"
            )
            grounded_concepts = ["1% Risk Rule", "Position Sizing Math", "Stop-Loss Discipline", "Drawdown Asymmetry"]
            follow_ups = [
                "1:2 Risk to Reward ratio kyu zaroori hai?",
                "Portfolio concentration risk ko kaise limit karein?",
                "Trailing stop-loss kaise lagate hain?",
            ]

        # 6. Fundamental analysis / PE / Revenue / Balance sheet
        elif any(w in q for w in ["fundamental", "pe", "ratio", "eps", "revenue", "profit", "balance sheet", "cash flow"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Fundamental analysis ka matlab hai stock ke piche chal rahe asli business ki sehat (financial health) ki jaanch karna.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "P/E (Price-to-Earnings) ratio batata hai ki company ke har ₹1 munafay (earnings) ke liye market kitne rupaye dene ko taiyar hai.\n"
                "Formula: P/E = Share Price / Earnings Per Share (EPS)\n\n"
                "2. THE FINANCIAL WATERFALL (TOP TO BOTTOM):\n"
                "• Revenue (Top-Line): Total sales kitni hui.\n"
                "• Operating Expenses: Raw material aur salary ka kharcha.\n"
                "• EBITDA: Operating profit.\n"
                "• Interest & Taxes: Bank interest aur tax katne ke baad...\n"
                "• Net Income (Bottom-Line / PAT): Asli bacha hua munafa.\n"
                "• Free Cash Flow (FCF): Asli cash jo bank account me bacha (sabse zaroori metric!).\n\n"
                "3. WORKED EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "Company A ka share price ₹200 hai aur saal ka EPS ₹10 hai. P/E = 200 / 10 = 20x. "
                "Lekin low P/E (jaise 4x) hamesha sasta nahi hota, wo 'Value Trap' bhi ho sakta hai agar business me karza bohot zyada ho.\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Right side par 'Fundamental Waterfall' canvas dekhein jisme Revenue se lekar Net Income aur Cash Flow tak har step ka interactive flow visualised hai.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Sawal: Profit paper par dikh sakta hai par bank me cash na ho, aisa kyu hota hai?\n"
                "• Jawab: Kyunki sales udhaar par ho sakti hain! Isliye smart investors Net Profit ke sath 'Free Cash Flow' zaroor check karte hain.\n\n"
                "6. AGLA STEP:\n"
                "Level 5 • Lesson 3: 'Debt-to-Equity & Balance Sheet Health' check karein!"
            )
            grounded_concepts = ["P/E Ratio & EPS", "Revenue to Net Income Waterfall", "Free Cash Flow vs Accounting Profit", "Value Trap Defense"]
            follow_ups = [
                "Debt to Equity ratio safe kitna hota hai?",
                "ROE aur ROCE me kya difference hai?",
                "Free Cash Flow kaise calculate hota hai?",
            ]

        # 7. Backtesting & Frictions
        elif any(w in q for w in ["backtest", "testing", "friction", "stt", "tax", "bias", "overfit"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Backtesting ka matlab hai apni strategy ko past data par test karke check karna ki wo sach me kaam karti hai ya sirf khayali pulao hai.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "Walk-forward backtesting past market bars par step-by-step trading signals simulate karta hai bina aage ka data dekhe.\n\n"
                "2. DO KHATARNAK GALTIYAN JO 90% TRADERS KARTE HAIN:\n"
                "• Galti 1 - Lookahead Bias: Past me trade lete waqt future bar ka high/low use kar lena. Live market me aapko kal ka price pehle se pata nahi hota!\n"
                "• Galti 2 - Frictions Na Ginna: Real market me STT (0.1%), Brokerage (₹20), GST (18%), Stamp duty aur Slippage lagti hai.\n\n"
                "3. WORKED EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Simulation]\n"
                "Agar aapki strategy 100 trades leti hai aur har trade par ₹500 ka gross profit dikhati hai (Total ₹50,000), "
                "lekin har trade par ₹300 ke taxes, brokerage aur slippage lagte hain (Total ₹30,000), to asli net profit sirf ₹20,000 bachega!\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Right side par 'Backtest Visualizer' dekhein: waha equity curve ke sath-sath Indian statutory friction breakdown ka chart diya gaya hai.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Sawal: Lookahead bias kyu fatal hota hai?\n"
                "• Jawab: Kyunki backtest me 90% win rate dikhata hai, lekin live aate hi fail ho jata hai kyunki live market me kal ka candle pehle se pata nahi hota.\n\n"
                "6. AGLA STEP:\n"
                "Level 7 • Lesson 2: 'Real-World Indian Transaction Frictions' detail me study karein!"
            )
            grounded_concepts = ["Walk-Forward Backtesting", "Lookahead Bias Prevention", "Indian Statutory Frictions", "Slippage Parity"]
            follow_ups = [
                "Paper trading sandbox me test trade kaise lagayein?",
                "Overfitting se kaise bachein?",
                "STT delivery aur intraday me kya farak hai?",
            ]

        # Default pedagogical greeting for Hinglish
        else:
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Namaste! Mai Prof. Pulse hu, aapka AI Trading Academy Tutor.\n\n"
                "Stock market me sabse zaroori cheez hai disciplined learning aur capital preservation. "
                "Mai aapko step-by-step sikhane ke liye taiyar hu. Aap mujhse pooch sakte hain:\n"
                "1. 'Explain me how I invest in stock' (Shuruat kaise karein)\n"
                "2. 'Demat aur Trading account kya hote hain?'\n"
                "3. 'Candlestick charts kaise read karein?'\n"
                "4. '1% Risk Rule se position size kaise calculate karein?'\n"
                "5. 'P/E ratio aur Fundamental analysis kya hai?'\n"
                "6. 'Real trading me STT, brokerage aur taxes kitne lagte hain?'\n\n"
                "Poochiye, aap kya seekhna chahte hain?"
            )
            grounded_concepts = ["Structured 8-Step Pedagogy", "Capital Safety", "Disciplined Learning"]
            follow_ups = [
                "How do I start investing in stocks?",
                "Demat aur Trading account me kya farak hai?",
                "1% risk rule formula samjhao",
            ]

    else:
        # ==============================================================================
        # ENGLISH PEDAGOGICAL RESPONSES (8-STEP STRUCTURED FLOW)
        # ==============================================================================

        # 1. How to invest / Stock market basics
        if any(w in q for w in ["invest", "how i invest", "how to invest", "how do i start", "start investing", "stock", "share", "beginner"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Welcome to MarketPulse! Investing in the stock market is about acquiring fractional ownership in durable, productive businesses—it is not gambling on price volatility.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "A stock (or equity share) represents fractional ownership in an incorporated corporation. When you buy 1 share of a company like Tata Consultancy Services or Reliance Industries, you legally own a micro-fraction of its physical assets, factories, code, and future earnings.\n\n"
                "2. HOW TO INVEST IN 5 ACTIONABLE STEPS:\n"
                "• Step 1: Establish Your Three Linked Accounts:\n"
                "  - Bank Account: Where your fiat currency is held.\n"
                "  - Trading Account: Your broker-provided terminal for issuing buy/sell orders.\n"
                "  - Demat Account: Your electronic depository vault (CDSL or NSDL in India) where share certificates are safely stored in your name.\n"
                "• Step 2: Start with Broad Market Index ETFs:\n"
                "  - Rather than gambling on individual speculative stocks, beginners are safest starting with low-cost index ETFs like NIFTY 50 (e.g. NIFTYBEES) or S&P 500 ETFs. You instantly diversify across the nation's 50 strongest enterprises.\n"
                "• Step 3: Understand Basic Order Types:\n"
                "  - Market Order: Executes immediately at the best available ask price.\n"
                "  - Limit Order: You define your maximum price; the order fills only if the market meets your price.\n"
                "• Step 4: Account for Real-World Transaction Frictions:\n"
                "  - In India, every trade carries small statutory fees: Brokerage (capped at ₹20 per executed order), Securities Transaction Tax (STT @ 0.1%), GST (18%), and Stamp Duty (0.015%). Over-trading erodes compounding!\n"
                "• Step 5: Follow the 1% Capital Protection Rule:\n"
                "  - Only invest capital you will not need for the next 3 to 5 years. Never trade with borrowed money or leverage.\n\n"
                "3. KEY VOCABULARY EXPLAINED:\n"
                "• Demat Account: A dematerialized vault. Even if your broker goes bankrupt, your shares remain 100% safe in the national depository.\n"
                "• Broker: A SEBI-registered middleman (e.g. Zerodha, Groww) routing orders to the stock exchange.\n"
                "• Stock Exchange: The regulated marketplace (NSE/BSE in India; NASDAQ/NYSE in the US) where buyers and sellers match.\n\n"
                "4. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values for Teaching Only]\n"
                "Suppose you have ₹10,000 in virtual capital. You purchase 20 units of a diversified Index ETF trading at ₹250 per unit (₹5,000 gross).\n"
                "Statutory transaction frictions (Brokerage ~₹1.50 + STT ~₹5.00 + GST ~₹0.30 + Stamp Duty ~₹0.75) ≈ ₹7.55.\n"
                "Net invested: ₹5,007.55. You maintain ₹4,992.45 in liquid cash reserves as a safety buffer.\n\n"
                "5. VISUAL EXPLANATION:\n"
                "👉 Observe the 'Market Flow Visualizer' on the right side of this screen: see how funds flow from your Bank ➔ through the Broker Gateway ➔ execute on the NSE/BSE Exchange ➔ and deposit electronic shares into your Demat Vault under the T+1 settlement cycle.\n\n"
                "6. QUICK KNOWLEDGE CHECK:\n"
                "• Question: If your stock broker suddenly goes out of business tomorrow, do you lose your shares?\n"
                "• Answer: NO! In India, shares are not held by the broker; they are registered in your name inside the national depository (CDSL/NSDL) in your Demat account.\n\n"
                "7. NEXT STEP IN YOUR LEARNING JOURNEY:\n"
                "Advance to Level 1 • Lesson 2: 'Exchanges, Brokers & Demat Accounts' or practice simulated order routing in the Paper Trading Sandbox!"
            )
            grounded_concepts = ["Fractional Ownership", "Demat vs Trading Account", "NIFTY 50 Index ETF", "Statutory Frictions", "CDSL / NSDL Custody"]
            follow_ups = [
                "What is the difference between Demat and Trading accounts?",
                "How does the T+1 settlement cycle protect investors?",
                "How do I calculate position size using the 1% risk rule?",
            ]

        # 2. Demat / accounts / broker
        elif any(w in q for w in ["demat", "account", "broker", "exchange", "cdsl", "nsdl"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Let's break down the custody and operational infrastructure of stock ownership.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "A Demat (Dematerialized) account is your electronic vault holding shares in digital format. A Trading account is your operational interface provided by a broker to execute orders on the exchange.\n\n"
                "2. HOW THE LIFECYCLE WORKS (STEP-BY-STEP):\n"
                "• Step 1: You enter a buy order inside your broker's trading terminal.\n"
                "• Step 2: The broker routes your order directly to the stock exchange (NSE or BSE).\n"
                "• Step 3: The exchange matching engine pairs your buy order with a seller's ask.\n"
                "• Step 4: Funds are debited from your linked bank account.\n"
                "• Step 5: Under the standard T+1 rolling settlement cycle, the exchange instructs the national depository (CDSL or NSDL) to credit shares to your Demat vault.\n\n"
                "3. KEY VOCABULARY:\n"
                "• Depositories (CDSL & NSDL): Central government-regulated institutions that maintain master ownership ledgers.\n"
                "• T+1 Settlement: All equity delivery transactions settle within 1 business day.\n\n"
                "4. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "If you purchase ₹5,000 of stock on Monday at 11:00 AM, the electronic shares are deposited into your CDSL/NSDL Demat account by Tuesday evening.\n\n"
                "5. VISUAL EXPLANATION:\n"
                "👉 Refer to the 'Market Flow Visualizer' on the canvas: notice the strict separation between the Broker Gateway (execution) and the Depository Vault (custody).\n\n"
                "6. QUICK KNOWLEDGE CHECK:\n"
                "• Question: Does your stock broker have the legal right to sell your shares without your consent?\n"
                "• Answer: Absolutely not. Depository regulations require CDSL/NSDL TPIN authentication and OTP confirmation for any debit from your Demat account.\n\n"
                "7. NEXT RECOMMENDED LESSON:\n"
                "Level 2 • Lesson 1: 'Bid/Ask Spread and Order Book Depth'."
            )
            grounded_concepts = ["Demat Account", "Trading Account", "CDSL / NSDL Custody", "T+1 Settlement Cycle"]
            follow_ups = [
                "What is the difference between NSE and BSE?",
                "What is the difference between a Market and a Limit order?",
                "How does the bid-ask spread affect order execution?",
            ]

        # 3. Candlesticks / Charts
        elif any(w in q for w in ["candle", "chart", "wick", "green", "red", "timeframe"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Candlestick charts are the universal language of price action, originally developed by Japanese rice trader Munehisa Homma in the 18th century.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "A candlestick graphically summarizes four critical price points for any chosen timeframe (e.g. 5 minutes, 1 hour, or 1 day): Open, High, Low, and Close (OHLC).\n\n"
                "2. THE 4 COMPONENTS OF A CANDLE:\n"
                "• Open: The very first traded price when the session started.\n"
                "• High: The highest price reached during the period.\n"
                "• Low: The lowest price reached during the period.\n"
                "• Close: The final executed price when the session ended.\n\n"
                "3. COLOR & ANATOMY:\n"
                "• Green (Bullish): Close > Open (buyers overwhelmed sellers).\n"
                "• Red (Bearish): Close < Open (sellers overwhelmed buyers).\n"
                "• Body: The thick colored rectangle between Open and Close.\n"
                "• Wicks (Shadows): The thin lines extending above and below, showing price rejection.\n\n"
                "4. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "A stock opens at ₹1,000, drops to a low of ₹980, climbs to a peak of ₹1,050, and closes at ₹1,040. "
                "The candle body spans ₹1,000 to ₹1,040 (green), with a top wick reaching ₹1,050 and a bottom wick dipping to ₹980.\n\n"
                "5. VISUAL EXPLANATION:\n"
                "👉 Open the 'Candlestick Anatomist' on the right canvas. Drag the Open, High, Low, and Close sliders to see the candle dynamically morph from a Bullish Hammer to a Bearish Doji!\n\n"
                "6. QUICK KNOWLEDGE CHECK:\n"
                "• Question: What does a long lower wick on a daily candle signify?\n"
                "• Answer: Bullish rejection! Sellers pushed the price down, but buyers stepped in aggressively before the close, forcing the price back up.\n\n"
                "7. NEXT STEP IN YOUR CURRICULUM:\n"
                "Level 3 • Lesson 2: 'Support & Resistance Confluence'."
            )
            grounded_concepts = ["Candlestick OHLC Anatomy", "Bullish vs Bearish Bodies", "Wick Price Rejection", "Candlestick Anatomist"]
            follow_ups = [
                "What does a Doji candle indicate?",
                "How do support and resistance levels form?",
                "How does volume confirm candlestick patterns?",
            ]

        # 4. Indicators / RSI / MACD / Moving Averages
        elif any(w in q for w in ["rsi", "indicator", "macd", "sma", "ema", "moving average", "bollinger"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Technical indicators apply deterministic mathematical formulas to historical price and volume bars to measure momentum, trend, and volatility.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "The Relative Strength Index (RSI) is a bounded momentum oscillator created by J. Welles Wilder Jr. in 1978. It oscillates between 0 and 100, measuring the speed and change of price movements over 14 periods.\n\n"
                "2. ESSENTIAL RULES FOR INTERPRETATION:\n"
                "• Myth: 'RSI > 70 means immediately short the stock!' In sustained secular bull trends, RSI can remain above 70 for weeks while the price doubles.\n"
                "• Moving Averages: SMA (Simple Moving Average) calculates the arithmetic mean, while EMA (Exponential) weights recent prices heavier to reduce lag.\n"
                "• Bollinger Bands: Wrap 2 standard deviations around a 20-period SMA to detect volatility squeezes.\n"
                "• Rule of Confluence: Never enter a trade based on an indicator alone; always verify price structure and support/resistance.\n\n"
                "3. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "If a stock trades at ₹2,500 while its 20-day SMA is ₹2,420 and 50-day SMA is ₹2,350, price is in an established upward momentum regime.\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Check the 'Indicator Explorer' canvas on the right: toggle SMA 20, SMA 50, Bollinger Bands, and RSI to observe how indicators lag price changes.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Question: Why is piling 10 different indicators on your chart dangerous?\n"
                "• Answer: Analysis Paralysis! Most indicators are mathematically derived from the same closing price; redundant indicators generate conflicting, lagging noise.\n\n"
                "6. NEXT STEP IN CURRICULUM:\n"
                "Level 4 • Lesson 2: 'MACD Trend & Momentum Divergence'."
            )
            grounded_concepts = ["Wilder 14-RSI", "SMA vs EMA Lag Tradeoff", "Bollinger Band Squeeze", "Indicator Confluence"]
            follow_ups = [
                "How does EMA reduce lag compared to SMA?",
                "What is a bullish MACD histogram divergence?",
                "How do Bollinger Bands identify volatility squeezes?",
            ]

        # 5. Risk management / stop loss / position size / 1% rule
        elif any(w in q for w in ["risk", "stop loss", "stoploss", "position", "size", "capital", "loss"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "In professional quantitative trading, capital preservation is the absolute priority. Your edge is not predicting the future; it is surviving losing streaks.\n\n"
                "1. THE 1% PORTFOLIO RISK RULE:\n"
                "Never risk more than 1% of your total liquid trading capital on any single transaction.\n\n"
                "2. THE MATHEMATICAL POSITION SIZING FORMULA:\n"
                "Shares to Buy = (Total Capital × 1%) / (Entry Price - Stop Loss Price)\n\n"
                "3. WORKED EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Calculations]\n"
                "• Total Account Equity = ₹1,00,000\n"
                "• Maximum Allowed Loss (1%) = ₹1,000\n"
                "• Planned Entry Price = ₹2,500\n"
                "• Planned Stop Loss Price = ₹2,450 (Risk per share = ₹50)\n"
                "• Position Size = ₹1,000 / ₹50 = 20 shares\n"
                "Even if the trade fails and hits your stop loss, you lose exactly ₹1,000 (1%). Your remaining ₹99,000 keeps you mathematically solvent!\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Use the 'Risk Management & Position Sizing Calculator' on the canvas: adjust account equity and stop loss distance to observe the exact calculated shares.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Question: If your account suffers a 50% loss, what return is required just to break even?\n"
                "• Answer: 100%! If ₹1,00,000 drops to ₹50,000, you need a 100% gain on that ₹50,000 to get back to ₹1,00,000 (Drawdown Recovery Asymmetry).\n\n"
                "6. NEXT STEP IN CURRICULUM:\n"
                "Level 6 • Lesson 2: 'Risk:Reward Ratio (R:R) & Expectancy'."
            )
            grounded_concepts = ["1% Risk Rule", "Deterministic Position Sizing", "Stop-Loss Discipline", "Drawdown Asymmetry"]
            follow_ups = [
                "Why is a minimum 1:2 Risk-to-Reward ratio essential?",
                "How does drawdown recovery asymmetry make 50% losses fatal?",
                "Why should single-stock concentration be capped at 25%?",
            ]

        # 6. Fundamental analysis / PE / Revenue / Balance sheet
        elif any(w in q for w in ["fundamental", "pe", "ratio", "eps", "revenue", "profit", "balance sheet", "cash flow"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Fundamental analysis inspects the business engine behind the stock ticker.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "The Price-to-Earnings (P/E) ratio reveals how many units of currency investors are paying for every ₹1 of annual corporate profit.\n"
                "Formula: P/E = Market Share Price / Earnings Per Share (EPS)\n\n"
                "2. THE FINANCIAL WATERFALL:\n"
                "• Top-Line (Gross Revenue): Total product/service sales.\n"
                "• Gross Profit: Revenue minus Cost of Goods Sold (COGS).\n"
                "• Operating Profit (EBITDA): Profit before non-cash depreciation, interest, and taxes.\n"
                "• Bottom-Line (Net Income / PAT): The accounting profit after all expenses.\n"
                "• Free Cash Flow (FCF): True cash deposited in the bank after Capital Expenditures (CapEx). Remember: Accounting profit is an opinion; Cash flow is a fact!\n\n"
                "3. WORKED EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Values]\n"
                "A company with a ₹3,000 share price and ₹100 EPS trades at a P/E of 30x. "
                "Beware of 'Value Traps'—a company with a cheap 4x P/E often has unmanageable debt or an obsolete business model.\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Open the 'Fundamental Waterfall' visualizer on the canvas to see the animated breakdown of income from Revenue down to Free Cash Flow.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Question: Can a company report positive net profit on paper while sliding toward bankruptcy?\n"
                "• Answer: YES! If its customers do not pay cash (rising unpaid receivables) or CapEx is massive, its Free Cash Flow can turn negative, causing insolvency.\n\n"
                "6. NEXT STEP IN CURRICULUM:\n"
                "Level 5 • Lesson 3: 'Balance Sheet Health: Debt/Equity & Free Cash Flow'."
            )
            grounded_concepts = ["P/E & EPS", "Revenue to Net Income Waterfall", "Free Cash Flow vs Accounting Profit", "Value Trap Defense"]
            follow_ups = [
                "How do you evaluate Debt-to-Equity ratios across capital-intensive industries?",
                "What is the difference between Return on Equity (ROE) and ROCE?",
                "How does the financial waterfall flow from Revenue down to Net Income?",
            ]

        # 7. Backtesting & Frictions
        elif any(w in q for w in ["backtest", "testing", "friction", "stt", "tax", "bias", "overfit"]):
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Backtesting tests your systematic hypothesis on historical data to see if it actually possessed quantitative edge.\n\n"
                "1. SIMPLE DEFINITION:\n"
                "Walk-forward backtesting simulates a trading ruleset strictly bar-by-bar across past price history without peeking into future data.\n\n"
                "2. THE TWO FATAL BACKTESTING FLAWS:\n"
                "• Flaw 1 - Lookahead Bias: Accidentally using future information (e.g. tomorrow's close or next-day high) to generate today's signal. In live markets, you never have tomorrow's newspaper!\n"
                "• Flaw 2 - Friction Neglect: Ignoring mandatory statutory transaction fees (STT @ 0.1%, Brokerage @ ₹20 cap, GST @ 18%, Stamp Duty @ 0.015%, and execution slippage). A strategy with high turnover can show +40% gross returns while suffering -10% net returns after frictions!\n\n"
                "3. WORKED EDUCATIONAL EXAMPLE:\n"
                "[Hypothetical Backtest Numbers]\n"
                "A strategy generates 100 round-trip trades. Gross return = ₹50,000. "
                "However, transaction costs total ₹30,000 (Brokerage ₹4,000 + STT ₹20,000 + GST ₹720 + Stamp Duty ₹3,000 + Slippage ₹2,280). "
                "Your true net profit is only ₹20,000. Without modeling frictions, the backtest was an illusion.\n\n"
                "4. VISUAL EXPLANATION:\n"
                "👉 Open the 'Backtest Visualizer' on the canvas: compare gross vs net equity curves with full statutory friction breakdowns.\n\n"
                "5. QUICK KNOWLEDGE CHECK:\n"
                "• Question: Why does an over-optimized strategy with 15 indicators fail when taken live?\n"
                "• Answer: Overfitting! It memorized the historical noise rather than learning a persistent underlying economic edge.\n\n"
                "6. NEXT STEP IN CURRICULUM:\n"
                "Level 7 • Lesson 2: 'Real-World Indian Transaction Frictions' or place a simulated test order in the Paper Trading Sandbox!"
            )
            grounded_concepts = ["Walk-Forward Backtesting", "Lookahead Bias Elimination", "Statutory Indian Frictions", "Slippage Parity"]
            follow_ups = [
                "How does MarketPulse eliminate lookahead bias in its backtest engine?",
                "How do you place a simulated order in the Paper Trading Sandbox?",
                "What is overfitting and how do walk-forward splits prevent it?",
            ]

        # Default pedagogical greeting for English
        else:
            answer = (
                f"🎯 Learner Profile: {learner_tier}\n"
                "Hello! I am Prof. Pulse, your dedicated AI Trading Academy Tutor.\n\n"
                "In financial markets, disciplined learning and understanding risk precede all profits. "
                "I am here to guide you step-by-step through any concept using our 8-step structured framework:\n"
                "• 'How do I start investing in stocks?' (Beginner roadmap)\n"
                "• 'What is the difference between a Demat and Trading account?'\n"
                "• 'How do I read candlestick charts?'\n"
                "• 'How do I calculate position size using the 1% risk rule?'\n"
                "• 'Explain P/E ratio and fundamental valuation'\n"
                "• 'How do transaction taxes (STT, Brokerage, GST) impact trading?'\n\n"
                "What would you like to explore today?"
            )
            grounded_concepts = ["Structured 8-Step Pedagogy", "Capital Safety", "Disciplined Learning"]
            follow_ups = [
                "How do I start investing in stocks?",
                "Explain the difference between Demat and Trading accounts",
                "How do I calculate position size using the 1% risk rule?",
            ]

    return TutorChatResponse(
        answer=answer,
        language=lang,
        level=level,
        follow_up_suggestions=follow_ups,
        grounded_concepts=grounded_concepts,
        disclaimer="Educational Simulation Only. MarketPulse Tutor does not provide registered investment advice or price predictions. (Demo AI Mode Active)",
    )

