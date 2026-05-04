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
import { formatDate, cn, getDisciplineColor } from "@/utils/helpers";
import {
  Search,
  Trash2,
  Briefcase,
  Loader2,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";

interface AdminGig {
  id: number;
  client_profile: number;
  client_name: string;
  client_username: string;
  title: string;
  description: string;
  discipline: string;
  budget: string;
  deadline: string | null;
  status: string;
  applications_count: number;
  created_at: string;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

const disciplineOptions = [
  { value: "", label: "All Disciplines" },
  { value: "Beauty & Cosmetology", label: "Beauty & Cosmetology" },
  { value: "Web/App Development", label: "Web/App Development" },
  { value: "Graphic Design", label: "Graphic Design" },
  { value: "Fashion & Styling", label: "Fashion & Styling" },
];

const statusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
  open: "success",
  in_progress: "warning",
  closed: "default",
};

export default function AdminGigsPage() {
  const { addToast } = useAppStore();
  const [gigs, setGigs] = useState<AdminGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminGig | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedGig, setExpandedGig] = useState<AdminGig | null>(null);

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (disciplineFilter) params.discipline = disciplineFilter;
      const data = await api.admin.gigs(params);
      setGigs(data);
    } catch (err) {
      console.error("Failed to load gigs:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, disciplineFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchGigs, 300);
    return () => clearTimeout(timeout);
  }, [fetchGigs]);

  async function handleDeleteGig() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteGig(deleteTarget.id);
      setGigs((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      if (expandedGig?.id === deleteTarget.id) setExpandedGig(null);
      addToast({
        title: "Gig Deleted",
        message: `"${deleteTarget.title}" has been removed.`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to delete gig:", err);
      addToast({ title: "Error", message: "Failed to delete gig.", type: "info" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gig Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage all gigs posted on the platform.
        </p>
      </div>

      {/* Filters */}
      <Card className="flex flex-col md:flex-row gap-4 p-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search gigs by title or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
        <div className="flex flex-row gap-3 w-full md:w-auto">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-40"
          />
          <Select
            options={disciplineOptions}
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="flex-1 md:w-52"
          />
        </div>
      </Card>

      {/* Gigs table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : gigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No gigs found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 hidden sm:table-cell">Discipline</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 hidden sm:table-cell">Apps</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 hidden xl:table-cell">Budget</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {gigs.map((gig) => (
                  <tr
                    key={gig.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedGig(gig)}
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-64">{gig.title}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      <span className="truncate">{gig.client_name || gig.client_username || "--"}</span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      {gig.discipline ? (
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", getDisciplineColor(gig.discipline))}>
                          {gig.discipline}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">--</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[gig.status] || "default"}>
                        {gig.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {gig.applications_count}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                      {gig.budget || "--"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteTarget(gig)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                          title="Delete gig"
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
            Showing {gigs.length} gig{gigs.length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}

      {/* Gig detail modal */}
      <Modal
        isOpen={!!expandedGig}
        onClose={() => setExpandedGig(null)}
        title="Gig Details"
        size="lg"
      >
        {expandedGig && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{expandedGig.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Posted by {expandedGig.client_name || expandedGig.client_username}
              </p>
            </div>

            {expandedGig.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{expandedGig.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
                <Badge variant={statusVariant[expandedGig.status] || "default"}>
                  {expandedGig.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Applications</p>
                <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                  <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {expandedGig.applications_count}
                </div>
              </div>
              {expandedGig.budget && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Budget</p>
                  <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                    <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    {expandedGig.budget}
                  </div>
                </div>
              )}
              {expandedGig.deadline && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Deadline</p>
                  <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    {formatDate(expandedGig.deadline)}
                  </div>
                </div>
              )}
            </div>

            {expandedGig.discipline && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Discipline</p>
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", getDisciplineColor(expandedGig.discipline))}>
                  {expandedGig.discipline}
                </span>
              </div>
            )}

            <div className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
              Created {formatDate(expandedGig.created_at)}
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setExpandedGig(null);
                  setDeleteTarget(expandedGig);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Gig
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Gig"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete the gig{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{deleteTarget.title}&quot;</span>?
              This will also remove all associated applications.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDeleteGig}>
                Delete Gig
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
