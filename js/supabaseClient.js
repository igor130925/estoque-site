import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://rbkjiasrkbifhqsccrwv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia2ppYXNya2JpZmhxc2Njcnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTIxMjEsImV4cCI6MjA2NTc2ODEyMX0.zABQUHL22qmWiOpLuIJvHgpWM0ZRtlrNFLcT-oEFbVw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
