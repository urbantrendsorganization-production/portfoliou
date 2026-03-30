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
        const profile = await api.auth.me();
        setProfile(profile);
      } catch (err) {
        console.error("Session check error:", err);
        // Error here means token might be totally invalid or backend is down
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
