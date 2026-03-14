import { useApp } from "@/contexts/AppContext";
import { BANKS, type Transaction, type BankId } from "@/lib/data";
import { motion } from "framer-motion";
import { TrendingDown, CalendarDays, Wallet } from "lucide-react";

interface Props {
  transactions: Transaction[];
  totalBalance: number;
  monthlySpend: number;
}

/** Compute per-bank balance: balance entries reset, inflows/outflows adjust */
function computeBankBalances(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const bankMap = new Map<BankId, { balance: number; txCount: number; bankName: string; bankNameBn: string; color: string }>();

  for (const tx of sorted) {
    const bank = BANKS[tx.bank];
    if (!bank) continue;

    if (!bankMap.has(tx.bank)) {
      bankMap.set(tx.bank, { balance: 0, txCount: 0, bankName: bank.name, bankNameBn: bank.nameBn, color: bank.color });
    }
    const entry = bankMap.get(tx.bank)!;
    entry.txCount++;

    if (tx.type === "balance") {
      entry.balance = tx.amount;
    } else if (tx.type === "received") {
      entry.balance += tx.amount;
    } else {
      entry.balance -= tx.amount;
    }
  }

  return Array.from(bankMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .filter(b => b.txCount > 0)
    .sort((a, b) => b.balance - a.balance);
}

export default function WalletOverview({ transactions, totalBalance, monthlySpend }: Props) {
  const { t, lang } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const spentToday = transactions
    .filter(tx => tx.type === "sent" && tx.date.startsWith(today))
    .reduce((s, tx) => s + tx.amount, 0);

  const bankBalances = computeBankBalances(transactions);

  // Use wallet-aware total: sum of per-bank computed balances
  const walletTotal = bankBalances.reduce((s, b) => s + b.balance, 0);

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
          ৳{Math.abs(walletTotal).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>

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

      {/* My Wallets / Accounts */}
      {bankBalances.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{t("myWallets")}</h3>
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
                      backgroundColor: `hsl(var(${b.color}) / 0.15)`,
                      color: `hsl(var(${b.color}))`,
                    }}
                  >
                    {b.bankName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {lang === "bn" ? b.bankNameBn : b.bankName}
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
      )}
    </div>
  );
}
