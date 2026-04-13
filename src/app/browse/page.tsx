"use client";

import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DISCIPLINES } from "@/utils/constants";
import { getDisciplineGradient } from "@/utils/helpers";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Loader2,
  Sparkles,
  Heart,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, "");

import { SEED_PROFILES } from "@/utils/seed-data";

const DISCIPLINE_COVER_IMAGES: Record<string, string> = {
  "Beauty & Cosmetology":
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=300&fit=crop",
  "Web/App Development":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop",
  "Graphic Design":
    "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=300&fit=crop",
  "Fashion & Styling":
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=300&fit=crop",
};

function resolveImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${BACKEND_BASE}${src}`;
  return `${BACKEND_BASE}/${src}`;
}

export default function BrowsePage() {
  const profile = useAppStore((s) => s.profile);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({});

  const isClient = profile?.role === "client";

  useEffect(() => {
    loadTalents();
    if (isClient) loadBookmarks();
  }, [discipline, isClient]);

  async function loadBookmarks() {
    try {
      const data = await api.bookmarks.list();
      const map: Record<number, number> = {};
      data.forEach((b: any) => {
        map[b.student_profile] = b.id;
      });
      setBookmarks(map);
    } catch {
      // Not logged in or no bookmarks
    }
  }

  async function toggleBookmark(e: React.MouseEvent, talentId: number) {
    e.preventDefault();
    e.stopPropagation();

    // Only clients can bookmark
    if (!profile || profile.role !== "client") return;

    if (bookmarks[talentId]) {
      try {
        await api.bookmarks.delete(bookmarks[talentId]);
        setBookmarks((prev) => {
          const next = { ...prev };
          delete next[talentId];
          return next;
        });
      } catch {
        // silently ignore
      }
    } else {
      // Optimistic update
      const tempId = -Date.now();
      setBookmarks((prev) => ({ ...prev, [talentId]: tempId }));
      try {
        const bm = await api.bookmarks.create(talentId);
        setBookmarks((prev) => ({ ...prev, [talentId]: bm.id }));
      } catch {
        // Revert optimistic update
        setBookmarks((prev) => {
          const next = { ...prev };
          delete next[talentId];
          return next;
        });
      }
    }
  }

  async function loadTalents() {
    setLoading(true);
    try {
      const fetchPromise = api.profiles.list({
        role: "student",
        discipline: discipline || undefined,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 6000)
      );
      const data = await Promise.race([fetchPromise, timeoutPromise]) as any[];
      const filtered = discipline
        ? data.filter((p: any) => p.discipline === discipline)
        : data;
      if (filtered.length > 0) {
        setTalents(filtered);
      } else {
        const seeds = discipline
          ? SEED_PROFILES.filter((p) => p.discipline === discipline)
          : SEED_PROFILES;
        setTalents(seeds);
      }
    } catch {
      const seeds = discipline
        ? SEED_PROFILES.filter((p) => p.discipline === discipline)
        : SEED_PROFILES;
      setTalents(seeds);
    } finally {
      setLoading(false);
    }
  }

  const filteredTalents = talents.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.skills &&
        t.skills.some((s: string) =>
          s.toLowerCase().includes(search.toLowerCase())
        ))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Hero banner */}
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&h=500&fit=crop"
          alt="Creative talent"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-indigo-800/70 to-purple-900/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-white text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Nairobi College Talent
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Discover Creative Talent
          </h1>
          <p className="text-indigo-100 text-base max-w-xl">
            Browse portfolios from the best college creatives in beauty, tech, design, and fashion.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, skills, or school..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              options={[
                { value: "", label: "All Disciplines" },
                ...DISCIPLINES.map((d) => ({ value: d, label: d })),
              ]}
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {filteredTalents.length}
            </span>{" "}
            {filteredTalents.length === 1 ? "creative" : "creatives"}
            {discipline && (
              <>
                {" "}
                in{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {discipline}
                </span>
              </>
            )}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-500 font-medium">
              Curating top talent...
            </p>
          </div>
        ) : filteredTalents.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="h-20 w-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              No creatives found in this category yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try a different discipline or clear your search.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTalents.map((talent) => {
              const coverUrl = resolveImageUrl(
                talent.cover_image_url || talent.cover_image
              );
              const gradient = getDisciplineGradient(talent.discipline);

              return (
                <Link
                  key={talent.id}
                  href={`/${talent.username && talent.username.trim() ? talent.username : talent.user_username}`}
                >
                  <Card className="h-full overflow-hidden hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 group bg-white dark:bg-gray-800">
                    {/* Cover Image / Discipline Banner */}
                    <div className="h-36 relative overflow-hidden">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={`${talent.name} cover`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : DISCIPLINE_COVER_IMAGES[talent.discipline] ? (
                        <>
                          <img
                            src={DISCIPLINE_COVER_IMAGES[talent.discipline]}
                            alt={talent.discipline}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
                        </>
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${gradient}`}
                        >
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                              backgroundSize: "20px 20px",
                            }}
                          />
                        </div>
                      )}

                      {/* Dark overlay for badge readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                      {/* Badges top-right */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {isClient && talent.open_to_work && (
                          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Briefcase className="h-3 w-3" /> AVAILABLE
                          </span>
                        )}
                        {talent.is_premium && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Star className="h-3 w-3 fill-white" /> PRO
                          </span>
                        )}
                      </div>

                      {/* Bookmark button for clients */}
                      {isClient && (
                        <button
                          onClick={(e) => toggleBookmark(e, talent.id)}
                          className="absolute top-3 left-3 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors cursor-pointer"
                          title={
                            bookmarks[talent.id]
                              ? "Remove bookmark"
                              : "Bookmark"
                          }
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              bookmarks[talent.id]
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Profile Content */}
                    <div className="px-5 pb-5 relative">
                      {/* Avatar overlapping the cover */}
                      <div className="absolute -top-8 left-5">
                        <Avatar
                          src={talent.avatar_url || talent.avatar}
                          name={talent.name}
                          size="lg"
                          className="border-[3px] border-white dark:border-gray-800 shadow-md"
                        />
                      </div>

                      <div className="pt-10">
                        {/* Name */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                          {talent.name}
                        </h3>

                        {/* Discipline */}
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {talent.discipline || "Creative"}
                        </p>

                        {/* School & Location */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {talent.school && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                              <span className="truncate max-w-[120px]">
                                {talent.school}
                              </span>
                            </span>
                          )}
                          {talent.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                              <span className="truncate max-w-[100px]">
                                {talent.location}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Bio snippet */}
                        {talent.bio && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                            {talent.bio}
                          </p>
                        )}

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(talent.skills || [])
                            .slice(0, 3)
                            .map((skill: string) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 border-gray-200"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {talent.skills && talent.skills.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500"
                            >
                              +{talent.skills.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            View Portfolio
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
