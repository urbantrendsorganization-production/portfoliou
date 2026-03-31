"use client";

import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DISCIPLINES } from "@/utils/constants";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Sparkles, Users, Briefcase } from "lucide-react";
import { cn } from "@/utils/helpers";
import type { Role } from "@/types/database";

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
  const router = useRouter();
  const setProfile = useAppStore((s) => s.setProfile);

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
      setError(err.username?.[0] || err.email?.[0] || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
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
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-500 mt-1">
            Join the talent marketplace for college creatives
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                role === "student"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Users
                className={cn(
                  "h-6 w-6",
                  role === "student" ? "text-indigo-600" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  role === "student" ? "text-indigo-600" : "text-gray-600"
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
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Briefcase
                className={cn(
                  "h-6 w-6",
                  role === "client" ? "text-indigo-600" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  role === "client" ? "text-indigo-600" : "text-gray-600"
                )}
              >
                Client / Business
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

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

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-700"
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
