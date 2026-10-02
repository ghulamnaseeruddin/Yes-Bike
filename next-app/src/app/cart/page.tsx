"use client";

import { useEffect, useState } from "react";
import { readCart, writeCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setItems(readCart());
    syncCart();
    window.addEventListener("yesbike-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("yesbike-cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateQuantity(key: string, quantity: number) {
    const updated = items
      .map((item) => item.key === key ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0);
    writeCart(updated);
    setItems(updated);
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 className="pageTitle" style={{ marginBottom: 28 }}>Your cart</h1>

      {items.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 8, padding: 28, border: "1px solid #e1e6e0" }}>
          <p style={{ margin: 0, color: "#59645c" }}>Your cart is empty. Add a few riding essentials from the shop.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 24 }}>
          <div style={{ display: "grid", gap: 16 }}>
            {items.map((item) => (
              <div key={item.key} style={{ background: "#fff", borderRadius: 8, border: "1px solid #e1e6e0", padding: 18, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <p style={{ margin: "8px 0 0", color: "#68716b" }}>{item.size} · {item.color}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label={`Remove one ${item.name}`} style={{ width: 32, height: 32 }}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label={`Add one ${item.name}`} disabled={item.quantity >= 10} style={{ width: 32, height: 32 }}>+</button>
                    <button type="button" onClick={() => updateQuantity(item.key, 0)} style={{ marginLeft: 8 }}>Remove</button>
                  </div>
                </div>
                <strong style={{ color: "#8c650d" }}>{`R ${(item.price * item.quantity).toLocaleString("en-ZA")}`}</strong>
              </div>
            ))}
          </div>

          <aside style={{ background: "#fff", borderRadius: 8, padding: 24, border: "1px solid #e1e6e0" }}>
            <h3 style={{ marginTop: 0 }}>Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0" }}>
              <span>Subtotal</span>
              <strong>{`R ${subtotal.toLocaleString("en-ZA")}`}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0" }}>
              <span>Delivery</span>
              <strong>R 100</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0 20px", fontSize: "1.2rem", fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: "#8c650d" }}>{`R ${(subtotal + 100).toLocaleString("en-ZA")}`}</span>
            </div>

            <a href="/checkout" style={{ display: "inline-flex", width: "100%", justifyContent: "center", background: "#d65a32", color: "#fff", padding: "12px 16px", borderRadius: 6, fontWeight: 700, textDecoration: "none" }}>Proceed to checkout</a>
          </aside>
        </div>
      )}
    </main>
  );
}
