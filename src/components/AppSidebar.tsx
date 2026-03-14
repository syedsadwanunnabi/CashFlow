import { useApp } from "@/contexts/AppContext";
import { LayoutDashboard, ArrowLeftRight, Sparkles, Settings, FolderOpen, Landmark, MessageSquareText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", icon: LayoutDashboard, key: "overview" as const },
  { id: "transactions", icon: ArrowLeftRight, key: "transactions" as const },
  { id: "banks", icon: Landmark, key: "bankAccounts" as const },
  { id: "categories", icon: FolderOpen, key: "categories" as const },
  { id: "sms", icon: MessageSquareText, key: "smsParsing" as const },
  { id: "ai", icon: Sparkles, key: "aiInsights" as const },
  { id: "settings", icon: Settings, key: "settings" as const },
];

export default function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  // Close on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl font-bold text-primary-foreground leading-none">৳</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">{t("appName")}</span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              activeTab === tab.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <tab.icon className="h-[18px] w-[18px]" />
            {t(tab.key)}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-[10px] text-muted-foreground tracking-wide uppercase">CashFlow v1.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 bg-sidebar border-b border-sidebar-border px-4 py-3 md:hidden">
        <button onClick={() => setMobileOpen(true)} className="text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground leading-none">৳</span>
          </div>
          <span className="text-sm font-bold text-foreground">{t("appName")}</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-60 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200",
        "md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
