"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppStore } from "@/lib/store";
import { formatDate, cn, getDisciplineColor } from "@/utils/helpers";
import {
  Search,
  Crown,
  Trash2,
  Users,
  Loader2,
  Eye,
  X,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
} from "lucide-react";

interface AdminProfile {
  id: number;
  user: number;
  user_username: string;
  email: string;
  is_staff: boolean;
  role: string;
  name: string;
  username: string | null;
  school: string;
  discipline: string;
  bio: string;
  avatar: string | null;
  avatar_url: string | null;
  skills: string[];
  location: string;
  is_premium: boolean;
  open_to_work: boolean;
  created_at: string;
  updated_at: string;
  date_joined: string;
}

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "client", label: "Client" },
];

const disciplineOptions = [
  { value: "", label: "All Disciplines" },
  { value: "Beauty & Cosmetology", label: "Beauty & Cosmetology" },
  { value: "Web/App Development", label: "Web/App Development" },
  { value: "Graphic Design", label: "Graphic Design" },
  { value: "Fashion & Styling", label: "Fashion & Styling" },
];

export default function AdminUsersPage() {
  const { addToast } = useAppStore();
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingPremium, setTogglingPremium] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (disciplineFilter) params.discipline = disciplineFilter;
      const data = await api.admin.users(params);
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, disciplineFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  async function handleTogglePremium(user: AdminProfile) {
    setTogglingPremium(user.id);
    try {
      await api.admin.updateUser(user.id, { is_premium: !user.is_premium });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_premium: !u.is_premium } : u
        )
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, is_premium: !user.is_premium });
      }
      addToast({
        title: "User Updated",
        message: `${user.name || user.user_username} is now ${!user.is_premium ? "premium" : "free"}.`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to toggle premium:", err);
      addToast({ title: "Error", message: "Failed to update user.", type: "info" });
    } finally {
      setTogglingPremium(null);
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      if (selectedUser?.id === deleteTarget.id) setSelectedUser(null);
      addToast({
        title: "User Deleted",
        message: `${deleteTarget.name || deleteTarget.user_username} has been removed.`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to delete user:", err);
      addToast({ title: "Error", message: "Failed to delete user.", type: "info" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View, search, and manage all platform users.
        </p>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select
          options={roleOptions}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-40"
        />
        <Select
          options={disciplineOptions}
          value={disciplineFilter}
          onChange={(e) => setDisciplineFilter(e.target.value)}
          className="sm:w-52"
        />
      </Card>

      {/* Users table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Discipline</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Premium</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar_url}
                          name={user.name || user.user_username}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.name || user.user_username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{user.username || user.user_username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-48">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "student" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {user.discipline ? (
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", getDisciplineColor(user.discipline))}>
                          {user.discipline}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {user.is_premium ? (
                        <Badge variant="premium">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden xl:table-cell whitespace-nowrap">
                      {formatDate(user.date_joined || user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePremium(user)}
                          disabled={togglingPremium === user.id}
                          className={cn(
                            "p-1.5 rounded-md transition-colors cursor-pointer",
                            user.is_premium
                              ? "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                              : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          )}
                          title={user.is_premium ? "Remove premium" : "Make premium"}
                        >
                          {togglingPremium === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Crown className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete user"
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
          <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
            Showing {users.length} user{users.length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}

      {/* User detail modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-5">
            {/* User header */}
            <div className="flex items-start gap-4">
              <Avatar
                src={selectedUser.avatar_url}
                name={selectedUser.name || selectedUser.user_username}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedUser.name || selectedUser.user_username}
                  </h3>
                  {selectedUser.is_premium && (
                    <Badge variant="premium">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  @{selectedUser.username || selectedUser.user_username}
                </p>
                {selectedUser.bio && (
                  <p className="text-sm text-gray-600 mt-2">{selectedUser.bio}</p>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {selectedUser.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {selectedUser.role === "student" ? (
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                ) : (
                  <Briefcase className="h-4 w-4 text-gray-400" />
                )}
                <span className="capitalize">{selectedUser.role}</span>
              </div>
              {selectedUser.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {selectedUser.location}
                </div>
              )}
              {selectedUser.school && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  {selectedUser.school}
                </div>
              )}
            </div>

            {/* Discipline & skills */}
            {selectedUser.discipline && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Discipline</p>
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", getDisciplineColor(selectedUser.discipline))}>
                  {selectedUser.discipline}
                </span>
              </div>
            )}
            {selectedUser.skills && selectedUser.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-6 text-xs text-gray-400 pt-2 border-t border-gray-100">
              <span>Joined {formatDate(selectedUser.date_joined || selectedUser.created_at)}</span>
              <span>Updated {formatDate(selectedUser.updated_at)}</span>
              <span>Open to work: {selectedUser.open_to_work ? "Yes" : "No"}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant={selectedUser.is_premium ? "secondary" : "primary"}
                size="sm"
                loading={togglingPremium === selectedUser.id}
                onClick={() => handleTogglePremium(selectedUser)}
              >
                <Crown className="h-4 w-4" />
                {selectedUser.is_premium ? "Remove Premium" : "Make Premium"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setSelectedUser(null);
                  setDeleteTarget(selectedUser);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.name || deleteTarget.user_username}
              </span>
              ? This action cannot be undone and will remove all their data including
              work samples, messages, and applications.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDeleteUser}>
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
