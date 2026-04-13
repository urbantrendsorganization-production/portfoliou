import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Target, Users, Zap, Heart } from "lucide-react";

const team = [
  {
    name: "Edwin Muchemi",
    role: "Founder & CEO",
    bio: "Building the bridge between college talent and the creative industry.",
  },
];

const values = [
  {
    icon: Target,
    title: "Students First",
    description:
      "Every feature we build is designed to help students stand out, get noticed, and land their first real opportunity.",
  },
  {
    icon: Zap,
    title: "Show, Don't Tell",
    description:
      "Portfolios beat CVs. We give every student the tools to let their actual work do the talking.",
  },
  {
    icon: Users,
    title: "Verified Connections",
    description:
      "We vet the businesses that post gigs so students know they are working with real, legitimate clients.",
  },
  {
    icon: Heart,
    title: "Built for Africa",
    description:
      "Starting in Nairobi, built for African college creatives — with local context, local currency, and a global vision.",
  },
];

export default function AboutPage() {
  return (
    <>
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-950 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-indigo-200 mb-8">
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Giving College Creatives{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Their Moment
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              PortfolioU is a talent marketplace built specifically for college
              students in creative disciplines — beauty, web development, graphic
              design, and fashion — to showcase their work, get discovered by top
              brands, and land paid gigs while still in school.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  The Problem We're Solving
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Talented students graduate every year with skills that
                  businesses desperately need — but with no visibility and no
                  way to prove what they can do. A CV with "graphic design" in
                  the skills section tells a client nothing.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Meanwhile, small businesses struggle to find affordable,
                  talented creatives locally. They end up hiring expensive
                  agencies or settling for mediocre work. PortfolioU closes that
                  gap.
                </p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900">
                <blockquote className="text-xl font-medium text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  &ldquo;The goal is simple: every student who graduates with a
                  creative skill should have a portfolio that gets them hired
                  before they even leave campus.&rdquo;
                </blockquote>
                <p className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                  — Edwin Muchemi, Founder
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                What We Stand For
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mb-4">
                    <v.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {v.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Join?
            </h2>
            <p className="text-indigo-100 mb-8">
              PortfolioU is launching in Nairobi in 2026. Be among the first
              100 creatives to claim your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-all"
              >
                Create Your Portfolio <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
