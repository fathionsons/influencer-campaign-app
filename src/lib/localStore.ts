import type {
  Campaign,
  CampaignInfluencer,
  Influencer,
  NotificationDevice,
  Payout,
  Profile,
  Submission
} from '@/types';

const LOCAL_USER_ID = 'local-user';

const createId = (): string => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const toDateOnly = (date: Date): string => date.toISOString().split('T')[0] ?? date.toISOString();

const state = {
  seeded: false,
  profiles: [] as Profile[],
  campaigns: [] as Campaign[],
  influencers: [] as Influencer[],
  campaignInfluencers: [] as CampaignInfluencer[],
  submissions: [] as Submission[],
  payouts: [] as Payout[],
  notificationDevices: [] as NotificationDevice[]
};

const ensureSeeded = (): void => {
  if (state.seeded) {
    return;
  }

  const now = new Date();
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  state.profiles.push({
    id: LOCAL_USER_ID,
    full_name: 'Local Operator',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  });

  const campaign1: Campaign = {
    id: createId(),
    owner_user_id: LOCAL_USER_ID,
    brand_name: 'Lumen Skincare',
    campaign_name: 'Glow Routine Launch',
    description: 'Creator-led launch for Glow Routine.',
    start_date: toDateOnly(daysFromNow(-10)),
    end_date: toDateOnly(daysFromNow(20)),
    budget: 35000,
    status: 'active',
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  const campaign2: Campaign = {
    id: createId(),
    owner_user_id: LOCAL_USER_ID,
    brand_name: 'Pulse Fitness',
    campaign_name: 'New Year Reset',
    description: 'Short-form content push for January.',
    start_date: toDateOnly(daysFromNow(-30)),
    end_date: toDateOnly(daysFromNow(-2)),
    budget: 22000,
    status: 'completed',
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  const campaign3: Campaign = {
    id: createId(),
    owner_user_id: LOCAL_USER_ID,
    brand_name: 'Coda Audio',
    campaign_name: 'Studio Sessions',
    description: 'UGC around new audio gear drop.',
    start_date: toDateOnly(daysFromNow(-5)),
    end_date: toDateOnly(daysFromNow(25)),
    budget: 18000,
    status: 'active',
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  state.campaigns.push(campaign1, campaign2, campaign3);

  const influencers: Influencer[] = [
    {
      id: createId(),
      owner_user_id: LOCAL_USER_ID,
      name: 'Avery Lane',
      platform: 'instagram',
      handle: 'averylanes',
      followers: 95000,
      engagement_rate: 3.4,
      email: 'avery@creatorhub.com',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: createId(),
      owner_user_id: LOCAL_USER_ID,
      name: 'Jordan Pike',
      platform: 'tiktok',
      handle: 'pikefitness',
      followers: 210000,
      engagement_rate: 4.1,
      email: 'jordan@creatorhub.com',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: createId(),
      owner_user_id: LOCAL_USER_ID,
      name: 'Mila Santos',
      platform: 'youtube',
      handle: 'milaexplains',
      followers: 54000,
      engagement_rate: 2.8,
      email: 'mila@creatorhub.com',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  ];

  state.influencers.push(...influencers);

  const [inf0, inf1, inf2] = influencers;
  if (!inf0 || !inf1 || !inf2) {
    throw new Error('Local seed requires at least 3 influencers');
  }

  state.campaignInfluencers.push(
    {
      id: createId(),
      campaign_id: campaign1.id,
      influencer_id: inf0.id,
      role: 'Lead creator',
      agreed_fee: 2000,
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: createId(),
      campaign_id: campaign1.id,
      influencer_id: inf1.id,
      role: 'Support creator',
      agreed_fee: 1500,
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: createId(),
      campaign_id: campaign3.id,
      influencer_id: inf2.id,
      role: 'Feature creator',
      agreed_fee: 1200,
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  );

  const submissions: Submission[] = Array.from({ length: 12 }).map((_, index) => {
    const campaign = state.campaigns[index % state.campaigns.length];
    const influencer = influencers[index % influencers.length];
    if (!campaign || !influencer) {
      throw new Error('Local seed missing campaign or influencer');
    }
    const submittedAt = daysFromNow(-7 + index).toISOString();
    const reviewedAt = index % 3 === 0 ? daysFromNow(-6 + index).toISOString() : null;
    const status =
      index % 4 === 0
        ? 'approved'
        : index % 4 === 1
          ? 'needs_changes'
          : index % 4 === 2
            ? 'submitted'
            : 'rejected';

    return {
      id: createId(),
      campaign_id: campaign.id,
      influencer_id: influencer.id,
      title: `Content concept ${index + 1}`,
      caption: 'Highlight the hero product and include CTA.',
      media_type: 'link',
      media_url: 'https://example.com/asset-preview',
      due_date: toDateOnly(daysFromNow(2 + (index % 5))),
      status,
      feedback: status === 'needs_changes' ? 'Adjust lighting and add product close-up.' : null,
      submitted_at: submittedAt,
      reviewed_at: reviewedAt,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
  });

  state.submissions.push(...submissions);

  state.payouts.push(
    {
      id: createId(),
      campaign_id: campaign1.id,
      influencer_id: inf0.id,
      amount: 2000,
      currency: 'USD',
      status: 'unpaid',
      due_date: toDateOnly(daysFromNow(5)),
      paid_at: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: createId(),
      campaign_id: campaign2.id,
      influencer_id: inf1.id,
      amount: 1500,
      currency: 'USD',
      status: 'paid',
      due_date: toDateOnly(daysFromNow(-3)),
      paid_at: daysFromNow(-1).toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  );

  state.seeded = true;
};

const touch = () => new Date().toISOString();

export const getLocalUserId = (): string => LOCAL_USER_ID;

export const getLocalProfile = (): Profile | null => {
  ensureSeeded();
  return state.profiles.find((profile) => profile.id === LOCAL_USER_ID) ?? null;
};

export const upsertLocalProfile = (profile: { id: string; full_name?: string; timezone?: string }): void => {
  ensureSeeded();
  const existing = state.profiles.find((item) => item.id === profile.id);
  if (existing) {
    existing.full_name = profile.full_name ?? existing.full_name;
    existing.timezone = profile.timezone ?? existing.timezone;
    existing.updated_at = touch();
    return;
  }

  state.profiles.push({
    id: profile.id,
    full_name: profile.full_name ?? null,
    timezone: profile.timezone ?? null,
    created_at: touch(),
    updated_at: touch()
  });
};

export const listLocalCampaigns = (status: Campaign['status'] | 'all'): Campaign[] => {
  ensureSeeded();
  const campaigns = state.campaigns.filter((campaign) => campaign.owner_user_id === LOCAL_USER_ID);
  const filtered = status === 'all' ? campaigns : campaigns.filter((campaign) => campaign.status === status);
  return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const getLocalCampaign = (campaignId: string): Campaign => {
  ensureSeeded();
  const campaign = state.campaigns.find((item) => item.id === campaignId && item.owner_user_id === LOCAL_USER_ID);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

export const createLocalCampaign = (input: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Campaign => {
  ensureSeeded();
  const now = touch();
  const campaign: Campaign = {
    ...input,
    id: createId(),
    created_at: now,
    updated_at: now
  };
  state.campaigns.push(campaign);
  return campaign;
};

export const updateLocalCampaign = (campaignId: string, input: Partial<Campaign>): Campaign => {
  ensureSeeded();
  const campaign = getLocalCampaign(campaignId);
  Object.assign(campaign, input, { updated_at: touch() });
  return campaign;
};

export const deleteLocalCampaign = (campaignId: string): void => {
  ensureSeeded();
  state.campaigns = state.campaigns.filter((campaign) => campaign.id !== campaignId);
  state.campaignInfluencers = state.campaignInfluencers.filter(
    (item) => item.campaign_id !== campaignId
  );
  state.submissions = state.submissions.filter((item) => item.campaign_id !== campaignId);
  state.payouts = state.payouts.filter((item) => item.campaign_id !== campaignId);
};

export const listLocalInfluencers = (): Influencer[] => {
  ensureSeeded();
  return state.influencers.filter((item) => item.owner_user_id === LOCAL_USER_ID);
};

export const getLocalInfluencer = (influencerId: string): Influencer => {
  ensureSeeded();
  const influencer = state.influencers.find(
    (item) => item.id === influencerId && item.owner_user_id === LOCAL_USER_ID
  );
  if (!influencer) {
    throw new Error('Influencer not found');
  }
  return influencer;
};

export const createLocalInfluencer = (input: Omit<Influencer, 'id' | 'created_at' | 'updated_at'>): Influencer => {
  ensureSeeded();
  const now = touch();
  const influencer: Influencer = {
    ...input,
    id: createId(),
    created_at: now,
    updated_at: now
  };
  state.influencers.push(influencer);
  return influencer;
};

export const updateLocalInfluencer = (
  influencerId: string,
  input: Partial<Influencer>
): Influencer => {
  ensureSeeded();
  const influencer = getLocalInfluencer(influencerId);
  Object.assign(influencer, input, { updated_at: touch() });
  return influencer;
};

export const deleteLocalInfluencer = (influencerId: string): void => {
  ensureSeeded();
  state.influencers = state.influencers.filter((item) => item.id !== influencerId);
  state.campaignInfluencers = state.campaignInfluencers.filter(
    (item) => item.influencer_id !== influencerId
  );
  state.submissions = state.submissions.filter((item) => item.influencer_id !== influencerId);
  state.payouts = state.payouts.filter((item) => item.influencer_id !== influencerId);
};

export const listLocalCampaignInfluencers = (campaignId: string): CampaignInfluencer[] => {
  ensureSeeded();
  return state.campaignInfluencers.filter((item) => item.campaign_id === campaignId);
};

export const assignLocalInfluencerToCampaign = (input: {
  campaign_id: string;
  influencer_id: string;
  role?: string | null;
  agreed_fee?: number | null;
}): CampaignInfluencer => {
  ensureSeeded();
  const existing = state.campaignInfluencers.find(
    (item) => item.campaign_id === input.campaign_id && item.influencer_id === input.influencer_id
  );
  if (existing) {
    return existing;
  }

  const now = touch();
  const record: CampaignInfluencer = {
    id: createId(),
    campaign_id: input.campaign_id,
    influencer_id: input.influencer_id,
    role: input.role ?? null,
    agreed_fee: input.agreed_fee ?? null,
    status: 'active',
    created_at: now,
    updated_at: now
  };
  state.campaignInfluencers.push(record);
  return record;
};

export const listLocalSubmissions = (status: Submission['status'] | 'all'): Submission[] => {
  ensureSeeded();
  const filtered = status === 'all' ? state.submissions : state.submissions.filter((s) => s.status === status);
  return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const getLocalSubmission = (submissionId: string): Submission => {
  ensureSeeded();
  const submission = state.submissions.find((item) => item.id === submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }
  return submission;
};

export const createLocalSubmission = (input: Submission): Submission => {
  ensureSeeded();
  const now = touch();
  const record: Submission = {
    ...input,
    id: input.id && input.id.length > 0 ? input.id : createId(),
    created_at: now,
    updated_at: now
  };
  state.submissions.push(record);
  return record;
};

export const updateLocalSubmission = (submissionId: string, input: Partial<Submission>): Submission => {
  ensureSeeded();
  const submission = getLocalSubmission(submissionId);
  Object.assign(submission, input, { updated_at: touch() });
  return submission;
};

export const deleteLocalSubmission = (submissionId: string): void => {
  ensureSeeded();
  state.submissions = state.submissions.filter((item) => item.id !== submissionId);
};

export const listLocalPayouts = (): Payout[] => {
  ensureSeeded();
  return state.payouts;
};

export const markLocalPayoutPaid = (payoutId: string): Payout => {
  ensureSeeded();
  const payout = state.payouts.find((item) => item.id === payoutId);
  if (!payout) {
    throw new Error('Payout not found');
  }
  payout.status = 'paid';
  payout.paid_at = touch();
  payout.updated_at = touch();
  return payout;
};

export const upsertLocalNotificationDevice = (
  device: Pick<NotificationDevice, 'user_id' | 'one_signal_id'> &
    Partial<NotificationDevice>
): void => {
  ensureSeeded();
  const existing = state.notificationDevices.find(
    (item) => item.user_id === device.user_id && item.one_signal_id === device.one_signal_id
  );
  if (existing) {
    existing.platform = device.platform ?? existing.platform;
    existing.push_token = device.push_token ?? existing.push_token;
    existing.updated_at = touch();
    return;
  }

  state.notificationDevices.push({
    id: device.id ?? createId(),
    user_id: device.user_id,
    one_signal_id: device.one_signal_id,
    platform: device.platform ?? null,
    push_token: device.push_token ?? null,
    created_at: touch(),
    updated_at: touch()
  });
};

export const getLocalCampaignByInfluencer = (influencerId: string): CampaignInfluencer[] => {
  ensureSeeded();
  return state.campaignInfluencers.filter((item) => item.influencer_id === influencerId);
};

export const getLocalInfluencerById = (influencerId: string): Influencer | null => {
  ensureSeeded();
  return state.influencers.find((item) => item.id === influencerId) ?? null;
};

export const getLocalCampaignById = (campaignId: string): Campaign | null => {
  ensureSeeded();
  return state.campaigns.find((item) => item.id === campaignId) ?? null;
};
