import type { PostgrestSingleResponse, Session, User } from '@supabase/supabase-js';

import { getLocalProfile, getLocalUserId, upsertLocalProfile } from '@/lib/localStore';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/utils/env';
import type { Profile } from '@/types';

export const signInWithEmail = async (email: string, password: string): Promise<Session> => {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      access_token: 'local',
      refresh_token: 'local',
      expires_in: 0,
      expires_at: 0,
      token_type: 'bearer',
      user: {
        id: getLocalUserId(),
        email
      } as User
    } as Session;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error('No session returned from sign in');
  }

  return data.session;
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  if (!isSupabaseConfigured() || !supabase) {
    const localUserId = getLocalUserId();
    upsertLocalProfile({ id: localUserId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    return {
      id: localUserId,
      email
    } as User;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('No user returned from sign up');
  }

  return data.user;
};

export const signOutCurrentUser = async (): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    return getLocalProfile();
  }

  const { data, error } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()) as PostgrestSingleResponse<Profile>;

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return data;
};

export const upsertProfile = async (profile: { id: string; full_name?: string; timezone?: string }): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    upsertLocalProfile(profile);
    return;
  }

  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) {
    throw error;
  }
};
