import { useUnifiedAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'freelancer' | 'contratante';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, isLoading } = useUnifiedAuth();
  const [, setLocation] = useLocation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    
    if (!isLoading && !user) {
      const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
        !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
        import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');
      
      const loginPath = hasValidClerkKey ? '/clerk-login' : '/login';
      hasRedirectedRef.current = true;
      setLocation(loginPath);
    } else if (user && requiredUserType && user.type !== requiredUserType) {
      hasRedirectedRef.current = true;
      setLocation('/dashboard');
    }
  }, [user, isLoading, requiredUserType, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredUserType && user.type !== requiredUserType) {
    return null;
  }

  return <>{children}</>;
}
