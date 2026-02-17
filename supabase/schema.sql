-- InfluenceHub schema
-- Enable required extension
create extension if not exists "pgcrypto";

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Campaigns
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users on delete cascade,
  brand_name text not null,
  campaign_name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  budget numeric(12,2) not null default 0,
  status text not null check (status in ('draft','active','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Influencers
create table if not exists public.influencers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users on delete cascade,
  name text not null,
  platform text not null check (platform in ('instagram','tiktok','youtube','other')),
  handle text not null,
  followers integer not null default 0,
  engagement_rate numeric(5,2) not null default 0,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CampaignInfluencer join
create table if not exists public.campaign_influencers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns on delete cascade,
  influencer_id uuid not null references public.influencers on delete cascade,
  role text,
  agreed_fee numeric(12,2),
  status text not null check (status in ('invited','active','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, influencer_id)
);

-- Submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns on delete cascade,
  influencer_id uuid not null references public.influencers on delete cascade,
  title text not null,
  caption text,
  media_type text not null check (media_type in ('image','video','link')),
  media_url text not null,
  due_date date not null,
  status text not null check (status in ('submitted','needs_changes','approved','rejected')),
  feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payouts
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns on delete cascade,
  influencer_id uuid not null references public.influencers on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  status text not null check (status in ('unpaid','paid')),
  due_date date not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notification devices
create table if not exists public.notification_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  one_signal_id text not null,
  platform text,
  push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, one_signal_id)
);

-- Indexes
create index if not exists idx_campaigns_owner on public.campaigns (owner_user_id);
create index if not exists idx_campaigns_status on public.campaigns (status);
create index if not exists idx_influencers_owner on public.influencers (owner_user_id);
create index if not exists idx_campaign_influencers_campaign on public.campaign_influencers (campaign_id);
create index if not exists idx_campaign_influencers_influencer on public.campaign_influencers (influencer_id);
create index if not exists idx_submissions_campaign on public.submissions (campaign_id);
create index if not exists idx_submissions_influencer on public.submissions (influencer_id);
create index if not exists idx_submissions_status on public.submissions (status);
create index if not exists idx_submissions_due on public.submissions (due_date);
create index if not exists idx_payouts_campaign on public.payouts (campaign_id);
create index if not exists idx_payouts_influencer on public.payouts (influencer_id);
create index if not exists idx_payouts_status on public.payouts (status);
create index if not exists idx_payouts_due on public.payouts (due_date);
create index if not exists idx_notification_devices_user on public.notification_devices (user_id);

-- Updated at triggers
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger set_campaigns_updated_at before update on public.campaigns
for each row execute procedure public.set_updated_at();

create trigger set_influencers_updated_at before update on public.influencers
for each row execute procedure public.set_updated_at();

create trigger set_campaign_influencers_updated_at before update on public.campaign_influencers
for each row execute procedure public.set_updated_at();

create trigger set_submissions_updated_at before update on public.submissions
for each row execute procedure public.set_updated_at();

create trigger set_payouts_updated_at before update on public.payouts
for each row execute procedure public.set_updated_at();

create trigger set_notification_devices_updated_at before update on public.notification_devices
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.influencers enable row level security;
alter table public.campaign_influencers enable row level security;
alter table public.submissions enable row level security;
alter table public.payouts enable row level security;
alter table public.notification_devices enable row level security;

-- Profiles policies
create policy "Profiles are viewable by owner" on public.profiles
for select using (auth.uid() = id);

create policy "Profiles can be inserted by owner" on public.profiles
for insert with check (auth.uid() = id);

create policy "Profiles can be updated by owner" on public.profiles
for update using (auth.uid() = id);

-- Campaigns policies
create policy "Campaigns are scoped to owner" on public.campaigns
for select using (auth.uid() = owner_user_id);

create policy "Campaigns can be inserted by owner" on public.campaigns
for insert with check (auth.uid() = owner_user_id);

create policy "Campaigns can be updated by owner" on public.campaigns
for update using (auth.uid() = owner_user_id);

create policy "Campaigns can be deleted by owner" on public.campaigns
for delete using (auth.uid() = owner_user_id);

-- Influencers policies
create policy "Influencers are scoped to owner" on public.influencers
for select using (auth.uid() = owner_user_id);

create policy "Influencers can be inserted by owner" on public.influencers
for insert with check (auth.uid() = owner_user_id);

create policy "Influencers can be updated by owner" on public.influencers
for update using (auth.uid() = owner_user_id);

create policy "Influencers can be deleted by owner" on public.influencers
for delete using (auth.uid() = owner_user_id);

-- Campaign influencers policies
create policy "Campaign influencers scoped by campaign owner" on public.campaign_influencers
for select using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = campaign_influencers.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Campaign influencers insert by campaign owner" on public.campaign_influencers
for insert with check (
  exists (
    select 1 from public.campaigns
    where campaigns.id = campaign_influencers.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Campaign influencers update by campaign owner" on public.campaign_influencers
for update using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = campaign_influencers.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Campaign influencers delete by campaign owner" on public.campaign_influencers
for delete using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = campaign_influencers.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

-- Submissions policies
create policy "Submissions scoped by campaign owner" on public.submissions
for select using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = submissions.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Submissions insert by campaign owner" on public.submissions
for insert with check (
  exists (
    select 1 from public.campaigns
    where campaigns.id = submissions.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Submissions update by campaign owner" on public.submissions
for update using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = submissions.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Submissions delete by campaign owner" on public.submissions
for delete using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = submissions.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

-- Payouts policies
create policy "Payouts scoped by campaign owner" on public.payouts
for select using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = payouts.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Payouts insert by campaign owner" on public.payouts
for insert with check (
  exists (
    select 1 from public.campaigns
    where campaigns.id = payouts.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Payouts update by campaign owner" on public.payouts
for update using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = payouts.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

create policy "Payouts delete by campaign owner" on public.payouts
for delete using (
  exists (
    select 1 from public.campaigns
    where campaigns.id = payouts.campaign_id
      and campaigns.owner_user_id = auth.uid()
  )
);

-- Notification devices policies
create policy "Notification devices scoped by user" on public.notification_devices
for select using (auth.uid() = user_id);

create policy "Notification devices insert by user" on public.notification_devices
for insert with check (auth.uid() = user_id);

create policy "Notification devices update by user" on public.notification_devices
for update using (auth.uid() = user_id);

create policy "Notification devices delete by user" on public.notification_devices
for delete using (auth.uid() = user_id);
