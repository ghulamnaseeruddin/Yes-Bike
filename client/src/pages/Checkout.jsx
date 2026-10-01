import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { formatCurrency } from "../utils/formatCurrency.js";
import { placeOrder, clearLastOrder } from "../redux/slices/orderSlice.js";
import { clearCart } from "../redux/slices/cartSlice.js";
import useAuth from "../hooks/useAuth.js";
import "./Checkout.css";

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FLAT_RATE = 100;

const Checkout = () => {
  const { user } = useAuth();
  const items = useSelector((state) => state.cart.items);
  const { loading, error, lastOrder } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    country: "South Africa",
    postalCode: "",
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  useEffect(() => {
    if (items.length === 0 && !lastOrder) navigate("/shop");
  }, [items.length, lastOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (lastOrder) {
      dispatch(clearCart());
      dispatch(clearLastOrder());
      navigate(`/order-success/${lastOrder._id}`);
    }
  }, [lastOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      placeOrder({
        orderItems: items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
        shippingAddress: form,
        deliveryMethod: "Cash on Delivery",
      })
    );
  };

  return (
    <div className="container yb-checkout">
      <h1>Checkout</h1>
      <div className="yb-checkout-layout">
        <form className="card yb-checkout-form" onSubmit={handleSubmit}>
          <h3>Customer Details</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required className="form-control" value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required className="form-control" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input required className="form-control" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>

          <h3>Shipping Address</h3>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input required className="form-control" value={form.street}
              onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input required className="form-control" value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">State / Province</label>
              <input required className="form-control" value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Country</label>
              <input required className="form-control" value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input required className="form-control" value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
            </div>
          </div>

          <h3>Delivery Method</h3>
          <div className="yb-payment-option">
            <input type="radio" checked readOnly />
            <div>
              <strong>Cash on Delivery</strong>
              <p>Pay in cash when your order arrives. No online payment is required.</p>
            </div>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Placing Order..." : `Place Order · ${formatCurrency(total)}`}
          </button>
        </form>

        <div className="card yb-checkout-summary">
          <h3>Order Summary</h3>
          {items.map((i) => (
            <div key={`${i.product}_${i.size}_${i.color}`} className="yb-checkout-line">
              <span>{i.name} x{i.quantity}</span>
              <span>{formatCurrency(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="yb-summary-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="yb-summary-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span></div>
          <div className="yb-summary-row yb-summary-total"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
