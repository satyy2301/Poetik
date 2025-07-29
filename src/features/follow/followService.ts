// src/features/follow/followService.ts
import { supabase } from '../../lib/supabase';

export const toggleFollow = async (followerId: string, followeeId: string) => {
  const { data: existing } = await supabase
    .from('followers')
    .select()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .single();

  if (existing) {
    return supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('followee_id', followeeId);
  } else {
    return supabase
      .from('followers')
      .insert([{ follower_id: followerId, followee_id: followeeId }]);
  }
};

export const getUserFollowers = async (userId: string) => {
  return supabase
    .from('followers')
    .select('follower:users(*)')
    .eq('followee_id', userId);
};

export const getUserFollowing = async (userId: string) => {
  return supabase
    .from('followers')
    .select('followee:users(*)')
    .eq('follower_id', userId);
};