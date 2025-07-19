import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';

export function useUnifiedAuth() {
  // Check if we're in Clerk mode based on environment
  const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  if (hasValidClerkKey) {
    try {
      return useClerkAuth();
    } catch (error) {
      // Fallback to regular auth if Clerk fails
      console.warn('Clerk auth failed, falling back to regular auth:', error);
      return useContext(AuthContext)!;
    }
  }
  
  // Use regular JWT auth
  return useContext(AuthContext)!;
}