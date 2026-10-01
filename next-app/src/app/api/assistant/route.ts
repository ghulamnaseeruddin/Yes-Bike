import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  let body: { question?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (question.length < 3 || question.length > 500) {
    return NextResponse.json({ error: "Ask a question between 3 and 500 characters." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The product advisor is not configured. Use shop search or add GROQ_API_KEY on the server." }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Sign in to use the product advisor." }, { status: 401 });
    }
    const products = await getProducts();
    const catalog = products.slice(0, 80).map(({ id, name, category, description, price, discountPrice, sizes, colors, stock }) => ({
      id, name, category, description, price: discountPrice ?? price, sizes, colors, inStock: stock > 0,
    }));
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are the YES BIKE riding-gear product advisor. Use only the supplied catalog. Do not invent safety certifications, materials, fit guarantees, or product capabilities. If the catalog cannot answer, say so. Return JSON with exactly: answer (string), productIds (array of catalog IDs, maximum 4)." },
          { role: "user", content: JSON.stringify({ question, catalog }) },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "The product advisor is temporarily unavailable." }, { status: 502 });
    }
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("The advisor returned an empty response.");
    const parsed: unknown = JSON.parse(content);
    if (!parsed || typeof parsed !== "object") throw new Error("The advisor returned an invalid response.");

    const output = parsed as { answer?: unknown; productIds?: unknown };
    const allowedIds = new Set(catalog.map((product) => product.id));
    const productIds = Array.isArray(output.productIds)
      ? output.productIds.filter((id): id is string => typeof id === "string" && allowedIds.has(id)).slice(0, 4)
      : [];
    return NextResponse.json({
      answer: typeof output.answer === "string" ? output.answer.slice(0, 1200) : "I couldn't find a clear answer in the catalog.",
      productIds,
    });
  } catch {
    return NextResponse.json({ error: "The product advisor is temporarily unavailable." }, { status: 502 });
  }
}
