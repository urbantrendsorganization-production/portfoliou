import { type LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  hint?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  hint,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon container with layered rings for depth */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/60 dark:to-purple-950/60 scale-125 opacity-50 blur-sm" />
        <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shadow-sm">
          <Icon className="h-9 w-9 text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>

      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-1">
        {description}
      </p>
      {hint && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed mb-5 mt-0.5">
          {hint}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
