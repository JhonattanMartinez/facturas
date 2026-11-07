import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/cliente";
import { signInWithEmailAndPassword } from "firebase/auth";
import { createSessionCookie } from "@/lib/auth/verificar";
import { estaAutorizado } from "@/lib/auth/sesion";

// POST /api/sesion - login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    // Verificar si el usuario está autorizado
    if (!estaAutorizado(email)) {
      return NextResponse.json({ error: "Este correo no está autorizado" }, { status: 403 });
    }

    // Autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Crear cookie de sesión
    const sessionCookie = await createSessionCookie(idToken);

    // Configurar cookie
    const cookieStore = await cookies();
    cookieStore.set("sesion", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5, // 5 días
    });

    return NextResponse.json({ success: true, email });
  } catch (error: any) {
    console.error("Error en login:", error);
    const status = error.code === "auth/user-not-found" || error.code === "auth/wrong-password" 
      ? 401 
      : 500;
    return NextResponse.json({ error: error.message || "Error de autenticación" }, { status });
  }
}

// DELETE /api/sesion - logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sesion");
  return NextResponse.json({ success: true });
}

// GET /api/sesion - obtener usuario actual
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sesion")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { verifySessionCookie } = await import("@/lib/auth/verificar");
  const decoded = await verifySessionCookie(sessionCookie);

  if (!decoded || !decoded.email) {
    cookieStore.delete("sesion");
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  return NextResponse.json({ email: decoded.email, uid: decoded.uid });
}