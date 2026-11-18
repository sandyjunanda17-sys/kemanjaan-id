import { CategoryColorTheme, CategoryConfig, PhoneCondition } from "@/types/store";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const THEME_CLASS_MAP: Record<
  CategoryColorTheme,
  { bg: string; text: string; border: string }
> = {
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

export function getConditionBadgeStyle(
  condition: PhoneCondition,
  categories?: CategoryConfig[]
): {
  bg: string;
  text: string;
  border: string;
  shortLabel: string;
} {
  if (categories && categories.length > 0) {
    const matched = categories.find(
      (c) => c.name.toLowerCase() === String(condition).toLowerCase()
    );
    if (matched) {
      const classes = THEME_CLASS_MAP[matched.colorTheme] || THEME_CLASS_MAP.rose;
      return {
        ...classes,
        shortLabel: matched.shortLabel || matched.name.toUpperCase(),
      };
    }
  }

  switch (condition) {
    case "Signature Kemanjaan":
      return { ...THEME_CLASS_MAP.amber, shortLabel: "SIGNATURE" };
    case "Skincare & Moisturizer":
    case "Skincare & Sunscreen":
      return { ...THEME_CLASS_MAP.rose, shortLabel: "SKINCARE" };
    case "Serum & Eksfoliasi":
      return { ...THEME_CLASS_MAP.purple, shortLabel: "SERUM" };
    case "Sunscreen Viral":
      return { ...THEME_CLASS_MAP.sky, shortLabel: "SUNSCREEN" };
    case "Lip Cream & Lip Tint":
      return { ...THEME_CLASS_MAP.pink, shortLabel: "LIP SERIES" };
    case "Makeup & Cushion":
    case "Makeup & Lip Series":
      return { ...THEME_CLASS_MAP.rose, shortLabel: "MAKEUP" };
    case "Bodycare, Parfum & Men":
      return { ...THEME_CLASS_MAP.emerald, shortLabel: "BODY & MEN" };
    case "Tas, Aksesoris & Kedai":
    case "Tas & Aksesoris Cantik":
      return { ...THEME_CLASS_MAP.orange, shortLabel: "TAS & KEDAI" };
    default:
      return {
        ...THEME_CLASS_MAP.slate,
        shortLabel: String(condition).slice(0, 14).toUpperCase(),
      };
  }
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const normalized = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
