import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types';

export const signInWithEmail = async (email: string, password: string): Promise<Session> => {
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
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return data;
};

export const upsertProfile = async (profile: { id: string; full_name?: string; timezone?: string }): Promise<void> => {
  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) {
    throw error;
  }
};
