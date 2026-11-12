"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Send,
  Sparkles,
  ShieldCheck,
  Languages,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface AITutorChatProps {
  currentLevel: number;
  currentLessonId?: string;
  language: "en" | "hinglish";
  onLanguageChange: (lang: "en" | "hinglish") => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "tutor";
  text: string;
  language: "en" | "hinglish";
  groundedConcepts?: string[];
  followUps?: string[];
  timestamp: string;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  currentLevel,
  currentLessonId,
  language,
  onLanguageChange,
}) => {
  const [inputQuestion, setInputQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      sender: "tutor",
      text:
        language === "hinglish"
          ? `Namaste! Mai Prof. Pulse hu, aapka AI Trading Academy Tutor. Aap abhi Level ${currentLevel} par seekh rahe hain. Stock market me sabse zaroori cheez hai disciplined learning aur capital preservation. Aap mujhse kisi bhi concept, formula ya risk rule ke baare me pooch sakte hain!`
          : `Hello! I am Prof. Pulse, your dedicated AI Trading Academy Tutor. You are currently exploring Level ${currentLevel}. In quantitative financial markets, capital preservation and understanding the mechanics precede all profits. What would you like to explore or clarify today?`,
      language: language,
      groundedConcepts: ["Capital Preservation", "Curriculum Guidance"],
      followUps:
        language === "hinglish"
          ? [
              "Demat aur Trading account kaise kaam karte hain?",
              "1% risk rule se position size kaise calculate karein?",
              "Candlestick wicks ka kya matlab hota hai?",
            ]
          : [
              "How does a Demat account keep my shares safe?",
              "Explain the 1% risk rule position sizing formula",
              "What is the danger of lookahead bias in backtesting?",
            ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const quickPrompts =
    language === "hinglish"
      ? [
          "Stock market me invest kaise shuru karein?",
          "Demat aur Trading account me kya farak hai?",
          "Candlestick chart kaise padhe?",
          "1% risk rule se shares calculate karke batao",
          "RSI 70 par turant sell kyu nahi karna chahiye?",
          "Indian market me STT aur brokerage kitna lagta hai?",
        ]
      : [
          "How do I start investing in stocks?",
          "Explain Demat custody vs broker trading account",
          "How do I read candlestick OHLC charts?",
          "Walk me through the 1% risk rule formula",
          "Why is RSI > 70 not an automatic short signal?",
          "Break down Indian statutory transaction frictions",
        ];

  const handleSend = async (qText?: string) => {
    const textToSend = qText || inputQuestion.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      language: language,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setLoading(true);

    try {
      // Call backend AI tutor endpoint
      const res = await fetch("http://localhost:8000/api/v1/academy/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          level: currentLevel,
          lesson_id: currentLessonId,
          language: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tutorMsg: ChatMessage = {
          id: `tutor-${Date.now()}`,
          sender: "tutor",
          text: data.answer,
          language: data.language,
          groundedConcepts: data.grounded_concepts,
          followUps: data.follow_up_suggestions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, tutorMsg]);
      } else {
        throw new Error("Backend offline or non-200");
      }
    } catch {
      // Offline heuristic fallback for static export and offline safety
      const fallbackMsg: ChatMessage = generateOfflineHeuristicResponse(textToSend, currentLevel, language);
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const generateOfflineHeuristicResponse = (
    query: string,
    lvl: number,
    lang: "en" | "hinglish"
  ): ChatMessage => {
    const q = query.toLowerCase();
    const learnerTier = lvl <= 2 ? "Level 1 • Absolute Beginner" : lvl <= 4 ? `Level ${lvl} • Intermediate` : `Level ${lvl} • Advanced`;
    let text = "";
    let concepts = ["8-Step Pedagogical Flow", "Demo AI Mode (Deterministic Engine)"];
    let followUps = ["How do I start investing in stocks?", "Explain Demat vs Trading accounts", "What is the 1% risk rule?"];

    if (lang === "hinglish") {
      if (q.includes("invest") || q.includes("shuru") || q.includes("start") || q.includes("share") || q.includes("karein")) {
        text = `🎯 Learner Profile: ${learnerTier}\nNamaste! Share market me invest karna koi lottery nahi hai, balki achhe businesses me hissedari (fractional ownership) lena hai.\n\n1. SIMPLE DEFINITION:\nShare ka matlab hota hai company me chhota hissa. Jab aap Reliance ya TCS ka share lete hain, to aap uske assets aur profits me partner bante hain.\n\n2. 5 ACTIONABLE STEPS:\n• Step 1: Teen Accounts Banayein: Bank Account (paisa), Trading Account (broker app jaha se order lagta hai), aur Demat Account (CDSL/NSDL ki electronic tijori jaha shares safe rehte hain).\n• Step 2: Index Fund (NIFTY 50 ETF) Se Shuru Karein: Kisi ek company me saara paisa lagane ki jagah NIFTY 50 ETF (jaise NIFTYBEES) lein jisse ek sath 50 top companies me hissa mil jata hai.\n• Step 3: Order Types: Market order (turant bhav par) vs Limit order (apne set kiye bhav par).\n• Step 4: Taxes & Frictions: Har trade par STT (0.1%), Brokerage (₹20 cap), GST aur Stamp duty lagti hai. Roz-roz faltu trade na karein.\n• Step 5: 1% Risk Rule: Hamesha wahi paisa lagayein jiski zaroorat 3-5 saal tak na ho.\n\n3. KEY TERMS:\n• Demat: Electronic tijori (CDSL/NSDL).\n• Broker: SEBI-approved gateway (Zerodha, Groww).\n• Exchange: NSE/BSE bazar.\n\n4. HYPOTHETICAL EXAMPLE:\n[Hypothetical Values]\n₹10,000 me se aapne ₹250 wale NIFTY ETF ke 20 units kharide (₹5,000). Total friction charge laga lagbhag ₹7.55. Net kharcha ₹5,007.55 aur ₹4,992.45 cash reserve raha.\n\n5. VISUAL EXPLANATION:\n👉 Right side par 'Market Flow Visualizer' dekhein: waha Bank ➔ Broker ➔ Exchange ➔ Demat Vault tak order pipeline clear dikhayi gayi hai.\n\n6. QUICK KNOWLEDGE CHECK:\n• Sawal: Agar broker band ho jaye, to kya aapke shares gayab ho jayenge?\n• Jawab: NAHI! Shares CDSL/NSDL depository me aapke naam par rehte hain.\n\n7. AGLA STEP:\nLevel 1 • Lesson 2: 'Exchanges, Brokers & Demat Accounts' explore karein!`;
        concepts = ["Fractional Ownership", "Demat & Trading Account", "NIFTY 50 ETF", "CDSL / NSDL"];
        followUps = ["Demat aur Trading account me kya farak hai?", "Market order aur Limit order me kya antar hai?", "1% risk rule se position size batao"];
      } else if (q.includes("demat") || q.includes("account") || q.includes("broker")) {
        text = `🎯 Learner Profile: ${learnerTier}\n1. SIMPLE DEFINITION:\nDemat account aapki digital tijori hai jisme shares electronic roop me rehte hain. Trading account order place karne ka interface hai.\n\n2. KAISE KAAM KARTA HAI:\nAap Trading App par Buy order lagate hain ➔ Broker order NSE/BSE ko bhejta hai ➔ Matching ke baad bank se paisa katta hai ➔ T+1 din me shares CDSL/NSDL Demat tijori me jama ho jate hain.\n\n3. HYPOTHETICAL EXAMPLE:\nMonday ko ₹3,000 ke shares kharide to Tuesday shaam tak Demat me credit ho jayenge.\n\n4. VISUAL:\n👉 Right side par 'Market Flow Visualizer' dekhein.\n\n5. CHECK:\nBroker ke band hone par bhi Demat shares 100% safe rehte hain!`;
        concepts = ["Demat Account", "Trading Account", "CDSL / NSDL", "T+1 Settlement"];
        followUps = ["NSE vs BSE me kya farak hai?", "Spread kya hota hai?", "Limit order kaise kaam karta hai?"];
      } else if (q.includes("candle") || q.includes("chart") || q.includes("wick")) {
        text = `🎯 Learner Profile: ${learnerTier}\n1. SIMPLE DEFINITION:\nCandlestick chart kisi specific timeframe me Buyers vs Sellers ki ladai ko 4 points me dikhata hai: Open, High, Low, Close (OHLC).\n\n2. COLOR MEANING:\n• Green: Close > Open (Buyers jeete).\n• Red: Close < Open (Sellers jeete).\n• Wicks: Price rejection dikhati hain.\n\n3. VISUAL:\n👉 Right side par 'Candlestick Anatomist' canvas me sliders move karke candle ka banna dekhein!\n\n4. CHECK:\nNeeche lambi wick ka matlab hai buyers ne lower prices reject karke aggressive buying ki!`;
        concepts = ["Candlestick OHLC", "Bullish / Bearish Body", "Price Rejection", "Candlestick Anatomist"];
        followUps = ["Support aur Resistance kaise banate hain?", "Hammer pattern kya hai?", "Volume kaise check karein?"];
      } else if (q.includes("risk") || q.includes("loss") || q.includes("size") || q.includes("stop")) {
        text = `🎯 Learner Profile: ${learnerTier}\n1. THE 1% RULE:\nKisi bhi ek trade par apne total capital ka 1% se zyada risk kabhi mat lein.\n\n2. FORMULA:\nShares = (Capital × 1%) / (Entry Price - Stop Loss Price)\n\n3. WORKED EXAMPLE:\n[Hypothetical]\n₹1,00,000 capital par 1% risk = ₹1,000. Entry = ₹500, Stop Loss = ₹480 (₹20 risk). Shares = ₹1,000 / ₹20 = 50 shares. Stop loss hit hone par bhi sirf ₹1,000 jayega.\n\n4. VISUAL:\n👉 Right side par 'Risk Calculator' me sliders adjust karein!`;
        concepts = ["1% Risk Rule", "Position Sizing Formula", "Capital Preservation"];
        followUps = ["1:2 Risk:Reward ratio kyu zaroori hai?", "Drawdown recover kaise hota hai?", "Concentration risk kya hai?"];
      } else {
        text = `🎯 Learner Profile: ${learnerTier}\nNamaste! Mai Prof. Pulse hu. Stock market me disciplined learning aur capital protection sabse ahem hai. Aap mujhse pooch sakte hain:\n• 'Stock market me invest kaise shuru karein?'\n• 'Demat aur Trading account me kya farak hai?'\n• '1% risk rule se position size kaise calculate karein?'\nPoochiye, kya seekhna chahte hain?`;
        followUps = ["Stock market me invest kaise shuru karein?", "Demat aur Trading account me kya farak hai?", "1% risk rule formula batao"];
      }
    } else {
      if (q.includes("invest") || q.includes("start") || q.includes("stock") || q.includes("how i") || q.includes("how to")) {
        text = `🎯 Learner Profile: ${learnerTier}\nWelcome to MarketPulse! Investing is about becoming a disciplined fractional part-owner of productive businesses—never gamble on short-term price noise.\n\n1. SIMPLE DEFINITION:\nA stock represents fractional ownership in a corporation. Buying 1 share of TCS or Reliance makes you a legal micro-owner of its assets and future cash flows.\n\n2. 5 ACTIONABLE STEPS TO START:\n• Step 1: Open Your Accounts: Bank Account (fiat capital), Trading Account (broker ordering terminal), Demat Account (electronic depository vault at CDSL/NSDL).\n• Step 2: Start with Broad Index ETFs: Begin with low-cost index ETFs like NIFTY 50 (NIFTYBEES) or S&P 500 ETFs to instantly diversify across 50 market leaders.\n• Step 3: Master Order Types: Market Order (instant fill at ask) vs Limit Order (fills only at your specified price or better).\n• Step 4: Model Real Frictions: Brokerage (capped at ₹20), STT (0.1%), GST (18%), and Stamp Duty. Never over-trade.\n• Step 5: Follow the 1% Capital Rule: Invest capital you will not require for at least 3-5 years.\n\n3. KEY TERMS:\n• Demat: Digital locker safely holding securities independent of the broker.\n• Broker: SEBI-regulated order routing gateway.\n• Exchange: NSE/BSE auction marketplace.\n\n4. HYPOTHETICAL EDUCATIONAL EXAMPLE:\n[Hypothetical Values for Teaching]\nWith ₹10,000 virtual capital, you buy 20 units of an Index ETF at ₹250/unit (₹5,000). Total friction fees ≈ ₹7.55. Net invested: ₹5,007.55; cash reserve: ₹4,992.45.\n\n5. VISUAL EXPLANATION:\n👉 Observe the 'Market Flow Visualizer' on the right canvas to watch capital flow from Bank ➔ Broker ➔ Exchange ➔ Demat Vault.\n\n6. QUICK KNOWLEDGE CHECK:\n• Question: If your broker goes bankrupt, do you lose your shares?\n• Answer: NO! Your shares are stored directly in your Demat account at national depositories (CDSL/NSDL).\n\n7. NEXT LESSON:\nExplore Level 1 • Lesson 2: 'Exchanges, Brokers & Demat Accounts' or test simulated orders in the Paper Trading Sandbox!`;
        concepts = ["Fractional Ownership", "Demat vs Trading Account", "NIFTY 50 Index ETF", "CDSL / NSDL Custody"];
        followUps = ["What is the difference between Demat and Trading accounts?", "What is a Limit vs Market order?", "How do I calculate position size using the 1% risk rule?"];
      } else if (q.includes("demat") || q.includes("account") || q.includes("broker")) {
        text = `🎯 Learner Profile: ${learnerTier}\n1. SIMPLE DEFINITION:\nA Demat account holds shares in electronic custody directly with national depositories (CDSL/NSDL). Your broker provides the trading terminal to route orders to NSE/BSE.\n\n2. STEP-BY-STEP FLOW:\nOrder placed in Broker App ➔ Routed to NSE/BSE ➔ Matched with Seller ➔ Bank debited ➔ Shares credited to Demat within T+1 days.\n\n3. VISUAL:\n👉 View the 'Market Flow Visualizer' on the canvas.\n\n4. KNOWLEDGE CHECK:\nYour share ownership is completely independent of the broker's corporate solvency!`;
        concepts = ["Demat Custody", "CDSL / NSDL", "T+1 Settlement"];
        followUps = ["Explain T+1 rolling settlement", "What is the bid-ask spread?", "Market vs Limit orders"];
      } else if (q.includes("candle") || q.includes("chart") || q.includes("wick")) {
        text = `🎯 Learner Profile: ${learnerTier}\n1. SIMPLE DEFINITION:\nA candlestick visualizes four price points for a timeframe: Open, High, Low, Close (OHLC).\n\n2. COLOR ANATOMY:\n• Green: Close > Open (buyers controlled the session).\n• Red: Close < Open (sellers controlled the session).\n• Wicks: Show rejection of extreme prices.\n\n3. VISUAL:\n👉 Open the 'Candlestick Anatomist' on the right to interactively move OHLC sliders!\n\n4. KNOWLEDGE CHECK:\nA long lower wick indicates strong buying rejection at support!`;
        concepts = ["Candlestick OHLC", "Bullish vs Bearish", "Price Rejection", "Candlestick Anatomist"];
        followUps = ["What does a Doji signify?", "How do support levels form?", "How does volume confirm candles?"];
      } else if (q.includes("risk") || q.includes("loss") || q.includes("size") || q.includes("stop")) {
        text = `🎯 Learner Profile: ${learnerTier}\n1. THE 1% RULE:\nNever risk more than 1% of total portfolio equity on any single trade.\n\n2. FORMULA:\nShares = (Capital × 1%) / (Entry Price - Stop Loss Price)\n\n3. WORKED EXAMPLE:\n[Hypothetical]\n₹1,00,000 equity with 1% risk = ₹1,000. Entry = ₹2,500, Stop Loss = ₹2,450 (₹50 risk/share). Shares = ₹1,000 / ₹50 = 20 shares. If stop loss triggers, you lose only 1%, remaining mathematically solvent.\n\n4. VISUAL:\n👉 Test the 'Risk Calculator' on the canvas!`;
        concepts = ["1% Risk Rule", "Deterministic Position Sizing", "Capital Preservation"];
        followUps = ["Why is a 1:2 Risk-to-Reward ratio essential?", "Drawdown recovery asymmetry", "Concentration caps at 25%"];
      } else {
        text = `🎯 Learner Profile: ${learnerTier}\nHello! I am Prof. Pulse, your AI Trading Tutor. In quantitative markets, capital preservation and understanding mechanics precede all profits. Ask me:\n• 'How do I start investing in stocks?'\n• 'Explain Demat custody vs broker trading account'\n• 'How do I calculate position size using the 1% risk rule?'\nWhat would you like to explore?`;
        followUps = ["How do I start investing in stocks?", "Explain Demat custody vs broker trading account", "Show me the 1% risk rule"];
      }
    }

    return {
      id: `tutor-offline-${Date.now()}`,
      sender: "tutor",
      text,
      language: lang,
      groundedConcepts: concepts,
      followUps,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-lg flex flex-col h-[650px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-lg shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
              Prof. Pulse — AI Trading Tutor
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                Level {currentLevel} Guide
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {language === "hinglish"
                ? "Dhairya ke sath step-by-step seekhein • 100% Zero-Trust Privacy Protected"
                : "Patient, step-by-step conceptual guidance • 100% Zero-Trust Privacy Protected"}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => onLanguageChange("en")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              language === "en" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange("hinglish")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              language === "hinglish" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 flex-shrink-0 no-scrollbar">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Suggested:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Demo AI Mode Transparency Banner */}
      <div className="bg-sky-950/40 border border-sky-800/40 rounded-lg px-3 py-1.5 mb-2 flex items-center justify-between text-[11px] text-sky-300 flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <strong>Demo AI Mode Active</strong> • Structured 8-Step Pedagogical Engine (Deterministic • ₹0 Cost)
        </span>
        <span className="text-[10px] text-slate-400">Zero Cloud LLM Token Charges</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                msg.sender === "user"
                  ? "bg-sky-600 text-white rounded-br-none"
                  : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wider text-sky-400">
                  {msg.sender === "user" ? "You (Learner)" : "Prof. Pulse (AI Tutor)"}
                </span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-slate-100">{msg.text}</p>

              {/* Grounded Concepts Tags */}
              {msg.groundedConcepts && msg.groundedConcepts.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Grounded Concepts:</span>
                  {msg.groundedConcepts.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-900 border border-slate-700/60 px-2 py-0.5 rounded text-sky-300 font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Follow-up suggestions */}
            {msg.followUps && msg.followUps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                {msg.followUps.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(f)}
                    className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800 px-2.5 py-1 rounded-full transition flex items-center gap-1"
                  >
                    <span>→ {f}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-3 bg-slate-950 rounded-xl border border-slate-800 max-w-[50%]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Prof. Pulse is formulating guidance...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            language === "hinglish"
              ? "Prof. Pulse se kuch bhi poochein (jaise: RSI overbought kyu hota hai?)..."
              : "Ask Prof. Pulse anything (e.g. How does 1% position sizing work?)..."
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuestion.trim() || loading}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </div>

      {/* Safety Disclaimer */}
      <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 flex-shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          Educational Simulation Only • Zero PII transmitted • Never replaces registered financial advice
        </span>
      </div>
    </div>
  );
};
