"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { cn } from "@/utils/helpers";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Image,
  ArrowLeft,
  Shield,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/gigs", label: "Gigs", icon: Briefcase },
  { href: "/admin/content", label: "Content", icon: Image },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isLoading } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!profile || !profile.is_staff)) {
      router.replace("/dashboard");
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile || !profile.is_staff) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">PortfolioU</p>
          </div>
          <button
            className="ml-auto lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to app */}
        <div className="px-3 py-4 border-t border-gray-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Admin Panel</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
