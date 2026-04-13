"use client";

import { api } from "@/lib/api";
import { useEffect } from "react";

export function ViewTracker({ profileId }: { profileId: number }) {
  useEffect(() => {
    // Small delay to avoid tracking accidental refreshes or very short bounces
    const timer = setTimeout(() => {
      api.analytics.track({
        profile: profileId,
        event_type: "profile_view",
        metadata: {
          referrer: document.referrer,
          path: window.location.pathname,
        },
      }).catch(() => { /* analytics unavailable — silently ignore */ });
    }, 3000);

    return () => clearTimeout(timer);
  }, [profileId]);

  return null;
}
