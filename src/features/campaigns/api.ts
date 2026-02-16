import { supabase } from '@/lib/supabase/client';
import type { Campaign, CampaignInfluencer, Influencer, Submission } from '@/types';

export interface CampaignInput {
  brand_name: string;
  campaign_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: Campaign['status'];
}

export interface CampaignInfluencerDetails extends CampaignInfluencer {
  influencer: Pick<Influencer, 'id' | 'name' | 'handle' | 'platform' | 'followers' | 'engagement_rate'> | null;
}

export interface CampaignSubmissionDetails extends Submission {
  influencer: Pick<Influencer, 'id' | 'name' | 'handle' | 'platform'> | null;
}

export const listCampaigns = async (status: Campaign['status'] | 'all'): Promise<Campaign[]> => {
  let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data;
};

export const getCampaignById = async (campaignId: string): Promise<Campaign> => {
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();

  if (error) {
    throw error;
  }

  return data;
};

export const createCampaign = async (ownerUserId: string, input: CampaignInput): Promise<Campaign> => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      owner_user_id: ownerUserId,
      ...input
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateCampaign = async (
  campaignId: string,
  input: Partial<CampaignInput>
): Promise<Campaign> => {
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', campaignId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const listCampaignInfluencers = async (
  campaignId: string
): Promise<CampaignInfluencerDetails[]> => {
  const { data, error } = await supabase
    .from('campaign_influencers')
    .select(
      `
      *,
      influencers (
        id,
        name,
        handle,
        platform,
        followers,
        engagement_rate
      )
    `
    )
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map((item) => ({
    ...item,
    influencer: item.influencers
      ? {
          id: item.influencers.id,
          name: item.influencers.name,
          handle: item.influencers.handle,
          platform: item.influencers.platform,
          followers: item.influencers.followers,
          engagement_rate: item.influencers.engagement_rate
        }
      : null
  }));
};

export const assignInfluencerToCampaign = async (input: {
  campaign_id: string;
  influencer_id: string;
  role?: string;
  agreed_fee?: number;
}): Promise<CampaignInfluencer> => {
  const { data, error } = await supabase
    .from('campaign_influencers')
    .insert({
      campaign_id: input.campaign_id,
      influencer_id: input.influencer_id,
      role: input.role ?? null,
      agreed_fee: input.agreed_fee ?? null,
      status: 'active'
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const listCampaignSubmissions = async (
  campaignId: string
): Promise<CampaignSubmissionDetails[]> => {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      *,
      influencers (
        id,
        name,
        handle,
        platform
      )
    `
    )
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map((item) => ({
    ...item,
    influencer: item.influencers
      ? {
          id: item.influencers.id,
          name: item.influencers.name,
          handle: item.influencers.handle,
          platform: item.influencers.platform
        }
      : null
  }));
};
