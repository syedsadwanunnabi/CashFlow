import { useApp } from "@/contexts/AppContext";
import { BANKS, type Transaction, type BankId } from "@/lib/data";
import { motion } from "framer-motion";

interface Props { transactions: Transaction[] }

export default function BankBreakdown({ transactions }: Props) {
  const { t, lang } = useApp();

  const bankData = Object.entries(BANKS).map(([id, bank]) => {
    const txns = transactions.filter(tx => tx.bank === id);
    const spent = txns.filter(tx => tx.type === "sent").reduce((s, tx) => s + tx.amount, 0);
    const received = txns.filter(tx => tx.type === "received").reduce((s, tx) => s + tx.amount, 0);
    return { id: id as BankId, bank, txns: txns.length, spent, received };
  }).filter(b => b.txns > 0).sort((a, b) => b.spent - a.spent);

  const maxSpent = Math.max(...bankData.map(b => b.spent), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{t("bankBreakdown")}</h3>
      <div className="space-y-3">
        {bankData.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {lang === "bn" ? b.bank.nameBn : b.bank.name}
              </span>
              <span className="text-muted-foreground">৳{b.spent.toLocaleString("en-BD")}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.spent / maxSpent) * 100}%` }}
                transition={{ delay: i * 0.04 + 0.1, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: `hsl(var(${b.bank.color}))` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
