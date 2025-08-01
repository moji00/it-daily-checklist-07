// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://coklbcxfarsipftfwcwu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNva2xiY3hmYXJzaXBmdGZ3Y3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjcxMDMsImV4cCI6MjA2OTM0MzEwM30.Oxs1k6-lxOQP5OGp_HOdwM4W7MLjBarH3M6Mv8-r6eI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});