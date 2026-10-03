"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function getAccountLabel(user: User) {
  const metadata = user.user_metadata;
  const name = metadata.full_name || metadata.name || user.email?.split("@")[0] || "Account";
  const initials = String(name).trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join("");
  return { name: String(name), initials: initials || "A" };
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [account, setAccount] = useState<{ name: string; initials: string } | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setAccount(!error && data.user ? getAccountLabel(data.user) : null);
      setAuthResolved(true);
    }).catch(() => {
      if (active) setAuthResolved(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccount(session?.user ? getAccountLabel(session.user) : null);
      setAuthResolved(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (pathname === "/login" || pathname === "/signup" || pathname === "/auth") return null;

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e4e8e3", color: "#202622" }}>
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "#202622", fontSize: 18, fontWeight: 850, letterSpacing: ".03em" }}>YES<span style={{ color: "#d65a32" }}>BIKE</span></Link>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", fontSize: 13, color: "#515b53" }}>
          <Link href="/shop" prefetch={false}>Shop</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/wishlist" prefetch={false}>Wishlist</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/admin">Admin</Link>
          {authResolved && account ? (
            <Link href="/profile" className="accountLink" aria-label={`Open ${account.name}'s profile settings`}>
              <span className="accountAvatar" aria-hidden="true">{account.initials}</span>
              <span>{account.name}</span>
            </Link>
          ) : authResolved ? (
            <Link href="/login" className="headerSignIn" prefetch={false}>Sign in</Link>
          ) : (
            <span className="accountLoading" aria-label="Loading account" />
          )}
        </div>
      </nav>
    </header>
  );
}