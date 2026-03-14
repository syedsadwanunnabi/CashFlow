import { useState } from "react";
import { useApp, type ThemeName } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Moon, Languages, Trash2, Database, AlertTriangle, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import { motion } from "framer-motion";

const themes: { id: ThemeName; key: TranslationKey; dot: string }[] = [
  { id: "midnight", key: "midnightBlue", dot: "bg-[hsl(199,89%,60%)]" },
  { id: "emerald", key: "emerald", dot: "bg-[hsl(160,64%,64%)]" },
  { id: "amethyst", key: "amethyst", dot: "bg-[hsl(263,70%,70%)]" },
  { id: "rosegold", key: "rosegold", dot: "bg-[hsl(350,60%,65%)]" },
  { id: "charcoal", key: "charcoal", dot: "bg-[hsl(45,90%,55%)]" },
  { id: "ocean", key: "ocean", dot: "bg-[hsl(185,70%,55%)]" },
];

interface Props {
  onClearData: () => void;
  onLoadDemo: () => void;
  hasData: boolean;
}

export default function SettingsPage({ onClearData, onLoadDemo, hasData }: Props) {
  const { theme, setTheme, lang, setLang, t } = useApp();
  const { user, signOut } = useAuth();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearData();
    setConfirmClear(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            {lang === "bn" ? "অ্যাকাউন্ট" : "Account"}
          </h2>
        </div>
        {user ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">{t("loggedInAs")}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t("logOut")}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("orContinueLocal")}</p>
        )}
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Moon className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">{t("appearance")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {themes.map(th => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={cn(
                "relative flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all duration-150",
                theme === th.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50"
              )}
            >
              <span className={cn("h-3.5 w-3.5 rounded-full shrink-0", th.dot)} />
              <span className="text-xs sm:text-sm font-medium text-foreground">{t(th.key)}</span>
              {theme === th.id && (
                <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">{t("languageSetting")}</h2>
        </div>
        <div className="flex gap-3">
          {(["en", "bn"] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150",
                lang === l
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              <span className="text-base">{l === "en" ? "🇬🇧" : "🇧🇩"}</span>
              {l === "en" ? "English" : "বাংলা"}
              {lang === l && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">{t("dataManagement")}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t("dataManagementDesc")}</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Database className="h-4 w-4" />
            {t("loadDemoData")}
          </button>
          <button
            onClick={handleClear}
            disabled={!hasData}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              confirmClear
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {confirmClear ? <AlertTriangle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            {confirmClear ? t("confirmClear") : t("clearAllData")}
          </button>
        </div>
        {confirmClear && (
          <p className="text-xs text-destructive mt-2">
            {t("clearWarning")}
            <button onClick={() => setConfirmClear(false)} className="ml-2 underline text-muted-foreground hover:text-foreground">
              {t("cancel")}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}
