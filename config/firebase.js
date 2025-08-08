   const admin = require('firebase-admin');

   // For production (Render), use environment variables
   if (process.env.NODE_ENV === 'production') {
     // Initialize Firebase Admin with environment variables
     admin.initializeApp({
       credential: admin.credential.cert({
         type: "service_account",
         project_id: "timehavenapp",
         private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
         private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
         client_email: process.env.FIREBASE_CLIENT_EMAIL,
         client_id: process.env.FIREBASE_CLIENT_ID,
         auth_uri: "https://accounts.google.com/o/oauth2/auth",
         token_uri: "https://oauth2.googleapis.com/token",
         auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
         client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
       })
     });
   } else {
     // For development, use the service account key file
     try {
       const serviceAccount = require('../firebase-key.json');
       admin.initializeApp({
         credential: admin.credential.cert(serviceAccount)
       });
     } catch (error) {
       console.log('Firebase key file not found, using environment variables');
       // Fallback to environment variables
       admin.initializeApp({
         credential: admin.credential.cert({
           type: "service_account",
           project_id: "timehavenapp",
           private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
           private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
           client_email: process.env.FIREBASE_CLIENT_EMAIL,
           client_id: process.env.FIREBASE_CLIENT_ID,
           auth_uri: "https://accounts.google.com/o/oauth2/auth",
           token_uri: "https://oauth2.googleapis.com/token",
           auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
           client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
         })
       });
     }
   }

   const db = admin.firestore();
   module.exports = { admin, db };