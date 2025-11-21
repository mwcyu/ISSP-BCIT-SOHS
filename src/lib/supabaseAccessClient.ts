// src/lib/supabaseAccessClient.ts
import { createClient } from "@supabase/supabase-js";

const ACCESS_SUPABASE_URL = "https://oasowwmnvlyrzawtjoql.supabase.co"; 
const ACCESS_SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc293d21udmx5cnphd3Rqb3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Nzg4NDQsImV4cCI6MjA3OTI1NDg0NH0.OevPrwNClhb8RP3fmIUKWCa4_AZZ4xfvolICLR2DbYs";

// ✅ MUST export with this exact name
export const supabaseAccess = createClient(
  ACCESS_SUPABASE_URL,
  ACCESS_SUPABASE_ANON
);
