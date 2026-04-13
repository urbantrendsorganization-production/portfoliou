"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DISCIPLINES } from "@/utils/constants";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SEED_GIGS } from "@/utils/seed-data";

type AppFilter = "all" | "pending" | "accepted" | "rejected";

interface GigApplication {
  id: number;
  gig: number;
  gig_title: string;
  student_profile: number;
  student_name: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export default function GigsPage() {
  const profile = useAppStore((s) => s.profile);
  const [gigs, setGigs] = useState<any[]>([]);
  const [myGigs, setMyGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyingTo, setApplyingTo] = useState<number | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [appliedGigs, setAppliedGigs] = useState<Set<number>>(new Set());
  const [expandedGig, setExpandedGig] = useState<number | null>(null);
  const [applications, setApplications] = useState<Record<number, any[]>>({});
  const [loadingApps, setLoadingApps] = useState<number | null>(null);

  // Student "My Applications" state
  const [myApplications, setMyApplications] = useState<GigApplication[]>([]);
  const [appFilter, setAppFilter] = useState<AppFilter>("all");

  // Gig search / discipline filter
  const [gigSearch, setGigSearch] = useState("");
  const [gigDiscipline, setGigDiscipline] = useState("");

  const [newGig, setNewGig] = useState({
    title: "",
    description: "",
    discipline: "",
    budget: "",
    deadline: "",
  });

  const router = useRouter();
  const isClient = profile?.role === "client";
  const isStudent = profile?.role === "student";

  useEffect(() => {
    loadGigs();
    if (profile && profile.role === "student") {
      api.gigApplications.list().then((apps: GigApplication[]) => {
        setAppliedGigs(new Set(apps.map((a) => a.gig)));
        setMyApplications(apps);
      }).catch(() => {});
    }
  }, [profile]);

  async function loadGigs() {
    setLoading(true);
    try {
      const fetchPromise = api.gigs.list({ status: "open" });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 6000)
      );
      const data = await Promise.race([fetchPromise, timeoutPromise]) as any[];
      if (data.length === 0) {
        setGigs(SEED_GIGS);
      } else if (isClient && profile) {
        setMyGigs(data.filter((g: any) => g.client_profile === profile.id));
        setGigs(data.filter((g: any) => g.client_profile !== profile.id));
      } else {
        setGigs(data);
      }
    } catch {
      setGigs(SEED_GIGS);
    } finally {
      setLoading(false);
    }
  }

  async function toggleApplications(gigId: number) {
    if (expandedGig === gigId) {
      setExpandedGig(null);
      return;
    }
    setExpandedGig(gigId);
    if (!applications[gigId]) {
      setLoadingApps(gigId);
      try {
        const apps = await api.gigApplications.list(gigId);
        setApplications((prev) => ({ ...prev, [gigId]: apps }));
      } catch (err) {
        console.error("Error loading applications:", err);
      } finally {
        setLoadingApps(null);
      }
    }
  }

  async function handleUpdateApplication(appId: number, gigId: number, status: "accepted" | "rejected") {
    try {
      await api.gigApplications.update(appId, { status });
      // Refresh the applications for this gig
      const apps = await api.gigApplications.list(gigId);
      setApplications((prev) => ({ ...prev, [gigId]: apps }));
    } catch (err) {
      console.error("Error updating application:", err);
    }
  }

  async function handleMessageApplicant(studentProfileId: number, studentName: string, gigTitle: string) {
    const content = `Hi ${studentName}, regarding your application for "${gigTitle}" — `;
    try {
      await api.messages.send({ receiver: studentProfileId, content });
      alert(`Message thread started with ${studentName}. Check your Messages page to continue the conversation.`);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  async function handlePostGig(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    try {
      await api.gigs.create({
        ...newGig,
        client_profile: profile.id,
      });
      setShowPostModal(false);
      setNewGig({ title: "", description: "", discipline: "", budget: "", deadline: "" });
      loadGigs();
    } catch (err) {
      console.error("Error posting gig:", err);
    }
  }

  async function handleApply(gigId: number) {
    if (!profile) return;
    try {
      const newApp = await api.gigApplications.create({
        gig: gigId,
        student_profile: profile.id,
        message: applicationMessage,
      });

      const gig = gigs.find((g) => g.id === gigId);
      if (gig?.client_profile) {
        const messageContent = `[Gig Application] ${profile.name || "A student"} applied for "${gig.title}"\n\n${applicationMessage}`;
        try {
          await api.messages.send({
            receiver: gig.client_profile,
            content: messageContent,
          });
        } catch (msgErr) {
          console.error("Failed to send application message:", msgErr);
        }
      }

      setAppliedGigs(new Set([...appliedGigs, gigId]));
      // Add to myApplications so it appears immediately
      if (newApp && newApp.id) {
        setMyApplications((prev) => [newApp, ...prev]);
      }
      setApplyingTo(null);
      setApplicationMessage("");
      alert("Application sent successfully!");
    } catch (err: any) {
      const msg = err.non_field_errors?.[0] || err.detail || "You have already applied for this gig.";
      alert(msg);
    }
  }

  const filteredApplications = myApplications.filter((app) => {
    if (appFilter === "all") return true;
    return app.status === appFilter;
  });

  const statusCounts = {
    all: myApplications.length,
    pending: myApplications.filter((a) => a.status === "pending").length,
    accepted: myApplications.filter((a) => a.status === "accepted").length,
    rejected: myApplications.filter((a) => a.status === "rejected").length,
  };

  function getStatusBadge(status: GigApplication["status"]) {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
    }
  }

  const filterButtons: { key: AppFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Declined" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gig Board</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isClient
                ? "Manage your gigs and review applicants."
                : "Find paid opportunities from clients."}
            </p>
          </div>
          {isClient && (
            <Button onClick={() => setShowPostModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Post a Gig
            </Button>
          )}
        </div>

        {/* Client: My Posted Gigs with Applications */}
        {isClient && myGigs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> My Posted Gigs
            </h2>
            <div className="grid gap-4">
              {myGigs.map((gig) => {
                const gigApps = applications[gig.id] || [];
                const isExpanded = expandedGig === gig.id;

                return (
                  <Card key={gig.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
                              {gig.discipline}
                            </span>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {gig.status}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{gig.title}</h3>
                          <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{gig.budget}</span>
                            </span>
                            {gig.deadline && (
                              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                {new Date(gig.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => toggleApplications(gig.id)}
                          className="gap-2"
                        >
                          <Users className="h-4 w-4" />
                          View Applicants
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Applicants Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                        {loadingApps === gig.id ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        ) : gigApps.length === 0 ? (
                          <div className="p-8 text-center">
                            <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No applications yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {gigApps.map((app: any) => (
                              <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <Avatar
                                    src={app.student_avatar}
                                    name={app.student_name}
                                    size="md"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                        {app.student_name}
                                      </p>
                                      {app.status !== "pending" && (
                                        <Badge
                                          variant={app.status === "accepted" ? "secondary" : "secondary"}
                                          className={
                                            app.status === "accepted"
                                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                              : "bg-red-50 text-red-700 border-red-200 text-xs"
                                          }
                                        >
                                          {app.status === "accepted" ? "Accepted" : "Rejected"}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {app.student_discipline} &middot; Applied {new Date(app.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {app.message && (
                                  <div className="sm:hidden bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">&ldquo;{app.message}&rdquo;</p>
                                  </div>
                                )}

                                <div className="hidden sm:block flex-1 max-w-sm">
                                  {app.message && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic line-clamp-2">
                                      &ldquo;{app.message}&rdquo;
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {app.student_username && (
                                    <Link href={`/${app.student_username}`} target="_blank">
                                      <Button variant="ghost" size="sm" className="text-gray-500">
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500"
                                    onClick={() =>
                                      handleMessageApplicant(
                                        app.student_profile,
                                        app.student_name,
                                        gig.title
                                      )
                                    }
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                  {app.status === "pending" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                        onClick={() => handleUpdateApplication(app.id, gig.id, "accepted")}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => handleUpdateApplication(app.id, gig.id, "rejected")}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider for clients */}
        {isClient && myGigs.length > 0 && gigs.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Other Open Gigs</h2>
          </div>
        )}

        {/* Student: My Applications */}
        {isStudent && myApplications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> My Applications
            </h2>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setAppFilter(key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    appFilter === key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {label}
                  {statusCounts[key] > 0 && (
                    <span
                      className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        appFilter === key
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {statusCounts[key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Application Cards */}
            {filteredApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No {appFilter === "all" ? "" : appFilter} applications found.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredApplications.map((app) => (
                  <Card key={app.id} className="p-5 hover:border-indigo-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {app.gig_title}
                          </h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {app.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic">
                            &ldquo;{app.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Divider before open gigs */}
            {gigs.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Open Gigs</h2>
              </div>
            )}
          </div>
        )}

        {/* Search & Filters */}
        {(!isClient || gigs.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={gigSearch}
                onChange={(e) => setGigSearch(e.target.value)}
                placeholder="Search gigs by title, discipline, or business..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <Select
              value={gigDiscipline}
              onChange={(e) => setGigDiscipline(e.target.value)}
              options={[
                { value: "", label: "All Disciplines" },
                ...DISCIPLINES.map((d) => ({ value: d, label: d })),
              ]}
            />
          </div>
        )}

        {/* Gig List (all gigs for students, other gigs for clients) */}
        {(() => {
          const visibleGigs = gigs.filter((g) => {
            const matchesDiscipline = !gigDiscipline || g.discipline === gigDiscipline;
            const q = gigSearch.toLowerCase();
            const matchesSearch =
              !q ||
              g.title?.toLowerCase().includes(q) ||
              g.discipline?.toLowerCase().includes(q) ||
              g.client_name?.toLowerCase().includes(q) ||
              g.description?.toLowerCase().includes(q);
            return matchesDiscipline && matchesSearch;
          });

          if (loading) return (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
            </div>
          );

          if (gigs.length === 0 && (!isClient || myGigs.length === 0)) return (
            <Card className="p-20 text-center">
              <Briefcase className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No active gigs yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Check back soon — new opportunities are posted regularly.</p>
            </Card>
          );

          if (visibleGigs.length === 0) return (
            <Card className="p-16 text-center">
              <Search className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No gigs match your search</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {gigDiscipline
                  ? `No ${gigDiscipline} gigs posted yet — try a different discipline.`
                  : "Try different keywords or clear your search."}
              </p>
            </Card>
          );

          return (
          <div className="grid gap-4">
            {visibleGigs.map((gig) => (
              <Card key={gig.id} className="p-6 hover:border-indigo-200 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
                        {gig.discipline}
                      </span>
                      <span className="text-xs text-gray-400">Posted by {gig.client_name}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{gig.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl">{gig.description}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{gig.budget}</span>
                      </div>
                      {gig.deadline && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          Expires {new Date(gig.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {!isClient &&
                      (appliedGigs.has(gig.id) ? (
                        <Button variant="outline" disabled className="gap-2">
                          <CheckCircle className="h-4 w-4" /> Applied
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            profile
                              ? setApplyingTo(gig.id)
                              : router.push("/login?redirect=/gigs")
                          }
                        >
                          Apply Now
                        </Button>
                      ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          );
        })()}
      </div>

      {/* Post Gig Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Post a New Gig</h2>
            <form onSubmit={handlePostGig} className="space-y-4">
              <Input
                label="Job Title"
                value={newGig.title}
                onChange={(e) => setNewGig({ ...newGig, title: e.target.value })}
                placeholder="e.g., Logo Design for Startup"
                required
              />
              <Select
                label="Discipline"
                value={newGig.discipline}
                onChange={(e) => setNewGig({ ...newGig, discipline: e.target.value })}
                options={DISCIPLINES.map((d) => ({ value: d, label: d }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Budget"
                  value={newGig.budget}
                  onChange={(e) => setNewGig({ ...newGig, budget: e.target.value })}
                  placeholder="e.g., $500"
                />
                <Input
                  label="Deadline"
                  type="date"
                  value={newGig.deadline}
                  onChange={(e) => setNewGig({ ...newGig, deadline: e.target.value })}
                />
              </div>
              <Textarea
                label="Job Description"
                value={newGig.description}
                onChange={(e) => setNewGig({ ...newGig, description: e.target.value })}
                placeholder="Detailed requirements..."
                rows={4}
                required
              />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth>
                  Post Gig
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Apply Modal */}
      {applyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Apply for this Gig</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Introduce yourself and explain why you&apos;re a good fit.</p>
            <Textarea
              label="Cover Letter / Message"
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Hi, I'm a student developer and I'd love to help..."
              rows={5}
              required
            />
            <div className="flex gap-3 pt-6">
              <Button variant="outline" fullWidth onClick={() => setApplyingTo(null)}>
                Cancel
              </Button>
              <Button fullWidth onClick={() => handleApply(applyingTo)} className="gap-2">
                <Send className="h-4 w-4" /> Send Application
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
