"use client";

import { FormEvent, useEffect, useState } from "react";
import { clearCart, readCart, type CartItem } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

const shippingFee = 100;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const syncCart = () => setItems(readCart());
    syncCart();
    window.addEventListener("yesbike-cart-updated", syncCart);
    return () => window.removeEventListener("yesbike-cart-updated", syncCart);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasLiveProducts = items.length > 0 && items.every((item) => uuidPattern.test(item.productId));
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const { data, error } = await supabase.rpc("place_cod_order", {
      p_customer_name: String(formData.get("customer_name")),
      p_customer_email: String(formData.get("customer_email")),
      p_customer_phone: String(formData.get("customer_phone")),
      p_address: {
        line1: String(formData.get("line1")),
        suburb: String(formData.get("suburb")),
        city: String(formData.get("city")),
        province: String(formData.get("province")),
        postal_code: String(formData.get("postal_code")),
      },
      p_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    });

    setSubmitting(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    clearCart();
    setItems([]);
    setOrderId(String(data));
  }

  if (orderId) {
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 20px 80px" }}>
        <section style={{ background: "#fff", border: "1px solid #e1e6e0", borderRadius: 8, padding: 28 }}>
          <h1>Order received</h1>
          <p>Your cash-on-delivery order was recorded. Keep this reference for your records:</p>
          <strong>{orderId}</strong>
        </section>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 className="pageTitle" style={{ marginBottom: 28 }}>Checkout</h1>
      {items.length === 0 ? (
        <section style={{ background: "#fff", border: "1px solid #e1e6e0", borderRadius: 8, padding: 24 }}>
          <p>Your cart is empty.</p>
          <a href="/shop" style={{ color: "#b84522", fontWeight: 700 }}>Return to shop</a>
        </section>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: 24 }}>
          <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 8, padding: 24, border: "1px solid #e1e6e0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <label style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
                <span>Full name</span>
                <input name="customer_name" required autoComplete="name" style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span>Email</span>
                <input name="customer_email" type="email" required autoComplete="email" style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span>Phone</span>
                <input name="customer_phone" type="tel" required autoComplete="tel" style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
                <span>Street address</span>
                <input name="line1" required autoComplete="address-line1" style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span>Suburb</span>
                <input name="suburb" required autoComplete="address-level3" style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span>City</span>
                <input name="city" required autoComplete="address-level2" style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span>Province</span>
                <input name="province" required autoComplete="address-level1" style={inputStyle} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span>Postal code</span>
                <input name="postal_code" required autoComplete="postal-code" style={inputStyle} />
              </label>
            </div>
            <p style={{ color: "#8c650d", fontWeight: 700, margin: "20px 0 0" }}>Cash on delivery. No online payment is collected.</p>
            {message && <p role="alert" style={{ color: "#fca5a5", lineHeight: 1.5 }}>{message}</p>}
            {!hasSupabaseConfig && <p role="alert">Add the Supabase project URL and anon key to enable order placement.</p>}
            {!hasLiveProducts && <p role="alert">Demo products cannot be ordered. Load products from your Supabase database first.</p>}
            <button type="submit" disabled={submitting || !hasSupabaseConfig || !hasLiveProducts} style={{ marginTop: 20, width: "100%", border: 0, background: "#d65a32", color: "#fff", borderRadius: 6, padding: "14px 18px", fontWeight: 700, cursor: "pointer", opacity: submitting || !hasSupabaseConfig || !hasLiveProducts ? 0.55 : 1 }}>
              {submitting ? "Placing order..." : "Place cash-on-delivery order"}
            </button>
          </form>

          <aside style={{ alignSelf: "start", background: "#fff", borderRadius: 8, padding: 24, border: "1px solid #e1e6e0" }}>
            <h2 style={{ marginTop: 0 }}>Order summary</h2>
            {items.map((item) => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", gap: 16, margin: "12px 0" }}>
                <span>{item.name} × {item.quantity}</span>
                <strong>{`R ${(item.price * item.quantity).toLocaleString("en-ZA")}`}</strong>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}><span>Subtotal</span><strong>{`R ${subtotal.toLocaleString("en-ZA")}`}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}><span>Delivery</span><strong>{`R ${shippingFee.toLocaleString("en-ZA")}`}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: "1.15rem", fontWeight: 800 }}><span>Total</span><span style={{ color: "#8c650d" }}>{`R ${(subtotal + shippingFee).toLocaleString("en-ZA")}`}</span></div>
          </aside>
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  background: "#fff",
  border: "1px solid #d9ded9",
  color: "#202622",
  borderRadius: 8,
  padding: "12px 14px",
  minWidth: 0,
};
