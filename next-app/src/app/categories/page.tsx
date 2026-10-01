import { getProducts } from "@/lib/products";

export default async function CategoriesPage() {
  const products = await getProducts();
  const categories = [...new Set(products.map((product) => product.category))].sort();

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 20px 80px" }}>
      <p style={{ color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>Browse by ride</p>
      <h1 style={{ color: "#fff" }}>Gear categories</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 28 }}>
        {categories.map((category) => {
          const matching = products.filter((product) => product.category === category);
          const image = matching[0]?.images[0];
          return (
            <a key={category} href={`/shop?category=${encodeURIComponent(category)}`} style={{ minHeight: 180, display: "flex", alignItems: "end", padding: 20, color: "#fff", textDecoration: "none", borderRadius: 10, overflow: "hidden", background: image ? `linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,.06)),url("${image}") center/cover` : "#222" }}>
              <span><strong style={{ display: "block", fontSize: 22, color: "#fff" }}>{category}</strong><small style={{ color: "#e2e8f0" }}>{matching.length} products</small></span>
            </a>
          );
        })}
      </div>
    </main>
  );
}
