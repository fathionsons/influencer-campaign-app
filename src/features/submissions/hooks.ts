import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createSubmissionRequest,
  getSubmissionById,
  listSubmissions,
  updateSubmissionStatus,
  type SubmissionListItem,
  type SubmissionInput,
  type SubmissionStatusPayload
} from '@/features/submissions/api';
import { sendLocalNotification } from '@/lib/onesignal/localNotifications';
import { queryKeys } from '@/utils/queryKeys';

export const useSubmissions = (status: SubmissionListItem['status'] | 'all') => {
  return useQuery({
    queryKey: queryKeys.submissions(status),
    queryFn: () => listSubmissions(status)
  });
};

export const useSubmission = (submissionId: string | null) => {
  return useQuery({
    queryKey: submissionId ? queryKeys.submission(submissionId) : ['submission', 'empty'],
    queryFn: () => {
      if (!submissionId) {
        throw new Error('Submission id missing');
      }

      return getSubmissionById(submissionId);
    },
    enabled: Boolean(submissionId)
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmissionInput) => createSubmissionRequest(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      await queryClient.invalidateQueries({ queryKey: ['campaign'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};

interface MutationContext {
  previousLists: Array<[readonly unknown[], SubmissionListItem[] | undefined]>;
  previousItem: SubmissionListItem | undefined;
}

export const useUpdateSubmissionStatus = (submissionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmissionStatusPayload) => updateSubmissionStatus(submissionId, payload),
    onMutate: async (payload): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: ['submissions'] });
      await queryClient.cancelQueries({ queryKey: queryKeys.submission(submissionId) });

      const previousLists = queryClient.getQueriesData<SubmissionListItem[]>({
        queryKey: ['submissions']
      });
      const previousItem = queryClient.getQueryData<SubmissionListItem>(queryKeys.submission(submissionId));

      queryClient.setQueriesData<SubmissionListItem[]>({ queryKey: ['submissions'] }, (oldList) => {
        if (!oldList) {
          return oldList;
        }

        return oldList.map((item) => {
          if (item.id !== submissionId) {
            return item;
          }

          return {
            ...item,
            status: payload.status,
            feedback: payload.feedback ?? null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
      });

      queryClient.setQueryData<SubmissionListItem>(queryKeys.submission(submissionId), (oldItem) => {
        if (!oldItem) {
          return oldItem;
        }

        return {
          ...oldItem,
          status: payload.status,
          feedback: payload.feedback ?? null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      return { previousLists, previousItem };
    },
    onError: (_error, _payload, context) => {
      context?.previousLists.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });

      queryClient.setQueryData(queryKeys.submission(submissionId), context?.previousItem);
    },
    onSuccess: async (updatedSubmission) => {
      queryClient.setQueryData(queryKeys.submission(submissionId), (previous: SubmissionListItem | undefined) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          ...updatedSubmission
        };
      });

      await sendLocalNotification('Submission Updated', `Submission marked as ${updatedSubmission.status}.`);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      await queryClient.invalidateQueries({ queryKey: ['campaign'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};
