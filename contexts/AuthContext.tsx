import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
// 1. New Imports for Mobile Auth
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// 2. Setup the Redirect URI (Must match app.json scheme: "lianebi")
const redirectTo = makeRedirectUri({
  scheme: 'lianebi',
});

// 3. Warm up the browser
WebBrowser.maybeCompleteAuthSession();

type UserProfile = {
  id: string;
  display_name: string | null;
  streak_count: number;
  last_activity_date: string | null;
  care_drops: number;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const fetchProfile = async (userId: string) => {
    try {
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          break;
        }
        if (data) {
          setProfile(data);
          break;
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error };
  };

  // --- NEW: Google Sign In for Mobile ---
  const signInWithGoogle = async () => {
    try {
      // 1. Get the URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { error };

      // 2. Open the browser
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      // 3. Handle successful redirect
      if (res.type === 'success') {
        const { url } = res;
        const params = extractParamsFromUrl(url);

        // If no tokens found, return error
        if (!params.access_token || !params.refresh_token) {
          return { error: 'No session tokens found' };
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        return { error: sessionError };
      }

      return { error: null }; // User cancelled or closed browser
    } catch (e) {
      return { error: e };
    }
  };

  // --- NEW: Facebook Sign In for Mobile ---
  const signInWithFacebook = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) return { error };

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (res.type === 'success') {
        const { url } = res;
        const params = extractParamsFromUrl(url);

        if (!params.access_token || !params.refresh_token) {
          return { error: 'No session tokens found' };
        }
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        return { error: sessionError };
      }

      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Helper Function (Outside Component) ---
const extractParamsFromUrl = (url: string) => {
  const params: { [key: string]: string } = {};
  const parser = url.split('#')[1] || url.split('?')[1];

  if (parser) {
    parser.split('&').forEach((part) => {
      const [key, value] = part.split('=');
      params[key] = decodeURIComponent(value);
    });
  }

  return {
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
