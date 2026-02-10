import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseClient';
import type { User } from '@repo/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as Record<string, unknown>;
        setUser({
          id: (data.uid as string) || (data.id as string),
          email: (data.email as string) ?? '',
          displayName: (data.displayName as string) ?? undefined,
          photoURL: (data.photoURL as string) ?? undefined,
          createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
        } as User);
      } else {
        const now = new Date();
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Anonymous',
          photoURL: firebaseUser.photoURL ?? undefined,
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          photoURL: newUser.photoURL ?? null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setUser(newUser);
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) await syncUserData(firebaseUser);
      else setUser(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName,
          photoURL: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
