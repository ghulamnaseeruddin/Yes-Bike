"use client";

import { signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { FormEvent, useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const result = mode === "login"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, fullName);

      if (result.error) {
        setStatus(result.error.message);
      } else {
        setStatus(
          mode === "login"
            ? "Signed in successfully."
            : "Registration successful. Check your email to confirm the account."
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "80px auto", padding: "0 20px" }}>
      <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: mode === "login" ? "#f97316" : "#1f2937",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: mode === "register" ? "#f97316" : "#1f2937",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          {mode === "register" && (
            <label style={{ display: "grid", gap: 8, color: "#e5e7eb" }}>
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                type="text"
                placeholder="Your full name"
                style={inputStyle}
              />
            </label>
          )}

          <label style={{ display: "grid", gap: 8, color: "#e5e7eb" }}>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8, color: "#e5e7eb" }}>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              background: "#f97316",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
          </button>

          {status && <p style={{ color: "#e5e7eb", lineHeight: 1.6 }}>{status}</p>}
        </form>
      </div>
    </main>
  );
}

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
} as const;
