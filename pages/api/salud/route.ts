import { NextResponse } from "next/server";

const envVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_BUCKET_FACTURAS",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
];

const missing = envVars.filter((v) => !process.env[v]);

let tesseractDataOk = false;
try {
  const path = require("path");
  const fs = require("fs");
  const langPath = path.join(
    process.cwd(),
    "node_modules/@tesseract.js-data/spa/4.0.0_best_int"
  );
  tesseractDataOk = fs.existsSync(langPath);
} catch {
  tesseractDataOk = false;
}

let sharpOk = false;
try {
  require("sharp");
  sharpOk = true;
} catch {
  sharpOk = false;
}

export default async function handler() {
  return NextResponse.json({
    ok: missing.length === 0 && tesseractDataOk && sharpOk,
    env: {
      configured: envVars.length - missing.length,
      total: envVars.length,
      missing: missing.length > 0 ? missing : undefined,
    },
    tesseract: {
      dataFilesPresent: tesseractDataOk,
    },
    sharp: {
      loads: sharpOk,
    },
  });
}