export interface Transaction {
  id: string;
  amount: number;
  type: "sent" | "received";
  bank: BankId;
  category: CategoryId;
  description: string;
  date: string;
}

export type CategoryId = "food" | "transport" | "shopping" | "bills" | "entertainment" | "health" | "education" | "other";

// All major Bangladeshi banks + MFS providers
export type BankId =
  // State-Owned Commercial Banks
  | "sonali" | "janata" | "agrani" | "rupali"
  // Major Private Commercial Banks
  | "brac" | "citybank" | "dbbl" | "ebl" | "prime" | "pubali" | "uttara"
  | "ific" | "dhaka" | "southeast" | "mutual_trust" | "ab_bank"
  | "bank_asia" | "one_bank" | "premier" | "trust" | "ucb"
  | "jamuna" | "mercantile" | "ncc" | "nrb" | "nrbc" | "sbac"
  | "midland" | "modhumoti" | "meghna" | "national" | "padma"
  | "shimanto" | "bengal" | "citizens" | "community"
  // Islami Banks
  | "islami" | "shahjalal" | "al_arafah" | "standard" | "icb_islamic" | "exim"
  // Foreign Banks
  | "standard_chartered" | "hsbc" | "citibank" | "woori"
  // Specialized
  | "grameen" | "krishi"
  // MFS Providers
  | "bkash" | "nagad" | "rocket" | "upay" | "surecash" | "mcash" | "tap";

export const BANKS: Record<BankId, { name: string; nameBn: string; color: string }> = {
  // State-Owned Commercial Banks
  sonali: { name: "Sonali Bank PLC", nameBn: "সোনালী ব্যাংক", color: "--bank-sonali" },
  janata: { name: "Janata Bank PLC", nameBn: "জনতা ব্যাংক", color: "--bank-janata" },
  agrani: { name: "Agrani Bank PLC", nameBn: "অগ্রণী ব্যাংক", color: "--bank-agrani" },
  rupali: { name: "Rupali Bank PLC", nameBn: "রূপালী ব্যাংক", color: "--bank-rupali" },

  // Major Private Commercial Banks
  brac: { name: "BRAC Bank PLC", nameBn: "ব্র্যাক ব্যাংক", color: "--bank-brac" },
  citybank: { name: "City Bank PLC", nameBn: "সিটি ব্যাংক", color: "--bank-citybank" },
  dbbl: { name: "Dutch-Bangla Bank PLC", nameBn: "ডাচ-বাংলা ব্যাংক", color: "--bank-dbbl" },
  ebl: { name: "Eastern Bank PLC", nameBn: "ইস্টার্ন ব্যাংক", color: "--bank-ebl" },
  prime: { name: "Prime Bank PLC", nameBn: "প্রাইম ব্যাংক", color: "--bank-prime" },
  pubali: { name: "Pubali Bank PLC", nameBn: "পূবালী ব্যাংক", color: "--bank-pubali" },
  uttara: { name: "Uttara Bank PLC", nameBn: "উত্তরা ব্যাংক", color: "--bank-uttara" },
  ific: { name: "IFIC Bank PLC", nameBn: "আইএফআইসি ব্যাংক", color: "--bank-ific" },
  dhaka: { name: "Dhaka Bank PLC", nameBn: "ঢাকা ব্যাংক", color: "--bank-dhaka" },
  southeast: { name: "Southeast Bank PLC", nameBn: "সাউথইস্ট ব্যাংক", color: "--bank-southeast" },
  mutual_trust: { name: "Mutual Trust Bank PLC", nameBn: "মিউচুয়াল ট্রাস্ট ব্যাংক", color: "--bank-mtb" },
  ab_bank: { name: "AB Bank PLC", nameBn: "এবি ব্যাংক", color: "--bank-ab" },
  bank_asia: { name: "Bank Asia PLC", nameBn: "ব্যাংক এশিয়া", color: "--bank-asia" },
  one_bank: { name: "ONE Bank PLC", nameBn: "ওয়ান ব্যাংক", color: "--bank-one" },
  premier: { name: "The Premier Bank PLC", nameBn: "প্রিমিয়ার ব্যাংক", color: "--bank-premier" },
  trust: { name: "Trust Bank PLC", nameBn: "ট্রাস্ট ব্যাংক", color: "--bank-trust" },
  ucb: { name: "United Commercial Bank PLC", nameBn: "ইউসিবি ব্যাংক", color: "--bank-ucb" },
  jamuna: { name: "Jamuna Bank PLC", nameBn: "যমুনা ব্যাংক", color: "--bank-jamuna" },
  mercantile: { name: "Mercantile Bank PLC", nameBn: "মার্কেন্টাইল ব্যাংক", color: "--bank-mercantile" },
  ncc: { name: "NCC Bank PLC", nameBn: "এনসিসি ব্যাংক", color: "--bank-ncc" },
  nrb: { name: "NRB Bank PLC", nameBn: "এনআরবি ব্যাংক", color: "--bank-nrb" },
  nrbc: { name: "NRBC Bank PLC", nameBn: "এনআরবিসি ব্যাংক", color: "--bank-nrbc" },
  sbac: { name: "SBAC Bank PLC", nameBn: "এসবিএসি ব্যাংক", color: "--bank-sbac" },
  midland: { name: "Midland Bank PLC", nameBn: "মিডল্যান্ড ব্যাংক", color: "--bank-midland" },
  modhumoti: { name: "Modhumoti Bank PLC", nameBn: "মধুমতি ব্যাংক", color: "--bank-modhumoti" },
  meghna: { name: "Meghna Bank PLC", nameBn: "মেঘনা ব্যাংক", color: "--bank-meghna" },
  national: { name: "National Bank PLC", nameBn: "ন্যাশনাল ব্যাংক", color: "--bank-national" },
  padma: { name: "Padma Bank PLC", nameBn: "পদ্মা ব্যাংক", color: "--bank-padma" },
  shimanto: { name: "Shimanto Bank PLC", nameBn: "সীমান্ত ব্যাংক", color: "--bank-shimanto" },
  bengal: { name: "Bengal Commercial Bank PLC", nameBn: "বেঙ্গল কমার্শিয়াল ব্যাংক", color: "--bank-bengal" },
  citizens: { name: "Citizens Bank PLC", nameBn: "সিটিজেন্স ব্যাংক", color: "--bank-citizens" },
  community: { name: "Community Bank Bangladesh PLC", nameBn: "কমিউনিটি ব্যাংক", color: "--bank-community" },

  // Islami Banks
  islami: { name: "Islami Bank Bangladesh PLC", nameBn: "ইসলামী ব্যাংক বাংলাদেশ", color: "--bank-islami" },
  shahjalal: { name: "Shahjalal Islami Bank PLC", nameBn: "শাহজালাল ইসলামী ব্যাংক", color: "--bank-shahjalal" },
  al_arafah: { name: "Al-Arafah Islami Bank PLC", nameBn: "আল-আরাফাহ ইসলামী ব্যাংক", color: "--bank-alarafah" },
  standard: { name: "Standard Bank PLC", nameBn: "স্ট্যান্ডার্ড ব্যাংক", color: "--bank-standard" },
  icb_islamic: { name: "ICB Islamic Bank PLC", nameBn: "আইসিবি ইসলামিক ব্যাংক", color: "--bank-icbislamic" },
  exim: { name: "EXIM Bank PLC", nameBn: "এক্সিম ব্যাংক", color: "--bank-exim" },

  // Foreign Banks
  standard_chartered: { name: "Standard Chartered Bank", nameBn: "স্ট্যান্ডার্ড চার্টার্ড", color: "--bank-scb" },
  hsbc: { name: "HSBC Bangladesh", nameBn: "এইচএসবিসি", color: "--bank-hsbc" },
  citibank: { name: "Citibank N.A.", nameBn: "সিটিব্যাংক", color: "--bank-citi" },
  woori: { name: "Woori Bank", nameBn: "উরি ব্যাংক", color: "--bank-woori" },

  // Specialized
  grameen: { name: "Grameen Bank", nameBn: "গ্রামীণ ব্যাংক", color: "--bank-grameen" },
  krishi: { name: "Bangladesh Krishi Bank", nameBn: "কৃষি ব্যাংক", color: "--bank-krishi" },

  // MFS Providers
  bkash: { name: "bKash", nameBn: "বিকাশ", color: "--mfs-bkash" },
  nagad: { name: "Nagad", nameBn: "নগদ", color: "--mfs-nagad" },
  rocket: { name: "Rocket (DBBL Mobile Banking)", nameBn: "রকেট", color: "--mfs-rocket" },
  upay: { name: "Upay", nameBn: "উপায়", color: "--mfs-upay" },
  surecash: { name: "SureCash", nameBn: "শিওরক্যাশ", color: "--mfs-surecash" },
  mcash: { name: "mCash", nameBn: "এমক্যাশ", color: "--mfs-mcash" },
  tap: { name: "Tap", nameBn: "ট্যাপ", color: "--mfs-tap" },
};

export const BANK_GROUPS = {
  mfs: { label: "Mobile Financial Services (MFS)", labelBn: "মোবাইল আর্থিক সেবা", ids: ["bkash", "nagad", "rocket", "upay", "surecash", "mcash", "tap"] as BankId[] },
  state: { label: "State-Owned Banks", labelBn: "সরকারি ব্যাংক", ids: ["sonali", "janata", "agrani", "rupali"] as BankId[] },
  private: { label: "Private Commercial Banks", labelBn: "বেসরকারি ব্যাংক", ids: ["brac", "citybank", "dbbl", "ebl", "prime", "pubali", "uttara", "ific", "dhaka", "southeast", "mutual_trust", "ab_bank", "bank_asia", "one_bank", "premier", "trust", "ucb", "jamuna", "mercantile", "ncc", "nrb", "nrbc", "sbac", "midland", "modhumoti", "meghna", "national", "padma", "shimanto", "bengal", "citizens", "community"] as BankId[] },
  islami: { label: "Islami Banks", labelBn: "ইসলামী ব্যাংক", ids: ["islami", "shahjalal", "al_arafah", "standard", "icb_islamic", "exim"] as BankId[] },
  foreign: { label: "Foreign Banks", labelBn: "বিদেশী ব্যাংক", ids: ["standard_chartered", "hsbc", "citibank", "woori"] as BankId[] },
  specialized: { label: "Specialized Banks", labelBn: "বিশেষায়িত ব্যাংক", ids: ["grameen", "krishi"] as BankId[] },
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

// Generate demo data using common banks
export function generateDemoTransactions(): Transaction[] {
  const demoBanks: BankId[] = ["bkash", "nagad", "rocket", "citybank", "dbbl", "ebl", "brac", "upay", "sonali", "islami", "standard_chartered", "prime"];
  const categories: CategoryId[] = ["food", "transport", "shopping", "bills", "entertainment", "health", "education", "other"];
  const descriptions: Record<CategoryId, string[]> = {
    food: ["Foodpanda Order", "Pathao Food", "Local Restaurant", "Tea Stall", "HungryNaki"],
    transport: ["Uber Ride", "Pathao Ride", "CNG Auto", "Bus Fare", "Obhai Ride"],
    shopping: ["Daraz Order", "Aarong", "New Market", "Bashundhara City", "Chaldal Grocery"],
    bills: ["DESCO Bill", "Internet Bill", "Mobile Recharge", "Gas Bill", "WASA Bill"],
    entertainment: ["Netflix", "Spotify", "Cinema Ticket", "Gaming", "Hoichoi"],
    health: ["Pharmacy", "Doctor Visit", "Lab Test", "Medicine"],
    education: ["Udemy Course", "Book Purchase", "Coaching Fee", "Exam Fee"],
    other: ["ATM Withdrawal", "Transfer", "Donation", "Miscellaneous"],
  };

  const txns: Transaction[] = [];
  for (let i = 0; i < 80; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const bank = demoBanks[Math.floor(Math.random() * demoBanks.length)];
    const isReceived = Math.random() > 0.75;
    const day = Math.floor(Math.random() * 28) + 1;
    const month = Math.random() > 0.4 ? 2 : 1;
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
