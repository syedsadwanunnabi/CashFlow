import { useApp } from "@/contexts/AppContext";
import { CATEGORIES, type Transaction, type CategoryId } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import { motion } from "framer-motion";

interface Props { transactions: Transaction[] }

export default function CategoryBreakdown({ transactions }: Props) {
  const { t } = useApp();

  const catData = (Object.keys(CATEGORIES) as CategoryId[]).map(cat => {
    const spent = transactions
      .filter(tx => tx.category === cat && tx.type === "sent")
      .reduce((s, tx) => s + tx.amount, 0);
    return { id: cat, icon: CATEGORIES[cat].icon, spent };
  }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent);

  const total = catData.reduce((s, c) => s + c.spent, 0) || 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{t("categories")}</h3>
      <div className="space-y-3">
        {catData.map((c, i) => {
          const pct = Math.round((c.spent / total) * 100);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="text-lg">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">{t(c.id as TranslationKey)}</span>
                  <span className="text-muted-foreground">{pct}% · ৳{c.spent.toLocaleString("en-BD")}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.03 + 0.1, duration: 0.4 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
