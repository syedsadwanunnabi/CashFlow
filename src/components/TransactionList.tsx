import { useApp } from "@/contexts/AppContext";
import { BANKS, CATEGORIES, type Transaction } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

interface Props { transactions: Transaction[] }

export default function TransactionList({ transactions }: Props) {
  const { t, lang } = useApp();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? transactions : transactions.slice(0, 8);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{t("recentTransactions")}</h3>
        {transactions.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {showAll ? t("seeLess") : t("seeMore")}
          </button>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">{t("noData")}</p>
      ) : (
        <div className="space-y-2">
          {visible.map(tx => {
            const bank = BANKS[tx.bank];
            const cat = CATEGORIES[tx.category];
            return (
              <div key={tx.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                <span className="text-base">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "bn" ? bank.nameBn : bank.name} · {t(tx.category as TranslationKey)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold flex items-center gap-1 ${
                    tx.type === "balance" ? "text-accent-foreground" : tx.type === "received" ? "text-primary" : "text-foreground"
                  }`}>
                    {tx.type === "balance" ? <Wallet className="h-3 w-3" /> : tx.type === "received" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                    ৳{tx.amount.toLocaleString("en-BD")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
