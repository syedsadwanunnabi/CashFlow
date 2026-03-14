import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { BANKS, type Transaction, type BankId, type CategoryId } from "@/lib/data";
import { MessageSquareText, Sparkles, Plus, X, CheckCircle2, ArrowRightLeft } from "lucide-react";

interface Props {
  onAdd: (txn: Transaction) => void;
}

interface ParsedTransaction {
  amount: number;
  type: "sent" | "received";
  bank: BankId | null;
  description: string;
  date: string;
  isTransfer?: boolean;
  transferPairIndex?: number; // index of the paired transaction
}

// Bank keyword map for detection
const BANK_KEYWORDS: Record<string, BankId> = {
  bkash: "bkash", "b-kash": "bkash",
  nagad: "nagad",
  rocket: "rocket", dbbl: "rocket",
  upay: "upay",
  surecash: "surecash",
  mcash: "mcash",
  tap: "tap",
  "city bank": "citybank", citybank: "citybank",
  "brac bank": "brac", "brac ": "brac",
  "dutch-bangla": "dbbl", "dutch bangla": "dbbl",
  "eastern bank": "ebl", ebl: "ebl",
  "prime bank": "prime",
  "sonali bank": "sonali", sonali: "sonali",
  "janata bank": "janata",
  "agrani bank": "agrani",
  "rupali bank": "rupali",
  "islami bank": "islami",
  "standard chartered": "standard_chartered",
  hsbc: "hsbc",
  "pubali bank": "pubali",
  "uttara bank": "uttara",
  "grameen bank": "grameen",
  "mutual trust": "mutual_trust", mtb: "mutual_trust",
  ucb: "ucb",
  "bank asia": "bank_asia",
};

function detectAllBanks(text: string): BankId[] {
  const found: { bankId: BankId; index: number }[] = [];
  for (const [keyword, bankId] of Object.entries(BANK_KEYWORDS)) {
    const idx = text.indexOf(keyword);
    if (idx !== -1 && !found.some(f => f.bankId === bankId)) {
      found.push({ bankId, index: idx });
    }
  }
  // Sort by position in text (first mentioned = source, second = destination)
  found.sort((a, b) => a.index - b.index);
  return found.map(f => f.bankId);
}

function isTransferSms(text: string): boolean {
  const transferKeywords = [
    "transfer", "transferred", "sent to", "send money",
    "cash out", "cash in", "add money", "fund transfer",
    "to your", "from your", "to account", "from account",
  ];
  return transferKeywords.some(kw => text.includes(kw));
}

function parseSms(sms: string): ParsedTransaction[] {
  const text = sms.toLowerCase();

  // Extract amount
  const amountPatterns = [
    /(?:tk|bdt|taka|৳)\s*[.]?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:tk|bdt|taka|৳)/i,
    /amount[:\s]*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:sent|received|credited|debited|paid|payment|transfer|cash\s*(?:in|out))[^.]*?([\d,]+(?:\.\d{1,2})?)/i,
  ];

  let amount = 0;
  for (const pattern of amountPatterns) {
    const match = sms.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ""));
      break;
    }
  }

  if (amount <= 0) return [];

  // Extract date if present, otherwise use today
  const dateMatch = sms.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  let date = new Date().toISOString();
  if (dateMatch) {
    const [, d, m, y] = dateMatch;
    const year = y.length === 2 ? `20${y}` : y;
    date = new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`).toISOString();
  }

  const description = sms.trim().slice(0, 60).replace(/\n/g, " ");

  // Detect all banks mentioned
  const banks = detectAllBanks(text);

  // Check if this is a transfer between two accounts
  if (banks.length >= 2 && isTransferSms(text)) {
    const [sourceBank, destBank] = banks;
    return [
      { amount, type: "sent", bank: sourceBank, description, date, isTransfer: true, transferPairIndex: 1 },
      { amount, type: "received", bank: destBank, description, date, isTransfer: true, transferPairIndex: 0 },
    ];
  }

  // Single transaction fallback
  const receivedKeywords = ["received", "credited", "cash in", "deposited", "added", "refund", "salary", "cashback"];
  const sentKeywords = ["sent", "debited", "cash out", "paid", "payment", "transferred", "withdrawn", "purchase", "charge"];

  let type: "sent" | "received" = "sent";
  if (receivedKeywords.some(kw => text.includes(kw))) type = "received";
  if (sentKeywords.some(kw => text.includes(kw))) type = "sent";

  return [{ amount, type, bank: banks[0] || null, description, date }];
}

export default function SmsParser({ onAdd }: Props) {
  const { t, lang } = useApp();
  const [smsText, setSmsText] = useState("");
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const handleParse = () => {
    const messages = smsText.split(/\n{2,}|---+/).filter(m => m.trim());
    const results: ParsedTransaction[] = [];
    for (const msg of messages) {
      const parsed = parseSms(msg.trim());
      // Adjust transferPairIndex to be global indices
      const baseIdx = results.length;
      for (const p of parsed) {
        if (p.transferPairIndex !== undefined) {
          p.transferPairIndex += baseIdx;
        }
        results.push(p);
      }
    }
    setParsed(results);
    setAdded(new Set());
  };

  const handleAddOne = (idx: number) => {
    const p = parsed[idx];
    onAdd({
      id: crypto.randomUUID(),
      amount: p.amount,
      type: p.type,
      bank: p.bank || "bkash",
      category: (p.type === "received" ? "salary" : "other") as CategoryId,
      description: p.description,
      date: p.date,
    });
    setAdded(prev => new Set(prev).add(idx));
  };

  const handleAddAll = () => {
    parsed.forEach((p, idx) => {
      if (!added.has(idx)) handleAddOne(idx);
    });
  };

  const handleClear = () => {
    setSmsText("");
    setParsed([]);
    setAdded(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquareText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("smsParser")}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t("smsParserDesc")}</p>

        <textarea
          value={smsText}
          onChange={e => setSmsText(e.target.value)}
          placeholder={t("smsPlaceholder")}
          rows={5}
          className="w-full rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleParse}
            disabled={!smsText.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("parseSms")}
          </button>
          {parsed.length > 0 && (
            <button onClick={handleClear} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" /> {t("clear")}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {parsed.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("parsedResults")} ({parsed.length})
            </h3>
            {parsed.length > 1 && added.size < parsed.length && (
              <button
                onClick={handleAddAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("addAll")}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {parsed.map((p, idx) => {
              const isAdded = added.has(idx);
              const bankName = p.bank ? (lang === "bn" ? BANKS[p.bank].nameBn : BANKS[p.bank].name) : (lang === "bn" ? "অজানা" : "Unknown");
              return (
                <div key={idx} className={`flex items-center gap-3 rounded-lg px-3 py-3 border transition-all ${isAdded ? "border-primary/30 bg-primary/5" : "border-border hover:bg-secondary/50"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${p.type === "received" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                    {p.type === "received" ? "+" : "−"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {bankName} · {new Date(p.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${p.type === "received" ? "text-primary" : "text-destructive"}`}>
                    {p.type === "received" ? "+" : "−"}৳{p.amount.toLocaleString("en-BD")}
                  </p>
                  {isAdded ? (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <button
                      onClick={() => handleAddOne(idx)}
                      className="shrink-0 rounded-md bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
