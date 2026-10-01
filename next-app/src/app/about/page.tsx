export default function AboutPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 20px 88px" }}>
      <p style={{ color: "#f97316", fontWeight: 700, textTransform: "uppercase" }}>Built around the ride</p>
      <h1 style={{ maxWidth: 720, fontSize: "clamp(2.4rem,5vw,4.5rem)", lineHeight: 1.02, color: "#fff" }}>Protection for every mile.</h1>
      <p style={{ maxWidth: 720, color: "#e2e8f0", fontSize: 18, lineHeight: 1.8 }}>YES BIKE brings together practical motorcycle apparel and riding essentials for commuters, weekend riders, and long-distance travelers. We focus on clear product details, useful fit options, and dependable service.</p>
      <section style={{ borderTop: "1px solid rgba(255,255,255,.15)", marginTop: 44, paddingTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
        <div><h2 style={{ color: "#fff" }}>Ride-ready gear</h2><p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>Browse protective layers, helmets, boots, and accessories in one place.</p></div>
        <div><h2 style={{ color: "#fff" }}>Clear checkout</h2><p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>Orders are cash on delivery. No online payment provider or card details are used.</p></div>
        <div><h2 style={{ color: "#fff" }}>Here to help</h2><p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>Contact the team for order and product questions before you ride.</p></div>
      </section>
      <a href="/shop" style={{ display: "inline-flex", marginTop: 32, padding: "12px 18px", borderRadius: 8, color: "#fff", background: "#f97316", fontWeight: 700, textDecoration: "none" }}>Shop riding gear</a>
    </main>
  );
}
