import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogProductsResponse, CurrenciesResponse, Currency, Product } from "@vibesale/shared";
import {
  addOrIncrementCartLine,
  cartItemCount,
  cartTotal,
  convertFromMXN,
  decrementCartLine,
  filterProducts,
  findProductByCode,
  formatMoney,
  incrementCartLine,
  removeCartLine
} from "../features/sales/salesUtils";
import { mxnFallbackCurrency, salesCategories, toCurrencyOption, type CartLine } from "../features/sales/types";

interface SalesScreenProps {
  darkMode: boolean;
}

function SalesScreen({ darkMode }: SalesScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<(typeof salesCategories)[number]>(salesCategories[0]);
  const [leftSearch, setLeftSearch] = useState("");
  const [scannerInput, setScannerInput] = useState("");
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("MXN");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [currencyWarning, setCurrencyWarning] = useState<string | null>(null);

  const scannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    setCurrencyWarning(null);

    try {
      const [productRes, currencyRes] = await Promise.all([fetch("/api/catalog/products"), fetch("/api/currencies")]);

      if (!productRes.ok) {
        throw new Error("No fue posible cargar el inventario.");
      }

      const productPayload = (await productRes.json()) as CatalogProductsResponse;
      setProducts(productPayload.products);

      if (!currencyRes.ok) {
        setCurrencies([]);
        setSelectedCurrencyCode("MXN");
        setCurrencyWarning("No fue posible cargar divisas. Se usara MXN por defecto.");
      } else {
        const currencyPayload = (await currencyRes.json()) as CurrenciesResponse;
        setCurrencies(currencyPayload.currencies);

        const preferred = currencyPayload.currencies.find((item) => item.code === "MXN") ?? currencyPayload.currencies[0];
        setSelectedCurrencyCode(preferred?.code ?? "MXN");

        if (currencyPayload.currencies.length === 0) {
          setCurrencyWarning("No hay divisas configuradas. Se usara MXN por defecto.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar datos de ventas.");
    } finally {
      setLoading(false);
    }
  }

  const selectedCurrency = useMemo(() => {
    const found = currencies.find((currency) => currency.code === selectedCurrencyCode);
    return found ? toCurrencyOption(found) : mxnFallbackCurrency;
  }, [currencies, selectedCurrencyCode]);

  const filteredProducts = useMemo(
    () => filterProducts(products, selectedCategory, leftSearch, scannerInput),
    [products, selectedCategory, leftSearch, scannerInput]
  );

  const itemCount = useMemo(() => cartItemCount(cart), [cart]);
  const total = useMemo(() => cartTotal(cart, selectedCurrency), [cart, selectedCurrency]);

  function tryAddProduct(product: Product) {
    const result = addOrIncrementCartLine(cart, product);

    if (result.blocked) {
      setNotice(`Stock insuficiente para ${product.name}.`);
      return;
    }

    setCart(result.cart);
    setNotice(null);
  }

  function onScannerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = findProductByCode(products, scannerInput);

    if (!found) {
      setNotice("Producto no encontrado.");
      scannerRef.current?.focus();
      return;
    }

    const result = addOrIncrementCartLine(cart, found);
    if (result.blocked) {
      setNotice(`Stock insuficiente para ${found.name}.`);
      scannerRef.current?.focus();
      return;
    }

    setCart(result.cart);
    setNotice(null);
    setScannerInput("");
    scannerRef.current?.focus();
  }

  function incrementLine(productId: string) {
    const result = incrementCartLine(cart, productId);

    if (result.blocked) {
      const line = cart.find((entry) => entry.product.id === productId);
      setNotice(line ? `Stock insuficiente para ${line.product.name}.` : "No se pudo incrementar la cantidad.");
      return;
    }

    setCart(result.cart);
    setNotice(null);
  }

  function decrementLine(productId: string) {
    setCart((current) => decrementCartLine(current, productId));
    setNotice(null);
  }

  function removeLine(productId: string) {
    setCart((current) => removeCartLine(current, productId));
    setNotice(null);
  }

  const panelClass = darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white";
  const mutedClass = darkMode ? "text-slate-400" : "text-slate-500";
  const inputClass = darkMode
    ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400";

  if (loading) {
    return (
      <div className={`w-full rounded-2xl border p-6 shadow-xl ${panelClass}`}>
        <p className="text-sm font-medium">Cargando inventario de ventas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full rounded-2xl border p-6 shadow-xl ${panelClass}`}>
        <p className="text-sm font-semibold text-rose-500">{error}</p>
        <button
          type="button"
          onClick={() => void loadData()}
          className="mt-4 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <section className={`rounded-2xl border p-4 shadow-xl ${panelClass}`}>
          <div className="flex items-center gap-2">
            <input
              value={leftSearch}
              onChange={(event) => setLeftSearch(event.target.value)}
              placeholder="Buscar por nombre, SKU o codigo"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.18)] ${inputClass}`}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {salesCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-cyan-700 text-white"
                    : darkMode
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const disabled = product.stock <= 0;
              const displayPrice = convertFromMXN(product.unitPriceMXN, selectedCurrency);

              return (
                <button
                  type="button"
                  key={product.id}
                  disabled={disabled}
                  onClick={() => tryAddProduct(product)}
                  className={`rounded-xl border p-3 text-left shadow-sm transition ${
                    disabled
                      ? darkMode
                        ? "cursor-not-allowed border-slate-700 bg-slate-800/50 opacity-55"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-55"
                      : darkMode
                        ? "border-slate-700 bg-slate-800 hover:border-cyan-500"
                        : "border-slate-200 bg-white hover:border-cyan-500"
                  }`}
                >
                  <div className="mb-3 flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-amber-200 to-orange-300 text-2xl">
                    ??
                  </div>
                  <p className="text-sm font-semibold leading-snug">{product.name}</p>
                  <p className={`mt-1 text-xs ${mutedClass}`}>SKU: {product.sku}</p>
                  <p className={`text-xs ${mutedClass}`}>Stock: {product.stock}</p>
                  <p className="mt-2 text-sm font-bold text-emerald-500">
                    {selectedCurrency.symbol}
                    {formatMoney(displayPrice)} {selectedCurrency.code}
                  </p>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <p className={`mt-6 rounded-xl border border-dashed px-4 py-5 text-sm ${mutedClass}`}>
              No hay productos para esta categoría o búsqueda.
            </p>
          )}
        </section>

        <aside className={`flex min-h-[560px] flex-col rounded-2xl border p-4 shadow-xl ${panelClass}`}>
          <form onSubmit={onScannerSubmit}>
            <input
              ref={scannerRef}
              value={scannerInput}
              onChange={(event) => setScannerInput(event.target.value)}
              placeholder="Buscar o escanear SKU/codigo"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.18)] ${inputClass}`}
            />
          </form>

          {notice && (
            <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900">
              {notice}
            </p>
          )}

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
            {cart.length === 0 && (
              <p className={`rounded-xl border border-dashed px-4 py-5 text-sm ${mutedClass}`}>
                Aun no hay productos agregados.
              </p>
            )}

            {cart.map((line) => {
              const unit = convertFromMXN(line.product.unitPriceMXN, selectedCurrency);
              const lineTotal = convertFromMXN(line.product.unitPriceMXN * line.quantity, selectedCurrency);

              return (
                <article
                  key={line.product.id}
                  className={`rounded-xl border px-3 py-3 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-cyan-600">{line.quantity} pza</p>
                      <p className="text-sm font-semibold leading-snug">{line.product.name}</p>
                      <p className={`text-xs ${mutedClass}`}>{line.product.sku}</p>
                      <p className="mt-1 text-xs font-medium">
                        Unit: {selectedCurrency.symbol}
                        {formatMoney(unit)}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-emerald-500">
                      {selectedCurrency.symbol}
                      {formatMoney(lineTotal)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decrementLine(line.product.id)}
                      className={`h-8 w-8 rounded-md border text-sm font-bold ${
                        darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"
                      }`}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementLine(line.product.id)}
                      className={`h-8 w-8 rounded-md border text-sm font-bold ${
                        darkMode ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"
                      }`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLine(line.product.id)}
                      className="ml-auto rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-500"
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-300/40 pt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Moneda</label>
            <select
              value={selectedCurrencyCode}
              onChange={(event) => setSelectedCurrencyCode(event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-cyan-500 ${inputClass}`}
            >
              {currencies.length > 0 ? (
                currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol})
                  </option>
                ))
              ) : (
                <option value="MXN">MXN ($)</option>
              )}
            </select>

            {currencyWarning && <p className="mt-2 text-xs text-amber-600">{currencyWarning}</p>}

            <button
              type="button"
              disabled={itemCount === 0}
              className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-bold transition ${
                itemCount === 0
                  ? darkMode
                    ? "cursor-not-allowed bg-slate-700 text-slate-400"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              {itemCount === 0
                ? "Agregar productos"
                : `(${itemCount}) ${selectedCurrency.symbol}${formatMoney(total)} ${selectedCurrency.code}`}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SalesScreen;
