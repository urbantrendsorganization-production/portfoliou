import type { Metadata } from "next";
import { AuthProvider } from "@/components/layout/auth-provider";
import { WebSocketProvider } from "@/components/layout/ws-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased scroll-smooth transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Navbar />
              <ToastContainer />
              {children}
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
