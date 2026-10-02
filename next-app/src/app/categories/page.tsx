import { getProducts } from "@/lib/products";

export default async function CategoriesPage() {
  const products = await getProducts();
  const categories = [...new Set(products.map((product) => product.category))].sort();

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 20px 80px" }}>
      <p style={{ color: "#d65a32", fontWeight: 700, textTransform: "uppercase" }}>Browse by ride</p>
      <h1>Gear categories</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 28 }}>
        {categories.map((category) => {
          const matching = products.filter((product) => product.category === category);
          const image = matching[0]?.images[0];
          return (
            <a key={category} href={`/shop?category=${encodeURIComponent(category)}`} style={{ minHeight: 180, display: "flex", alignItems: "end", padding: 20, color: image ? "#fff" : "#202622", textDecoration: "none", borderRadius: 8, overflow: "hidden", background: image ? `linear-gradient(0deg,rgba(0,0,0,.68),rgba(0,0,0,.04)),url("${image}") center/cover` : "#e7ece6" }}>
              <span><strong style={{ display: "block", fontSize: 22 }}>{category}</strong><small>{matching.length} products</small></span>
            </a>
          );
        })}
      </div>
    </main>
  );
}
