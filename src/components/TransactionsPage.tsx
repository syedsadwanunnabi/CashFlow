import { useState, useMemo, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { BANKS, BANK_GROUPS, CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Transaction, type BankId, type CategoryId } from "@/lib/data";
import type { TranslationKey } from "@/lib/translations";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { Search, Filter, X, Download, FileText, FileSpreadsheet } from "lucide-react";

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

  const exportCSV = useCallback(() => {
    const headers = ["Date", "Type", "Amount", "Bank", "Category", "Description"];
    const rows = filtered.map(tx => [
      new Date(tx.date).toISOString().slice(0, 10),
      tx.type,
      tx.amount.toString(),
      BANKS[tx.bank]?.name || tx.bank,
      CATEGORIES[tx.category]?.icon + " " + tx.category,
      `"${tx.description.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const exportPDF = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CashFlow - Transactions", 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Exported: ${new Date().toLocaleDateString()} | ${filtered.length} transactions`, 14, 25);

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Type", "Amount (৳)", "Bank", "Category", "Description"]],
      body: filtered.map(tx => [
        new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        tx.type === "sent" ? "Outflow" : tx.type === "received" ? "Inflow" : "Balance",
        tx.amount.toLocaleString("en-BD"),
        BANKS[tx.bank]?.name || tx.bank,
        tx.category,
        tx.description,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 245, 250] },
    });

    doc.save(`cashflow-transactions-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [filtered]);

  const [showExport, setShowExport] = useState(false);

  const selectClass = "rounded-lg bg-secondary border border-border px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1"><AddTransaction onAdd={onAdd} /></div>
        {filtered.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              {t("export")}
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-border bg-card shadow-lg p-1 min-w-[140px]">
                <button
                  onClick={() => { exportCSV(); setShowExport(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                  {t("exportCSV")}
                </button>
                <button
                  onClick={() => { exportPDF(); setShowExport(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-destructive" />
                  {t("exportPDF")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
