"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anon
    ? createBrowserClient(url, anon, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        cookieOptions: {
          name: "travelradar-session",
          maxAge: 60 * 60 * 24 * 30,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      })
    : null;