# MarketPulse: Product Requirements Document (PRD)

**Document Version**: 1.0  
**Status**: APPROVED BASELINE SPECIFICATION  
**Author / Team**: MarketPulse Core Quantitative & Engineering Team  
**Workspace Path**: `docs/PRD.md`  
**Preservation Rule**: Existing live application (`app.py`, `Stock_market.ipynb`) and both model artifacts (`final_stock_model.joblib` - 731 MB, `final_stock_model_50trees.joblib` - 38.5 MB) remain permanently untouched as historical reference baselines.

---

## 1. Executive Summary & Product Vision

### 1.1 Product Vision
**MarketPulse** is a worldwide, public, multi-user AI-powered financial research, factor intelligence, and decision-support Software-as-a-Service (SaaS). 

The platform bridges the gap between opaque "black-box" trading tips and expensive institutional terminals (such as Bloomberg or Refinitiv) by offering:
1. **Explainable Market Intelligence**: Multi-factor scoring across value, momentum, quality, and volatility rather than mysterious directional alerts.
2. **Probabilistic Machine Learning Signals**: Directional probability estimates with calibrated confidence ratings and transparent model telemetry (ROC-AUC, calibration error, and baseline comparisons).
3. **Verified AI Research Analyst**: An interactive conversational analyst that provides executive due-diligence summaries grounded in verifiable data with cited sources.
4. **Realistic Walk-Forward Backtesting**: Historical strategy simulation incorporating authentic market friction models (brokerage, STT, exchange fees, slippage) and benchmark comparisons.
5. **Portfolio Risk Diagnostics**: Automated concentration risk warnings, Value-at-Risk (VaR), Maximum Drawdown (MDD), and beta tracking.

### 1.2 Core Product Principles
* **Honesty Over Hype**: Absolute zero claims of guaranteed returns, foolproof algorithms, or get-rich-quick trading systems.
* **Grounded AI Reasoning**: The AI Analyst cites verified market metrics and filings; speculation and hallucination are strictly prohibited.
* **Cost Efficiency**: Engineered to operate on a **hard ₹0/month ($0/month)** free-first cloud architecture during staging and evaluation, with transparently audited budget ceilings for paid production infrastructure.
* **Data Truth Policy**: Never claim an exchange, ticker, or asset class is supported unless the connected data provider actively supplies verified data for it.

---

## 2. Target Markets & Coverage Boundaries

```
[ Market Coverage Hierarchy ]
Priority 1 (MVP Launch):
  ├── India Equities: NSE & BSE (Nifty 50, Nifty Next 50, Liquid Midcaps)
  └── United States Equities: NYSE & NASDAQ (S&P 500, Nasdaq 100, Mega/Large Caps)

Priority 2 (Post-MVP Expansion — Contingent on Data Licensing):
  ├── United Kingdom: LSE (FTSE 100)
  ├── Europe: Euronext, Deutsche Börse (DAX)
  └── Japan: Tokyo Stock Exchange (Nikkei 225)
```

### 2.1 Geographic Coverage & Localization (MVP)
* **India (NSE & BSE)**: Full coverage of Nifty 50 constituents, Nifty 500, and actively traded stocks. Multi-currency reporting in Indian Rupees (INR, ₹) with Indian numbering systems (Lakhs / Crores) as well as international formatting toggles.
* **United States (NYSE & NASDAQ)**: Coverage of S&P 500, Nasdaq 100, and major liquid equities in US Dollars (USD, $).
* **Global Market Expansion**: Deferred to post-MVP phases. Expansion to European, British, or Asian exchanges will only occur when a licensed data provider with verified coverage and manageable latency is integrated.
* **Provider Coverage Transparency**: If a ticker exists on an unverified, illiquid, or delayed exchange feed, the user interface must prominently display a warning badge: `[Delayed 15m]` or `[EOD Data Only]`.

---

## 3. Regulatory, Legal & Compliance Positioning

### 3.1 Regulatory Guardrails (SEBI & US SEC Compliance)
* **SEBI Compliance (India)**: Positioned strictly as an **Educational, Quantitative Research, and Analytical SaaS** under the SEBI (Investment Advisers) Regulations, 2013 and SEBI (Research Analysts) Regulations, 2014.
  * **No Portfolio Management / Advisory**: MarketPulse does not provide personalized investment advice, customized recommendations, or discretionary account management.
  * **No Direct Order Routing (MVP)**: Automated order execution is strictly disabled to avoid classification as an unauthorized algorithmic trading platform.
* **US SEC / FINRA Compliance**: Complies with the publisher's exemption under Section 202(a)(11) of the Investment Advisers Act of 1940 (impersonal, bona fide investment publications and tools).

### 3.2 Statutory Disclaimers
* A persistent footer and mandatory user confirmation modals prior to viewing ML predictions or backtest simulations:
  > *"MarketPulse is an informational, educational, and quantitative research platform. It does not provide personalized investment, legal, or tax advice. Stock market investing involves substantial risk of loss. Past performance, backtests, and probabilistic machine learning outputs are not indicative of future results."*

---

## 4. User Personas & User Journeys

### 4.1 Target Personas
1. **Persona A: Disciplined Retail Investor (e.g., Indian Tech Professional)**
   * *Profile*: Accumulates shares monthly in Indian equities; requires clean factor ratings, dividend sustainability, and downside risk metrics before allocating capital.
   * *Key Requirement*: Explainable factor scorecards, 52-week valuation ranges, and portfolio concentration warnings.
2. **Persona B: Active Swing / Momentum Trader (e.g., US Equities Trader)**
   * *Profile*: Trades liquid large-caps and momentum stocks over 3-day to 30-day holding windows.
   * *Key Requirement*: Interactive technical charts, relative strength comparisons, and friction-adjusted backtesting.
3. **Persona C: Quantitative & Data-Driven Enthusiast**
   * *Profile*: Explores algorithmic indicators and machine learning models for market insight.
   * *Key Requirement*: Full transparency into model telemetry (ROC-AUC, Brier score, calibration curves, SHAP factor attributions, and baseline comparisons).

### 4.2 Core User Journeys
* **Journey 1: Single-Stock Due Diligence**:
  Search ticker $\rightarrow$ View live market summary $\rightarrow$ Review Factor Health Card (Value, Momentum, Quality, Volatility) $\rightarrow$ Review ML probability and historical accuracy telemetry $\rightarrow$ Read AI Analyst summary $\rightarrow$ Save to Watchlist.
* **Journey 2: Strategy Backtesting & Validation**:
  Select stock/index $\rightarrow$ Set entry/exit logic $\rightarrow$ Run Walk-Forward Backtester with realistic exchange fees and slippage $\rightarrow$ Compare cumulative equity curve against Nifty 50 Buy-and-Hold $\rightarrow$ Export strategy summary.
* **Journey 3: Portfolio Health & Risk Diagnostics**:
  Input current holdings $\rightarrow$ Inspect sector and asset concentration $\rightarrow$ Calculate 1-day 95% Parametric Value-at-Risk (VaR) and Maximum Drawdown $\rightarrow$ Review automated diversification advice.

---

## 5. Scope Phasing: MVP vs. Future Roadmap

```
Phase 1: MVP Foundation (Focused Initial Release)
  ├── 24/7 Cloud Availability & Public Deployment (Next.js + FastAPI + Supabase + Redis)
  ├── Secure User Authentication & Isolated Accounts (Google OAuth + Email via Supabase)
  ├── Global & Domestic Stock Search (India NSE/BSE & US NYSE/NASDAQ)
  ├── Multi-Watchlist Management & Basic Saved Research
  ├── Multi-Stock Comparisons & Correlation Matrix
  ├── LLM-Powered Financial Research Assistant (Grounded Citations, Deterministic Math Separation, Replaceable Interface)
  ├── Basic Technical Analysis & Interactive Candlestick Charts (TradingView Lightweight)
  ├── Risk Insights & Portfolio Health Diagnostics (Portfolio Beta, VaR, Drawdown)
  ├── Historical Walk-Forward Backtester with Transaction Costs (STT, Brokerage, Slippage)
  └── Directional ML Probability Terminal with Baseline Telemetry (No Hype)

Phase 2: Engagement & Advanced Intelligence (Post-MVP)
  ├── Automated Multi-Channel Alerts (Price, Technical Breakouts, Earnings via Email/Webhook)
  ├── News Intelligence & NLP Sentiment Scoring Engine for Indian and US Equities
  ├── Advanced Portfolio Optimization (Mean-Variance, Black-Litterman, Risk Parity)
  ├── Multi-Language UI Localization (Hindi, Spanish, German)
  └── Native Mobile Progressive Web App (PWA)

Phase 3: Institutional & Broker Expansion (Future Vision)
  ├── Official Broker Integrations (Zerodha Kite, Upstox, Interactive Brokers) for 1-Click Order Prep
  ├── Automated Trading & Order Routing (Subject to Regulatory Clearances)
  ├── TradingView Webhook Ingestion for Custom User Strategies
  ├── Direct Licensed Commercial Feed Integration (TrueData, Polygon.io)
  └── Broad Global Exchange Expansion (LSE, Euronext, TSE)
```

### Out-of-Scope for MVP (Strictly Gated)
* **Advanced Portfolio Optimization**: Mean-variance, quadratic programming, and Black-Litterman asset allocation models are deferred to Phase 2.
* **Broker Integrations & Automated Trading**: No order routing, broker API credentials, or auto-trade execution; the MVP remains 100% research and decision-support.
* **Broad Global Market Expansion**: Markets beyond India (NSE/BSE) and US (NYSE/NASDAQ) are deferred until licensed data feeds are secured.
* **Intraday Order Book Analysis**: No tick-by-tick Level 3 order book depth analysis.
* **Derivatives & Crypto**: No options, futures, commodities, or cryptocurrency trading strategies.
* **Paid Subscriptions / Paywalls**: No billing engines or paywalls in the initial launch.

---

## 6. Functional Requirements & Measurable Acceptance Criteria (MVP)

### Module 1: Cloud Architecture, Authentication & Tenancy
* **FR-1.1: 24/7 Cloud Availability**:
  * *Specification*: The web frontend and backend API must be deployed to cloud hosting, accessible globally via public HTTPS, and remain online 24/7 independent of any developer laptop.
  * *Acceptance Criteria*:
    1. Web app resolves publicly with an SSL certificate.
    2. Backend health endpoint (`/api/v1/health`) responds with HTTP 200 and uptime $\ge 99.5\%$ over 30 days.
* **FR-1.2: Staging-First Deployment Rule**:
  * *Specification*: The existing live Streamlit application must remain untouched in production until a separate staging deployment of the new architecture is fully verified.
  * *Acceptance Criteria*:
    1. Staging environment (`staging.marketpulse.app` or preview URL) is tested and validated before any production domain swap.
    2. Zero modification of existing root repository files (`app.py`, `Stock_market.ipynb`, model artifacts).
* **FR-1.3: User Authentication & Tenant Isolation**:
  * *Specification*: Users can create accounts, log in, and maintain private, encrypted data records.
  * *Acceptance Criteria*:
    1. Supports secure Email/Password and Google OAuth authentication via Supabase Auth.
    2. Postgres Row-Level Security (RLS) ensures that User A cannot read, update, or delete User B's portfolios, watchlists, or research notes. Automated security tests must confirm HTTP 403 on attempted cross-tenant requests.

### Module 2: Market Data, Technical & Fundamental Engine
* **FR-2.1: Stock Search & Ticker Resolver**:
  * *Specification*: Unified search supporting ticker symbols and company names for Indian (NSE/BSE) and US (NYSE/NASDAQ) markets.
  * *Acceptance Criteria*:
    1. Typing "Reliance" suggests `RELIANCE.NS` (NSE) and `RELIANCE.BO` (BSE).
    2. Typing "Tesla" suggests `TSLA` (NASDAQ).
    3. Cached symbol resolution returns in $< 150\text{ ms}$.
* **FR-2.2: Interactive Technical Candlestick Charts**:
  * *Specification*: Responsive candlestick charts using TradingView Lightweight Charts with multiple timeframes (1D, 1W, 1M, 1Y, 5Y, All).
  * *Acceptance Criteria*:
    1. Pan and zoom render at 60 FPS without UI freezing.
    2. Scale-invariant technical indicators calculated dynamically: SMA (20, 50, 200), EMA (9, 21), RSI (14), MACD (12, 26, 9), ATR (14), and Bollinger Bands (20, 2).
    3. Displays 52-week high/low boundaries, average volume, and intraday range %.
* **FR-2.3: Fundamental & Valuation Dashboard**:
  * *Specification*: Visual financial ratio cards populated when provided by data feeds.
  * *Acceptance Criteria*:
    1. Displays P/E (TTM), Forward P/E, P/B, Dividend Yield %, Market Cap, Debt/Equity, ROE, and EPS.
    2. If a specific metric is unavailable for a given stock, displays `N/A` with a tooltip explanation rather than 0 or blank.

### Module 3: LLM-Powered Financial Research Assistant (Core MVP Feature)
* **FR-3.1: Conversational Financial Research & Grounded Explanations**:
  * *Specification*: An interactive financial research assistant enabling users to ask free-form due diligence and research questions regarding Indian (NSE/BSE) and US (NYSE/NASDAQ) equities exclusively where verified data is actively available.
  * *Grounding & Inline Citations*:
    1. Responses are strictly grounded in retrieved market data, computed financial metrics, valuation ratios, and legally usable public news sources.
    2. Every factual assertion, price reference, or ratio citation must include an explicit inline data badge or citation tag (e.g., `[Source: NSE Real-Time Feed | Timestamp: 2026-10-23 15:25 IST]`, `[Source: Annual Report FY25]`) with data timestamps.
  * *Strict Separation of Deterministic Math & ML Predictions from LLM Explanations*:
    1. The LLM must **never calculate, compute, estimate, or invent stock prices, technical indicators, financial ratios, citations, or machine learning prediction results**.
    2. All mathematical calculations—including technical indicators (RSI, MACD, Bollinger Bands, ATR), fundamental ratios (P/E, P/B, Debt/Equity, ROE), portfolio risk metrics (Beta, VaR, Drawdown), and ML directional probabilities—are computed deterministically by backend Python quantitative engines (`pandas`, `numpy`, `scipy`) prior to LLM invocation.
    3. The LLM serves strictly as an explainability and narrative synthesis layer, interpreting the verified quantitative payload provided by the backend without hallucinating or modifying numerical values.
  * *Handling Missing / Stale Data & Analytical Uncertainty*:
    1. If required market data, news sources, or financial metrics are unavailable or unverified for a requested ticker, the assistant must explicitly declare the data as unavailable (e.g., `"P/E ratio is unavailable for this ticker from verified providers"`) and explain the analytical uncertainty rather than guessing or interpolating figures.
    2. If market data timestamp is stale ($> 15$ minutes old during market trading hours), the assistant must display a prominent staleness warning badge.
  * *Replaceable Provider Architecture & Local Ollama Compatibility*:
    1. The LLM engine is decoupled behind an abstract, pluggable `AIAnalystProvider` interface, avoiding vendor lock-in to any single proprietary LLM API.
    2. Evaluates currently available cloud models (such as Google Gemini 3.5 Flash-Lite / 3.8 Flash or Groq Llama 3.1) and preserves compatibility for local, self-hosted LLMs (e.g., Ollama running Llama 3 / Mistral) as an optional future offline/private deployment provider.
  * *Zero-Trust Privacy & Confidentiality Guardrails*:
    1. Under no circumstances shall user credentials, account UUIDs, user personal identifiable information (PII), email addresses, or confidential portfolio holdings/balances be transmitted to an external LLM provider without an approved, verified privacy design.
    2. Prompts are restricted exclusively to public ticker symbols, pre-computed technical/fundamental metrics, and public news headlines.
  * *Commercial Availability & Free-Tier Disclaimers*:
    1. Free-tier cloud LLM quotas (e.g. Google AI Studio, Groq) do NOT guarantee 24/7 production availability, low latency, or zero-cost commercial redistribution rights. Production deployment requires explicit budget allocation for paid API tokens.
  * *Measurable Acceptance Criteria*:
    1. *Grounded Answers Test*: 100% of generated research responses cite verified data sources with timestamps; automated validator checks that all quoted figures match backend-calculated metrics within $\pm 0.001\%$.
    2. *Source Validity Test*: Any attempt to elicit citations for non-existent documents or fake filings returns `"Source not available in verified dataset"`.
    3. *Missing Evidence Test*: Querying an unverified, illiquid, or delisted stock returns an explicit uncertainty declaration: `"Verified financial data is unavailable for symbol XYZ"`.
    4. *Rate Limit & Failure Resilience Test*: If the AI provider returns HTTP 429, 503, or times out ($> 10\text{s}$), the UI gracefully falls back to displaying pre-computed deterministic factor scorecards with a clear message: `[AI Synthesis Temporarily Unavailable]`, without crashing the application.
    5. *Data Privacy Audit*: Automated integration test inspects all outbound network payloads to external LLM endpoints and asserts that zero PII, user emails, or portfolio account amounts are present in prompt strings.


### Module 4: Machine Learning Probabilities & Model Telemetry
* **FR-4.1: Calibrated Probability Terminal**:
  * *Specification*: Displays directional movement probabilities with transparent confidence metrics.
  * *Acceptance Criteria*:
    1. Displays UP/DOWN probability gauge with reliability indicators (e.g., "Probability: 52.8% [Low Predictive Edge]").
    2. Features an expandable **Model Telemetry Card** that clearly reports:
       - Historical out-of-sample test results (e.g., 2025 Test ROC-AUC and Brier Score).
       - Zero-rule naive baseline comparison (e.g., "Naive Majority Class Baseline: 58.6% vs Model Accuracy: 42.4%").
       - Top feature drivers (SHAP values or feature importance).
    3. Displays an unavoidable statutory warning: *"Probabilistic statistical estimate based on historical patterns. Not a trade signal or investment recommendation."*

### Module 5: Risk, Portfolio & Backtesting Engine
* **FR-5.1: Multi-Stock Comparison & Correlation Matrix**:
  * *Specification*: Side-by-side comparison of 2 to 5 equities.
  * *Acceptance Criteria*:
    1. Computes pairwise correlation matrix of daily returns over 30, 90, and 365 days.
    2. Overlays normalized percentage performance curves indexed to a base value of 100.
* **FR-5.2: Portfolio Risk Diagnostics**:
  * *Specification*: User portfolio tracker with automated risk analytics.
  * *Acceptance Criteria*:
    1. Users can record holdings (symbol, quantity, purchase price, purchase date).
    2. Computes total portfolio value, unrealized PnL, Portfolio Beta (relative to Nifty 50 or S&P 500), 1-day 95% Parametric Value-at-Risk (VaR), and Maximum Drawdown.
    3. Automatically highlights concentration risk if a single security exceeds 25% of total portfolio value.
* **FR-5.3: Walk-Forward Backtester with Real-World Frictions**:
  * *Specification*: Strategy simulator evaluating moving average crossover and momentum strategies with realistic transaction costs.
  * *Acceptance Criteria*:
    1. Executes chronologically without lookahead bias.
    2. Deducts standard Indian regulatory frictions for delivery equities:
       - STT: 0.1% on buy and sell.
       - Brokerage: ₹20 or 0.03% per trade.
       - Exchange/SEBI turnover charges: 0.003%.
       - Estimated slippage: 0.05% (5 bps).
    3. Reports Net Profit, Annualized Return, Sharpe Ratio (risk-free rate 6.75%), Sortino Ratio, Win Rate %, Maximum Drawdown %, and Benchmark Alpha.

### Module 6: Watchlists & User Research
* **FR-6.1: Multi-Watchlist Management**:
  * *Specification*: Customizable watchlists with real-time cached price quotes.
  * *Acceptance Criteria*:
    1. Users can create up to 10 watchlists with up to 50 securities each.
    2. Displays live price, day change %, 10-day volume ratio, and overall factor score.
    3. Reordering and deletion sync immediately across sessions via Supabase.

---

## 7. Non-Functional Requirements (NFRs)

| NFR Dimension | Metric / Specification | Target Standard |
| :--- | :--- | :--- |
| **Availability** | Server uptime (24/7 cloud availability) | $\ge 99.5\%$ monthly uptime |
| **API Latency** | P95 Response time for cached stock data | $< 250\text{ ms}$ |
| **Cold-Start Time** | Backend container cold-start on free serverless tier | $< 5.0\text{ seconds}$ |
| **Client Bundle Size**| Initial gzipped JavaScript bundle | $< 250\text{ KB}$ |
| **Data Freshness** | EOD data refresh schedule | Within 2 hours of market close (17:30 IST / 18:00 EST) |
| **Concurrency** | Concurrent active users supported on ₹0/mo stack | Up to 100 simultaneous users without rate-limit drops |
| **Accessibility** | Standards compliance | WCAG 2.1 Level AA compliant (dark/light contrast ratio $\ge 4.5:1$) |

---

## 8. Free-First Infrastructure & Market Data Strategy (₹0/Month Staging Budget)

```
[ Free-First Infrastructure Map (Staging & Prototype) ]
Frontend: Cloudflare Pages Free Tier (Preferred for Commercial Static Export: Unlimited Bandwidth, Global CDN)
Backend API: Render Free Container (STAGING / PROTOTYPE RUNTIME ONLY: 512 MB RAM, Shared CPU, 750 hrs/mo)
Database & Auth: Supabase Free Tier (500 MB Postgres, 50,000 Monthly Active Users, RLS Enabled)
In-Memory Cache: Upstash Redis Free Tier (500,000 Commands/Month, 256 MB Storage)
Market Data: Replaceable MarketDataProvider (Public SaaS Launch Blocked until Licensed; Mock & Public CSVs for MVP Dev)
AI Reasoning: Pluggable AIAnalystProvider (Model-Independent Protocol; Google AI Studio / Groq; Local Ollama Compatible)
Monitoring: UptimeRobot (Free 5-min pings to /health) + Sentry (Free 5,000 errors/mo)
```

### 8.1 Detailed Service Limits, Bottlenecks & Reconciled Production Costs

Every cost estimate below separates verified fixed infrastructure, usage-based estimates, and unknown market-data licensing fees:

| Infrastructure Layer | Provider & Tier | Staging Free Allowance | Quota Limits & Inactivity Behavior | Production-Grade Paid Service | Production Cost & Calculation Basis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend CDN** | **Cloudflare Pages** (Preferred) | Unlimited bandwidth & requests | Static export (`output: 'export'`); server-side API routes & SSR disabled | Cloudflare Pages Free ($0) or Vercel Pro ($20/seat/mo) | **$0.00 / month** on Cloudflare Pages *(or $20.00/mo [~₹1,660/mo] on Vercel Pro)* |
| **Backend API** | **Render Free Web Service** (Staging Only) | 512 MB RAM, 0.1 vCPU, 750 free hrs/mo | Spins down after 15 min idle (30–50s cold start). **Not production-grade.** | **Render Starter Web Service** (Always-on, 0.5 CPU, 512 MB RAM) | **$7.00 / month** (~₹581/mo). Official Render pricing: Flat $7.00/mo. |
| **Database & Auth** | **Supabase Free Tier** | 500 MB Postgres, 50,000 MAU | Pauses after 7 days without queries. **No artificial keep-alives allowed.** | **Supabase Pro Tier** (8 GB storage, 100k MAU, 7-day PITR, no pause) | **$25.00 / month** (~₹2,075/mo). Official Supabase pricing: Flat $25.00/mo. |
| **Caching Layer** | **Upstash Redis Free Tier** | 500,000 commands / month, 256 MB RAM | Monthly quota cap; transition occurs if monthly commands exceed 500k (~16,666 req/day) | **Upstash Pay-As-You-Go** ($0.20 per 100k commands above free allowance) | **$0.00 – $4.00 / month** (₹0 – ₹332/mo). Calculation: $0 within 500k/mo; $2–$4 for 1M–2M commands/mo. |
| **AI LLM Inference** | **Pluggable AIAnalystProvider** | Free tier in Google AI Studio / Groq | Rate limits apply; free-tier data logged for model training. Zero PII allowed. | **Paid Standard API Tier** (`gemini-3.5-flash-lite`: $0.30/1M input, $2.50/1M output) | **$0.00 – $51.00 / month** (₹0 – ₹4,233/mo). Calculation: Free in AI Studio; at 30k queries/mo (45M in, 15M out) = $51.00/mo on Standard tier. |
| **Market Data Feeds** | **Mock & Historical CSVs** (Dev/Staging) | Synthetic data generator + public CSVs | **Public SaaS Launch Blocked** until commercial redistribution is licensed | **Authorized Commercial Feed** (NSE/BSE Indian Feed & US Equity Feed) | **[UNKNOWN - Enterprise Quote Required]**. Developer tiers forbid commercial SaaS redistribution. |
| **TOTAL BUDGET SUMMARY** | **Staging Environment** | **Hard Cap: Exactly ₹0.00 / month** | Free-tier staging only | **Production Infrastructure Baseline** | **~$32.00 – $87.00 / month** (~₹2,650 – ₹7,220/mo) + **[UNKNOWN Market Data Fees]** |

### 8.2 Market-Data Provider Strategy & Public Launch Blocker Policy
1. **Public Commercial SaaS Launch Blocker**:
   * **A public commercial SaaS launch is strictly BLOCKED until a market-data provider legally authorizes commercial redistribution for Indian (NSE/BSE) and US (NYSE/NASDAQ) equities.**
   * Initial development, staging, and automated testing strictly rely on `MockMarketDataProvider` (synthetic generator) and `AuthorizedCSVDataProvider` (public historical datasets).
   * Unverified tickers must render: `[Market Data Unavailable - Verified Provider Required]`.
2. **Yahoo Finance Policy**:
   * Yahoo Finance is NOT approved for public commercial SaaS usage.
   * If evaluated in local non-commercial research, we do not assume its long-term reliability, legal commercial-use permissions, or complete data coverage.
3. **Provider Verification Checklist (Before any Commercial Upgrade)**:
   * Document commercial redistribution terms and exchange licensing requirements.
   * Verify latency on Indian (.NS, .BO) and US tickers.
   * Test rate limits and enforce local in-memory L1 cache (`cachetools.TTLCache`) fallback.
4. **Replaceable Provider Interface (`MarketDataProvider`)**:
   ```python
   class MarketDataProvider(ABC):
       @abstractmethod
       async def get_quote(self, symbol: str) -> QuoteData: ...
       @abstractmethod
       async def get_historical_ohlcv(self, symbol: str, timeframe: str) -> pd.DataFrame: ...
       @abstractmethod
       async def search_symbols(self, query: str) -> List[SymbolSearchResult]: ...
   ```
5. **Strict Cost Governance Rule**: **No paid API, paid subscription, or hosting plan upgrade shall be activated without explicit user approval.**

### 8.3 Cold-Start Mitigation & Continuity
* Render Free instances spin down after 15 minutes of inactivity (30–50s cold start).
* **Continuous Staging Availability**: UptimeRobot monitors `/api/v1/health` for uptime reporting. No artificial keep-alive pings are used to bypass third-party inactivity policies. If Supabase pauses after 7 days, 1-click dashboard restore takes ~1–2 minutes.
* **Production Continuity Guarantee**: The live Streamlit app remains the active production deployment until the new architecture passes all acceptance tests in staging and a separately approved production cutover is authorized.

---

## 9. Security, Privacy & Data Isolation

1. **Zero-Trust Tenant Isolation**: Every database table (`portfolios`, `watchlists`, `user_notes`) enforces Postgres Row-Level Security (`auth.uid() = user_id`).
2. **API Protection**:
   * Rate limiting enforced at the FastAPI gateway (e.g., max 60 requests/minute per IP/user).
   * CORS restricted to production and staging domains only (eliminating the security flaw in the original devcontainer).
3. **Secret Management**: Zero secrets committed to source control. API keys and database credentials injected strictly via environment variables.

---

## 10. Cloud Deployment, CI/CD, Observability & Rollback Strategy

### 10.1 Deployment Architecture & Staging Flow
```
Developer Commit ──> GitHub Repo (main branch)
                          │
                  GitHub Actions CI
                  ├── Lint & Type Check (Ruff, ESLint)
                  ├── Unit & Calculation Regression Tests
                  └── Security Dependency Scan
                          │
                  Staging Deployment
                  ├── Staging Frontend (Vercel Preview)
                  └── Staging API (Render Staging)
                          │
                  (User / Verification Gate)
                          │
                  Production Promotion
                  (Live Domain Swap with Zero Downtime)
```

### 10.2 Rollback & Disaster Recovery
* **Frontend**: Instant one-click rollback on Vercel to prior immutable deployment ($< 5\text{ seconds}$).
* **Backend**: Docker containers tagged by Git commit SHA; rollback executes by pointing to the previous container image tag.
* **Database Backups**: Automated daily logical backups via Supabase with Point-in-Time Recovery (PITR).

---

## 11. Success Metrics & Key Performance Indicators (KPIs)

* **Product Engagement**:
  * 30-day user retention rate $\ge 35\%$.
  * $\ge 60\%$ of registered users create and maintain at least one watchlist.
  * Average user session involves $\ge 3$ ticker explorations.
* **Technical Performance**:
  * P95 API response time for cached market data $< 250\text{ ms}$.
  * Cache hit ratio $\ge 85\%$ across market queries.
  * Cloud availability $\ge 99.5\%$ independent of developer hardware.
* **Quantitative Integrity**:
  * Out-of-sample machine learning ROC-AUC and Brier scores tracked on rolling 30-day windows.
  * Strict avoidance of negative alpha: If model accuracy underperforms a coin toss ($< 0.5000$ ROC-AUC), the UI automatically flags low model confidence.

---

## 12. Critical Risks & Mitigation Matrix

| Risk Category | Severity | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **SEBI Regulatory Scrutiny** | **Critical** | Medium | Maintain pure research/analytics posture; eliminate "Buy/Sell" recommendations; use probabilistic factor ratings; enforce mandatory disclaimer modals. |
| **Market Data Throttling (429s)** | **High** | High | Redis caching with 15-minute TTLs during market hours, 12-hour TTLs after market close; multi-provider fallback cascade. |
| **Inaccurate Stock Split Data** | **High** | Medium | Corporate action ratio-adjustment pipeline applied before calculating rolling technicals or ML features. |
| **Free-Tier Memory Limits (512 MB)** | **High** | Medium | Keep ML model artifacts under 5 MB (ONNX / LightGBM) to prevent Out-Of-Memory container kills. |
| **Breaking the Existing App** | **High** | Low | Staging-first deployment; existing `app.py`, notebook, and model artifacts preserved completely untouched. |

---

## 13. Constraints & Governance Checklist

- [x] **1. Separation of MVP from Later Phases**: Clear distinction between MVP (Phase 1) and future enhancements (Phases 2 & 3).
- [x] **2. Staging Hard Budget of ₹0/Month**: All staging/evaluation components operate strictly within free tiers.
- [x] **3. Reconciled Production Ceiling**: Documented production budget ceiling (~$32–$87/mo + vendor-quoted market data fees).
- [x] **4. Initial Target Markets**: India (NSE/BSE) and US (NYSE/NASDAQ) equities prioritized; global markets gated on licensed data availability.
- [x] **5. Public Launch Blocker**: Public commercial SaaS launch strictly blocked until legal market data redistribution agreements are secured.
- [x] **6. LLM Research Assistant Guardrails**: Grounded answers, citations, timestamps, deterministic math separation, privacy protection, and replaceable `AIAnalystProvider` interface.
- [x] **7. Preservation of Existing Live App**: Live Streamlit app (`app.py`, `Stock_market.ipynb`) remains active and untouched in the root directory.
- [x] **8. Untouched Baseline Model Artifacts**: Both `final_stock_model.joblib` (731 MB) and `final_stock_model_50trees.joblib` (38.5 MB) preserved permanently in root.
- [x] **9. LightGBM Milestone Isolation**: Model training and replacement isolated into a separately approved future milestone.
- [x] **10. Strict Non-Execution Rule**: No application code modified, packages installed, models trained, or Git commits pushed during planning.

---

## 14. Resolved Product Decisions & Remaining Open Decisions

### 14.1 Resolved Decisions (User Approved)
1. **MVP Scope Alignment & Financial Research Assistant**:
   * The MVP is strictly focused on: (a) stock search, (b) multi-watchlists, (c) multi-stock comparisons, (d) LLM-powered Financial Research Assistant with grounded citations, (e) interactive technical candlestick charts, (f) risk insights and portfolio health, and (g) historical backtesting with friction modeling.
   * Secure authentication and isolated user accounts are included in the MVP utilizing Supabase Auth free tier and Postgres RLS.
   * The LLM assistant enforces strict separation: all math and ML probabilities are computed deterministically by backend Python quantitative engines; the LLM only synthesizes explanations and never invents prices, metrics, citations, or predictions.
   * Advanced portfolio optimization (mean-variance, Black-Litterman), broker integrations (Zerodha, Upstox, Interactive Brokers), automated order routing, and broad global-market expansion are explicitly deferred to post-MVP phases.
2. **Market-Data Strategy & Public SaaS Launch Blocker**:
   * Public commercial SaaS launch is strictly BLOCKED until a provider legally authorizes commercial redistribution for Indian (NSE/BSE) and US (NYSE/NASDAQ) equities.
   * Initial development and staging rely strictly on `MockMarketDataProvider` and authorized historical CSVs (`AuthorizedCSVDataProvider`).
   * Yahoo Finance is NOT approved for public commercial SaaS usage.
   * Unverified tickers must render: `[Market Data Unavailable - Verified Provider Required]`.
   * Absolutely no paid API, subscription, or hosting upgrade will be activated without explicit user approval.
3. **Frontend & Backend Architecture**:
   * Frontend: Evaluated **Cloudflare Pages** for commercial static export (`output: 'export'`) with Next.js 14+; Vercel Hobby retained only for non-commercial prototyping.
   * Backend: **FastAPI (Python 3.11)** hosted on Render Free as a **staging / prototyping runtime only**; existing Streamlit app preserved as active production until staging acceptance tests pass.
   * Database: **Supabase (PostgreSQL 15 + Supabase Auth)** with Row-Level Security. No keep-alive pings to bypass 7-day pause policies; documented 1-click restore procedure.
   * Cache: **Upstash Serverless Redis** with current official quota of 500,000 commands/month and 256 MB storage (subject to re-verification when setup occurs), backed by mandatory in-process L1 RAM cache (`cachetools.TTLCache`) fallback.
4. **AI Provider & Privacy Architecture**:
   * Pluggable `AIAnalystProvider` interface keeps LLM providers model-independent.
   * Gemini 1.5 Flash is not treated as a verified current choice (superseded in official guidance for new projects). Evaluated current models (`gemini-3.5-flash-lite`, `gemini-3.8-flash`) and preserved local Ollama compatibility as an optional future private provider.
   * Concrete model binding remains explicitly unresolved until verified during Phase 3 setup.
   * Zero-trust privacy: zero user credentials, PII, email addresses, or confidential portfolio holdings are sent to external LLMs.
5. **Preservation & Milestone Isolation**:
   * Existing live application (`app.py`, `Stock_market.ipynb`) and both baseline model artifacts (`final_stock_model.joblib` - 731 MB, `final_stock_model_50trees.joblib` - 38.5 MB) remain completely untouched in the workspace root.
   * LightGBM model training and benchmarking are isolated into a separately approved future milestone.

### 14.2 Remaining Open Decisions & Launch Blockers (For Phase 3 & Beyond)
The following blockers and decisions remain open before commercial launch and will be scoped during Phase 3 (Implementation Planning):
1. **Commercial Market Data Licensing Blocker (Public Launch Blocker)**:
   * Public SaaS launch cannot proceed with live market feeds until formal commercial redistribution quotes and exchange agreements are secured for Indian (NSE/BSE) and US (NYSE/NASDAQ) equities.
   * *Phase 3 Action*: Scope Phase 3 implementation strictly around `MockMarketDataProvider` and `AuthorizedCSVDataProvider`, establishing a verified data provider evaluation checklist as a parallel non-blocking research track.
2. **AI Model Selection & Endpoint Verification**:
   * Concrete model binding will be resolved during Phase 3 setup by testing live endpoint availability and quota limits in Google AI Studio (e.g. testing `gemini-3.5-flash-lite` or alternative providers like Groq).
3. **Upstash Live Quota Verification**:
   * Upstash 500,000 commands/month quota and burst limits must be validated directly against upstash.com/pricing during Phase 3 environment configuration.
4. **Staging Hosting Target Confirmation**:
   * Confirm initial staging deployment target: Cloudflare Pages (with static export) vs. Vercel Preview (for non-commercial team evaluation).
5. **LightGBM Benchmark Milestone Scheduling**:
   * Confirm that the LightGBM training script and experiment execution will be isolated into a dedicated milestone scheduled after the base API, database, and charting UI pass staging validation.


