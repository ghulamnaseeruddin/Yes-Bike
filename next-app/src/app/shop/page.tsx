import { getProducts } from "@/lib/products";
import ShopExplorer from "@/components/ShopExplorer";
import GearAdvisor from "@/components/GearAdvisor";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const [{ category = "", q = "" }, products] = await Promise.all([searchParams, getProducts()]);
  const categories = [...new Set(products.map((product) => product.category))].sort();

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "#d65a32", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 10 }}>Shop</p>
        <h1 className="productTitle" style={{ margin: 0 }}>Ride-ready gear</h1>
      </div>

      <GearAdvisor products={products} />
      <ShopExplorer products={products} categories={categories} initialCategory={category} initialQuery={q} />
    </main>
  );
}
