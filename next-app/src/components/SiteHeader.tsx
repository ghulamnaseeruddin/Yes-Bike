"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup" || pathname === "/auth") return null;

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e4e8e3", color: "#202622" }}>
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "#202622", fontSize: 18, fontWeight: 850, letterSpacing: ".03em" }}>YES<span style={{ color: "#d65a32" }}>BIKE</span></Link>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", fontSize: 13, color: "#515b53" }}>
          <Link href="/shop">Shop</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/login" style={{ padding: "8px 12px", borderRadius: 5, background: "#d65a32", color: "#fff", fontWeight: 700 }}>Sign in</Link>
        </div>
      </nav>
    </header>
  );
}
