import { useApp } from "@/contexts/AppContext";
import type { Transaction } from "@/lib/data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState } from "react";

interface Props { transactions: Transaction[] }

export default function SpendingChart({ transactions }: Props) {
  const { t } = useApp();
  const [view, setView] = useState<"daily" | "monthly">("daily");

  const sentTxns = transactions.filter(tx => tx.type === "sent");

  const chartData = view === "daily"
    ? getDailyData(sentTxns)
    : getMonthlyData(sentTxns);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t("spendingTrends")}</h3>
        <div className="flex gap-1 rounded-lg bg-secondary p-0.5">
          {(["daily", "monthly"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t(v)}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
              fontSize: 12,
            }}
            formatter={(val: number) => [`৳${val.toLocaleString("en-BD")}`, "Spent"]}
          />
          <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#spendGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function getDailyData(txns: Transaction[]) {
  const map: Record<string, number> = {};
  txns.forEach(tx => {
    const day = tx.date.slice(0, 10);
    map[day] = (map[day] || 0) + tx.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, amount]) => ({ label: date.slice(5), amount: Math.round(amount) }));
}

function getMonthlyData(txns: Transaction[]) {
  const map: Record<string, number> = {};
  txns.forEach(tx => {
    const month = tx.date.slice(0, 7);
    map[month] = (map[month] || 0) + tx.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ label: date, amount: Math.round(amount) }));
}
