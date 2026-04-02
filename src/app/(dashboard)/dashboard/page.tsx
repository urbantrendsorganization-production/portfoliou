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
  MessageSquare,
  Bell,
  UserCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;

    async function loadStats() {
      try {
        const [analytics, workSamples, gigs, notifications] = await Promise.all([
          api.analytics.list(),
          api.workSamples.list(profile!.id),
          api.gigs.list({ status: 'open' }),
          api.notifications.list(),
        ]);

        setStats({
          profileViews: analytics.filter((e: any) => e.event_type === "profile_view").length,
          linkClicks: analytics.filter((e: any) => e.event_type === "link_click").length,
          workSampleViews: analytics.filter((e: any) => e.event_type === "work_sample_view").length,
          totalSamples: workSamples.length,
          activeGigs: gigs.length,
        });

        setRecentActivity(notifications.slice(0, 5));
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      }
    }

    loadStats();
  }, [profile]);

  function copyProfileLink() {
    const slug = profile?.username?.trim() || profile?.user_username;
    const url = `${window.location.origin}/${slug}`;
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {profile.name || "Creative"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
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
              <Link href={`/${profile.username?.trim() || profile.user_username}`} target="_blank">
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
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.profileViews}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last week
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <MousePointer2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Link Clicks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.linkClicks}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" /> +5% from last week
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isStudent ? "Work Samples" : "Talent Bookmarked"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalSamples}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Gigs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.activeGigs}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
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
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No recent activity yet</p>
                </div>
              ) : (
                recentActivity.map((item: any) => {
                  const iconMap: Record<string, { icon: React.ReactNode; bg: string }> = {
                    new_message: { icon: <MessageSquare className="h-4 w-4" />, bg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400" },
                    gig_application: { icon: <Briefcase className="h-4 w-4" />, bg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400" },
                    application_accepted: { icon: <UserCheck className="h-4 w-4" />, bg: "bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400" },
                    application_rejected: { icon: <XCircle className="h-4 w-4" />, bg: "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400" },
                    profile_view: { icon: <Eye className="h-4 w-4" />, bg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400" },
                  };
                  const style = iconMap[item.notification_type] || iconMap.profile_view;
                  const timeAgo = getTimeAgo(item.created_at);

                  return (
                    <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className={`h-8 w-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                        {style.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </p>
                        {item.message && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.message}</p>
                        )}
                      </div>
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{timeAgo}</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
