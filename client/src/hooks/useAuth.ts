import { useSimpleClerkAuth } from '@/contexts/SimpleClerkAuthContext';

export function useUnifiedAuth() {
  // Always use simple Clerk authentication
  return useSimpleClerkAuth();
}