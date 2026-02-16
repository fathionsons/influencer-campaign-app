import { supabase } from '@/lib/supabase/client';
import type { Campaign, Influencer, Payout } from '@/types';

export interface PayoutListItem extends Payout {
  campaign: Pick<Campaign, 'id' | 'campaign_name' | 'brand_name'> | null;
  influencer: Pick<Influencer, 'id' | 'name' | 'handle'> | null;
}

export const listPayouts = async (): Promise<PayoutListItem[]> => {
  const { data, error } = await supabase
    .from('payouts')
    .select(
      `
      *,
      campaigns (id,campaign_name,brand_name),
      influencers (id,name,handle)
    `
    )
    .order('due_date', { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((item) => ({
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

  const { data, error } = await supabase
    .from('payouts')
    .update({
      status: 'paid',
      paid_at: now,
      updated_at: now
    })
    .eq('id', payoutId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};
