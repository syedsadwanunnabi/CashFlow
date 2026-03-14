import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { BANKS, BANK_GROUPS, CATEGORIES, type Transaction, type BankId, type CategoryId } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import { Plus, X } from "lucide-react";

interface Props { onAdd: (txn: Transaction) => void }

export default function AddTransaction({ onAdd }: Props) {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    type: "sent" as "sent" | "received",
    bank: "bkash" as BankId,
    category: "food" as CategoryId,
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    onAdd({
      id: crypto.randomUUID(),
      amount: parseFloat(form.amount),
      type: form.type,
      bank: form.bank,
      category: form.category,
      description: form.description,
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
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <input type="number" placeholder={t("amount")} value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className={`col-span-2 ${inputClass}`} required />
        <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "sent" | "received" }))} className={inputClass}>
          <option value="sent">{t("sent")}</option>
          <option value="received">{t("received")}</option>
        </select>
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
        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as CategoryId }))} className={inputClass}>
          {(Object.keys(CATEGORIES) as CategoryId[]).map(id => (
            <option key={id} value={id}>{CATEGORIES[id].icon} {t(id as TranslationKey)}</option>
          ))}
        </select>
        <input type="text" placeholder={t("description")} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={`col-span-2 ${inputClass}`} required />
        <div className="col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground">{t("cancel")}</button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">{t("save")}</button>
        </div>
      </form>
    </div>
  );
}
