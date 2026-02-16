export type CampaignStatus = 'draft' | 'active' | 'completed';

export interface Campaign {
  id: string;
  owner_user_id: string;
  brand_name: string;
  campaign_name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  budget: number;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export type InfluencerPlatform = 'instagram' | 'tiktok' | 'youtube' | 'other';

export interface Influencer {
  id: string;
  owner_user_id: string;
  name: string;
  platform: InfluencerPlatform;
  handle: string;
  followers: number;
  engagement_rate: number;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignInfluencerStatus = 'invited' | 'active' | 'completed';

export interface CampaignInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  role: string | null;
  agreed_fee: number | null;
  status: CampaignInfluencerStatus;
  created_at: string;
  updated_at: string;
}

export type SubmissionMediaType = 'image' | 'video' | 'link';
export type SubmissionStatus = 'submitted' | 'needs_changes' | 'approved' | 'rejected';

export interface Submission {
  id: string;
  campaign_id: string;
  influencer_id: string;
  title: string;
  caption: string | null;
  media_type: SubmissionMediaType;
  media_url: string;
  due_date: string;
  status: SubmissionStatus;
  feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PayoutStatus = 'unpaid' | 'paid';

export interface Payout {
  id: string;
  campaign_id: string;
  influencer_id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  due_date: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationDevice {
  id: string;
  user_id: string;
  one_signal_id: string;
  platform: string | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardCounts {
  pendingApprovals: number;
  needsChanges: number;
  overdueSubmissions: number;
  upcomingDeadlines: number;
  unpaidPayouts: number;
}

export interface ChartPoint {
  date: string;
  value: number;
}

export interface CampaignKpis {
  totalSubmissions: number;
  approvalRate: number;
  avgApprovalHours: number;
}

export interface InfluencerLeaderboardRow {
  influencerId: string;
  influencerName: string;
  approvedCount: number;
}

export type AnalyticsRange = 7 | 30;
