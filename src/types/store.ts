export type PhoneCondition = string;

export type CategoryColorTheme =
  | "amber"
  | "rose"
  | "pink"
  | "emerald"
  | "purple"
  | "orange"
  | "sky"
  | "slate";

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  shortLabel: string;
  colorTheme: CategoryColorTheme;
}

export interface BrandItem {
  id: string;
  name: string;
  icon: string;
}

export interface PhoneVariant {
  id: string;
  ram: string; // Varian / Shade
  storage: string; // Ukuran / Netto
  color: string; // Keterangan shade
  colorHex: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface PhoneSpecs {
  screen: string; // Manfaat Utama
  processor: string; // Kandungan Aktif
  camera: string; // Cocok Untuk
  battery: string; // Ukuran / Netto
  os: string; // Cara Pakai
  network: string; // Status BPOM / Halal
  sim: string; // Tekstur & Hasil Akhir
  weight?: string;
}

export interface PhoneInspection {
  batteryHealth: string; // Keaslian ("Original 100%")
  imeiStatus: string; // Status BPOM
  faceIdOrFingerprint: string;
  screenCondition: string; // Exp / Batch
  bodyCondition: string; // Kondisi Kemasan
  completeness: string[]; // Isi Paket
}

export interface PhoneProduct {
  id: string;
  name: string;
  brand: string;
  condition: PhoneCondition;
  warranty: string;
  featured: boolean;
  flashSale: boolean;
  rating: number;
  soldCount: number;
  images: string[];
  description: string;
  variants: PhoneVariant[];
  specs: PhoneSpecs;
  inspection: PhoneInspection;
  createdAt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaFilterBrand?: string;
  bgGradient: string;
  imageUrl: string;
  active: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  discountAmount: number;
  minPurchase: number;
  description: string;
  active: boolean;
}

export interface TradeInSubmission {
  id: string;
  customerName: string;
  whatsapp: string;
  oldPhoneBrand: string;
  oldPhoneModel: string;
  storage: string;
  physicalCondition: string;
  completeness: string;
  batteryHealth: string;
  estimatedValue: number;
  targetPhoneName?: string;
  submissionType: string;
  status: "Menunggu Inspeksi" | "Disetujui" | "Selesai" | "Ditolak";
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  condition: PhoneCondition;
  variantLabel: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  address: string;
  shippingMethod: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  voucherCode?: string;
  status: "Menunggu Pembayaran" | "Diproses & QC" | "Dikirim" | "Selesai" | "Dibatalkan";
  resiNumber?: string;
  createdAt: string;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  logoUrl: string;
  logoTextIcon: string;
  primaryColor: "blue" | "emerald" | "violet" | "rose" | "amber" | "slate";
  whatsappNumber: string;
  instagramHandle: string;
  storeAddress: string;
  mapsUrl?: string;
  operationalHours: string;
  announcementBar: string;
  announcementActive: boolean;
  adminPin: string;
  trustBadges: {
    title: string;
    desc: string;
  }[];
  tradeInBaseModels: {
    id: string;
    brand: string;
    model: string;
    basePrice: number;
  }[];
}

export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  type: "calculated_via_wa" | "free" | "fixed";
  description: string;
  active: boolean;
}

export interface StoreData {
  brandConfig: BrandConfig;
  categories?: CategoryConfig[];
  brands?: BrandItem[];
  banners: PromoBanner[];
  products: PhoneProduct[];
  vouchers: Voucher[];
  orders: Order[];
  tradeIns: TradeInSubmission[];
  shippingOptions?: ShippingOption[];
  lastUpdated: string;
}
