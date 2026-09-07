import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Next.js 16 "proxy" convention (replaces middleware.js).
 * Guards /dashboard and /profile — redirects unauthenticated
 * visitors to /login, preserving the ?city param.
 * 
 * Also handles session refresh to keep users logged in across requests.
 */
export default async function proxy(request) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Get current user and refresh session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Refresh session to extend expiry - this keeps users logged in
  if (user) {
    await supabase.auth.refreshSession();
  }

  const path = request.nextUrl.pathname;
  const protectedPath = 
    path.startsWith("/dashboard") || 
    path.startsWith("/profile");

  if (protectedPath && !user) {
    const next = request.nextUrl.clone();
    next.pathname = "/login";
    const city = request.nextUrl.searchParams.get("city");
    if (city) next.searchParams.set("city", city);
    return NextResponse.redirect(next);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};