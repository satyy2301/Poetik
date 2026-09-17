// file: scripts/supabaseAdmin.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL in .env');
  }

  if (!serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY in .env. ' +
        'Get it from Supabase Dashboard → Project Settings → API Keys → service_role (secret). ' +
        'Server scripts need this to bypass RLS for seeding.',
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

module.exports = { getSupabaseAdmin };
