import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import PulseDashboard from "@/components/PulseDashboard";
import SpendingChart from "@/components/SpendingChart";
import BankBreakdown from "@/components/BankBreakdown";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import TransactionList from "@/components/TransactionList";
import AIInsights from "@/components/AIInsights";
import AddTransaction from "@/components/AddTransaction";
import { useTransactions } from "@/hooks/useTransactions";
import { useApp } from "@/contexts/AppContext";

export default function Index() {
  const [activeTab, setActiveTab] = useState("overview");
  const { transactions, addTransaction, totalBalance, monthlySpend, monthlyIncome, burnRate } = useTransactions();
  const { t } = useApp();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-64 flex-1 p-6 lg:p-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {activeTab === "overview" && t("overview")}
            {activeTab === "banks" && t("bankAccounts")}
            {activeTab === "categories" && t("categories")}
            {activeTab === "ai" && t("aiInsights")}
          </h1>
          <AddTransaction onAdd={addTransaction} />
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <PulseDashboard
              totalBalance={totalBalance}
              burnRate={burnRate}
              monthlySpend={monthlySpend}
              monthlyIncome={monthlyIncome}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <SpendingChart transactions={transactions} />
              <BankBreakdown transactions={transactions} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryBreakdown transactions={transactions} />
              <TransactionList transactions={transactions} />
            </div>
          </div>
        )}

        {/* Banks Tab */}
        {activeTab === "banks" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <BankBreakdown transactions={transactions} />
            <TransactionList transactions={transactions} />
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdown transactions={transactions} />
            <TransactionList transactions={transactions} />
          </div>
        )}

        {/* AI Tab */}
        {activeTab === "ai" && (
          <div className="max-w-2xl">
            <AIInsights transactions={transactions} monthlySpend={monthlySpend} burnRate={burnRate} />
          </div>
        )}
      </main>
    </div>
  );
}
