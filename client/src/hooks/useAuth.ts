import { useContext } from 'react';
import { SimpleClerkAuthContext } from '@/contexts/SimpleClerkAuthContext';

export function useUnifiedAuth() {
  // Use Clerk authentication only
  const clerkContext = useContext(SimpleClerkAuthContext);
  if (!clerkContext) {
    throw new Error('useUnifiedAuth must be used within SimpleClerkAuthProvider');
  }
  return clerkContext;
}

export function useSimpleClerkAuth() {
  const context = useContext(SimpleClerkAuthContext);
  if (!context) {
    throw new Error('useSimpleClerkAuth must be used within a SimpleClerkAuthProvider');
  }
  return context;
}