export type CartItem = {
  key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
};

const CART_STORAGE_KEY = "yesbike-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value as CartItem[] : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("yesbike-cart-updated"));
}

export function addToCart(item: Omit<CartItem, "key">) {
  const key = `${item.productId}:${item.size}:${item.color}`;
  const cart = readCart();
  const existing = cart.find((cartItem) => cartItem.key === key);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, 10);
  } else {
    cart.push({ ...item, key, quantity: Math.min(item.quantity, 10) });
  }

  writeCart(cart);
}

export function clearCart() {
  writeCart([]);
}