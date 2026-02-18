import type { Product } from "@vibesale/shared";
import type { CartLine, CurrencyOption, SalesCategory } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesProductSearch(product: Product, term: string): boolean {
  const query = normalize(term);

  if (!query) {
    return true;
  }

  return (
    product.name.toLowerCase().includes(query) ||
    product.sku.toLowerCase().includes(query) ||
    product.extraCodes.some((code) => code.toLowerCase().includes(query))
  );
}

export function filterProducts(
  products: Product[],
  selectedCategory: SalesCategory,
  leftSearch: string,
  rightSearch: string
): Product[] {
  const left = normalize(leftSearch);
  const right = normalize(rightSearch);

  return products.filter((product) => {
    const sameCategory = product.category.toLowerCase() === selectedCategory.toLowerCase();

    if (!sameCategory) {
      return false;
    }

    if (!left && !right) {
      return true;
    }

    const leftMatch = left ? matchesProductSearch(product, left) : false;
    const rightMatch = right ? matchesProductSearch(product, right) : false;

    return leftMatch || rightMatch;
  });
}

export function findProductByCode(products: Product[], code: string): Product | null {
  const query = normalize(code);

  if (!query) {
    return null;
  }

  return (
    products.find(
      (product) =>
        product.sku.toLowerCase() === query ||
        product.extraCodes.some((extraCode) => extraCode.toLowerCase() === query)
    ) ?? null
  );
}

export function canIncreaseQuantity(line: CartLine, nextQuantity: number): boolean {
  return nextQuantity <= line.product.stock;
}

export function addOrIncrementCartLine(cart: CartLine[], product: Product): { cart: CartLine[]; blocked: boolean } {
  const index = cart.findIndex((line) => line.product.id === product.id);

  if (index === -1) {
    if (product.stock <= 0) {
      return { cart, blocked: true };
    }

    return {
      cart: [...cart, { product, quantity: 1 }],
      blocked: false
    };
  }

  const line = cart[index];
  if (!line || !canIncreaseQuantity(line, line.quantity + 1)) {
    return { cart, blocked: true };
  }

  const updated = [...cart];
  updated[index] = { ...line, quantity: line.quantity + 1 };

  return { cart: updated, blocked: false };
}

export function decrementCartLine(cart: CartLine[], productId: string): CartLine[] {
  return cart.flatMap((line) => {
    if (line.product.id !== productId) {
      return [line];
    }

    if (line.quantity <= 1) {
      return [];
    }

    return [{ ...line, quantity: line.quantity - 1 }];
  });
}

export function incrementCartLine(cart: CartLine[], productId: string): { cart: CartLine[]; blocked: boolean } {
  const index = cart.findIndex((line) => line.product.id === productId);

  if (index === -1) {
    return { cart, blocked: true };
  }

  const line = cart[index];
  if (!line || !canIncreaseQuantity(line, line.quantity + 1)) {
    return { cart, blocked: true };
  }

  const updated = [...cart];
  updated[index] = { ...line, quantity: line.quantity + 1 };
  return { cart: updated, blocked: false };
}

export function removeCartLine(cart: CartLine[], productId: string): CartLine[] {
  return cart.filter((line) => line.product.id !== productId);
}

export function convertFromMXN(amountInMXN: number, currency: CurrencyOption): number {
  if (currency.code === "MXN") {
    return Number(amountInMXN.toFixed(2));
  }

  return Number((amountInMXN / currency.exchangeRateToMXN).toFixed(2));
}

export function cartItemCount(cart: CartLine[]): number {
  return cart.reduce((count, line) => count + line.quantity, 0);
}

export function cartTotal(cart: CartLine[], currency: CurrencyOption): number {
  const mxnTotal = cart.reduce((sum, line) => sum + line.product.unitPriceMXN * line.quantity, 0);
  return convertFromMXN(mxnTotal, currency);
}

export function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
