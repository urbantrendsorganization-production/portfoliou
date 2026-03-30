import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Pu</span>
              </div>
              <span className="font-bold text-xl text-white">
                Portfolio<span className="text-indigo-400">U</span>
              </span>
            </div>
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
                <Link href="#" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
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
