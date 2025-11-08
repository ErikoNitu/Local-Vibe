/// <reference types="vite/client" />

import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
	apiKey: "AIzaSyCSIykJehDTHt6fXPqXS6zYsI7L7-gFwDc",
	authDomain: "localvibe-81585.firebaseapp.com",
	projectId: "localvibe-81585",
	storageBucket: "localvibe-81585.firebasestorage.app",
	messagingSenderId: "975004166791",
	appId: "1:975004166791:web:96a5999664807daba02622",
	measurementId: "G-8WLRS9YDWV"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};

const analytics = getAnalytics(app);