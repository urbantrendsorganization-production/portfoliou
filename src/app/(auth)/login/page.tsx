"use client";

import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Sparkles } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setProfile = useAppStore((s) => s.setProfile);
  const redirect = searchParams.get("redirect") || "/dashboard";

  async function handleGoogleLogin(credential: string) {
    setError("");
    setGoogleLoading(true);
    try {
      const data = await api.auth.googleLogin(credential);
      const profile = await api.auth.me();
      setProfile(profile);

      // If new user, send them to complete their profile
      if (data.is_new_user) {
        router.push("/onboarding");
      } else {
        router.push(redirect);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.error || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In Django, we typically log in with username or email.
      // Our Register logic uses email as username if we wanted, but DRF SimpleJWT defaults to username.
      // Let's assume username is the email for this implementation or update backend.
      // For now, let's use the email as the 'username' key for simplicity.
      await api.auth.login({ username: email, password });

      const profile = await api.auth.me();
      setProfile(profile);

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="rounded-xl bg-gradient-to-br flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774943398/PortfolioU_1_bqx4cv.png"
                alt="Logo"
                className="w-10" // Adjust w-10 (2.5rem) to your preferred size
              />
            </div>
            {/* <span className="font-bold text-2xl text-gray-900">
              Portfolio<span className="text-blue-600">U</span>
            </span> */}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-4">
            <GoogleSignInButton
              onSuccess={handleGoogleLogin}
              onError={(err) => setError(err)}
              text="signin_with"
            />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-400">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username (Email)"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
