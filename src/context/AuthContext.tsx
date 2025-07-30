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
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
      // Clean up any other subscriptions when component unmounts
      const channel = supabase.channel('user_followers');
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const followersChannel = supabase
      .channel('user_followers')
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
      supabase.removeChannel(followersChannel);
    };
  }, [user]);

  const checkUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const register = async (email: string, password: string, username: string) => {
    await signUp(email, password, username);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);