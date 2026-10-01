import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import api from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import "./AdminProducts.css";

const CATEGORIES = ["Leather Suits", "Jackets", "Pants", "Helmets", "Gloves", "Boots", "Protective Gear", "Accessories"];

const emptyForm = {
  name: "", description: "", price: "", discountPrice: "", category: CATEGORIES[0],
  stock: "", images: [], sizes: "", colors: "", featured: false, isNew: false, isBestSeller: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    api.get("/products", { params: { limit: 100 } })
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || "",
      category: p.category, stock: p.stock,
      images: p.images || [], sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", "),
      featured: p.featured, isNew: p.isNew, isBestSeller: p.isBestSeller,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setForm((f) => ({ ...f, images: [] }));
      return;
    }

    const dataUrls = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read image file"));
            reader.readAsDataURL(file);
          })
      )
    );

    setForm((f) => ({ ...f, images: dataUrls }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      images: form.images,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Product</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="yb-table-wrap">
          <table className="yb-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="yb-table-product">
                    <img src={p.images?.[0]} alt="" />
                    <span>{p.name}</span>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatCurrency(p.discountPrice || p.price)}</td>
                  <td>{p.stock <= 0 ? <span className="badge badge-danger">0</span> : p.stock}</td>
                  <td>
                    {p.featured && <span className="badge badge-ember">Featured</span>}{" "}
                    {p.isNew && <span className="badge badge-steel">New</span>}
                  </td>
                  <td className="yb-table-actions">
                    <button className="yb-icon-btn" onClick={() => openEdit(p)}><FiEdit2 /></button>
                    <button className="yb-icon-btn" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="yb-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="card yb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="yb-modal-head">
              <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
              <button className="yb-icon-btn" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="yb-modal-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input required className="form-control" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required rows={3} className="form-control" value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input required type="number" min="0" className="form-control" value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (optional)</label>
                  <input type="number" min="0" className="form-control" value={form.discountPrice}
                    onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input required type="number" min="0" className="form-control" value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Product Images</label>
                <input type="file" accept="image/*" multiple className="form-control" onChange={handleImageChange} />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Sizes (comma-separated)</label>
                  <input className="form-control" value={form.sizes}
                    onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Colors (comma-separated)</label>
                  <input className="form-control" value={form.colors}
                    onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} />
                </div>
              </div>
              <div className="yb-checkbox-row">
                <label><input type="checkbox" checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured</label>
                <label><input type="checkbox" checked={form.isNew}
                  onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))} /> New Arrival</label>
                <label><input type="checkbox" checked={form.isBestSeller}
                  onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))} /> Best Seller</label>
              </div>
              <button className="btn btn-primary btn-block" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
