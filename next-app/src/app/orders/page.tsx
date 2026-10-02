"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  order_status: string;
  delivery_method: string;
  subtotal: number | string;
  shipping_price: number | string;
  total_price: number | string;
  created_at: string;
};

type OrderItem = { order_id: string; product_name: string; quantity: number; unit_price: number | string; size: string | null; color: string | null };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setMessage(authError?.message ?? "Sign in to view your orders.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id,order_status,delivery_method,subtotal,shipping_price,total_price,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as Order[];
      setOrders(rows);
      if (rows.length) {
        const { data: orderItems, error: itemError } = await supabase
          .from("order_items")
          .select("order_id,product_name,quantity,unit_price,size,color")
          .in("order_id", rows.map((order) => order.id));
        if (itemError) setMessage(itemError.message);
        else {
          const grouped: Record<string, OrderItem[]> = {};
          for (const item of (orderItems ?? []) as OrderItem[]) {
            grouped[item.order_id] = [...(grouped[item.order_id] ?? []), item];
          }
          setItemsByOrder(grouped);
        }
      }
      setLoading(false);
    }
    void loadOrders();
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px 80px" }}>
      <h1>Your orders</h1>
      {loading ? <p>Loading orders...</p> : message ? (
        <section style={panelStyle}><p>{message}</p><a href="/login" style={{ color: "#f97316" }}>Sign in</a></section>
      ) : orders.length === 0 ? (
        <section style={panelStyle}><p>No orders yet.</p><a href="/shop" style={{ color: "#f97316" }}>Browse the shop</a></section>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {orders.map((order) => (
            <article key={order.id} style={panelStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, flexWrap: "wrap" }}>
                <div><h2 style={{ margin: 0 }}>Order {order.id.slice(0, 8).toUpperCase()}</h2><p style={{ color: "#aab2bd" }}>{new Date(order.created_at).toLocaleString()}</p></div>
                <strong>{order.order_status}</strong>
              </div>
              <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
                {(itemsByOrder[order.id] ?? []).map((item, index) => (
                  <li key={`${order.id}-${index}`}>{item.product_name} × {item.quantity}{item.size ? ` · ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}</li>
                ))}
              </ul>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 14 }}>
                <span>{order.delivery_method}</span>
                <strong>{`R ${Number(order.total_price).toLocaleString("en-ZA")}`}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

const panelStyle = { background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 22 };
