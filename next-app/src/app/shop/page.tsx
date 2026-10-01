import { getProducts } from "@/lib/products";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "#f97316", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 700, marginBottom: 10 }}>Shop</p>
        <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", margin: 0 }}>Ride-ready gear</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 22 }}>
        {products.map((product) => (
          <article key={product.id} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 22, overflow: "hidden" }}>
            <div style={{
              height: 220,
              background: product.images[0]
                ? `linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url("${product.images[0]}") center/cover`
                : "linear-gradient(135deg, #374151, #f97316)",
            }} />
            <div style={{ padding: 18 }}>
              <p style={{ color: "#fbcfe8", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{product.category}</p>
              <h2 style={{ fontSize: "1.2rem", marginBottom: 12 }}>{product.name}</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 16 }}>{product.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ color: "#facc15", fontWeight: 800 }}>{`R ${Number(product.price).toLocaleString("en-ZA")}`}</span>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{product.stock} in stock</span>
              </div>
              <a href={`/products/${product.id}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", background: "#f97316", color: "#fff", borderRadius: 12, padding: "10px 16px", fontWeight: 700, textDecoration: "none" }}>
                View product
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
