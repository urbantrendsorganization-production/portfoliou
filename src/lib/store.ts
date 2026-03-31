import { create } from "zustand";
import type { Profile } from "@/types/database";

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "message" | "info" | "success";
  timestamp: number;
}

interface AppState {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Messaging
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;

  // Notifications
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;

  // Toast notifications
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, "id" | "timestamp">) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),

  unreadMessageCount: 0,
  setUnreadMessageCount: (unreadMessageCount) => set({ unreadMessageCount }),

  unreadNotificationCount: 0,
  setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: Math.random().toString(36).slice(2),
          timestamp: Date.now(),
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
