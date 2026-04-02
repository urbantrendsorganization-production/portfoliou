"use client";

import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/layout/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Briefcase,
  Search,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function NavUnreadBadge() {
  const count = useAppStore((s) => s.unreadMessageCount);
  if (count === 0) return null;
  return (
    <span className="h-5 min-w-[20px] flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1.5">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profile = useAppStore((s) => s.profile);
  const isLoading = useAppStore((s) => s.isLoading);
  const setProfile = useAppStore((s) => s.setProfile);
  const setIsLoading = useAppStore((s) => s.setIsLoading);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Determine which logo to show
  // If we are on the landing page and NOT scrolled, we usually want the dark-mode (white) logo 
  // because the background is typically dark/transparent.
  const isLanding = pathname === "/";
  const navbarScrolled = scrolled || !isLanding;

  const logoSrc = (theme === "dark" || (!navbarScrolled && isLanding))
    ? "https://res.cloudinary.com/dvifkm1ex/image/upload/v1775138239/PortfolioU_2_cpgk61.png" // White Logo
    : "https://res.cloudinary.com/dvifkm1ex/image/upload/v1774940835/PortfolioU_apih3l.png"; // Dark Logo

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setIsLoading(true);
    api.auth.logout();
    setIsLoading(false);
    router.push("/");
    router.refresh();
  }

  const ThemeToggle = ({ onDark }: { onDark?: boolean }) => (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "flex items-center justify-center h-8 w-8 rounded-lg transition-colors cursor-pointer",
        onDark
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );

  const renderAuthButtons = (isMobile = false) => {
    if (isLoading)
      return <div className="w-20 h-8 bg-gray-100/10 animate-pulse rounded-lg" />;

    if (profile) {
      if (isMobile) {
        return (
          <>
            <Link
              href="/dashboard"
              className="block text-gray-700 dark:text-gray-300 font-medium py-2"
            >
              Dashboard
            </Link>
            <Link
              href="/portfolio"
              className="block text-gray-700 dark:text-gray-300 font-medium py-2"
            >
              My Portfolio
            </Link>
            <Link
              href="/settings"
              className="block text-gray-700 dark:text-gray-300 font-medium py-2"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block text-red-600 dark:text-red-400 font-medium py-2 w-full text-left cursor-pointer"
            >
              Sign Out
            </button>
          </>
        );
      }

      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Avatar
              src={profile.avatar_url || profile.avatar}
              name={profile.name}
              size="sm"
            />
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-colors",
                navbarScrolled
                  ? "text-gray-600 dark:text-gray-400"
                  : "text-white/80"
              )}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-black/40 border border-gray-200 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {profile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {profile.role}
                  {profile.is_premium && " Premium"}
                </p>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <User className="h-4 w-4" /> My Portfolio
              </Link>
              <Link
                href="/messages"
                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Messages
                </span>
                <NavUnreadBadge />
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <hr className="my-1 border-gray-100 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 w-full cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="flex gap-3 pt-2">
          <Link href="/login" className="flex-1">
            <Button variant="outline" fullWidth>
              Log In
            </Button>
          </Link>
          <Link href="/signup" className="flex-1">
            <Button fullWidth>Get Started</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button
            variant={navbarScrolled ? "ghost" : "secondary"}
            size="sm"
          >
            Log In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">Get Started</Button>
        </Link>
      </div>
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        navbarScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={logoSrc}
              alt="PortfolioU Logo"
              className="w-38 h-auto transition-opacity duration-300"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/browse"
              className={cn(
                "text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                navbarScrolled ? "text-gray-600 dark:text-gray-300" : "text-white/80"
              )}
            >
              <span className="flex items-center gap-1">
                <Search className="h-4 w-4" /> Browse
              </span>
            </Link>
            <Link
              href="/gigs"
              className={cn(
                "text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                navbarScrolled ? "text-gray-600 dark:text-gray-300" : "text-white/80"
              )}
            >
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> Gigs
              </span>
            </Link>

            <ThemeToggle onDark={!navbarScrolled} />
            {renderAuthButtons(false)}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle onDark={!navbarScrolled} />
            <button
              className="cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X
                  className={cn(
                    "h-6 w-6",
                    navbarScrolled ? "text-gray-900 dark:text-gray-100" : "text-white"
                  )}
                />
              ) : (
                <Menu
                  className={cn(
                    "h-6 w-6",
                    navbarScrolled ? "text-gray-900 dark:text-gray-100" : "text-white"
                  )}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/browse"
              className="block text-gray-700 dark:text-gray-300 font-medium py-2"
            >
              Browse Talent
            </Link>
            <Link
              href="/gigs"
              className="block text-gray-700 dark:text-gray-300 font-medium py-2"
            >
              Gig Board
            </Link>
            {renderAuthButtons(true)}
          </div>
        </div>
      )}
    </nav>
  );
}