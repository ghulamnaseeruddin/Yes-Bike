"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Review = { id: string; rating: number; comment: string | null; created_at: string };

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const isDatabaseProduct = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);

  useEffect(() => {
    async function loadReviews() {
      if (!isDatabaseProduct) return;
      const [{ data: { user } }, { data, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("reviews").select("id,rating,comment,created_at").eq("product_id", productId).order("created_at", { ascending: false }),
      ]);
      if (user) setUserId(user.id);
      if (error) setMessage(error.message);
      else setReviews((data ?? []) as Review[]);
    }
    void loadReviews();
  }, [isDatabaseProduct, productId]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setMessage("Sign in to leave a review.");
      return;
    }
    const { data, error } = await supabase.from("reviews").insert({ product_id: productId, user_id: userId, rating: Number(rating), comment: comment.trim() }).select("id,rating,comment,created_at").single();
    if (error) setMessage(error.message);
    else {
      setReviews((current) => [data as Review, ...current]);
      setComment("");
      setMessage("Your review has been added.");
    }
  }

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <section style={{ marginTop: 36, borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 24 }}>
      <h2>Rider reviews</h2>
      {reviews.length > 0 ? <p style={{ color: "#facc15" }}>★ {average.toFixed(1)} average · {reviews.length} reviews</p> : <p style={{ color: "#aab2bd" }}>No reviews yet.</p>}
      {reviews.map((review) => <article key={review.id} style={{ borderTop: "1px solid rgba(255,255,255,.1)", padding: "14px 0" }}><strong style={{ color: "#facc15" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong><p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{review.comment || "A rider left a rating."}</p><small style={{ color: "#94a3b8" }}>{new Date(review.created_at).toLocaleDateString()}</small></article>)}
      {userId && isDatabaseProduct && <form onSubmit={submitReview} style={{ display: "grid", gap: 10, maxWidth: 520, marginTop: 18 }}><label style={{ display: "grid", gap: 6 }}>Rating<select value={rating} onChange={(event) => setRating(event.target.value)} style={inputStyle}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label><label style={{ display: "grid", gap: 6 }}>Review<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1200} rows={4} style={inputStyle} /></label><button style={{ justifySelf: "start", padding: "10px 14px", background: "#f97316", border: 0, borderRadius: 6, color: "#fff", fontWeight: 700 }}>Submit review</button></form>}
      {!userId && isDatabaseProduct && <a href="/auth" style={{ color: "#f97316" }}>Sign in to review</a>}
      {message && <p role="status" style={{ color: "#cbd5e1" }}>{message}</p>}
    </section>
  );
}

const inputStyle = {
  width: "100%",
  minWidth: 0,
  padding: "11px 12px",
  color: "#fff",
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 10,
  fontSize: "1rem",
  outline: "none",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
};
