"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/helpers";
import {
  Users,
  GraduationCap,
  Building2,
  Briefcase,
  Crown,
  Image,
  CreditCard,
  MessageSquare,
  Activity,
  Loader2,
} from "lucide-react";

interface AdminStats {
  total_users: number;
  students: number;
  clients: number;
  total_gigs: number;
  active_gigs: number;
  total_applications: number;
  premium_users: number;
  total_work_samples: number;
  active_subscriptions: number;
  total_messages: number;
}

interface ActivityItem {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  profile_name: string;
  profile_username: string;
}

const notificationTypeLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" }> = {
  new_message: { label: "Message", variant: "default" },
  gig_application: { label: "Application", variant: "warning" },
  application_accepted: { label: "Accepted", variant: "success" },
  application_rejected: { label: "Rejected", variant: "danger" },
  profile_view: { label: "View", variant: "default" },
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, activityData] = await Promise.all([
          api.admin.stats(),
          api.admin.activity(),
        ]);
        setStats(statsData);
        setActivity(Array.isArray(activityData) ? activityData : []);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Students", value: stats.students, icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
        { label: "Clients", value: stats.clients, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Active Gigs", value: stats.active_gigs, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Premium Users", value: stats.premium_users, icon: Crown, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Work Samples", value: stats.total_work_samples, icon: Image, color: "text-pink-600", bg: "bg-pink-50" },
        { label: "Subscriptions", value: stats.active_subscriptions, icon: CreditCard, color: "text-teal-600", bg: "bg-teal-50" },
        { label: "Messages", value: stats.total_messages, icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Platform statistics and recent activity at a glance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="flex items-center gap-4">
            <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${card.bg} dark:opacity-80`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick stats row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Gigs</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total_gigs}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.active_gigs} currently open
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Applications</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total_applications}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Across all gigs
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Premium Conversion</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total_users > 0
                ? ((stats.premium_users / stats.total_users) * 100).toFixed(1)
                : "0"}
              %
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.premium_users} of {stats.total_users} users
            </p>
          </Card>
        </div>
      )}

      {/* Recent activity */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Latest notifications across all users</p>
        </div>

        {activity.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No recent activity to display.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {activity.slice(0, 20).map((item) => {
              const typeInfo = notificationTypeLabels[item.notification_type] || {
                label: item.notification_type,
                variant: "default" as const,
              };
              return (
                <div key={item.id} className="px-6 py-3.5 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.title}
                      </span>
                      <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                    </div>
                    {item.message && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.message}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {item.profile_name || item.profile_username} &middot; {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
