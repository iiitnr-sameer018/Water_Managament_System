import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqvnwvtwqqvgaipaeppu.supabase.co';
const supabaseKey = 'sb_publishable_gSPFmvDojUaLMhkizDICSQ_vdFWjvGY';

export const supabase = createClient(supabaseUrl, supabaseKey);
