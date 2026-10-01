import { getProductById, getProducts } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";
import ProductReviews from "@/components/ProductReviews";
import WishlistButton from "@/components/WishlistButton";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 30 }}>
        <div style={{
          background: product.images[0]
            ? `linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url("${product.images[0]}") center/cover`
            : "linear-gradient(135deg, #374151, #f97316)",
          minHeight: 420,
          borderRadius: 12,
        }} />

        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: 28 }}>
          <p style={{ color: "#fbcfe8", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{product.category}</p>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 18, color: "#fff" }}>{product.name}</h1>
          <p style={{ color: "#e2e8f0", lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "#facc15" }}>{`R ${Number(product.price).toLocaleString("en-ZA")}`}</span>
            {product.discountPrice && (
              <span style={{ color: "#cbd5e1", textDecoration: "line-through" }}>{`R ${Number(product.discountPrice).toLocaleString("en-ZA")}`}</span>
            )}
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ marginBottom: 8, fontWeight: 700, color: "#f8fafc" }}>Available sizes</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.sizes.map((size) => (
                <span key={size} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "#fff", background: "rgba(15,23,42,0.72)" }}>{size}</span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ marginBottom: 8, fontWeight: 700, color: "#f8fafc" }}>Available colors</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.colors.map((color) => (
                <span key={color} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "#fff", background: "rgba(15,23,42,0.72)" }}>{color}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <AddToCartButton product={product} />
            <WishlistButton productId={product.id} />
          </div>
          <a href="/cart" style={{ display: "inline-flex", marginTop: 12, color: "#fff", fontWeight: 700 }}>View cart</a>
        </div>
      </div>
      <ProductReviews productId={product.id} />
    </main>
  );
}
