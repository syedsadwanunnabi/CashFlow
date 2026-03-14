import { useApp, type ThemeName } from "@/contexts/AppContext";
import { LayoutDashboard, ArrowLeftRight, Sparkles, Settings, FolderOpen, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", icon: LayoutDashboard, key: "overview" as const },
  { id: "transactions", icon: ArrowLeftRight, key: "transactions" as const },
  { id: "banks", icon: Landmark, key: "bankAccounts" as const },
  { id: "categories", icon: FolderOpen, key: "categories" as const },
  { id: "ai", icon: Sparkles, key: "aiInsights" as const },
  { id: "settings", icon: Settings, key: "settings" as const },
];

export default function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useApp();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <span className="text-xl font-bold text-primary-foreground leading-none">৳</span>
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">{t("appName")}</span>
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
    </aside>
  );
}
