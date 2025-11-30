import { createClient } from "@supabase/supabase-js";

// ⚙️ Your Supabase project credentials
const supabaseUrl = "https://llmrjjoemydhidsedcgj.supabase.co";
const supabaseAnonKey = "sb_publishable_Ex1Ck70KLOPvl0g2jAV7DA_A5bTRV-7";

// ✅ Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);