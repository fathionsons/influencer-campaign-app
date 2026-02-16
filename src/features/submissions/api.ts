import { supabase } from '@/lib/supabase/client';
import type { Campaign, Influencer, Submission } from '@/types';

export interface SubmissionInput {
  campaign_id: string;
  influencer_id: string;
  title: string;
  caption?: string;
  media_type: Submission['media_type'];
  media_url: string;
  due_date: string;
}

export interface SubmissionListItem extends Submission {
  campaign: Pick<Campaign, 'id' | 'campaign_name' | 'brand_name'> | null;
  influencer: Pick<Influencer, 'id' | 'name' | 'handle' | 'platform'> | null;
}

export const listSubmissions = async (
  status: Submission['status'] | 'all'
): Promise<SubmissionListItem[]> => {
  let query = supabase
    .from('submissions')
    .select(
      `
      *,
      campaigns (id,campaign_name,brand_name),
      influencers (id,name,handle,platform)
    `
    )
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

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
          handle: item.influencers.handle,
          platform: item.influencers.platform
        }
      : null
  }));
};

export const getSubmissionById = async (submissionId: string): Promise<SubmissionListItem> => {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      *,
      campaigns (id,campaign_name,brand_name),
      influencers (id,name,handle,platform)
    `
    )
    .eq('id', submissionId)
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    campaign: data.campaigns
      ? {
          id: data.campaigns.id,
          campaign_name: data.campaigns.campaign_name,
          brand_name: data.campaigns.brand_name
        }
      : null,
    influencer: data.influencers
      ? {
          id: data.influencers.id,
          name: data.influencers.name,
          handle: data.influencers.handle,
          platform: data.influencers.platform
        }
      : null
  };
};

export const createSubmissionRequest = async (input: SubmissionInput): Promise<Submission> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      campaign_id: input.campaign_id,
      influencer_id: input.influencer_id,
      title: input.title,
      caption: input.caption ?? null,
      media_type: input.media_type,
      media_url: input.media_url,
      due_date: input.due_date,
      status: 'submitted',
      submitted_at: now
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export interface SubmissionStatusPayload {
  status: 'approved' | 'needs_changes' | 'rejected';
  feedback?: string;
}

export const updateSubmissionStatus = async (
  submissionId: string,
  payload: SubmissionStatusPayload
): Promise<Submission> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: payload.status,
      feedback: payload.feedback ?? null,
      reviewed_at: now,
      updated_at: now
    })
    .eq('id', submissionId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};
