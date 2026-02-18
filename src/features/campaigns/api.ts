import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

import {
  assignLocalInfluencerToCampaign,
  createLocalCampaign,
  deleteLocalCampaign,
  getLocalCampaign,
  getLocalCampaignById,
  getLocalInfluencerById,
  listLocalCampaignInfluencers,
  listLocalCampaigns,
  listLocalSubmissions,
  updateLocalCampaign
} from '@/lib/localStore';
import { supabase } from '@/lib/supabase/client';
import type { Campaign, CampaignInfluencer, Influencer, Submission } from '@/types';
import { isSupabaseConfigured } from '@/utils/env';

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
  if (!isSupabaseConfigured() || !supabase) {
    return listLocalCampaigns(status);
  }

  let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = (await query) as PostgrestResponse<Campaign>;
  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getCampaignById = async (campaignId: string): Promise<Campaign> => {
  if (!isSupabaseConfigured() || !supabase) {
    return getLocalCampaign(campaignId);
  }

  const { data, error } = (await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()) as PostgrestSingleResponse<Campaign>;

  if (error) {
    throw error;
  }

  return data;
};

export const createCampaign = async (ownerUserId: string, input: CampaignInput): Promise<Campaign> => {
  if (!isSupabaseConfigured() || !supabase) {
    return createLocalCampaign({
      owner_user_id: ownerUserId,
      ...input,
      description: input.description ?? null
    });
  }

  const { data, error } = (await supabase
    .from('campaigns')
    .insert({
      owner_user_id: ownerUserId,
      ...input
    })
    .select('*')
    .single()) as PostgrestSingleResponse<Campaign>;

  if (error) {
    throw error;
  }

  return data;
};

export const updateCampaign = async (
  campaignId: string,
  input: Partial<CampaignInput>
): Promise<Campaign> => {
  if (!isSupabaseConfigured() || !supabase) {
    return updateLocalCampaign(campaignId, {
      ...input,
      description: input.description ?? null
    });
  }

  const { data, error } = (await supabase
    .from('campaigns')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', campaignId)
    .select('*')
    .single()) as PostgrestSingleResponse<Campaign>;

  if (error) {
    throw error;
  }

  return data;
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    deleteLocalCampaign(campaignId);
    return;
  }

  const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
  if (error) {
    throw error;
  }
};

export const listCampaignInfluencers = async (
  campaignId: string
): Promise<CampaignInfluencerDetails[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    const influencerCache = new Map<string, Influencer | null>();
    const getLocalInfluencer = (id: string): Influencer | null => {
      if (!influencerCache.has(id)) {
        influencerCache.set(id, getLocalInfluencerById(id));
      }
      return influencerCache.get(id) ?? null;
    };

    return listLocalCampaignInfluencers(campaignId).map((item) => {
      const influencer = getLocalInfluencer(item.influencer_id);

      return ({
      ...item,
      influencer: influencer
        ? {
            id: influencer.id,
            name: influencer.name,
            handle: influencer.handle,
            platform: influencer.platform,
            followers: influencer.followers,
            engagement_rate: influencer.engagement_rate
          }
        : null
    });
    });
  }

  type CampaignInfluencerJoin = CampaignInfluencer & { influencers: Influencer | null };

  const { data, error } = (await supabase
    .from('campaign_influencers')
    .select('*, influencers (id,name,handle,platform,followers,engagement_rate)')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })) as PostgrestResponse<CampaignInfluencerJoin>;

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
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
  role?: string | null;
  agreed_fee?: number | null;
}): Promise<CampaignInfluencer> => {
  if (!isSupabaseConfigured() || !supabase) {
    return assignLocalInfluencerToCampaign(input);
  }

  const { data, error } = (await supabase
    .from('campaign_influencers')
    .insert({
      campaign_id: input.campaign_id,
      influencer_id: input.influencer_id,
      role: input.role ?? null,
      agreed_fee: input.agreed_fee ?? null,
      status: 'active'
    })
    .select('*')
    .single()) as PostgrestSingleResponse<CampaignInfluencer>;

  if (error) {
    throw error;
  }

  return data;
};

export const listCampaignSubmissions = async (
  campaignId: string
): Promise<CampaignSubmissionDetails[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    const localSubmissions = listLocalSubmissions('all').filter(
      (item) => item.campaign_id === campaignId
    );
    return localSubmissions.map((item) => {
      const influencer = getLocalInfluencerById(item.influencer_id);

      return ({
        ...item,
        influencer: influencer
          ? {
              id: influencer.id,
              name: influencer.name,
              handle: influencer.handle,
              platform: influencer.platform
            }
          : null
      });
    });
  }

  type CampaignSubmissionJoin = Submission & { influencers: Influencer | null };

  const { data, error } = (await supabase
    .from('submissions')
    .select('*, influencers (id,name,handle,platform)')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })) as PostgrestResponse<CampaignSubmissionJoin>;

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
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
