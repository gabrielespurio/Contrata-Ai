import { useClerkAuth } from '@/contexts/ClerkAuthContext';

export function useUnifiedAuth() {
  // For now, we're always using Clerk since we have valid keys configured
  // The ClerkAuthProvider is the current provider wrapping the app
  return useClerkAuth();
}