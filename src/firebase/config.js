import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBscGGCflREDZxCTb_wB4oNzog0BLPItxg",
  authDomain: "bmsys-bd9a0.firebaseapp.com",
  projectId: "bmsys-bd9a0",
  storageBucket: "bmsys-bd9a0.firebasestorage.app",
  messagingSenderId: "777990216211",
  appId: "1:777990216211:web:1fbd88d92729431de5fde6",
  measurementId: "G-Y9JHPKT1R7"
};

export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };