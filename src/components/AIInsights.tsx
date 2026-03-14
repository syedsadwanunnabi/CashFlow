import { useApp } from "@/contexts/AppContext";
import type { Transaction } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import { Sparkles, Send, User, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";

interface Props {
  transactions: Transaction[];
  monthlySpend: number;
  burnRate: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIInsights({ transactions, monthlySpend, burnRate }: Props) {
  const { t, lang } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => buildStats(transactions, monthlySpend, burnRate), [transactions, monthlySpend, burnRate]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = lang === "bn"
        ? `👋 আসসালামু আলাইকুম! আমি আপনার আর্থিক সহায়ক। আপনার খরচ, সঞ্চয়, বা বাজেট সম্পর্কে যেকোনো প্রশ্ন করুন!\n\nকিছু ধারণা:\n• "আমার খরচ কেমন?"\n• "এই মাসে কোথায় বেশি খরচ হয়েছে?"\n• "সঞ্চয় বাড়ানোর উপায় কী?"`
        : `👋 Hello! I'm your financial advisor. Ask me anything about your spending, savings, or budgeting!\n\nSome ideas:\n• "How am I spending this month?"\n• "Where does most of my money go?"\n• "How can I save more?"`;
      setMessages([{ role: "assistant", content: welcome }]);
    }
  }, []);

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(q, stats, lang);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden" style={{ height: "calc(100vh - 10rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t("aiAdvice")}</p>
          <p className="text-[10px] text-muted-foreground">{lang === "bn" ? "আপনার আর্থিক সহায়ক" : "Your financial advisor"}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-primary/15" : "bg-secondary"
            }`}>
              {msg.role === "user"
                ? <User className="h-3.5 w-3.5 text-primary" />
                : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              }
            </div>
            <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground"
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="bg-secondary rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === "bn" ? "আপনার প্রশ্ন লিখুন..." : "Ask about your finances..."}
            className="flex-1 rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="rounded-lg bg-primary px-3 py-2.5 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Local AI logic ---

interface Stats {
  totalTxns: number;
  monthlySpend: number;
  monthlyIncome: number;
  burnRate: number;
  topCategory: { name: string; amount: number; pct: number } | null;
  categoryBreakdown: { name: string; amount: number; pct: number }[];
  bankCount: number;
  topBank: { name: string; spent: number } | null;
  weekendSpendPct: number;
  balance: number;
  savingsRate: number;
}

function buildStats(txns: Transaction[], monthlySpend: number, burnRate: number): Stats {
  const income = txns.filter(t => t.type === "received").reduce((s, t) => s + t.amount, 0);
  const catSpend: Record<string, number> = {};
  const bankSpend: Record<string, number> = {};
  let weekendSpend = 0;

  txns.filter(t => t.type === "sent").forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
    bankSpend[t.bank] = (bankSpend[t.bank] || 0) + t.amount;
    if ([0, 6].includes(new Date(t.date).getDay())) weekendSpend += t.amount;
  });

  const sorted = Object.entries(catSpend).sort(([, a], [, b]) => b - a);
  const categoryBreakdown = sorted.map(([name, amount]) => ({
    name, amount, pct: Math.round((amount / (monthlySpend || 1)) * 100),
  }));

  const topCat = sorted[0];
  const topBankEntry = Object.entries(bankSpend).sort(([, a], [, b]) => b - a)[0];

  return {
    totalTxns: txns.length,
    monthlySpend,
    monthlyIncome: income,
    burnRate,
    topCategory: topCat ? { name: topCat[0], amount: topCat[1], pct: Math.round((topCat[1] / (monthlySpend || 1)) * 100) } : null,
    categoryBreakdown,
    bankCount: new Set(txns.map(t => t.bank)).size,
    topBank: topBankEntry ? { name: topBankEntry[0], spent: topBankEntry[1] } : null,
    weekendSpendPct: monthlySpend > 0 ? Math.round((weekendSpend / monthlySpend) * 100) : 0,
    balance: txns.reduce((s, t) => s + (t.type === "received" ? t.amount : -t.amount), 0),
    savingsRate: income > 0 ? Math.round(((income - monthlySpend) / income) * 100) : 0,
  };
}

function generateResponse(query: string, stats: Stats, lang: string): string {
  const q = query.toLowerCase();
  const bn = lang === "bn";

  if (stats.totalTxns === 0) {
    return bn
      ? "আপনার এখনো কোনো লেনদেন নেই। প্রথমে কিছু লেনদেন যোগ করুন, তাহলে আমি বিশ্লেষণ করতে পারব!"
      : "You don't have any transactions yet. Add some transactions first, and I'll be able to analyze your finances!";
  }

  // Spending overview
  if (q.match(/spend|খরচ|ব্যয়|how.*month|কেমন/)) {
    const cats = stats.categoryBreakdown.slice(0, 4).map(c =>
      `  • ${CATEGORIES[c.name as keyof typeof CATEGORIES]?.icon || "📦"} ${c.name}: ৳${c.amount.toLocaleString()} (${c.pct}%)`
    ).join("\n");

    return bn
      ? `📊 এই মাসে আপনার মোট খরচ: ৳${stats.monthlySpend.toLocaleString()}\nদৈনিক গড়: ৳${stats.burnRate.toLocaleString()}\n\nশীর্ষ বিভাগ:\n${cats}\n\n${stats.burnRate > 800 ? "⚠️ দৈনিক খরচ কিছুটা বেশি। অপ্রয়োজনীয় খরচ কমানোর চেষ্টা করুন।" : "✅ আপনার খরচ নিয়ন্ত্রণে আছে!"}`
      : `📊 This month you've spent: ৳${stats.monthlySpend.toLocaleString()}\nDaily average: ৳${stats.burnRate.toLocaleString()}\n\nTop categories:\n${cats}\n\n${stats.burnRate > 800 ? "⚠️ Your daily spending is on the higher side. Consider cutting non-essentials." : "✅ Your spending looks well-controlled!"}`;
  }

  // Savings
  if (q.match(/save|saving|সঞ্চয়|বাঁচা/)) {
    return bn
      ? `💰 আপনার সঞ্চয় হার: ${stats.savingsRate}%\n\nআয়: ৳${stats.monthlyIncome.toLocaleString()}\nখরচ: ৳${stats.monthlySpend.toLocaleString()}\nব্যালেন্স: ৳${stats.balance.toLocaleString()}\n\n${stats.savingsRate < 20 ? "📌 ৫০/৩০/২০ নিয়ম চেষ্টা করুন — আয়ের ৫০% প্রয়োজন, ৩০% ইচ্ছা, ২০% সঞ্চয়।\n\nসঞ্চয় বাড়ানোর উপায়:\n• খাবারে বাইরের খরচ কমান\n• সাবস্ক্রিপশন চেক করুন\n• বাজেট ঠিক করুন" : "✅ দারুণ! আপনি ভালো সঞ্চয় করছেন। এভাবে চালিয়ে যান!"}`
      : `💰 Your savings rate: ${stats.savingsRate}%\n\nIncome: ৳${stats.monthlyIncome.toLocaleString()}\nSpending: ৳${stats.monthlySpend.toLocaleString()}\nBalance: ৳${stats.balance.toLocaleString()}\n\n${stats.savingsRate < 20 ? "📌 Try the 50/30/20 rule — 50% needs, 30% wants, 20% savings.\n\nWays to save more:\n• Reduce dining out\n• Review subscriptions\n• Set a fixed budget per category" : "✅ Great! You're saving well. Keep it up!"}`;
  }

  // Top category / where money goes
  if (q.match(/where|category|কোথায়|বিভাগ|most|বেশি/)) {
    if (!stats.topCategory) return bn ? "পর্যাপ্ত তথ্য নেই।" : "Not enough data to analyze.";
    const cats = stats.categoryBreakdown.map(c =>
      `${CATEGORIES[c.name as keyof typeof CATEGORIES]?.icon || "📦"} ${c.name}: ৳${c.amount.toLocaleString()} (${c.pct}%)`
    ).join("\n");
    return bn
      ? `📋 আপনার খরচের বিভাগভিত্তিক বিশ্লেষণ:\n\n${cats}\n\n🔍 সবচেয়ে বেশি খরচ: ${stats.topCategory.name} (${stats.topCategory.pct}%)`
      : `📋 Your spending breakdown:\n\n${cats}\n\n🔍 Top spending: ${stats.topCategory.name} at ${stats.topCategory.pct}%`;
  }

  // Bank related
  if (q.match(/bank|ব্যাংক|mfs|বিকাশ|নগদ/)) {
    return bn
      ? `🏦 আপনি ${stats.bankCount}টি ভিন্ন ব্যাংক/এমএফএস ব্যবহার করছেন।\n\n${stats.topBank ? `সবচেয়ে বেশি খরচ: ${stats.topBank.name} (৳${stats.topBank.spent.toLocaleString()})` : ""}\n\n${stats.bankCount > 3 ? "💡 সহজ ট্র্যাকিংয়ের জন্য ২-৩টি প্রধান অ্যাকাউন্টে খরচ রাখুন।" : "✅ আপনার ব্যাংক সংখ্যা ঠিক আছে।"}`
      : `🏦 You're using ${stats.bankCount} different banks/MFS providers.\n\n${stats.topBank ? `Most spending through: ${stats.topBank.name} (৳${stats.topBank.spent.toLocaleString()})` : ""}\n\n${stats.bankCount > 3 ? "💡 Consider consolidating to 2-3 main accounts for easier tracking." : "✅ Your bank usage is well-managed."}`;
  }

  // Weekend
  if (q.match(/weekend|সাপ্তাহিক|ছুটি/)) {
    return bn
      ? `📅 আপনার মোট খরচের ${stats.weekendSpendPct}% সাপ্তাহিক ছুটিতে হয়।\n\n${stats.weekendSpendPct > 40 ? "⚠️ এটা বেশ বেশি। ছুটির দিনে বাজেট ঠিক করুন।" : "✅ সাপ্তাহিক ছুটির খরচ নিয়ন্ত্রণে আছে।"}`
      : `📅 ${stats.weekendSpendPct}% of your spending happens on weekends.\n\n${stats.weekendSpendPct > 40 ? "⚠️ That's quite high. Consider setting a weekend budget." : "✅ Your weekend spending is under control."}`;
  }

  // Budget / advice
  if (q.match(/budget|advice|tip|পরামর্শ|বাজেট|টিপ/)) {
    return bn
      ? `💡 আপনার জন্য আর্থিক পরামর্শ:\n\n1. ৫০/৩০/২০ নিয়ম অনুসরণ করুন\n2. প্রতিদিনের খরচ ৳${Math.round(stats.burnRate * 0.8).toLocaleString()} এর নিচে রাখার চেষ্টা করুন\n3. ${stats.topCategory ? `${stats.topCategory.name} খরচ ${stats.topCategory.pct}% — কমানোর সুযোগ আছে` : ""}\n4. জরুরি তহবিল রাখুন (৩-৬ মাসের খরচ)\n5. প্রতি মাসে একটি নির্দিষ্ট পরিমাণ সঞ্চয় করুন`
      : `💡 Financial advice for you:\n\n1. Follow the 50/30/20 rule\n2. Try to keep daily spending under ৳${Math.round(stats.burnRate * 0.8).toLocaleString()}\n3. ${stats.topCategory ? `${stats.topCategory.name} is ${stats.topCategory.pct}% of spending — room to optimize` : ""}\n4. Build an emergency fund (3-6 months of expenses)\n5. Set a fixed savings amount each month`;
  }

  // Health / status
  if (q.match(/health|status|score|স্বাস্থ্য|অবস্থা/)) {
    const score = stats.burnRate < 300 ? "Excellent 😎" : stats.burnRate < 600 ? "Good 🙂" : stats.burnRate < 1000 ? "Caution 😬" : "Danger 🔥";
    return bn
      ? `📈 আর্থিক স্বাস্থ্য: ${score}\n\nদৈনিক খরচ: ৳${stats.burnRate.toLocaleString()}\nসঞ্চয় হার: ${stats.savingsRate}%\nমোট ব্যালেন্স: ৳${stats.balance.toLocaleString()}`
      : `📈 Financial Health: ${score}\n\nDaily burn rate: ৳${stats.burnRate.toLocaleString()}\nSavings rate: ${stats.savingsRate}%\nTotal balance: ৳${stats.balance.toLocaleString()}`;
  }

  // Default / general
  return bn
    ? `আপনার আর্থিক সারাংশ:\n\n💰 ব্যালেন্স: ৳${stats.balance.toLocaleString()}\n📉 এই মাসে খরচ: ৳${stats.monthlySpend.toLocaleString()}\n📈 এই মাসে আয়: ৳${stats.monthlyIncome.toLocaleString()}\n🔥 দৈনিক গড় খরচ: ৳${stats.burnRate.toLocaleString()}\n\nআরো জানতে জিজ্ঞাসা করুন:\n• "কোথায় বেশি খরচ হচ্ছে?"\n• "সঞ্চয় কেমন?"\n• "বাজেট পরামর্শ দাও"`
    : `Here's your financial summary:\n\n💰 Balance: ৳${stats.balance.toLocaleString()}\n📉 Spent this month: ৳${stats.monthlySpend.toLocaleString()}\n📈 Income this month: ৳${stats.monthlyIncome.toLocaleString()}\n🔥 Daily avg spend: ৳${stats.burnRate.toLocaleString()}\n\nYou can ask me:\n• "Where does my money go?"\n• "How are my savings?"\n• "Give me budgeting tips"`;
}
