import { useQuery } from '@tanstack/react-query';
import { addDays, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';

import { listPayouts } from '@/features/payouts';
import { listSubmissions, type SubmissionListItem } from '@/features/submissions';
import { queryKeys } from '@/utils/queryKeys';

interface DashboardData {
  pendingApprovals: SubmissionListItem[];
  needsChanges: SubmissionListItem[];
  overdueSubmissions: SubmissionListItem[];
  upcomingDeadlines: SubmissionListItem[];
  unpaidPayouts: Awaited<ReturnType<typeof listPayouts>>;
}

const isOverdueSubmission = (submission: SubmissionListItem, now: Date): boolean => {
  if (submission.status === 'approved') {
    return false;
  }

  const dueDate = parseISO(submission.due_date);
  return isBefore(dueDate, startOfDay(now));
};

const isDueWithinDays = (dueDateIso: string, days: number, now: Date): boolean => {
  const dueDate = parseISO(dueDateIso);
  const start = startOfDay(now);
  const end = addDays(start, days);

  return (
    (isSameDay(dueDate, start) || isBefore(start, dueDate)) &&
    (isSameDay(dueDate, end) || isBefore(dueDate, end))
  );
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: async (): Promise<DashboardData> => {
      const [submissions, payouts] = await Promise.all([listSubmissions('all'), listPayouts()]);
      const now = new Date();

      const pendingApprovals = submissions.filter((item) => item.status === 'submitted');
      const needsChanges = submissions.filter((item) => item.status === 'needs_changes');
      const overdueSubmissions = submissions.filter((item) => isOverdueSubmission(item, now));
      const upcomingDeadlines = submissions.filter(
        (item) => item.status !== 'approved' && isDueWithinDays(item.due_date, 3, now)
      );
      const unpaidPayouts = payouts.filter(
        (item) => item.status === 'unpaid' && isDueWithinDays(item.due_date, 7, now)
      );

      return {
        pendingApprovals,
        needsChanges,
        overdueSubmissions,
        upcomingDeadlines,
        unpaidPayouts
      };
    }
  });
};
