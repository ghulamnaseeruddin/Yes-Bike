"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = { id: string; email: string; full_name: string | null; phone: string | null; role: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setMessage(authError?.message ?? "Sign in to view your profile.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,role")
        .eq("id", user.id)
        .maybeSingle();
      if (error) setMessage(error.message);
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
      }
      setLoading(false);
    }
    void loadProfile();
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage("");
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("id", profile.id)
      .select("id,email,full_name,phone,role")
      .single();
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProfile(data);
    setMessage("Profile saved.");
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
    else window.location.assign("/auth");
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
      <h1>Profile</h1>
      {loading ? <p>Loading profile...</p> : profile ? (
        <form onSubmit={saveProfile} style={panelStyle}>
          <p style={{ color: "#aab2bd" }}>Account: {profile.email}</p>
          <label style={labelStyle}>Full name
            <input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>Phone
            <input autoComplete="tel" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} style={inputStyle} />
          </label>
          <p>Account type: {profile.role}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button disabled={saving} style={primaryButton}>{saving ? "Saving..." : "Save profile"}</button>
            <button type="button" onClick={signOut} style={secondaryButton}>Sign out</button>
          </div>
          {message && <p role="status">{message}</p>}
        </form>
      ) : (
        <section style={panelStyle}>
          <p>{message || "This account profile is not available. Try signing out and back in."}</p>
          <a href="/auth" style={{ color: "#f97316" }}>Sign in or register</a>
        </section>
      )}
    </main>
  );
}

const panelStyle = { display: "grid", gap: 18, background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 24 };
const labelStyle = { display: "grid", gap: 8 };
const inputStyle = { width: "100%", minWidth: 0, padding: 12, color: "#fff", background: "#0f172a", border: "1px solid rgba(255,255,255,.18)", borderRadius: 6 };
const primaryButton = { padding: "11px 16px", color: "#fff", background: "#f97316", border: 0, borderRadius: 6, fontWeight: 700, cursor: "pointer" };
const secondaryButton = { padding: "11px 16px", color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,.2)", borderRadius: 6, cursor: "pointer" };
