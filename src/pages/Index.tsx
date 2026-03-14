import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import WalletOverview from "@/components/WalletOverview";
import SpendingChart from "@/components/SpendingChart";
import BankBreakdown from "@/components/BankBreakdown";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import TransactionsPage from "@/components/TransactionsPage";
import AIInsights from "@/components/AIInsights";
import SettingsPage from "@/components/SettingsPage";
import SmsParser from "@/components/SmsParser";
import AuthPage from "@/components/AuthPage";
import { useTransactions } from "@/hooks/useTransactions";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const [activeTab, setActiveTab] = useState("overview");
  const { transactions, addTransaction, updateTransaction, deleteTransaction, clearAllData, loadDemoData, totalBalance, monthlySpend, monthlyIncome, burnRate } = useTransactions();
  const { t } = useApp();
  const { user } = useAuth();

  const pageTitle: Record<string, string> = {
    overview: t("overview"),
    transactions: t("transactions"),
    banks: t("bankAccounts"),
    categories: t("categories"),
    sms: t("smsParsing"),
    ai: t("aiInsights"),
    settings: t("settings"),
    login: t("login"),
  };

  // Show auth page when login tab selected and not logged in
  if (activeTab === "login" && !user) {
    return <AuthPage />;
  }

  // If user just logged in from auth page, redirect to overview
  if (activeTab === "login" && user) {
    setActiveTab("overview");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 pt-14 md:pt-0 md:ml-60 p-4 sm:p-6 lg:p-8">
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
          <TransactionsPage transactions={transactions} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} />
        )}

        {activeTab === "banks" && (
          <BankBreakdown transactions={transactions} />
        )}

        {activeTab === "categories" && (
          <CategoryBreakdown transactions={transactions} />
        )}

        {activeTab === "sms" && (
          <div className="max-w-2xl">
            <SmsParser onAdd={addTransaction} />
          </div>
        )}

        {activeTab === "ai" && (
          <div className="max-w-2xl">
            <AIInsights transactions={transactions} monthlySpend={monthlySpend} burnRate={burnRate} />
          </div>
        )}

        {activeTab === "settings" && (
          <SettingsPage
            onClearData={clearAllData}
            onLoadDemo={loadDemoData}
            hasData={transactions.length > 0}
          />
        )}
      </main>
    </div>
  );
}
