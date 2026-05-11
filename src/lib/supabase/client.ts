import { createBrowserClient } from "@supabase/ssr";

// Browser client — used inside Client Components ("use client")
// Think of this like an axios instance configured for the browser
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
