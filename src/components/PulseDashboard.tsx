import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Wallet, Flame } from "lucide-react";
import type { ReactNode } from "react";

interface PulseProps {
  totalBalance: number;
  burnRate: number;
  monthlySpend: number;
  monthlyIncome: number;
}

function StatCard({ icon, label, value, prefix, color, delay }: {
  icon: ReactNode; label: string; value: number; prefix?: string; color?: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color || "text-foreground"}`}>
        {prefix || "৳"}{Math.abs(value).toLocaleString("en-BD")}
      </p>
    </motion.div>
  );
}

export default function PulseDashboard({ totalBalance, burnRate, monthlySpend, monthlyIncome }: PulseProps) {
  const { t } = useApp();
  const healthEmoji = burnRate < 300 ? "😎" : burnRate < 700 ? "🙂" : burnRate < 1200 ? "😬" : "🔥";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={<Wallet className="h-4 w-4" />}
        label={t("totalBalance")}
        value={totalBalance}
        color={totalBalance >= 0 ? "text-primary" : "text-destructive"}
        delay={0}
      />
      <StatCard
        icon={<Flame className="h-4 w-4" />}
        label={`${t("burnRate")} ${healthEmoji}`}
        value={burnRate}
        delay={0.05}
      />
      <StatCard
        icon={<TrendingDown className="h-4 w-4" />}
        label={t("spending")}
        value={monthlySpend}
        color="text-destructive"
        delay={0.1}
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4" />}
        label={t("income")}
        value={monthlyIncome}
        color="text-primary"
        delay={0.15}
      />
    </div>
  );
}
