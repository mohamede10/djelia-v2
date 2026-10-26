import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configuration Firebase
// Remplacez ces valeurs par celles fournies dans votre console Firebase (https://console.firebase.google.com)
// ou définissez-les dans un fichier .env / app.json (extra).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey || "AIzaSyDemoKeyForDjeliaCultureGuinea2025",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain || "djelia-guinea.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebaseProjectId || "djelia-guinea",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket || "djelia-guinea.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId || "123456789012",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId || "1:123456789012:web:abcdef123456789",
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("DemoKey");

// Initialisation de l'application Firebase (Singleton)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialisation de l'authentification avec persistance
let auth: Auth;
try {
  if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
      persistence: [browserLocalPersistence],
    });
  } else {
    // Sur React Native mobile, getAuth utilise la persistance interne ou celle configurée
    auth = getAuth(app);
  }
} catch {
  auth = getAuth(app);
}

// Initialisation de Firestore
const db: Firestore = getFirestore(app);

// Initialisation de Firebase Storage
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
