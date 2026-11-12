export interface KeyTerm {
  term: string;
  definition: string;
  hinglish: string;
}

export interface QuizQuestion {
  question: string;
  questionHinglish: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationHinglish: string;
}

export type VisualType =
  | "market_flow"
  | "order_book_depth"
  | "candlestick_anatomist"
  | "indicator_explorer"
  | "fundamental_waterfall"
  | "risk_calculator"
  | "backtest_visualizer"
  | "portfolio_health_scorecard";

export interface AcademyLesson {
  id: string;
  title: string;
  titleHinglish: string;
  summary: string;
  summaryHinglish: string;
  visualType: VisualType;
  contentEn: string[];
  contentHinglish: string[];
  keyTerms: KeyTerm[];
  quiz: QuizQuestion[];
  practicalExercise: {
    en: string;
    hinglish: string;
  };
}

export interface AcademyLevel {
  level: number;
  id: string;
  title: string;
  titleHinglish: string;
  tagline: string;
  description: string;
  lessons: AcademyLesson[];
}

export const ACADEMY_CURRICULUM: AcademyLevel[] = [
  {
    level: 1,
    id: "level-1-absolute-beginner",
    title: "Level 1: Absolute Beginner",
    titleHinglish: "Level 1: Share Market Ki Shuruat",
    tagline: "The Foundation: Exchanges, Brokers & Ownership",
    description: "Understand fractional company ownership, how exchanges (NSE/BSE, NASDAQ) work, Demat vs Trading accounts, and market sessions.",
    lessons: [
      {
        id: "lvl1-lesson1",
        title: "What is a Share & Why Do Companies Issue Them?",
        titleHinglish: "Share Kya Hota Hai Aur Companies Kyu Bechte Hain?",
        summary: "Understanding fractional ownership, equity capital raising, and Initial Public Offerings (IPOs).",
        summaryHinglish: "Company me hissedari, IPO aur capital raising ka basic logic.",
        visualType: "market_flow",
        contentEn: [
          "A share (or stock) represents fractional ownership in an incorporated company. When you own 100 shares of Reliance Industries or Apple, you legally own a corresponding fraction of its equity, assets, and future cash earnings.",
          "Companies issue shares to raise long-term capital without incurring the fixed interest debt burdens associated with bank loans. An Initial Public Offering (IPO) is the formal event where a private company sells its shares to institutional and retail public investors for the first time on a recognized stock exchange.",
          "Once listed, shares trade in the 'Secondary Market' between investors. The company does not receive money from daily trading; instead, secondary trading provides market price discovery and continuous liquidity for owners.",
        ],
        contentHinglish: [
          "Share ka matlab hota hai kisi company me hissa (fractional ownership). Jab aap Reliance ya TCS ka share kharidte hain, to aap us company ke chote hissedar (part-owner) ban jaate hain.",
          "Companies shares kyu bechti hain? Business bada karne, nayi factories lagane ya loan chukane ke liye unhe bada paisa chahiye hota hai. Bank loan par interest dena padta hai, isliye companies public se paisa raise karne ke liye IPO (Initial Public Offering) lati hain.",
          "IPO ke baad shares stock exchange par list ho jate hain jise 'Secondary Market' kehte hain. Yaha shares aam investors aapas me kharidte aur bechte hain.",
        ],
        keyTerms: [
          {
            term: "Equity / Share",
            definition: "A financial security representing fractional ownership in a corporation.",
            hinglish: "Company ki ownership ka chhota hissa jo share market me trade hota hai.",
          },
          {
            term: "IPO (Initial Public Offering)",
            definition: "The first sale of stock by a private company to the public to raise capital.",
            hinglish: "Pehli baar jab koi private company public se paisa lene ke liye shares issue karti hai.",
          },
          {
            term: "Secondary Market",
            definition: "The public market where existing shares are bought and sold among investors.",
            hinglish: "Rozana chalne wala market jaha investors aapas me shares trade karte hain.",
          },
        ],
        quiz: [
          {
            question: "When you buy shares of a stock on the open market, who receives your money?",
            questionHinglish: "Jab aap open market me kisi stock ka share kharidte hain, to aapka paisa kisko milta hai?",
            options: [
              "The seller who chose to sell their shares on the exchange",
              "The CEO of the company personally",
              "The government tax treasury exclusively",
              "The stock exchange directly as profit",
            ],
            correctIndex: 0,
            explanation: "In the secondary market, you buy shares from another investor or institutional participant selling their holdings. The exchange and clearing house facilitate settlement.",
            explanationHinglish: "Secondary market me aap dusre investor se share kharidte hain jo bechna chahta hai. Paisa seller ko milta hai (frictions katne ke baad).",
          },
          {
            question: "Why do companies choose an IPO instead of taking a bank loan?",
            questionHinglish: "Companies bank loan ke bajaye IPO kyu chunti hain?",
            options: [
              "Equity capital does not carry mandatory monthly interest debt obligations",
              "IPOs are guaranteed to make share prices go up forever",
              "Bank loans are illegal for companies with over 100 employees",
              "The stock exchange pays the company free monthly grants",
            ],
            correctIndex: 0,
            explanation: "Equity capital gives the company permanent capital without mandatory interest obligations, distributing operational risks among public shareholders.",
            explanationHinglish: "Equity capital par bank loan ki tarah har mahine interest nahi dena padta, isse company par debt ka pressure nahi banta.",
          },
        ],
        practicalExercise: {
          en: "Inspect the Market Ecosystem diagram below. Trace how an order flows from your bank balance into fractional share ownership.",
          hinglish: "Neeche diye gaye Market Ecosystem diagram ko dekhein aur samjhein ki bank se paisa share me kaise convert hota hai.",
        },
      },
      {
        id: "lvl1-lesson2",
        title: "Exchanges, Brokers & Demat Accounts",
        titleHinglish: "Exchanges (NSE/BSE), Brokers Aur Demat Account Ka Role",
        summary: "The ecosystem: NSE/BSE, registered brokers, depositories (CDSL/NSDL), and T+1 rolling settlement.",
        summaryHinglish: "NSE/BSE exchanges, CDSL/NSDL digital tijori aur broker ka rasta.",
        visualType: "market_flow",
        contentEn: [
          "Stock Exchanges (NSE - National Stock Exchange, BSE - Bombay Stock Exchange in India; NYSE and NASDAQ in the US) are organized, heavily regulated venues where buyers and sellers match trade orders transparently.",
          "Retail investors cannot connect directly to an exchange floor or matching engine. You must use a registered Stock Broker (e.g. Zerodha, Groww, Angel One, Interactive Brokers) who executes orders on your behalf.",
          "Your shares are not held by your broker! In India, shares are safely deposited into your Demat Account held at central national depositories: NSDL or CDSL. If your broker goes bankrupt, your shares remain 100% safe in your Demat account.",
          "India operates on a modern T+1 settlement cycle: if you buy shares on Monday, settlement completes and shares arrive in your Demat account on Tuesday.",
        ],
        contentHinglish: [
          "Stock Exchanges (jaise Bharat me NSE aur BSE, US me NASDAQ/NYSE) wo marketplace hain jaha buyers aur sellers milte hain aur transparent rates par trade hota hai.",
          "Aap directly exchange par jakar share nahi kharid sakte. Aapko ek SEBI-registered Broker (jaise Zerodha, Groww) ke through order place karna hota hai jo exchange tak order le jata hai.",
          "Sabse zaroori baat: Aapke shares broker ke paas nahi rehte! Shares aapke Demat Account me rehte hain jo CDSL ya NSDL (national depositories) ke paas electronically safe hote hain. Broker band bhi ho jaye, to bhi aapke shares 100% safe hain.",
          "Bharat me T+1 settlement chalta hai: agar aapne Monday ko delivery buy ki, to Tuesday tak shares aapke Demat account me transfer ho jate hain.",
        ],
        keyTerms: [
          {
            term: "Demat Account",
            definition: "Dematerialized account that holds securities electronically with CDSL or NSDL.",
            hinglish: "Digital tijori jisme shares electronic form me safe store hote hain.",
          },
          {
            term: "Trading Account",
            definition: "The brokerage interface used to place buy and sell execution orders.",
            hinglish: "Broker ka portal/app jaha se aap buy aur sell ke orders lagate hain.",
          },
          {
            term: "T+1 Settlement",
            definition: "Trade date plus one business day for funds and securities to transfer.",
            hinglish: "Trade hone ke agle business day par share aur paise ka settlement complete hona.",
          },
        ],
        quiz: [
          {
            question: "If your stock broker closes down or files for insolvency, what happens to the shares you own?",
            questionHinglish: "Agar aapka broker band ho jaye ya diwaliya ho jaye, to aapke kharide hue shares ka kya hota hai?",
            options: [
              "Your shares remain safe because they are custodied with CDSL/NSDL in your Demat account",
              "You lose all your shares permanently",
              "The stock exchange confiscates your shares for its own reserves",
              "You must repay the purchase price to the government to recover them",
            ],
            correctIndex: 0,
            explanation: "Shares are legally owned by you and deposited directly with national depositories (CDSL/NSDL), completely segregated from the broker's corporate balance sheet.",
            explanationHinglish: "Shares CDSL ya NSDL depository ke paas aapke Demat account me safe rehte hain, broker ke paas nahi. Isliye aapka investment safe rehta hai.",
          },
        ],
        practicalExercise: {
          en: "Toggle between the Indian (NSE/CDSL) and US (NASDAQ/DTC) regulatory models in the interactive diagram.",
          hinglish: "Interactive diagram me Indian (NSE/CDSL) aur US models ko switch karke ecosystem flow ko dekhein.",
        },
      },
      {
        id: "lvl1-lesson3",
        title: "Market Indices: NIFTY 50 & SENSEX",
        titleHinglish: "Market Index Kya Hai? NIFTY 50 Aur SENSEX",
        summary: "Understanding benchmark market barometers, free-float market capitalization, and sector baskets.",
        summaryHinglish: "Index poore market ki tabiyat batane wala thermometer kaise banta hai.",
        visualType: "market_flow",
        contentEn: [
          "A stock market index is a statistical basket of selected stocks that tracks the performance of a specific market segment, sector, or the broader economy.",
          "The NIFTY 50 represents 50 of the largest, most liquid companies listed on the NSE across 13 sectors. The SENSEX (BSE 30) represents 30 established blue-chip giants listed on the Bombay Stock Exchange.",
          "Most major indices use the 'Free-Float Market Capitalization' weighting methodology. This means larger publicly tradable companies (like Reliance or HDFC Bank) have a higher proportional influence on the index movement than smaller constituents.",
        ],
        contentHinglish: [
          "Index market ka 'thermometer' hota hai. Har ek share ko alag-alag dekhne ke bajaye index dekhkar pata chal jata hai ki market overall upar ja raha hai ya neeche.",
          "NIFTY 50 me NSE par listed 50 sabse badi aur liquid companies hoti hain. SENSEX me BSE ki 30 sabse badi blue-chip companies hoti hain.",
          "Index 'Free-Float Market Cap' par chalta hai: jisme public ke liye tradable shares ka size dekha jata hai. Badi company ke price move ka index par zyada asar padta hai.",
        ],
        keyTerms: [
          {
            term: "Benchmark Index",
            definition: "A reference index (e.g. NIFTY 50, S&P 500) used to measure general market movement.",
            hinglish: "Standard index jisse market ki overall disha aur funds ka performance naapa jata hai.",
          },
          {
            term: "Free-Float Market Cap",
            definition: "Market value of a company excluding locked promoter and government shares.",
            hinglish: "Sirf un shares ki market value jo aam public aur market me freely trade ho sakte hain.",
          },
        ],
        quiz: [
          {
            question: "Why does a 2% move in Reliance Industries affect NIFTY 50 more than a 2% move in a smaller constituent?",
            questionHinglish: "Reliance me 2% move NIFTY 50 ko kisi choti company se zyada kyu hilata hai?",
            options: [
              "Reliance has a much higher free-float market capitalization weighting in the index basket",
              "Reliance shares trade on a different specialized exchange",
              "Reliance is the only stock allowed to move during morning hours",
              "The index formula artificially doubles moves for telecom companies",
            ],
            correctIndex: 0,
            explanation: "Because NIFTY 50 is free-float market-cap weighted, larger companies carry larger percentage weights in the index calculation formula.",
            explanationHinglish: "Kyunki NIFTY 50 free-float market-cap weighted hota hai, badi company ka index me weightage percentage zyada hota hai.",
          },
        ],
        practicalExercise: {
          en: "Compare NIFTY 50 vs SENSEX composition in the Market Overview tab.",
          hinglish: "Main dashboard me jakar NIFTY 50 constituents aur unke weights ko observe karein.",
        },
      },
    ],
  },
  {
    level: 2,
    id: "level-2-market-fundamentals",
    title: "Level 2: Market Fundamentals & Order Mechanics",
    titleHinglish: "Level 2: Market Ke Niyam Aur Orders",
    tagline: "The Order Book: Bid, Ask, Spread & Execution",
    description: "Master the mechanics of order matching, market vs limit orders, liquidity depth, and corporate action adjustments.",
    lessons: [
      {
        id: "lvl2-lesson1",
        title: "Bid, Ask & The Spread",
        titleHinglish: "Bid, Ask Aur Spread: Khariddar Aur Bechnewale Ka Antar",
        summary: "The continuous two-way auction: highest bid vs lowest ask, spread costs, and market depth.",
        summaryHinglish: "Kharidne aur bechne ki prices me antar kyu hota hai aur liquidity ka kya asar hai.",
        visualType: "order_book_depth",
        contentEn: [
          "Every stock market transaction is a two-way auction. The Bid is the highest price a buyer is currently willing to pay. The Ask (or Offer) is the lowest price a seller is currently willing to accept.",
          "The Bid-Ask Spread is the difference: Spread = Ask - Bid. In highly liquid blue-chip stocks (like TCS or Apple), the spread is often just 0.05% or a few paise. In illiquid micro-caps, the spread can be 2% to 5% wide.",
          "The spread represents an immediate friction cost. If you buy at the Ask and instantly sell at the Bid, you lose the spread value even if the market price hasn't shifted.",
        ],
        contentHinglish: [
          "Market me hamesha do rate chalte hain: Bid wo highest price hai jo buyer dene ko tayar hai, aur Ask wo lowest price hai jo seller lene ko tayar hai.",
          "Spread ka matlab hota hai (Ask - Bid). Agar Reliance ka Ask ₹2,450.50 hai aur Bid ₹2,450.00 hai, to spread 50 paise hai. Liquid stocks me spread chhota hota hai, illiquid stocks me spread bada hota hai.",
          "Spread ek chhipa hua kharcha hota hai: agar aap turant market rate par kharidte hain aur turant bechte hain, to spread ka loss ho jata hai.",
        ],
        keyTerms: [
          {
            term: "Bid Price",
            definition: "The highest available price a buyer is willing to pay right now.",
            hinglish: "Khariddar (buyer) dwara offer ki gayi sabse badi price.",
          },
          {
            term: "Ask / Offer Price",
            definition: "The lowest available price a seller is willing to accept right now.",
            hinglish: "Bechnewala (seller) dwara maangi gayi sabse kam price.",
          },
          {
            term: "Bid-Ask Spread",
            definition: "The gap between the lowest ask and the highest bid price.",
            hinglish: "Ask aur Bid ke beech ka antar jo market liquidity ko darshata hai.",
          },
        ],
        quiz: [
          {
            question: "If Stock XYZ has a Bid of ₹100.00 and an Ask of ₹102.00, what happens if you place an immediate Market Buy order?",
            questionHinglish: "Agar stock ka Bid ₹100 hai aur Ask ₹102 hai, to Market Buy order lagane par kya hoga?",
            options: [
              "Your order immediately executes at ₹102.00 (the lowest seller's price)",
              "Your order immediately executes at ₹100.00 (the buyer's price)",
              "The exchange averages the two and executes at ₹101.00",
              "The order cancels automatically due to a gap",
            ],
            correctIndex: 0,
            explanation: "A market buy order demands immediate execution and matches against the lowest existing seller in the order book (the Ask price, ₹102.00).",
            explanationHinglish: "Market Buy order turant execute hota hai aur sabse pehle maujood seller se match hota hai jo ki Ask price (₹102) par bech raha hai.",
          },
        ],
        practicalExercise: {
          en: "Adjust the order book simulator slider below to see how increasing trade size impacts execution through multiple depth levels.",
          hinglish: "Neeche Order Book simulator me trade size badhakar dekhein ki order depth me kaise match hota hai.",
        },
      },
      {
        id: "lvl2-lesson2",
        title: "Order Types: Market, Limit & Stop-Loss",
        titleHinglish: "Order Ke Types: Market, Limit Aur Stop-Loss",
        summary: "Execution certainty vs price certainty: Market Orders, Limit Orders, Stop-Loss (SL), and SL-Market.",
        summaryHinglish: "Kab Market order lagana chahiye aur kab Limit/SL order se apna paisa bachana chahiye.",
        visualType: "order_book_depth",
        contentEn: [
          "Market Order: Demands immediate execution regardless of price. Advantage: guaranteed execution. Risk: vulnerable to slippage, especially during volatile openings or in illiquid names.",
          "Limit Order: Specifies the maximum price you are willing to pay (or minimum price you are willing to sell for). Advantage: absolute price certainty. Risk: order may never fill if price runs away.",
          "Stop-Loss Order (SL): An order that activates only when a specified trigger price is hit. It is your non-negotiable emergency brake to cut downside risk before a bad trade ruins your account.",
        ],
        contentHinglish: [
          "Market Order: Turant execution chahiye chahe jo rate mile. Fayda: share turant milta hai. Nuksan: volatile market me price slippage lag sakti hai.",
          "Limit Order: Aap apni manpasand price tay karte hain ('mai ₹500 se zyada nahi dunga'). Fayda: price safe rehti hai. Nuksan: agar price waha tak nahi aayi to order pending reh jayega.",
          "Stop-Loss Order (SL): Ye aapka safety belt hai! Trigger price set ki jati hai, jisse jaise hi share price gir kar us level par aati hai, order automatically exit ho jata hai aur bada loss hone se bacha leta hai.",
        ],
        keyTerms: [
          {
            term: "Market Order",
            definition: "An order to buy or sell immediately at current available market prices.",
            hinglish: "Turant maujooda price par trade execute karne ka order.",
          },
          {
            term: "Limit Order",
            definition: "An order to buy or sell only at a specified price or better.",
            hinglish: "Apni manpasand limit price par hi buy ya sell karne ka order.",
          },
          {
            term: "Stop-Loss (SL)",
            definition: "An order designed to limit an investor's loss on a position once a threshold price is reached.",
            hinglish: "Bade loss se bachne ke liye pehle se set kiya gaya automated exit order.",
          },
        ],
        quiz: [
          {
            question: "Why do disciplined professional traders use Limit Orders instead of Market Orders in volatile markets?",
            questionHinglish: "Volatile market me professional traders Market order ke bajaye Limit order kyu prefer karte hain?",
            options: [
              "To prevent unfavorable slippage and ensure they do not pay an inflated price",
              "Because Limit orders are guaranteed to execute 100% of the time",
              "Because Limit orders bypass exchange transaction taxes",
              "Because market orders require in-person bank verification",
            ],
            correctIndex: 0,
            explanation: "Limit orders protect traders from unexpected price spikes or slippage in fast-moving markets by guaranteeing execution only at the chosen price or better.",
            explanationHinglish: "Limit order lene se price certainty rehti hai aur slippage ka khatra nahi hota.",
          },
        ],
        practicalExercise: {
          en: "Simulate placing both a Market Order and a Limit Order in the Paper Trading Sandbox tab.",
          hinglish: "Paper Trading Sandbox tab me jakar Market order aur Limit order dono place karke dekhein.",
        },
      },
      {
        id: "lvl2-lesson3",
        title: "Dividends, Stock Splits & Bonus Shares",
        titleHinglish: "Dividends, Stock Splits Aur Corporate Actions",
        summary: "Understanding ex-dates, stock splits, bonuses, and why share prices adjust mathematically.",
        summaryHinglish: "Jab share split hota hai ya dividend milta hai to stock price adjust kyu hoti hai.",
        visualType: "order_book_depth",
        contentEn: [
          "When a company generates surplus profits, it can either reinvest them in business growth or distribute cash to shareholders as a Dividend.",
          "Ex-Dividend Date: The cutoff date. If you buy shares on or after the ex-date, you do not receive the dividend. On the ex-date morning, the stock price automatically opens lower by the exact dividend amount.",
          "Stock Split: A company divides its existing shares to improve affordability (e.g., a 1:2 split turns one ₹2,000 share into two ₹1,000 shares). Total market value and your percentage ownership remain completely unchanged.",
        ],
        contentHinglish: [
          "Dividend: Company apne munafay (profits) ka ek hissa cash ke roop me shareholders ke bank account me bhejti hai.",
          "Ex-Dividend Date: Is din subah stock price dividend ke barabar adjust (kam) ho kar khulta hai, kyunki company ke khazane se utna cash nikal chuka hota hai.",
          "Stock Split: Maan lijiye ₹2,000 ka share hai, agar company 1:2 split karti hai to aapko 1 ke badle 2 shares milenge aur price ₹1,000 ho jayegi. Aapki total investment value bilkul same rehti hai, bas shares ki sankhya badh jati hai.",
        ],
        keyTerms: [
          {
            term: "Dividend Yield",
            definition: "Annual dividend per share divided by the current share price, expressed as %.",
            hinglish: "Share price ke mukable saal bhar me kitna percent cash dividend mila.",
          },
          {
            term: "Stock Split",
            definition: "Corporate action increasing share count while proportionally decreasing price.",
            hinglish: "Shares ki sankhya badhana aur price proportionally kam karna taaki liquidity badhe.",
          },
        ],
        quiz: [
          {
            question: "If you own 50 shares of a company trading at ₹1,000 and it executes a 1:2 stock split, what is your position afterward?",
            questionHinglish: "Agar aapke paas ₹1,000 ke 50 shares hain aur 1:2 split hota hai, to aapki nayi position kya hogi?",
            options: [
              "100 shares trading at ₹500 each (Total value ₹50,000)",
              "100 shares trading at ₹1,000 each (Total value ₹1,00,000)",
              "25 shares trading at ₹2,000 each (Total value ₹50,000)",
              "50 shares trading at ₹500 each (Total value ₹25,000)",
            ],
            correctIndex: 0,
            explanation: "In a 1:2 split, the number of shares doubles (50 × 2 = 100) while the price halves (₹1,000 / 2 = ₹500). Total portfolio value remains exactly ₹50,000.",
            explanationHinglish: "1:2 split me shares double ho jate hain (50 -> 100) aur price aadhi ho jati hai (₹1,000 -> ₹500). Total value ₹50,000 hi rehti hai.",
          },
        ],
        practicalExercise: {
          en: "Observe how RELIANCE.NS reflected its 1:1 bonus split in the Price Chart tab.",
          hinglish: "Price chart me observe karein ki corporate actions ke baad price kaise adjust hoti hai.",
        },
      },
    ],
  },
  {
    level: 3,
    id: "level-3-reading-charts",
    title: "Level 3: Reading Candlesticks & Price Action",
    titleHinglish: "Level 3: Candlestick Charts Aur Price Action Samajhna",
    tagline: "Decoding the Battle: Open, High, Low, Close & Wicks",
    description: "Learn Japanese candlestick anatomy, wicks vs body, support/resistance zones, volume validation, and false breakout traps.",
    lessons: [
      {
        id: "lvl3-lesson1",
        title: "Anatomy of a Candlestick (OHLC)",
        titleHinglish: "Candlestick Ki Body Aur Wicks (OHLC)",
        summary: "Body, upper shadow, lower shadow, bullish green vs bearish red, and rejection wicks.",
        summaryHinglish: "Candle ka open, high, low, close aur wicks buyer-seller ka mukabla kaise dikhate hain.",
        visualType: "candlestick_anatomist",
        contentEn: [
          "A Japanese candlestick displays four critical price points for a specific timeframe (e.g. 5 minutes, 1 hour, or 1 day): Open, High, Low, and Close (OHLC).",
          "The colored rectangle is the Real Body. A green (or white) body means Close > Open (buyers were in control). A red body means Close < Open (sellers pushed price down).",
          "The thin lines extending above and below are Shadows (or Wicks). The upper wick shows the highest price reached before sellers rejected it. The lower wick shows the lowest dip before buyers stepped in with demand.",
        ],
        contentHinglish: [
          "Candlestick chart 4 prices dikhata hai: Open, High, Low, aur Close (OHLC). Ek candle kisi bhi timeframe ki ho sakti hai (jaise 5 minute ya 1 din).",
          "Candle ka mota hissa 'Real Body' kehlata hai. Green candle ka matlab hai Close price Open se upar hai (buyers jeet gaye). Red candle ka matlab Close price Open se neeche hai (sellers haawi the).",
          "Upar aur neeche ki patli lines ko 'Wicks' ya 'Shadows' kehte hain. Lambi lower wick ka matlab hai ki price neeche giri thi lekin buyers ne zabardast kharidari karke wapas upar kheench liya (Buying Rejection).",
        ],
        keyTerms: [
          {
            term: "Real Body",
            definition: "The rectangular area between the Open and Close prices of a candlestick.",
            hinglish: "Candle ka Open aur Close ke beech ka main bhag.",
          },
          {
            term: "Wick / Shadow",
            definition: "The line representing the intra-period High and Low extremes.",
            hinglish: "Candle ki patli dandi jo session ke highest aur lowest points ko darshati hai.",
          },
          {
            term: "Hammer / Pin Bar",
            definition: "A candle with a small body and a long lower wick signaling rejection of lower prices.",
            hinglish: "Chhoti body aur lambi lower wick wali candle jo neeche se rejection dikhati hai.",
          },
        ],
        quiz: [
          {
            question: "What does a candlestick with a very long lower shadow (wick) and a tiny body at the top indicate?",
            questionHinglish: "Ek candle jisme lambi lower wick ho aur upar choti body ho, wo kya darshati hai?",
            options: [
              "Sellers tried to drive prices lower, but strong buyer demand stepped in and pushed prices back up",
              "Sellers were in complete control throughout the entire session",
              "The exchange had no trades during that session",
              "The company reported a major loss that was hidden",
            ],
            correctIndex: 0,
            explanation: "A long lower wick shows aggressive price rejection: bears pushed price down, but bulls overpowered them and bought the dip before the close.",
            explanationHinglish: "Lambi lower wick dikhati hai ki sellers ne girane ki koshish ki lekin buyers ne aggressively kharid kar price ko wapas upar utha diya.",
          },
        ],
        practicalExercise: {
          en: "Use the Candlestick Anatomist below to slide the Close price above the Open and see the color transform from bearish red to bullish green.",
          hinglish: "Neeche Candlestick Anatomist me sliders ko adjust karke candle ki body aur wicks ka behavior dekhein.",
        },
      },
      {
        id: "lvl3-lesson2",
        title: "Support, Resistance & Trendlines",
        titleHinglish: "Support Aur Resistance Zones: Price Kaha Rukti Hai",
        summary: "Psychological price memory: demand floors (support) and supply ceilings (resistance).",
        summaryHinglish: "Support jaha buyers aate hain aur Resistance jaha sellers dump karte hain.",
        visualType: "candlestick_anatomist",
        contentEn: [
          "Support is a price level where downward momentum tends to pause or reverse because buying interest (demand) is strong enough to overcome selling pressure.",
          "Resistance is a ceiling where upward momentum halts because selling interest (supply) overcomes buying pressure.",
          "Role Reversal Principle: Once a solid resistance level is decisively broken to the upside, it often flips into a new support floor on subsequent pullbacks.",
        ],
        contentHinglish: [
          "Support wo floor (farsh) hai jaha price aakar rukti hai kyunki waha buyers ko share sasta lagta hai aur demand badh jati hai.",
          "Resistance wo ceiling (chhat) hai jaha price aakar gir jati hai kyunki sellers waha apna profit book karte hain ya bechte hain.",
          "Role Reversal: Jab ek strong Resistance toot jata hai (breakout), to wahi level aage chalkar naya Support ban jata hai.",
        ],
        keyTerms: [
          {
            term: "Support Level",
            definition: "A price zone with concentrated buying demand that prevents further decline.",
            hinglish: "Wo level jaha buying aane se price girna ruk jati hai.",
          },
          {
            term: "Resistance Level",
            definition: "A price zone with concentrated supply where advances tend to stall.",
            hinglish: "Wo level jaha selling aane se price upar nahi ja paati.",
          },
        ],
        quiz: [
          {
            question: "When a stock breaks above an established resistance level with high volume, what does that former resistance often become?",
            questionHinglish: "Jab koi stock bade volume ke sath resistance todta hai, to wo level aage chalkar kya ban sakta hai?",
            options: [
              "A new support level during subsequent pullbacks",
              "An automatic halt level mandated by the exchange",
              "A guaranteed point where the stock will drop to zero",
              "A level where trading is permanently banned",
            ],
            correctIndex: 0,
            explanation: "Under technical market principles, previous resistance often converts to support because market participants who missed the breakout look to buy on a retest.",
            explanationHinglish: "Breakout ke baad puraana resistance naya support ban jata hai kyunki log retest par kharidna chahte hain.",
          },
        ],
        practicalExercise: {
          en: "Toggle horizontal levels in the visual sandbox to identify historical swing highs and swing lows.",
          hinglish: "Visual sandbox me support/resistance levels ko toggle karke swing highs aur lows ko dekhein.",
        },
      },
      {
        id: "lvl3-lesson3",
        title: "Volume & False Breakouts (Traps)",
        titleHinglish: "Volume Ka Sach Aur False Breakouts Se Kaise Bachein",
        summary: "Institutional footprint: why volume validates price action and how low-volume breakouts fail.",
        summaryHinglish: "Bina volume ke breakout par entry lene se trap kyu lagta hai.",
        visualType: "candlestick_anatomist",
        contentEn: [
          "Volume represents the total number of shares traded in a period. Price shows what the market is doing; volume reveals how much conviction and institutional capital stands behind it.",
          "A valid breakout above resistance must be accompanied by significantly above-average volume. This indicates institutional accumulation.",
          "If price breaches a resistance level on anemic or falling volume, it is frequently a 'Bull Trap' engineered by market makers to trigger retail stop orders before reversing downward.",
        ],
        contentHinglish: [
          "Volume ka matlab hai us candle ke dauran kitne shares trade hue. Price dikhati hai kya hua, lekin volume batata hai ki kitne bade institutions usme involve the.",
          "Saccha breakout tab hota hai jab price ke sath volume bhi bohot high ho. Iska matlab bade khilari kharid rahe hain.",
          "Agar bina volume ke price resistance ke upar jati hai, to wo akshar 'Bull Trap' hota hai: retail traders ko fasa kar market wapas neeche gir jati hai.",
        ],
        keyTerms: [
          {
            term: "Volume",
            definition: "The total quantity of shares transacted over a specific interval.",
            hinglish: "Ek nishchit samay me trade hue kul shares ki sankhya.",
          },
          {
            term: "Bull Trap (False Breakout)",
            definition: "A false signal where price breaks resistance on weak volume and swiftly reverses downward.",
            hinglish: "Ek nakli breakout jo buyers ko attract karke turant collapse ho jata hai.",
          },
        ],
        quiz: [
          {
            question: "Why is a breakout on low, declining volume considered high risk?",
            questionHinglish: "Kam volume par aane wala breakout high risk kyu maana jata hai?",
            options: [
              "It indicates a lack of institutional buying conviction, making a swift reversal likely",
              "Because exchanges fine traders who trade on low volume",
              "Because low volume causes stock splits to fail",
              "Because low volume changes the stock's registered ticker",
            ],
            correctIndex: 0,
            explanation: "Without institutional capital commitment backing the move, low-volume breakouts fail to sustain upward momentum and easily reverse into retail traps.",
            explanationHinglish: "Kam volume ka matlab hai bade institutions ka support nahi hai, isliye price jaldi reverse ho sakti hai.",
          },
        ],
        practicalExercise: {
          en: "Check the volume bars below the price line on the main Research & Charts page.",
          hinglish: "Main chart par jakar candlestick ke neeche volume bars ko compare karein.",
        },
      },
    ],
  },
  {
    level: 4,
    id: "level-4-technical-analysis",
    title: "Level 4: Technical Analysis & Indicators",
    titleHinglish: "Level 4: Technical Indicators Aur Unki Limitations",
    tagline: "Mathematical Formulas: SMA, EMA, RSI, MACD & Bands",
    description: "Master moving averages, Wilder's RSI, MACD histograms, Bollinger Bands, ATR, and understand the critical dangers of indicator lag.",
    lessons: [
      {
        id: "lvl4-lesson1",
        title: "Moving Averages: SMA vs EMA",
        titleHinglish: "Moving Averages: SMA Aur EMA Me Kya Antar Hai?",
        summary: "Arithmetic mean (SMA) vs exponential weighting (EMA), lag tradeoffs, and trend direction.",
        summaryHinglish: "Average price se trend pehchanna aur lag ka dhyan rakhna.",
        visualType: "indicator_explorer",
        contentEn: [
          "A Simple Moving Average (SMA) calculates the unweighted arithmetic mean of closing prices over N periods: SMA = (P1 + P2 + ... + PN) / N.",
          "An Exponential Moving Average (EMA) applies more weight to recent prices using a smoothing multiplier: Multiplier = 2 / (N + 1). As a result, EMA reacts much faster to recent price turns than SMA.",
          "The Golden Cross occurs when a fast moving average (e.g. 50-day SMA) crosses above a slow moving average (e.g. 200-day SMA). The Death Cross is the opposite, signaling long-term structural weakness.",
        ],
        contentHinglish: [
          "SMA (Simple Moving Average) pichle N dino ki closing prices ka simple average hota hai. Ye trend ko smooth karke dikhata hai.",
          "EMA (Exponential Moving Average) taaza (recent) prices ko zyada weightage deta hai. Is wajah se EMA price ke mudne par SMA se tezi se react karta hai.",
          "Golden Cross tab hota hai jab fast average (jaise 50-day) slow average (jaise 200-day) ko neeche se kaat kar upar nikal jata hai. Death Cross iska ulta hota hai.",
        ],
        keyTerms: [
          {
            term: "SMA (Simple Moving Average)",
            definition: "The arithmetic average of closing prices over a specified rolling window.",
            hinglish: "Pichle kuch dino ki prices ka simple mathematical average.",
          },
          {
            term: "EMA (Exponential Moving Average)",
            definition: "A moving average placing higher mathematical weight on recent observations.",
            hinglish: "Recent prices ko zyada importance dene wala fast moving average.",
          },
          {
            term: "Golden Cross",
            definition: "Bullish chart signal when a short-term moving average crosses above a long-term moving average.",
            hinglish: "Fast moving average ka slow moving average ke upar nikalna (bullish signal).",
          },
        ],
        quiz: [
          {
            question: "Why does a 20-day EMA react faster to an earnings surprise than a 20-day SMA?",
            questionHinglish: "20-day EMA kisi nayi news par 20-day SMA se tez react kyu karta hai?",
            options: [
              "EMA assigns an exponentially higher weighting to the most recent daily price observations",
              "SMA excludes the highest price of the month",
              "EMA incorporates future expected dividends into its formula",
              "SMA is calculated only twice a week",
            ],
            correctIndex: 0,
            explanation: "The EMA formula uses a weighting multiplier that heavily weights recent bars, allowing it to turn faster than an unweighted SMA.",
            explanationHinglish: "EMA ka formula taaza data ko zyada weight deta hai, isliye wo turn hone me SMA jitna time nahi lagata.",
          },
        ],
        practicalExercise: {
          en: "Use the Indicator Explorer slider to toggle between a 20-day SMA and a 20-day EMA to observe the lag gap.",
          hinglish: "Neeche slider me 20 SMA aur 20 EMA ke beech ke lag difference ko dekhein.",
        },
      },
      {
        id: "lvl4-lesson2",
        title: "Momentum: RSI (Wilder's Formula) & MACD",
        titleHinglish: "RSI Aur MACD Se Momentum Samajhna",
        summary: "14-day Wilder smoothing, the myth of 70/30 levels in strong trends, and MACD signal lines.",
        summaryHinglish: "RSI 70 ke upar matlab hamesha bechna nahi hota! Trend me RSI lamba stay kar sakta hai.",
        visualType: "indicator_explorer",
        contentEn: [
          "RSI was formulated by J. Welles Wilder: RSI = 100 - [100 / (1 + RS)], where RS is the exponential average of gains divided by average of losses over 14 periods.",
          "Beginner Myth: 'RSI > 70 is overbought, sell immediately.' In reality, during an explosive institutional bull trend, RSI can stay pinned between 70 and 85 for weeks while the price doubles. Selling strictly because RSI is 72 causes massive missed winners.",
          "MACD (Moving Average Convergence Divergence): MACD Line = 12-day EMA - 26-day EMA. The Signal Line is a 9-day EMA of the MACD Line. When the MACD line crosses above the signal line, positive momentum is expanding.",
        ],
        contentHinglish: [
          "RSI (Relative Strength Index) 0 se 100 ke beech ghoomta hai aur 14-period average gain vs average loss ko naapta hai.",
          "Sabse badi galti: 'RSI 70 ho gaya to turant bech do'. Strong bull run me RSI lagatar 70 se 85 ke beech rehta hai aur share double ho jata hai! Sirf RSI 70 dekh kar short karna fatal ho sakta hai.",
          "MACD do EMAs ka difference hota hai (12 EMA - 26 EMA). Jab MACD Line apni 9-day Signal line ko upar cross karti hai, to momentum tezi se badh raha hota hai.",
        ],
        keyTerms: [
          {
            term: "RSI (Relative Strength Index)",
            definition: "A bounded momentum oscillator measuring the speed and magnitude of recent price changes.",
            hinglish: "Momentum naapne wala 0-100 ka oscillator.",
          },
          {
            term: "MACD Line",
            definition: "The difference between the 12-period EMA and the 26-period EMA.",
            hinglish: "12 EMA aur 26 EMA ka antar jo trend ki taqat dikhata hai.",
          },
        ],
        quiz: [
          {
            question: "In a powerful structural bull trend, what frequently happens to the 14-day RSI?",
            questionHinglish: "Strong bull market me 14-day RSI ke sath aksar kya hota hai?",
            options: [
              "It can remain elevated in the 70–85 range for extended periods while price continues advancing",
              "It immediately falls to 0 to reset the calculation",
              "It freezes at exactly 50.0 and cannot move",
              "It automatically turns into a moving average",
            ],
            correctIndex: 0,
            explanation: "Overbought readings in a strong trend represent sustained institutional momentum rather than an immediate reversal signal.",
            explanationHinglish: "Strong trend me RSI lamba samay 70 ke upar reh sakta hai kyunki kharidari ki taqat bani rehti hai.",
          },
        ],
        practicalExercise: {
          en: "Slide the RSI length from 7 to 21 in the visualizer and note how shorter lengths increase noise and false alarms.",
          hinglish: "RSI length ko 7 se 21 badal kar dekhein ki choti length me kitne false signals aate hain.",
        },
      },
      {
        id: "lvl4-lesson3",
        title: "Volatility: Bollinger Bands & ATR",
        titleHinglish: "Bollinger Bands Aur ATR Se Volatility Measure Karna",
        summary: "Standard deviation envelopes, the volatility squeeze, and Average True Range (ATR) stop-loss sizing.",
        summaryHinglish: "Volatility squeeze kab blast hota hai aur stop-loss set karne ke liye ATR ka use.",
        visualType: "indicator_explorer",
        contentEn: [
          "Bollinger Bands consist of a central 20-period SMA flanked by an upper band (+2 standard deviations) and a lower band (-2 standard deviations). Statistically, ~95% of price action occurs inside these envelopes.",
          "The Bollinger Squeeze: When the bands contract tightly together, it indicates a period of extreme volatility compression. Low volatility is always followed by high volatility; a sharp breakout is imminent.",
          "Average True Range (ATR): Measures the average true dollar/rupee movement of a stock per bar, accounting for gaps. ATR is the gold standard for setting dynamic stop-losses (e.g. Stop = Entry - 2 × ATR) rather than arbitrary percentage stops.",
        ],
        contentHinglish: [
          "Bollinger Bands me beech me 20-day SMA hota hai aur upar-neeche 2 standard deviation ki bands hoti hain. Lagbhag 95% price inhi bands ke andar rehti hai.",
          "Bollinger Squeeze: Jab dono bands bohot paas aa jati hain, to market bilkul shaant ho jata hai. Shaanti ke baad hamesha toofan (bada breakout) aata hai!",
          "ATR (Average True Range): Ye batata hai ki ek share roz kitne rupaye upar-neeche hilta hai. Dynamic stop-loss lagane ke liye ATR sabse best tool hai (jaise Entry se 2 × ATR neeche stop-loss).",
        ],
        keyTerms: [
          {
            term: "Bollinger Bands",
            definition: "Volatility bands placed 2 standard deviations above and below a 20-period moving average.",
            hinglish: "Standard deviation par bani bands jo market ki volatility aur extremes ko naapti hain.",
          },
          {
            term: "ATR (Average True Range)",
            definition: "An indicator measuring market volatility by decomposing the entire range of an asset.",
            hinglish: "Share ke rozana average movement (rupaye me) ko naapne wala indicator.",
          },
        ],
        quiz: [
          {
            question: "Why is setting a stop-loss using 2 × ATR superior to using a rigid flat 1% stop on all stocks?",
            questionHinglish: "Har stock par flat 1% stop-loss lagane ke bajaye 2 × ATR ka stop-loss lagana kyu behtar hai?",
            options: [
              "It adjusts dynamically to the unique historical volatility of that specific stock",
              "ATR guarantees that the trade will never produce a loss",
              "ATR orders are free of exchange turnover charges",
              "Rigid percentage stops are not recognized by Indian brokers",
            ],
            correctIndex: 0,
            explanation: "High-beta volatile stocks need wider stops to avoid getting shaken out by normal noise, while low-volatility utility stocks need tighter stops. ATR tailors risk to each stock's volatility.",
            explanationHinglish: "Har stock ki chalne ki aadat alag hoti hai. ATR us stock ki real volatility ke hisaab se sahi space deta hai taaki normal jhatke me SL na kate.",
          },
        ],
        practicalExercise: {
          en: "Inspect the Bollinger Bands toggle in the Indicator Explorer to see standard deviation widening during sudden moves.",
          hinglish: "Indicator Explorer me Bollinger Bands ko on karein aur standard deviation expanding ko notice karein.",
        },
      },
    ],
  },
  {
    level: 5,
    id: "level-5-fundamental-analysis",
    title: "Level 5: Fundamental Analysis & Financial Statements",
    titleHinglish: "Level 5: Company Ki Financial Sehat Aur Valuation",
    tagline: "The Business Behind the Stock: Revenue, P/E, Debt & Cash Flow",
    description: "Learn to read the Income Statement waterfall, P/E, P/B, ROE, Debt/Equity, Free Cash Flow, and detect accounting red flags.",
    lessons: [
      {
        id: "lvl5-lesson1",
        title: "The Financial Waterfall: Revenue to Net Income",
        titleHinglish: "Top-line Se Bottom-line: Revenue Se Net Profit Ka Safar",
        summary: "Revenue, Cost of Goods Sold, Gross Margin, OPEX, EBITDA, Depreciation, Tax, and Profit After Tax (PAT).",
        summaryHinglish: "Kamayi se lekar aakhri munafa (PAT) tak har kharche ka hisaab.",
        visualType: "fundamental_waterfall",
        contentEn: [
          "Top-Line (Gross Revenue): The total gross cash generated by selling goods or services before any expenses are deducted.",
          "Gross Profit: Revenue minus Cost of Goods Sold (COGS). It measures core manufacturing/delivery efficiency.",
          "Operating Profit (EBITDA): Earnings Before Interest, Taxes, Depreciation, and Amortization. It reveals how profitable operations are before financing decisions and tax jurisdictions.",
          "Bottom-Line (Net Income / PAT): What remains for shareholders after interest on debt and government corporate income taxes are paid. This is divided by total outstanding shares to calculate Earnings Per Share (EPS).",
        ],
        contentHinglish: [
          "Top-Line (Revenue): Company ne saal bhar me kul kitna saaman ya service becha (gross sales).",
          "Gross Profit: Revenue me se direct production cost (kaccha maal) hatane ke baad bacha munafa.",
          "EBITDA: Saare operating kharche (salaries, marketing, rent) hatane ke baad operational kamayi.",
          "Bottom-Line (Net Profit / PAT): Jab bank ka interest aur sarkar ka tax chuka diya jata hai, jo aakhri paisa bachta hai use Net Income kehte hain. Isko total shares se divide karne par EPS milta hai.",
        ],
        keyTerms: [
          {
            term: "Revenue (Top-line)",
            definition: "The total amount of income generated by the sale of goods or services.",
            hinglish: "Company ki kul bikri (sales) bina koi kharcha kaate.",
          },
          {
            term: "EBITDA",
            definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization.",
            hinglish: "Operational profit jo tax aur interest se pehle banta hai.",
          },
          {
            term: "PAT (Profit After Tax)",
            definition: "Net income remaining after all operating, financial, and tax costs are paid.",
            hinglish: "Aakhri shuddh munafa jo shareholders ke liye bachta hai.",
          },
        ],
        quiz: [
          {
            question: "Why might a company have strong Revenue growth of 25% but simultaneously report declining Net Income?",
            questionHinglish: "Aisa kyu ho sakta hai ki company ka Revenue 25% badha ho par Net Profit ghat gaya ho?",
            options: [
              "Operating costs, raw material inflation, or debt interest expenses rose faster than sales",
              "Stock exchanges take 50% of revenue when sales exceed target",
              "The company executed a stock split that erased half of its cash",
              "Revenue is purely fictional and never reflects actual sales",
            ],
            correctIndex: 0,
            explanation: "If raw materials (COGS), marketing costs, or debt interest expand faster than top-line revenues, margins contract and net profit falls.",
            explanationHinglish: "Agar kache maal ki keemat ya loan ka byaaj revenue se bhi tez badh jaye, to sales badhne ke bawajood net munafa gir jata hai.",
          },
        ],
        practicalExercise: {
          en: "Use the Fundamental Waterfall visualizer to drag raw material costs higher and observe how operating margins compress.",
          hinglish: "Fundamental Waterfall me kharche badha kar dekhein ki net profit par kya asar padta hai.",
        },
      },
      {
        id: "lvl5-lesson2",
        title: "Valuation Ratios: P/E, P/B & EV/EBITDA",
        titleHinglish: "P/E Ratio Aur Valuation: Stock Mehnga Hai Ya Sasta?",
        summary: "Price-to-Earnings, Price-to-Book, sector comparison, and the classic 'Value Trap' danger.",
        summaryHinglish: "P/E ratio dekh kar sasta vs mehnga samajhna aur value trap se bachna.",
        visualType: "fundamental_waterfall",
        contentEn: [
          "Price-to-Earnings (P/E) Ratio = Current Share Price / Earnings Per Share (EPS). It answers: 'How many rupees are investors willing to pay for every ₹1 of current annual profit?'",
          "High P/E vs Low P/E: Fast-growing technology firms often trade at 40x–60x P/E because the market anticipates massive future earnings growth. Mature utilities or banks may trade at 10x–15x.",
          "The Value Trap: A stock trading at a 'cheap' 6x P/E is not automatically a bargain. If the company is losing its competitive moat, facing regulatory obsolescence, or burdened by hidden bad loans, it is cheap for a reason.",
        ],
        contentHinglish: [
          "P/E Ratio = Share Price / EPS. Ye batata hai ki company ke ₹1 ke munafay ke liye market kitna rupaya dene ko taiyar hai.",
          "High P/E vs Low P/E: Agar koi company bohot tezi se grow kar rahi hai (jaise tech), to log 40-50 P/E bhi dete hain. Slow sectors (jaise power ya coal) me 10-12 P/E milta hai.",
          "Value Trap: Har sasti cheez achhi nahi hoti! Agar kisi share ka P/E sirf 5 hai, to check karein ki company me koi ghotala, bhari karza ya business khatam to nahi ho raha.",
        ],
        keyTerms: [
          {
            term: "P/E Ratio",
            definition: "Valuation metric dividing share price by earnings per share.",
            hinglish: "Share price aur per share kamayi ka ratio.",
          },
          {
            term: "Value Trap",
            definition: "A stock that appears attractively cheap based on low valuation metrics but has structural flaws.",
            hinglish: "Sasta dikhne wala share jo asaliyat me bekaar business hota hai.",
          },
        ],
        quiz: [
          {
            question: "Why is comparing the P/E ratio of a software company (e.g. TCS) to a steel manufacturer (e.g. Tata Steel) misleading?",
            questionHinglish: "TCS (software) ke P/E ratio ko Tata Steel se compare karna galat kyu hai?",
            options: [
              "Different industries have drastically different capital expenditures, margins, and growth profiles",
              "Software companies do not calculate EPS",
              "Steel companies are not allowed to list on public stock exchanges",
              "P/E ratios can only be calculated on companies founded before 1990",
            ],
            correctIndex: 0,
            explanation: "P/E ratios must always be benchmarked against direct sector peers. Asset-light software models command higher multiples than capital-heavy cyclical manufacturing.",
            explanationHinglish: "Hamesha same sector ke peers se compare karein. Software companies bina factory ke grow karti hain, steel companies ko hazaaro crore ka plant lagana padta hai.",
          },
        ],
        practicalExercise: {
          en: "Compare P/E and P/B ratios across stocks on the Stock Comparison tab.",
          hinglish: "Stock Comparison tab me jakar do alag-alag companies ke P/E ratios ko compare karein.",
        },
      },
      {
        id: "lvl5-lesson3",
        title: "Balance Sheet Health: Debt/Equity & Free Cash Flow",
        titleHinglish: "Balance Sheet: Karza (Debt) Aur Free Cash Flow",
        summary: "Accounting profits vs real cash flow, Debt/Equity solvency, and Return on Equity (ROE).",
        summaryHinglish: "Profit paper par ho sakta hai par Free Cash Flow bank account ka sach hota hai.",
        visualType: "fundamental_waterfall",
        contentEn: [
          "Free Cash Flow (FCF) = Operating Cash Flow - Capital Expenditures (CapEx). While Net Income can be manipulated via aggressive revenue recognition and depreciation schedules, cash in the bank account cannot be faked.",
          "Debt-to-Equity (D/E) Ratio: Total Liabilities divided by Total Shareholders' Equity. A D/E > 2.0 in a cyclical business means high vulnerability to bankruptcy during economic downturns.",
          "Return on Equity (ROE): Net Income / Shareholders' Equity. A consistently high ROE (>18%) without excessive debt leverage indicates a company with a strong competitive moat.",
        ],
        contentHinglish: [
          "Free Cash Flow (FCF) = Asali cash jo business se bacha CapEx kharche ke baad. Accounting me munafa dikhaya ja sakta hai, lekin bank me asali cash kitna aaya ye FCF batata hai.",
          "Debt-to-Equity (Karza/Equity): Agar company par karza bohot zyada hai, to thodi si mandi aane par company interest nahi chuka payegi aur collapse ho sakti hai.",
          "ROE (Return on Equity): Shareholders ke lagaye paise par company kitne percent munafa kama kar de rahi hai. 18-20% se upar ROE achha mana jata hai.",
        ],
        keyTerms: [
          {
            term: "Free Cash Flow (FCF)",
            definition: "Cash generated by operations minus necessary capital expenditures to maintain/grow assets.",
            hinglish: "Business chalane aur zaroori kharche karne ke baad bacha asali cash.",
          },
          {
            term: "Debt-to-Equity Ratio",
            definition: "Measure of financial leverage comparing total debt to shareholder equity.",
            hinglish: "Company ke upar karze ka bhoj naapne wala ratio.",
          },
        ],
        quiz: [
          {
            question: "Why do institutional value investors prioritize positive Free Cash Flow over reported Net Income?",
            questionHinglish: "Bade investors paper profit (Net Income) se zyada Free Cash Flow ko kyu dekhte hain?",
            options: [
              "Cash flow cannot be fabricated by accounting assumptions and pays real dividends and debt",
              "Free Cash Flow is exempt from Indian corporate tax laws",
              "Net income is only reported once every ten years",
              "Cash flow figures are personally signed by government regulators",
            ],
            correctIndex: 0,
            explanation: "Net income includes non-cash items and accrued revenue. Free Cash Flow proves the business converts reported sales into tangible cold hard cash.",
            explanationHinglish: "Paper par profit dikhana asan hota hai, par bank account me cash aana sachai batata hai.",
          },
        ],
        practicalExercise: {
          en: "Review the Factor Scorecard for Quality and Value scores on the Research page.",
          hinglish: "Research page par Factor Scorecard me Quality aur Value scores ko observe karein.",
        },
      },
    ],
  },
  {
    level: 6,
    id: "level-6-risk-management",
    title: "Level 6: Risk Management & Position Sizing",
    titleHinglish: "Level 6: Risk Management Aur Capital Bachana",
    tagline: "The Real Holy Grail: Surviving Drawdowns & Calculating Size",
    description: "Master the 1% risk rule, mathematical position sizing, Risk/Reward ratios, drawdown recovery asymmetry, and concentration limits.",
    lessons: [
      {
        id: "lvl6-lesson1",
        title: "The 1% Rule & Mathematical Position Sizing",
        titleHinglish: "1% Risk Rule Aur Position Sizing Ka Formula",
        summary: "Why trade sizing matters 10x more than entry timing: Shares = (Risk ₹) / (Entry - StopLoss).",
        summaryHinglish: "Kitne shares lene chahiye taaki ek trade galat hone par account khali na ho.",
        visualType: "risk_calculator",
        contentEn: [
          "The biggest cause of retail account ruin is oversized positions. You cannot control where the market goes; you can only control how much money you lose if you are wrong.",
          "The 1% Risk Rule: On any single trade, the maximum capital you risk if your stop-loss is triggered must never exceed 1% of your total account equity.",
          "Exact Position Sizing Formula:\n  Account Risk (₹) = Total Capital × 1%\n  Risk Per Share (₹) = Entry Price - Stop Loss Price\n  Position Size (Shares) = Account Risk (₹) / Risk Per Share (₹)",
          "Example: If your capital is ₹1,00,000, your 1% risk is ₹1,000. If you enter at ₹500 and place your stop-loss at ₹480 (risk = ₹20 per share), you buy exactly: 1,000 / 20 = 50 shares.",
        ],
        contentHinglish: [
          "90% traders entry ki wajah se nahi, balki galat position size ki wajah se barbad hote hain. Market kaha jayega ye kisi ke haath me nahi, par agar trade ulti padi to kitna loss hoga ye aapke haath me hai.",
          "Golden 1% Rule: Kisi bhi single trade par apne total capital ka 1% se zyada risk kabhi mat lijiye.",
          "Formula:\n  Shares = (Total Capital × 1%) / (Entry Price - Stop Loss)\n  Agar account ₹1,00,000 ka hai, to 1% risk hua ₹1,000. Agar share ₹500 par liya aur stop-loss ₹480 hai (risk ₹20 per share), to aap sirf 50 shares lenge.",
          "Is tarah agar trade fail bhi ho jaye aur stop-loss hit ho jaye, to aapka sirf ₹1,000 jayega. Aapka 99% capital safe rahega agle mauke ke liye!",
        ],
        keyTerms: [
          {
            term: "1% Risk Rule",
            definition: "Risk management standard limiting maximum dollar loss per trade to 1% of total portfolio equity.",
            hinglish: "Har trade par total capital ka maximum 1% hi risk lene ka niyam.",
          },
          {
            term: "Position Sizing",
            definition: "Calculating the exact number of shares to purchase based on stop-loss distance and risk budget.",
            hinglish: "Stop-loss ke hisaab se sahi shares ki sankhya calculate karna.",
          },
        ],
        quiz: [
          {
            question: "With a ₹2,00,000 trading portfolio and a 1% risk rule, if you enter a stock at ₹400 with a stop-loss at ₹380, how many shares should you buy?",
            questionHinglish: "₹2,00,000 account aur 1% risk rule ke sath, agar Entry ₹400 aur Stop-Loss ₹380 hai, to kitne shares lene chahiye?",
            options: [
              "100 shares (Risk = ₹2,000, Risk/share = ₹20, 2000/20 = 100 shares)",
              "500 shares (Invest full capital)",
              "1,000 shares (Leverage account 2x)",
              "20 shares",
            ],
            correctIndex: 0,
            explanation: "Account risk = ₹2,00,000 × 1% = ₹2,000. Risk per share = ₹400 - ₹380 = ₹20. Position size = ₹2,000 / ₹20 = 100 shares.",
            explanationHinglish: "Total risk ₹2,000 hua. Ek share par ₹20 ka risk hai. 2000 / 20 = 100 shares. Calculate bilkul simple aur safe hai.",
          },
        ],
        practicalExercise: {
          en: "Experiment with the Risk Calculator below by changing your Stop-Loss distance and watch the recommended position size adapt automatically.",
          hinglish: "Neeche Risk Calculator me Stop-Loss ko aage peeche karke dekhein ki recommended shares kaise badalte hain.",
        },
      },
      {
        id: "lvl6-lesson2",
        title: "Risk-to-Reward Ratio (R:R) & Expectancy",
        titleHinglish: "Risk:Reward Ratio: 40% Win Rate Par Bhi Profit Kaise Bane",
        summary: "Mathematical expectancy: why a 1:2 R:R makes you profitable even if you are wrong 60% of the time.",
        summaryHinglish: "Chhota loss lena aur bada profit ride karna trading ka asali raaz hai.",
        visualType: "risk_calculator",
        contentEn: [
          "Risk-to-Reward Ratio (R:R) compares what you stand to lose if stopped out versus what you stand to gain at your target price. A 1:2 R:R means you risk ₹1 to make ₹2.",
          "Mathematical Expectancy Formula: Expectancy = (Win Rate × Average Win) - (Loss Rate × Average Loss).",
          "The Power of Positive Asymmetry: If your win rate is only 40% (you lose 6 out of 10 trades), but your average win is ₹2,000 and your average loss is ₹1,000:\n  Over 10 trades: (4 wins × ₹2,000) - (6 losses × ₹1,000) = ₹8,000 - ₹6,000 = +₹2,000 net profit!",
        ],
        contentHinglish: [
          "Risk:Reward Ratio (R:R) batata hai ki kitne rupaye ka risk lene par kitna profit target kiya ja raha hai. 1:2 R:R ka matlab hai ₹1 ka risk lene par ₹2 ka profit target.",
          "Bohat bada sach: Trading me ameer banne ke liye 90% accurate hone ki zaroorat nahi hai! Agar aap 10 me se 6 trades haar bhi jaate hain (40% win rate), tab bhi aap ameer ban sakte hain agar aapka R:R 1:2 ya 1:3 hai.",
          "Hisab dekhein: 4 wins × ₹2,000 = ₹8,000 profit. 6 losses × ₹1,000 = ₹6,000 loss. Net munafa = +₹2,000! Chhota loss jaldi kaatna aur winners ko ride karna hi asali secret hai.",
        ],
        keyTerms: [
          {
            term: "Risk-to-Reward Ratio",
            definition: "The prospective profit of a trade relative to its prospective loss.",
            hinglish: "Target profit aur stop-loss ke beech ka mathematical ratio.",
          },
          {
            term: "Trading Expectancy",
            definition: "The average amount an investor can expect to win or lose per trade over time.",
            hinglish: "Har trade par average kitna profit ya loss aayega uska calculation.",
          },
        ],
        quiz: [
          {
            question: "If a trader has a 40% win rate with a 1:3 Risk-to-Reward ratio, is their system profitable over 100 trades?",
            questionHinglish: "Agar ek trader ka win rate sirf 40% hai par R:R 1:3 hai, to kya wo 100 trades ke baad profit me hoga?",
            options: [
              "Yes, highly profitable: 40 wins × 3 units = +120 units, 60 losses × 1 unit = -60 units, Net = +60 units",
              "No, because any win rate under 50% guarantees eventual bankruptcy",
              "Breakeven only, before brokerage fees",
              "It depends on the time of day the trades were taken",
            ],
            correctIndex: 0,
            explanation: "Asymmetric reward-to-risk guarantees positive expectancy even with a losing majority of trades (40% win rate).",
            explanationHinglish: "Bilkul haan! Bada reward lene se kam win rate par bhi zabardast profit banta hai.",
          },
        ],
        practicalExercise: {
          en: "Slide the Target Price in the Risk Calculator to see your trade expectancy score change from negative to positive.",
          hinglish: "Risk Calculator me Target Price badal kar R:R ko 1:2 ya usse upar set karein.",
        },
      },
      {
        id: "lvl6-lesson3",
        title: "Drawdown Recovery Math & Concentration Risk",
        titleHinglish: "Drawdown Math: 50% Loss Ke Baad 100% Gain Chahiye Hota Hai",
        summary: "The brutal asymmetry of loss recovery, why a 25% portfolio concentration cap prevents catastrophe.",
        summaryHinglish: "Loss recover karne ka ganit asan nahi hota; diversification kyu zaroori hai.",
        visualType: "risk_calculator",
        contentEn: [
          "Drawdown Asymmetry Math: If you lose 10%, you need an 11.1% gain to recover. If you lose 30%, you need a 42.9% gain. If you lose 50%, you need a massive 100% gain just to break even! If you lose 80%, you need a 400% gain.",
          "This mathematical law is why capital preservation must be your #1 rule. Deep drawdowns take years of miraculous outperformance to heal.",
          "Concentration Risk Rule: Never allocate more than 20% to 25% of your total portfolio into a single company, regardless of how confident you feel. Black swan events (accounting fraud, regulatory bans, executive crises) happen without warning.",
        ],
        contentHinglish: [
          "Drawdown Asymmetry: Agar aapka ₹1,00,000 ka account 50% gir kar ₹50,000 ho jata hai, to wapas ₹1,00,000 par aane ke liye 50% nahi balki 100% ka gain chahiye!",
          "Agar 80% loss ho gaya, to break even karne ke liye 400% ka gain chahiye jo lagbhag namumkin hota hai. Isliye bada loss hone se pehle hi stop-loss par nikal jana chahiye.",
          "Concentration Risk: Kisi ek single stock me apne portfolio ka 20-25% se zyada kabhi mat lagaiye. Chahe company kitni bhi badi kyu na ho (jaise Yes Bank ya Enron), unexpected fraud ya crisis pura paisa duba sakti hai.",
        ],
        keyTerms: [
          {
            term: "Maximum Drawdown",
            definition: "The maximum observed peak-to-trough percentage decline in portfolio equity.",
            hinglish: "Top se bottom tak portfolio me hua sabse bada percentage loss.",
          },
          {
            term: "Concentration Risk",
            definition: "The elevated risk of suffering large portfolio damage when capital is overly concentrated in one asset (>25%).",
            hinglish: "Ek hi share me saara paisa laga dene ka khatarnak risk.",
          },
        ],
        quiz: [
          {
            question: "If your trading portfolio drops by 50%, what percentage gain do you need on your remaining capital just to break even?",
            questionHinglish: "Agar portfolio 50% gir jata hai, to bache hue paise par kitna percent gain chahiye sirf barabar aane ke liye?",
            options: [
              "100% gain (₹50,000 must grow by ₹50,000 to reach ₹1,00,000)",
              "50% gain",
              "25% gain",
              "75% gain",
            ],
            correctIndex: 0,
            explanation: "Because your capital base has halved, a full 100% gain on the remaining balance is required to return to the original starting capital.",
            explanationHinglish: "₹50,000 ko wapas ₹1,00,000 banane ke liye 100% ka profit chahiye hota hai.",
          },
        ],
        practicalExercise: {
          en: "Notice the Concentration Warning badge in the Paper Trading Sandbox whenever a single position exceeds 25% of your virtual equity.",
          hinglish: "Paper Trading sandbox me dekhein ki jab kisi share me 25% se zyada lagate hain to concentration alert kaise warn karta hai.",
        },
      },
    ],
  },
  {
    level: 7,
    id: "level-7-strategies-backtesting",
    title: "Level 7: Strategies, Backtesting & Indian Frictions",
    titleHinglish: "Level 7: Quantitative Strategies, Backtesting Aur Frictions",
    tagline: "Walk-Forward Validation, Friction Realism & Lookahead Elimination",
    description: "Build robust quantitative backtests, eliminate future-data leakage (lookahead bias), model Indian taxes (STT, GST, brokerage), and prevent overfitting.",
    lessons: [
      {
        id: "lvl7-lesson1",
        title: "Walk-Forward Testing vs Lookahead Bias",
        titleHinglish: "Walk-Forward Testing Aur Lookahead Bias Ka Dhoka",
        summary: "The deadly sin of backtesting: leaking tomorrow's price into today's execution decisions.",
        summaryHinglish: "Bhavishya ka data dekhkar past me trade lene ki galti aur uska asali asar.",
        visualType: "backtest_visualizer",
        contentEn: [
          "Lookahead Bias is the fatal flaw where a backtest accidentally uses information from bar T+1 or bar T's future close to take a trade on bar T. It produces spectacular 80% annual return equity curves on paper that violently crash in live trading.",
          "MarketPulse's Strict Chronological Rule: Any signal generated at bar T must strictly use information up to bar T-1 or bar T open, and execution must occur chronologically.",
          "In our mutation test, we proved that mutating bars after time T by 500% leaves historical backtest trades up to time T 100% bit-for-bit identical.",
        ],
        contentHinglish: [
          "Lookahead Bias backtesting ka sabse bada fraud hota hai. Iska matlab hota hai ki computer ne trade lene se pehle kal ka bhav dekh liya! Paper par aisi strategy 100% return dikhati hai par live aate hi sab duba deti hai.",
          "True Walk-Forward Rule: Aaj ka decision sirf kal tak ke data par hona chahiye. Kal kya hoga ye algorithm ko pehle se pata nahi hona chahiye.",
          "MarketPulse ka backtest engine 100% lookahead-bias proof hai — future ka data mutate karne par bhi past ke trades me 1 paise ka bhi badlaav nahi aata.",
        ],
        keyTerms: [
          {
            term: "Lookahead Bias",
            definition: "The conditioning of trading decisions on information that was not chronologically available in real-time.",
            hinglish: "Future ki information ka use karke past me galat simulation banana.",
          },
          {
            term: "Walk-Forward Testing",
            definition: "Simulating a strategy strictly bar-by-bar sequentially as new data arrives.",
            hinglish: "Step-by-step bina bhavishya dekhe sequential real testing karna.",
          },
        ],
        quiz: [
          {
            question: "Why do strategies contaminated with lookahead bias fail catastrophically when deployed with real money?",
            questionHinglish: "Lookahead bias wali strategy live market me aate hi fail kyu ho jati hai?",
            options: [
              "Because in real life you cannot peek into tomorrow's closing price before placing today's order",
              "Because real brokers require special permissions for quantitative code",
              "Because exchanges invert all signals on live servers",
              "Because taxes only apply to live trading, not backtests",
            ],
            correctIndex: 0,
            explanation: "Lookahead bias relies on impossible future knowledge. In live trading, tomorrow's price is unknown until it unfolds.",
            explanationHinglish: "Real market me kal kya hoga ye pehle se kisi ko pata nahi hota, isliye cheat karne wali strategy fail ho jati hai.",
          },
        ],
        practicalExercise: {
          en: "Examine the Lookahead Bias mutation test comparison in the Backtest visualizer below.",
          hinglish: "Neeche visualizer me dekhein ki lookahead bias kaise equity curve ko jhooth bolti hai.",
        },
      },
      {
        id: "lvl7-lesson2",
        title: "Real-World Indian Transaction Frictions",
        titleHinglish: "Indian Market Frictions: STT, Brokerage, GST Aur Slippage",
        summary: "The statutory math: STT (0.1%), Brokerage (₹20 flat), GST (18%), Stamp Duty, Turnover, and 5 bps slippage.",
        summaryHinglish: "Har trade par kitna tax aur kharcha lagta hai aur ye profit ko kaise ghatata hai.",
        visualType: "backtest_visualizer",
        contentEn: [
          "Many beginner strategies look profitable in backtests only because they ignored trading frictions. If your system makes 20 trades a week, frictional bleed can wipe out 30% of your gains.",
          "Statutory Indian Transaction Schedule:\n  1. STT (Securities Transaction Tax): 0.1% on equity delivery\n  2. Brokerage: Flat ₹20 or 0.03% (whichever is lower)\n  3. Exchange Turnover Charge: ~0.00325% on NSE\n  4. GST: 18% levied on Brokerage + Exchange Turnover\n  5. Stamp Duty: 0.015% on the buy-side\n  6. Execution Slippage: ~0.05% (5 basis points) due to spread crossing",
          "Always evaluate strategies on NET profit after statutory frictions, never on gross profits.",
        ],
        contentHinglish: [
          "Agar aap har hafte 20-30 trades lete hain, to chahe strategy kitni bhi achhi ho, saara profit taxes aur brokerage me nikal jata hai.",
          "Bharat me har trade par lagne wale kharche:\n  1. STT (Securities Transaction Tax): 0.1% delivery par\n  2. Brokerage: Flat ₹20 ya 0.03%\n  3. Exchange Turnover Charge: ~0.00325%\n  4. GST: Brokerage aur charges par 18%\n  5. Stamp Duty: Buy side par 0.015%\n  6. Slippage: Lagbhag 0.05% spread cross karne ka loss.",
          "Hamesha Net Profit dekhein (saare kharche katne ke baad), Gross Profit dekh kar khush mat hoiye.",
        ],
        keyTerms: [
          {
            term: "STT (Securities Transaction Tax)",
            definition: "Direct central tax levied on the value of securities transacted on recognized Indian exchanges.",
            hinglish: "Bharat sarkar dwara shares ke len-den par lagne wala direct tax.",
          },
          {
            term: "Execution Slippage",
            definition: "The difference between the expected price of a trade and the price at which the trade executes.",
            hinglish: "Order lagane aur actual fill hone ke beech price ka antar.",
          },
        ],
        quiz: [
          {
            question: "If a strategy generates ₹10,000 in gross profit over 200 trades, but incurs ₹11,500 in cumulative STT, brokerage, and GST, what is the trader's net result?",
            questionHinglish: "Agar 200 trades par ₹10,000 ka gross profit hua par ₹11,500 taxes aur charges lag gaye, to net kya bacha?",
            options: [
              "A net loss of -₹1,500 (the strategy is unprofitable due to friction drag)",
              "A net profit of +₹10,000 because broker fees are tax-deductible",
              "A neutral breakeven result",
              "A refund from the exchange",
            ],
            correctIndex: 0,
            explanation: "Net profit = Gross Profit (₹10,000) - Total Frictions (₹11,500) = -₹1,500 net loss. High frequency trading requires immense edge to overcome transaction friction.",
            explanationHinglish: "Net result = ₹10,000 - ₹11,500 = -₹1,500 loss. Isliye over-trading karne se sirf broker aur government ameer bante hain, trader nahi.",
          },
        ],
        practicalExercise: {
          en: "Calculate the exact friction breakdown for a ₹50,000 trade using the calculator in the visualizer.",
          hinglish: "Neeche visualizer me ₹50,000 ke trade ka exact STT aur GST breakdown check karein.",
        },
      },
      {
        id: "lvl7-lesson3",
        title: "Overfitting & Curve Fitting Traps",
        titleHinglish: "Overfitting: Past Data Par Perfect Strategy Live Me Kyu Fail Hoti Hai?",
        summary: "The hazard of hyper-optimizing 15 indicator variables on noise rather than market structure.",
        summaryHinglish: "Past me zabardast dikhne wali strategy real market me aate hi flop kyu ho jati hai.",
        visualType: "backtest_visualizer",
        contentEn: [
          "Overfitting occurs when a quantitative model is tuned to memorize past historical noise rather than capture durable underlying market edges.",
          "Example of Overfitting: Testing 500 combinations of RSI thresholds, MACD parameters, and stop distances until finding: 'Buy when RSI(11) crosses 29.4 while 23-EMA is rising on Tuesdays.' It worked perfectly in 2024 because it memorized noise; it fails completely in 2025.",
          "How to prevent overfitting: Keep parameters minimal (2 to 3 variables maximum), enforce out-of-sample testing, and require logical financial rationale for every rule.",
        ],
        contentHinglish: [
          "Overfitting ka matlab hota hai ki aapne computer se 1,000 settings test karwayi aur pichle data par 'perfect' setting dhundh li jo 99% win rate de rahi thi.",
          "Problem kya hai? Us strategy ne past ke random noise ko yaad kar liya, real market rules ko nahi. Jaise hi naya saal shuru hota hai, wo strategy bura collapse ho jati hai.",
          "Overfitting se kaise bachein? Strategy me bohot saare indicators mat lagaiye (maximum 2-3), simple rules rakhein, aur out-of-sample data par test karein.",
        ],
        keyTerms: [
          {
            term: "Overfitting",
            definition: "The production of an analysis that corresponds too closely to a particular dataset and fails to predict future observations.",
            hinglish: "Past data ke noise ko ratta maar lena jo aage chal kar fail ho jata hai.",
          },
          {
            term: "Out-of-Sample Testing",
            definition: "Validating a strategy on fresh historical data that was completely withheld during the design phase.",
            hinglish: "Alag rakhe gaye naye data par strategy ko test karna taaki sach samne aaye.",
          },
        ],
        quiz: [
          {
            question: "Which of the following is a clear warning sign of an overfitted trading strategy?",
            questionHinglish: "Inme se koun sa sign overfitted strategy ki pehchan hai?",
            options: [
              "It uses 8 different specialized indicator rules tuned to bizarre specific numbers like RSI(13.5)",
              "It relies on a simple 200-day moving average trend filter",
              "It models statutory transaction frictions accurately",
              "It works consistently across multiple asset classes and years",
            ],
            correctIndex: 0,
            explanation: "Excessive complexity, numerous parameters, and oddly specific threshold numbers indicate curve-fitting to random historical noise.",
            explanationHinglish: "Bohot saare indicators aur ajeeb numbers (jaise RSI 29.4) curve fitting ka sabse bada saboot hain.",
          },
        ],
        practicalExercise: {
          en: "Observe parameter ranges in the Walk-Forward Backtesting tab on the main dashboard.",
          hinglish: "Main dashboard ke Backtesting section me parameter ranges ko inspect karein.",
        },
      },
    ],
  },
  {
    level: 8,
    id: "level-8-advanced-practice",
    title: "Level 8: Advanced Practice & Behavioral Mastery",
    titleHinglish: "Level 8: Advanced Portfolio Health Aur Trader Psychology",
    tagline: "Market Regimes, Multi-Factor Scoring & Behavioral Traps",
    description: "Identify market regimes (trending, choppy, panic), evaluate multi-factor portfolio health scorecards, and conquer psychological biases (FOMO, Revenge Trading).",
    lessons: [
      {
        id: "lvl8-lesson1",
        title: "Market Regimes & Strategy Adaptation",
        titleHinglish: "Market Regimes: Trending vs Choppy Markets Me Adaptation",
        summary: "No strategy works in all weather: Bull trends, Bear trends, Choppy ranges, and High-Volatility Panics.",
        summaryHinglish: "Har strategy har mausam me kaam nahi karti; market regime pehchanna seekhein.",
        visualType: "portfolio_health_scorecard",
        contentEn: [
          "Financial markets cycle through four distinct macro regimes:\n  1. Low-Volatility Bull Trend: Strong upward momentum, moving average dip buying thrives.\n  2. High-Volatility Panic (Bear): Fast downward gaps, cash preservation and short hedges rule.\n  3. Low-Volatility Range (Choppy): False breakouts dominate; mean-reversion oscillators work.\n  4. High-Volatility Expansion: Wide chaotic swings, indicators generate frequent whip-saws.",
          "The biggest mistake of systematic traders is running a pure trend-following strategy during a choppy range regime, bleeding capital through repeated false breakout stop-outs.",
        ],
        contentHinglish: [
          "Market hamesha ek jaisa nahi chalta. 4 main mausam (regimes) hote hain:\n  1. Bull Trend: Dheere-dheere lagatar upar jana (dip buy strategies best hoti hain).\n  2. Bear Panic: Tezi se crash hona (cash me baithna sabse safe hota hai).\n  3. Choppy Range: Sideways ghoomna (breakout fail hote hain, support par buy aur resistance par sell chalta hai).\n  4. High Volatility: Badi-badi candles aur dono taraf jhatke.",
          "Sabse badi galti: Sideways market me trend-following strategy lagana. Har breakout fail hoga aur bar-bar stop-loss kat kar loss hoga.",
        ],
        keyTerms: [
          {
            term: "Market Regime",
            definition: "The prevailing macro structural environment characterizing volatility, trend strength, and correlation.",
            hinglish: "Market ka mausam: trend chal raha hai, sideways hai ya panic hai.",
          },
          {
            term: "Mean-Reversion",
            definition: "The financial theory suggesting asset prices eventually return to their historical average.",
            hinglish: "Price ka apne average ki taraf wapas laut aana.",
          },
        ],
        quiz: [
          {
            question: "Why do momentum breakout strategies suffer continuous losses during a low-volatility sideways range regime?",
            questionHinglish: "Sideways choppy market me breakout strategies lagatar loss kyu deti hain?",
            options: [
              "Because prices lack directional follow-through, causing breakouts to fail and reverse into stop-losses",
              "Because brokers raise commission fees during sideways markets",
              "Because moving averages stop calculating when volatility drops",
              "Because candlesticks cannot be plotted in sideways markets",
            ],
            correctIndex: 0,
            explanation: "In range regimes, price oscillates between support and resistance. Breakouts lack follow-through and quickly trigger false breakout traps.",
            explanationHinglish: "Sideways market me price resistance se wapas ghoom jati hai, follow-through nahi milta isliye breakout fail ho jata hai.",
          },
        ],
        practicalExercise: {
          en: "Toggle between the Bull, Bear, and Choppy regimes in the visualizer to see how strategy win rates fluctuate.",
          hinglish: "Visualizer me alag-alag market regimes toggle karke win rate ka change dekhein.",
        },
      },
      {
        id: "lvl8-lesson2",
        title: "Portfolio Health Scorecard & Stress Testing",
        titleHinglish: "Portfolio Health Scorecard: Diversification Aur Sharpe Check",
        summary: "Multi-factor scoring: Value, Momentum, Quality, Sharpe, Sortino, and stress testing against market drops.",
        summaryHinglish: "Apne portfolio ka health checkup kaise karein taaki crash me bacha ja sake.",
        visualType: "portfolio_health_scorecard",
        contentEn: [
          "Professional asset managers do not evaluate portfolios merely by total returns; they evaluate Risk-Adjusted Returns using the Sharpe Ratio: (Portfolio Return - Risk-Free Rate) / Annualized Volatility.",
          "The Sortino Ratio improves on Sharpe by penalizing only Downside Volatility, recognizing that upside volatility is beneficial for investors.",
          "A healthy portfolio maintains a composite factor balance: Quality (high ROE, low debt), Momentum (positive 6-month price trend), Value (reasonable P/E multiples), and Low Correlation across independent sectors.",
        ],
        contentHinglish: [
          "Smart investors sirf ye nahi dekhte ki kitna return mila, wo ye dekhte hain ki kitna risk lekar return mila. Isko naapne ke liye Sharpe Ratio use hota hai.",
          "Sortino Ratio aur behtar hai kyunki ye sirf neeche girne wali volatility (downside risk) ko penalize karta hai.",
          "Ek healthy portfolio me balance hona chahiye: Quality (kam karza aur achha ROE), Momentum (trend upar ho), aur Diversification (saara paisa sirf ek hi sector me na ho).",
        ],
        keyTerms: [
          {
            term: "Sharpe Ratio",
            definition: "Measure of risk-adjusted return dividing excess return by total standard deviation.",
            hinglish: "Risk ke mukable kitna extra return mila usko naapne ka standard ratio.",
          },
          {
            term: "Sortino Ratio",
            definition: "Risk-adjusted metric measuring excess return relative only to negative downside volatility.",
            hinglish: "Sirf downside loss wali volatility ko count karne wala risk metric.",
          },
        ],
        quiz: [
          {
            question: "Why is a portfolio with 18% annual return and a 1.5 Sharpe ratio superior to one with 22% annual return and a 0.5 Sharpe ratio?",
            questionHinglish: "18% return aur 1.5 Sharpe ratio wala portfolio, 22% return aur 0.5 Sharpe wale se better kyu mana jata hai?",
            options: [
              "It generated its returns with drastically lower volatility and much milder drawdowns, providing superior risk efficiency",
              "The 1.5 Sharpe portfolio pays zero taxes",
              "A Sharpe ratio above 1.0 triggers bonus dividends from the exchange",
              "Because 18 is mathematically greater than 22",
            ],
            correctIndex: 0,
            explanation: "Higher Sharpe means higher return per unit of risk endured. The 0.5 Sharpe portfolio had extreme gut-wrenching swings and deep drawdowns that easily panic retail investors into selling at the bottom.",
            explanationHinglish: "1.5 Sharpe ka matlab hai shanti se, kam jhatke khaye bina consistent return bana. 0.5 Sharpe me bohot bada drawdown jhelna pada.",
          },
        ],
        practicalExercise: {
          en: "Review the Portfolio Risk Diagnostics section on the main dashboard to check Sharpe and Sortino ratios.",
          hinglish: "Main dashboard ke Risk section me Sharpe aur Sortino ratios ko verify karein.",
        },
      },
      {
        id: "lvl8-lesson3",
        title: "Behavioral Biases: FOMO, Loss Aversion & Revenge Trading",
        titleHinglish: "Trader Psychology: FOMO Aur Revenge Trading Se Bachna",
        summary: "The mental game: Fear of Missing Out, the Disposition Effect, and Revenge Trading ruin cycles.",
        summaryHinglish: "Market se badla lene ki koshish (revenge trading) me account khali hone se kaise bachein.",
        visualType: "portfolio_health_scorecard",
        contentEn: [
          "FOMO (Fear Of Missing Out): Chasing a parabolic green candle after a stock has already climbed 25% in 3 days. You become the 'exit liquidity' for smart institutions dumping their holdings.",
          "The Disposition Effect: Selling winning trades too early to lock in tiny gains, while stubbornly holding losing trades for months hoping they will bounce back. This inverts your risk/reward ratio.",
          "Revenge Trading: After a painful loss, immediately taking a 3x larger impulsive trade without a setup to 'win back the money from the market.' This single psychological breakdown wipes out more trading careers than all other mistakes combined.",
        ],
        contentHinglish: [
          "FOMO (Fear Of Missing Out): Jab koi share 3 din me 20% bhag jata hai, to 'kahi mauka na chhoot jaye' sochkar top par kharid lena. Waha bade log bech rahe hote hain aur aap fass jaate hain.",
          "Disposition Effect: Chhota sa ₹500 ka profit aate hi turant bech dena, lekin jab ₹5,000 ka loss chal raha ho to mahino tak pakad kar baithe rehna ki 'kabhi to wapas aayega'.",
          "Revenge Trading: Ek trade me loss hone ke baad gusse me aakar 3 guna bada trade le lena taaki market se paisa wapas cheen sakein. Market se badla lene ki koshish me 1 din me pura account khali ho jata hai.",
        ],
        keyTerms: [
          {
            term: "FOMO (Fear Of Missing Out)",
            definition: "The psychological anxiety that an opportunity is passing, causing emotional purchases at price peaks.",
            hinglish: "Mauka chhootne ke darr se top par share kharidne ki galti.",
          },
          {
            term: "Revenge Trading",
            definition: "Impulsive, oversized trading driven by anger to recover recent losses, often leading to account ruin.",
            hinglish: "Loss hone ke baad gusse me over-leverage karke trade lene ka self-destructive behavior.",
          },
        ],
        quiz: [
          {
            question: "What is the single best psychological rule to follow immediately after suffering two maximum-loss stop-outs in a row?",
            questionHinglish: "Lagatar do stop-loss hit hone ke baad sabse best psychological rule kya hona chahiye?",
            options: [
              "Close the trading terminal, step away for the rest of the session, and do not place emotional revenge trades",
              "Triple your position size on the next trade to win back the losses instantly",
              "Call your broker and demand an algorithmic refund",
              "Immediately short the entire market on maximum leverage",
            ],
            correctIndex: 0,
            explanation: "Stepping away preserves emotional equilibrium and prevents the fatal spiral of revenge trading when discipline is compromised.",
            explanationHinglish: "Screen band karke thoda break lein. Gusse me trade lene se bacha hua capital bhi chala jayega.",
          },
        ],
        practicalExercise: {
          en: "Review the Behavioral Bias checklist in the visualizer to assess your emotional trading readiness.",
          hinglish: "Neeche visualizer me Behavioral Bias checklist ko review karein aur trading discipline banayein.",
        },
      },
    ],
  },
];
