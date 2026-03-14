import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { BANKS, BANK_GROUPS, CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Transaction, type BankId, type CategoryId } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { Search, Filter, X } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onAdd: (txn: Transaction) => void;
  onUpdate: (txn: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionsPage({ transactions, onAdd, onUpdate, onDelete }: Props) {
  const { t, lang } = useApp();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = search || typeFilter !== "all" || bankFilter !== "all" || categoryFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setBankFilter("all");
    setCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // Get unique banks/categories from actual transactions
  const usedBanks = useMemo(() => {
    const ids = new Set(transactions.map(t => t.bank));
    return Array.from(ids).sort();
  }, [transactions]);

  const usedCategories = useMemo(() => {
    const ids = new Set(transactions.map(t => t.category));
    return Array.from(ids).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const bank = BANKS[tx.bank];
        const matchesSearch =
          tx.description.toLowerCase().includes(q) ||
          bank.name.toLowerCase().includes(q) ||
          bank.nameBn.includes(q) ||
          tx.amount.toString().includes(q);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Bank filter
      if (bankFilter !== "all" && tx.bank !== bankFilter) return false;

      // Category filter
      if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;

      // Date range
      if (dateFrom) {
        const txDate = new Date(tx.date).toISOString().slice(0, 10);
        if (txDate < dateFrom) return false;
      }
      if (dateTo) {
        const txDate = new Date(tx.date).toISOString().slice(0, 10);
        if (txDate > dateTo) return false;
      }

      return true;
    });
  }, [transactions, search, typeFilter, bankFilter, categoryFilter, dateFrom, dateTo]);

  const selectClass = "rounded-lg bg-secondary border border-border px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-4">
      <AddTransaction onAdd={onAdd} />

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("searchTransactions")}
              className="w-full rounded-lg bg-secondary border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            {lang === "bn" ? "ফিল্টার" : "Filters"}
            {hasActiveFilters && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {[typeFilter !== "all", bankFilter !== "all", categoryFilter !== "all", !!dateFrom, !!dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Type */}
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectClass}>
                <option value="all">{t("allTypes")}</option>
                <option value="sent">{t("outflow")}</option>
                <option value="received">{t("inflow")}</option>
                <option value="balance">{t("balance")}</option>
              </select>

              {/* Bank */}
              <select value={bankFilter} onChange={e => setBankFilter(e.target.value)} className={selectClass}>
                <option value="all">{t("allBanks")}</option>
                {Object.entries(BANK_GROUPS).map(([key, group]) => {
                  const groupBanks = group.ids.filter(id => usedBanks.includes(id));
                  if (groupBanks.length === 0) return null;
                  return (
                    <optgroup key={key} label={lang === "bn" ? group.labelBn : group.label}>
                      {groupBanks.map(id => (
                        <option key={id} value={id}>{lang === "bn" ? BANKS[id].nameBn : BANKS[id].name}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>

              {/* Category */}
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={`col-span-2 sm:col-span-1 ${selectClass}`}>
                <option value="all">{t("allCategories")}</option>
                {usedCategories.map(id => (
                  <option key={id} value={id}>{CATEGORIES[id as CategoryId]?.icon} {t(id as TranslationKey)}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground shrink-0">{t("dateFrom")}:</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`flex-1 ${selectClass}`} />
              <label className="text-xs text-muted-foreground shrink-0">{t("dateTo")}:</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`flex-1 ${selectClass}`} />
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {t("showing")} {filtered.length} {t("of")} {transactions.length}
                </p>
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <X className="h-3 w-3" /> {t("clearFilters")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Result count when filtering without panel open */}
        {hasActiveFilters && !showFilters && (
          <p className="text-xs text-muted-foreground">
            {t("showing")} {filtered.length} {t("of")} {transactions.length}
          </p>
        )}
      </div>

      <TransactionList transactions={filtered} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}
