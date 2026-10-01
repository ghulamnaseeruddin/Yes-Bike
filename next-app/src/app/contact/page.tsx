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
    const { error } = await supabase.from("contacts").insert({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim(),
      phone: String(form.get("phone")).trim() || null,
      subject: String(form.get("subject")).trim(),
      message: String(form.get("message")).trim(),
    });
    setSending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    formElement.reset();
    setMessage("Thanks. Your message has been sent to the YES BIKE team.");
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 20px 80px", display: "grid", gridTemplateColumns: "minmax(220px,.8fr) minmax(320px,1.2fr)", gap: 40 }}>
      <section>
        <p style={{ color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>Contact</p>
        <h1 style={{ color: "#fff", margin: "10px 0 12px" }}>Talk to our team.</h1>
        <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>Send a product, sizing, or order question. We’ll get back to you using the contact details you provide.</p>
        <p style={{ color: "#e5e7eb", marginTop: 16 }}>YES BIKE<br />South Africa</p>
      </section>
      <form onSubmit={submitContact} style={{ display: "grid", gap: 14, background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 24 }}>
        <label style={labelStyle}>Name<input required name="name" minLength={2} autoComplete="name" style={inputStyle} /></label>
        <label style={labelStyle}>Email<input required type="email" name="email" autoComplete="email" style={inputStyle} /></label>
        <label style={labelStyle}>Phone (optional)<input type="tel" name="phone" autoComplete="tel" style={inputStyle} /></label>
        <label style={labelStyle}>Subject<input required name="subject" minLength={3} style={inputStyle} /></label>
        <label style={labelStyle}>Message<textarea required name="message" minLength={10} rows={6} style={{ ...inputStyle, resize: "vertical" }} /></label>
        <button disabled={sending} style={{ padding: "12px 16px", background: "#f97316", border: 0, borderRadius: 6, color: "#fff", fontWeight: 700 }}>{sending ? "Sending..." : "Send message"}</button>
        {message && <p role="status" style={{ color: "#f8fafc" }}>{message}</p>}
      </form>
    </main>
  );
}

const labelStyle = { display: "grid", gap: 7, color: "#e5e7eb", fontWeight: 600 };
const inputStyle = {
  width: "100%",
  minWidth: 0,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "#0f172a",
  color: "#fff",
  fontSize: "1rem",
  outline: "none",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
};
