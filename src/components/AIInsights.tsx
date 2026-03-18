import { useApp } from "@/contexts/AppContext";
import type { Transaction } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  stats,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  stats: Record<string, unknown>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, stats }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response stream");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

function buildStats(txns: Transaction[], monthlySpend: number, burnRate: number) {
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

  return {
    totalTxns: txns.length,
    monthlySpend,
    monthlyIncome: income,
    burnRate,
    categoryBreakdown,
    bankCount: new Set(txns.map(t => t.bank)).size,
    topBank: Object.entries(bankSpend).sort(([, a], [, b]) => b - a)[0] || null,
    weekendSpendPct: monthlySpend > 0 ? Math.round((weekendSpend / monthlySpend) * 100) : 0,
    balance: txns.reduce((s, t) => s + (t.type === "received" ? t.amount : -t.amount), 0),
    savingsRate: income > 0 ? Math.round(((income - monthlySpend) / income) * 100) : 0,
  };
}

export default function AIInsights({ transactions, monthlySpend, burnRate }: Props) {
  const { t, lang } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => buildStats(transactions, monthlySpend, burnRate), [transactions, monthlySpend, burnRate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = lang === "bn"
        ? `👋 আসসালামু আলাইকুম! আমি আপনার AI আর্থিক সহায়ক। আপনার খরচ, সঞ্চয়, বা বাজেট সম্পর্কে যেকোনো প্রশ্ন করুন!\n\nকিছু ধারণা:\n• "আমার খরচ কেমন?"\n• "এই মাসে কোথায় বেশি খরচ হয়েছে?"\n• "সঞ্চয় বাড়ানোর উপায় কী?"`
        : `👋 Hello! I'm your AI financial advisor powered by Gemini. Ask me anything about your spending, savings, or budgeting!\n\nSome ideas:\n• "How am I spending this month?"\n• "Where does most of my money go?"\n• "How can I save more?"`;
      setMessages([{ role: "assistant", content: welcome }]);
    }
  }, []);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";
    const allMessages = [...messages.filter(m => m !== messages[0]), userMsg]; // exclude welcome

    try {
      await streamChat({
        messages: allMessages,
        stats,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && prev.length > 1 && last.content === assistantSoFar.slice(0, -chunk.length)) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
            }
            if (last?.role === "assistant" && last.content !== messages[0]?.content) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => setIsStreaming(false),
        onError: (msg) => {
          setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
          setIsStreaming(false);
        },
      });
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
      setIsStreaming(false);
    }
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
          <p className="text-[10px] text-muted-foreground">
            {lang === "bn" ? "Gemini দ্বারা চালিত" : "Powered by Gemini"}
          </p>
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
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
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
            disabled={!input.trim() || isStreaming}
            className="rounded-lg bg-primary px-3 py-2.5 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
