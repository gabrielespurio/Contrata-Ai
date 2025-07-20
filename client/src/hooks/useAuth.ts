import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { SimpleClerkAuthContext } from '@/contexts/SimpleClerkAuthContext';

export function useUnifiedAuth() {
  // Check if we have Clerk keys available
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (clerkKey) {
    // Use Clerk authentication
    const clerkContext = useContext(SimpleClerkAuthContext);
    if (!clerkContext) {
      throw new Error('useUnifiedAuth must be used within SimpleClerkAuthProvider when using Clerk');
    }
    return clerkContext;
  } else {
    // Use JWT authentication
    const jwtContext = useContext(AuthContext);
    if (!jwtContext) {
      throw new Error('useUnifiedAuth must be used within AuthProvider when using JWT');
    }
    return {
      ...jwtContext,
      needsOnboarding: false // JWT system doesn't use onboarding
    };
  }
}

export function useSimpleClerkAuth() {
  const context = useContext(SimpleClerkAuthContext);
  if (!context) {
    throw new Error('useSimpleClerkAuth must be used within a SimpleClerkAuthProvider');
  }
  return context;
}