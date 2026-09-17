// file: scripts/dbPush.js
require('dotenv').config();

const { execSync } = require('child_process');

const projectRef = 'ymwoglwtrjuvspfvdopn';
const password = process.env.SUPABASE_DB_PASSWORD?.replace(/^["']|["']$/g, '');

const run = (cmd) => execSync(cmd, { stdio: 'inherit', env: process.env });

if (!password) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env');
  console.error('');
  console.error('The access-token + --linked flow fails on some projects (cli_login_postgres error).');
  console.error('Use your direct database password instead:');
  console.error('  Supabase Dashboard → Project Settings → Database → Database password');
  console.error('');
  console.error('Add to .env:');
  console.error('  SUPABASE_DB_PASSWORD=your_password_here');
  process.exit(1);
}

const dbUrl = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

console.log(`Pushing migrations to ${projectRef} (direct connection)...`);

run(`npx supabase db push --db-url "${dbUrl}" --include-all`);
