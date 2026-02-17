import type { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import {
  getProfile,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  upsertProfile
} from '@/features/auth/api';
import { getLocalProfile, getLocalUserId, upsertLocalProfile } from '@/lib/localStore';
import { ensureLocalNotificationPermission } from '@/lib/onesignal/localNotifications';
import {
  initializeOneSignal,
  linkOneSignalToUser,
  setPushOptIn,
  unlinkOneSignalUser
} from '@/lib/onesignal/service';
import { supabase } from '@/lib/supabase/client';
import { useUiStore } from '@/stores/uiStore';
import type { Profile } from '@/types';
import { isSupabaseConfigured } from '@/utils/env';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const notificationsEnabled = useUiStore((state) => state.notificationsEnabled);

  const loadProfile = async (userId: string): Promise<void> => {
    const nextProfile = await getProfile(userId);
    setProfile(nextProfile);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (): Promise<void> => {
      try {
        await initializeOneSignal();
        if (notificationsEnabled) {
          await ensureLocalNotificationPermission();
        }
        if (!isSupabaseConfigured() || !supabase) {
          const localUserId = getLocalUserId();
          const localProfile = getLocalProfile();
          const mockUser = { id: localUserId, email: 'local@influencehub.dev' } as User;

          if (!mounted) {
            return;
          }

          setLocalUser(mockUser);
          setProfile(localProfile);
          await linkOneSignalToUser(localUserId);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        setSession(data.session);
        if (data.session?.user?.id) {
          await loadProfile(data.session.user.id);
          await linkOneSignalToUser(data.session.user.id);
        }
      } catch (error) {
        console.warn('Failed to bootstrap auth provider', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    if (!isSupabaseConfigured() || !supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession?.user?.id) {
        setProfile(null);
        unlinkOneSignalUser();
        return;
      }

      void loadProfile(nextSession.user.id);
      void linkOneSignalToUser(nextSession.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [notificationsEnabled]);

  useEffect(() => {
    setPushOptIn(notificationsEnabled);
  }, [notificationsEnabled]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user: session?.user ?? localUser ?? null,
      profile,
      isLoading,
      signIn: async (email: string, password: string) => {
        if (!isSupabaseConfigured() || !supabase) {
          const localUserId = getLocalUserId();
          const mockUser = { id: localUserId, email: email.trim() } as User;
          setLocalUser(mockUser);
          upsertLocalProfile({ id: localUserId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
          return;
        }

        await signInWithEmail(email.trim(), password);
      },
      signUp: async (email: string, password: string) => {
        if (!isSupabaseConfigured() || !supabase) {
          const localUserId = getLocalUserId();
          const mockUser = { id: localUserId, email: email.trim() } as User;
          setLocalUser(mockUser);
          upsertLocalProfile({ id: localUserId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
          return;
        }

        const user = await signUpWithEmail(email.trim(), password);
        await upsertProfile({
          id: user.id,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      },
      signOut: async () => {
        if (!isSupabaseConfigured() || !supabase) {
          setLocalUser(null);
          setProfile(null);
          return;
        }

        await signOutCurrentUser();
      },
      refreshProfile: async () => {
        if (!isSupabaseConfigured() || !supabase) {
          setProfile(getLocalProfile());
          return;
        }

        if (!session?.user?.id) {
          return;
        }

        await loadProfile(session.user.id);
      }
    };
  }, [isLoading, localUser, profile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
