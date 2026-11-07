import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/auth/verificar";

// Redirige a /login si no hay cookie de sesión válida
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("sesion")?.value;

  const url = request.nextUrl;

  // Rutas que no requieren autenticación
  const sinProteccion = [
    "/login",
    "/api/sesion",
    "/_next",
    "/_static",
    "/favicon.ico",
  ];

  // Si está en una ruta sin protección, continuar
  if (sinProteccion.some((r) => url.pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión
  if (!sessionCookie) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const decoded = await verifySessionCookie(sessionCookie);
    if (!decoded) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Filter all paths that require authentication.
     * Exclude static files, favicon, login and API routes.
     */
    "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
  ],
};