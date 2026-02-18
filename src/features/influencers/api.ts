import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

import {
  createLocalInfluencer,
  deleteLocalInfluencer,
  getLocalCampaignById,
  getLocalCampaignByInfluencer,
  getLocalInfluencer,
  listLocalInfluencers,
  listLocalSubmissions,
  updateLocalInfluencer
} from '@/lib/localStore';
import { supabase } from '@/lib/supabase/client';
import type { Campaign, Influencer, Submission } from '@/types';
import { isSupabaseConfigured } from '@/utils/env';

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
  if (!isSupabaseConfigured() || !supabase) {
    return listLocalInfluencers();
  }

  const { data, error } = (await supabase
    .from('influencers')
    .select('*')
    .order('created_at', { ascending: false })) as PostgrestResponse<Influencer>;

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getInfluencerById = async (influencerId: string): Promise<Influencer> => {
  if (!isSupabaseConfigured() || !supabase) {
    return getLocalInfluencer(influencerId);
  }

  const { data, error } = (await supabase
    .from('influencers')
    .select('*')
    .eq('id', influencerId)
    .single()) as PostgrestSingleResponse<Influencer>;

  if (error) {
    throw error;
  }

  return data;
};

export const createInfluencer = async (
  ownerUserId: string,
  input: InfluencerInput
): Promise<Influencer> => {
  if (!isSupabaseConfigured() || !supabase) {
    return createLocalInfluencer({
      owner_user_id: ownerUserId,
      ...input,
      email: input.email ?? null
    });
  }

  const { data, error } = (await supabase
    .from('influencers')
    .insert({
      owner_user_id: ownerUserId,
      ...input,
      email: input.email ?? null
    })
    .select('*')
    .single()) as PostgrestSingleResponse<Influencer>;

  if (error) {
    throw error;
  }

  return data;
};

export const updateInfluencer = async (
  influencerId: string,
  input: Partial<InfluencerInput>
): Promise<Influencer> => {
  if (!isSupabaseConfigured() || !supabase) {
    return updateLocalInfluencer(influencerId, {
      ...input,
      email: input.email ?? null
    });
  }

  const { data, error } = (await supabase
    .from('influencers')
    .update({
      ...input,
      email: input.email ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', influencerId)
    .select('*')
    .single()) as PostgrestSingleResponse<Influencer>;

  if (error) {
    throw error;
  }

  return data;
};

export const deleteInfluencer = async (influencerId: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    deleteLocalInfluencer(influencerId);
    return;
  }

  const { error } = await supabase.from('influencers').delete().eq('id', influencerId);
  if (error) {
    throw error;
  }
};

export const listInfluencerCampaigns = async (
  influencerId: string
): Promise<InfluencerCampaignLink[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    const campaignCache = new Map<string, Campaign | null>();
    const getCampaign = (id: string): Campaign | null => {
      if (!campaignCache.has(id)) {
        campaignCache.set(id, getLocalCampaignById(id));
      }
      return campaignCache.get(id) ?? null;
    };

    return getLocalCampaignByInfluencer(influencerId).map((row) => {
      const campaign = getCampaign(row.campaign_id);

      return ({
      id: row.id,
      status: row.status,
      role: row.role,
      agreed_fee: row.agreed_fee,
      campaign: campaign
        ? {
            id: campaign.id,
            campaign_name: campaign.campaign_name,
            brand_name: campaign.brand_name,
            status: campaign.status
          }
        : null
    });
    });
  }

  type InfluencerCampaignJoin = {
    id: string;
    status: 'invited' | 'active' | 'completed';
    role: string | null;
    agreed_fee: number | null;
    campaigns: Campaign | null;
  };

  const { data, error } = (await supabase
    .from('campaign_influencers')
    .select('id,status,role,agreed_fee,campaigns (id,campaign_name,brand_name,status)')
    .eq('influencer_id', influencerId)
    .order('created_at', { ascending: false })) as PostgrestResponse<InfluencerCampaignJoin>;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
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
  if (!isSupabaseConfigured() || !supabase) {
    const influencerSubmissions = listLocalSubmissions('all').filter(
      (submission) => submission.influencer_id === influencerId
    );
    const totalSubmissions = influencerSubmissions.length;
    const approvedSubmissions = influencerSubmissions.filter(
      (submission) => submission.status === 'approved'
    ).length;
    const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

    return {
      totalSubmissions,
      approvedSubmissions,
      approvalRate
    };
  }

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
