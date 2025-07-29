// src/lib/auth.ts
import { supabase } from './supabase';

export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
      }
    }
  });

  if (error) throw error;
  
  // Create user profile in public schema
  await supabase
    .from('profiles')
    .upsert({
      id: data.user?.id,
      username,
      updated_at: new Date().toISOString()
    });

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
  return data;
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
};