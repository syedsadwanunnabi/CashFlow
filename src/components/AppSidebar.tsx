import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, ArrowLeftRight, Sparkles, Settings, FolderOpen, Landmark, MessageSquareText, Menu, X, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import logoImg from "@/assets/logo.png";

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
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [activeTab]);
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="CashFlow" className="h-9 w-9 rounded-xl object-contain" />
          <span className="text-lg font-bold text-foreground tracking-tight">{t("appName")}</span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

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

      {/* User / Auth footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
              <p className="text-[10px] text-muted-foreground">☁️ Cloud sync</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onTabChange("login")}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span className="text-xs">{t("login")} / {t("signUp")}</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
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

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

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
