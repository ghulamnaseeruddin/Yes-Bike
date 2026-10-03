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
      <div className="stackTablet" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 30 }}>
        <div style={{
          background: product.images[0]
            ? `linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url("${product.images[0]}") center/cover`
            : "linear-gradient(135deg, #dfe5de, #f4f6f3)",
          minHeight: 420,
          borderRadius: 12,
        }} />

        <div style={{ background: "#fff", border: "1px solid #e1e6e0", borderRadius: 8, padding: 28 }}>
          <p style={{ color: "#68716b", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{product.category}</p>
          <h1 className="productTitle" style={{ marginBottom: 18 }}>{product.name}</h1>
          <p style={{ color: "#59645c", lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "#8c650d" }}>{`R ${Number(product.discountPrice ?? product.price).toLocaleString("en-ZA")}`}</span>
            {product.discountPrice && (
              <span style={{ color: "#89938b", textDecoration: "line-through" }}>{`R ${Number(product.price).toLocaleString("en-ZA")}`}</span>
            )}
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ marginBottom: 8, fontWeight: 700 }}>Available sizes</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.sizes.map((size) => (
                <span key={size} style={{ padding: "7px 10px", borderRadius: 5, border: "1px solid #d9ded9", color: "#39433c" }}>{size}</span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={{ marginBottom: 8, fontWeight: 700 }}>Available colors</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.colors.map((color) => (
                <span key={color} style={{ padding: "7px 10px", borderRadius: 5, border: "1px solid #d9ded9", color: "#39433c" }}>{color}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AddToCartButton product={product} />
            <WishlistButton productId={product.id} />
          </div>
          <a href="/cart" style={{ display: "inline-flex", marginTop: 12, color: "#b84522", fontWeight: 700 }}>View cart</a>
        </div>
      </div>
      <ProductReviews productId={product.id} />
    </main>
  );
}
