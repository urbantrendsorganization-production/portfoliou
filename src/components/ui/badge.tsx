import { cn } from "@/utils/helpers";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "premium";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  secondary:
    "bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-600",
  success:
    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  warning:
    "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
  danger:
    "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  premium:
    "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
