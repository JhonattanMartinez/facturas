// Verificar que las reglas de Firestore están en "denegar todo"
// Ejecutar: npx tsx scripts/verificar-reglas.ts

import { getApps, initializeApp, cert } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const envVars = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
];

const missing = envVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error("Error: Variables de entorno faltantes:", missing.join(", "));
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function verificar() {
  try {
    // Intentar leer de clientes (debe fallar con 403 si las reglas están correctas)
    await db.collection("clientes").limit(1).get();
    console.error("❌ Error: Las reglas permiten lectura anónima a clientes");
    process.exit(1);
  } catch (e: any) {
    if (e.code === "permission-denied") {
      console.log("✅ Firestore: Reglas correctas - deniegan lectura");
    } else {
      console.error("❌ Error inesperado al probar reglas:", e.message);
      process.exit(1);
    }
  }

  try {
    // Intentar escribir (debe fallar con 403)
    await db.collection("clientes").doc("test").set({ test: true });
    console.error("❌ Error: las reglas permiten escritura");
    process.exit(1);
  } catch (e: any) {
    if (e.code === "permission-denied") {
      console.log("✅ Firestore: Reglas correctas - deniegan escritura");
    } else {
      console.error("❌ Error inesperado al probar escritura:", e.message);
      process.exit(1);
    }
  }

  console.log("\n✓ Verificación de reglas de Firestore completada");
}

verificar();