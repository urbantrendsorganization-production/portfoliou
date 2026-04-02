"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  text = "signin_with",
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    // Check if script is already loaded
    if (window.google?.accounts) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError?.("Failed to load Google Sign-In");
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on cleanup — it may be needed by other components
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !GOOGLE_CLIENT_ID) return;

    try {
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError?.("Google sign-in failed");
          }
        },
      });

      window.google!.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text,
        width: "100%",
        logo_alignment: "left",
      });
    } catch (err) {
      onError?.("Failed to initialize Google Sign-In");
    }
  }, [scriptLoaded, onSuccess, onError, text]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full flex justify-center" />
    </div>
  );
}
