import { supabase } from '../lib/supabase';

export type ReportTargetType = 'poem' | 'user' | 'message' | 'comment';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

export type AbuseReport = {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  created_at: string;
};

export const submitReport = async (
  reporterId: string,
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
  details?: string,
) => {
  const { data, error } = await supabase
    .from('abuse_reports')
    .insert([{ reporter_id: reporterId, target_type: targetType, target_id: targetId, reason, details }])
    .select()
    .single();

  if (error) throw error;
  return data as AbuseReport;
};

export const fetchPendingReports = async () => {
  const { data, error } = await supabase
    .from('abuse_reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as AbuseReport[];
};

export const updateReportStatus = async (reportId: string, status: ReportStatus) => {
  const { error } = await supabase
    .from('abuse_reports')
    .update({ status })
    .eq('id', reportId);

  if (error) throw error;
};

export const isUserBlocked = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_user_blocked', {
    p_user_id: userId,
  });

  if (error) {
    console.warn('Block check failed:', error.message);
    return false;
  }
  return Boolean(data);
};

export const blockUser = async (userId: string, reason?: string) => {
  const { error } = await supabase.rpc('block_user', {
    p_user_id: userId,
    p_reason: reason || null,
  });

  if (error) throw error;
};

export const checkRateLimit = async (
  userId: string,
  action: string,
  maxRequests = 10,
  windowMinutes = 60,
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_action: action,
    p_max_requests: maxRequests,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    console.warn('Rate limit check failed:', error.message);
    return true;
  }
  return Boolean(data);
};
