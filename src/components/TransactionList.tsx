import { useApp } from "@/contexts/AppContext";
import { BANKS, BANK_GROUPS, CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Transaction, type BankId, type CategoryId } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, Pencil, Trash2, X, Check } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onUpdate?: (txn: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionList({ transactions, onUpdate, onDelete }: Props) {
  const { t, lang } = useApp();
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);

  const visible = showAll ? transactions : transactions.slice(0, 8);

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditForm({ ...tx, date: tx.date.slice(0, 10) || new Date(tx.date).toISOString().slice(0, 10) });
    setDeletingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm || !onUpdate) return;
    onUpdate({
      ...editForm,
      date: new Date(editForm.date).toISOString(),
    });
    setEditingId(null);
    setEditForm(null);
  };

  const confirmDelete = (id: string) => {
    if (!onDelete) return;
    onDelete(id);
    setDeletingId(null);
  };

  const inputClass = "rounded-md bg-secondary border border-border px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

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
        <div className="space-y-1">
          {visible.map(tx => {
            const bank = BANKS[tx.bank];
            const cat = CATEGORIES[tx.category];
            const isEditing = editingId === tx.id && editForm;
            const isDeleting = deletingId === tx.id;

            if (isEditing && editForm) {
              const availableCategories = editForm.type === "received" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
              return (
                <div key={tx.id} className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass}`}
                      placeholder={t("amount")}
                    />
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={editForm.type}
                      onChange={e => {
                        const newType = e.target.value as Transaction["type"];
                        const cats = newType === "received" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                        const newCat = newType === "balance" ? "other" as CategoryId : (cats.includes(editForm.category) ? editForm.category : cats[0]);
                        setEditForm({ ...editForm, type: newType, category: newCat });
                      }}
                      className={inputClass}
                    >
                      <option value="sent">{t("outflow")}</option>
                      <option value="received">{t("inflow")}</option>
                      <option value="balance">{t("setBalance")}</option>
                    </select>
                    <select
                      value={editForm.bank}
                      onChange={e => setEditForm({ ...editForm, bank: e.target.value as BankId })}
                      className={inputClass}
                    >
                      {Object.entries(BANK_GROUPS).map(([key, group]) => (
                        <optgroup key={key} label={lang === "bn" ? group.labelBn : group.label}>
                          {group.ids.map(id => (
                            <option key={id} value={id}>{lang === "bn" ? BANKS[id].nameBn : BANKS[id].name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {editForm.type !== "balance" && (
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm({ ...editForm, category: e.target.value as CategoryId })}
                        className={inputClass}
                      >
                        {availableCategories.map(id => (
                          <option key={id} value={id}>{CATEGORIES[id].icon} {t(id as TranslationKey)}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {editForm.type !== "balance" && (
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      className={`w-full ${inputClass}`}
                      placeholder={t("description")}
                    />
                  )}
                  <div className="flex justify-end gap-2">
                    <button onClick={cancelEdit} className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-3 w-3" /> {t("cancel")}
                    </button>
                    <button onClick={saveEdit} className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                      <Check className="h-3 w-3" /> {t("update")}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={tx.id} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                <span className="text-base">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "bn" ? bank.nameBn : bank.name} · {t(tx.category as TranslationKey)}
                  </p>
                </div>

                {/* Action buttons - visible on hover */}
                {(onUpdate || onDelete) && (
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    {onUpdate && (
                      <button
                        onClick={() => startEdit(tx)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title={t("edit")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      isDeleting ? (
                        <button
                          onClick={() => confirmDelete(tx.id)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-destructive-foreground bg-destructive hover:opacity-90 transition-opacity"
                        >
                          {t("deleteConfirm")}
                        </button>
                      ) : (
                        <button
                          onClick={() => { setDeletingId(tx.id); setEditingId(null); }}
                          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title={t("delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="text-right">
                  <p className={`text-sm font-semibold flex items-center gap-1 ${
                    tx.type === "balance" ? "text-primary" : tx.type === "received" ? "text-primary" : "text-foreground"
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
