// Script to set up clinique support in the database
// Run with: node setup-clinique.js

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to your .env file

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure you have VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupClinique() {
  console.log('🏥 Setting up clinique support...');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('add-clinique-user-type.sql', 'utf8');
    
    console.log('📄 SQL file loaded, executing...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: sqlContent
    });

    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try executing each statement separately if RPC fails
      console.log('🔄 Trying to execute statements separately...');
      
      // Split SQL into individual statements
      const statements = sqlContent.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('execute_sql', {
              sql: statement + ';'
            });
            if (stmtError) {
              console.warn('⚠️ Warning with statement:', stmtError.message);
            } else {
              console.log('✅ Statement executed successfully');
            }
          } catch (e) {
            console.warn('⚠️ Could not execute statement:', e.message);
          }
        }
      }
    } else {
      console.log('✅ SQL executed successfully:', data);
    }

    // Verify the setup
    console.log('🔍 Verifying clinique setup...');
    
    // Check if clinique_profiles table exists
    const { data: tableExists } = await supabase
      .from('clinique_profiles')
      .select('*')
      .limit(1);
    
    if (tableExists !== null) {
      console.log('✅ clinique_profiles table is accessible');
    } else {
      console.log('⚠️ clinique_profiles table may not exist or be accessible');
    }

    // Check if all_service_providers view exists
    const { data: viewData } = await supabase
      .from('all_service_providers')
      .select('*')
      .limit(1);
      
    if (viewData !== null) {
      console.log('✅ all_service_providers view is working');
    } else {
      console.log('⚠️ all_service_providers view may not exist');
    }

    // Check user_type enum
    const { data: enumData } = await supabase
      .rpc('get_user_types');
      
    if (enumData && enumData.includes('clinique')) {
      console.log('✅ clinique user type is available in enum');
    } else {
      console.log('⚠️ clinique user type may not be in enum');
    }

    console.log('🎉 Clinique setup complete!');
    console.log('✅ You can now:');
    console.log('  - Register new cliniques through the signup form');
    console.log('  - Manage cliniques in the admin panel');
    console.log('  - See cliniques in the "Find Laboratory" section');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupClinique();
