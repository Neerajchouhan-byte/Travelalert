import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Next.js 16 "proxy" convention (replaces middleware.js).
 *
 * Guards:
 *   - /dashboard and /profile require auth → redirect to /login if missing.
 *   - / requires an explicit opt-in (?home=1) for signed-in users; otherwise
 *     they are redirected to /dashboard so repeat visits skip the landing page.
 *     The dashboard logo links to /?home=1 to opt back in.
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

  // Signed-in users land on the dashboard on any fresh visit to "/", unless
  // they explicitly opted into the landing page via ?home=1 (the dashboard
  // logo links with that flag).
  if (path === "/" && user && !request.nextUrl.searchParams.has("home")) {
    const next = request.nextUrl.clone();
    next.pathname = "/dashboard";
    next.search = "";
    return NextResponse.redirect(next);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap file)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};