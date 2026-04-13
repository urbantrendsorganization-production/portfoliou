"use client";

import { cn } from "@/utils/helpers";
import { useAppStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function UnreadBadge() {
  const count = useAppStore((s) => s.unreadMessageCount);
  if (count === 0) return null;
  return (
    <span className="h-5 min-w-[20px] flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1.5 shadow-sm shadow-indigo-300 dark:shadow-indigo-900">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function UnreadBadgeDot() {
  const count = useAppStore((s) => s.unreadMessageCount);
  if (count === 0) return null;
  return (
    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
  );
}

import {
  LayoutDashboard,
  Palette,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const studentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Palette },
  { href: "/gigs", label: "Gig Board", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const clientNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/browse", label: "Browse Talent", icon: Palette },
  { href: "/gigs", label: "My Gigs", icon: Briefcase },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const profile = useAppStore((s) => s.profile);

  const navItems = profile?.role === "client" ? clientNav : studentNav;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/95 transition-all duration-300 fixed top-16 bottom-0",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Subtle top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="flex-1 py-5 overflow-y-auto overflow-x-hidden">
          {/* Profile summary */}
          {!collapsed && profile && (
            <div className="px-4 pb-5 mb-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={profile.avatar_url || profile.avatar}
                    name={profile.name}
                    size="md"
                  />
                  {profile.is_premium && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                    {profile.name || "Set up profile"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-[10px] capitalize px-2 py-0">
                      {profile.role}
                    </Badge>
                    {profile.is_premium && (
                      <Badge variant="premium" className="text-[10px] px-2 py-0">
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Pro
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed avatar */}
          {collapsed && profile && (
            <div className="flex justify-center pb-4 mb-2">
              <Avatar
                src={profile.avatar_url || profile.avatar}
                name={profile.name}
                size="sm"
              />
            </div>
          )}

          {/* Nav label */}
          {!collapsed && (
            <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Navigation
            </p>
          )}

          <nav className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isMessages = item.href === "/messages";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-indigo-950"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4.5 w-4.5 flex-shrink-0 transition-colors duration-200",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )}
                  />
                  {!collapsed && (
                    <span className="flex-1 flex items-center justify-between">
                      {item.label}
                      {isMessages && <UnreadBadge />}
                    </span>
                  )}
                  {collapsed && isMessages && <UnreadBadgeDot />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Upgrade nudge for non-premium */}
        {!collapsed && profile && !profile.is_premium && (
          <div className="px-3 pb-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-100 dark:border-indigo-900/60 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="h-3 w-3 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Go Premium</p>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2.5 leading-relaxed">
                Unlock priority gig access and featured placement.
              </p>
              <Link href="/settings#premium">
                <button className="w-full text-[11px] font-semibold py-1.5 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-sm shadow-indigo-200 dark:shadow-indigo-900">
                  Upgrade Now
                </button>
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-3 border-t border-gray-200/80 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-200 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        )}
      >
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
