export interface Transaction {
  id: string;
  amount: number;
  type: "sent" | "received";
  bank: BankId;
  category: CategoryId;
  description: string;
  date: string; // ISO string
}

export type BankId = "bkash" | "nagad" | "citybank" | "dbbl" | "ebl" | "brac" | "rocket" | "upay";
export type CategoryId = "food" | "transport" | "shopping" | "bills" | "entertainment" | "health" | "education" | "other";

export const BANKS: Record<BankId, { name: string; nameBn: string; color: string }> = {
  bkash: { name: "bKash", nameBn: "বিকাশ", color: "var(--bkash)" },
  nagad: { name: "Nagad", nameBn: "নগদ", color: "var(--nagad)" },
  citybank: { name: "City Bank", nameBn: "সিটি ব্যাংক", color: "var(--citybank)" },
  dbbl: { name: "DBBL", nameBn: "ডিবিবিএল", color: "var(--dbbl)" },
  ebl: { name: "EBL", nameBn: "ইবিএল", color: "var(--ebl)" },
  brac: { name: "BRAC Bank", nameBn: "ব্র্যাক ব্যাংক", color: "var(--brac)" },
  rocket: { name: "Rocket", nameBn: "রকেট", color: "var(--rocket)" },
  upay: { name: "Upay", nameBn: "উপায়", color: "var(--upay)" },
};

export const CATEGORIES: Record<CategoryId, { icon: string }> = {
  food: { icon: "🍔" },
  transport: { icon: "🚌" },
  shopping: { icon: "🛍️" },
  bills: { icon: "📄" },
  entertainment: { icon: "🎬" },
  health: { icon: "💊" },
  education: { icon: "📚" },
  other: { icon: "📦" },
};

// Generate demo data
export function generateDemoTransactions(): Transaction[] {
  const banks: BankId[] = ["bkash", "nagad", "citybank", "dbbl", "ebl", "brac", "rocket", "upay"];
  const categories: CategoryId[] = ["food", "transport", "shopping", "bills", "entertainment", "health", "education", "other"];
  const descriptions: Record<CategoryId, string[]> = {
    food: ["Foodpanda Order", "Pathao Food", "Local Restaurant", "Tea Stall"],
    transport: ["Uber Ride", "Pathao Ride", "CNG Auto", "Bus Fare"],
    shopping: ["Daraz Order", "Evaly Purchase", "Aarong", "New Market"],
    bills: ["DESCO Bill", "Internet Bill", "Mobile Recharge", "Gas Bill"],
    entertainment: ["Netflix", "Spotify", "Cinema Ticket", "Gaming"],
    health: ["Pharmacy", "Doctor Visit", "Lab Test", "Medicine"],
    education: ["Udemy Course", "Book Purchase", "Coaching Fee", "Exam Fee"],
    other: ["ATM Withdrawal", "Transfer", "Donation", "Miscellaneous"],
  };

  const txns: Transaction[] = [];
  for (let i = 0; i < 60; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const isReceived = Math.random() > 0.75;
    const day = Math.floor(Math.random() * 28) + 1;
    const month = Math.random() > 0.4 ? 2 : 1; // March or Feb 2026
    const desc = descriptions[cat][Math.floor(Math.random() * descriptions[cat].length)];
    txns.push({
      id: crypto.randomUUID(),
      amount: Math.round((Math.random() * 4500 + 50) * 100) / 100,
      type: isReceived ? "received" : "sent",
      bank,
      category: cat,
      description: desc,
      date: `2026-0${month}-${String(day).padStart(2, "0")}T${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`,
    });
  }
  return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
