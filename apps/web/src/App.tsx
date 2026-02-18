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
    <main className="min-h-screen bg-slate-200 bg-[radial-gradient(circle_at_10%_20%,#f9f2e8_0%,#f9f2e8_18%,transparent_40%),radial-gradient(circle_at_90%_5%,#dceaf8_0%,#dceaf8_20%,transparent_36%),linear-gradient(160deg,#dae4ef_0%,#ced8e5_38%,#d9e0e8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="rounded-2xl bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-700 p-6 text-cyan-50 shadow-xl shadow-sky-900/20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">VibeSale Platform Blueprint</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Jewelry POS Control Hub</h1>
          <p className="mt-3 max-w-3xl text-sm text-cyan-100 md:text-base">
            Foundation aligned to your architecture: access control, system modules, integrations, and data
            flows ready for incremental delivery.
          </p>
        </header>

        {status === "loading" && (
          <p className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-900">
            Loading POS modules...
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            {error}
          </p>
        )}

        {overview && (
          <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Branches" value={overview.branches} />
            <StatCard label="Warehouses" value={overview.warehouses} />
            <StatCard label="Products" value={overview.products} />
            <StatCard label="Suppliers" value={overview.suppliers} />
            <StatCard label="Low stock" value={overview.lowStockProducts} />
            <StatCard label="Open credits" value={overview.openCredits} />
          </section>
        )}

        <section className="grid gap-3 md:grid-cols-3">
          <InfoCard
            title="Module status"
            lines={[
              `${moduleSummary.ready} ready`,
              `${moduleSummary.inProgress} in progress`,
              `${moduleSummary.planned} planned`
            ]}
          />
          <InfoCard title="Access" lines={[`${rolesCount} roles`, `${usersCount} users`]} />
          <InfoCard
            title="Currencies"
            lines={[currencies.map((item) => item.code).join(" | ") || "No currencies"]}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
          <article className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur">
            <h2 className="text-base font-semibold text-slate-900">System modules</h2>
            <ul className="mt-3 grid gap-2">
              {modules.map((module) => (
                <li key={module.id} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">{module.name}</p>
                  <p className="text-xs text-slate-700">{module.description}</p>
                  <small className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {module.domain} | {module.status}
                  </small>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur">
            <h2 className="text-base font-semibold text-slate-900">Online catalog and quoting</h2>

            <form className="mt-3 grid gap-3" onSubmit={handleCreateQuote}>
              <Field label="Customer">
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.18)]"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  minLength={2}
                  required
                />
              </Field>

              <Field label="Product">
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.18)]"
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
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Quantity">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.18)]"
                    type="number"
                    min={1}
                    max={999}
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                  />
                </Field>

                <Field label="Discount %">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.18)]"
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(event) => setDiscountPercent(Number(event.target.value))}
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Currency">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.18)]"
                    value={currencyCode}
                    onChange={(event) => setCurrencyCode(event.target.value)}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Share channel">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-600 focus:shadow-[0_0_0_3px_rgba(8,145,178,0.18)]"
                    value={channel}
                    onChange={(event) => setChannel(event.target.value as CreateQuoteRequest["channel"])}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="in_store">In store</option>
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                disabled={submitState === "loading" || !selectedProduct}
                className="rounded-lg bg-gradient-to-r from-cyan-700 to-sky-800 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitState === "loading" ? "Creating quote..." : "Create quote"}
              </button>
            </form>

            <h3 className="mt-5 text-sm font-semibold text-slate-900">Catalog sample</h3>
            <ul className="mt-2 grid gap-2">
              {products.map((product) => (
                <li key={product.id} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{product.name}</p>
                  <small className="text-xs text-slate-600">
                    {product.category} | Stock: {product.stock} | MXN {product.unitPriceMXN.toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur">
          <h2 className="text-base font-semibold text-slate-900">Recent quotes</h2>
          {quotes.length === 0 && <p className="mt-2 text-sm text-slate-600">No quotes yet.</p>}
          {quotes.length > 0 && (
            <ul className="mt-3 grid gap-2">
              {quotes.map((quote) => (
                <li key={quote.id} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">
                    {quote.folio} | {quote.customerName} | {quote.currencyCode} {quote.total.toLocaleString()}
                  </p>
                  <small className="text-xs text-slate-600">
                    {quote.channel} | {new Date(quote.createdAt).toLocaleString()} | {quote.items.length} item(s)
                  </small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
      {label}
      {children}
    </label>
  );
}

function InfoCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <article className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {lines.map((line) => (
        <p key={line} className="text-sm text-slate-700">
          {line}
        </p>
      ))}
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h2>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value.toLocaleString()}</p>
    </article>
  );
}

export default App;
