"use client";

import { useAppStore } from "@/lib/store";
import { wsClient } from "@/lib/websocket";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const profile = useAppStore((s) => s.profile);
  const setUnreadMessageCount = useAppStore((s) => s.setUnreadMessageCount);
  const addToast = useAppStore((s) => s.addToast);
  const pathname = usePathname();

  useEffect(() => {
    if (!profile) {
      wsClient.disconnect();
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Connect WebSocket
    wsClient.connect(token);

    // Fetch initial unread count via REST (in case WS takes a moment)
    api.messages.unreadCount().then((data) => {
      setUnreadMessageCount(data.count);
    }).catch(() => {});

    // Listen for unread count updates from WS
    const offUnread = wsClient.on("unread_count", (data) => {
      setUnreadMessageCount(data.count);
    });

    // Listen for new messages and show toast (unless on messages page)
    const offMessage = wsClient.on("new_message", (data) => {
      const msg = data.message;
      // Only toast if the message is from someone else
      if (msg.sender !== profile.id) {
        // Don't toast if user is already on the messages page
        const isOnMessages = window.location.pathname === "/messages";
        if (!isOnMessages) {
          addToast({
            title: msg.sender_name || "New Message",
            message: msg.content.length > 80
              ? msg.content.slice(0, 80) + "..."
              : msg.content,
            type: "message",
          });
        }
      }
    });

    // Listen for notifications
    const offNotification = wsClient.on("notification", (data) => {
      const n = data.notification;
      addToast({
        title: n.title,
        message: n.message,
        type: "info",
      });
    });

    return () => {
      offUnread();
      offMessage();
      offNotification();
      wsClient.disconnect();
    };
  }, [profile, setUnreadMessageCount, addToast]);

  return <>{children}</>;
}
