import { supabase } from "@/lib/supabase";

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fprofile`,
      data: {
        full_name: fullName?.trim() ?? "",
      },
    },
  });

  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  return { data, error };
}

export async function signInWithGoogle(nextPath = "/profile") {
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", nextPath);
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
      queryParams: { prompt: "select_account" },
    },
  });
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}
