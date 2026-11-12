import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Null until the two values are set in .env.local; the site then runs on its built-in defaults. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
