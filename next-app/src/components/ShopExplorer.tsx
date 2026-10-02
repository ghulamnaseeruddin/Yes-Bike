"use client";

import { useState } from "react";
import type { ProductRecord } from "@/lib/products";

const relatedTerms: Record<string, string[]> = {
  rain: ["rainwear", "waterproof", "storm", "wet", "weather"],
  touring: ["touring", "luggage", "long distance", "comfort"],
  track: ["race", "racing", "track", "sport", "leather suit"],
  offroad: ["enduro", "adventure", "trail", "armor", "boots"],
  winter: ["thermal", "winter", "warm", "waterproof"],
  commute: ["urban", "commuter", "city", "visibility", "rain"],
  protection: ["armor", "impact", "protective", "shield", "reinforced"],
};

function rankProduct(product: ProductRecord, query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const haystack = `${product.name} ${product.category} ${product.description} ${product.colors.join(" ")}`.toLowerCase();
  let score = words.reduce((total, word) => total + (haystack.includes(word) ? 3 : 0), 0);
  for (const word of words) {
    for (const [intent, matches] of Object.entries(relatedTerms)) {
      if ((word === intent || matches.some((match) => match.includes(word) || word.includes(match))) && matches.some((match) => haystack.includes(match))) score += 2;
    }
  }
  return score;
}

export default function ShopExplorer({ products, categories, initialCategory = "", initialQuery = "" }: { products: ProductRecord[]; categories: string[]; initialCategory?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("relevance");

  const results = products
    .filter((product) => !category || product.category === category)
    .map((product) => ({ product, score: rankProduct(product, query) }))
    .filter(({ score }) => !query || score > 0)
    .sort((first, second) => {
      if (sort === "price-low") return first.product.price - second.product.price;
      if (sort === "price-high") return second.product.price - first.product.price;
      if (sort === "name") return first.product.name.localeCompare(second.product.name);
      return second.score - first.score || Number(second.product.featured) - Number(first.product.featured);
    });

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) minmax(150px,.35fr) minmax(150px,.35fr)", gap: 10, margin: "24px 0" }}>
        <label style={labelStyle}>Search riding gear<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘rain touring’ or ‘track protection’" style={inputStyle} /></label>
        <label style={labelStyle}>Category<select value={category} onChange={(event) => setCategory(event.target.value)} style={inputStyle}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label style={labelStyle}>Sort<select value={sort} onChange={(event) => setSort(event.target.value)} style={inputStyle}><option value="relevance">Best match</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label>
      </div>
      <p aria-live="polite" style={{ color: "#aab2bd" }}>{results.length} products</p>
      {results.length === 0 ? <p>No gear matched those filters.</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
        {results.map(({ product }) => <article key={product.id} style={{ background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, overflow: "hidden" }}>
          <a href={`/products/${product.id}`} aria-label={`View ${product.name}`} style={{ display: "block", height: 210, background: product.images[0] ? `linear-gradient(0deg,rgba(0,0,0,.12),transparent),url("${product.images[0]}") center/cover` : "#29313c" }} />
          <div style={{ padding: 16 }}><small style={{ color: "#f97316" }}>{product.category}</small><h2 style={{ fontSize: 18, minHeight: 44 }}>{product.name}</h2><p style={{ color: "#cbd5e1", lineHeight: 1.55 }}>{product.description}</p><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><strong style={{ color: "#facc15" }}>{`R ${(product.discountPrice ?? product.price).toLocaleString("en-ZA")}`}</strong><a href={`/products/${product.id}`} style={{ color: "#fff" }}>View</a></div></div>
        </article>)}
      </div>}
    </>
  );
}

const labelStyle = { display: "grid", gap: 6, color: "#cbd5e1", fontSize: 14 };
const inputStyle = { width: "100%", minWidth: 0, padding: 11, color: "#fff", background: "#111827", border: "1px solid rgba(255,255,255,.2)", borderRadius: 6 };
