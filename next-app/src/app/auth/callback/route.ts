import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next") ?? "/profile";
  const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/profile";

  if (!code) return NextResponse.redirect(new URL("/login?error=oauth", request.url));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", request.url));

  return NextResponse.redirect(new URL(nextPath, request.url));
}
