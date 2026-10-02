"use client";

import { FormEvent, useState } from "react";
import type { ProductRecord } from "@/lib/products";

type AdvisorResult = { answer: string; productIds: string[] };

export default function GearAdvisor({ products }: { products: ProductRecord[] }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function askAdvisor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Advisor unavailable.");
      setResult(data as AdvisorResult);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Advisor unavailable. Use the shop search below.");
    } finally {
      setBusy(false);
    }
  }

  const recommendations = result?.productIds.map((id) => products.find((product) => product.id === id)).filter((product): product is ProductRecord => Boolean(product)) ?? [];

  return (
    <section style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "end", gap: 18, padding: 22, background: "#fff", border: "1px solid #e1e6e0", borderRadius: 8, marginTop: 24 }}>
      <div><p style={{ color: "#d65a32", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Gear advisor</p><h2 style={{ margin: "8px 0" }}>Find gear for your ride</h2><form onSubmit={askAdvisor} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><input value={question} onChange={(event) => setQuestion(event.target.value)} minLength={3} maxLength={500} required placeholder="Tell us about your ride, weather, or fit needs" style={{ flex: "1 1 280px", minWidth: 0, padding: 12, background: "#fff", color: "#202622", border: "1px solid #d9ded9", borderRadius: 6 }} /><button disabled={busy} style={{ padding: "11px 16px", background: "#d65a32", color: "#fff", border: 0, borderRadius: 6, fontWeight: 700 }}>{busy ? "Thinking..." : "Get suggestions"}</button></form></div>
      <a href="/shop" style={{ color: "#59645c" }}>Browse all gear</a>
      {(message || result) && <div aria-live="polite" style={{ gridColumn: "1 / -1", borderTop: "1px solid #e1e6e0", paddingTop: 14 }}>
        {message && <p style={{ margin: 0, color: "#59645c" }}>{message}</p>}
        {result && <><p style={{ marginTop: 0, lineHeight: 1.65 }}>{result.answer}</p><div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{recommendations.map((product) => <a key={product.id} href={`/products/${product.id}`} style={{ color: "#8c650d" }}>{product.name}</a>)}</div></>}
      </div>}
    </section>
  );
}
