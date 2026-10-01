import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import "./AdminProducts.css";

const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    api.get("/orders").then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (id, field, value) => {
    try {
      await api.put(`/orders/${id}/status`, { [field]: value });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, [field]: value } : o)));
      toast.success("Order updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="section-head">
        <h1>Orders</h1>
      </div>
      <div className="yb-table-wrap">
        <table className="yb-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Total</th><th>Delivery</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-8).toUpperCase()}</td>
                <td>{o.user?.name || "—"}<br /><span style={{ color: "var(--steel)", fontSize: "0.78rem" }}>{o.user?.email}</span></td>
                <td>{formatCurrency(o.totalPrice)}</td>
                <td>
                  <div className="form-control" style={{ padding: "6px 10px", fontSize: "0.85rem", background: "rgba(255,255,255,0.02)" }}>
                    {o.deliveryMethod || "Cash on Delivery"}
                  </div>
                </td>
                <td>
                  <select
                    className="form-control"
                    style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                    value={o.orderStatus}
                    onChange={(e) => updateStatus(o._id, "orderStatus", e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString("en-ZA")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
