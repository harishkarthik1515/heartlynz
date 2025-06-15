import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDQ3tPot4Z_j1wCInkwrlzNZoLIOrkMRjU",
  authDomain: "designhub-150ed.firebaseapp.com",
  projectId: "designhub-150ed",
  storageBucket: "designhub-150ed.firebasestorage.app",
  messagingSenderId: "1010677695717",
  appId: "1:1010677695717:web:e55fa3799dc1db7dac800c",
  measurementId: "G-66WSXDRZTT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;