import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { BANKS, BANK_GROUPS, CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Transaction, type BankId, type CategoryId } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import { Plus, X, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

interface Props { onAdd: (txn: Transaction) => void }

export default function AddTransaction({ onAdd }: Props) {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    type: "sent" as "sent" | "received" | "balance",
    bank: "bkash" as BankId,
    category: "food" as CategoryId,
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const availableCategories = form.type === "received" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type: "sent" | "received" | "balance") => {
    if (type === "balance") {
      setForm(p => ({ ...p, type, category: "other" as CategoryId, description: lang === "bn" ? "ব্যালেন্স সেট" : "Balance Set" }));
    } else {
      const cats = type === "received" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const newCat = cats.includes(form.category) ? form.category : cats[0];
      setForm(p => ({ ...p, type, category: newCat, description: form.type === "balance" ? "" : p.description }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    if (form.type !== "balance" && !form.description) return;
    onAdd({
      id: crypto.randomUUID(),
      amount: parseFloat(form.amount),
      type: form.type,
      bank: form.bank,
      category: form.category,
      description: form.description || (form.type === "balance" ? "Balance Set" : ""),
      date: new Date(form.date).toISOString(),
    });
    setForm({ amount: "", type: "sent", bank: "bkash", category: "food", description: "", date: new Date().toISOString().slice(0, 10) });
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" /> {t("addTransaction")}
      </button>
    );
  }

  const inputClass = "rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{t("addTransaction")}</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleTypeChange("sent")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-all ${
            form.type === "sent"
              ? "bg-destructive/15 text-destructive border border-destructive/30"
              : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
          }`}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          {t("outflow")}
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("received")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-all ${
            form.type === "received"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
          }`}
        >
          <ArrowDownLeft className="h-3.5 w-3.5" />
          {t("inflow")}
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("balance")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-all ${
            form.type === "balance"
              ? "bg-accent/30 text-accent-foreground border border-accent/50"
              : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          {t("setBalance")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <input type="number" placeholder={form.type === "balance" ? (lang === "bn" ? "বর্তমান ব্যালেন্স" : "Current Balance") : t("amount")} value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className={`col-span-2 ${inputClass}`} required />
        <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputClass} />
        <select value={form.bank} onChange={e => setForm(p => ({ ...p, bank: e.target.value as BankId }))} className={inputClass}>
          {Object.entries(BANK_GROUPS).map(([key, group]) => (
            <optgroup key={key} label={lang === "bn" ? group.labelBn : group.label}>
              {group.ids.map(id => (
                <option key={id} value={id}>{lang === "bn" ? BANKS[id].nameBn : BANKS[id].name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {form.type !== "balance" && (
          <>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as CategoryId }))} className={`col-span-2 ${inputClass}`}>
              {availableCategories.map(id => (
                <option key={id} value={id}>{CATEGORIES[id].icon} {t(id as TranslationKey)}</option>
              ))}
            </select>
            <input type="text" placeholder={t("description")} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={`col-span-2 ${inputClass}`} required />
          </>
        )}
        {form.type === "balance" && (
          <p className="col-span-2 text-xs text-muted-foreground">{t("balanceDesc")}</p>
        )}
        <div className="col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground">{t("cancel")}</button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">{t("save")}</button>
        </div>
      </form>
    </div>
  );
}
