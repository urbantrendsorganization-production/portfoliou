"use client";

import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/layout/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DISCIPLINES } from "@/utils/constants";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Users, Briefcase } from "lucide-react";
import { cn } from "@/utils/helpers";
import type { Role } from "@/types/database";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "student";

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [school, setSchool] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const setProfile = useAppStore((s) => s.setProfile);
  const { theme } = useTheme();

  async function handleGoogleSignup(credential: string) {
    setError("");
    setGoogleLoading(true);
    try {
      const data = await api.auth.googleLogin(credential);
      const profile = await api.auth.me();
      setProfile(profile);

      // Always send to onboarding to pick role
      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setError(err.error || "Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Register user (using email as username)
      await api.auth.register({ 
        username: email, 
        email, 
        password 
      });

      // 2. Login
      await api.auth.login({ username: email, password });

      // 3. Update profile with role-specific data
      const me = await api.profiles.me();
      const updatedProfile = await api.profiles.update(me.id, {
        role,
        name,
        discipline: role === "student" ? discipline : "",
        school: role === "student" ? school : "",
      });

      setProfile(updatedProfile);
      
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Signup error:", err);
      const msg =
        err.username?.[0] ||
        err.email?.[0] ||
        err.password?.[0] ||
        err.detail ||
        err.error ||
        (err.status === 400 ? "This email may already be registered. Try logging in instead." : "An unexpected error occurred.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 pt-16 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="rounded-xl flex items-center justify-center">
              <img
                src={
                  theme === "dark"
                    ? "https://res.cloudinary.com/dvifkm1ex/image/upload/v1775138239/PortfolioU_2_cpgk61.png"
                    : "https://res.cloudinary.com/dvifkm1ex/image/upload/v1774943398/PortfolioU_1_bqx4cv.png"
                }
                alt="Logo"
                className="w-10"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Join the talent marketplace for college creatives
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                role === "student"
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              )}
            >
              <Users
                className={cn(
                  "h-6 w-6",
                  role === "student" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  role === "student" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400"
                )}
              >
                Student
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("client")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                role === "client"
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              )}
            >
              <Briefcase
                className={cn(
                  "h-6 w-6",
                  role === "client" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  role === "client" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400"
                )}
              >
                Client / Business
              </span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Google Sign-Up */}
          <div className="mb-4">
            <GoogleSignInButton
              onSuccess={handleGoogleSignup}
              onError={(err) => setError(err)}
              text="signup_with"
            />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-4 text-gray-400 dark:text-gray-500">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                role === "student" ? "Jane Doe" : "Acme Studios"
              }
              required
            />

            <Input
              label="Email"
              type="email"
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
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />

            {role === "student" && (
              <>
                <Select
                  label="Discipline"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  options={DISCIPLINES.map((d) => ({ value: d, label: d }))}
                  placeholder="Select your discipline"
                />
                <Input
                  label="School"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g., Howard University"
                />
              </>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              Create Account
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
