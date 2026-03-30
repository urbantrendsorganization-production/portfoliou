"use client";

import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DISCIPLINES } from "@/utils/constants";
import {
  Search,
  MapPin,
  Star,
  Filter,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BrowsePage() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [discipline, setDiscipline] = useState("");

  useEffect(() => {
    loadTalents();
  }, [discipline]);

  async function loadTalents() {
    setLoading(true);
    try {
      const data = await api.profiles.list({
        role: 'student',
        discipline: discipline || undefined,
      });
      setTalents(data);
    } catch (err) {
      console.error("Error loading talents:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredTalents = talents.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.skills && t.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            Discover Student Talent <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse and connect with the best college creatives in beauty, tech, design, and fashion.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, skills, or school..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
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
              className="bg-gray-50 border-none"
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-500 font-medium">Curating top talent...</p>
          </div>
        ) : filteredTalents.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-gray-200">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No talent found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTalents.map((talent) => (
              <Link key={talent.id} href={`/${talent.username || talent.user_username}`}>
                <Card className="h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                    {talent.is_premium && (
                      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/30 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" /> PREMIUM
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-6 relative">
                    <div className="absolute -top-10 left-6">
                      <Avatar
                        src={talent.avatar}
                        name={talent.name}
                        size="lg"
                        className="border-4 border-white shadow-lg"
                      />
                    </div>
                    <div className="pt-12">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {talent.name}
                      </h3>
                      <p className="text-sm font-medium text-indigo-600 mb-2">
                        {talent.discipline}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                        <MapPin className="h-3 w-3" /> {talent.school || "Unspecified School"}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {(talent.skills || []).slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-[10px]">
                            {skill}
                          </Badge>
                        ))}
                        {talent.skills && talent.skills.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{talent.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">VIEW PORTFOLIO</span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
