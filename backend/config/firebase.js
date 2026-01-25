import admin from "firebase-admin";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();
const require = createRequire(import.meta.url);

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production / Vercel: Read from Env Var
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Local Development: Read from file
    try {
        serviceAccount = require("../firebase-key.json");
    } catch (e) {
        console.warn("firebase-key.json not found. Expecting FIREBASE_SERVICE_ACCOUNT env var.");
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // Fallback if no creds (might fail)
    if (admin.apps.length === 0) {
        admin.initializeApp(); 
    }
}

const db = admin.firestore();

export { admin, db };
