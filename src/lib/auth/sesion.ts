import { cookies } from "next/headers";
import { verifySessionCookie } from "./verificar";
import { auth } from "@/lib/firebase/cliente";
import { signInWithEmailAndPassword } from "firebase/auth";

// Usuarios permitidos (para autorización)
// Si está vacío, se permite a todos los usuarios registrados en Firebase Auth
export const USUARIOS_PERMITIDOS = (process.env.USUARIOS_PERMITIDOS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Crear cookie de sesión (llamado desde API)
export async function crearSesion(email: string) {
  // Esta función se usará en el endpoint /api/sesion
  // La cookie se crea con verifySessionCookie del admin
}

// Verificar si un correo está autorizado
export function estaAutorizado(email: string): boolean {
  if (USUARIOS_PERMITIDOS.length === 0) {
    return true; // Permitir a todos si la lista está vacía
  }
  return USUARIOS_PERMITIDOS.includes(email);
}

// Hook para usar el usuario actual (cliente)
export async function usarUsuario(): Promise<{ uid: string; email: string } | Response> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sesion")?.value;

  if (!sessionCookie) {
    return new Response(JSON.stringify({ error: "No hay sesión" }), { status: 401 });
  }

  try {
    const decoded = await verifySessionCookie(sessionCookie);
    if (!decoded || !decoded.email) {
      return new Response(JSON.stringify({ error: "Sesión inválida" }), { status: 401 });
    }

    // Verificar autorización
    if (!estaAutorizado(decoded.email)) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 403 });
    }

    return { uid: decoded.uid, email: decoded.email };
  } catch (error) {
    return new Response(JSON.stringify({ error: "Sesión expirada" }), { status: 401 });
  }
}