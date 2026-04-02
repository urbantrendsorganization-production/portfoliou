"use client";

import { useAppStore } from "@/lib/store";
import { X, MessageSquare, Bell, CheckCircle } from "lucide-react";
import { useEffect } from "react";

const iconMap = {
  message: MessageSquare,
  info: Bell,
  success: CheckCircle,
};

const bgMap = {
  message:
    "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800",
  info:
    "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  success:
    "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
};

const iconColorMap = {
  message: "text-indigo-600 dark:text-indigo-400",
  info: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
};

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => removeToast(t.id), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-5 fade-in duration-300 ${bgMap[toast.type]}`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColorMap[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {toast.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
