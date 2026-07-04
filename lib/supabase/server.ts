import "server-only";

import { createClient } from "@supabase/supabase-js";

function getServerSupabaseEnv(): { serviceRoleKey: string; url: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing: string[] = [];

  if (!url) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase server environment variables: ${missing.join(", ")}`,
    );
  }

  return { serviceRoleKey: serviceRoleKey!, url: url! };
}

export function createServerSupabaseClient() {
  const { serviceRoleKey, url } = getServerSupabaseEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const supabaseAdmin = createServerSupabaseClient;
