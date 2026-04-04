import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth Proxy — Schuetzt Dashboard-Routen (Next.js 16 proxy convention)
 *
 * Oeffentliche Routen: /, /api/auth/*, statische Assets
 * Geschuetzte Routen: /dashboard, /quizzes, /users, /departments, etc.
 *
 * Prueft ob eine Session existiert (via Cookie).
 * Setzt x-pathname Header fuer RBAC-Pruefung im Dashboard-Layout.
 */

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/play",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Statische Assets und API-Auth durchlassen
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Oeffentliche Pfade durchlassen
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Session-Cookie pruefen
  const sessionToken = request.cookies.get("better-auth.session_token");

  if (!sessionToken) {
    // Kein Session → Redirect zu Login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // x-pathname Header setzen — Layout liest diesen fuer RBAC-Pruefung
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // Landing Page + Public Pages: bfcache verhindern damit ThemeProvider
  // beim Browser-Zurueck korrekt initialisiert wird (JS muss laufen)
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
