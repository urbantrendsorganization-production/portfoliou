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

export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Beauty & Cosmetology": [
    "Hair Styling",
    "Makeup Artistry",
    "Nail Art",
    "Skincare",
    "Braiding",
    "Color Theory",
    "Bridal Makeup",
    "SFX Makeup",
    "Barbering",
    "Esthetics",
  ],
  "Web/App Development": [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "UI/UX Design",
    "Figma",
    "Mobile Development",
    "Database Design",
    "API Development",
  ],
  "Graphic Design": [
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Figma",
    "Branding",
    "Typography",
    "Logo Design",
    "Print Design",
    "Motion Graphics",
    "UI Design",
    "Photography",
  ],
  "Fashion & Styling": [
    "Personal Styling",
    "Fashion Illustration",
    "Pattern Making",
    "Sewing",
    "Textile Design",
    "Wardrobe Consulting",
    "Fashion Photography",
    "Trend Forecasting",
    "Visual Merchandising",
    "Costume Design",
  ],
};
