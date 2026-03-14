import { useApp } from "@/contexts/AppContext";
import { BANKS, type Transaction, type BankId } from "@/lib/data";
import { motion } from "framer-motion";
import { TrendingDown, CalendarDays, Wallet, Plus } from "lucide-react";

interface Props {
  transactions: Transaction[];
  totalBalance: number;
  monthlySpend: number;
}

export default function WalletOverview({ transactions, totalBalance, monthlySpend }: Props) {
  const { t, lang } = useApp();

  // Spent today
  const today = new Date().toISOString().slice(0, 10);
  const spentToday = transactions
    .filter(tx => tx.type === "sent" && tx.date.startsWith(today))
    .reduce((s, tx) => s + tx.amount, 0);

  // Per-bank balances
  const bankBalances = (Object.keys(BANKS) as BankId[]).map(id => {
    const txns = transactions.filter(tx => tx.bank === id);
    const balance = txns.reduce((s, tx) => s + (tx.type === "received" ? tx.amount : -tx.amount), 0);
    return { id, bank: BANKS[id], balance, txCount: txns.length };
  }).filter(b => b.txCount > 0).sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-6">
      {/* Hero Balance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <p className="text-sm text-muted-foreground mb-1">{t("totalBalance")}</p>
        <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          ৳{Math.abs(totalBalance).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>

        {/* Quick Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-secondary/60 p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{t("spentToday")}</span>
            </div>
            <p className="text-xl font-bold text-foreground">৳{spentToday.toLocaleString("en-BD", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <TrendingDown className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{t("monthlySpend")}</span>
            </div>
            <p className="text-xl font-bold text-foreground">৳{monthlySpend.toLocaleString("en-BD", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </motion.div>

      {/* Account Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">{t("accounts")}</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bankBalances.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: `hsl(var(${b.bank.color}) / 0.15)`,
                    color: `hsl(var(${b.bank.color}))`,
                  }}
                >
                  {b.bank.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {lang === "bn" ? b.bank.nameBn : b.bank.name}
                </span>
              </div>
              <p className={`text-lg font-bold ${b.balance >= 0 ? "text-foreground" : "text-destructive"}`}>
                ৳{b.balance.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{b.txCount} {lang === "bn" ? "লেনদেন" : "transactions"}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
