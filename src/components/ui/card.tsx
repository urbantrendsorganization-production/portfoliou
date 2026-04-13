import { cn } from "@/utils/helpers";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({
  children,
  className,
  hover = false,
  padding = true,
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm",
        hover &&
          "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
