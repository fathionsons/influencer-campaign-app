import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { useCampaigns } from '@/features/campaigns';
import { useInfluencers } from '@/features/influencers';
import {
  useCreateSubmission,
  useDeleteSubmission,
  useSubmission,
  useSubmissions,
  useUpdateSubmissionStatus
} from '@/features/submissions';
import { formatDate } from '@/lib/dates';
import { useUiStore } from '@/stores/uiStore';
import type { Submission } from '@/types';
import { confirmAction } from '@/utils/confirm';
import { toErrorMessage } from '@/utils/format';

type SubmissionRequestForm = {
  campaignId: string;
  influencerId: string;
  title: string;
  caption: string;
  mediaType: Submission['media_type'];
  mediaUrl: string;
  dueDate: string;
};

const submissionFilterOptions: Array<{ label: string; value: Submission['status'] | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Needs Changes', value: 'needs_changes' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
];

const mediaOptions: Array<{ label: string; value: Submission['media_type'] }> = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Link', value: 'link' }
];

const EMPTY_FORM: SubmissionRequestForm = {
  campaignId: '',
  influencerId: '',
  title: '',
  caption: '',
  mediaType: 'link',
  mediaUrl: '',
  dueDate: ''
};

export default function SubmissionsScreen() {
  const params = useLocalSearchParams<{ submissionId?: string; campaignId?: string }>();

  const submissionFilter = useUiStore((state) => state.submissionFilter);
  const setSubmissionFilter = useUiStore((state) => state.setSubmissionFilter);

  const submissions = useSubmissions(submissionFilter);
  const campaigns = useCampaigns('all');
  const influencers = useInfluencers();

  const createSubmission = useCreateSubmission();

  const [createVisible, setCreateVisible] = useState(false);
  const [requestForm, setRequestForm] = useState<SubmissionRequestForm>(EMPTY_FORM);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const submissionDetail = useSubmission(selectedSubmissionId);
  const updateStatus = useUpdateSubmissionStatus(selectedSubmissionId ?? '');
  const deleteSubmission = useDeleteSubmission(selectedSubmissionId ?? '');

  useEffect(() => {
    if (params.submissionId) {
      setSelectedSubmissionId(params.submissionId);
    }
  }, [params.submissionId]);

  useEffect(() => {
    if (params.campaignId) {
      setCreateVisible(true);
      setRequestForm((prev) => ({ ...prev, campaignId: params.campaignId ?? prev.campaignId }));
    }
  }, [params.campaignId]);

  const selectedCampaignName = useMemo(() => {
    if (!requestForm.campaignId) {
      return null;
    }

    return campaigns.data?.find((item) => item.id === requestForm.campaignId)?.campaign_name ?? null;
  }, [campaigns.data, requestForm.campaignId]);

  const handleCreateRequest = async (): Promise<void> => {
    setFormError(null);

    try {
      await createSubmission.mutateAsync({
        campaign_id: requestForm.campaignId,
        influencer_id: requestForm.influencerId,
        title: requestForm.title,
        caption: requestForm.caption,
        media_type: requestForm.mediaType,
        media_url:
          requestForm.mediaUrl.length > 0
            ? requestForm.mediaUrl
            : 'https://example.com/submission-brief',
        due_date: requestForm.dueDate
      });

      setCreateVisible(false);
      setRequestForm(EMPTY_FORM);
    } catch (nextError) {
      setFormError(toErrorMessage(nextError, 'Unable to create submission request'));
    }
  };

  const handleUpdateStatus = async (
    status: 'approved' | 'needs_changes' | 'rejected'
  ): Promise<void> => {
    if ((status === 'needs_changes' || status === 'rejected') && feedback.trim().length === 0) {
      setFormError('Feedback is required for needs changes and rejected states');
      return;
    }

    setFormError(null);

    await updateStatus.mutateAsync({
      status,
      feedback: feedback.trim()
    });

    if (status === 'approved') {
      setFeedback('');
    }
  };

  if (submissions.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading submissions..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle
        title="Submissions"
        subtitle="Review, approve, and request revisions for influencer content"
      />

      <SegmentedControl
        onChange={setSubmissionFilter}
        options={submissionFilterOptions}
        value={submissionFilter}
      />

      <Button label="Create submission request" onPress={() => setCreateVisible(true)} />

      {submissions.error ? <ErrorBanner message={submissions.error.message} /> : null}

      {submissions.data && submissions.data.length === 0 ? (
        <Card>
          <EmptyState
            title="No submissions found"
            description="Create your first submission request to track approvals and deadlines."
          />
        </Card>
      ) : null}

      {submissions.data?.map((submission) => (
        <Pressable
          key={submission.id}
          onPress={() => {
            setSelectedSubmissionId(submission.id);
            setFeedback(submission.feedback ?? '');
            setFormError(null);
          }}
          style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}
        >
          <View style={styles.rowHeader}>
            <View style={styles.flexGrow}>
              <Text style={styles.title}>{submission.title}</Text>
              <Text style={styles.subtitle}>
                {submission.campaign?.campaign_name ?? 'Campaign'} - {submission.influencer?.name ?? 'Influencer'}
              </Text>
            </View>
            <StatusBadge
              label={submission.status}
              tone={
                submission.status === 'approved'
                  ? 'success'
                  : submission.status === 'needs_changes'
                    ? 'warning'
                    : submission.status === 'rejected'
                      ? 'danger'
                      : 'default'
              }
            />
          </View>
          <Text style={styles.meta}>Due {formatDate(submission.due_date)}</Text>
        </Pressable>
      ))}

      {selectedSubmissionId && submissionDetail.data ? (
        <Card>
          <View style={styles.rowHeader}>
            <View style={styles.flexGrow}>
              <Text style={styles.detailTitle}>{submissionDetail.data.title}</Text>
              <Text style={styles.subtitle}>
                {submissionDetail.data.campaign?.campaign_name ?? 'Campaign'} -{' '}
                {submissionDetail.data.influencer?.name ?? 'Influencer'}
              </Text>
            </View>
            <Pressable onPress={() => setSelectedSubmissionId(null)}>
              <Text style={styles.link}>Close</Text>
            </Pressable>
          </View>

          <StatusBadge
            label={submissionDetail.data.status}
            tone={
              submissionDetail.data.status === 'approved'
                ? 'success'
                : submissionDetail.data.status === 'needs_changes'
                  ? 'warning'
                  : submissionDetail.data.status === 'rejected'
                    ? 'danger'
                    : 'default'
            }
          />

          {submissionDetail.data.media_type === 'image' ? (
            <Image
              resizeMode="cover"
              source={{ uri: submissionDetail.data.media_url }}
              style={styles.previewImage}
            />
          ) : (
            <Button
              label="Open media link"
              onPress={() => {
                void Linking.openURL(submissionDetail.data.media_url);
              }}
              variant="secondary"
            />
          )}

          <Text style={styles.meta}>Caption: {submissionDetail.data.caption ?? 'No caption'}</Text>
          <Text style={styles.meta}>
            Submitted at: {submissionDetail.data.submitted_at ? formatDate(submissionDetail.data.submitted_at, 'MMM d, yyyy HH:mm') : 'N/A'}
          </Text>
          <Text style={styles.meta}>
            Reviewed at: {submissionDetail.data.reviewed_at ? formatDate(submissionDetail.data.reviewed_at, 'MMM d, yyyy HH:mm') : 'N/A'}
          </Text>

          <AppInput
            label="Feedback"
            multiline
            onChangeText={setFeedback}
            placeholder="Required for needs changes or rejection"
            value={feedback}
          />

          {formError ? <ErrorBanner message={formError} /> : null}

          <View style={styles.actionsWrap}>
            <Button
              disabled={updateStatus.isPending}
              label={updateStatus.isPending ? 'Saving...' : 'Approve'}
              onPress={() => void handleUpdateStatus('approved')}
              style={styles.actionButton}
            />
            <Button
              disabled={updateStatus.isPending}
              label="Needs changes"
              onPress={() => void handleUpdateStatus('needs_changes')}
              style={styles.actionButton}
              variant="secondary"
            />
            <Button
              disabled={updateStatus.isPending}
              label="Reject"
              onPress={() => void handleUpdateStatus('rejected')}
              style={styles.actionButton}
              variant="danger"
            />
          </View>

          <Button
            disabled={deleteSubmission.isPending}
            label={deleteSubmission.isPending ? 'Deleting...' : 'Delete submission'}
            onPress={() => {
              if (!selectedSubmissionId) {
                return;
              }

              confirmAction(
                'Delete submission',
                'This permanently removes the submission record.',
                'Delete',
                () => {
                  void deleteSubmission
                    .mutateAsync()
                    .then(() => {
                      setSelectedSubmissionId(null);
                      setFeedback('');
                    })
                    .catch((err) =>
                      Alert.alert('Delete failed', toErrorMessage(err, 'Unable to delete submission'))
                    );
                }
              );
            }}
            style={styles.deleteButton}
            variant="danger"
          />
        </Card>
      ) : null}

      <Modal animationType="slide" onRequestClose={() => setCreateVisible(false)} transparent visible={createVisible}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Card>
              <SectionTitle title="Create Submission Request" subtitle="Link campaign + influencer + due date" />
              {formError ? <ErrorBanner message={formError} /> : null}

              <Text style={styles.fieldLabel}>Choose campaign</Text>
              {campaigns.data?.map((campaign) => (
                <Pressable
                  key={campaign.id}
                  onPress={() => setRequestForm((prev) => ({ ...prev, campaignId: campaign.id }))}
                  style={[
                    styles.selectRow,
                    requestForm.campaignId === campaign.id && styles.selectedRow
                  ]}
                >
                  <Text style={styles.title}>{campaign.campaign_name}</Text>
                  <Text style={styles.meta}>{campaign.brand_name}</Text>
                </Pressable>
              ))}

              <Text style={styles.fieldLabel}>Choose influencer</Text>
              {influencers.data?.map((influencer) => (
                <Pressable
                  key={influencer.id}
                  onPress={() => setRequestForm((prev) => ({ ...prev, influencerId: influencer.id }))}
                  style={[
                    styles.selectRow,
                    requestForm.influencerId === influencer.id && styles.selectedRow
                  ]}
                >
                  <Text style={styles.title}>{influencer.name}</Text>
                  <Text style={styles.meta}>@{influencer.handle}</Text>
                </Pressable>
              ))}

              <AppInput
                label="Title"
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, title: value }))}
                value={requestForm.title}
              />
              <AppInput
                label="Caption / guidelines"
                multiline
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, caption: value }))}
                value={requestForm.caption}
              />
              <SegmentedControl
                onChange={(value) => setRequestForm((prev) => ({ ...prev, mediaType: value }))}
                options={mediaOptions}
                value={requestForm.mediaType}
              />
              <AppInput
                label="Media URL"
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, mediaUrl: value }))}
                placeholder="https://"
                value={requestForm.mediaUrl}
              />
              <AppInput
                label="Due date (YYYY-MM-DD)"
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, dueDate: value }))}
                value={requestForm.dueDate}
              />

              {selectedCampaignName ? (
                <Text style={styles.meta}>Campaign selected: {selectedCampaignName}</Text>
              ) : null}

              <View style={styles.actionsWrap}>
                <Button label="Cancel" onPress={() => setCreateVisible(false)} style={styles.actionButton} variant="secondary" />
                <Button
                  disabled={
                    createSubmission.isPending ||
                    requestForm.campaignId.length === 0 ||
                    requestForm.influencerId.length === 0 ||
                    requestForm.title.length === 0 ||
                    requestForm.dueDate.length === 0
                  }
                  label={createSubmission.isPending ? 'Creating...' : 'Create request'}
                  onPress={() => void handleCreateRequest()}
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
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  flexGrow: {
    flex: 1,
    minWidth: 0
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15
  },
  subtitle: {
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
  link: {
    color: colors.accent,
    fontWeight: '700'
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  actionButton: {
    flex: 1,
    minWidth: 120
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
