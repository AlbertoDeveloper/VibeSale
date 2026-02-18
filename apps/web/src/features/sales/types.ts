import type { Currency, Product } from "@vibesale/shared";

export const salesCategories = [
  "Anillos",
  "Cadenas",
  "Relojes",
  "Plata",
  "Aretes",
  "Pulseras",
  "Medallas"
] as const;

export type SalesCategory = (typeof salesCategories)[number];

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  exchangeRateToMXN: number;
}

export const mxnFallbackCurrency: CurrencyOption = {
  code: "MXN",
  symbol: "$",
  exchangeRateToMXN: 1
};

export function toCurrencyOption(currency: Currency): CurrencyOption {
  return {
    code: currency.code,
    symbol: currency.symbol,
    exchangeRateToMXN: currency.exchangeRateToMXN
  };
}
