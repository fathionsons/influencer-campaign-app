import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';
import {
  createInfluencer,
  getInfluencerById,
  getInfluencerPerformance,
  listInfluencerCampaigns,
  listInfluencers,
  type InfluencerInput,
  updateInfluencer
} from '@/features/influencers/api';
import { queryKeys } from '@/utils/queryKeys';

export const useInfluencers = () => {
  return useQuery({
    queryKey: queryKeys.influencers(),
    queryFn: listInfluencers
  });
};

export const useInfluencer = (influencerId: string | null) => {
  return useQuery({
    queryKey: influencerId ? queryKeys.influencer(influencerId) : ['influencer', 'empty'],
    queryFn: () => {
      if (!influencerId) {
        throw new Error('Influencer id missing');
      }

      return getInfluencerById(influencerId);
    },
    enabled: Boolean(influencerId)
  });
};

export const useCreateInfluencer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: InfluencerInput) => {
      if (!user?.id) {
        throw new Error('You must be signed in to create influencers');
      }

      return createInfluencer(user.id, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.influencers() });
    }
  });
};

export const useUpdateInfluencer = (influencerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<InfluencerInput>) => updateInfluencer(influencerId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.influencers() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.influencer(influencerId) });
    }
  });
};

export const useInfluencerCampaigns = (influencerId: string | null) => {
  return useQuery({
    queryKey: influencerId
      ? queryKeys.influencerCampaigns(influencerId)
      : ['influencer', 'campaigns', 'empty'],
    queryFn: () => {
      if (!influencerId) {
        throw new Error('Influencer id missing');
      }

      return listInfluencerCampaigns(influencerId);
    },
    enabled: Boolean(influencerId)
  });
};

export const useInfluencerPerformance = (influencerId: string | null) => {
  return useQuery({
    queryKey: influencerId
      ? ['influencer', influencerId, 'performance']
      : ['influencer', 'performance', 'empty'],
    queryFn: () => {
      if (!influencerId) {
        throw new Error('Influencer id missing');
      }

      return getInfluencerPerformance(influencerId);
    },
    enabled: Boolean(influencerId)
  });
};
