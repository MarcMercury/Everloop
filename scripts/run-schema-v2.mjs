#!/usr/bin/env node
// Script to run schema-v2.sql against Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iakfnavclhvmuwvskrfo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Read the schema file
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema-v2.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Split by semicolons but handle DO blocks specially
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inDoBlock = false;
  
  const lines = sql.split('\n');
  for (const line of lines) {
    // Skip empty lines and comments at the start
    if (!current && (line.trim() === '' || line.trim().startsWith('--'))) {
      continue;
    }
    
    current += line + '\n';
    
    // Track DO blocks
    if (line.trim().toUpperCase().startsWith('DO $$') || line.trim().toUpperCase().startsWith('DO $')) {
      inDoBlock = true;
    }
    if (inDoBlock && line.trim().includes('END $$;')) {
      inDoBlock = false;
      statements.push(current.trim());
      current = '';
      continue;
    }
    
    // End of statement
    if (!inDoBlock && line.trim().endsWith(';')) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    }
  }
  
  return statements.filter(s => s && !s.startsWith('--'));
}

async function runSchema() {
  console.log('🚀 Running V2 schema on Supabase...\n');
  
  const statements = splitSqlStatements(schemaSql);
  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ') + (stmt.length > 80 ? '...' : '');
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });
      
      if (error) {
        // Try direct query via REST API for DDL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql: stmt })
        });
        
        if (!response.ok) {
          throw new Error(error.message);
        }
      }
      
      console.log(`✅ [${i + 1}/${statements.length}] ${preview}`);
      success++;
    } catch (err) {
      // For DDL, we need to use the SQL editor API or pg directly
      console.log(`⚠️  [${i + 1}/${statements.length}] ${preview}`);
      console.log(`   Note: ${err.message || 'DDL requires SQL Editor'}`);
      errors++;
    }
  }
  
  console.log(`\n📊 Results: ${success} succeeded, ${errors} need manual execution`);
  
  if (errors > 0) {
    console.log('\n⚠️  Some statements require manual execution in Supabase SQL Editor.');
    console.log('   Please copy the contents of supabase/schema-v2.sql and run it there.');
  }
}

runSchema().catch(console.error);
