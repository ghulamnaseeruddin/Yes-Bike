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
    <section style={{ marginTop: 36, borderTop: "1px solid #e1e6e0", paddingTop: 24 }}>
      <h2>Rider reviews</h2>
      {reviews.length > 0 ? <p style={{ color: "#8c650d" }}>★ {average.toFixed(1)} average · {reviews.length} reviews</p> : <p style={{ color: "#68716b" }}>No reviews yet.</p>}
      {reviews.map((review) => <article key={review.id} style={{ borderTop: "1px solid #e1e6e0", padding: "14px 0" }}><strong style={{ color: "#8c650d" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong><p style={{ color: "#59645c", lineHeight: 1.6 }}>{review.comment || "A rider left a rating."}</p><small style={{ color: "#68716b" }}>{new Date(review.created_at).toLocaleDateString()}</small></article>)}
      {userId && isDatabaseProduct && <form onSubmit={submitReview} style={{ display: "grid", gap: 10, maxWidth: 520, marginTop: 18 }}><label style={{ display: "grid", gap: 6 }}>Rating<select value={rating} onChange={(event) => setRating(event.target.value)} style={inputStyle}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label><label style={{ display: "grid", gap: 6 }}>Review<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1200} rows={4} style={inputStyle} /></label><button style={{ justifySelf: "start", padding: "10px 14px", background: "#d65a32", border: 0, borderRadius: 6, color: "#fff", fontWeight: 700 }}>Submit review</button></form>}
      {!userId && isDatabaseProduct && <a href="/login" style={{ color: "#b84522" }}>Sign in to review</a>}
      {message && <p role="status" style={{ color: "#59645c" }}>{message}</p>}
    </section>
  );
}

const inputStyle = { width: "100%", minWidth: 0, padding: 10, color: "#202622", background: "#fff", border: "1px solid #d9ded9", borderRadius: 6 };
