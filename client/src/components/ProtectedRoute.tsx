import { useUnifiedAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Redirect, useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'freelancer' | 'contratante';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, isLoading, needsOnboarding } = useUnifiedAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to onboarding if user needs it and not already there
    if (!isLoading && user && needsOnboarding && window.location.pathname !== '/onboarding') {
      setLocation('/onboarding');
    }
  }, [user, isLoading, needsOnboarding, setLocation]);

  // Show loading state while checking authentication
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

  // Redirect to login if not authenticated
  if (!user) {
    const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    return <Redirect to={clerkKey ? "/clerk-login" : "/login"} />;
  }

  // If user needs onboarding, don't show protected content
  if (needsOnboarding && window.location.pathname !== '/onboarding') {
    return <Redirect to="/onboarding" />;
  }

  // Redirect if user type doesn't match required type
  if (requiredUserType && user.type !== requiredUserType) {
    return <Redirect to="/dashboard" />;
  }

  // User is authenticated and has correct permissions
  return <>{children}</>;
}
