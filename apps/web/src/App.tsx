import { useEffect, useMemo, useState } from "react";
import type {
  AccessSnapshotResponse,
  AdminOverviewResponse,
  CatalogProductsResponse,
  CreateQuoteRequest,
  CurrenciesResponse,
  ModulesResponse,
  Product,
  Quote,
  QuotesResponse,
  SystemModule
} from "@vibesale/shared";
import "./App.css";

type AsyncState = "idle" | "loading" | "error";

function App() {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currencies, setCurrencies] = useState<CurrenciesResponse["currencies"]>([]);
  const [rolesCount, setRolesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [overview, setOverview] = useState<AdminOverviewResponse["overview"] | null>(null);
  const [status, setStatus] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("Consumidor Final");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [currencyCode, setCurrencyCode] = useState("MXN");
  const [channel, setChannel] = useState<CreateQuoteRequest["channel"]>("whatsapp");
  const [submitState, setSubmitState] = useState<AsyncState>("idle");

  useEffect(() => {
    async function bootstrap() {
      setStatus("loading");
      setError(null);

      try {
        const [modulesRes, productsRes, quotesRes, currenciesRes, accessRes, overviewRes] =
          await Promise.all([
            fetch("/api/modules"),
            fetch("/api/catalog/products"),
            fetch("/api/catalog/quotes"),
            fetch("/api/currencies"),
            fetch("/api/access/snapshot"),
            fetch("/api/admin/overview")
          ]);

        if (
          !modulesRes.ok ||
          !productsRes.ok ||
          !quotesRes.ok ||
          !currenciesRes.ok ||
          !accessRes.ok ||
          !overviewRes.ok
        ) {
          throw new Error("Could not load POS bootstrap data.");
        }

        const modulesPayload = (await modulesRes.json()) as ModulesResponse;
        const productsPayload = (await productsRes.json()) as CatalogProductsResponse;
        const quotesPayload = (await quotesRes.json()) as QuotesResponse;
        const currenciesPayload = (await currenciesRes.json()) as CurrenciesResponse;
        const accessPayload = (await accessRes.json()) as AccessSnapshotResponse;
        const overviewPayload = (await overviewRes.json()) as AdminOverviewResponse;

        setModules(modulesPayload.modules);
        setProducts(productsPayload.products);
        setQuotes(quotesPayload.quotes);
        setCurrencies(currenciesPayload.currencies);
        setRolesCount(accessPayload.roles.length);
        setUsersCount(accessPayload.users.length);
        setOverview(overviewPayload.overview);

        if (productsPayload.products.length > 0) {
          setSelectedProductId(productsPayload.products[0].id);
        }

        if (currenciesPayload.currencies.length > 0) {
          setCurrencyCode(currenciesPayload.currencies[0].code);
        }

        setStatus("idle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown bootstrap error");
        setStatus("error");
      }
    }

    bootstrap();
  }, []);

  const moduleSummary = useMemo(() => {
    return {
      ready: modules.filter((entry) => entry.status === "ready").length,
      inProgress: modules.filter((entry) => entry.status === "in_progress").length,
      planned: modules.filter((entry) => entry.status === "planned").length
    };
  }, [modules]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  async function handleCreateQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");

    try {
      const payload: CreateQuoteRequest = {
        customerName,
        currencyCode,
        channel,
        items: [
          {
            productId: selectedProductId,
            quantity,
            discountPercent
          }
        ]
      };

      const response = await fetch("/api/catalog/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Quote request failed (${response.status})`);
      }

      const result = (await response.json()) as { quote: Quote };
      setQuotes((prev) => [result.quote, ...prev]);
      setSubmitState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create quote.");
      setSubmitState("error");
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">VibeSale Platform Blueprint</p>
        <h1>Jewelry POS Control Hub</h1>
        <p>
          Foundation aligned to your architecture: access control, system modules, integrations, and data
          flows ready for incremental delivery.
        </p>
      </header>

      {status === "loading" && <p>Loading POS modules...</p>}
      {error && <p className="error">{error}</p>}

      {overview && (
        <section className="stats">
          <article>
            <h2>Branches</h2>
            <p>{overview.branches}</p>
          </article>
          <article>
            <h2>Warehouses</h2>
            <p>{overview.warehouses}</p>
          </article>
          <article>
            <h2>Products</h2>
            <p>{overview.products}</p>
          </article>
          <article>
            <h2>Suppliers</h2>
            <p>{overview.suppliers}</p>
          </article>
          <article>
            <h2>Low stock</h2>
            <p>{overview.lowStockProducts}</p>
          </article>
          <article>
            <h2>Open credits</h2>
            <p>{overview.openCredits}</p>
          </article>
        </section>
      )}

      <section className="summary">
        <article>
          <h2>Module status</h2>
          <p>{moduleSummary.ready} ready</p>
          <p>{moduleSummary.inProgress} in progress</p>
          <p>{moduleSummary.planned} planned</p>
        </article>
        <article>
          <h2>Access</h2>
          <p>{rolesCount} roles</p>
          <p>{usersCount} users</p>
        </article>
        <article>
          <h2>Currencies</h2>
          <p>{currencies.map((item) => item.code).join(" | ")}</p>
        </article>
      </section>

      <section className="layout-two-col">
        <article className="card">
          <h2>System modules</h2>
          <ul className="module-list">
            {modules.map((module) => (
              <li key={module.id}>
                <p className="module-title">{module.name}</p>
                <p>{module.description}</p>
                <small>
                  {module.domain} | {module.status}
                </small>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Online catalog and quoting</h2>
          <form className="quote-form" onSubmit={handleCreateQuote}>
            <label>
              Customer
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                minLength={2}
                required
              />
            </label>

            <label>
              Product
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                required
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </label>

            <div className="row">
              <label>
                Quantity
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </label>

              <label>
                Discount %
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(event) => setDiscountPercent(Number(event.target.value))}
                />
              </label>
            </div>

            <div className="row">
              <label>
                Currency
                <select value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value)}>
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Share channel
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as CreateQuoteRequest["channel"])}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="in_store">In store</option>
                </select>
              </label>
            </div>

            <button type="submit" disabled={submitState === "loading" || !selectedProduct}>
              {submitState === "loading" ? "Creating quote..." : "Create quote"}
            </button>
          </form>

          <h3>Catalog sample</h3>
          <ul className="product-list">
            {products.map((product) => (
              <li key={product.id}>
                <p>{product.name}</p>
                <small>
                  {product.category} | Stock: {product.stock} | MXN {product.unitPriceMXN.toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <h2>Recent quotes</h2>
        {quotes.length === 0 && <p>No quotes yet.</p>}
        {quotes.length > 0 && (
          <ul className="quote-list">
            {quotes.map((quote) => (
              <li key={quote.id}>
                <p>
                  {quote.folio} | {quote.customerName} | {quote.currencyCode} {quote.total.toLocaleString()}
                </p>
                <small>
                  {quote.channel} | {new Date(quote.createdAt).toLocaleString()} | {quote.items.length} item(s)
                </small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
