// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ymwoglwtrjuvspfvdopn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltd29nbHd0cmp1dnNwZnZkb3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODkyODMsImV4cCI6MjA2OTM2NTI4M30.y34k5q5n6RCzn0XEeTMb-8RbfIbV5zeAohfiY5UvDVE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);