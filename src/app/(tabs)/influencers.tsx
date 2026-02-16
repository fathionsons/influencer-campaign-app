import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AppInput,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingState,
  Screen,
  SectionTitle,
  SegmentedControl,
  StatusBadge,
  colors,
  spacing
} from '@/components';
import {
  useCreateInfluencer,
  useInfluencer,
  useInfluencerCampaigns,
  useInfluencerPerformance,
  useInfluencers
} from '@/features/influencers';
import type { InfluencerPlatform } from '@/types';
import { formatCompactNumber, formatPercent, toErrorMessage } from '@/utils/format';

type InfluencerFormState = {
  name: string;
  platform: InfluencerPlatform;
  handle: string;
  followers: string;
  engagementRate: string;
  email: string;
};

const platformOptions: Array<{ label: string; value: InfluencerPlatform }> = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Other', value: 'other' }
];

const EMPTY_FORM: InfluencerFormState = {
  name: '',
  platform: 'instagram',
  handle: '',
  followers: '0',
  engagementRate: '0',
  email: ''
};

export default function InfluencersScreen(): JSX.Element {
  const { data, isLoading, error } = useInfluencers();
  const createInfluencer = useCreateInfluencer();

  const [createVisible, setCreateVisible] = useState(false);
  const [form, setForm] = useState<InfluencerFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null);

  const influencerDetails = useInfluencer(selectedInfluencerId);
  const influencerCampaigns = useInfluencerCampaigns(selectedInfluencerId);
  const influencerPerformance = useInfluencerPerformance(selectedInfluencerId);

  const onCreate = async (): Promise<void> => {
    setFormError(null);

    try {
      await createInfluencer.mutateAsync({
        name: form.name,
        platform: form.platform,
        handle: form.handle,
        followers: Number(form.followers),
        engagement_rate: Number(form.engagementRate),
        email: form.email
      });

      setCreateVisible(false);
      setForm(EMPTY_FORM);
    } catch (nextError) {
      setFormError(toErrorMessage(nextError, 'Unable to create influencer'));
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading influencers..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle title="Influencers" subtitle="Maintain profiles and monitor creator performance" />

      <Button label="Create influencer" onPress={() => setCreateVisible(true)} />

      {error ? <ErrorBanner message={error.message} /> : null}

      {data && data.length === 0 ? (
        <Card>
          <EmptyState
            title="No influencers yet"
            description="Add influencer profiles manually to start assigning them to campaigns."
          />
        </Card>
      ) : null}

      {data?.map((influencer) => (
        <Pressable
          key={influencer.id}
          onPress={() => setSelectedInfluencerId(influencer.id)}
          style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}
        >
          <View style={styles.rowHeader}>
            <View style={styles.flexGrow}>
              <Text style={styles.name}>{influencer.name}</Text>
              <Text style={styles.handle}>@{influencer.handle}</Text>
            </View>
            <StatusBadge label={influencer.platform} />
          </View>
          <Text style={styles.meta}>
            {formatCompactNumber(influencer.followers)} followers •{' '}
            {formatPercent(influencer.engagement_rate)} engagement
          </Text>
        </Pressable>
      ))}

      {selectedInfluencerId && influencerDetails.data ? (
        <Card>
          <View style={styles.rowHeader}>
            <View style={styles.flexGrow}>
              <Text style={styles.detailTitle}>{influencerDetails.data.name}</Text>
              <Text style={styles.meta}>@{influencerDetails.data.handle}</Text>
            </View>
            <Pressable onPress={() => setSelectedInfluencerId(null)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.meta}>Platform: {influencerDetails.data.platform}</Text>
          <Text style={styles.meta}>
            Followers: {formatCompactNumber(influencerDetails.data.followers)}
          </Text>
          <Text style={styles.meta}>Engagement: {formatPercent(influencerDetails.data.engagement_rate)}</Text>
          <Text style={styles.meta}>Email: {influencerDetails.data.email ?? 'Not provided'}</Text>

          <Text style={styles.sectionLabel}>Performance summary</Text>
          <Text style={styles.meta}>
            Total submissions: {influencerPerformance.data?.totalSubmissions ?? 0}
          </Text>
          <Text style={styles.meta}>
            Approved submissions: {influencerPerformance.data?.approvedSubmissions ?? 0}
          </Text>
          <Text style={styles.meta}>
            Approval rate:{' '}
            {formatPercent(Number(influencerPerformance.data?.approvalRate ?? 0))}
          </Text>

          <Text style={styles.sectionLabel}>Campaigns involved</Text>
          {influencerCampaigns.data?.length ? (
            influencerCampaigns.data.map((campaignLink) => (
              <View key={campaignLink.id} style={styles.rowItem}>
                <Text style={styles.name}>{campaignLink.campaign?.campaign_name ?? 'Campaign'}</Text>
                <Text style={styles.meta}>
                  {campaignLink.campaign?.brand_name ?? 'Brand'} • {campaignLink.status}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.meta}>No campaigns assigned yet.</Text>
          )}
        </Card>
      ) : null}

      <Modal animationType="slide" onRequestClose={() => setCreateVisible(false)} transparent visible={createVisible}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Card>
              <SectionTitle title="Create Influencer" subtitle="Manual profile entry" />
              {formError ? <ErrorBanner message={formError} /> : null}

              <AppInput
                label="Name"
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
                value={form.name}
              />
              <SegmentedControl
                onChange={(value) => setForm((prev) => ({ ...prev, platform: value }))}
                options={platformOptions}
                value={form.platform}
              />
              <AppInput
                label="Handle"
                onChangeText={(value) => setForm((prev) => ({ ...prev, handle: value.replace('@', '') }))}
                value={form.handle}
              />
              <AppInput
                keyboardType="numeric"
                label="Followers"
                onChangeText={(value) => setForm((prev) => ({ ...prev, followers: value }))}
                value={form.followers}
              />
              <AppInput
                keyboardType="decimal-pad"
                label="Engagement rate (%)"
                onChangeText={(value) => setForm((prev) => ({ ...prev, engagementRate: value }))}
                value={form.engagementRate}
              />
              <AppInput
                autoCapitalize="none"
                keyboardType="email-address"
                label="Email (optional)"
                onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
                value={form.email}
              />

              <View style={styles.modalActions}>
                <Button label="Cancel" onPress={() => setCreateVisible(false)} style={styles.actionButton} variant="secondary" />
                <Button
                  label={createInfluencer.isPending ? 'Saving...' : 'Create'}
                  onPress={() => void onCreate()}
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  pressed: {
    opacity: 0.85
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between'
  },
  flexGrow: {
    flex: 1,
    minWidth: 0
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15
  },
  handle: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 13
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13
  },
  detailTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 18
  },
  closeText: {
    color: colors.accent,
    fontWeight: '700'
  },
  sectionLabel: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15
  },
  rowItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,35,26,0.35)'
  },
  modalBody: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  actionButton: {
    flex: 1
  }
});
