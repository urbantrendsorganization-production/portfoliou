"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { getSkillSuggestions } from "@/utils/constants";
import {
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function PortfolioPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const addToast = useAppStore((s) => s.addToast);
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Skills state
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillsDirty, setSkillsDirty] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const skillInputWrapperRef = useRef<HTMLDivElement>(null);

  // Delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [newSample, setNewSample] = useState({
    title: "",
    description: "",
    sample_type: "image",
    link: "",
    media: null as File | null,
  });

  useEffect(() => {
    if (!profile) return;
    setSkills(Array.isArray(profile.skills) ? profile.skills : []);
    setSkillsDirty(false);
    loadSamples();
  }, [profile]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        skillInputWrapperRef.current &&
        !skillInputWrapperRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setAddError("");

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

      setNewSample({ title: "", description: "", sample_type: "image", link: "", media: null });
      addToast({ type: "success", title: "Work Added", message: "Your work sample has been added to your portfolio." });
      loadSamples();
    } catch (err: any) {
      console.error("Error adding sample:", err);
      const msg =
        err?.media?.[0] ||
        err?.detail ||
        err?.title?.[0] ||
        "Could not add work sample. Please try again.";
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  }

  function requestDelete(id: number) {
    setPendingDeleteId(id);
  }

  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    setDeleting(true);
    try {
      await api.workSamples.delete(pendingDeleteId);
      setSamples((prev) => prev.filter((s) => s.id !== pendingDeleteId));
      addToast({
        type: "success",
        title: "Work Deleted",
        message: "The work sample was removed from your portfolio.",
      });
    } catch (err) {
      console.error("Error deleting sample:", err);
      addToast({
        type: "info",
        title: "Delete Failed",
        message: "Could not delete that work sample. Please try again.",
      });
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  }

  // ── Skills logic ────────────────────────────────────
  const allSuggestions = useMemo(
    () => getSkillSuggestions(profile?.discipline),
    [profile?.discipline]
  );

  const filteredSuggestions = useMemo(() => {
    const query = skillInput.trim().toLowerCase();
    const currentLower = new Set(skills.map((s) => s.toLowerCase()));
    return allSuggestions
      .filter((s) => !currentLower.has(s.toLowerCase()))
      .filter((s) => (query ? s.toLowerCase().includes(query) : true))
      .slice(0, 8);
  }, [allSuggestions, skillInput, skills]);

  function addSkill(raw: string) {
    const skill = raw.trim();
    if (!skill) return;
    const exists = skills.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (exists) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, skill]);
    setSkillInput("");
    setSkillsDirty(true);
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
    setSkillsDirty(true);
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (skillInput.trim()) {
        addSkill(skillInput);
      }
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  }

  async function handleSaveSkills() {
    if (!profile) return;
    setSavingSkills(true);
    try {
      const updated = await api.profiles.update(profile.id, { skills });
      setProfile(updated);
      setSkillsDirty(false);
      addToast({
        type: "success",
        title: "Skills Saved",
        message: "Your skills have been updated successfully.",
      });
    } catch (err) {
      console.error("Error saving skills:", err);
      addToast({
        type: "info",
        title: "Save Failed",
        message: "Could not save your skills. Please try again.",
      });
    } finally {
      setSavingSkills(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Portfolio</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Showcase your best creative work to potential clients.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Add form + Skills */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 h-fit">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Add New Work</h2>
              <form onSubmit={handleAddSample} className="space-y-4">
                <Input
                  label="Title"
                  value={newSample.title}
                  onChange={(e) => setNewSample({ ...newSample, title: e.target.value })}
                  placeholder="e.g., Summer Fashion Campaign"
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
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
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                            : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400"
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
                    <input
                      type="file"
                      accept={newSample.sample_type === "image" ? "image/*" : "video/*"}
                      onChange={(e) => setNewSample({ ...newSample, media: e.target.files?.[0] || null })}
                      className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"
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

                {addError && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{addError}</p>
                  </div>
                )}

                <Button type="submit" fullWidth loading={adding}>
                  <Plus className="h-4 w-4" /> Add to Portfolio
                </Button>
              </form>
            </Card>

            {/* Skills card */}
            <Card className="p-6 h-fit">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Skills</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Highlight what you do best. Suggestions are based on your discipline.
              </p>

              {/* Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[2rem]">
                {skills.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">No skills added yet.</p>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2.5 py-1 border border-indigo-100 dark:border-indigo-900"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 p-0.5 cursor-pointer"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Input with suggestions */}
              <div className="relative" ref={skillInputWrapperRef}>
                <Input
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setSuggestionsOpen(true);
                  }}
                  onFocus={() => setSuggestionsOpen(true)}
                  onKeyDown={handleSkillKeyDown}
                />

                {suggestionsOpen && filteredSuggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addSkill(s);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="button"
                fullWidth
                className="mt-4"
                loading={savingSkills}
                disabled={!skillsDirty}
                onClick={handleSaveSkills}
              >
                <Save className="h-4 w-4" /> Save Skills
              </Button>
            </Card>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Work Samples</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-300 dark:text-gray-600" />
              </div>
            ) : samples.length === 0 ? (
              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <img
                  src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&h=300&fit=crop"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-48 object-cover opacity-20 dark:opacity-10"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your portfolio is empty</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                    Upload images, add links, or embed videos to showcase your creative work.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {samples.map((sample) => (
                  <Card key={sample.id} className="overflow-hidden group">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                      {sample.sample_type === "image" && sample.media && (
                        <img
                          src={sample.media}
                          alt={sample.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {sample.sample_type === "link" && (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                          <LinkIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => requestDelete(sample.id)}
                          className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{sample.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
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

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete Work Sample"
        description="Are you sure you want to delete this work sample? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDeleteId(null);
        }}
      />
    </DashboardShell>
  );
}
