import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="rounded-xl bg-gradient-to-br flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774943398/PortfolioU_1_bqx4cv.png"
                alt="Logo"
                className="w-10" // Adjust w-10 (2.5rem) to your preferred size
              />
            </div>
            {/* <span className="font-bold text-2xl text-gray-900">
              Portfolio<span className="text-blue-600">U</span>
            </span> */}
          </Link>
            <p className="text-sm leading-relaxed">
              The talent marketplace for college creatives. Showcase your work.
              Get discovered. Get hired.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="hover:text-white transition-colors">
                  Browse Talent
                </Link>
              </li>
              <li>
                <Link href="/gigs" className="hover:text-white transition-colors">
                  Gig Board
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Create Portfolio
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">
              Disciplines
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Beauty & Cosmetology</li>
              <li>Web/App Development</li>
              <li>Graphic Design</li>
              <li>Fashion & Styling</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} PortfolioU by UrbanTrends. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
