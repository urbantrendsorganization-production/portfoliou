"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, MousePointer2, FileText } from "lucide-react";

export default function AnalyticsPage() {
  const profile = useAppStore((s) => s.profile);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    totalSampleViews: 0,
  });

  useEffect(() => {
    if (!profile) return;

    async function loadAnalytics() {
      try {
        const analytics = await api.analytics.list();
        setData(analytics);
        
        setStats({
          totalViews: analytics.filter((e: any) => e.event_type === "profile_view").length,
          totalClicks: analytics.filter((e: any) => e.event_type === "link_click").length,
          totalSampleViews: analytics.filter((e: any) => e.event_type === "work_sample_view").length,
        });
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [profile]);

  // Group data by date for charts
  const chartData = data.reduce((acc: any[], curr: any) => {
    const date = new Date(curr.created_at).toLocaleDateString();
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing[curr.event_type] = (existing[curr.event_type] || 0) + 1;
      existing.total = (existing.total || 0) + 1;
    } else {
      acc.push({ date, [curr.event_type]: 1, total: 1 });
    }
    return acc;
  }, []).slice(-7); // Last 7 days

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your portfolio performance and audience engagement.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Profile Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalViews}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <MousePointer2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Link Clicks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalClicks}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Work Sample Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSampleViews}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-6">Views Over Time</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "currentColor" }} className="text-gray-500 dark:text-gray-400" />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "currentColor" }} className="text-gray-500 dark:text-gray-400" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profile_view" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#4f46e5' }} 
                    activeDot={{ r: 6 }}
                    name="Profile Views"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-6">Engagement by Day</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "currentColor" }} className="text-gray-500 dark:text-gray-400" />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "currentColor" }} className="text-gray-500 dark:text-gray-400" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                  />
                  <Bar 
                    dataKey="link_click" 
                    fill="#a855f7" 
                    radius={[4, 4, 0, 0]} 
                    name="Link Clicks"
                  />
                  <Bar 
                    dataKey="work_sample_view" 
                    fill="#ec4899" 
                    radius={[4, 4, 0, 0]} 
                    name="Sample Views"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
