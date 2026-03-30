"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
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
  DollarSign,
  MapPin,
  Plus,
  Search,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function GigsPage() {
  const profile = useAppStore((s) => s.profile);
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyingTo, setApplyingTo] = useState<number | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  
  const [newGig, setNewGig] = useState({
    title: "",
    description: "",
    discipline: "",
    budget: "",
    deadline: "",
  });

  useEffect(() => {
    loadGigs();
  }, []);

  async function loadGigs() {
    setLoading(true);
    try {
      const data = await api.gigs.list({ status: 'open' });
      setGigs(data);
    } catch (err) {
      console.error("Error loading gigs:", err);
    } finally {
      setLoading(false);
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
      setApplyingTo(null);
      setApplicationMessage("");
      alert("Application sent successfully!");
    } catch (err: any) {
      alert(err.non_field_errors?.[0] || "You have already applied for this gig.");
    }
  }

  const isClient = profile?.role === "client";

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gig Board</h1>
            <p className="text-gray-500 mt-1">
              Find paid opportunities or post a new gig for student creatives.
            </p>
          </div>
          {isClient && (
            <Button onClick={() => setShowPostModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Post a Gig
            </Button>
          )}
        </div>

        {/* Search & Filters */}
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

        {/* Gig List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
          </div>
        ) : gigs.length === 0 ? (
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
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Expires {new Date(gig.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {!isClient && (
                      <Button onClick={() => setApplyingTo(gig.id)}>Apply Now</Button>
                    )}
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
            <p className="text-sm text-gray-500 mb-6">Introduce yourself and explain why you're a good fit.</p>
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
