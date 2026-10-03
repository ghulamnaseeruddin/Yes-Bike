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
  const [isAdmin, setIsAdmin] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRole(userId: string) {
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (active) setIsAdmin(data?.role === "admin");
    }

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (!error && data.user) {
        setAccount(getAccountLabel(data.user));
        void loadRole(data.user.id);
      } else {
        setAccount(null);
        setIsAdmin(false);
      }
      setAuthResolved(true);
    }).catch(() => {
      if (active) setAuthResolved(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAccount(getAccountLabel(session.user));
        const userId = session.user.id;
        setTimeout(() => void loadRole(userId), 0);
      } else {
        setAccount(null);
        setIsAdmin(false);
      }
      setAuthResolved(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (pathname === "/login" || pathname === "/signup" || pathname === "/auth") return null;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="siteHeader">
      <nav className="siteNav" aria-label="Main">
        <Link href="/" className="brand" onClick={closeMenu}>YES<span>BIKE</span></Link>

        <button
          type="button"
          className="navToggle"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div id="main-menu" className={`navLinks${menuOpen ? " open" : ""}`}>
          <Link href="/shop" prefetch={false} onClick={closeMenu}>Shop</Link>
          <Link href="/categories" onClick={closeMenu}>Categories</Link>
          <Link href="/about" onClick={closeMenu}>About</Link>
          <Link href="/contact" onClick={closeMenu}>Contact</Link>
          <Link href="/wishlist" prefetch={false} onClick={closeMenu}>Wishlist</Link>
          <Link href="/cart" onClick={closeMenu}>Cart</Link>
          {account && <Link href="/orders" onClick={closeMenu}>Orders</Link>}
          {isAdmin && <Link href="/admin" onClick={closeMenu}>Admin</Link>}
          {authResolved && account ? (
            <Link href="/profile" className="accountLink" aria-label={`Open ${account.name}'s profile settings`} onClick={closeMenu}>
              <span className="accountAvatar" aria-hidden="true">{account.initials}</span>
              <span>{account.name}</span>
            </Link>
          ) : authResolved ? (
            <Link href="/login" className="headerSignIn" prefetch={false} onClick={closeMenu}>Sign in</Link>
          ) : (
            <span className="accountLoading" aria-label="Loading account" />
          )}
        </div>
      </nav>
    </header>
  );
}