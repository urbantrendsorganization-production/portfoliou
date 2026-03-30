"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  Eye,
  MousePointer2,
  FileText,
  Briefcase,
  TrendingUp,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const profile = useAppStore((s) => s.profile);
  const [stats, setStats] = useState({
    profileViews: 0,
    linkClicks: 0,
    workSampleViews: 0,
    totalSamples: 0,
    activeGigs: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) return;

    async function loadStats() {
      try {
        const [analytics, workSamples, gigs] = await Promise.all([
          api.analytics.list(),
          api.workSamples.list(profile!.id),
          api.gigs.list({ status: 'open' }),
        ]);

        setStats({
          profileViews: analytics.filter((e: any) => e.event_type === "profile_view").length,
          linkClicks: analytics.filter((e: any) => e.event_type === "link_click").length,
          workSampleViews: analytics.filter((e: any) => e.event_type === "work_sample_view").length,
          totalSamples: workSamples.length,
          activeGigs: gigs.length,
        });
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      }
    }

    loadStats();
  }, [profile]);

  function copyProfileLink() {
    const url = `${window.location.origin}/${profile?.username || profile?.user_username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = useAppStore((s) => s.isLoading);
  const router = useRouter();

  async function handleLogout() {
    api.auth.logout();
    router.push("/login");
  }

  if (!profile) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          {isLoading ? (
            <div className="animate-pulse text-gray-400">Loading your profile...</div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500">We couldn&apos;t find your profile record.</p>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log Out & Start Over
              </Button>
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  const isStudent = profile.role === "student";

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile.name || "Creative"}
            </h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s what&apos;s happening with your{" "}
              {isStudent ? "portfolio" : "account"} today.
            </p>
          </div>
          {isStudent && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={copyProfileLink}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Link href={`/${profile.username || profile.user_username}`} target="_blank">
                <Button variant="secondary" size="sm">
                  <ExternalLink className="h-4 w-4" /> View Portfolio
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.profileViews}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last week
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <MousePointer2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Link Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.linkClicks}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" /> +5% from last week
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-50 text-pink-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {isStudent ? "Work Samples" : "Talent Bookmarked"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSamples}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Gigs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeGigs}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {isStudent ? (
                <>
                  <Link href="/portfolio">
                    <Button variant="outline" fullWidth className="h-20 flex-col gap-2">
                      <FileText className="h-5 w-5" />
                      Add Work
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button variant="outline" fullWidth className="h-20 flex-col gap-2">
                      <Eye className="h-5 w-5" />
                      Browse Jobs
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/gigs">
                    <Button variant="outline" fullWidth className="h-20 flex-col gap-2">
                      <Briefcase className="h-5 w-5" />
                      Post a Gig
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button variant="outline" fullWidth className="h-20 flex-col gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Find Talent
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/settings">
                <Button variant="outline" fullWidth className="h-20 flex-col gap-2">
                  <Check className="h-5 w-5" />
                  Edit Profile
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" fullWidth className="h-20 flex-col gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Messages
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    New profile view
                  </p>
                  <p className="text-xs text-gray-500">Someone from Atlanta viewed your portfolio</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">2h ago</span>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Profile updated
                  </p>
                  <p className="text-xs text-gray-500">You updated your discipline to Graphic Design</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">5h ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
