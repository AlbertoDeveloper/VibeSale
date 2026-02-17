import "dotenv/config";
import cors from "cors";
import express from "express";

import type {
  AccessSnapshotResponse,
  AdminOverviewResponse,
  ApiMessageResponse,
  CatalogProductsResponse,
  CreateQuoteRequest,
  CreateQuoteResponse,
  CurrenciesResponse,
  Currency,
  HealthResponse,
  ModulesResponse,
  Product,
  Quote,
  QuoteLine,
  QuotesResponse,
  Role,
  SystemModule,
  User
} from "@vibesale/shared";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

const currencies: Currency[] = [
  { code: "MXN", name: "Mexican Peso", symbol: "$", exchangeRateToMXN: 1 },
  { code: "USD", name: "US Dollar", symbol: "US$", exchangeRateToMXN: 17.15 },
  { code: "EUR", name: "Euro", symbol: "EUR", exchangeRateToMXN: 18.75 }
];

const products: Product[] = [
  {
    id: "prd-ring-001",
    sku: "ANL-ORO-14K-001",
    name: "Anillo Oro 14K Solitario",
    category: "Anillos",
    department: "Joyeria fina",
    unitPriceMXN: 12900,
    stock: 8,
    extraCodes: ["750001", "R14KSOL001"]
  },
  {
    id: "prd-neck-002",
    sku: "CAD-PLATA-925-002",
    name: "Cadena Plata 925 50cm",
    category: "Cadenas",
    department: "Plata",
    unitPriceMXN: 2150,
    stock: 23,
    extraCodes: ["925050002", "CDP92550"]
  },
  {
    id: "prd-ear-003",
    sku: "ARR-ORO-10K-003",
    name: "Aretes Oro 10K Clasicos",
    category: "Aretes",
    department: "Joyeria fina",
    unitPriceMXN: 4890,
    stock: 3,
    extraCodes: ["710003", "AR10KCLS"]
  },
  {
    id: "prd-watch-004",
    sku: "REL-ACERO-004",
    name: "Reloj Acero Inoxidable",
    category: "Relojes",
    department: "Accesorios",
    unitPriceMXN: 3390,
    stock: 12,
    extraCodes: ["REL004", "WATSS004"]
  }
];

const roles: Role[] = [
  {
    id: "role-admin",
    name: "Administrador",
    permissions: ["*", "sales.manage", "inventory.manage", "reports.view"]
  },
  {
    id: "role-cashier",
    name: "Cajero",
    permissions: ["sales.manage", "quotes.manage", "cash_register.closeout"]
  },
  {
    id: "role-manager",
    name: "Gerente de sucursal",
    permissions: ["inventory.view", "transfers.manage", "reports.view", "credits.manage"]
  }
];

const users: User[] = [
  { id: "usr-001", name: "Sofia Ruiz", roleId: "role-admin", branchId: "branch-cdmx" },
  { id: "usr-002", name: "Marco Vela", roleId: "role-cashier", branchId: "branch-cdmx" },
  { id: "usr-003", name: "Elena Cruz", roleId: "role-manager", branchId: "branch-gdl" }
];

const modules: SystemModule[] = [
  {
    id: "online-catalog",
    name: "Online catalog",
    description: "Customer-facing product browsing and quote generation.",
    domain: "Sales",
    status: "in_progress",
    dependsOn: ["roles-permissions", "multi-currency", "messaging"]
  },
  {
    id: "custom-labels",
    name: "Custom labels",
    description: "Label templates with price, SKU, and barcode rendering.",
    domain: "Inventory",
    status: "planned",
    dependsOn: ["hardware-integration"]
  },
  {
    id: "hardware-integration",
    name: "Hardware integration",
    description: "Receipts, drawers, scanners, touch monitors, and label printers.",
    domain: "POS",
    status: "planned",
    dependsOn: ["access-gateway"]
  },
  {
    id: "multi-currency",
    name: "Multi-currency",
    description: "Sales, purchases, and quotes with configurable currencies.",
    domain: "Finance",
    status: "in_progress",
    dependsOn: ["reports-analytics"]
  },
  {
    id: "cash-register-closeout",
    name: "Cash register closeout",
    description: "Fast closeout with per-currency reconciliation.",
    domain: "Finance",
    status: "planned",
    dependsOn: ["multi-currency", "roles-permissions"]
  },
  {
    id: "electronic-invoicing",
    name: "Electronic invoicing",
    description: "CFDI generation with PDF, email, and QR workflows.",
    domain: "Tax",
    status: "planned",
    dependsOn: ["external-invoicing-service", "email"]
  },
  {
    id: "warehouse-management",
    name: "Warehouse management",
    description: "Transfers between warehouses and branch stock controls.",
    domain: "Inventory",
    status: "in_progress",
    dependsOn: ["branch-management", "inventory-adjustments"]
  },
  {
    id: "branch-management",
    name: "Branch management",
    description: "Centralized branch operations and money movements.",
    domain: "Operations",
    status: "in_progress",
    dependsOn: ["roles-permissions"]
  },
  {
    id: "purchase-tracking",
    name: "Purchase tracking",
    description: "Purchases, incoming inventory, and purchase reports.",
    domain: "Procurement",
    status: "in_progress",
    dependsOn: ["supplier-management", "warehouse-management"]
  },
  {
    id: "discount-management",
    name: "Discount management",
    description: "Volume discounts and preferred customer pricing.",
    domain: "Sales",
    status: "in_progress",
    dependsOn: ["online-catalog", "reports-analytics"]
  },
  {
    id: "reports-analytics",
    name: "Reports and analytics",
    description: "Sales, purchases, product trends, and dashboard charts.",
    domain: "Insights",
    status: "in_progress",
    dependsOn: ["warehouse-management", "purchase-tracking"]
  },
  {
    id: "cross-platform-pos",
    name: "Cross-platform POS",
    description: "Browser-based POS client for desktop and mobile devices.",
    domain: "POS",
    status: "ready",
    dependsOn: ["roles-permissions", "hardware-integration"]
  },
  {
    id: "roles-permissions",
    name: "Roles and permissions",
    description: "Role-based access control for users and operations.",
    domain: "Access",
    status: "in_progress",
    dependsOn: ["access-gateway"]
  },
  {
    id: "shared-credit-accounts",
    name: "Shared credit accounts",
    description: "Pay and reconcile customer credits across branches.",
    domain: "Finance",
    status: "planned",
    dependsOn: ["branch-management", "reports-analytics"]
  },
  {
    id: "categories-departments",
    name: "Categories and departments",
    description: "Product taxonomy for inventory and reporting.",
    domain: "Catalog",
    status: "ready",
    dependsOn: ["online-catalog"]
  },
  {
    id: "bulk-import",
    name: "Bulk import",
    description: "Spreadsheet-based mass product onboarding.",
    domain: "Catalog",
    status: "planned",
    dependsOn: ["categories-departments", "multiple-product-codes"]
  },
  {
    id: "multiple-product-codes",
    name: "Multiple product codes",
    description: "Alternative keys and barcodes per product.",
    domain: "Catalog",
    status: "ready",
    dependsOn: ["online-catalog"]
  },
  {
    id: "inventory-adjustments",
    name: "Inventory adjustments",
    description: "Stock movements, reconciliations, and shrinkage reports.",
    domain: "Inventory",
    status: "in_progress",
    dependsOn: ["warehouse-management"]
  },
  {
    id: "sales-commissions",
    name: "Sales commissions by employee",
    description: "Sale attribution and commission calculation by employee.",
    domain: "HR",
    status: "planned",
    dependsOn: ["reports-analytics", "branch-management"]
  },
  {
    id: "supplier-management",
    name: "Supplier management",
    description: "Supplier master data for purchasing operations.",
    domain: "Procurement",
    status: "in_progress",
    dependsOn: ["purchase-tracking"]
  }
];

const quotes: Quote[] = [];

let quoteCounter = 1;

function resolveCurrency(code: string): Currency {
  const found = currencies.find((currency) => currency.code === code);
  if (found) {
    return found;
  }

  if (currencies.length === 0) {
    throw new Error("No currencies configured");
  }

  return currencies[0]!;
}

function toCurrencyAmount(amountInMXN: number, currency: Currency): number {
  if (currency.code === "MXN") {
    return Number(amountInMXN.toFixed(2));
  }

  return Number((amountInMXN / currency.exchangeRateToMXN).toFixed(2));
}

function buildQuote(payload: CreateQuoteRequest): Quote {
  const currency = resolveCurrency(payload.currencyCode);
  const lines: QuoteLine[] = payload.items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);

    if (!product) {
      throw new Error(`Unknown product id: ${item.productId}`);
    }

    const discountPercent = item.discountPercent ?? 0;
    const lineSubtotalMXN = product.unitPriceMXN * item.quantity;
    const lineDiscountMXN = lineSubtotalMXN * (discountPercent / 100);
    const lineTotalMXN = lineSubtotalMXN - lineDiscountMXN;

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice: toCurrencyAmount(product.unitPriceMXN, currency),
      discountPercent,
      lineTotal: toCurrencyAmount(lineTotalMXN, currency)
    };
  });

  const subtotalMXN = payload.items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? product.unitPriceMXN * item.quantity : 0);
  }, 0);

  const totalDiscountMXN = payload.items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    const discount = item.discountPercent ?? 0;
    return sum + (product ? product.unitPriceMXN * item.quantity * (discount / 100) : 0);
  }, 0);

  const totalMXN = subtotalMXN - totalDiscountMXN;

  const folio = `Q-${new Date().getFullYear()}-${String(quoteCounter).padStart(4, "0")}`;
  quoteCounter += 1;

  return {
    id: crypto.randomUUID(),
    folio,
    customerName: payload.customerName,
    currencyCode: currency.code,
    channel: payload.channel,
    exchangeRateToMXN: currency.exchangeRateToMXN,
    subtotal: toCurrencyAmount(subtotalMXN, currency),
    totalDiscount: toCurrencyAmount(totalDiscountMXN, currency),
    total: toCurrencyAmount(totalMXN, currency),
    items: lines,
    createdAt: new Date().toISOString()
  };
}

app.get("/api/health", (_req, res) => {
  const response: HealthResponse = {
    ok: true,
    service: "vibesale-server",
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

app.get("/api/message", (_req, res) => {
  const payload: ApiMessageResponse = {
    message: "VibeSale POS API is online.",
    timestamp: new Date().toISOString()
  };

  res.json(payload);
});

app.get("/api/modules", (_req, res) => {
  const response: ModulesResponse = { modules };
  res.json(response);
});

app.get("/api/currencies", (_req, res) => {
  const response: CurrenciesResponse = { currencies };
  res.json(response);
});

app.get("/api/access/snapshot", (_req, res) => {
  const response: AccessSnapshotResponse = { users, roles };
  res.json(response);
});

app.get("/api/catalog/products", (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query.toLowerCase() : "";
  const category = typeof req.query.category === "string" ? req.query.category.toLowerCase() : "";

  const filtered = products.filter((product) => {
    const matchesQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.extraCodes.some((code) => code.toLowerCase().includes(query));

    const matchesCategory = category.length === 0 || product.category.toLowerCase() === category;

    return matchesQuery && matchesCategory;
  });

  const response: CatalogProductsResponse = { products: filtered };
  res.json(response);
});

app.get("/api/catalog/quotes", (_req, res) => {
  const response: QuotesResponse = { quotes };
  res.json(response);
});

app.post("/api/catalog/quotes", (req, res) => {
  const payload = req.body as Partial<CreateQuoteRequest>;

  if (!payload.customerName || payload.customerName.trim().length < 2) {
    return res.status(400).json({ error: "customerName is required" });
  }

  if (!payload.currencyCode || !currencies.some((currency) => currency.code === payload.currencyCode)) {
    return res.status(400).json({ error: "currencyCode is invalid" });
  }

  if (!payload.channel || !["whatsapp", "email", "in_store"].includes(payload.channel)) {
    return res.status(400).json({ error: "channel is invalid" });
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return res.status(400).json({ error: "items must contain at least one product" });
  }

  const hasInvalidItem = payload.items.some(
    (item) => !item.productId || Number(item.quantity) <= 0 || Number(item.quantity) > 999
  );

  if (hasInvalidItem) {
    return res.status(400).json({ error: "items contain invalid entries" });
  }

  try {
    const quote = buildQuote({
      customerName: payload.customerName.trim(),
      currencyCode: payload.currencyCode,
      channel: payload.channel,
      items: payload.items
    });

    quotes.unshift(quote);

    const response: CreateQuoteResponse = { quote };
    return res.status(201).json(response);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to generate quote"
    });
  }
});

app.get("/api/admin/overview", (_req, res) => {
  const overview: AdminOverviewResponse = {
    overview: {
      branches: 2,
      warehouses: 3,
      products: products.length,
      suppliers: 14,
      openCredits: 11,
      pendingTransfers: 4,
      lowStockProducts: products.filter((product) => product.stock <= 5).length
    }
  };

  res.json(overview);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
