import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA8xWxJbEGDfcy1sGtr7m0tnij4wXsT7KA",
    authDomain: "civiceye-india-prod.firebaseapp.com",
    projectId: "civiceye-india-prod",
    storageBucket: "civiceye-india-prod.firebasestorage.app",
    messagingSenderId: "524117875495",
    appId: "1:524117875495:web:38b97d7ecc243ef314a702"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
