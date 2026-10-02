import AuthForm from "@/components/AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthForm mode="login" initialError={error === "oauth" ? "Google sign-in could not be completed. Try again or use your email and password." : ""} />;
}
