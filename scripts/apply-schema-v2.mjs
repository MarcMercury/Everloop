import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
console.log(`📦 Project: ${projectRef}\n`);

// Read the schema file
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema-v2.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function runSchema() {
  console.log('🚀 Running V2 schema via Supabase SQL API...\n');
  
  // Use the Supabase SQL API endpoint
  const apiUrl = `https://${projectRef}.supabase.co/rest/v1/rpc/`;
  
  // First, let's try to create a helper function
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_ddl(sql_command text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_command;
    END;
    $$;
  `;
  
  // Try executing via pg_query endpoint (internal API)
  const response = await fetch(`https://${projectRef}.supabase.co/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      query: schemaSql
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ Schema executed successfully!');
    console.log(result);
    return;
  }
  
  // Fallback: Try the SQL execution endpoint
  console.log('⚠️  Direct execution not available, trying alternative...');
  
  // Try the dashboard API
  const dashboardResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      query: schemaSql
    })
  });
  
  if (dashboardResponse.ok) {
    console.log('✅ Schema executed via Dashboard API!');
    return;
  }
  
  console.log('\n❌ Could not execute schema programmatically.');
  console.log('\n📋 Please run the schema manually in Supabase SQL Editor:');
  console.log(`   1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql`);
  console.log('   2. Copy the contents of: supabase/schema-v2.sql');
  console.log('   3. Paste and click "Run"\n');
}

runSchema().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
