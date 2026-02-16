import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listPayouts, markPayoutPaid, type PayoutListItem } from '@/features/payouts/api';
import { queryKeys } from '@/utils/queryKeys';

export const usePayouts = () => {
  return useQuery({
    queryKey: queryKeys.payouts(),
    queryFn: listPayouts
  });
};

interface MutationContext {
  previousPayouts: PayoutListItem[] | undefined;
}

export const useMarkPayoutPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutId: string) => markPayoutPaid(payoutId),
    onMutate: async (payoutId): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: queryKeys.payouts() });
      const previousPayouts = queryClient.getQueryData<PayoutListItem[]>(queryKeys.payouts());

      queryClient.setQueryData<PayoutListItem[]>(queryKeys.payouts(), (oldList) => {
        if (!oldList) {
          return oldList;
        }

        return oldList.map((payout) => {
          if (payout.id !== payoutId) {
            return payout;
          }

          return {
            ...payout,
            status: 'paid',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
      });

      return {
        previousPayouts
      };
    },
    onError: (_error, _payoutId, context) => {
      queryClient.setQueryData(queryKeys.payouts(), context?.previousPayouts);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.payouts() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    }
  });
};
