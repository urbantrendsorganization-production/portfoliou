import type { Metadata } from "next";
import { AuthProvider } from "@/components/layout/auth-provider";
import { WebSocketProvider } from "@/components/layout/ws-provider";
import { Navbar } from "@/components/layout/navbar";
import { ToastContainer } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "PortfolioU - The Talent Marketplace for College Creatives",
  description:
    "Showcase your creative work, get discovered by top brands, and land your dream gig.",
  keywords: [
    "college portfolio",
    "creative marketplace",
    "student talent",
  ],
  // Add the icons section here
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  openGraph: {
    title: "PortfolioU - The Talent Marketplace for College Creatives",
    description: "Showcase your creative work, get discovered, and get hired.",
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
          <WebSocketProvider>
            <Navbar />
            <ToastContainer />
            {children}
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
