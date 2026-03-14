import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Language, TranslationKey } from "@/lib/translations";
import { translations } from "@/lib/translations";

export type ThemeName = "midnight" | "emerald" | "amethyst";

interface AppContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() =>
    (localStorage.getItem("cf-theme") as ThemeName) || "midnight"
  );
  const [lang, setLangState] = useState<Language>(() =>
    (localStorage.getItem("cf-lang") as Language) || "en"
  );

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("cf-theme", t);
  };

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("cf-lang", l);
  };

  const t = (key: TranslationKey) => translations[lang][key];

  useEffect(() => {
    document.documentElement.className = `dark theme-${theme}`;
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};
