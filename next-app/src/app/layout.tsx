import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YES BIKE | Motorcycle Gear",
  description: "Modern motorcycle leather and riding gear storefront powered by Next.js and Supabase.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <a href="/" style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>YES BIKE</a>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="/" style={{ color: "#e5e7eb" }}>Home</a>
              <a href="/shop" style={{ color: "#e5e7eb" }}>Shop</a>
              <a href="/auth" style={{ color: "#e5e7eb" }}>Login</a>
              <a href="/profile" style={{ color: "#e5e7eb" }}>Profile</a>
              <a href="/orders" style={{ color: "#e5e7eb" }}>Orders</a>
              <a href="/admin" style={{ color: "#e5e7eb" }}>Admin</a>
              <a href="/cart" style={{ color: "#e5e7eb" }}>Cart</a>
              <a href="/checkout" style={{ color: "#e5e7eb" }}>Checkout</a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
