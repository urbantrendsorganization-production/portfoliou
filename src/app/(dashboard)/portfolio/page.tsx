"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function PortfolioPage() {
  const profile = useAppStore((s) => s.profile);
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [newSample, setNewSample] = useState({
    title: "",
    description: "",
    sample_type: "image",
    link: "",
    media: null as File | null,
  });

  useEffect(() => {
    if (!profile) return;
    loadSamples();
  }, [profile]);

  async function loadSamples() {
    try {
      const data = await api.workSamples.list(profile?.id);
      setSamples(data);
    } catch (err) {
      console.error("Error loading samples:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSample(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setAdding(true);

    try {
      const formData = new FormData();
      formData.append("profile", profile.id.toString());
      formData.append("title", newSample.title);
      formData.append("description", newSample.description);
      formData.append("sample_type", newSample.sample_type);
      
      if (newSample.sample_type === "link") {
        formData.append("link", newSample.link);
      } else if (newSample.media) {
        formData.append("media", newSample.media);
      }

      await api.workSamples.create(formData, true);
      
      setNewSample({
        title: "",
        description: "",
        sample_type: "image",
        link: "",
        media: null,
      });
      loadSamples();
    } catch (err) {
      console.error("Error adding sample:", err);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this work sample?")) return;
    try {
      await api.workSamples.delete(id);
      setSamples(samples.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting sample:", err);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Portfolio</h1>
          <p className="text-gray-500 mt-1">
            Showcase your best creative work to potential clients.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <Card className="p-6 h-fit lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Work</h2>
            <form onSubmit={handleAddSample} className="space-y-4">
              <Input
                label="Title"
                value={newSample.title}
                onChange={(e) => setNewSample({ ...newSample, title: e.target.value })}
                placeholder="e.g., Summer Fashion Campaign"
                required
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "image", icon: ImageIcon, label: "Image" },
                    { id: "link", icon: LinkIcon, label: "Link" },
                    { id: "video", icon: Video, label: "Video" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewSample({ ...newSample, sample_type: t.id })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        newSample.sample_type === t.id
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                          : "border-gray-100 hover:border-gray-200 text-gray-500"
                      }`}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {newSample.sample_type === "link" ? (
                <Input
                  label="URL"
                  type="url"
                  value={newSample.link}
                  onChange={(e) => setNewSample({ ...newSample, link: e.target.value })}
                  placeholder="https://..."
                  required
                />
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">File</label>
                  <input
                    type="file"
                    accept={newSample.sample_type === "image" ? "image/*" : "video/*"}
                    onChange={(e) => setNewSample({ ...newSample, media: e.target.files?.[0] || null })}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    required
                  />
                </div>
              )}

              <Textarea
                label="Description"
                value={newSample.description}
                onChange={(e) => setNewSample({ ...newSample, description: e.target.value })}
                placeholder="Briefly describe this project..."
                rows={3}
              />

              <Button type="submit" fullWidth loading={adding}>
                <Plus className="h-4 w-4" /> Add to Portfolio
              </Button>
            </form>
          </Card>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Your Work Samples</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
              </div>
            ) : samples.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No work samples added yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {samples.map((sample) => (
                  <Card key={sample.id} className="overflow-hidden group">
                    <div className="aspect-video bg-gray-100 relative">
                      {sample.sample_type === "image" && sample.media && (
                        <img
                          src={sample.media}
                          alt={sample.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {sample.sample_type === "link" && (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                          <LinkIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(sample.id)}
                          className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-red-50 shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">{sample.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {sample.description}
                      </p>
                      {sample.link && (
                        <a
                          href={sample.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium mt-3 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> View Project
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
