import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server client — used inside Server Components and API routes
// Reads cookies from the request to know who's logged in
// Think of this like Express req.session but for Next.js
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies can't be set here, handled by middleware
          }
        },
      },
    }
  );
}
