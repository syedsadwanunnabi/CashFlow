import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Language, TranslationKey } from "@/lib/translations";
import { translations } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type ThemeName = "midnight" | "emerald" | "amethyst" | "rosegold" | "charcoal" | "ocean";

interface AppContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [theme, setThemeState] = useState<ThemeName>(() =>
    (localStorage.getItem("cf-theme") as ThemeName) || "midnight"
  );
  const [lang, setLangState] = useState<Language>(() =>
    (localStorage.getItem("cf-lang") as Language) || "en"
  );

  // Load preferences from cloud profile
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("preferred_theme, preferred_lang")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.preferred_theme) setThemeState(data.preferred_theme as ThemeName);
          if (data?.preferred_lang) setLangState(data.preferred_lang as Language);
        });
    }
  }, [user]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("cf-theme", t);
    if (user) {
      supabase.from("profiles").update({ preferred_theme: t }).eq("user_id", user.id).then(() => {});
    }
  };

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("cf-lang", l);
    if (user) {
      supabase.from("profiles").update({ preferred_lang: l }).eq("user_id", user.id).then(() => {});
    }
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
