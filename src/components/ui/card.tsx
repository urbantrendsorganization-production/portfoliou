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
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        hover && "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
