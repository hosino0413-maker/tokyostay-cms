import { createClient } from "@supabase/supabase-js";

function getBrowserSupabaseEnv(): { publishableKey: string; url: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase browser environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { publishableKey: publishableKey!, url: url! };
}

export function createBrowserSupabaseClient() {
  const { publishableKey, url } = getBrowserSupabaseEnv();
  return createClient(url, publishableKey);
}

export const supabaseClient = createBrowserSupabaseClient;
