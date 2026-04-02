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
      const data = await api.profiles.list({
        role: "student",
        discipline: discipline || undefined,
      });
      setTalents(data);
    } catch (err) {
      console.error("Error loading talents:", err);
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
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            Discover Student Talent{" "}
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse and connect with the best college creatives in beauty, tech,
            design, and fashion.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, skills, or school..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
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
          <p className="text-sm text-gray-500 mb-6">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredTalents.length}
            </span>{" "}
            {filteredTalents.length === 1 ? "creative" : "creatives"}
            {discipline && (
              <>
                {" "}
                in{" "}
                <span className="font-semibold text-gray-900">
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
          <div className="text-center py-32 bg-white rounded-3xl border border-gray-200">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No talent found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or search terms.
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
                  <Card className="h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white">
                    {/* Cover Image / Gradient Banner */}
                    <div className="h-36 relative overflow-hidden">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={`${talent.name} cover`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
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
                          className="border-[3px] border-white shadow-md"
                        />
                      </div>

                      <div className="pt-10">
                        {/* Name */}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {talent.name}
                        </h3>

                        {/* Discipline */}
                        <p className="text-sm font-semibold text-indigo-600 mt-0.5">
                          {talent.discipline || "Creative"}
                        </p>

                        {/* School & Location */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {talent.school && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                              <span className="truncate max-w-[120px]">
                                {talent.school}
                              </span>
                            </span>
                          )}
                          {talent.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="truncate max-w-[100px]">
                                {talent.location}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Bio snippet */}
                        {talent.bio && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
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
                        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            View Portfolio
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
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
