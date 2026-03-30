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
import { Avatar } from "@/components/ui/avatar";
import { Camera, Save, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    school: profile?.school || "",
    discipline: profile?.discipline || "",
    location: profile?.location || "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append("avatar", file);
      const updatedProfile = await api.profiles.update(profile.id, data, true);
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Error uploading avatar:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setSuccess(false);

    try {
      const updatedProfile = await api.profiles.update(profile.id, formData);
      setProfile(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!profile) return null;

  return (
    <DashboardShell>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your profile information and account preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Avatar */}
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar
                  src={profile.avatar}
                  name={profile.name}
                  size="xl"
                  className="mx-auto"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  ) : (
                    <Camera className="h-4 w-4 text-gray-600" />
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
              </div>
            </Card>

            <Card className="p-4">
              <nav className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-600">
                  Public Profile
                </button>
                <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
                  Account Security
                </button>
                <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
                  Billing & Subscription
                </button>
                <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
                  Notifications
                </button>
              </nav>
            </Card>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="unique-username"
                  />
                </div>

                <Textarea
                  label="Bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell the world about yourself..."
                  rows={4}
                />

                {profile.role === "student" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                      label="Discipline"
                      value={formData.discipline}
                      onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                      options={DISCIPLINES.map((d) => ({ value: d, label: d }))}
                    />
                    <Input
                      label="School"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    />
                  </div>
                )}

                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., New York, NY"
                />

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {success && (
                      <span className="flex items-center gap-1 text-sm text-green-600 animate-in fade-in slide-in-from-left-2">
                        <CheckCircle className="h-4 w-4" /> Changes saved!
                      </span>
                    )}
                  </div>
                  <Button type="submit" loading={loading} className="px-8">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
