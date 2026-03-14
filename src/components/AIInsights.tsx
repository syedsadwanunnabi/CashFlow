import { useApp } from "@/contexts/AppContext";
import type { Transaction } from "@/lib/data";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface Props {
  transactions: Transaction[];
  monthlySpend: number;
  burnRate: number;
}

interface Insight {
  emoji: string;
  text: string;
  textBn: string;
}

export default function AIInsights({ transactions, monthlySpend, burnRate }: Props) {
  const { t, lang } = useApp();

  const insights = useMemo(() => generateInsights(transactions, monthlySpend, burnRate), [transactions, monthlySpend, burnRate]);

  const healthScore = burnRate < 300 ? 4 : burnRate < 600 ? 3 : burnRate < 1000 ? 2 : 1;
  const healthEmoji = ["", "🔥", "😬", "🙂", "😎"][healthScore];
  const healthLabel = [
    "", t("danger"), t("caution"), t("good"), t("excellent")
  ][healthScore];

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-border bg-ai-surface p-5 text-center"
      >
        <p className="text-sm font-medium text-muted-foreground mb-2">{t("financialHealth")}</p>
        <p className="text-5xl mb-2">{healthEmoji}</p>
        <p className="text-lg font-bold text-foreground">{healthLabel}</p>
      </motion.div>

      {/* Insights */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-ai-accent" />
          <h3 className="text-sm font-semibold text-foreground">{t("aiAdvice")}</h3>
        </div>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="rounded-lg bg-ai-surface/50 border border-ai-accent/20 p-3"
            >
              <p className="text-sm text-foreground">
                <span className="mr-2">{insight.emoji}</span>
                {lang === "bn" ? insight.textBn : insight.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateInsights(txns: Transaction[], monthlySpend: number, burnRate: number): Insight[] {
  const insights: Insight[] = [];

  // Category analysis
  const catSpend: Record<string, number> = {};
  txns.filter(t => t.type === "sent").forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
  });
  const topCat = Object.entries(catSpend).sort(([, a], [, b]) => b - a)[0];
  if (topCat) {
    const pct = Math.round((topCat[1] / (monthlySpend || 1)) * 100);
    insights.push({
      emoji: "📊",
      text: `Your top spending category is ${topCat[0]} at ${pct}% of total spend (৳${Math.round(topCat[1]).toLocaleString()}).`,
      textBn: `আপনার সর্বোচ্চ খরচের বিভাগ হলো ${topCat[0]} মোট খরচের ${pct}% (৳${Math.round(topCat[1]).toLocaleString()})।`,
    });
  }

  // Burn rate warning
  if (burnRate > 800) {
    insights.push({
      emoji: "🔥",
      text: `Your daily burn rate is ৳${burnRate.toLocaleString()}. Consider reducing non-essential spending.`,
      textBn: `আপনার দৈনিক খরচ ৳${burnRate.toLocaleString()}। অপ্রয়োজনীয় খরচ কমানোর চেষ্টা করুন।`,
    });
  } else {
    insights.push({
      emoji: "✅",
      text: `Great! Your daily burn rate of ৳${burnRate.toLocaleString()} is manageable.`,
      textBn: `দারুণ! আপনার দৈনিক খরচ ৳${burnRate.toLocaleString()} নিয়ন্ত্রণে আছে।`,
    });
  }

  // Bank diversity
  const bankCount = new Set(txns.map(t => t.bank)).size;
  if (bankCount > 3) {
    insights.push({
      emoji: "🏦",
      text: `You're using ${bankCount} different banks/MFS. Consider consolidating for easier tracking.`,
      textBn: `আপনি ${bankCount}টি ভিন্ন ব্যাংক/এমএফএস ব্যবহার করছেন। সহজ ট্র্যাকিংয়ের জন্য একত্রিত করুন।`,
    });
  }

  // Weekend spending
  const weekendSpend = txns
    .filter(t => t.type === "sent" && [0, 6].includes(new Date(t.date).getDay()))
    .reduce((s, t) => s + t.amount, 0);
  const weekdaySpend = monthlySpend - weekendSpend;
  if (weekendSpend > weekdaySpend * 0.5) {
    insights.push({
      emoji: "📅",
      text: "Your weekend spending is significantly high. Try budgeting for weekends separately.",
      textBn: "আপনার সাপ্তাহিক ছুটির খরচ অনেক বেশি। ছুটির দিনের জন্য আলাদা বাজেট করুন।",
    });
  }

  // Savings tip
  insights.push({
    emoji: "💡",
    text: `Tip: Try the 50/30/20 rule — 50% needs, 30% wants, 20% savings from your income.`,
    textBn: `টিপ: ৫০/৩০/২০ নিয়ম চেষ্টা করুন — আয়ের ৫০% প্রয়োজন, ৩০% ইচ্ছা, ২০% সঞ্চয়।`,
  });

  return insights;
}
