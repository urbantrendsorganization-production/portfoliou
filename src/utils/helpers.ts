import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDisciplineColor(discipline: string): string {
  const colors: Record<string, string> = {
    "Beauty & Cosmetology": "bg-pink-100 text-pink-800",
    "Web/App Development": "bg-blue-100 text-blue-800",
    "Graphic Design": "bg-purple-100 text-purple-800",
    "Fashion & Styling": "bg-amber-100 text-amber-800",
  };
  return colors[discipline] || "bg-gray-100 text-gray-800";
}

export function getDisciplineGradient(discipline: string): string {
  const gradients: Record<string, string> = {
    "Beauty & Cosmetology": "from-pink-500 to-rose-500",
    "Web/App Development": "from-blue-500 to-cyan-500",
    "Graphic Design": "from-purple-500 to-violet-500",
    "Fashion & Styling": "from-amber-500 to-orange-500",
  };
  return gradients[discipline] || "from-indigo-500 to-purple-500";
}
