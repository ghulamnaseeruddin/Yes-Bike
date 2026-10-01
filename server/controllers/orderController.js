import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const SHIPPING_FLAT_RATE = 100; // flat-rate shipping, in project currency units
const FREE_SHIPPING_THRESHOLD = 1500;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(400, "No order items provided");
  }
  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required");
  }

  // Re-price items server-side from the DB, never trust client prices
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) throw new ApiError(404, `Product not found: ${item.product}`);
    if (product.stock < item.quantity) {
      throw new ApiError(400, `${product.name} is out of stock or has insufficient quantity`);
    }
    const price = product.discountPrice || product.price;
    subtotal += price * item.quantity;
    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    });

    product.stock -= item.quantity;
    await product.save();
  }

  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const totalPrice = subtotal + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems: verifiedItems,
    shippingAddress,
    deliveryMethod: "Cash on Delivery",
    subtotal,
    shippingPrice,
    totalPrice,
  });

  res.status(201).json({ success: true, data: order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// @desc    Get single order by id (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner =
    order.user && order.user._id
      ? order.user._id.toString() === req.user._id.toString()
      : false;
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view this order");
  }

  res.json({ success: true, data: order });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (req.body.orderStatus) order.orderStatus = req.body.orderStatus;
  if (req.body.deliveryMethod) order.deliveryMethod = req.body.deliveryMethod;

  const updated = await order.save();
  res.json({ success: true, data: updated });
});
