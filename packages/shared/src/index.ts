export interface ApiMessageResponse {
  message: string;
  timestamp: string;
}

export interface HealthResponse {
  ok: true;
  service: string;
  timestamp: string;
}

export type ModuleStatus = "planned" | "in_progress" | "ready";

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  domain: string;
  status: ModuleStatus;
  dependsOn: string[];
}

export interface ModulesResponse {
  modules: SystemModule[];
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRateToMXN: number;
}

export interface CurrenciesResponse {
  currencies: Currency[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  department: string;
  unitPriceMXN: number;
  stock: number;
  extraCodes: string[];
}

export interface CatalogProductsResponse {
  products: Product[];
}

export interface QuoteItemInput {
  productId: string;
  quantity: number;
  discountPercent?: number;
}

export interface CreateQuoteRequest {
  customerName: string;
  currencyCode: string;
  channel: "whatsapp" | "email" | "in_store";
  items: QuoteItemInput[];
}

export interface QuoteLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
}

export interface Quote {
  id: string;
  folio: string;
  customerName: string;
  currencyCode: string;
  channel: "whatsapp" | "email" | "in_store";
  exchangeRateToMXN: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  items: QuoteLine[];
  createdAt: string;
}

export interface QuotesResponse {
  quotes: Quote[];
}

export interface CreateQuoteResponse {
  quote: Quote;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  roleId: string;
  branchId: string;
}

export interface AccessSnapshotResponse {
  users: User[];
  roles: Role[];
}

export interface AdminOverview {
  branches: number;
  warehouses: number;
  products: number;
  suppliers: number;
  openCredits: number;
  pendingTransfers: number;
  lowStockProducts: number;
}

export interface AdminOverviewResponse {
  overview: AdminOverview;
}
