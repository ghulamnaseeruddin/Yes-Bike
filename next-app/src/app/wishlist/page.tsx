import { redirect } from "next/navigation";
import WishlistButton from "@/components/WishlistButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function WishlistPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: saved, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);
  if (error) return <main style={pageStyle}><h1>Wishlist</h1><p role="alert">{error.message}</p></main>;

  const ids = (saved ?? []).map((item) => item.product_id);
  const { data: products, error: productError } = ids.length
    ? await supabase.from("products").select("id,name,category,price,discount_price,images").in("id", ids)
    : { data: [], error: null };

  return (
    <main style={pageStyle}>
      <p style={{ color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>Saved gear</p>
      <h1 style={{ color: "#fff" }}>Your wishlist</h1>
      {productError ? <p role="alert" style={{ color: "#e5e7eb" }}>{productError.message}</p> : products?.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
          {products.map((product) => {
            const images = Array.isArray(product.images) ? product.images : [];
            const image = images[0];
            return <article key={product.id} style={panelStyle}>
              <a href={`/products/${product.id}`} aria-label={`View ${product.name}`} style={{ display: "block", height: 190, background: image ? `url("${image}") center/cover` : "#252b35", borderRadius: 6 }} />
              <small style={{ display: "block", marginTop: 14, color: "#f97316" }}>{product.category}</small>
              <h2 style={{ fontSize: 18, color: "#fff" }}>{product.name}</h2>
              <strong style={{ color: "#facc15" }}>{`R ${Number(product.discount_price ?? product.price).toLocaleString("en-ZA")}`}</strong>
              <div style={{ marginTop: 12 }}><WishlistButton productId={product.id} initialSaved /></div>
            </article>;
          })}
        </div>
      ) : <section style={panelStyle}><p style={{ color: "#e5e7eb" }}>No saved products yet.</p><a href="/shop" style={{ color: "#f97316" }}>Browse the shop</a></section>}
    </main>
  );
}

const pageStyle = { maxWidth: 1180, margin: "0 auto", padding: "44px 20px 80px" };
const panelStyle = { background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 20, overflow: "hidden", color: "#e5e7eb" };
