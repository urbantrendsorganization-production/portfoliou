import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Terms of Service | PortfolioU",
  description: "The terms and conditions that govern your use of PortfolioU.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By creating an account or using PortfolioU you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the platform. We reserve the right to update these terms; continued use after changes are posted constitutes acceptance.",
  },
  {
    title: "2. Eligibility",
    content:
      "You must be at least 16 years old to use PortfolioU. By registering you represent that you meet this requirement. Students should be enrolled in, or recent graduates of, an accredited college, university, or vocational institution. Clients must represent a legitimate business or organisation.",
  },
  {
    title: "3. Accounts",
    content:
      "You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. You may not share your account with others or create accounts on behalf of third parties without their consent. Notify us immediately at hello@portfoliou.urbantrends.dev if you suspect unauthorised use of your account.",
  },
  {
    title: "4. Student Profiles and Intellectual Property",
    content:
      "You retain ownership of all work samples, images, and content you upload to your portfolio. By uploading content you grant PortfolioU a non-exclusive, royalty-free licence to display and reproduce your content solely for the purpose of operating the platform (e.g., showing your portfolio to visitors). We will never sell or sublicence your work. You warrant that you own the rights to everything you upload and that it does not infringe any third-party rights.",
  },
  {
    title: "5. Gig Board — Student Obligations",
    content:
      "When you apply for a gig you agree to: (a) complete the work professionally and on time if accepted; (b) communicate promptly with the client; (c) not apply for gigs you do not have the skills to fulfil. PortfolioU is a marketplace that connects students with clients. We are not a party to any gig agreement and are not responsible for disputes between students and clients.",
  },
  {
    title: "6. Gig Board — Client Obligations",
    content:
      "Clients who post gigs agree to: (a) post only legitimate, paid opportunities; (b) not post unpaid internship-style work disguised as gigs; (c) pay students promptly upon delivery of agreed work; (d) not use the platform to poach student contact details for unsolicited marketing. PortfolioU reserves the right to remove gigs that violate these rules without notice.",
  },
  {
    title: "7. Payments",
    content:
      "Premium subscriptions (Student Premium and Client Premium) are billed through Stripe. Subscription fees are non-refundable except where required by applicable law. You may cancel your subscription at any time through Settings; your access will continue until the end of the current billing period. PortfolioU does not currently process payments between students and clients — gig payments are handled directly between the parties.",
  },
  {
    title: "8. Prohibited Conduct",
    content:
      "You agree not to: (a) post false, misleading, or defamatory content; (b) harass or abuse other users; (c) scrape, crawl, or systematically extract data from the platform without written permission; (d) attempt to gain unauthorised access to other accounts or backend systems; (e) use the platform to distribute spam or malware; (f) post content that is illegal, obscene, or violates the rights of others.",
  },
  {
    title: "9. Platform Availability",
    content:
      "We strive to keep PortfolioU available 24/7 but we do not guarantee uninterrupted access. We may perform maintenance, updates, or experience downtime outside our control. We are not liable for any loss arising from unavailability of the platform.",
  },
  {
    title: "10. Disclaimer of Warranties",
    content:
      "PortfolioU is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not guarantee that students will secure employment or that clients will find suitable candidates. Results depend on the quality of your profile, the market, and factors outside our control.",
  },
  {
    title: "11. Limitation of Liability",
    content:
      "To the maximum extent permitted by law, PortfolioU and UrbanTrends shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including loss of earnings, loss of data, or loss of business opportunity.",
  },
  {
    title: "12. Termination",
    content:
      "We reserve the right to suspend or terminate your account at any time if we determine, in our sole discretion, that you have violated these Terms. You may delete your account at any time from Settings. Upon termination, your public portfolio and data will be removed in accordance with our Privacy Policy.",
  },
  {
    title: "13. Governing Law",
    content:
      "These Terms are governed by the laws of Kenya. Any disputes arising from your use of PortfolioU shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.",
  },
  {
    title: "14. Contact",
    content:
      "For any questions about these Terms, please contact us at hello@portfoliou.urbantrends.dev.",
  },
];

export default function TermsPage() {
  return (
    <>
      <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated: April 2026
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              These Terms of Service govern your use of PortfolioU, a product of
              UrbanTrends. Please read them carefully before using our platform.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                {section.title}
              </h2>
              <p
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/privacy"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Privacy Policy →
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
