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
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ExternalLink,
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

  const [newGig, setNewGig] = useState({
    title: "",
    description: "",
    discipline: "",
    budget: "",
    deadline: "",
  });

  const isClient = profile?.role === "client";

  useEffect(() => {
    loadGigs();
    if (profile && profile.role === "student") {
      api.gigApplications.list().then((apps) => {
        setAppliedGigs(new Set(apps.map((a: any) => a.gig)));
      }).catch(() => {});
    }
  }, [profile]);

  async function loadGigs() {
    setLoading(true);
    try {
      const data = await api.gigs.list({ status: "open" });
      if (isClient && profile) {
        setMyGigs(data.filter((g: any) => g.client_profile === profile.id));
        setGigs(data.filter((g: any) => g.client_profile !== profile.id));
      } else {
        setGigs(data);
      }
    } catch (err) {
      console.error("Error loading gigs:", err);
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
      await api.gigApplications.create({
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
      setApplyingTo(null);
      setApplicationMessage("");
      alert("Application sent successfully!");
    } catch (err: any) {
      const msg = err.non_field_errors?.[0] || err.detail || "You have already applied for this gig.";
      alert(msg);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gig Board</h1>
            <p className="text-gray-500 mt-1">
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
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" /> My Posted Gigs
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
                          <h3 className="text-xl font-bold text-gray-900">{gig.title}</h3>
                          <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-gray-900">{gig.budget}</span>
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
                      <div className="border-t border-gray-100 bg-gray-50/50">
                        {loadingApps === gig.id ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        ) : gigApps.length === 0 ? (
                          <div className="p-8 text-center">
                            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No applications yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
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
                                      <p className="font-semibold text-gray-900 truncate">
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
                                    <p className="text-xs text-gray-500">
                                      {app.student_discipline} &middot; Applied {new Date(app.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {app.message && (
                                  <div className="sm:hidden bg-white rounded-lg p-3 border border-gray-100">
                                    <p className="text-sm text-gray-600 italic">&ldquo;{app.message}&rdquo;</p>
                                  </div>
                                )}

                                <div className="hidden sm:block flex-1 max-w-sm">
                                  {app.message && (
                                    <p className="text-sm text-gray-600 italic line-clamp-2">
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
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-bold text-gray-900">Other Open Gigs</h2>
          </div>
        )}

        {/* Search & Filters */}
        {(!isClient || gigs.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Select
              options={[
                { value: "", label: "All Disciplines" },
                ...DISCIPLINES.map((d) => ({ value: d, label: d })),
              ]}
            />
          </div>
        )}

        {/* Gig List (all gigs for students, other gigs for clients) */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
          </div>
        ) : gigs.length === 0 && (!isClient || myGigs.length === 0) ? (
          <Card className="p-20 text-center">
            <Briefcase className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No active gigs found</h3>
            <p className="text-gray-500">Check back later for new opportunities.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {gigs.map((gig) => (
              <Card key={gig.id} className="p-6 hover:border-indigo-200 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
                        {gig.discipline}
                      </span>
                      <span className="text-xs text-gray-400">Posted by {gig.client_name}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{gig.title}</h3>
                    <p className="text-gray-600 text-sm max-w-2xl">{gig.description}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-gray-900">{gig.budget}</span>
                      </div>
                      {gig.deadline && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
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
                        <Button onClick={() => setApplyingTo(gig.id)}>Apply Now</Button>
                      ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Post Gig Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Post a New Gig</h2>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Apply for this Gig</h2>
            <p className="text-sm text-gray-500 mb-6">Introduce yourself and explain why you&apos;re a good fit.</p>
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
