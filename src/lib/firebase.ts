// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebaseの設定
// 実際の値は環境変数から取得します
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase初期化
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firebase サービスの初期化
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);

// 開発環境の場合、エミュレーターに接続
if (process.env.NODE_ENV === 'development') {
  // ローカルエミュレーターがポート9099で動いていると仮定
  connectAuthEmulator(auth, 'http://localhost:9099');
  // ローカルエミュレーターがポート8080で動いていると仮定
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  // ローカルエミュレーターがポート5001で動いていると仮定
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;