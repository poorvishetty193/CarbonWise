import admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK on first call (lazy).
 * Using a getter pattern prevents module-load-time failures during
 * `next build` when environment variables contain placeholder values.
 */
function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Get Admin Db function.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function getAdminDb(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

/**
 * Get Admin Auth function.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}
