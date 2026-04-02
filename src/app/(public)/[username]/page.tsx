"use client";

import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Globe,
  Mail,
  ExternalLink,
  Loader2,
  Sparkles,
  AtSign,
  Link2,
  Briefcase,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PDFExportButton } from "./pdf-export-button";
import { ShareProfileButton } from "./share-button";
import { ViewTracker } from "./view-tracker";

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const foundProfile = await api.profiles.getByUsername(username as string);

        if (foundProfile) {
          setProfile(foundProfile);
          const samplesData = await api.get(`work-samples/?profile_id=${foundProfile.id}`);
          setSamples(Array.isArray(samplesData) ? samplesData : samplesData.results || []);
        }
      } catch (err) {
        console.error("Error loading portfolio:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          We couldn&apos;t find the portfolio you&apos;re looking for. The user may have changed their username or deleted their account.
        </p>
        <Button className="mt-8" onClick={() => window.location.href = "/"}>
          Back to PortfolioU
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <ViewTracker profileId={profile.id} />
      
      {/* Cover Header */}
      <div className="h-64 sm:h-80 relative overflow-hidden">
        {profile.cover_image_url ? (
          <img
            src={profile.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <Avatar
              src={profile.avatar_url || profile.avatar}
              name={profile.name}
              size="xl"
              className="h-40 w-40 sm:h-48 sm:w-48 border-8 border-white dark:border-gray-950 shadow-2xl"
            />
            <div className="text-center sm:text-left pb-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {profile.name}
                {profile.is_premium && <Sparkles className="h-6 w-6 text-amber-500" />}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-semibold text-indigo-600">
                  {profile.discipline}
                </p>
                {profile.open_to_work && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    <Briefcase className="h-3 w-3" /> Open to Work
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" /> {profile.location || "Earth"}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Globe className="h-4 w-4" /> {profile.school || (profile.role === "client" ? "Client" : "Student")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 pb-4">
            <ShareProfileButton />
            <PDFExportButton profile={profile} samples={samples} />
            <Button
              className="shadow-lg shadow-indigo-200"
              onClick={() => {
                const token = localStorage.getItem("access_token");
                if (token) {
                  router.push(`/messages?partner=${profile.id}`);
                } else {
                  router.push(`/login?redirect=/${username}&action=hire`);
                }
              }}
            >
              <Mail className="h-4 w-4" /> Hire Me
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bio & Skills */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">About Me</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {profile.bio || "No bio provided yet."}
              </p>

              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100">
                      {skill}
                    </Badge>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <span className="text-sm text-gray-400 dark:text-gray-500 italic">No skills listed</span>
                  )}
                </div>
              </div>

              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Connect</h3>
                  <div className="flex gap-4">
                    {profile.social_links.instagram && (
                      <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <AtSign className="h-5 w-5" />
                      </a>
                    )}
                    {profile.social_links.website && (
                      <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                    {profile.social_links.linkedin && (
                      <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Link2 className="h-5 w-5" />
                      </a>
                    )}
                    {profile.social_links.email && (
                      <a href={`mailto:${profile.social_links.email}`} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Mail className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Portfolio Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              Featured Work <Badge className="bg-indigo-600">{samples.length}</Badge>
            </h2>
            
            {samples.length === 0 ? (
              <Card className="p-20 text-center bg-white dark:bg-gray-800 border-2 border-dashed dark:border-gray-700">
                <p className="text-gray-400 dark:text-gray-500">This creative hasn&apos;t uploaded any work yet.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {samples.map((sample) => (
                  <Card key={sample.id} className="overflow-hidden group cursor-pointer hover:shadow-2xl dark:hover:shadow-black/50 transition-all duration-300">
                    <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {sample.sample_type === "image" && sample.media ? (
                        <img
                          src={sample.media}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-200">
                          <ExternalLink className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <p className="text-white text-sm font-medium">{sample.description}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        {sample.title}
                        {sample.link && <ExternalLink className="h-4 w-4" />}
                      </h3>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
