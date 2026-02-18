import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';
import {
  assignInfluencerToCampaign,
  createCampaign,
  deleteCampaign,
  getCampaignById,
  listCampaignInfluencers,
  listCampaignSubmissions,
  listCampaigns,
  type CampaignInput
} from '@/features/campaigns/api';
import { updateCampaign } from '@/features/campaigns/api';
import type { Campaign } from '@/types';
import { queryKeys } from '@/utils/queryKeys';

export const useCampaigns = (status: Campaign['status'] | 'all') => {
  return useQuery({
    queryKey: queryKeys.campaigns(status),
    queryFn: () => listCampaigns(status)
  });
};

export const useCampaign = (campaignId: string | null) => {
  return useQuery({
    queryKey: campaignId ? queryKeys.campaign(campaignId) : ['campaign', 'empty'],
    queryFn: () => {
      if (!campaignId) {
        throw new Error('Campaign id missing');
      }

      return getCampaignById(campaignId);
    },
    enabled: Boolean(campaignId)
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CampaignInput) => {
      if (!user?.id) {
        throw new Error('You must be signed in to create campaigns');
      }

      return createCampaign(user.id, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    }
  });
};

export const useUpdateCampaign = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<CampaignInput>) => updateCampaign(campaignId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaign(campaignId) });
    }
  });
};

export const useDeleteCampaign = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteCampaign(campaignId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      await queryClient.invalidateQueries({ queryKey: ['campaign'] });
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      await queryClient.invalidateQueries({ queryKey: ['payouts'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};

export const useCampaignInfluencers = (campaignId: string | null) => {
  return useQuery({
    queryKey: campaignId
      ? queryKeys.campaignInfluencers(campaignId)
      : ['campaign', 'influencers', 'empty'],
    queryFn: () => {
      if (!campaignId) {
        throw new Error('Campaign id missing');
      }

      return listCampaignInfluencers(campaignId);
    },
    enabled: Boolean(campaignId)
  });
};

export const useAssignInfluencer = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { influencer_id: string; role?: string; agreed_fee?: number }) => {
      return assignInfluencerToCampaign({
        campaign_id: campaignId,
        influencer_id: input.influencer_id,
        role: input.role ?? null,
        agreed_fee: input.agreed_fee ?? null
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaignInfluencers(campaignId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaign(campaignId) });
    }
  });
};

export const useCampaignSubmissions = (campaignId: string | null) => {
  return useQuery({
    queryKey: campaignId
      ? queryKeys.campaignSubmissions(campaignId)
      : ['campaign', 'submissions', 'empty'],
    queryFn: () => {
      if (!campaignId) {
        throw new Error('Campaign id missing');
      }

      return listCampaignSubmissions(campaignId);
    },
    enabled: Boolean(campaignId)
  });
};
