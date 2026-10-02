import { createClient } from "@supabase/supabase-js";
import { demoProducts } from "@/lib/demo-data";

export type ProductRecord = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  stock: number;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  images: string[];
  sizes: string[];
  colors: string[];
};

export async function getProducts(): Promise<ProductRecord[]> {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
  );

  if (!hasSupabaseConfig) {
    return demoProducts;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase products query failed:", error.message);
      return demoProducts;
    }

    return (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: Number(product.price ?? 0),
      discountPrice: product.discount_price ? Number(product.discount_price) : null,
      category: product.category ?? "General",
      stock: Number(product.stock ?? 0),
      featured: Boolean(product.featured),
      isNew: Boolean(product.is_new),
      isBestSeller: Boolean(product.is_best_seller),
      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
    }));
  } catch (error) {
    console.error("Supabase connection failed:", error);
    return demoProducts;
  }
}

export async function getFeaturedProducts(): Promise<ProductRecord[]> {
  const products = await getProducts();
  return products.filter((product) => product.featured || product.isBestSeller || product.isNew).slice(0, 4);
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}
