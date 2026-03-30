"use client";

import { cn } from "@/utils/helpers";
import { useAppStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex min-h-screen bg-gray-50 pt-16">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 fixed top-16 bottom-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex-1 py-4">
          {/* Profile summary */}
          {!collapsed && profile && (
            <div className="px-4 pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile.avatar_url || profile.avatar}
                  name={profile.name}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile.name || "Set up profile"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {profile.role}
                    </Badge>
                    {profile.is_premium && (
                      <Badge variant="premium">
                        <Crown className="h-3 w-3 mr-1" /> Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-3 border-t border-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
