import type { Metadata } from "next";
import { AuthProvider } from "@/components/layout/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PortfolioU - The Talent Marketplace for College Creatives",
  description:
    "Showcase your creative work, get discovered by top brands, and land your dream gig. The portfolio platform built for college students in beauty, web dev, graphic design, and fashion.",
  keywords: [
    "college portfolio",
    "creative marketplace",
    "student talent",
    "beauty",
    "web development",
    "graphic design",
    "fashion",
  ],
  openGraph: {
    title: "PortfolioU - The Talent Marketplace for College Creatives",
    description:
      "Showcase your creative work, get discovered, and get hired.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased scroll-smooth" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
