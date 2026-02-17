import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

import { getLocalCampaignById, getLocalInfluencerById, listLocalPayouts, markLocalPayoutPaid } from '@/lib/localStore';
import { supabase } from '@/lib/supabase/client';
import type { Campaign, Influencer, Payout } from '@/types';
import { isSupabaseConfigured } from '@/utils/env';

export interface PayoutListItem extends Payout {
  campaign: Pick<Campaign, 'id' | 'campaign_name' | 'brand_name'> | null;
  influencer: Pick<Influencer, 'id' | 'name' | 'handle'> | null;
}

export const listPayouts = async (): Promise<PayoutListItem[]> => {
  if (!isSupabaseConfigured() || !supabase) {
    const local = listLocalPayouts();
    return local.map((item) => {
      const campaign = getLocalCampaignById(item.campaign_id);
      const influencer = getLocalInfluencerById(item.influencer_id);
      return {
        ...item,
        campaign: campaign
          ? {
              id: campaign.id,
              campaign_name: campaign.campaign_name,
              brand_name: campaign.brand_name
            }
          : null,
        influencer: influencer
          ? {
              id: influencer.id,
              name: influencer.name,
              handle: influencer.handle
            }
          : null
      };
    });
  }

  type PayoutJoin = Payout & { campaigns: Campaign | null; influencers: Influencer | null };

  const { data, error } = (await supabase
    .from('payouts')
    .select('*, campaigns (id,campaign_name,brand_name), influencers (id,name,handle)')
    .order('due_date', { ascending: true })) as PostgrestResponse<PayoutJoin>;

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    ...item,
    campaign: item.campaigns
      ? {
          id: item.campaigns.id,
          campaign_name: item.campaigns.campaign_name,
          brand_name: item.campaigns.brand_name
        }
      : null,
    influencer: item.influencers
      ? {
          id: item.influencers.id,
          name: item.influencers.name,
          handle: item.influencers.handle
        }
      : null
  }));
};

export const markPayoutPaid = async (payoutId: string): Promise<Payout> => {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured() || !supabase) {
    return markLocalPayoutPaid(payoutId);
  }

  const { data, error } = (await supabase
    .from('payouts')
    .update({
      status: 'paid',
      paid_at: now,
      updated_at: now
    })
    .eq('id', payoutId)
    .select('*')
    .single()) as PostgrestSingleResponse<Payout>;

  if (error) {
    throw error;
  }

  return data;
};
