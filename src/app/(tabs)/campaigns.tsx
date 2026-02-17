import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
  useAssignInfluencer,
  useCampaign,
  useCampaignInfluencers,
  useCampaignSubmissions,
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign
} from '@/features/campaigns';
import { useInfluencers } from '@/features/influencers';
import { formatDate } from '@/lib/dates';
import { useUiStore } from '@/stores/uiStore';
import type { Campaign } from '@/types';
import { formatCurrency, toErrorMessage } from '@/utils/format';

type CampaignFormState = {
  brandName: string;
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  status: Campaign['status'];
};

const EMPTY_CAMPAIGN_FORM: CampaignFormState = {
  brandName: '',
  campaignName: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: '0',
  status: 'draft'
};

const campaignFilterOptions: Array<{ label: string; value: Campaign['status'] | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Completed', value: 'completed' }
];

const campaignStatusOptions: Array<{ label: string; value: Campaign['status'] }> = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' }
];

export default function CampaignsScreen() {
  const router = useRouter();

  const campaignFilter = useUiStore((state) => state.campaignFilter);
  const setCampaignFilter = useUiStore((state) => state.setCampaignFilter);

  const { data: campaigns, isLoading, error } = useCampaigns(campaignFilter);

  const createCampaign = useCreateCampaign();

  const [createVisible, setCreateVisible] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);

  const [createForm, setCreateForm] = useState<CampaignFormState>(EMPTY_CAMPAIGN_FORM);
  const [editForm, setEditForm] = useState<CampaignFormState>(EMPTY_CAMPAIGN_FORM);
  const [assignmentInfluencerId, setAssignmentInfluencerId] = useState<string | null>(null);
  const [assignmentRole, setAssignmentRole] = useState('');
  const [assignmentFee, setAssignmentFee] = useState('0');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCampaign = useCampaign(selectedCampaignId);
  const campaignInfluencers = useCampaignInfluencers(selectedCampaignId);
  const campaignSubmissions = useCampaignSubmissions(selectedCampaignId);
  const influencers = useInfluencers();

  const updateCampaign = useUpdateCampaign(selectedCampaignId ?? '');
  const assignInfluencer = useAssignInfluencer(selectedCampaignId ?? '');

  const groupedSubmissions = useMemo(() => {
    const items = campaignSubmissions.data ?? [];
    return {
      submitted: items.filter((item) => item.status === 'submitted'),
      needsChanges: items.filter((item) => item.status === 'needs_changes'),
      approved: items.filter((item) => item.status === 'approved'),
      rejected: items.filter((item) => item.status === 'rejected')
    };
  }, [campaignSubmissions.data]);

  const handleOpenEdit = (): void => {
    if (!selectedCampaign.data) {
      return;
    }

    setEditForm({
      brandName: selectedCampaign.data.brand_name,
      campaignName: selectedCampaign.data.campaign_name,
      description: selectedCampaign.data.description ?? '',
      startDate: selectedCampaign.data.start_date,
      endDate: selectedCampaign.data.end_date,
      budget: String(selectedCampaign.data.budget),
      status: selectedCampaign.data.status
    });
    setEditVisible(true);
  };

  const createCampaignFromState = async (): Promise<void> => {
    setFormError(null);

    try {
      await createCampaign.mutateAsync({
        brand_name: createForm.brandName,
        campaign_name: createForm.campaignName,
        description: createForm.description,
        start_date: createForm.startDate,
        end_date: createForm.endDate,
        budget: Number(createForm.budget),
        status: createForm.status
      });

      setCreateVisible(false);
      setCreateForm(EMPTY_CAMPAIGN_FORM);
    } catch (nextError) {
      setFormError(toErrorMessage(nextError, 'Unable to create campaign'));
    }
  };

  const updateCampaignFromState = async (): Promise<void> => {
    if (!selectedCampaignId) {
      return;
    }

    setFormError(null);

    try {
      await updateCampaign.mutateAsync({
        brand_name: editForm.brandName,
        campaign_name: editForm.campaignName,
        description: editForm.description,
        start_date: editForm.startDate,
        end_date: editForm.endDate,
        budget: Number(editForm.budget),
        status: editForm.status
      });

      setEditVisible(false);
    } catch (nextError) {
      setFormError(toErrorMessage(nextError, 'Unable to update campaign'));
    }
  };

  const assignSelectedInfluencer = async (): Promise<void> => {
    if (!assignmentInfluencerId) {
      setFormError('Select an influencer to assign');
      return;
    }

    setFormError(null);

    try {
      await assignInfluencer.mutateAsync({
        influencer_id: assignmentInfluencerId,
        role: assignmentRole,
        agreed_fee: Number(assignmentFee)
      });

      setAssignVisible(false);
      setAssignmentInfluencerId(null);
      setAssignmentRole('');
      setAssignmentFee('0');
    } catch (nextError) {
      setFormError(toErrorMessage(nextError, 'Unable to assign influencer'));
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading campaigns..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle
        title="Campaigns"
        subtitle="Create, filter, and operate active influencer campaigns"
      />

      <SegmentedControl
        onChange={setCampaignFilter}
        options={campaignFilterOptions}
        value={campaignFilter}
      />

      <Button label="Create campaign" onPress={() => setCreateVisible(true)} />

      {error ? <ErrorBanner message={error.message} /> : null}

      {campaigns && campaigns.length === 0 ? (
        <Card>
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign to start assigning influencers and collecting submissions."
          />
        </Card>
      ) : null}

      {campaigns?.map((campaign) => (
        <Pressable
          key={campaign.id}
          onPress={() => setSelectedCampaignId(campaign.id)}
          style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.flexGrow}>
              <Text style={styles.cardTitle}>{campaign.campaign_name}</Text>
              <Text style={styles.cardSubtitle}>{campaign.brand_name}</Text>
            </View>
            <StatusBadge
              label={campaign.status}
              tone={campaign.status === 'active' ? 'success' : campaign.status === 'draft' ? 'warning' : 'default'}
            />
          </View>
          <Text style={styles.cardMeta}>
            {formatDate(campaign.start_date)} to {formatDate(campaign.end_date)}
          </Text>
          <Text style={styles.cardMeta}>Budget {formatCurrency(campaign.budget)}</Text>
        </Pressable>
      ))}

      {selectedCampaignId && selectedCampaign.data ? (
        <Card>
          <View style={styles.detailHeader}>
            <View style={styles.flexGrow}>
              <Text style={styles.detailTitle}>{selectedCampaign.data.campaign_name}</Text>
              <Text style={styles.detailMeta}>{selectedCampaign.data.brand_name}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedCampaignId(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.detailMeta}>{selectedCampaign.data.description ?? 'No description provided.'}</Text>
          <Text style={styles.detailMeta}>
            Timeline: {formatDate(selectedCampaign.data.start_date)} to {formatDate(selectedCampaign.data.end_date)}
          </Text>
          <Text style={styles.detailMeta}>Budget: {formatCurrency(selectedCampaign.data.budget)}</Text>

          <View style={styles.inlineActions}>
            <Button label="Edit campaign" onPress={handleOpenEdit} style={styles.actionButton} variant="secondary" />
            <Button
              label="Assign influencer"
              onPress={() => setAssignVisible(true)}
              style={styles.actionButton}
              variant="secondary"
            />
          </View>

          <Button
            label="Create submission request"
            onPress={() => {
              router.push({
                pathname: '/(tabs)/submissions',
                params: { campaignId: selectedCampaign.data?.id }
              });
            }}
          />

          <Text style={styles.sectionLabel}>Assigned influencers</Text>
          {campaignInfluencers.data?.length ? (
            campaignInfluencers.data.map((entry) => (
              <View key={entry.id} style={styles.rowWrap}>
                <Text style={styles.rowTitleText}>{entry.influencer?.name ?? 'Influencer'}</Text>
                <Text style={styles.rowMetaText}>
                  @{entry.influencer?.handle ?? 'unknown'} • {entry.role ?? 'No role'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHint}>No influencers assigned yet.</Text>
          )}

          <Text style={styles.sectionLabel}>Submissions by status</Text>
          <Text style={styles.rowMetaText}>Submitted: {groupedSubmissions.submitted.length}</Text>
          <Text style={styles.rowMetaText}>Needs changes: {groupedSubmissions.needsChanges.length}</Text>
          <Text style={styles.rowMetaText}>Approved: {groupedSubmissions.approved.length}</Text>
          <Text style={styles.rowMetaText}>Rejected: {groupedSubmissions.rejected.length}</Text>
        </Card>
      ) : null}

      <Modal animationType="slide" onRequestClose={() => setCreateVisible(false)} transparent visible={createVisible}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Card>
              <SectionTitle subtitle="All fields are required unless noted" title="Create Campaign" />
              {formError ? <ErrorBanner message={formError} /> : null}
              <AppInput label="Brand name" onChangeText={(v) => setCreateForm((prev) => ({ ...prev, brandName: v }))} value={createForm.brandName} />
              <AppInput label="Campaign name" onChangeText={(v) => setCreateForm((prev) => ({ ...prev, campaignName: v }))} value={createForm.campaignName} />
              <AppInput label="Description" multiline onChangeText={(v) => setCreateForm((prev) => ({ ...prev, description: v }))} value={createForm.description} />
              <AppInput label="Start date (YYYY-MM-DD)" onChangeText={(v) => setCreateForm((prev) => ({ ...prev, startDate: v }))} value={createForm.startDate} />
              <AppInput label="End date (YYYY-MM-DD)" onChangeText={(v) => setCreateForm((prev) => ({ ...prev, endDate: v }))} value={createForm.endDate} />
              <AppInput keyboardType="numeric" label="Budget (USD)" onChangeText={(v) => setCreateForm((prev) => ({ ...prev, budget: v }))} value={createForm.budget} />
              <SegmentedControl
                onChange={(value) => setCreateForm((prev) => ({ ...prev, status: value }))}
                options={campaignStatusOptions}
                value={createForm.status}
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" onPress={() => setCreateVisible(false)} style={styles.actionButton} variant="secondary" />
                <Button
                  label={createCampaign.isPending ? 'Creating...' : 'Create'}
                  onPress={() => void createCampaignFromState()}
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </ScrollView>
        </View>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setEditVisible(false)} transparent visible={editVisible}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Card>
              <SectionTitle title="Edit Campaign" />
              {formError ? <ErrorBanner message={formError} /> : null}
              <AppInput label="Brand name" onChangeText={(v) => setEditForm((prev) => ({ ...prev, brandName: v }))} value={editForm.brandName} />
              <AppInput label="Campaign name" onChangeText={(v) => setEditForm((prev) => ({ ...prev, campaignName: v }))} value={editForm.campaignName} />
              <AppInput label="Description" multiline onChangeText={(v) => setEditForm((prev) => ({ ...prev, description: v }))} value={editForm.description} />
              <AppInput label="Start date (YYYY-MM-DD)" onChangeText={(v) => setEditForm((prev) => ({ ...prev, startDate: v }))} value={editForm.startDate} />
              <AppInput label="End date (YYYY-MM-DD)" onChangeText={(v) => setEditForm((prev) => ({ ...prev, endDate: v }))} value={editForm.endDate} />
              <AppInput keyboardType="numeric" label="Budget (USD)" onChangeText={(v) => setEditForm((prev) => ({ ...prev, budget: v }))} value={editForm.budget} />
              <SegmentedControl
                onChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
                options={campaignStatusOptions}
                value={editForm.status}
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" onPress={() => setEditVisible(false)} style={styles.actionButton} variant="secondary" />
                <Button
                  label={updateCampaign.isPending ? 'Saving...' : 'Save'}
                  onPress={() => void updateCampaignFromState()}
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </ScrollView>
        </View>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setAssignVisible(false)} transparent visible={assignVisible}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Card>
              <SectionTitle title="Assign Influencer" />
              {formError ? <ErrorBanner message={formError} /> : null}

              <Text style={styles.fieldLabel}>Choose influencer</Text>
              {(influencers.data ?? []).map((influencer) => (
                <Pressable
                  key={influencer.id}
                  onPress={() => setAssignmentInfluencerId(influencer.id)}
                  style={[
                    styles.selectRow,
                    assignmentInfluencerId === influencer.id ? styles.selectedRow : undefined
                  ]}
                >
                  <Text style={styles.rowTitleText}>{influencer.name}</Text>
                  <Text style={styles.rowMetaText}>@{influencer.handle}</Text>
                </Pressable>
              ))}

              <AppInput
                label="Role (optional)"
                onChangeText={setAssignmentRole}
                placeholder="Creator, Story pack, etc"
                value={assignmentRole}
              />
              <AppInput
                keyboardType="numeric"
                label="Agreed fee (optional)"
                onChangeText={setAssignmentFee}
                value={assignmentFee}
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" onPress={() => setAssignVisible(false)} style={styles.actionButton} variant="secondary" />
                <Button
                  label={assignInfluencer.isPending ? 'Assigning...' : 'Assign'}
                  onPress={() => void assignSelectedInfluencer()}
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
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm
  },
  pressed: {
    opacity: 0.8
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  flexGrow: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  cardSubtitle: {
    color: colors.textSecondary,
    marginTop: 2
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: 12
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  detailMeta: {
    color: colors.textSecondary,
    fontSize: 13
  },
  closeText: {
    color: colors.accent,
    fontWeight: '700'
  },
  inlineActions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  actionButton: {
    flex: 1
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    marginTop: spacing.sm
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: 13
  },
  rowWrap: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm
  },
  rowTitleText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  rowMetaText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  modalBackdrop: {
    backgroundColor: 'rgba(16,35,26,0.35)',
    flex: 1
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
  fieldLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13
  },
  selectRow: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm
  },
  selectedRow: {
    borderColor: colors.accent,
    backgroundColor: '#E9F8EF'
  }
});
