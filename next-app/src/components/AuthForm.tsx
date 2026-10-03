"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/auth";
import "./AuthForm.css";

type AuthMode = "login" | "signup";

export default function AuthForm({ mode, initialError = "" }: { mode: AuthMode; initialError?: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState(initialError);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  async function submitWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    if (mode === "signup" && password !== confirmPassword) {
      setStatus("Your passwords do not match.");
      return;
    }

    setBusy("email");
    try {
      const { data, error } = mode === "login"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, fullName);
      if (error) {
        setStatus(error.message);
      } else if (mode === "signup" && !data.session) {
        setStatus("Instant sign-in is not enabled yet. In Supabase, turn off email confirmations under Authentication → Providers → Email, then try again.");
      } else {
        router.push("/profile");
        router.refresh();
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function submitWithGoogle() {
    setStatus("");
    setBusy("google");
    try {
      const { error } = await signInWithGoogle("/profile");
      if (error) setStatus(error.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Google sign-in could not be started.");
    } finally {
      setBusy(null);
    }
  }

  const isSignup = mode === "signup";

  return (
    <main className="authShell">
      <section className="authPanel" aria-labelledby="auth-title">
        <Link href="/" className="authBrand" aria-label="YES BIKE home">YES<span>BIKE</span></Link>
        <p className="authEyebrow">RIDE WITH CONFIDENCE</p>
        <h1 id="auth-title">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="authIntro">{isSignup ? "Save your gear, track orders, and get ready for the road." : "Sign in to access your profile, saved gear, and orders."}</p>

        <button className="googleButton" type="button" onClick={submitWithGoogle} disabled={busy !== null}>
          <svg aria-hidden="true" viewBox="0 0 48 48" width="19" height="19">
            <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
            <path fill="#FF3D00" d="M24 44c5.4 0 9.9-1.8 13.2-4.9l-6.7-5.1c-1.8 1.2-4 2-6.5 2-5 0-9.2-3.4-10.7-8H6.4v5.2A20 20 0 0 0 24 44Z" />
            <path fill="#4CAF50" d="M13.3 28a12 12 0 0 1 0-7.9v-5.2H6.4a20 20 0 0 0 0 18.3l6.9-5.2Z" />
            <path fill="#1976D2" d="M24 12.1c2.9 0 5.5 1 7.5 3l5.8-5.8A19.5 19.5 0 0 0 24 4 20 20 0 0 0 6.4 14.9l6.9 5.2c1.5-4.6 5.7-8 10.7-8Z" />
          </svg>
          <span>{busy === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        <div className="authDivider"><span>or continue with email</span></div>

        <form onSubmit={submitWithEmail} className="authForm">
          {isSignup && <label className="authField">Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} name="fullName" type="text" autoComplete="name" placeholder="Your name" required minLength={2} disabled={busy !== null} /></label>}
          <label className="authField">Gmail address<input value={email} onChange={(event) => setEmail(event.target.value)} name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@gmail.com" required disabled={busy !== null} /></label>
          <label className="authField">Password
            <span className="passwordControl"><input value={password} onChange={(event) => setPassword(event.target.value)} name="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "At least 8 characters" : "Enter your password"} required minLength={isSignup ? 8 : 6} disabled={busy !== null} /><button type="button" className="passwordToggle" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? "Hide" : "Show"}</button></span>
          </label>
          {isSignup && <label className="authField">Confirm password
            <span className="passwordControl"><input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter your password" required minLength={8} disabled={busy !== null} /><button type="button" className="passwordToggle" aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword((shown) => !shown)}>{showConfirmPassword ? "Hide" : "Show"}</button></span>
          </label>}
          {status && <p className="authStatus" role="alert">{status}</p>}
          <button className="primaryAuthButton" type="submit" disabled={busy !== null}>{busy === "email" ? "Please wait..." : isSignup ? "Create account" : "Sign in"}</button>
        </form>

        <p className="authSwitch">{isSignup ? "Already have an account?" : "New to YES BIKE?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link></p>
        <p className="authTerms">By continuing, you agree to use YES BIKE account services responsibly.</p>
      </section>
    </main>
  );
}
