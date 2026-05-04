"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/utils/helpers";
import {
  Search,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Video,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";

interface AdminWorkSample {
  id: number;
  profile: number;
  owner_name: string;
  owner_username: string;
  title: string;
  description: string;
  sample_type: string;
  media: string | null;
  media_url: string | null;
  link: string;
  thumbnail: string | null;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
}

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "link", label: "Link" },
];

const typeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  link: <LinkIcon className="h-4 w-4" />,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, "");

function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BACKEND_BASE}${url}`;
  return `${BACKEND_BASE}/${url}`;
}

export default function AdminContentPage() {
  const { addToast } = useAppStore();
  const [samples, setSamples] = useState<AdminWorkSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminWorkSample | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSamples = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const data = await api.admin.workSamples(params);
      setSamples(data);
    } catch (err) {
      console.error("Failed to load work samples:", err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchSamples, 300);
    return () => clearTimeout(timeout);
  }, [fetchSamples]);

  async function handleDeleteSample() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteWorkSample(deleteTarget.id);
      setSamples((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      addToast({
        title: "Work Sample Deleted",
        message: `"${deleteTarget.title}" has been removed.`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to delete work sample:", err);
      addToast({ title: "Error", message: "Failed to delete work sample.", type: "info" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function getThumbnailSrc(sample: AdminWorkSample): string | null {
    if (sample.thumbnail_url) return resolveMediaUrl(sample.thumbnail_url);
    if (sample.sample_type === "image" && sample.media_url) return resolveMediaUrl(sample.media_url);
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Moderation</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review and manage all work samples uploaded to the platform.
        </p>
      </div>

      {/* Filters */}
      <Card className="flex flex-col md:flex-row gap-4 p-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full md:w-40"
        />
      </Card>

      {/* Content table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : samples.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No work samples found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Preview</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 hidden md:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 hidden lg:table-cell">Tags</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {samples.map((sample) => {
                  const thumbSrc = getThumbnailSrc(sample);
                  return (
                    <tr key={sample.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200 dark:ring-gray-600">
                          {thumbSrc ? (
                            <img
                              src={thumbSrc}
                              alt={sample.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">
                              {typeIcons[sample.sample_type] || <ImageIcon className="h-4 w-4" />}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-56">{sample.title}</p>
                          {sample.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-56 mt-0.5">{sample.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        <div className="min-w-0">
                          <p className="truncate text-gray-900 dark:text-gray-100">{sample.owner_name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">@{sample.owner_username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="secondary" className="whitespace-nowrap">
                          <span className="mr-1.5 opacity-70">{typeIcons[sample.sample_type]}</span>
                          {sample.sample_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {sample.tags && sample.tags.length > 0 ? (
                            sample.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] uppercase tracking-wider">{tag}</Badge>
                            ))
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">--</span>
                          )}
                          {sample.tags && sample.tags.length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">+{sample.tags.length - 3}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {sample.link && (
                            <a
                              href={sample.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                              title="Open link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteTarget(sample)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                            title="Delete work sample"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            Showing {samples.length} work sample{samples.length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Work Sample"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-900">&quot;{deleteTarget.title}&quot;</span>
              {" "}by {deleteTarget.owner_name || deleteTarget.owner_username}?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDeleteSample}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
