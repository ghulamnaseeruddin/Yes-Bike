"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { ProductRecord } from "@/lib/products";

export default function AddToCartButton({ product }: { product: ProductRecord }) {
  const [size, setSize] = useState(product.sizes[0] ?? "One size");
  const [color, setColor] = useState(product.colors[0] ?? "Standard");
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice ?? product.price,
      quantity: 1,
      size,
      color,
      image: product.images[0] ?? "",
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {product.sizes.length > 0 && (
        <label style={{ display: "grid", gap: 6, color: "#e5e7eb" }}>
          <span>Size</span>
          <select value={size} onChange={(event) => setSize(event.target.value)} style={selectStyle}>
            {product.sizes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
      )}
      {product.colors.length > 0 && (
        <label style={{ display: "grid", gap: 6, color: "#e5e7eb" }}>
          <span>Color</span>
          <select value={color} onChange={(event) => setColor(event.target.value)} style={selectStyle}>
            {product.colors.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
      )}
      <button type="button" onClick={handleAdd} disabled={product.stock < 1} style={{ background: "#f97316", color: "#fff", padding: "12px 18px", border: 0, borderRadius: 10, fontWeight: 800, cursor: product.stock < 1 ? "not-allowed" : "pointer", opacity: product.stock < 1 ? 0.6 : 1 }}>
        {product.stock < 1 ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}

const selectStyle = {
  width: "100%",
  minWidth: 0,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "#0f172a",
  color: "#fff",
  fontSize: "1rem",
  outline: "none",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
} as const;
