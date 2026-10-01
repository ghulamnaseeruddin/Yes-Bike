import { getProducts } from "@/lib/products";
import styles from "./page.module.css";

const featureList = [
  "Premium-grade protection",
  "Built for South African riders",
  "Cash on delivery checkout",
  "Curated motorcycle essentials",
];

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.filter((product) => product.featured || product.isBestSeller || product.isNew);
  const displayProducts = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 4);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Modern rider essentials</p>
          <h1>Built for performance. Designed for the road.</h1>
          <p className={styles.subtitle}>
            Protection-focused motorcycle gear for everyday rides, weekend escapes, and the long way home.
          </p>
          <div className={styles.actions}>
            <a href="#catalog" className={styles.primaryButton}>Shop collection</a>
            <a href="#features" className={styles.secondaryButton}>Explore features</a>
          </div>
          <ul className={styles.featureList}>
            {featureList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.panelBadge}>New ride-ready drop</div>
          <div className={styles.panelCard}>
            <span className={styles.priceTag}>From R 899</span>
            <h2>Road Tested</h2>
            <p>Protection-first gear for daily riders and touring enthusiasts.</p>
          </div>
        </div>
      </section>

      <section id="catalog" className={styles.catalogSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Featured catalog</p>
          <h2>Top rider essentials</h2>
        </div>

        <div className={styles.productGrid}>
          {displayProducts.map((product) => (
            <article key={product.id} className={styles.productCard}>
              <div
                className={styles.productImage}
                aria-hidden="true"
                style={{
                  backgroundImage: product.images[0]
                    ? `linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url("${product.images[0]}")`
                    : undefined,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
              <div className={styles.productBody}>
                <p className={styles.category}>{product.category}</p>
                <h3>{product.name}</h3>
                <div className={styles.productMeta}>
                  <span>{`R ${Number(product.price).toLocaleString("en-ZA")}`}</span>
                  <a href={`/products/${product.id}`}>View product</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className={styles.featureSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>The YES BIKE standard</p>
          <h2>Gear for the miles ahead</h2>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>Protection first</h3>
            <p>Riding gear selected for comfort, durability, and confidence on the road.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Made for riders</h3>
            <p>Practical essentials for commuting, touring, and days spent chasing open roads.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Cash on delivery</h3>
            <p>Place your order online and pay when it arrives. No online payment provider is used.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
