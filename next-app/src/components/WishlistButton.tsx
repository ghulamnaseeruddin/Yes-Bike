"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WishlistButton({ productId, initialSaved = false }: { productId: string; initialSaved?: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState("");
  const isDatabaseProduct = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

  useEffect(() => {
    let active = true;
    async function loadSavedState() {
      if (!isDatabaseProduct) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id).eq("product_id", productId).maybeSingle();
      if (active) setSaved(Boolean(data));
    }
    void loadSavedState();
    return () => { active = false; };
  }, [isDatabaseProduct, productId]);

  async function toggleSaved() {
    setMessage("");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setMessage("Sign in to save items.");
      return;
    }
    if (saved) {
      const { error } = await supabase.from("wishlist_items").delete().eq("product_id", productId).eq("user_id", user.id);
      if (error) setMessage(error.message);
      else {
        setSaved(false);
        router.refresh();
      }
    } else {
      const { error } = await supabase.from("wishlist_items").insert({ product_id: productId, user_id: user.id });
      if (error) setMessage(error.message);
      else {
        setSaved(true);
        router.refresh();
      }
    }
  }

  return (
    <div>
      <button type="button" disabled={!isDatabaseProduct} onClick={() => void toggleSaved()} aria-pressed={saved} title={!isDatabaseProduct ? "Sign in and use live products to save items" : saved ? "Remove from wishlist" : "Save to wishlist"} style={{ width: 42, height: 42, border: "1px solid #d9ded9", borderRadius: 6, color: saved ? "#b84522" : "#39433c", background: "#fff", cursor: "pointer" }}>
        {saved ? "♥" : "♡"}
      </button>
      {message && <p role="status" style={{ color: "#59645c", fontSize: 13 }}>{message} <a href="/login" style={{ color: "#b84522" }}>Sign in</a></p>}
    </div>
  );
}
