"use client";

import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Palette,
  Code,
  Scissors,
  Shirt,
  Eye,
  BarChart3,
  Zap,
  Shield,
  Star,
  CheckCircle,
  Users,
  Briefcase,
  Globe,
  Crown,
  LayoutDashboard,
} from "lucide-react";

const disciplines = [
  {
    name: "Beauty & Cosmetology",
    icon: Scissors,
    gradient: "from-pink-500 to-rose-500",
    description: "Hair, makeup, nails, skincare artistry",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
  },
  {
    name: "Web/App Development",
    icon: Code,
    gradient: "from-blue-500 to-cyan-500",
    description: "Websites, mobile apps, UI/UX, full-stack",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
  },
  {
    name: "Graphic Design",
    icon: Palette,
    gradient: "from-purple-500 to-violet-500",
    description: "Branding, illustration, motion, print",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
  },
  {
    name: "Fashion & Styling",
    icon: Shirt,
    gradient: "from-amber-500 to-orange-500",
    description: "Personal styling, fashion design, textiles",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  },
];

const features = [
  {
    icon: Globe,
    title: "Public Portfolio Page",
    description:
      "Get a beautiful, shareable portfolio page with your own unique URL. Optimized for SEO so clients can find you.",
  },
  {
    icon: Eye,
    title: "Discovery Feed",
    description:
      "Get featured in our browse feed. Clients filter by discipline, skills, and availability to find the perfect creative.",
  },
  {
    icon: Briefcase,
    title: "Gig Board",
    description:
      "Browse and apply to paid gigs posted by verified businesses. From one-off projects to ongoing collaborations.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track profile views, link clicks, and work sample engagement. Understand your audience and optimize your portfolio.",
  },
  {
    icon: Zap,
    title: "Instant Portfolio Cards",
    description:
      "Auto-generate beautiful portfolio cards for social media. Share your work across Instagram, LinkedIn, and Twitter.",
  },
  {
    icon: Shield,
    title: "Verified Businesses",
    description:
      "Premium clients get a verified badge so students know they are working with legitimate, vetted businesses.",
  },
];

const testimonials = [
  {
    name: "Aisha M.",
    role: "Cosmetology Student",
    school: "Howard University",
    quote:
      "PortfolioU helped me land 3 bridal makeup gigs in my first month. The portfolio page is gorgeous and my clients love it.",
    avatar: "AM",
  },
  {
    name: "Marcus T.",
    role: "Web Developer",
    school: "Morehouse College",
    quote:
      "I went from zero freelance work to being booked solid. The gig board is a game-changer for student developers.",
    avatar: "MT",
  },
  {
    name: "Luna K.",
    role: "Graphic Designer",
    school: "SCAD",
    quote:
      "Finally a platform that actually understands student creatives. My portfolio looks more professional than sites I paid hundreds for.",
    avatar: "LK",
  },
];

const stats = [
  { value: "10,000+", label: "Student Portfolios" },
  { value: "2,500+", label: "Gigs Posted" },
  { value: "500+", label: "Businesses" },
  { value: "95%", label: "Satisfaction Rate" },
];

export default function LandingPage() {
  const profile = useAppStore((s) => s.profile);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(profile);
  }, [profile]);

  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float animation-delay-400" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-indigo-200 backdrop-blur-sm mb-8">
              <Sparkles className="h-4 w-4" />
              The Talent Marketplace for College Creatives
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 animate-slide-up">
            Your Work Deserves
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              To Be Seen
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-200">
            Build a stunning portfolio, get discovered by top brands, and land
            paid gigs -- all while still in school. Made for students in beauty,
            web dev, graphic design, and fashion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                Go to Dashboard <LayoutDashboard className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                >
                  Create Your Portfolio <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 border border-white/20 backdrop-blur-sm"
                >
                  Log In
                </Link>
              </>
            )}
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 border border-white/20 backdrop-blur-sm"
            >
              Browse Talent
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in animation-delay-600">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Disciplines Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Creative Discipline
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you style hair, write code, design brands, or create
              fashion -- PortfolioU is your platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((d) => (
              <div
                key={d.name}
                className="group relative overflow-hidden rounded-2xl bg-gray-900 aspect-[4/5] cursor-pointer"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${d.gradient} mb-3`}
                  >
                    <d.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {d.name}
                  </h3>
                  <p className="text-sm text-gray-300">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Get Hired
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From building your portfolio to tracking analytics, PortfolioU
              gives you the tools to launch your creative career.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Launch Your Creative Career?
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of college creatives who are building their brands,
            landing gigs, and getting discovered on PortfolioU.
          </p>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Create Your Free Portfolio <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
