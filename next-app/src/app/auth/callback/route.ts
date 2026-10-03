import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getSafeNextPath(value: string | null) {
  if (!value) return "/profile";
  if (!value.startsWith("/")) return "/profile";
  if (value.startsWith("//")) return "/profile";
  if (value.includes("\\")) return "/profile";
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (!code) return NextResponse.redirect(new URL("/login?error=oauth", request.url));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", request.url));

  return NextResponse.redirect(new URL(nextPath, request.url));
}