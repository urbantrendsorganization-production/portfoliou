export type Role = "student" | "client";

export type Discipline =
  | ""
  | "Beauty & Cosmetology"
  | "Web/App Development"
  | "Graphic Design"
  | "Fashion & Styling";

export type WorkSampleType = "image" | "link" | "video";
export type GigStatus = "open" | "closed" | "in_progress";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type SubscriptionPlan = "student_premium" | "client_premium";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete";
export type AnalyticsEventType =
  | "profile_view"
  | "link_click"
  | "work_sample_view";

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  tiktok?: string;
  [key: string]: string | undefined;
}

export interface Profile {
  id: number;
  user: number;
  user_username: string;
  email: string;
  is_staff: boolean;
  role: Role;
  name: string;
  username: string | null;
  school: string;
  discipline: Discipline;
  bio: string;
  avatar: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  social_links: SocialLinks;
  skills: string[];
  location: string;
  is_premium: boolean;
  open_to_work: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkSample {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  type: WorkSampleType;
  media_url: string;
  link: string;
  thumbnail_url: string;
  sort_order: number;
  created_at: string;
}

export interface Bookmark {
  id: string;
  client_profile_id: string;
  student_profile_id: string;
  created_at: string;
}

export interface Gig {
  id: string;
  client_profile_id: string;
  title: string;
  description: string;
  discipline: Discipline;
  budget: string;
  deadline: string | null;
  status: GigStatus;
  created_at: string;
}

export interface GigApplication {
  id: string;
  gig_id: string;
  student_profile_id: string;
  message: string;
  status: ApplicationStatus;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  profile_id: string;
  event_type: AnalyticsEventType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
}

// Extended types for joins
export interface GigWithClient extends Gig {
  profiles: Pick<Profile, "id" | "name" | "avatar_url" | "username">;
}

export interface GigApplicationWithStudent extends GigApplication {
  profiles: Pick<Profile, "id" | "name" | "avatar_url" | "username" | "discipline">;
}

export interface BookmarkWithProfile extends Bookmark {
  profiles: Profile;
}

export interface MessageWithSender extends Message {
  sender: Pick<Profile, "id" | "name" | "avatar_url" | "username">;
}
