"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Reads and validates the Supabase browser config.
 *
 * A malformed value here is the classic cause of auth requests hitting
 * "<current-origin>/auth/v1/..." instead of the real project URL — which
 * then surfaces as a Next.js 404 HTML page and a JSON.parse
 * "Unexpected token '<'" error in the login form. That failure is silent
 * with a naive `url && anon` check (a protocol-less or wrong-host value is
 * truthy), so this function rejects any value that is not a real
 * https://<project-ref>.supabase.co URL.
 */
function resolveSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Neither set: the app is intentionally running without auth (e.g. a
  // marketing-only build). Every consumer null-checks `supabase` and shows
  // "Authentication is not configured." Do NOT throw — that is a valid state.
  if (!rawUrl && !anon) {
    return { url: null, anon: null };
  }

  // Exactly one set: a misconfiguration that would otherwise fail at the
  // first auth call. Fail here, loudly, with an actionable message.
  if (!rawUrl || !anon) {
    const missing = !rawUrl
      ? "NEXT_PUBLIC_SUPABASE_URL"
      : "NEXT_PUBLIC_SUPABASE_ANON_KEY";
    throw new Error(
      `[supabase] Partial configuration: ${missing} is not set. ` +
        `Both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ` +
        `must be set together. In Vercel: Project -> Settings -> ` +
        `Environment Variables, set both for the Production environment, ` +
        `then redeploy (NEXT_PUBLIC_* is inlined at build time, so an ` +
        `existing build cache will not pick up the change).`
    );
  }

  const trimmed = String(rawUrl).trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `[supabase] NEXT_PUBLIC_SUPABASE_URL is not an absolute URL: ` +
        `"${trimmed}". Expected https://<project-ref>.supabase.co. ` +
        `A value missing the https:// prefix is resolved as a relative path, ` +
        `so auth requests hit this site's own origin and Next.js returns its ` +
        `404 HTML page instead of Supabase's JSON.`
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `[supabase] NEXT_PUBLIC_SUPABASE_URL must use https://, ` +
        `got "${parsed.protocol}//". Expected https://<project-ref>.supabase.co.`
    );
  }

  if (!/\.supabase\.(co|in)$/i.test(parsed.hostname)) {
    throw new Error(
      `[supabase] NEXT_PUBLIC_SUPABASE_URL host "${parsed.hostname}" is not ` +
        `a Supabase project (expected *.supabase.co). The most common cause ` +
        `is pasting NEXT_PUBLIC_SITE_URL into NEXT_PUBLIC_SUPABASE_URL. ` +
        `If you run a self-hosted Supabase, delete this hostname check in ` +
        `src/lib/supabase.js.`
    );
  }

  // Normalize to the bare origin so createBrowserClient builds
  // "https://ref.supabase.co/auth/v1/..." and never
  // "https://ref.supabase.co//auth/v1/...".
  return { url: parsed.origin, anon };
}

const { url, anon } = resolveSupabaseConfig();

export const supabase =
  url && anon
    ? createBrowserClient(url, anon, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      })
    : null;