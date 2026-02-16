import { useQuery } from '@tanstack/react-query';
import { eachDayOfInterval, format, isAfter, parseISO, startOfDay, subDays } from 'date-fns';

import { listSubmissions } from '@/features/submissions';
import type { AnalyticsRange, CampaignKpis, ChartPoint, InfluencerLeaderboardRow } from '@/types';
import { queryKeys } from '@/utils/queryKeys';

export interface AnalyticsData {
  campaignTrend: ChartPoint[];
  influencerTrend: ChartPoint[];
  campaignKpis: CampaignKpis;
  topInfluencers: InfluencerLeaderboardRow[];
}

const buildTrendTemplate = (range: AnalyticsRange): ChartPoint[] => {
  const endDate = startOfDay(new Date());
  const startDate = startOfDay(subDays(endDate, range - 1));

  return eachDayOfInterval({
    start: startDate,
    end: endDate
  }).map((date) => ({
    date: format(date, 'yyyy-MM-dd'),
    value: 0
  }));
};

export const useAnalytics = (range: AnalyticsRange) => {
  return useQuery({
    queryKey: queryKeys.analytics(range),
    queryFn: async (): Promise<AnalyticsData> => {
      const submissions = await listSubmissions('all');
      const threshold = startOfDay(subDays(new Date(), range - 1));

      const scopedSubmissions = submissions.filter((submission) => {
        if (!submission.submitted_at) {
          return false;
        }

        return isAfter(parseISO(submission.submitted_at), threshold);
      });

      const trendTemplate = buildTrendTemplate(range);
      const trendMap = new Map<string, number>(trendTemplate.map((point) => [point.date, 0]));

      scopedSubmissions
        .filter((submission) => submission.status === 'approved' && submission.reviewed_at)
        .forEach((submission) => {
          if (!submission.reviewed_at) {
            return;
          }

          const key = format(parseISO(submission.reviewed_at), 'yyyy-MM-dd');
          trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
        });

      const campaignTrend = trendTemplate.map((point) => ({
        ...point,
        value: trendMap.get(point.date) ?? 0
      }));

      const influencerCounts = new Map<string, InfluencerLeaderboardRow>();

      scopedSubmissions
        .filter((submission) => submission.status === 'approved' && submission.influencer?.id)
        .forEach((submission) => {
          const influencerId = submission.influencer?.id;
          const influencerName = submission.influencer?.name;

          if (!influencerId || !influencerName) {
            return;
          }

          const existing = influencerCounts.get(influencerId);
          if (existing) {
            influencerCounts.set(influencerId, {
              ...existing,
              approvedCount: existing.approvedCount + 1
            });
            return;
          }

          influencerCounts.set(influencerId, {
            influencerId,
            influencerName,
            approvedCount: 1
          });
        });

      const totalSubmissions = scopedSubmissions.length;
      const approvedSubmissions = scopedSubmissions.filter((submission) => submission.status === 'approved');

      const approvalRate =
        totalSubmissions > 0 ? (approvedSubmissions.length / totalSubmissions) * 100 : 0;

      const approvalHours = approvedSubmissions
        .map((submission) => {
          if (!submission.submitted_at || !submission.reviewed_at) {
            return null;
          }

          const submitted = parseISO(submission.submitted_at);
          const reviewed = parseISO(submission.reviewed_at);
          const diffMs = reviewed.getTime() - submitted.getTime();
          return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
        })
        .filter((value): value is number => value !== null);

      const avgApprovalHours =
        approvalHours.length > 0
          ? approvalHours.reduce((acc, value) => acc + value, 0) / approvalHours.length
          : 0;

      return {
        campaignTrend,
        influencerTrend: campaignTrend,
        campaignKpis: {
          totalSubmissions,
          approvalRate,
          avgApprovalHours
        },
        topInfluencers: Array.from(influencerCounts.values())
          .sort((a, b) => b.approvedCount - a.approvedCount)
          .slice(0, 5)
      };
    }
  });
};
