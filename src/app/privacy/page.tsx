import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Privacy Policy | PortfolioU",
  description: "How PortfolioU collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create a PortfolioU account we collect your name, email address, password (hashed), role (student or client), and institution/company name.",
      },
      {
        subtitle: "Profile Data",
        text: "Students may voluntarily provide a profile photo, cover image, biography, discipline, school, location, skills, and links to social media or external portfolios.",
      },
      {
        subtitle: "Work Samples",
        text: "Images, videos, and links you upload as part of your portfolio are stored on our servers and may be publicly visible depending on your privacy settings.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you use the platform: pages visited, features used, profile view counts, and interactions with gig listings.",
      },
      {
        subtitle: "Cookies",
        text: "We use essential cookies to maintain your login session. We do not currently use third-party advertising cookies.",
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "To Provide the Service",
        text: "We use your data to operate your account, display your public portfolio, match you with gig opportunities, and enable messaging between students and clients.",
      },
      {
        subtitle: "Analytics",
        text: "Profile view data and engagement metrics are surfaced back to you through your analytics dashboard so you can understand how your portfolio is performing.",
      },
      {
        subtitle: "Communications",
        text: "We may send you email notifications about applications, messages, or important platform updates. You can opt out of non-essential emails in your settings.",
      },
      {
        subtitle: "Platform Improvement",
        text: "Aggregated, anonymised usage data helps us improve features and fix bugs. We do not sell individual user data.",
      },
    ],
  },
  {
    title: "3. Public Portfolio Data",
    content: [
      {
        subtitle: "What Is Public",
        text: "Student profile pages (at portfoliou.urbantrends.dev/[username]) are publicly accessible by default. This includes your name, discipline, bio, work samples, and skills. This is by design — portfolio discoverability is the core value of the platform.",
      },
      {
        subtitle: "What Is Private",
        text: "Your email address, password, direct messages, application messages, and payment information are never publicly visible.",
      },
    ],
  },
  {
    title: "4. Data Sharing",
    content: [
      {
        subtitle: "With Clients",
        text: "When you apply for a gig, your profile information and application message are shared with the relevant client. Client business names and posted gigs are visible to all users.",
      },
      {
        subtitle: "Third-Party Services",
        text: "We use Stripe for payment processing, Google for OAuth sign-in, and Cloudinary for media storage. Each provider has their own privacy policy. We do not sell your data to third parties.",
      },
      {
        subtitle: "Legal Compliance",
        text: "We may disclose data if required to do so by law or in response to valid requests by public authorities.",
      },
    ],
  },
  {
    title: "5. Data Retention",
    content: [
      {
        subtitle: "Active Accounts",
        text: "We retain your data for as long as your account is active.",
      },
      {
        subtitle: "Account Deletion",
        text: "You can delete your account at any time from Settings > Delete Account. Upon deletion, your public profile, work samples, and messages will be permanently removed within 30 days.",
      },
    ],
  },
  {
    title: "6. Your Rights",
    content: [
      {
        subtitle: "Access & Correction",
        text: "You can view and edit all your profile data directly in the app from your Portfolio and Settings pages.",
      },
      {
        subtitle: "Deletion",
        text: "You may request deletion of your account and all associated data by using the in-app deletion tool or emailing hello@portfoliou.urbantrends.dev.",
      },
      {
        subtitle: "Data Export",
        text: "To request a copy of your data, contact us at hello@portfoliou.urbantrends.dev.",
      },
    ],
  },
  {
    title: "7. Security",
    content: [
      {
        subtitle: "Measures",
        text: "Passwords are hashed using industry-standard algorithms. Data is transmitted over HTTPS. Access tokens expire and are refreshed automatically.",
      },
      {
        subtitle: "Responsibility",
        text: "You are responsible for keeping your login credentials secure. Please use a unique password and do not share your account.",
      },
    ],
  },
  {
    title: "8. Children",
    content: [
      {
        subtitle: "Age Requirement",
        text: "PortfolioU is intended for users who are 16 years of age or older. If you believe a minor has created an account, please contact us so we can remove it.",
      },
    ],
  },
  {
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: "Updates",
        text: "We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by email or via an in-app banner. Continued use of the platform after changes take effect constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    title: "10. Contact",
    content: [
      {
        subtitle: "Questions",
        text: "If you have any questions about this Privacy Policy, please contact us at hello@portfoliou.urbantrends.dev.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated: April 2026
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              This Privacy Policy explains how PortfolioU (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, or &ldquo;our&rdquo;) — a product of UrbanTrends
              — collects, uses, and protects information about you when you use
              our platform at portfoliou.urbantrends.dev.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.content.map((item) => (
                  <div key={item.subtitle}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1">
                      {item.subtitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/terms"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Terms of Service →
            </Link>
            <Link
              href="/contact"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
