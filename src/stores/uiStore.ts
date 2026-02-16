import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AnalyticsRange, CampaignStatus, SubmissionStatus } from '@/types';

interface UiState {
  campaignFilter: CampaignStatus | 'all';
  submissionFilter: SubmissionStatus | 'all';
  analyticsRange: AnalyticsRange;
  activeModal: string | null;
  selectedCampaignId: string | null;
  selectedInfluencerId: string | null;
  selectedSubmissionId: string | null;
  notificationsEnabled: boolean;
  timezone: string;
  setCampaignFilter: (value: CampaignStatus | 'all') => void;
  setSubmissionFilter: (value: SubmissionStatus | 'all') => void;
  setAnalyticsRange: (value: AnalyticsRange) => void;
  setActiveModal: (value: string | null) => void;
  setSelectedCampaignId: (value: string | null) => void;
  setSelectedInfluencerId: (value: string | null) => void;
  setSelectedSubmissionId: (value: string | null) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setTimezone: (value: string) => void;
}

const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      campaignFilter: 'all',
      submissionFilter: 'all',
      analyticsRange: 7,
      activeModal: null,
      selectedCampaignId: null,
      selectedInfluencerId: null,
      selectedSubmissionId: null,
      notificationsEnabled: true,
      timezone: defaultTimezone,
      setCampaignFilter: (value) => set({ campaignFilter: value }),
      setSubmissionFilter: (value) => set({ submissionFilter: value }),
      setAnalyticsRange: (value) => set({ analyticsRange: value }),
      setActiveModal: (value) => set({ activeModal: value }),
      setSelectedCampaignId: (value) => set({ selectedCampaignId: value }),
      setSelectedInfluencerId: (value) => set({ selectedInfluencerId: value }),
      setSelectedSubmissionId: (value) => set({ selectedSubmissionId: value }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      setTimezone: (value) => set({ timezone: value })
    }),
    {
      name: 'influencehub-ui',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
