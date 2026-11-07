import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const auth = admin.auth();

export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
    };
  } catch (error) {
    console.error("Error verificando cookie de sesión:", error);
    return null;
  }
}

export async function createSessionCookie(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en milisegundos
  return await auth.createSessionCookie(idToken, { expiresIn });
}