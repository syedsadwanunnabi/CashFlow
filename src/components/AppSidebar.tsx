import { useApp, type ThemeName } from "@/contexts/AppContext";
import { LayoutDashboard, Landmark, FolderOpen, Sparkles, Moon, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", icon: LayoutDashboard, key: "overview" as const },
  { id: "banks", icon: Landmark, key: "bankAccounts" as const },
  { id: "categories", icon: FolderOpen, key: "categories" as const },
  { id: "ai", icon: Sparkles, key: "aiInsights" as const },
];

const themes: { id: ThemeName; key: "midnightBlue" | "emerald" | "amethyst"; dot: string }[] = [
  { id: "midnight", key: "midnightBlue", dot: "bg-[hsl(199,89%,60%)]" },
  { id: "emerald", key: "emerald", dot: "bg-[hsl(160,64%,64%)]" },
  { id: "amethyst", key: "amethyst", dot: "bg-[hsl(263,70%,70%)]" },
];

export default function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const { theme, setTheme, lang, setLang, t } = useApp();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">₿</span>
        </div>
        <span className="text-xl font-bold text-foreground">{t("appName")}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <tab.icon className="h-5 w-5" />
            {t(tab.key)}
          </button>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-4">
        {/* Theme */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Moon className="h-3.5 w-3.5" /> {t("theme")}
          </p>
          <div className="flex gap-2">
            {themes.map(th => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  theme === th.id ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", th.dot)} />
                {t(th.key)}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5" /> {t("language")}
          </p>
          <div className="flex gap-2">
            {(["en", "bn"] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l === "en" ? "English" : "বাংলা"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
