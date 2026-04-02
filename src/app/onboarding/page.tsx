"use client";

import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/layout/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DISCIPLINES } from "@/utils/constants";
import { cn } from "@/utils/helpers";
import { Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Role } from "@/types/database";

export default function OnboardingPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const router = useRouter();

  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [school, setSchool] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
    }
  }, [profile]);

  useEffect(() => {
    // If no token, redirect to login
    if (!localStorage.getItem("access_token")) {
      router.replace("/login");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      const me = profile || (await api.profiles.me());
      const updatedProfile = await api.profiles.update(me.id, {
        role,
        name: name.trim(),
        discipline: role === "student" ? discipline : "",
        school: role === "student" ? school : "",
      });
      setProfile(updatedProfile);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
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
            Complete your profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tell us a bit about yourself to get started
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "student" ? "Jane Doe" : "Acme Studios"}
              required
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
              Get Started
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
