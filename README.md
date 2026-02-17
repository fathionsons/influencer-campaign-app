# InfluenceHub (Influencer Campaign & UGC Manager)

InfluenceHub is a production-ready mobile MVP for managing influencer campaigns, UGC submissions, approvals, payouts, and analytics. It mirrors the operational workflow of platforms like Flowbox with a clean, mobile-first UX.

## Features
- Auth (email/password) with session persistence
- Campaigns: create, edit, filter, assign influencers
- Influencers: profiles, performance summaries, campaign links
- Submissions: request, review, approve/reject/needs changes
- Dashboard: Next Actions (approvals, overdue, upcoming, payouts)
- Analytics: 7/30-day trends, KPIs, top influencers
- Payout tracking + “mark paid” flow
- Push notifications via OneSignal (EAS build) + local fallback
- Strict TypeScript, React Query + Zustand architecture

## Tech Stack
- React Native + Expo SDK 54
- TypeScript (strict)
- Expo Router
- React Query for server state
- Zustand for UI/local state
- Supabase (Auth + Postgres)
- OneSignal for push notifications
- Victory Native (legacy SVG-based) for charts; avoids Skia dependency while remaining RN-friendly
- date-fns for time logic

## Setup
1. Install dependencies:
   - `npm install`
2. Create `.env` from `.env.example`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (seed script only)
   - `EXPO_PUBLIC_ONESIGNAL_APP_ID`
   - `SEED_USER_ID` (seed script only)
3. Run the app:
   - `npm run start`
   - For Android: `npm run android` (requires device or emulator)
   - For iOS: `npm run ios` (macOS)
   - For web: `npm run web`

### Android device/emulator note
If you see “No Android connected device found”, connect a device with USB debugging enabled or start an emulator in Android Studio (AVD Manager). Expo Go on a physical device also works by scanning the QR code from `npm run start`.

### Local mode (no Supabase)
If Supabase env vars are missing, the app runs in local in-memory mode with seeded data. You can explore all screens without configuring Supabase. When you are ready, add Supabase keys to `.env` and restart the dev server.

## Supabase Schema & RLS
- Apply `supabase/schema.sql` in the Supabase SQL editor.
- RLS policies are included for per-user isolation on all tables.

## OneSignal Notes (EAS build required)
- OneSignal requires a native build; Expo Go cannot load the native SDK.
- EAS build steps:
  1. `npm install -g eas-cli`
  2. `eas build:configure`
  3. `eas build --platform android`
  4. Install the build on device and test push notifications
- Local notifications are implemented as a fallback for dev/testing.

## Architecture Notes
- Server state via React Query
- UI/local state via Zustand
- Feature-based structure under `src/features`
- Supabase RLS for data isolation

## Seed Script (Optional)
Generate demo data for analytics and dashboards:
1. Create a user in Supabase Auth and copy the `user_id`.
2. Run:
   - `SEED_USER_ID=<user_id> npm run seed`

## Screenshots (Placeholders)
- Dashboard
- Campaigns
- Influencers
- Submissions
- Analytics
- Settings

## Demo Script (Short)
1. Sign in or create an account.
2. Create a campaign and assign 1-2 influencers.
3. Request a submission with a due date.
4. Review the submission and approve it.
5. Check the Dashboard “Next Actions”.
6. Visit Analytics and toggle 7/30-day ranges.

## Repo Links
- GitHub: (add link)

## Folder Structure
- `src/app`: Expo Router routes
- `src/components`: reusable UI components
- `src/features`: domain features + React Query hooks
- `src/lib`: Supabase, OneSignal, date helpers
- `src/stores`: Zustand stores
- `supabase/schema.sql`: schema + RLS
- `scripts/seed.ts`: optional demo data generator
