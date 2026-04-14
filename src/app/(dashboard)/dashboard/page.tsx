"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
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
  Plus,
  ArrowRight,
  Settings2,
  Zap,
  Layers,
  Loader2,
  Sparkles,
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  trendPositive?: boolean;
  accentClass: string;
  iconBgClass: string;
  delay?: string;
}

function StatCard({ icon, label, value, trend, trendPositive = true, accentClass, iconBgClass, delay }: StatCardProps) {
  return (
    <div
      className={`group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-fade-in ${delay ?? ""}`}
    >
      {/* Top accent line */}
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accentClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex p-2.5 rounded-xl ${iconBgClass}`}>
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${trendPositive ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60" : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60"}`}>
            <TrendingUp className="h-2.5 w-2.5" />
            {trend}
          </span>
        )}
      </div>

      <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-0.5 tracking-tight">
        {label}
      </p>
      <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  accentClass: string;
  iconBgClass: string;
}

function QuickActionCard({ href, icon, label, description, accentClass, iconBgClass }: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer">
        <div className={`absolute inset-x-0 bottom-0 h-0.5 ${accentClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="flex items-center gap-3.5">
          <div className={`flex-shrink-0 inline-flex p-2.5 rounded-xl ${iconBgClass} group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {label}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              {description}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
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
          api.gigs.list({ status: "open" }),
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading your workspace...</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                <Zap className="h-7 w-7 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Profile not found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We couldn&apos;t load your profile record.</p>
              </div>
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

  const studentActions: QuickActionCardProps[] = [
    {
      href: "/portfolio",
      icon: <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
      label: "Add Work Sample",
      description: "Upload a new piece to your portfolio",
      accentClass: "bg-gradient-to-r from-indigo-500 to-purple-500",
      iconBgClass: "bg-indigo-50 dark:bg-indigo-950/70",
    },
    {
      href: "/browse",
      icon: <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      label: "Browse Gigs",
      description: "Discover new opportunities in your field",
      accentClass: "bg-gradient-to-r from-purple-500 to-pink-500",
      iconBgClass: "bg-purple-50 dark:bg-purple-950/70",
    },
    {
      href: "/settings",
      icon: <Settings2 className="h-4 w-4 text-pink-600 dark:text-pink-400" />,
      label: "Edit Profile",
      description: "Keep your profile fresh and complete",
      accentClass: "bg-gradient-to-r from-pink-500 to-rose-500",
      iconBgClass: "bg-pink-50 dark:bg-pink-950/70",
    },
    {
      href: "/messages",
      icon: <MessageSquare className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      label: "Messages",
      description: "Check your latest conversations",
      accentClass: "bg-gradient-to-r from-sky-500 to-cyan-500",
      iconBgClass: "bg-sky-50 dark:bg-sky-950/70",
    },
  ];

  const clientActions: QuickActionCardProps[] = [
    {
      href: "/gigs",
      icon: <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
      label: "Post a Gig",
      description: "Create a new opportunity for creatives",
      accentClass: "bg-gradient-to-r from-indigo-500 to-purple-500",
      iconBgClass: "bg-indigo-50 dark:bg-indigo-950/70",
    },
    {
      href: "/browse",
      icon: <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      label: "Find Talent",
      description: "Browse portfolios from Nairobi creatives",
      accentClass: "bg-gradient-to-r from-purple-500 to-pink-500",
      iconBgClass: "bg-purple-50 dark:bg-purple-950/70",
    },
    {
      href: "/settings",
      icon: <Settings2 className="h-4 w-4 text-pink-600 dark:text-pink-400" />,
      label: "Edit Profile",
      description: "Update your business information",
      accentClass: "bg-gradient-to-r from-pink-500 to-rose-500",
      iconBgClass: "bg-pink-50 dark:bg-pink-950/70",
    },
    {
      href: "/messages",
      icon: <MessageSquare className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      label: "Messages",
      description: "Check your latest conversations",
      accentClass: "bg-gradient-to-r from-sky-500 to-cyan-500",
      iconBgClass: "bg-sky-50 dark:bg-sky-950/70",
    },
  ];

  const quickActions = isStudent ? studentActions : clientActions;

  const iconMap: Record<string, { icon: React.ReactNode; bg: string }> = {
    new_message: {
      icon: <MessageSquare className="h-3.5 w-3.5" />,
      bg: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
    },
    gig_application: {
      icon: <Briefcase className="h-3.5 w-3.5" />,
      bg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
    },
    application_accepted: {
      icon: <UserCheck className="h-3.5 w-3.5" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
    },
    application_rejected: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      bg: "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400",
    },
    profile_view: {
      icon: <Eye className="h-3.5 w-3.5" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
    },
  };

  return (
    <DashboardShell>
      <div className="space-y-8">

        {/* ── Hero Welcome Banner ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-700 dark:via-indigo-800 dark:to-purple-900 p-6 sm:p-8 shadow-lg shadow-indigo-200/40 dark:shadow-indigo-900/40">
          {/* Background image layer */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={
                isStudent
                  ? "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=400&fit=crop"
                  : "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop"
              }
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-10"
            />
          </div>
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute top-4 right-32 h-24 w-24 rounded-full bg-purple-500/20" />
            {/* Subtle dot grid */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">
                  {getGreeting()}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-white/10 border border-white/15 rounded-full px-2 py-0.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  v1.0.0 Beta
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                {profile.name || "Creative"}
              </h1>
              <p className="text-indigo-200/80 text-sm mt-1.5 leading-relaxed max-w-md">
                {isStudent
                  ? "Your portfolio is live. Keep building — every piece you add gets you closer to your next gig."
                  : "Browse top Nairobi creatives and post gigs to find the perfect talent for your project."}
              </p>
            </div>

            {isStudent && (
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={copyProfileLink}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <Link
                  href={`/${profile.username?.trim() || profile.user_username}`}
                  target="_blank"
                >
                  <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-sm cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Portfolio
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            label="Profile Views"
            value={stats.profileViews}
            trend={stats.profileViews > 0 ? "+12% this week" : undefined}
            trendPositive
            accentClass="bg-gradient-to-r from-indigo-500 to-indigo-600"
            iconBgClass="bg-indigo-50 dark:bg-indigo-950/70"
            delay="animation-delay-200"
          />
          <StatCard
            icon={<MousePointer2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            label="Link Clicks"
            value={stats.linkClicks}
            trend={stats.linkClicks > 0 ? "+5% this week" : undefined}
            trendPositive
            accentClass="bg-gradient-to-r from-purple-500 to-purple-600"
            iconBgClass="bg-purple-50 dark:bg-purple-950/70"
            delay="animation-delay-400"
          />
          <StatCard
            icon={<FileText className="h-5 w-5 text-pink-600 dark:text-pink-400" />}
            label={isStudent ? "Work Samples" : "Talent Saved"}
            value={stats.totalSamples}
            accentClass="bg-gradient-to-r from-pink-500 to-rose-500"
            iconBgClass="bg-pink-50 dark:bg-pink-950/70"
            delay="animation-delay-600"
          />
          <StatCard
            icon={<Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            label="Active Gigs"
            value={stats.activeGigs}
            accentClass="bg-gradient-to-r from-amber-400 to-amber-500"
            iconBgClass="bg-amber-50 dark:bg-amber-950/70"
          />
        </div>

        {/* ── Main Content: 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Quick Actions — wider column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Quick Actions
              </h2>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Jump right in</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.href} {...action} />
              ))}
            </div>

            {/* Profile completeness nudge */}
            <div className="mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    Profile Completeness
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    A complete profile gets 3x more views
                  </p>
                </div>
                {(() => {
                  const checks = [
                    !!(profile.avatar_url || profile.avatar),
                    stats.totalSamples > 0,
                    !!(profile.bio),
                    !!(profile.skills && profile.skills.length > 0),
                  ];
                  const done = checks.filter(Boolean).length;
                  const pct = Math.round((done / checks.length) * 100);
                  return (
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                  );
                })()}
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                {(() => {
                  const checks = [
                    !!(profile.avatar_url || profile.avatar),
                    stats.totalSamples > 0,
                    !!(profile.bio),
                    !!(profile.skills && profile.skills.length > 0),
                  ];
                  const done = checks.filter(Boolean).length;
                  const pct = Math.round((done / checks.length) * 100);
                  return (
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  );
                })()}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { label: "Photo", done: !!(profile.avatar_url || profile.avatar) },
                  { label: "Work Samples", done: stats.totalSamples > 0 },
                  { label: "Bio", done: !!(profile.bio) },
                  { label: "Skills", done: !!(profile.skills && profile.skills.length > 0) },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-indigo-100 dark:bg-indigo-950/80" : "bg-gray-100 dark:bg-gray-800"}`}>
                      {done
                        ? <Check className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
                        : <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                      }
                    </div>
                    <span className={`text-[10px] font-medium ${done ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity — narrower column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Recent Activity
              </h2>
              <Link href="/analytics" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                See all
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="relative mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/60">
                      <Bell className="h-7 w-7 text-indigo-400 dark:text-indigo-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    All caught up
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-[180px]">
                    Activity from profile views, gig applications, and messages will show here.
                  </p>
                  <Link href={isStudent ? "/portfolio" : "/browse"} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    {isStudent ? "Add work to get noticed" : "Browse talent"}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentActivity.map((item: any, idx: number) => {
                    const style = iconMap[item.notification_type] || iconMap.profile_view;
                    const timeAgo = getTimeAgo(item.created_at);

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors duration-150"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className={`h-8 w-8 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          {style.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-snug truncate">
                            {item.title}
                          </p>
                          {item.message && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-1">
                              {item.message}
                            </p>
                          )}
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 tabular-nums">
                          {timeAgo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
