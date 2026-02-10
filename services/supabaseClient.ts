
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbaizxotkqoqmyhvnyud.supabase.co';
const supabaseKey = 'sb_publishable_iyzT2dXZALe4ndqW6CXtyA_pzX9wu3C';

export const supabase = createClient(supabaseUrl, supabaseKey);
