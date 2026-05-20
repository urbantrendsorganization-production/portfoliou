"use client";

import { Footer } from "@/components/layout/footer";
import { useAppStore } from "@/lib/store";
import { PLANS } from "@/utils/constants";
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
  ChevronDown,
  ChevronUp,
  Upload,
  Search,
  MessageSquare,
  Award,
  Heart,
} from "lucide-react";

const disciplines = [
  {
    name: "Beauty & Cosmetology",
    icon: Scissors,
    gradient: "from-pink-500 to-rose-500",
    description: "Hair, makeup, nails, skincare artistry",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop",
  },
  {
    name: "Web/App Development",
    icon: Code,
    gradient: "from-blue-500 to-cyan-500",
    description: "Websites, mobile apps, UI/UX, full-stack",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=500&fit=crop",
  },
  {
    name: "Graphic Design",
    icon: Palette,
    gradient: "from-purple-500 to-violet-500",
    description: "Branding, illustration, motion, print",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=500&fit=crop",
  },
  {
    name: "Fashion & Styling",
    icon: Shirt,
    gradient: "from-amber-500 to-orange-500",
    description: "Personal styling, fashion design, textiles",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=500&fit=crop",
  },
];

const creatorSteps = [
  {
    number: "01",
    icon: Upload,
    title: "Build Your Portfolio",
    description: "Upload images, videos, and links of your best work. Your public portfolio is live in minutes with a shareable URL.",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
    color: "from-indigo-500 to-purple-500",
  },
  {
    number: "02",
    icon: Eye,
    title: "Get Discovered",
    description: "Verified businesses browse our discovery feed filtered by discipline, skills, and location. Your work speaks for itself.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: Briefcase,
    title: "Land Paid Gigs",
    description: "Browse the gig board and apply with a personal message. Get hired, get paid, build your reputation.",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop",
    color: "from-pink-500 to-rose-500",
  },
];

const buyerSteps = [
  {
    number: "01",
    icon: Search,
    title: "Browse Vetted Talent",
    description: "Filter by creative discipline, skills, school, and location. Every profile is a real student from Kenya's top colleges.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    color: "from-amber-500 to-orange-500",
  },
  {
    number: "02",
    icon: Heart,
    title: "Shortlist & Message",
    description: "Bookmark your favourite profiles and open a direct conversation. No middlemen, no agencies — just direct connection.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
    color: "from-orange-500 to-red-500",
  },
  {
    number: "03",
    icon: Award,
    title: "Post Gigs & Hire",
    description: "Post a paid gig and receive applications from qualified students. Review portfolios and select the right fit.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop",
    color: "from-red-500 to-pink-500",
  },
];

const features = [
  {
    icon: Globe,
    title: "Public Portfolio Page",
    description: "Get a beautiful, shareable portfolio page with your own unique URL. Optimised for SEO so clients can find you.",
  },
  {
    icon: Eye,
    title: "Discovery Feed",
    description: "Get featured in our browse feed. Clients filter by discipline, skills, and availability to find the perfect creative.",
  },
  {
    icon: Briefcase,
    title: "Gig Board",
    description: "Browse and apply to paid gigs posted by verified businesses. From one-off projects to ongoing collaborations.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track profile views, link clicks, and work sample engagement. Understand your audience and optimise your portfolio.",
  },
  {
    icon: Zap,
    title: "Instant PDF Export",
    description: "Auto-generate a beautiful portfolio PDF for email pitches. Download and send your work with a single click.",
  },
  {
    icon: Shield,
    title: "Verified Businesses",
    description: "Premium clients get a verified badge so students know they are working with legitimate, vetted organisations.",
  },
];

const testimonials = [
  {
    name: "Amara Wanjiku",
    role: "Graphic Design Student · Nairobi Institute of Technology",
    quote: "I landed my first real brand identity project within 2 weeks of joining. My portfolio page did all the talking — the client reached out to me.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    stars: 5,
    discipline: "Graphic Design",
  },
  {
    name: "Kevin Mwangi",
    role: "Co-founder · Vivid Creative Agency, Nairobi",
    quote: "We found three exceptional design interns through PortfolioU in one afternoon. The portfolio quality blew us away — these students are seriously talented.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    stars: 5,
    discipline: "Client",
  },
  {
    name: "Fatima Hassan",
    role: "Beauty & Cosmetology Student · USIU Africa",
    quote: "Having a professional portfolio link to share on Instagram changed everything. Clients stopped asking for experience and started asking for availability.",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face",
    stars: 5,
    discipline: "Beauty & Cosmetology",
  },
];

const showcaseCards = [
  {
    name: "Aisha Kamau",
    discipline: "Beauty & Cosmetology",
    school: "Kenya College of Beauty",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=280&fit=crop",
    workImage: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=280&fit=crop",
  },
  {
    name: "Brian Otieno",
    discipline: "Web/App Development",
    school: "University of Nairobi",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=280&fit=crop",
    workImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=280&fit=crop",
  },
  {
    name: "Zara Njeri",
    discipline: "Graphic Design",
    school: "Kenyatta University",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=280&fit=crop",
    workImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=280&fit=crop",
  },
  {
    name: "Marcus Wafula",
    discipline: "Fashion & Styling",
    school: "Strathmore University",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=280&fit=crop",
    workImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=280&fit=crop",
  },
  {
    name: "Priya Sharma",
    discipline: "Graphic Design",
    school: "USIU Africa",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=280&fit=crop",
    workImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=280&fit=crop",
  },
  {
    name: "Naledi Dube",
    discipline: "Beauty & Cosmetology",
    school: "Daystar University",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=280&fit=crop",
    workImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=280&fit=crop",
  },
];

const universities = [
  "University of Nairobi",
  "USIU Africa",
  "Kenyatta University",
  "Strathmore University",
  "Daystar University",
  "KCA University",
];

const faqs = [
  {
    q: "Is PortfolioU free to use?",
    a: "Yes — both creators (students) and businesses can join for free. The free tier gives you a public portfolio page, up to 5 work uploads, and basic analytics. Premium plans unlock unlimited uploads, gig tools, custom URLs, and more.",
  },
  {
    q: "Who can join as a creator?",
    a: "Any college or university student in Kenya studying a creative discipline — beauty & cosmetology, web/app development, graphic design, or fashion & styling. We verify student status through your institution email or college name.",
  },
  {
    q: "How do gigs work?",
    a: "Verified businesses post paid gig listings on the gig board. Students browse open gigs and apply with a personal message and portfolio link. Businesses review applications and connect directly with their top choices.",
  },
  {
    q: "How do businesses verify their identity?",
    a: "Client Premium subscribers receive a verified business badge after our team reviews their business details. This signals to students that the business is legitimate and trustworthy.",
  },
  {
    q: "What disciplines are currently supported?",
    a: "We currently support Beauty & Cosmetology, Web/App Development, Graphic Design, and Fashion & Styling. We are actively expanding to include photography, video production, and content creation.",
  },
  {
    q: "When is PortfolioU launching publicly?",
    a: "We are currently in open beta, available to all students and businesses in Nairobi. The full public launch across Kenya is planned for later in 2026. Sign up now to be part of the founding community.",
  },
  {
    q: "Can I export my portfolio as a PDF?",
    a: "Yes — Student Premium users can export their portfolio as a beautifully formatted PDF, perfect for emailing to potential clients or including in job applications.",
  },
  {
    q: "Is there a limit on how many businesses I can message?",
    a: "Free client accounts can message up to 3 students. Client Premium removes all limits and adds priority search placement so your job posts are seen first.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-gray-100 pr-4">{q}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-indigo-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{a}</p>
        </div>
      )}
    </div>
  );
}

const stats = [
  { value: "Nairobi", label: "Launching 2026" },
  { value: "4", label: "Creative Disciplines" },
  { value: "Free", label: "To Join — Always" },
  { value: "Beta", label: "Now Open" },
];

export default function LandingPage() {
  const profile = useAppStore((s) => s.profile);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"creators" | "buyers">("creators");

  useEffect(() => {
    setUser(profile);
  }, [profile]);

  return (
    <main className="overflow-hidden">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774940835/PortfolioU_apih3l.png"
            alt="PortfolioU Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-white dark:to-gray-950" />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float animation-delay-200" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-indigo-100 backdrop-blur-md mb-8">
              <Sparkles className="h-4 w-4" />
              The Talent Marketplace for College Creatives
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 animate-slide-up">
            Your Work Deserves
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              To Be Seen
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-200 drop-shadow-md">
            Build a stunning portfolio, get discovered by top brands, and land paid gigs — all while still in school. Made for students in beauty, web dev, graphic design, and fashion.
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
                  href="/signup?role=student"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                >
                  Join as Creator <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/signup?role=client"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Hire Talent <Briefcase className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded-xl text-lg transition-all duration-200 border border-white/20 backdrop-blur-sm"
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in animation-delay-600">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow-sm">{stat.value}</div>
                <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─────────────────────────────────── */}
      <section className="py-10 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            Trusted by students at Kenya's top creative programmes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {universities.map((uni) => (
              <span
                key={uni}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                <Award className="h-3.5 w-3.5 text-indigo-400" />
                {uni}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DISCIPLINES ──────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-gray-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Built for Every Creative Discipline
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you style hair, write code, design brands, or create fashion — PortfolioU is your platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((d) => (
              <Link
                key={d.name}
                href={`/browse?discipline=${encodeURIComponent(d.name)}`}
                className="group relative overflow-hidden rounded-2xl bg-gray-900 aspect-[4/5] cursor-pointer shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${d.gradient} mb-3`}>
                    <d.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{d.name}</h3>
                  <p className="text-sm text-gray-300">{d.description}</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1 text-white text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    Browse <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How PortfolioU Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Whether you're showcasing your skills or searching for the next great hire, it's built for you.
            </p>
            {/* Tab toggle */}
            <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
              <button
                onClick={() => setActiveTab("creators")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "creators"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                For Creators
              </button>
              <button
                onClick={() => setActiveTab("buyers")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "buyers"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                For Businesses
              </button>
            </div>
          </div>

          {activeTab === "creators" && (
            <div className="grid md:grid-cols-3 gap-8">
              {creatorSteps.map((step) => (
                <div key={step.number} className="group relative">
                  <div className="relative rounded-2xl overflow-hidden mb-5 aspect-video shadow-lg">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-30`} />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Step {step.number}</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "buyers" && (
            <div className="grid md:grid-cols-3 gap-8">
              {buyerSteps.map((step) => (
                <div key={step.number} className="group relative">
                  <div className="relative rounded-2xl overflow-hidden mb-5 aspect-video shadow-lg">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-30`} />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Step {step.number}</span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            {activeTab === "creators" ? (
              <Link
                href="/signup?role=student"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
              >
                Start Your Portfolio <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/signup?role=client"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/25"
              >
                Browse Talent Now <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO SHOWCASE ───────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Real Talent</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Portfolios that get people hired
              </h2>
            </div>
            <Link
              href="/browse"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              See all portfolios <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {showcaseCards.map((card) => (
              <div
                key={card.name}
                className="flex-none w-72 snap-start rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={card.workImage}
                    alt={`${card.name}'s work`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{card.name}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{card.discipline}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.school}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic">
                    <Sparkles className="h-3 w-3" /> Sample portfolio
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 sm:hidden text-center">
            <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
              See all portfolios <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need to Get Hired
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From building your portfolio to tracking analytics, PortfolioU gives you the tools to launch your creative career.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">What People Say</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Real stories from our community
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
                <div className="absolute top-6 right-6">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    t.discipline === "Client"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                  }`}>
                    {t.discipline === "Client" ? <Briefcase className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
                    {t.discipline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Start free. Upgrade when you're ready.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Free accounts are powerful enough to launch your career. Premium unlocks everything.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Creators */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">For Creators</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Free */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{PLANS.student_free.name}</p>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">${PLANS.student_free.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">/mo</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.student_free.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?role=student" className="block w-full text-center border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 font-semibold py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-sm">
                    Get Started Free
                  </Link>
                </div>
                {/* Premium */}
                <div className="bg-indigo-600 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Crown className="h-5 w-5 text-amber-300" />
                  </div>
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">{PLANS.student_premium.name}</p>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-3xl font-extrabold text-white">${PLANS.student_premium.price}</span>
                    <span className="text-indigo-200 text-sm mb-1">/mo</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.student_premium.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-indigo-100">
                        <CheckCircle className="h-4 w-4 text-indigo-200 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?role=student" className="block w-full text-center bg-white text-indigo-600 font-bold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm">
                    Upgrade to Premium
                  </Link>
                </div>
              </div>
            </div>

            {/* Businesses */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">For Businesses</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Free */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{PLANS.client_free.name}</p>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">${PLANS.client_free.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">/mo</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.client_free.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?role=client" className="block w-full text-center border border-amber-500 text-amber-600 dark:text-amber-400 font-semibold py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-sm">
                    Browse for Free
                  </Link>
                </div>
                {/* Premium */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Crown className="h-5 w-5 text-white/80" />
                  </div>
                  <p className="text-xs font-bold text-amber-100 uppercase tracking-widest mb-1">{PLANS.client_premium.name}</p>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-3xl font-extrabold text-white">${PLANS.client_premium.price}</span>
                    <span className="text-amber-100 text-sm mb-1">/mo</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {PLANS.client_premium.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-amber-50">
                        <CheckCircle className="h-4 w-4 text-amber-100 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?role=client" className="block w-full text-center bg-white text-amber-600 font-bold py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-sm">
                    Upgrade to Premium
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Common questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=600&fit=crop"
            alt="Creative team"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-800/90 to-purple-900/95" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-indigo-200 backdrop-blur-md mb-6">
            <Sparkles className="h-4 w-4" />
            Open Beta — Free to Join
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to launch your
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              creative career?
            </span>
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join the growing community of college creatives and forward-thinking businesses building the future of creative talent in East Africa.
          </p>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-50 transition-all duration-200 shadow-xl hover:-translate-y-0.5"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup?role=student"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Join as Creator <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/signup?role=client"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-xl hover:-translate-y-0.5"
              >
                Hire Talent <Briefcase className="h-5 w-5" />
              </Link>
            </div>
          )}
          <p className="text-indigo-300 text-sm mt-8">No credit card required · Free forever plan · Cancel anytime</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
