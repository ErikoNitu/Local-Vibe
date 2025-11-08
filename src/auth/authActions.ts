import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

export const registerWithEmail = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

export const signInWithGoogle = async (): Promise<void> => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};