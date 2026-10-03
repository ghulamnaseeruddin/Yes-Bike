import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type NotificationRequest = { type?: unknown; id?: unknown };
type ContactRow = { id: string; name: string; email: string; phone: string | null; subject: string; message: string; created_at: string; admin_notified_at: string | null };
type OrderRow = { id: string; customer_name: string; customer_email: string; customer_phone: string; order_status: string; delivery_method: string; subtotal: number; shipping_price: number; total_price: number; shipping_address: Record<string, unknown>; created_at: string; admin_notified_at: string | null };
type OrderItemRow = { product_name: string; quantity: number; unit_price: number; size: string | null; color: string | null };

const requestWindows = new Map<string, { count: number; expiresAt: number }>();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRateLimited(ip: string) {
  const now = Date.now();
  const window = requestWindows.get(ip);
  if (!window || window.expiresAt <= now) {
    requestWindows.set(ip, { count: 1, expiresAt: now + 60_000 });
    return false;
  }
  window.count += 1;
  return window.count > 8;
}

export async function POST(request: Request) {
  let body: NotificationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid notification request." }, { status: 400 });
  }

  const type = body.type;
  const id = typeof body.id === "string" ? body.id : "";
  if ((type !== "contact" && type !== "order") || !uuidPattern.test(id)) {
    return NextResponse.json({ error: "Invalid notification request." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many notifications. Try again shortly." }, { status: 429 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || "mabdulaziz13@icloud.com";

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !from) {
    return NextResponse.json({ error: "Admin email notifications are not configured." }, { status: 503 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let subject = "";
  let text = "";
  let replyTo: string | undefined;
  const table: "contacts" | "orders" = type === "contact" ? "contacts" : "orders";

  if (type === "contact") {
    const { data, error } = await adminClient
      .from("contacts")
      .select("id,name,email,phone,subject,message,created_at,admin_notified_at")
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Could not load the saved contact message." }, { status: 502 });
    if (!data) return NextResponse.json({ error: "Contact message not found." }, { status: 404 });

    const contact = data as ContactRow;
    if (contact.admin_notified_at) return NextResponse.json({ sent: true, alreadySent: true });
    subject = `YES BIKE contact: ${contact.subject}`;
    replyTo = contact.email;
    text = [
      "New YES BIKE contact message",
      "",
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone || "Not provided"}`,
      `Subject: ${contact.subject}`,
      `Received: ${contact.created_at}`,
      "",
      contact.message,
    ].join("\n");
  } else {
    const { data, error } = await adminClient
      .from("orders")
      .select("id,customer_name,customer_email,customer_phone,order_status,delivery_method,subtotal,shipping_price,total_price,shipping_address,created_at,admin_notified_at")
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Could not load the saved order." }, { status: 502 });
    if (!data) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const order = data as OrderRow;
    if (order.admin_notified_at) return NextResponse.json({ sent: true, alreadySent: true });
    const { data: items, error: itemsError } = await adminClient
      .from("order_items")
      .select("product_name,quantity,unit_price,size,color")
      .eq("order_id", id);
    if (itemsError) return NextResponse.json({ error: "Could not load order items." }, { status: 502 });

    subject = `YES BIKE COD order ${order.id.slice(0, 8).toUpperCase()}`;
    replyTo = order.customer_email;
    text = [
      "New YES BIKE cash-on-delivery order",
      "",
      `Order: ${order.id}`,
      `Status: ${order.order_status}`,
      `Customer: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      `Phone: ${order.customer_phone}`,
      `Delivery method: ${order.delivery_method}`,
      `Address: ${JSON.stringify(order.shipping_address)}`,
      "",
      "Items:",
      ...((items ?? []) as OrderItemRow[]).map((item) => `- ${item.product_name} x${item.quantity}${item.size ? `, size ${item.size}` : ""}${item.color ? `, color ${item.color}` : ""} — R ${Number(item.unit_price).toFixed(2)} each`),
      "",
      `Subtotal: R ${Number(order.subtotal).toFixed(2)}`,
      `Delivery: R ${Number(order.shipping_price).toFixed(2)}`,
      `Total: R ${Number(order.total_price).toFixed(2)}`,
      `Placed: ${order.created_at}`,
    ].join("\n");
  }

  let emailResponse: Response;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `yesbike-${type}-${id}`,
      },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text }),
    });
  } catch {
    return NextResponse.json({ error: "The record was saved, but the email provider could not be reached." }, { status: 502 });
  }

  if (!emailResponse.ok) {
    return NextResponse.json({ error: "The record was saved, but the email provider rejected the notification. Check the Resend sender configuration." }, { status: 502 });
  }

  const { error: updateError } = await adminClient
    .from(table)
    .update({ admin_notified_at: new Date().toISOString() })
    .eq("id", id)
    .is("admin_notified_at", null);
  if (updateError) console.error("Admin email sent, but notification status could not be saved:", updateError.message);

  return NextResponse.json({ sent: true, statusSaved: !updateError });
}
