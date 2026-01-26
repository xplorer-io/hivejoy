'use client';

import { 
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import type { User } from '@/types';

// Map Firebase user to your User type
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  // Note: customClaims requires Firebase Admin SDK to set
  // For now, default to 'consumer' role
  const role: User['role'] = 'consumer';
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || undefined,
    role,
    status: 'active',
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    updatedAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
  };
}

export async function sendOTP(emailOrPhone: string): Promise<{ success: boolean; message: string }> {
  try {
    const isEmail = emailOrPhone.includes('@');
    
    if (isEmail) {
      // Store email for verification page
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', emailOrPhone);
      }
      
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify`,
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, emailOrPhone, actionCodeSettings);
      
      return {
        success: true,
        message: 'Sign-in link sent to your email',
      };
    } else {
      // Phone authentication would use different Firebase method
      return {
        success: false,
        message: 'Phone authentication not implemented yet',
      };
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    let userMessage = err.message || 'Failed to send sign-in link';
    
    if (err.code === 'auth/invalid-email') {
      userMessage = 'Invalid email address';
    } else if (err.code === 'auth/too-many-requests') {
      userMessage = 'Too many requests. Please wait a few minutes before trying again.';
    } else if (err.code === 'auth/operation-not-allowed') {
      userMessage = 'Email link authentication is not enabled. Please enable "Email link (passwordless sign-in)" in Firebase Console → Authentication → Sign-in method.';
    }
    
    return {
      success: false,
      message: userMessage,
    };
  }
}

export async function verifyOTP(
  emailOrPhone: string,
  _otp: string // Unused for Firebase email links, but kept for API compatibility
): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    // Firebase email links contain the full URL with the code
    // Check if we're on the verification page
    if (typeof window === 'undefined') {
      return {
        success: false,
        message: 'Verification must be done in browser',
      };
    }

    const emailLink = window.location.href;
    
    // Verify the email link
    const result = await signInWithEmailLink(auth, emailOrPhone, emailLink);
    
    if (result.user) {
      const user = mapFirebaseUser(result.user);
      return {
        success: true,
        user,
        message: 'Verified successfully',
      };
    }
    
    return {
      success: false,
      message: 'Verification failed',
    };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // Handle specific Firebase errors
    if (err.code === 'auth/invalid-action-code') {
      return {
        success: false,
        message: 'This link has expired or is invalid. Please request a new one.',
      };
    }
    return {
      success: false,
      message: err.message || 'Failed to verify',
    };
  }
}

export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to sign in with Google' };
  }
}

export async function signInWithGitHub(): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = new GithubAuthProvider();
    await signInWithPopup(auth, provider);
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to sign in with GitHub' };
  }
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribe();
      if (firebaseUser && firebaseUser.uid === userId) {
        resolve(mapFirebaseUser(firebaseUser));
      } else {
        resolve(null);
      }
    });
  });
}

export async function signOut() {
  await firebaseSignOut(auth);
  return { success: true };
}