import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';

import {
  Card,
  EmptyState,
  ErrorBanner,
  KpiCard,
  LoadingState,
  Screen,
  SectionTitle,
  SegmentedControl,
  colors,
  spacing
} from '@/components';
import { useAnalytics } from '@/features/analytics';
import { useUiStore } from '@/stores/uiStore';
import type { AnalyticsRange } from '@/types';
import { formatPercent } from '@/utils/format';

const rangeOptions: Array<{ label: string; value: AnalyticsRange }> = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 }
];

export default function AnalyticsScreen() {
  const analyticsRange = useUiStore((state) => state.analyticsRange);
  const setAnalyticsRange = useUiStore((state) => state.setAnalyticsRange);

  const { data, isLoading, error } = useAnalytics(analyticsRange);

  const chartData = useMemo(() => {
    return (
      data?.campaignTrend.map((point) => ({
        x: point.date,
        y: point.value
      })) ?? []
    );
  }, [data?.campaignTrend]);

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading analytics..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle
        title="Analytics"
        subtitle="Campaign health and influencer performance at a glance"
      />

      <SegmentedControl options={rangeOptions} value={analyticsRange} onChange={setAnalyticsRange} />

      {error ? <ErrorBanner message={error.message} /> : null}

      {!data ? (
        <Card>
          <EmptyState title="No analytics yet" description="Add submissions to populate trendlines and KPIs." />
        </Card>
      ) : (
        <>
          <View style={styles.kpiRow}>
            <KpiCard label="Total submissions" value={String(data.campaignKpis.totalSubmissions)} />
            <KpiCard label="Approval rate" value={formatPercent(data.campaignKpis.approvalRate)} />
            <KpiCard label="Avg approval (hrs)" value={data.campaignKpis.avgApprovalHours.toFixed(1)} />
          </View>

          <Card>
            <Text style={styles.sectionTitle}>Approved submissions trend</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <VictoryChart
                width={Math.max(chartData.length * 28, 320)}
                height={240}
                theme={VictoryTheme.material}
                padding={{ left: 48, right: 24, top: 20, bottom: 40 }}
              >
                <VictoryAxis
                  style={{
                    axis: { stroke: colors.border },
                    tickLabels: { fill: colors.textSecondary, fontSize: 10, angle: -40, padding: 12 }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: colors.border },
                    tickLabels: { fill: colors.textSecondary, fontSize: 10 }
                  }}
                />
                <VictoryLine
                  data={chartData}
                  interpolation="monotoneX"
                  style={{
                    data: { stroke: colors.accent, strokeWidth: 3 }
                  }}
                />
              </VictoryChart>
            </ScrollView>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Top influencers</Text>
            {data.topInfluencers.length === 0 ? (
              <Text style={styles.meta}>No approvals yet.</Text>
            ) : (
              data.topInfluencers.map((row) => (
                <View key={row.influencerId} style={styles.rowItem}>
                  <Text style={styles.rowTitle}>{row.influencerName}</Text>
                  <Text style={styles.meta}>{row.approvedCount} approved submissions</Text>
                </View>
              ))
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13
  },
  rowItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  rowTitle: {
    color: colors.textPrimary,
    fontWeight: '700'
  }
});
