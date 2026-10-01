"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string; name: string; description: string | null; price: number | string; discount_price: number | string | null;
  category: string | null; stock: number; featured: boolean; is_new: boolean; is_best_seller: boolean;
  images: string[]; sizes: string[]; colors: string[];
};
type Order = { id: string; customer_name: string; customer_email: string; customer_phone: string; order_status: string; total_price: number | string; created_at: string };
type UserProfile = { id: string; email: string; full_name: string | null; role: "customer" | "admin" };
type ContactMessage = { id: string; name: string; email: string; phone: string | null; subject: string; message: string; status: "New" | "In progress" | "Resolved"; created_at: string };
type ProductDraft = { name: string; description: string; price: string; discountPrice: string; category: string; stock: string; image: string; sizes: string; colors: string; featured: boolean };

const emptyDraft: ProductDraft = { name: "", description: "", price: "", discountPrice: "", category: "", stock: "0", image: "", sizes: "", colors: "", featured: false };
const statuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const inputStyle = {
  width: "100%",
  minWidth: 0,
  padding: "11px 12px",
  color: "#fff",
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 10,
  fontSize: "1rem",
  outline: "none",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
};
const panelStyle = { background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 20 };

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setMessage(authError?.message ?? "Sign in with an administrator account to continue.");
        setAuthorized(false);
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profileError || profile?.role !== "admin") {
        setMessage(profileError?.message ?? "This account does not have administrator access.");
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);

      const [productResult, orderResult, userResult, contactResult] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("id,customer_name,customer_email,customer_phone,order_status,total_price,created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id,email,full_name,role").order("created_at", { ascending: false }),
        supabase.from("contacts").select("id,name,email,phone,subject,message,status,created_at").order("created_at", { ascending: false }),
      ]);
      const error = productResult.error ?? orderResult.error ?? userResult.error ?? contactResult.error;
      if (error) setMessage(error.message);
      setProducts((productResult.data ?? []) as Product[]);
      setOrders((orderResult.data ?? []) as Order[]);
      setUsers((userResult.data ?? []) as UserProfile[]);
      setContacts((contactResult.data ?? []) as ContactMessage[]);
      setLoading(false);
    }
    void loadDashboard();
  }, []);

  function beginEdit(product: Product) {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      discountPrice: product.discount_price == null ? "" : String(product.discount_price),
      category: product.category ?? "",
      stock: String(product.stock),
      image: product.images?.[0] ?? "",
      sizes: (product.sizes ?? []).join(", "),
      colors: (product.colors ?? []).join(", "),
      featured: product.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const price = Number(draft.price);
    const stock = Number(draft.stock);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      setMessage("Enter a valid price and whole-number stock quantity.");
      setSaving(false);
      return;
    }
    const row = {
      ...(editingId ? { id: editingId } : {}),
      name: draft.name.trim(),
      description: draft.description.trim(),
      price,
      discount_price: draft.discountPrice ? Number(draft.discountPrice) : null,
      category: draft.category.trim(),
      stock,
      featured: draft.featured,
      images: draft.image.trim() ? [draft.image.trim()] : [],
      sizes: draft.sizes.split(",").map((value) => value.trim()).filter(Boolean),
      colors: draft.colors.split(",").map((value) => value.trim()).filter(Boolean),
    };
    const { data, error } = await supabase.from("products").upsert(row).select("*").single();
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProducts((current) => [data as Product, ...current.filter((product) => product.id !== data.id)]);
    setDraft(emptyDraft);
    setEditingId("");
    setMessage("Product saved.");
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}? Products referenced by orders cannot be deleted.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProducts((current) => current.filter((row) => row.id !== product.id));
    setMessage("Product deleted.");
  }

  async function changeOrderStatus(orderId: string, orderStatus: string) {
    const { error } = await supabase.from("orders").update({ order_status: orderStatus }).eq("id", orderId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, order_status: orderStatus } : order));
  }

  async function changeUserRole(userId: string, role: UserProfile["role"]) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setUsers((current) => current.map((profile) => profile.id === userId ? { ...profile, role } : profile));
    setMessage("User role updated.");
  }

  async function changeContactStatus(contactId: string, status: ContactMessage["status"]) {
    const { error } = await supabase.from("contacts").update({ status }).eq("id", contactId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setContacts((current) => current.map((contact) => contact.id === contactId ? { ...contact, status } : contact));
  }
  const codOrderValue = orders
    .filter((order) => order.order_status !== "Cancelled")
    .reduce((total, order) => total + Number(order.total_price), 0);

  if (loading) return <main style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}><p>Loading admin workspace...</p></main>;
  if (!authorized) return <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}><section style={panelStyle}><h1>Admin access</h1><p>{message}</p><a href="/auth" style={{ color: "#f97316" }}>Sign in</a></section></main>;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 80px", display: "grid", gap: 28 }}>
      <header><p style={{ color: "#f97316", textTransform: "uppercase", fontWeight: 700 }}>YES BIKE</p><h1 style={{ margin: 0 }}>Admin workspace</h1></header>
      {message && <p role="status">{message}</p>}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
        {[["Products", products.length], ["Orders", orders.length], ["Customers", users.filter((user) => user.role === "customer").length], ["COD order value", `R ${codOrderValue.toLocaleString("en-ZA")}`]].map(([label, value]) => <article key={String(label)} style={panelStyle}><span style={{ color: "#aab2bd" }}>{label}</span><strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>{value}</strong></article>)}
      </section>

      <section style={{ ...panelStyle, maxWidth: 760 }}>
        <h2 style={{ color: "#fff" }}>{editingId ? "Edit product" : "Add product"}</h2>
        <form onSubmit={saveProduct} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <input required placeholder="Product name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} style={inputStyle} />
          <input required placeholder="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} style={inputStyle} />
          <input required type="number" min="0" step="0.01" placeholder="Price (ZAR)" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} style={inputStyle} />
          <input type="number" min="0" step="0.01" placeholder="Discount price" value={draft.discountPrice} onChange={(event) => setDraft({ ...draft, discountPrice: event.target.value })} style={inputStyle} />
          <input required type="number" min="0" step="1" placeholder="Stock" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} style={inputStyle} />
          <input placeholder="Image URL" value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} style={inputStyle} />
          <input placeholder="Sizes, comma separated" value={draft.sizes} onChange={(event) => setDraft({ ...draft, sizes: event.target.value })} style={inputStyle} />
          <input placeholder="Colors, comma separated" value={draft.colors} onChange={(event) => setDraft({ ...draft, colors: event.target.value })} style={inputStyle} />
          <textarea placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} style={{ ...inputStyle, gridColumn: "1 / -1", minHeight: 90, resize: "vertical" }} />
          <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#e5e7eb" }}><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
          <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1" }}>
            <button disabled={saving} style={{ padding: "10px 16px", background: "#f97316", color: "#fff", border: 0, borderRadius: 6, fontWeight: 700 }}>{saving ? "Saving..." : editingId ? "Save changes" : "Create product"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(""); setDraft(emptyDraft); }} style={{ padding: "10px 16px", background: "#1f2937", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, cursor: "pointer" }}>Cancel edit</button>}
          </div>
        </form>
      </section>

      <section style={panelStyle}>
        <h2 style={{ color: "#fff" }}>Products</h2>
        <div style={{ overflowX: "auto" }}><table style={tableStyle}><thead><tr><th style={{ color: "#e5e7eb" }}>Name</th><th style={{ color: "#e5e7eb" }}>Category</th><th style={{ color: "#e5e7eb" }}>Price</th><th style={{ color: "#e5e7eb" }}>Stock</th><th style={{ color: "#e5e7eb" }}>Actions</th></tr></thead><tbody>
          {products.map((product) => <tr key={product.id}><td style={{ color: "#f8fafc" }}>{product.name}</td><td style={{ color: "#cbd5e1" }}>{product.category}</td><td style={{ color: "#f8fafc" }}>{`R ${Number(product.price).toLocaleString("en-ZA")}`}</td><td style={{ color: "#cbd5e1" }}>{product.stock}</td><td><button type="button" onClick={() => beginEdit(product)} style={{ background: "#1f2937", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}>Edit</button> <button type="button" onClick={() => void deleteProduct(product)} style={{ background: "#0f172a", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}>Delete</button></td></tr>)}
        </tbody></table></div>
      </section>

      <section style={panelStyle}>
        <h2 style={{ color: "#fff" }}>Orders</h2>
        <div style={{ overflowX: "auto" }}><table style={tableStyle}><thead><tr><th style={{ color: "#e5e7eb" }}>Order</th><th style={{ color: "#e5e7eb" }}>Customer</th><th style={{ color: "#e5e7eb" }}>Contact</th><th style={{ color: "#e5e7eb" }}>Total</th><th style={{ color: "#e5e7eb" }}>Status</th></tr></thead><tbody>
          {orders.map((order) => <tr key={order.id}><td style={{ color: "#f8fafc" }}>{order.id.slice(0, 8).toUpperCase()}<br /><small style={{ color: "#cbd5e1" }}>{new Date(order.created_at).toLocaleDateString()}</small></td><td style={{ color: "#f8fafc" }}>{order.customer_name}</td><td style={{ color: "#cbd5e1" }}>{order.customer_email}<br />{order.customer_phone}</td><td style={{ color: "#f8fafc" }}>{`R ${Number(order.total_price).toLocaleString("en-ZA")}`}</td><td><select value={order.order_status} onChange={(event) => void changeOrderStatus(order.id, event.target.value)} style={{ background: "#0f172a", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "8px 10px" }}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}
        </tbody></table></div>
      </section>

      <section style={panelStyle}>
        <h2 style={{ color: "#fff" }}>Accounts and roles</h2>
        <div style={{ overflowX: "auto" }}><table style={tableStyle}><thead><tr><th style={{ color: "#e5e7eb" }}>Name</th><th style={{ color: "#e5e7eb" }}>Email</th><th style={{ color: "#e5e7eb" }}>Role</th></tr></thead><tbody>
          {users.map((profile) => <tr key={profile.id}><td style={{ color: "#f8fafc" }}>{profile.full_name || "—"}</td><td style={{ color: "#cbd5e1" }}>{profile.email}</td><td><select value={profile.role} onChange={(event) => void changeUserRole(profile.id, event.target.value as UserProfile["role"])} style={{ background: "#0f172a", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "8px 10px" }}><option value="customer">Customer</option><option value="admin">Admin</option></select></td></tr>)}
        </tbody></table></div>
      </section>

      <section style={panelStyle}>
        <h2 style={{ color: "#fff" }}>Contact inbox</h2>
        <div style={{ overflowX: "auto" }}><table style={tableStyle}><thead><tr><th style={{ color: "#e5e7eb" }}>Received</th><th style={{ color: "#e5e7eb" }}>Customer</th><th style={{ color: "#e5e7eb" }}>Subject and message</th><th style={{ color: "#e5e7eb" }}>Status</th></tr></thead><tbody>
          {contacts.map((contact) => <tr key={contact.id}><td style={{ color: "#cbd5e1" }}>{new Date(contact.created_at).toLocaleDateString()}</td><td style={{ color: "#cbd5e1" }}>{contact.name}<br /><a href={`mailto:${contact.email}`} style={{ color: "#f9a8d4" }}>{contact.email}</a>{contact.phone && <><br />{contact.phone}</>}</td><td><strong style={{ color: "#fff" }}>{contact.subject}</strong><br /><span style={{ whiteSpace: "pre-wrap", color: "#cbd5e1" }}>{contact.message}</span></td><td><select value={contact.status} onChange={(event) => void changeContactStatus(contact.id, event.target.value as ContactMessage["status"])} style={{ background: "#0f172a", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "8px 10px" }}><option>New</option><option>In progress</option><option>Resolved</option></select></td></tr>)}
          {contacts.length === 0 && <tr><td colSpan={4} style={{ color: "#cbd5e1" }}>No messages yet.</td></tr>}
        </tbody></table></div>
      </section>
    </main>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse" as const, textAlign: "left" as const, minWidth: 600 };
