import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingState,
  Screen,
  SectionTitle,
  StatusBadge,
  colors,
  spacing
} from '@/components';
import { useDashboardData } from '@/features/dashboard';
import { useMarkPayoutPaid } from '@/features/payouts';
import { formatDate } from '@/lib/dates';
import { confirmAction } from '@/utils/confirm';
import { formatCurrency } from '@/utils/format';

const MAX_ITEMS_PER_SECTION = 3;

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useDashboardData();
  const markPayoutPaid = useMarkPayoutPaid();

  const hasItems = useMemo(() => {
    if (!data) {
      return false;
    }

    return (
      data.pendingApprovals.length > 0 ||
      data.needsChanges.length > 0 ||
      data.overdueSubmissions.length > 0 ||
      data.upcomingDeadlines.length > 0 ||
      data.unpaidPayouts.length > 0
    );
  }, [data]);

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading next actions..." />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorBanner message={error.message} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle
        subtitle="Today priorities across approvals, deadlines, and payouts"
        title="Next Actions"
      />

      {!hasItems && (
        <Card>
          <EmptyState
            description="You are clear for now. New submissions and payouts will show up here."
            title="No urgent tasks"
          />
        </Card>
      )}

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Pending approvals</Text>
          <StatusBadge label={`${data?.pendingApprovals.length ?? 0}`} />
        </View>
        {data?.pendingApprovals.slice(0, MAX_ITEMS_PER_SECTION).map((submission) => (
          <Pressable
            key={submission.id}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/submissions',
                params: { submissionId: submission.id }
              })
            }
            style={styles.row}
          >
            <View>
              <Text style={styles.rowTitle}>{submission.title}</Text>
              <Text style={styles.rowSubtitle}>
                {submission.campaign?.campaign_name ?? 'Unknown campaign'} - due {formatDate(submission.due_date)}
              </Text>
            </View>
            <Text style={styles.rowAction}>Open</Text>
          </Pressable>
        ))}
      </Card>

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Needs changes</Text>
          <StatusBadge label={`${data?.needsChanges.length ?? 0}`} tone="warning" />
        </View>
        {data?.needsChanges.slice(0, MAX_ITEMS_PER_SECTION).map((submission) => (
          <Pressable
            key={submission.id}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/submissions',
                params: { submissionId: submission.id }
              })
            }
            style={styles.row}
          >
            <View>
              <Text style={styles.rowTitle}>{submission.title}</Text>
              <Text style={styles.rowSubtitle}>{submission.feedback ?? 'Awaiting revision'}</Text>
            </View>
            <Text style={styles.rowAction}>Open</Text>
          </Pressable>
        ))}
      </Card>

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Overdue submissions</Text>
          <StatusBadge label={`${data?.overdueSubmissions.length ?? 0}`} tone="danger" />
        </View>
        {data?.overdueSubmissions.slice(0, MAX_ITEMS_PER_SECTION).map((submission) => (
          <Pressable
            key={submission.id}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/submissions',
                params: { submissionId: submission.id }
              })
            }
            style={styles.row}
          >
            <View>
              <Text style={styles.rowTitle}>{submission.title}</Text>
              <Text style={styles.rowSubtitle}>Due {formatDate(submission.due_date)}</Text>
            </View>
            <StatusBadge label="Overdue" tone="danger" />
          </Pressable>
        ))}
      </Card>

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Upcoming deadlines (3 days)</Text>
          <StatusBadge label={`${data?.upcomingDeadlines.length ?? 0}`} />
        </View>
        {data?.upcomingDeadlines.slice(0, MAX_ITEMS_PER_SECTION).map((submission) => (
          <Pressable
            key={submission.id}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/submissions',
                params: { submissionId: submission.id }
              })
            }
            style={styles.row}
          >
            <View>
              <Text style={styles.rowTitle}>{submission.title}</Text>
              <Text style={styles.rowSubtitle}>Due {formatDate(submission.due_date)}</Text>
            </View>
            <Text style={styles.rowAction}>Open</Text>
          </Pressable>
        ))}
      </Card>

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Unpaid payouts due (7 days)</Text>
          <StatusBadge label={`${data?.unpaidPayouts.length ?? 0}`} tone="warning" />
        </View>

        {data?.unpaidPayouts.slice(0, MAX_ITEMS_PER_SECTION).map((payout) => (
          <View key={payout.id} style={styles.payoutRow}>
            <View style={styles.payoutMeta}>
              <Text style={styles.rowTitle}>{payout.influencer?.name ?? 'Influencer'}</Text>
              <Text style={styles.rowSubtitle}>
                {formatCurrency(payout.amount, payout.currency)} due {formatDate(payout.due_date)}
              </Text>
            </View>
            <Button
              label={markPayoutPaid.isPending - 'Saving...' : 'Mark paid'}
              onPress={() => {
                confirmAction(
                  'Mark payout as paid',
                  'This will mark the payout as paid and set paid_at to now.',
                  'Mark paid',
                  () => {
                    void markPayoutPaid.mutateAsync(payout.id);
                  }
                );
              }}
              style={styles.payButton}
              variant="secondary"
            />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  row: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  rowSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  rowAction: {
    color: colors.accent,
    fontWeight: '700'
  },
  payoutRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm
  },
  payoutMeta: {
    flex: 1,
    minWidth: 0
  },
  payButton: {
    minWidth: 100
  }
});
