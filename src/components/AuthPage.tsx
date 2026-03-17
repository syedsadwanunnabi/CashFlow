import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password, name);
      if (error) setError(error);
      else setSignupSuccess(true);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  };

  const inputClass = "w-full rounded-lg bg-secondary border border-border pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center"
        >
          <div className="h-12 w-12 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">{t("checkEmail")}</h2>
          <p className="text-sm text-muted-foreground">{t("confirmEmailDesc")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="CashFlow" className="h-14 w-14 rounded-2xl object-contain mb-3" />
          <h1 className="text-xl font-bold text-foreground">{t("appName")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("authSubtitle")}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("login")}
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t("signUp")}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 mb-4">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("yourName")}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? t("login") : t("signUp")}
            </button>
          </form>

          {/* Skip login option */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">{t("orContinueLocal")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
