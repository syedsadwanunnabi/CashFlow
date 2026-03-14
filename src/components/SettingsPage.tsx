import { useApp, type ThemeName } from "@/contexts/AppContext";
import { Check, Moon, Languages } from "lucide-react";
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

export default function SettingsPage() {
  const { theme, setTheme, lang, setLang, t } = useApp();

  return (
    <div className="max-w-2xl space-y-8">
      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Moon className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">{t("appearance")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themes.map(th => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
                theme === th.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50"
              )}
            >
              <span className={cn("h-4 w-4 rounded-full shrink-0", th.dot)} />
              <span className="text-sm font-medium text-foreground">{t(th.key)}</span>
              {theme === th.id && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-card p-6"
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
                "relative flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-150",
                lang === l
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              <span className="text-lg">{l === "en" ? "🇬🇧" : "🇧🇩"}</span>
              {l === "en" ? "English" : "বাংলা"}
              {lang === l && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
