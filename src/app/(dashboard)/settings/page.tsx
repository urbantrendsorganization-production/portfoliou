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
import { Modal } from "@/components/ui/modal";
import {
  Camera,
  Save,
  Loader2,
  CheckCircle,
  Lock,
  CreditCard,
  Bell,
  User,
  Shield,
  AlertTriangle,
  Sparkles,
  ImagePlus,
  Briefcase,
} from "lucide-react";
import { useState, useEffect } from "react";

type SettingsTab = "profile" | "security" | "billing" | "notifications";

const TAB_CONFIG = [
  { key: "profile" as const, label: "Public Profile", icon: User },
  { key: "security" as const, label: "Account Security", icon: Shield },
  { key: "billing" as const, label: "Billing & Subscription", icon: CreditCard },
  { key: "notifications" as const, label: "Notifications", icon: Bell },
];

const PREMIUM_BENEFITS = [
  "Priority in search results",
  "Verified badge",
  "Advanced analytics",
  "Priority support",
];

interface NotificationPrefs {
  email_messages: boolean;
  email_gig_applications: boolean;
  email_application_status: boolean;
  push_messages: boolean;
  push_gig_updates: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  email_messages: true,
  email_gig_applications: true,
  email_application_status: true,
  push_messages: true,
  push_gig_updates: false,
};

function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const stored = localStorage.getItem("notification_prefs");
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_NOTIFICATION_PREFS;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer group">
      <div className="pr-4">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile form state
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
  const [uploadingCover, setUploadingCover] = useState(false);

  // Security form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Premium upgrade state
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Notification prefs state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS
  );

  useEffect(() => {
    setNotifPrefs(loadNotificationPrefs());
  }, []);

  function updateNotifPref(key: keyof NotificationPrefs, value: boolean) {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    try {
      localStorage.setItem("notification_prefs", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  /** Resize and compress an image file using canvas before upload.
   *  Keeps the file well under the server's 10 MB limit. */
  async function compressImage(
    file: File,
    maxDimension: number,
    quality = 0.82
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = Math.min(1, maxDimension / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Compression failed")); return; }
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file, 800);
      const data = new FormData();
      data.append("avatar", compressed);
      const updatedProfile = await api.profiles.update(profile.id, data, true);
      setProfile(updatedProfile);
    } catch {
      // silently ignore upload errors — user can retry
    } finally {
      setUploading(false);
    }
  }

  async function handleCoverImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingCover(true);
    try {
      const compressed = await compressImage(file, 1600);
      const data = new FormData();
      data.append("cover_image", compressed);
      const updatedProfile = await api.profiles.update(profile.id, data, true);
      setProfile(updatedProfile);
    } catch {
      // silently ignore upload errors — user can retry
    } finally {
      setUploadingCover(false);
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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);

    const errors: Record<string, string> = {};

    if (!passwordForm.current_password) {
      errors.current_password = "Current password is required";
    }
    if (!passwordForm.new_password) {
      errors.new_password = "New password is required";
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = "Password must be at least 8 characters";
    }
    if (!passwordForm.confirm_password) {
      errors.confirm_password = "Please confirm your new password";
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    try {
      await api.profiles.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess(true);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password";
      setPasswordErrors({ current_password: message });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setDeleteError("Password is required");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await api.profiles.deleteAccount({ password: deletePassword });
      api.auth.logout();
      window.location.href = "/";
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { error?: string })?.error || "Failed to delete account";
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleUpgradePremium() {
    setUpgradeLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const plan =
        profile?.role === "client" ? "client_premium" : "student_premium";
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Stripe checkout error:", data.error);
      }
    } catch (err) {
      console.error("Error starting checkout:", err);
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Stripe portal error:", data.error);
      }
    } catch (err) {
      console.error("Error opening portal:", err);
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleToggleOpenToWork() {
    if (!profile) return;
    try {
      const updatedProfile = await api.profiles.update(profile.id, {
        open_to_work: !profile.open_to_work,
      });
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Error toggling open to work:", err);
    }
  }

  if (!profile) return null;

  return (
    <DashboardShell>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Account Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your profile information and account preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
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
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{profile.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {profile.role}
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <nav className="space-y-1">
                {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                      activeTab === key
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="md:col-span-2 space-y-6">
            {/* ========== PUBLIC PROFILE TAB ========== */}
            {activeTab === "profile" && (
              <>
                {/* Cover Photo Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Cover Photo
                  </h3>
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {profile.cover_image_url ? (
                      <img
                        src={profile.cover_image_url}
                        alt="Cover"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-800">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          No cover photo set
                        </p>
                      </div>
                    )}
                    <label className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                      {uploadingCover ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      {uploadingCover ? "Uploading..." : "Upload Cover"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        disabled={uploadingCover}
                      />
                    </label>
                  </div>
                </Card>

                {/* Profile Form */}
                <Card className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="unique-username"
                      />
                    </div>

                    <Textarea
                      label="Bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell the world about yourself..."
                      rows={4}
                    />

                    {profile.role === "student" && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Select
                          label="Discipline"
                          value={formData.discipline}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discipline: e.target.value,
                            })
                          }
                          options={DISCIPLINES.map((d) => ({
                            value: d,
                            label: d,
                          }))}
                        />
                        <Input
                          label="School"
                          value={formData.school}
                          onChange={(e) =>
                            setFormData({ ...formData, school: e.target.value })
                          }
                        />
                      </div>
                    )}

                    <Input
                      label="Location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., New York, NY"
                    />

                    {profile.role === "student" && (
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <ToggleSwitch
                          checked={profile.open_to_work}
                          onChange={handleToggleOpenToWork}
                          label="Open to Work"
                          description="Let clients know you're available for gigs and freelance work"
                        />
                        {profile.open_to_work && (
                          <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> Your profile will
                            show an &quot;Open to Work&quot; badge
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
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
              </>
            )}

            {/* ========== ACCOUNT SECURITY TAB ========== */}
            {activeTab === "security" && (
              <>
                {/* Email display */}
                <Card className="p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Email Address
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Your email is associated with your account and cannot be
                    changed here.
                  </p>
                  <Input
                    label="Email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                </Card>

                {/* Change Password */}
                <Card className="p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Update your password to keep your account secure.
                  </p>

                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-4 max-w-md"
                  >
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current_password: e.target.value,
                        })
                      }
                      error={passwordErrors.current_password}
                      autoComplete="current-password"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      error={passwordErrors.new_password}
                      helperText="Must be at least 8 characters"
                      autoComplete="new-password"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm_password: e.target.value,
                        })
                      }
                      error={passwordErrors.confirm_password}
                      autoComplete="new-password"
                    />

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        loading={passwordLoading}
                        className="px-6"
                      >
                        <Lock className="h-4 w-4" /> Update Password
                      </Button>
                      {passwordSuccess && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" /> Password updated
                          successfully!
                        </span>
                      )}
                    </div>
                  </form>
                </Card>

                {/* Danger Zone */}
                <Card className="p-8 border-red-200 dark:border-red-900">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-50 dark:bg-red-950/50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                        Once you delete your account, there is no going back.
                        All your data, projects, and connections will be
                        permanently removed.
                      </p>
                      <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <AlertTriangle className="h-4 w-4" /> Delete My Account
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Delete Account Modal */}
                <Modal
                  isOpen={showDeleteModal}
                  onClose={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  title="Delete Account"
                  size="sm"
                >
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-red-800">
                        This action is <strong>permanent</strong>. All your
                        portfolio items, messages, and profile data will be
                        deleted forever.
                      </p>
                    </div>
                    <Input
                      label="Enter your password to confirm"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      error={deleteError}
                      autoComplete="current-password"
                    />
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeletePassword("");
                          setDeleteError("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        loading={deleteLoading}
                        className="flex-1"
                      >
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                </Modal>
              </>
            )}

            {/* ========== BILLING & SUBSCRIPTION TAB ========== */}
            {activeTab === "billing" && (
              <>
                {/* Current Plan */}
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Current Plan
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your subscription and billing details.
                      </p>
                    </div>
                    {profile.is_premium ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Sparkles className="h-4 w-4" /> Premium Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                        Free Plan
                      </span>
                    )}
                  </div>

                  {profile.is_premium ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        You are on the Premium plan. Thank you for supporting
                        Portfoliou!
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleManageSubscription}
                        loading={portalLoading}
                      >
                        <CreditCard className="h-4 w-4" /> Manage Subscription
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-lg border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Upgrade to Premium &mdash;{" "}
                          <span className="text-indigo-600">
                            ${profile.role === "client" ? "35" : "8"}/mo
                          </span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Unlock powerful features to boost your visibility and
                          grow your professional presence.
                        </p>
                        <ul className="space-y-2 mb-6">
                          {PREMIUM_BENEFITS.map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={handleUpgradePremium}
                          loading={upgradeLoading}
                          className="px-6"
                        >
                          <Sparkles className="h-4 w-4" /> Upgrade to Premium
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </>
            )}

            {/* ========== NOTIFICATIONS TAB ========== */}
            {activeTab === "notifications" && (
              <>
                <Card className="p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Choose how you want to be notified about activity on your
                    account.
                  </p>

                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Email Notifications
                    </h4>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <ToggleSwitch
                        checked={notifPrefs.email_messages}
                        onChange={(v) => updateNotifPref("email_messages", v)}
                        label="New messages"
                        description="Receive an email when someone sends you a message"
                      />
                      <ToggleSwitch
                        checked={notifPrefs.email_gig_applications}
                        onChange={(v) =>
                          updateNotifPref("email_gig_applications", v)
                        }
                        label="Gig applications"
                        description="Receive an email when someone applies to your gig"
                      />
                      <ToggleSwitch
                        checked={notifPrefs.email_application_status}
                        onChange={(v) =>
                          updateNotifPref("email_application_status", v)
                        }
                        label="Application status changes"
                        description="Receive an email when your application status is updated"
                      />
                    </div>
                  </div>

                  <div className="mt-8 space-y-1">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Push Notifications
                    </h4>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <ToggleSwitch
                        checked={notifPrefs.push_messages}
                        onChange={(v) => updateNotifPref("push_messages", v)}
                        label="Messages"
                        description="Receive push notifications for new messages"
                      />
                      <ToggleSwitch
                        checked={notifPrefs.push_gig_updates}
                        onChange={(v) => updateNotifPref("push_gig_updates", v)}
                        label="Gig updates"
                        description="Receive push notifications for gig status changes"
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
