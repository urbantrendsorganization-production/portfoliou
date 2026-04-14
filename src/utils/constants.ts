export const DISCIPLINES = [
  "Beauty & Cosmetology",
  "Web/App Development",
  "Graphic Design",
  "Fashion & Styling",
] as const;

export const FREE_UPLOAD_LIMIT = 5;
export const FREE_BOOKMARK_LIMIT = 3;

export const PLANS = {
  student_free: {
    name: "Student Free",
    price: 0,
    features: [
      "Basic portfolio page",
      "Up to 5 work uploads",
      "Shareable link",
      "Basic analytics (views & clicks)",
    ],
  },
  student_premium: {
    name: "Student Premium",
    price: 8,
    priceId: process.env.STRIPE_STUDENT_PREMIUM_PRICE_ID,
    features: [
      "Unlimited work uploads",
      "Custom URL slug",
      "Featured in discovery",
      "\"Hire Me\" badge",
      "Gig tools & applications",
      "PDF portfolio export",
      "Priority support",
    ],
  },
  client_free: {
    name: "Client Free",
    price: 0,
    features: [
      "Browse student portfolios",
      "Bookmark up to 3 profiles",
      "Basic search filters",
    ],
  },
  client_premium: {
    name: "Client Premium",
    price: 35,
    priceId: process.env.STRIPE_CLIENT_PREMIUM_PRICE_ID,
    features: [
      "Unlimited bookmarks",
      "Direct messaging",
      "Post gigs & jobs",
      "Advanced filters",
      "Verified business badge",
      "Priority in student feeds",
    ],
  },
} as const;

export const APP_VERSION = "1.1.0";

export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Beauty & Cosmetology": [
    "Hair Styling",
    "Makeup Artistry",
    "Skincare",
    "Nail Art",
    "Color Theory",
    "Bridal Makeup",
    "Special Effects Makeup",
    "Lash Extensions",
    "Waxing & Threading",
    "Salon Management",
  ],
  "Web/App Development": [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "Django",
    "REST APIs",
    "UI/UX Design",
    "Database Design",
    "Mobile Development",
    "GraphQL",
    "TailwindCSS",
  ],
  "Graphic Design": [
    "Adobe Photoshop",
    "Illustrator",
    "InDesign",
    "Brand Identity",
    "Logo Design",
    "Typography",
    "Print Design",
    "Motion Graphics",
    "Figma",
    "Color Theory",
  ],
  "Fashion & Styling": [
    "Fashion Design",
    "Trend Forecasting",
    "Wardrobe Styling",
    "Textile Knowledge",
    "Pattern Making",
    "Fashion Photography",
    "Retail Buying",
    "Visual Merchandising",
    "Sustainable Fashion",
  ],
};

export const DEFAULT_SKILL_SUGGESTIONS: string[] = [
  "Communication",
  "Project Management",
  "Problem Solving",
  "Time Management",
  "Teamwork",
  "Creativity",
  "Critical Thinking",
];

export function getSkillSuggestions(discipline?: string | null): string[] {
  if (discipline && SKILL_SUGGESTIONS[discipline]) return SKILL_SUGGESTIONS[discipline];
  return DEFAULT_SKILL_SUGGESTIONS;
}
