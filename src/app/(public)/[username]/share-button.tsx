"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

export function ShareProfileButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this portfolio on PortfolioU",
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button variant="outline" className="flex-1" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" /> Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" /> Share
        </>
      )}
    </Button>
  );
}
