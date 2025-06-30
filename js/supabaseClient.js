import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://aws-0-sa-east-1.pooler.supabase.com';
const SUPABASE_KEY = '5jFtQegHDa8oatT3'; // sua chave ANON do Supabase

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
