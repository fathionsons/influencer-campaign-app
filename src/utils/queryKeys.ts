import type { AnalyticsRange, CampaignStatus, SubmissionStatus } from '@/types';

export const queryKeys = {
  campaigns: (status: CampaignStatus | 'all' = 'all') => ['campaigns', status] as const,
  campaign: (campaignId: string) => ['campaign', campaignId] as const,
  campaignInfluencers: (campaignId: string) => ['campaign', campaignId, 'influencers'] as const,
  campaignSubmissions: (campaignId: string) => ['campaign', campaignId, 'submissions'] as const,
  influencers: () => ['influencers'] as const,
  influencer: (influencerId: string) => ['influencer', influencerId] as const,
  influencerCampaigns: (influencerId: string) => ['influencer', influencerId, 'campaigns'] as const,
  submissions: (status: SubmissionStatus | 'all' = 'all') => ['submissions', status] as const,
  submission: (submissionId: string) => ['submission', submissionId] as const,
  payouts: () => ['payouts'] as const,
  payout: (payoutId: string) => ['payout', payoutId] as const,
  dashboard: () => ['dashboard'] as const,
  analytics: (range: AnalyticsRange) => ['analytics', range] as const
};
