const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qwhhzyvrwpxyviybrtku.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

