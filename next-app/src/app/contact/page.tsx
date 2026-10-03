"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const contactId = crypto.randomUUID();
    const { error } = await supabase.from("contacts").insert({
      id: contactId,
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim(),
      phone: String(form.get("phone")).trim() || null,
      subject: String(form.get("subject")).trim(),
      message: String(form.get("message")).trim(),
    });
    if (error) {
      setSending(false);
      setMessage(error.message);
      return;
    }
    formElement.reset();
    try {
      const notification = await fetch("/api/admin-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", id: contactId }),
      });
      setMessage(notification.ok
        ? "Thanks. Your message was sent to the YES BIKE team."
        : "Your message was saved, but its email notification could not be sent. Please try contacting us again later.");
    } catch {
      setMessage("Your message was saved, but its email notification could not be sent. Please try contacting us again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 20px 80px", display: "grid", gridTemplateColumns: "minmax(220px,.8fr) minmax(320px,1.2fr)", gap: 40 }}>
      <section><p style={{ color: "#d65a32", fontWeight: 700, textTransform: "uppercase" }}>Contact</p><h1>Talk to our team.</h1><p style={{ color: "#59645c", lineHeight: 1.7 }}>Send a product, sizing, or order question. We’ll get back to you using the contact details you provide.</p><p>YES BIKE<br />South Africa</p></section>
      <form onSubmit={submitContact} style={{ display: "grid", gap: 14, background: "#fff", border: "1px solid #e1e6e0", borderRadius: 8, padding: 24 }}>
        <label style={labelStyle}>Name<input required name="name" minLength={2} autoComplete="name" style={inputStyle} /></label>
        <label style={labelStyle}>Email<input required type="email" name="email" autoComplete="email" style={inputStyle} /></label>
        <label style={labelStyle}>Phone (optional)<input type="tel" name="phone" autoComplete="tel" style={inputStyle} /></label>
        <label style={labelStyle}>Subject<input required name="subject" minLength={3} style={inputStyle} /></label>
        <label style={labelStyle}>Message<textarea required name="message" minLength={10} rows={6} style={{ ...inputStyle, resize: "vertical" }} /></label>
        <button disabled={sending} style={{ padding: "12px 16px", background: "#d65a32", border: 0, borderRadius: 6, color: "#fff", fontWeight: 700 }}>{sending ? "Sending..." : "Send message"}</button>
        {message && <p role="status">{message}</p>}
      </form>
    </main>
  );
}

const labelStyle = { display: "grid", gap: 7 };
const inputStyle = { width: "100%", minWidth: 0, padding: 11, borderRadius: 6, border: "1px solid #d9ded9", background: "#fff", color: "#202622" };
