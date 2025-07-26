import { useContext } from 'react';
import { SimpleAuthContext } from '@/contexts/SimpleAuthContext';

export function useUnifiedAuth() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within SimpleAuthProvider');
  }
  return {
    ...context,
    isLoading: !context.isLoaded
  };
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}