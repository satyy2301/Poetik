// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Add this import
import { getCurrentUser, signIn, signOut, signUp } from '../lib/auth';

type AuthContextType = {
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check
    checkUser();

    // Subscribe to auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      // session may be null after sign out
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      // unsubscribe
      try {
        subscription?.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const followersChannel = supabase
      .channel(`user_followers:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'followers',
        filter: `followee_id=eq.${user.id}`
      }, (payload) => {
        console.log('Follower change:', payload);
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(followersChannel); } catch (e) { }
    };
  }, [user]);

  const checkUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();

      if (currentUser) {
        // Ensure the user exists in the users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', currentUser.id)
          .single();

        if (!existingUser) {
          await supabase
            .from('users')
            .insert([{ id: currentUser.id, username: currentUser.email?.split('@')[0] || 'user', created_at: new Date().toISOString() }]);
        }

        // Ensure the user exists in the authors table (if your app uses authors)
        const { data: existingAuthor } = await supabase
          .from('authors')
          .select('id')
          .eq('id', currentUser.id)
          .single();

        if (!existingAuthor) {
          await supabase
            .from('authors')
            .insert([{
              id: currentUser.id,
              name: currentUser.email?.split('@')[0] || 'Unknown User',
              created_at: new Date().toISOString(),
            }]);
        }
      }

      setUser(currentUser);
    } catch (err) {
      console.warn('checkUser failed', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn(email, password);
      await checkUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password, username);
      await checkUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.warn('logout failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);