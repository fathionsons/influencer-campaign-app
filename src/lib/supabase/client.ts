import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient, type SupportedStorage } from '@supabase/supabase-js';

import type { Database } from '@/types';
import { getSupabaseConfig } from '@/utils/env';

const supabaseConfig = getSupabaseConfig();

const storage: SupportedStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key)
};

export const supabase: SupabaseClient<Database> | null = supabaseConfig
  ? (createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    }) as SupabaseClient<Database>)
  : null;
