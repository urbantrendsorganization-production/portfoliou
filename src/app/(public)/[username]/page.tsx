import type { Metadata } from "next";
import PortfolioView from "./PortfolioView";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchProfile(username: string) {
  try {
    const res = await fetch(
      `${API_URL}/profiles/?username=${encodeURIComponent(username)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const profiles = Array.isArray(data) ? data : data?.results ?? [];
    return profiles.length > 0 ? profiles[0] : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfile(username);

  if (!profile) {
    return {
      title: "Portfolio Not Found | PortfolioU",
      description: "This portfolio page does not exist or has been removed.",
    };
  }

  const name = profile.name || username;
  const discipline = profile.discipline || "Creative";
  const school = profile.school ? ` · ${profile.school}` : "";
  const bio = profile.bio
    ? profile.bio.slice(0, 155)
    : `${name} is a ${discipline} creative on PortfolioU.`;
  const title = `${name} — ${discipline} Portfolio | PortfolioU`;
  const avatarUrl: string | undefined =
    profile.avatar_url || profile.avatar || undefined;

  return {
    title,
    description: bio + school,
    openGraph: {
      title,
      description: bio,
      type: "profile",
      url: `https://portfoliou.urbantrends.dev/${username}`,
      ...(avatarUrl ? { images: [{ url: avatarUrl, alt: `${name}'s avatar` }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description: bio,
      ...(avatarUrl ? { images: [avatarUrl] } : {}),
    },
    alternates: {
      canonical: `https://portfoliou.urbantrends.dev/${username}`,
    },
  };
}

export default function PublicPortfolioPage() {
  return <PortfolioView />;
}
