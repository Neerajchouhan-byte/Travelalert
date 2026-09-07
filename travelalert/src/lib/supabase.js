"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anon
    ? createBrowserClient(url, anon, {
        auth: {
          // Persist session in localStorage (default, but explicit for clarity)
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          // Auto-refresh tokens before they expire
          autoRefreshToken: true,
          // Detect session in URL (for OAuth callbacks)
          detectSessionInUrl: true,
          // Flow type for authentication
          flowType: "pkce",
        },
        cookies: {
          name: "travelradar-session",
          // Session cookie lasts 30 days
          maxAge: 60 * 60 * 24 * 30,
          // Use secure cookies in production
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      })
    : null;