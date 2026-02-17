import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const seedUserId = process.env.SEED_USER_ID;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!seedUserId) {
  console.error('Missing SEED_USER_ID. Create a user in Supabase Auth and pass the user id.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const today = new Date();
const dayMs = 24 * 60 * 60 * 1000;

const makeDate = (offsetDays: number) => {
  return new Date(today.getTime() + offsetDays * dayMs).toISOString();
};

const run = async () => {
  console.log('Seeding data...');

  const campaigns = [
    {
      owner_user_id: seedUserId,
      brand_name: 'Lumen Skincare',
      campaign_name: 'Glow Routine Launch',
      description: 'Creator-led launch for Glow Routine',
      start_date: makeDate(-14),
      end_date: makeDate(21),
      budget: 35000,
      status: 'active'
    },
    {
      owner_user_id: seedUserId,
      brand_name: 'Pulse Fitness',
      campaign_name: 'New Year Reset',
      description: 'Short-form content push for January',
      start_date: makeDate(-40),
      end_date: makeDate(-5),
      budget: 22000,
      status: 'completed'
    },
    {
      owner_user_id: seedUserId,
      brand_name: 'Coda Audio',
      campaign_name: 'Studio Sessions',
      description: 'UGC around new audio gear drop',
      start_date: makeDate(-7),
      end_date: makeDate(28),
      budget: 18000,
      status: 'active'
    }
  ];

  const { data: campaignRows, error: campaignError } = await supabase
    .from('campaigns')
    .insert(campaigns)
    .select('id, campaign_name');

  if (campaignError) {
    throw campaignError;
  }

  const influencers = [
    {
      owner_user_id: seedUserId,
      name: 'Avery Lane',
      platform: 'instagram',
      handle: 'averylanes',
      followers: 95000,
      engagement_rate: 3.4,
      email: 'avery@creatorhub.com'
    },
    {
      owner_user_id: seedUserId,
      name: 'Jordan Pike',
      platform: 'tiktok',
      handle: 'pikefitness',
      followers: 210000,
      engagement_rate: 4.1,
      email: 'jordan@creatorhub.com'
    },
    {
      owner_user_id: seedUserId,
      name: 'Mila Santos',
      platform: 'youtube',
      handle: 'milaexplains',
      followers: 54000,
      engagement_rate: 2.8,
      email: 'mila@creatorhub.com'
    },
    {
      owner_user_id: seedUserId,
      name: 'Kai Rivers',
      platform: 'instagram',
      handle: 'kairivers',
      followers: 125000,
      engagement_rate: 3.9,
      email: 'kai@creatorhub.com'
    },
    {
      owner_user_id: seedUserId,
      name: 'Nora Park',
      platform: 'other',
      handle: 'norapark',
      followers: 32000,
      engagement_rate: 5.2,
      email: 'nora@creatorhub.com'
    }
  ];

  const { data: influencerRows, error: influencerError } = await supabase
    .from('influencers')
    .insert(influencers)
    .select('id, name');

  if (influencerError) {
    throw influencerError;
  }

  if (!campaignRows || !influencerRows) {
    throw new Error('Failed to fetch inserted campaigns or influencers');
  }

  const campaignInfluencers = campaignRows.flatMap((campaign, index) => {
    if (!campaign) {
      return [];
    }

    return influencerRows.slice(0, 3).map((influencer, offset) => ({
      campaign_id: campaign.id,
      influencer_id: influencer.id,
      role: offset % 2 === 0 ? 'Primary creator' : 'Support creator',
      agreed_fee: 1500 + index * 250 + offset * 150,
      status: 'active'
    }));
  });

  const { error: ciError } = await supabase.from('campaign_influencers').insert(campaignInfluencers);

  if (ciError) {
    throw ciError;
  }

  const submissions = Array.from({ length: 24 }).map((_, index) => {
    const campaign = campaignRows[index % campaignRows.length];
    const influencer = influencerRows[index % influencerRows.length];

    if (!campaign || !influencer) {
      throw new Error('Missing campaign or influencer for seeding submissions');
    }
    const submittedAt = makeDate(-20 + index);
    const reviewedAt = index % 3 === 0 ? makeDate(-18 + index) : null;
    const status = index % 4 === 0 ? 'approved' : index % 4 === 1 ? 'needs_changes' : index % 4 === 2 ? 'submitted' : 'rejected';

    return {
      campaign_id: campaign.id,
      influencer_id: influencer.id,
      title: `Content concept ${index + 1}`,
      caption: 'Keep it upbeat, highlight product benefits, and include CTA.',
      media_type: 'link',
      media_url: 'https://example.com/asset-preview',
      due_date: makeDate(3 + (index % 7)),
      status,
      feedback: status === 'needs_changes' ? 'Adjust lighting and include product close-up.' : null,
      submitted_at: submittedAt,
      reviewed_at: reviewedAt
    };
  });

  const { error: submissionError } = await supabase.from('submissions').insert(submissions);

  if (submissionError) {
    throw submissionError;
  }

  const payouts = influencerRows.slice(0, 4).map((influencer, index) => {
    const campaign = campaignRows[index % campaignRows.length];
    if (!campaign) {
      throw new Error('Missing campaign for payouts');
    }

    return {
      campaign_id: campaign.id,
    influencer_id: influencer.id,
    amount: 2000 + index * 250,
    currency: 'USD',
    status: index % 2 === 0 ? 'unpaid' : 'paid',
    due_date: makeDate(7 + index),
    paid_at: index % 2 === 0 ? null : makeDate(-1)
    };
  });

  const { error: payoutError } = await supabase.from('payouts').insert(payouts);

  if (payoutError) {
    throw payoutError;
  }

  console.log('Seed complete.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
