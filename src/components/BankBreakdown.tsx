import { useApp } from "@/contexts/AppContext";
import { BANKS, type Transaction, type BankId } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Props { transactions: Transaction[] }

const sortTransactionsChronologically = (items: Transaction[]) =>
  items
    .map((tx, index) => ({ tx, index }))
    .sort((a, b) => {
      const timeDiff = new Date(a.tx.date).getTime() - new Date(b.tx.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.index - a.index;
    })
    .map(({ tx }) => tx);

export default function BankBreakdown({ transactions }: Props) {
  const { t, lang } = useApp();

  const bankData = Object.entries(BANKS).map(([id, bank]) => {
    const txns = transactions.filter(tx => tx.bank === id);
    const sorted = sortTransactionsChronologically(txns);
    const spent = txns.filter(tx => tx.type === "sent").reduce((s, tx) => s + tx.amount, 0);
    const received = txns.filter(tx => tx.type === "received").reduce((s, tx) => s + tx.amount, 0);
    
    // Balance entries reset, inflows/outflows adjust
    let balance = 0;
    for (const tx of sorted) {
      if (tx.type === "balance") balance = tx.amount;
      else if (tx.type === "received") balance += tx.amount;
      else balance -= tx.amount;
    }
    
    return { id: id as BankId, bank, txCount: txns.length, spent, received, balance };
  }).filter(b => b.txCount > 0).sort((a, b) => b.balance - a.balance);

  if (bankData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bankData.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-5 hover:bg-secondary/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor: `hsl(var(${b.bank.color}) / 0.15)`,
                  color: `hsl(var(${b.bank.color}))`,
                }}
              >
                {b.bank.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === "bn" ? b.bank.nameBn : b.bank.name}
                </p>
                <p className="text-xs text-muted-foreground">{b.txCount} {lang === "bn" ? "লেনদেন" : "transactions"}</p>
              </div>
            </div>
            <p className={`text-lg font-bold ${b.balance >= 0 ? "text-foreground" : "text-destructive"}`}>
              ৳{Math.abs(b.balance).toLocaleString("en-BD", { maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* Inflow / Outflow row */}
          <div className="flex gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <ArrowDownLeft className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">{t("inflow")}:</span>
              <span className="text-xs font-semibold text-primary">৳{b.received.toLocaleString("en-BD", { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs text-muted-foreground">{t("outflow")}:</span>
              <span className="text-xs font-semibold text-destructive">৳{b.spent.toLocaleString("en-BD", { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
