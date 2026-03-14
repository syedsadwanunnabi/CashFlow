import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import WalletOverview from "@/components/WalletOverview";
import SpendingChart from "@/components/SpendingChart";
import BankBreakdown from "@/components/BankBreakdown";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import TransactionsPage from "@/components/TransactionsPage";
import AIInsights from "@/components/AIInsights";
import SettingsPage from "@/components/SettingsPage";
import { useTransactions } from "@/hooks/useTransactions";
import { useApp } from "@/contexts/AppContext";

export default function Index() {
  const [activeTab, setActiveTab] = useState("overview");
  const { transactions, addTransaction, totalBalance, monthlySpend, monthlyIncome, burnRate } = useTransactions();
  const { t } = useApp();

  const pageTitle: Record<string, string> = {
    overview: t("overview"),
    transactions: t("transactions"),
    banks: t("bankAccounts"),
    categories: t("categories"),
    ai: t("aiInsights"),
    settings: t("settings"),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-60 flex-1 p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{pageTitle[activeTab]}</h1>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <WalletOverview
              transactions={transactions}
              totalBalance={totalBalance}
              monthlySpend={monthlySpend}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <SpendingChart transactions={transactions} />
              <CategoryBreakdown transactions={transactions} />
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <TransactionsPage transactions={transactions} onAdd={addTransaction} />
        )}

        {activeTab === "banks" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <BankBreakdown transactions={transactions} />
            <SpendingChart transactions={transactions} />
          </div>
        )}

        {activeTab === "categories" && (
          <CategoryBreakdown transactions={transactions} />
        )}

        {activeTab === "ai" && (
          <div className="max-w-2xl">
            <AIInsights transactions={transactions} monthlySpend={monthlySpend} burnRate={burnRate} />
          </div>
        )}

        {activeTab === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
