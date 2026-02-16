import { supabase } from '@/lib/supabase/client';
import type { Campaign, Influencer, Submission } from '@/types';

export interface InfluencerInput {
  name: string;
  platform: Influencer['platform'];
  handle: string;
  followers: number;
  engagement_rate: number;
  email?: string;
}

export interface InfluencerCampaignLink {
  id: string;
  status: 'invited' | 'active' | 'completed';
  role: string | null;
  agreed_fee: number | null;
  campaign: Pick<Campaign, 'id' | 'campaign_name' | 'brand_name' | 'status'> | null;
}

export interface InfluencerPerformanceSummary {
  totalSubmissions: number;
  approvedSubmissions: number;
  approvalRate: number;
}

export const listInfluencers = async (): Promise<Influencer[]> => {
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getInfluencerById = async (influencerId: string): Promise<Influencer> => {
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', influencerId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createInfluencer = async (
  ownerUserId: string,
  input: InfluencerInput
): Promise<Influencer> => {
  const { data, error } = await supabase
    .from('influencers')
    .insert({
      owner_user_id: ownerUserId,
      ...input,
      email: input.email ?? null
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateInfluencer = async (
  influencerId: string,
  input: Partial<InfluencerInput>
): Promise<Influencer> => {
  const { data, error } = await supabase
    .from('influencers')
    .update({
      ...input,
      email: input.email ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', influencerId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const listInfluencerCampaigns = async (
  influencerId: string
): Promise<InfluencerCampaignLink[]> => {
  const { data, error } = await supabase
    .from('campaign_influencers')
    .select(
      `
      id,
      status,
      role,
      agreed_fee,
      campaigns (
        id,
        campaign_name,
        brand_name,
        status
      )
    `
    )
    .eq('influencer_id', influencerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    status: row.status,
    role: row.role,
    agreed_fee: row.agreed_fee,
    campaign: row.campaigns
      ? {
          id: row.campaigns.id,
          campaign_name: row.campaigns.campaign_name,
          brand_name: row.campaigns.brand_name,
          status: row.campaigns.status
        }
      : null
  }));
};

export const getInfluencerPerformance = async (
  influencerId: string
): Promise<InfluencerPerformanceSummary> => {
  const { data, error } = await supabase
    .from('submissions')
    .select('id,status')
    .eq('influencer_id', influencerId);

  if (error) {
    throw error;
  }

  const totalSubmissions = data.length;
  const approvedSubmissions = data.filter((submission: Pick<Submission, 'status'>) => submission.status === 'approved').length;
  const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

  return {
    totalSubmissions,
    approvedSubmissions,
    approvalRate
  };
};
