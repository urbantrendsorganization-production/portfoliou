"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/utils/helpers";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface College {
  id: number;
  name: string;
  short_name: string;
  location: string;
  website: string;
  is_active: boolean;
  created_at: string;
}

type FormState = {
  name: string;
  short_name: string;
  location: string;
  website: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  short_name: "",
  location: "",
  website: "",
  is_active: true,
};

export default function AdminCollegesPage() {
  const { addToast } = useAppStore();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<College | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<College | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.colleges.list();
      setColleges(data);
    } catch (err) {
      console.error("Failed to load colleges:", err);
      addToast({ type: "info", title: "Error", message: "Failed to load colleges." });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(college: College) {
    setEditing(college);
    setForm({
      name: college.name,
      short_name: college.short_name || "",
      location: college.location || "",
      website: college.website || "",
      is_active: college.is_active,
    });
    setFormError("");
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        name: form.name.trim(),
        short_name: form.short_name.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        is_active: form.is_active,
      };
      if (editing) {
        const updated = await api.colleges.update(editing.id, payload);
        setColleges((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        addToast({ type: "success", title: "College Updated", message: `${updated.name} was updated.` });
      } else {
        const created = await api.colleges.create(payload);
        setColleges((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
        );
        addToast({ type: "success", title: "College Added", message: `${created.name} was added.` });
      }
      setFormOpen(false);
    } catch (err: any) {
      console.error("Failed to save college:", err);
      const msg =
        err?.name?.[0] ||
        err?.detail ||
        err?.website?.[0] ||
        "Could not save the college. Please try again.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.colleges.delete(deleteTarget.id);
      setColleges((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      addToast({
        type: "success",
        title: "College Deleted",
        message: `${deleteTarget.name} was removed.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete college:", err);
      addToast({
        type: "info",
        title: "Delete Failed",
        message: "Could not delete the college. Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Colleges</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the list of universities and institutions students can pick from at signup.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add College
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : colleges.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No colleges yet"
          description="Add the first college to populate the signup dropdown."
        />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Short</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Website</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden xl:table-cell">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {colleges.map((college) => (
                  <tr
                    key={college.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {college.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                      {college.short_name || <span className="text-gray-400">--</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {college.location || <span className="text-gray-400">--</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                      {college.website ? (
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Link
                        </a>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {college.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden xl:table-cell whitespace-nowrap">
                      {formatDate(college.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(college)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(college)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            Showing {colleges.length} college{colleges.length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}

      <Modal
        isOpen={formOpen}
        onClose={() => (saving ? undefined : setFormOpen(false))}
        title={editing ? "Edit College" : "Add College"}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., University of Nairobi"
            required
          />
          <Input
            label="Short Name"
            value={form.short_name}
            onChange={(e) => setForm({ ...form, short_name: e.target.value })}
            placeholder="e.g., UoN"
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g., Nairobi, Kenya"
          />
          <Input
            label="Website"
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://..."
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            Active (visible in signup dropdown)
          </label>

          {formError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editing ? "Save Changes" : "Add College"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete College"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Students currently linked to it will have their college unset.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => (deleting ? undefined : setDeleteTarget(null))}
      />
    </div>
  );
}
