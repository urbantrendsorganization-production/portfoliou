"use client";

import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setProfile = useAppStore((s) => s.setProfile);
  const setIsLoading = useAppStore((s) => s.setIsLoading);

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        );
        const profile = await Promise.race([api.auth.me(), timeout]);
        setProfile(profile);
      } catch (err: any) {
        // Network error or timeout — backend may be unreachable; keep the
        // token so the user stays "logged in" if they refresh once it's back.
        // Only log unexpected errors (not network failures).
        if (err?.message !== 'timeout' && err?.message !== 'Failed to fetch') {
          console.warn("Session check failed:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const handleLogout = () => {
      setProfile(null);
      setIsLoading(false);
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [setProfile, setIsLoading]);

  return <>{children}</>;
}
